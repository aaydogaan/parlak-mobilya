import { createServerFn } from "@tanstack/react-start";
import { randomBytes } from "node:crypto";
import { z } from "zod";
import galeriImagesJson from "@/data/galeri_images.json";
import { adminAuthMiddleware } from "./security/auth";
import { logAuditEvent } from "./security/audit";
import { sanitizeFileName } from "./security/sanitize";

export function getR2Config() {
  const accountId = (process.env.R2_ACCOUNT_ID || "").trim();
  const endpoint = (
    process.env.R2_ENDPOINT ||
    (accountId ? `https://${accountId}.r2.cloudflarestorage.com` : "")
  ).trim();
  const accessKeyId = (process.env.R2_ACCESS_KEY_ID || "").trim();
  const secretAccessKey = (process.env.R2_SECRET_ACCESS_KEY || "").trim();
  const bucketName = (process.env.R2_BUCKET_NAME || "parlak-mobilya-media").trim();
  const cdnUrl = (process.env.R2_CDN_URL || "https://cdn.parlakmobilyadekorasyon.com")
    .trim()
    .replace(/\/+$/, "");

  return { accountId, endpoint, accessKeyId, secretAccessKey, bucketName, cdnUrl };
}

// Server-side in-memory cache as reliable fallback if DB is temporarily connecting
let memoryCache: string[] | null = null;

async function getR2Client() {
  const { endpoint, accessKeyId, secretAccessKey } = getR2Config();

  if (!endpoint || !accessKeyId || !secretAccessKey) {
    throw new Error(
      "Cloudflare R2 yapılandırma hatası: Coolify veya sunucu ortam değişkenlerinde R2_ACCESS_KEY_ID, R2_SECRET_ACCESS_KEY ve R2_ENDPOINT (veya R2_ACCOUNT_ID) tanımlanmalıdır."
    );
  }

  const { S3Client } = await import("@aws-sdk/client-s3");
  return new S3Client({
    region: "auto",
    endpoint: endpoint,
    credentials: {
      accessKeyId: accessKeyId,
      secretAccessKey: secretAccessKey,
    },
  });
}

// Allowed image MIME types and file extensions
const ALLOWED_MIME_TYPES = new Set([
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/avif",
]);

/**
 * Verify Magic Bytes / File Signature to prevent extension spoofing (e.g. php/html disguised as jpg).
 */
function verifyImageSignature(buffer: Buffer, expectedMime?: string): boolean {
  if (buffer.length < 12) return false;

  // JPEG: FF D8 FF
  const isJpeg = buffer[0] === 0xff && buffer[1] === 0xd8 && buffer[2] === 0xff;
  if (isJpeg) return true;

  // PNG: 89 50 4E 47 0D 0A 1A 0A
  const isPng =
    buffer[0] === 0x89 &&
    buffer[1] === 0x50 &&
    buffer[2] === 0x4e &&
    buffer[3] === 0x47 &&
    buffer[4] === 0x0d &&
    buffer[5] === 0x0a &&
    buffer[6] === 0x1a &&
    buffer[7] === 0x0a;
  if (isPng) return true;

  // WebP: RIFF .... WEBP
  const isWebp =
    buffer[0] === 0x52 && // R
    buffer[1] === 0x49 && // I
    buffer[2] === 0x46 && // F
    buffer[3] === 0x46 && // F
    buffer[8] === 0x57 && // W
    buffer[9] === 0x45 && // E
    buffer[10] === 0x42 && // B
    buffer[11] === 0x50; // P
  if (isWebp) return true;

  // AVIF: ....ftypavif or ....ftypavis
  const ftypIndex = buffer.indexOf("ftyp");
  if (ftypIndex >= 4 && ftypIndex <= 8) {
    const brand = buffer.slice(ftypIndex + 4, ftypIndex + 8).toString("ascii");
    if (brand === "avif" || brand === "avis" || brand === "mif1") {
      return true;
    }
  }

  return false;
}

// Fetch all gallery images from Database (Public GET)
export const getGaleriImagesServerFn = createServerFn({ method: "GET" }).handler(
  async (): Promise<string[]> => {
    try {
      const { getSql } = await import("@/lib/db");
      const sql = await getSql();

      // Ensure table exists
      await sql`CREATE TABLE IF NOT EXISTS galeri_images (
        id SERIAL PRIMARY KEY,
        url TEXT NOT NULL UNIQUE,
        created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
        display_order INT NOT NULL DEFAULT 0
      )`;

      const rows = await sql<{ url: string }>`
        SELECT url FROM galeri_images ORDER BY id DESC
      `;

      if (rows && rows.length > 0) {
        memoryCache = rows.map((r) => r.url);
        return memoryCache;
      }

      // Seed initial images from galeri_images.json if table is empty
      const initialList = (galeriImagesJson as string[]).slice(0, 80);
      for (const url of [...initialList].reverse()) {
        try {
          await sql`INSERT INTO galeri_images (url) VALUES (${url}) ON CONFLICT DO NOTHING`;
        } catch {
          // Ignore individual duplicate errors during seeding
        }
      }

      memoryCache = initialList;
      return initialList;
    } catch (err) {
      console.warn("[galeri] DB read fallback to memory/json:", err);
      if (memoryCache && memoryCache.length > 0) {
        return memoryCache;
      }
      return (galeriImagesJson as string[]).slice(0, 80);
    }
  }
);

