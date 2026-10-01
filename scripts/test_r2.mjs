import { S3Client, ListObjectsV2Command, PutObjectCommand } from "@aws-sdk/client-s3";

const client = new S3Client({
  region: "auto",
  endpoint: "https://698720c00ecdd44bb653bf575a74c45e.r2.cloudflarestorage.com",
  credentials: {
    accessKeyId: "52f4b952ddd4258d9450a14d87f467b0",
    secretAccessKey: "5322178d8f9819a9df5c2197b8ae9eb13c8704fb1959803603241fc2d80ebeec",
  },
});

async function testConnection() {
  try {
    console.log("Testing R2 connection to bucket 'parlak-mobilya-media'...");
    const res = await client.send(
      new ListObjectsV2Command({
        Bucket: "parlak-mobilya-media",
        MaxKeys: 5,
      })
    );
    console.log("Connection SUCCESSFUL!");
    console.log("Existing objects in bucket:", res.KeyCount ?? 0);
  } catch (err) {
    console.error("Connection failed:", err.message);
  }
}

testConnection();
