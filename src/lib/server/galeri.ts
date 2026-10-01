import { createServerFn } from "@tanstack/react-start";
import galeriImagesJson from "@/data/galeri_images.json";

const BUCKET_NAME = process.env.R2_BUCKET_NAME || "parlak-mobilya-media";
const ENDPOINT = process.env.R2_ENDPOINT || "https://698720c00ecdd44bb653bf575a74c45e.r2.cloudflarestorage.com";
const ACCESS_KEY_ID = process.env.R2_ACCESS_KEY_ID || "52f4b952ddd4258d9450a14d87f467b0";
const SECRET_ACCESS_KEY = process.env.R2_SECRET_ACCESS_KEY || "5322178d8f9819a9df5c2197b8ae9eb13c8704fb1959803603241fc2d80ebeec";
const CDN_URL = process.env.R2_CDN_URL || "https://cdn.parlakmobilyadekorasyon.com";

// Server-side in-memory cache as reliable fallback if DB is temporarily connecting
let memoryCache: string[] | null = null;

async function getR2Client() {
  const { S3Client } = await import("@aws-sdk/client-s3");
  return new S3Client({
    region: "auto",
    endpoint: ENDPOINT,
    credentials: {
      accessKeyId: ACCESS_KEY_ID,
      secretAccessKey: SECRET_ACCESS_KEY,
    },
  });
}

// Fetch all gallery images from Database (with fallback)
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

// Delete an image from Gallery (Database + Cloudflare R2 cleanup)
export const deleteGaleriImageServerFn = createServerFn({ method: "POST" })
  .validator((d: { url: string }) => d)
  .handler(async ({ data }): Promise<{ success: boolean; images: string[] }> => {
    const { url } = data;
    if (!url) return { success: false, images: memoryCache || [] };

    try {
      const { getSql } = await import("@/lib/db");
      const sql = await getSql();

      await sql`DELETE FROM galeri_images WHERE url = ${url}`;
    } catch (err) {
      console.warn("[galeri] DB delete error:", err);
    }

    // Try deleting from Cloudflare R2 if it's our CDN url
    try {
      if (url.startsWith(CDN_URL)) {
        const key = url.replace(`${CDN_URL}/`, "").replace(/^\/+/, "");
        if (key) {
          const { DeleteObjectCommand } = await import("@aws-sdk/client-s3");
          const client = await getR2Client();
          await client.send(
            new DeleteObjectCommand({
              Bucket: BUCKET_NAME,
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

// Delete multiple images from Gallery (Bulk delete)
export const deleteGaleriImagesBulkServerFn = createServerFn({ method: "POST" })
  .validator((d: { urls: string[] }) => d)
  .handler(async ({ data }): Promise<{ success: boolean; images: string[] }> => {
    const { urls } = data;
    if (!urls || urls.length === 0) return { success: true, images: memoryCache || [] };

    try {
      const { getSql } = await import("@/lib/db");
      const sql = await getSql();

      for (const url of urls) {
        await sql`DELETE FROM galeri_images WHERE url = ${url}`;
      }
    } catch (err) {
      console.warn("[galeri] DB bulk delete error:", err);
    }

    // Try deleting from Cloudflare R2
    try {
      const { DeleteObjectsCommand } = await import("@aws-sdk/client-s3");
      const objectsToDelete = urls
        .filter((url) => url.startsWith(CDN_URL))
        .map((url) => ({ Key: url.replace(`${CDN_URL}/`, "").replace(/^\/+/, "") }))
        .filter((item) => !!item.Key);

      if (objectsToDelete.length > 0) {
        const client = await getR2Client();
        await client.send(
          new DeleteObjectsCommand({
            Bucket: BUCKET_NAME,
            Delete: { Objects: objectsToDelete },
          })
        );
      }
    } catch (r2Err) {
      console.warn("[galeri] R2 bulk delete notice:", r2Err);
    }

    if (memoryCache) {
      const urlSet = new Set(urls);
      memoryCache = memoryCache.filter((u) => !urlSet.has(u));
    }

    const updated = await getGaleriImagesServerFn();
    return { success: true, images: updated };
  });


// Add an image by URL
export const addGaleriImageServerFn = createServerFn({ method: "POST" })
  .validator((d: { url: string }) => d)
  .handler(async ({ data }): Promise<{ success: boolean; images: string[] }> => {
    const { url } = data;
    if (!url) return { success: false, images: memoryCache || [] };

    try {
      const { getSql } = await import("@/lib/db");
      const sql = await getSql();

      await sql`INSERT INTO galeri_images (url) VALUES (${url}) ON CONFLICT DO NOTHING`;
    } catch (err) {
      console.warn("[galeri] DB insert error:", err);
    }

    if (memoryCache && !memoryCache.includes(url)) {
      memoryCache = [url, ...memoryCache];
    }

    const updated = await getGaleriImagesServerFn();
    return { success: true, images: updated };
  });

// Direct PC Upload to Cloudflare R2
export const uploadImageToR2ServerFn = createServerFn({ method: "POST" })
  .validator(
    (d: {
      fileName: string;
      base64Data: string;
      contentType?: string;
      addToGallery?: boolean;
    }) => d
  )
  .handler(
    async ({
      data,
    }): Promise<{ success: boolean; url: string; images: string[] }> => {
      const { fileName, base64Data, contentType = "image/webp", addToGallery = true } = data;

      if (!base64Data || !fileName) {
        throw new Error("Eksik dosya verisi");
      }

      // Clean filename
      const cleanFileName = fileName
        .toLowerCase()
        .replace(/[^a-z0-9._-]+/g, "-")
        .replace(/-+/g, "-");

      const yearMonth = new Date().toISOString().slice(0, 7).replace("-", "/"); // e.g. 2026/10
      const key = `${yearMonth}/${Date.now()}-${cleanFileName}`;

      const buffer = Buffer.from(base64Data, "base64");

      const { PutObjectCommand } = await import("@aws-sdk/client-s3");
      const client = await getR2Client();

      await client.send(
        new PutObjectCommand({
          Bucket: BUCKET_NAME,
          Key: key,
          Body: buffer,
          ContentType: contentType,
          CacheControl: "public, max-age=31536000, immutable",
        })
      );

      const publicUrl = `${CDN_URL}/${key}`;

      // Only insert into Gallery table if addToGallery is true
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

      const updatedImages = addToGallery ? await getGaleriImagesServerFn() : (memoryCache || []);
      return { success: true, url: publicUrl, images: updatedImages };
    }
  );
