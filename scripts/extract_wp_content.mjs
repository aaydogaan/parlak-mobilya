import fs from "fs";

const xml = fs.readFileSync(
  "attachments/konyamobilyakonyamutfakdolaplarparlakmobilyavedekorasyon.WordPress.2026-10-01.xml",
  "utf8"
);

function getTag(block, tag) {
  const m = block.match(
    new RegExp(`<${tag}>(?:<!\\[CDATA\\[([\\s\\S]*?)\\]\\]>|([^<]*))<\\/${tag}>`)
  );
  return m ? (m[1] !== undefined ? m[1] : m[2]) : "";
}

function getPostMeta(block, key) {
  const regex = new RegExp(
    `<wp:postmeta>[\\s\\S]*?<wp:meta_key>(?:<!\\[CDATA\\[${key}\\]\\]>|${key})<\\/wp:meta_key>[\\s\\S]*?<wp:meta_value>(?:<!\\[CDATA\\[([\\s\\S]*?)\\]\\]>|([^<]*))<\\/wp:meta_value>[\\s\\S]*?<\\/wp:postmeta>`
  );
  const m = block.match(regex);
  return m ? (m[1] !== undefined ? m[1] : m[2]) : "";
}

const items = Array.from(xml.matchAll(/<item>([\s\S]*?)<\/item>/g));

const pages = [];
const posts = [];
const attachments = [];

for (const item of items) {
  const block = item[1];
  const type = getTag(block, "wp:post_type");
  const status = getTag(block, "wp:status");
  const title = getTag(block, "title").trim();
  const slug = getTag(block, "wp:post_name").trim();
  const link = getTag(block, "link").trim();
  const content = getTag(block, "content:encoded").trim();
  const pubDate = getTag(block, "pubDate").trim();

  // SEO metadata
  const yoastTitle = getPostMeta(block, "_yoast_wpseo_title");
  const yoastDesc = getPostMeta(block, "_yoast_wpseo_metadesc");
  const rankMathTitle = getPostMeta(block, "rank_math_title");
  const rankMathDesc = getPostMeta(block, "rank_math_description");

  const seoTitle = yoastTitle || rankMathTitle || title;
  const seoDesc = yoastDesc || rankMathDesc || "";

  if (type === "page" && status === "publish") {
    pages.push({
      title,
      slug,
      link,
      seoTitle,
      seoDesc,
      pubDate,
      contentLength: content.length,
    });
  } else if (type === "post" && status === "publish") {
    posts.push({
      title,
      slug,
      link,
      seoTitle,
      seoDesc,
      pubDate,
      contentLength: content.length,
    });
  } else if (type === "attachment") {
    const attachUrl = getTag(block, "wp:attachment_url");
    if (attachUrl) attachments.push({ title, url: attachUrl });
  }
}

console.log("=== PUBLISHED PAGES ===");
console.log(JSON.stringify(pages, null, 2));

console.log("\n=== PUBLISHED POSTS ===");
console.log(JSON.stringify(posts, null, 2));

console.log(`\nTotal Attachments: ${attachments.length}`);
