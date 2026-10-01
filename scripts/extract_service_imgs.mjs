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

const items = Array.from(xml.matchAll(/<item>([\s\S]*?)<\/item>/g));

const targetSlugs = [
  "konya-mutfak-dolaplari",
  "modern-gardirop-modelleri",
  "ozel-olcu-vestiyer-modelleri",
  "komple-ev-yenileme",
  "konya-tv-unitesi",
  "konya-cocuk-odasi",
];

for (const item of items) {
  const block = item[1];
  const slug = getTag(block, "wp:post_name").trim();
  const title = getTag(block, "title").trim();
  if (targetSlugs.includes(slug)) {
    const imgs = Array.from(
      block.matchAll(
        /https?:\/\/[^"'<>\s]+\/wp-content\/uploads\/([^"'<>\s]+\.(?:jpg|jpeg|png|webp))/gi
      )
    ).map((m) => m[1]);
    const uniqueImgs = Array.from(new Set(imgs)).filter(
      (img) => !img.includes("favicon") && !img.includes("logo")
    );
    console.log(`\n=== ${title} (${slug}) ===`);
    console.log(`Found ${uniqueImgs.length} images. Top 3:`);
    console.log(uniqueImgs.slice(0, 3));
  }
}
