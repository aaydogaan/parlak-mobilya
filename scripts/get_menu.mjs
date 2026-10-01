import fs from "fs";

const sql = fs.readFileSync("attachments/parlakmo_wp157.sql", "utf8");
const postmetaBlock = sql.slice(sql.indexOf("INSERT INTO `wp_postmeta`"));
const end = postmetaBlock.indexOf("UNLOCK TABLES;");
const chunk = postmetaBlock.slice(0, end);

const targetIds = new Set([75, 76, 77, 78, 81, 322, 787]);
const results = {};

for (const id of targetIds) {
  results[id] = {};
}

// Regex to capture postmeta
const regex = /\((\d+),\s*(\d+),\s*'([^']+)',\s*'([\s\S]*?)'\)/g;
let match;
while ((match = regex.exec(chunk)) !== null) {
  const metaId = match[1];
  const postId = Number(match[2]);
  const metaKey = match[3];
  const metaValue = match[4];
  if (targetIds.has(postId)) {
    results[postId][metaKey] = metaValue;
  }
}

console.log(JSON.stringify(results, null, 2));
