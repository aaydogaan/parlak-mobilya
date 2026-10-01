import fs from "fs";

const xml = fs.readFileSync(
  "attachments/konyamobilyakonyamutfakdolaplarparlakmobilyavedekorasyon.WordPress.2026-10-01.xml",
  "utf8"
);

const items = xml.split("<item>").slice(1);
const slugs = [
  "konya-mutfak-dolaplari",
  "modern-gardirop-modelleri",
  "ozel-olcu-vestiyer-modelleri",
  "komple-ev-yenileme",
  "konya-tv-unitesi",
  "konya-cocuk-odasi",
];

const projectsData = {};

for (const item of items) {
  const postNameMatch = item.match(
    /<wp:post_name><!\[CDATA\[(.*?)\]\]><\/wp:post_name>/
  );
  if (postNameMatch && slugs.includes(postNameMatch[1])) {
    const slug = postNameMatch[1];
    const contentMatch = item.match(
      /<content:encoded><!\[CDATA\[([\s\S]*?)\]\]><\/content:encoded>/
    );
    const content = contentMatch ? contentMatch[1] : "";

    // Extract image URLs
    const imgMatches = [
      ...content.matchAll(
        /https?:\/\/[^"'<>\s]+\/wp-content\/uploads\/[^"'<>\s]+\.(?:jpg|jpeg|png|webp)/gi
      ),
    ].map((m) => m[0]);
    // Deduplicate
    const uniqueImgs = Array.from(new Set(imgMatches)).map((url) => {
      // Convert to cdn.parlakmobilyadekorasyon.com URL
      return url.replace(
        /^https?:\/\/[^/]+/,
        "https://cdn.parlakmobilyadekorasyon.com"
      );
    });

    // Extract headings
    const headings = [...content.matchAll(/<h[1-4][^>]*>([\s\S]*?)<\/h[1-4]>/gi)].map(
      (m) => m[1].replace(/<[^>]+>/g, "").trim()
    );

    // Extract plain paragraphs (non-empty)
    const paragraphs = [
      ...content.matchAll(/<p[^>]*>([\s\S]*?)<\/p>/gi),
    ]
      .map((m) => m[1].replace(/<[^>]+>/g, "").trim())
      .filter((p) => p.length > 20 && !p.includes("[bromak_scroll"));

    projectsData[slug] = {
      slug,
      headings,
      paragraphs,
      images: uniqueImgs,
    };
  }
}

console.log("Project Data Summary:");
for (const [slug, data] of Object.entries(projectsData)) {
  console.log(
    `[${slug}] Headings: ${data.headings.length}, Paragraphs: ${data.paragraphs.length}, Images: ${data.images.length}`
  );
  if (data.headings.length > 0) {
    console.log(`  Headings:`, data.headings);
  }
  if (data.paragraphs.length > 0) {
    console.log(`  First 2 paragraphs:`, data.paragraphs.slice(0, 2));
  }
  if (data.images.length > 0) {
    console.log(`  First 3 images:`, data.images.slice(0, 3));
  }
}

fs.writeFileSync(
  "src/data/projects_extracted.json",
  JSON.stringify(projectsData, null, 2)
);
console.log("Saved extracted data to src/data/projects_extracted.json");