// Delete an image from Gallery (Database + Cloudflare R2 cleanup) - PROTECTED WITH ADMIN AUTH
export const deleteGaleriImageServerFn = createServerFn({ method: "POST" })
  .middleware([adminAuthMiddleware])
  .validator((d: { url: string }) => z.object({ url: z.string().min(1).max(500) }).parse(d))
  .handler(async ({ data, context }): Promise<{ success: boolean; images: string[] }> => {
    const { url } = data;
    const { adminUser } = context;
    const { getRequest } = await import("@tanstack/react-start/server");
    const req = getRequest();

    try {
      const { getSql } = await import("@/lib/db");
      const sql = await getSql();

      await sql`DELETE FROM galeri_images WHERE url = ${url}`;

      await logAuditEvent({
        userId: adminUser.id,
        action: "GALLERY_IMAGE_DELETED",
        entityType: "galeri_image",
        details: { url },
        req,
      });
    } catch (err) {
      console.warn("[galeri] DB delete error:", err);
    }

    // Try deleting from Cloudflare R2 if it's our CDN url
    try {
      const { bucketName, cdnUrl } = getR2Config();
      if (url.startsWith(cdnUrl)) {
        const key = url.replace(`${cdnUrl}/`, "").replace(/^\/+/, "");
        if (key && !key.includes("..")) {
          const { DeleteObjectCommand } = await import("@aws-sdk/client-s3");
          const client = await getR2Client();
          await client.send(
            new DeleteObjectCommand({
              Bucket: bucketName,
              Key: key,
            })
          );
        }
      }
    } catch (r2Err) {
      console.warn("[galeri] R2 delete object notice:", r2Err);
    }

    if (memoryCache) {
      memoryCache = memoryCache.filter((u) => u !== url);
    }

    const updated = await getGaleriImagesServerFn();
    return { success: true, images: updated };
  });

// Delete multiple images from Gallery (Bulk delete) - PROTECTED WITH ADMIN AUTH
export const deleteGaleriImagesBulkServerFn = createServerFn({ method: "POST" })
  .middleware([adminAuthMiddleware])
  .validator((d: { urls: string[] }) =>
    z.object({ urls: z.array(z.string().min(1).max(500)).max(100) }).parse(d),
  )
  .handler(async ({ data, context }): Promise<{ success: boolean; images: string[] }> => {
    const { urls } = data;
    const { adminUser } = context;
    const { getRequest } = await import("@tanstack/react-start/server");
    const req = getRequest();

    if (!urls || urls.length === 0) return { success: true, images: memoryCache || [] };

    try {
      const { getSql } = await import("@/lib/db");
      const sql = await getSql();

      for (const url of urls) {
        await sql`DELETE FROM galeri_images WHERE url = ${url}`;
      }

      await logAuditEvent({
        userId: adminUser.id,
        action: "GALLERY_IMAGES_BULK_DELETED",
        entityType: "galeri_image",
        details: { count: urls.length },
        req,
      });
    } catch (err) {
      console.warn("[galeri] DB bulk delete error:", err);
    }

    // Try deleting from Cloudflare R2
    try {
      const { bucketName, cdnUrl } = getR2Config();
      const { DeleteObjectsCommand } = await import("@aws-sdk/client-s3");
      const objectsToDelete = urls
        .filter((url) => url.startsWith(cdnUrl))
        .map((url) => ({ Key: url.replace(`${cdnUrl}/`, "").replace(/^\/+/, "") }))
        .filter((item) => !!item.Key && !item.Key.includes(".."));

      if (objectsToDelete.length > 0) {
        const client = await getR2Client();
        await client.send(
          new DeleteObjectsCommand({
            Bucket: bucketName,
            Delete: {
              Objects: objectsToDelete,
            },
          })
        );
      }
    } catch (r2Err) {
      console.warn("[galeri] R2 bulk delete objects notice:", r2Err);
    }

    if (memoryCache) {
      const urlSet = new Set(urls);
      memoryCache = memoryCache.filter((u) => !urlSet.has(u));
    }

    const updated = await getGaleriImagesServerFn();
    return { success: true, images: updated };
  });

