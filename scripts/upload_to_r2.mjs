import fs from "fs";
import path from "path";
import { S3Client, PutObjectCommand, HeadObjectCommand } from "@aws-sdk/client-s3";

const BUCKET_NAME = "parlak-mobilya-media";
const ENDPOINT = "https://698720c00ecdd44bb653bf575a74c45e.r2.cloudflarestorage.com";
const ACCESS_KEY_ID = "52f4b952ddd4258d9450a14d87f467b0";
const SECRET_ACCESS_KEY = "5322178d8f9819a9df5c2197b8ae9eb13c8704fb1959803603241fc2d80ebeec";
const UPLOADS_DIR = "attachments/uploads";

const client = new S3Client({
  region: "auto",
  endpoint: ENDPOINT,
  credentials: {
    accessKeyId: ACCESS_KEY_ID,
    secretAccessKey: SECRET_ACCESS_KEY,
  },
});

const MIME_TYPES = {
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".png": "image/png",
  ".webp": "image/webp",
  ".svg": "image/svg+xml",
  ".gif": "image/gif",
  ".pdf": "application/pdf",
  ".ico": "image/x-icon",
  ".avif": "image/avif",
  ".json": "application/json",
  ".css": "text/css",
  ".js": "application/javascript",
};

function getAllFiles(dir, baseDir = dir) {
  let results = [];
  const list = fs.readdirSync(dir);
  for (const file of list) {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);
    if (stat.isDirectory()) {
      results = results.concat(getAllFiles(filePath, baseDir));
    } else {
      const relKey = path.relative(baseDir, filePath).replace(/\\/g, "/");
      results.push({ fullPath: filePath, key: relKey, size: stat.size });
    }
  }
  return results;
}

async function uploadFile(fileObj, index, total) {
  const ext = path.extname(fileObj.key).toLowerCase();
  const contentType = MIME_TYPES[ext] || "application/octet-stream";
  const fileStream = fs.createReadStream(fileObj.fullPath);

  const cmd = new PutObjectCommand({
    Bucket: BUCKET_NAME,
    Key: fileObj.key,
    Body: fileStream,
    ContentType: contentType,
    CacheControl: "public, max-age=31536000, immutable",
  });

  await client.send(cmd);
}

async function runUpload() {
  console.log(`Scanning files in ${UPLOADS_DIR}...`);
  const files = getAllFiles(UPLOADS_DIR);
  const total = files.length;
  console.log(`Found ${total} files to upload to Cloudflare R2 (${BUCKET_NAME}).`);

  const CONCURRENCY = 15;
  let currentIndex = 0;
  let successCount = 0;
  let errorCount = 0;
  const startTime = Date.now();

  async function worker() {
    while (currentIndex < total) {
      const idx = currentIndex++;
      const file = files[idx];
      try {
        await uploadFile(file, idx, total);
        successCount++;
        if (successCount % 100 === 0 || successCount === total) {
          const elapsed = ((Date.now() - startTime) / 1000).toFixed(1);
          const percent = ((successCount / total) * 100).toFixed(1);
          console.log(
            `[${percent}%] Uploaded ${successCount}/${total} files (${elapsed}s elapsed)`
          );
        }
      } catch (err) {
        errorCount++;
        console.error(`Failed to upload ${file.key}:`, err.message);
      }
    }
  }

  const workers = Array.from({ length: CONCURRENCY }, () => worker());
  await Promise.all(workers);

  const totalTime = ((Date.now() - startTime) / 1000).toFixed(1);
  console.log(
    `\nUpload Complete! Successfully uploaded: ${successCount} files, Errors: ${errorCount}. Total time: ${totalTime}s`
  );
}

runUpload();