// Add an external image URL to Gallery - PROTECTED WITH ADMIN AUTH
export const addGaleriImageServerFn = createServerFn({ method: "POST" })
  .middleware([adminAuthMiddleware])
  .validator((d: { url: string }) => z.object({ url: z.string().url().max(500) }).parse(d))
  .handler(async ({ data, context }): Promise<{ success: boolean; images: string[] }> => {
    const { url } = data;
    const { adminUser } = context;
    const { getRequest } = await import("@tanstack/react-start/server");
    const req = getRequest();

    try {
      const { getSql } = await import("@/lib/db");
      const sql = await getSql();

      await sql`INSERT INTO galeri_images (url) VALUES (${url}) ON CONFLICT DO NOTHING`;

      await logAuditEvent({
        userId: adminUser.id,
        action: "GALLERY_IMAGE_UPLOADED",
        entityType: "galeri_image",
        details: { url, method: "external_url" },
        req,
      });
    } catch (err) {
      console.warn("[galeri] DB insert error:", err);
    }

    if (memoryCache) {
      memoryCache = [url, ...memoryCache];
    }

    const updated = await getGaleriImagesServerFn();
    return { success: true, images: updated };
  });

// Direct PC Upload to Cloudflare R2 - PROTECTED WITH ADMIN AUTH + MAGIC BYTES & SIZE VALIDATION
export const uploadImageToR2ServerFn = createServerFn({ method: "POST" })
  .middleware([adminAuthMiddleware])
  .validator((d: unknown) =>
    z
      .object({
        fileName: z.string().min(1).max(200),
        base64Data: z.string().min(10),
        contentType: z.string().optional(),
        addToGallery: z.boolean().optional(),
      })
      .parse(d),
  )
  .handler(
    async ({
      data,
      context,
    }): Promise<{ success: boolean; url: string; images: string[] }> => {
      const { fileName, base64Data, contentType = "image/webp", addToGallery = true } = data;
      const { adminUser } = context;
      const { getRequest } = await import("@tanstack/react-start/server");
      const req = getRequest();

      // 1. Strict Content-Type Validation
      const mimeType = contentType.toLowerCase().trim();
      if (!ALLOWED_MIME_TYPES.has(mimeType)) {
        throw new Error("Yalnızca geçerli resim dosyaları yüklenebilir (JPEG, PNG, WebP, AVIF).");
      }

      // 2. Maximum Payload Size Check (Max 10MB raw image)
      const buffer = Buffer.from(base64Data, "base64");
      const MAX_SIZE_BYTES = 10 * 1024 * 1024; // 10MB
      if (buffer.length > MAX_SIZE_BYTES) {
        throw new Error("Yüklenen dosya boyutu 10MB sınırını aşıyor.");
      }

      // 3. Deep Magic Bytes / Signature Verification
      const isValidImage = verifyImageSignature(buffer, mimeType);
      if (!isValidImage) {
        throw new Error("Geçersiz dosya imzası: Yüklenen dosya gerçek bir resim dosyası değil.");
      }

      // 4. Secure Filename and Cryptographic Object Key (Prevent Path Traversal)
      const cleanFileName = sanitizeFileName(fileName);
      const yearMonth = new Date().toISOString().slice(0, 7).replace("-", "/"); // e.g. 2026/10
      const randomSuffix = randomBytes(8).toString("hex");
      const key = `${yearMonth}/${Date.now()}-${randomSuffix}-${cleanFileName}`;

      const { bucketName, cdnUrl } = getR2Config();
      const { PutObjectCommand } = await import("@aws-sdk/client-s3");
      const client = await getR2Client();

      await client.send(
        new PutObjectCommand({
          Bucket: bucketName,
          Key: key,
          Body: buffer,
          ContentType: mimeType,
          CacheControl: "public, max-age=31536000, immutable",
        })
      );

      const publicUrl = `${cdnUrl}/${key}`;

      // Insert into Gallery table if requested
      if (addToGallery) {
        try {
          const { getSql } = await import("@/lib/db");
          const sql = await getSql();

          await sql`INSERT INTO galeri_images (url) VALUES (${publicUrl}) ON CONFLICT DO NOTHING`;
        } catch (dbErr) {
          console.warn("[galeri] DB insert after R2 upload:", dbErr);
        }

        if (memoryCache) {
          memoryCache = [publicUrl, ...memoryCache];
        }
      }

      await logAuditEvent({
        userId: adminUser.id,
        action: "GALLERY_IMAGE_UPLOADED",
        entityType: "r2_object",
        details: { key, sizeBytes: buffer.length, mimeType, addToGallery },
        req,
      });

      const updatedImages = addToGallery ? await getGaleriImagesServerFn() : (memoryCache || []);
      return { success: true, url: publicUrl, images: updatedImages };
    }
  );
