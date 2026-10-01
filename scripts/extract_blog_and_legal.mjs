import fs from "fs";

const xml = fs.readFileSync(
  "attachments/konyamobilyakonyamutfakdolaplarparlakmobilyavedekorasyon.WordPress.2026-10-01.xml",
  "utf8"
);

const items = xml.split("<item>").slice(1);
const slugs = [
  "yeni-web-sitemiz-yayinda",
  "ozel-olcu-mobilya-yaptirmadan-once-dikkat-edilmesi-gerekenler",
  "kvkk",
  "gizlilik-politikasi",
  "cerez-politikasi",
  "hakkimizda",
  "hizmetler",
  "projeler",
  "iletisim",
  "galeri"
];

const extracted = {};

for (const item of items) {
  const postNameMatch = item.match(
    /<wp:post_name><!\[CDATA\[(.*?)\]\]><\/wp:post_name>/
  );
  if (postNameMatch && slugs.includes(postNameMatch[1])) {
    const slug = postNameMatch[1];
    const titleMatch = item.match(/<title><!\[CDATA\[(.*?)\]\]><\/title>/) || item.match(/<title>(.*?)<\/title>/);
    const contentMatch = item.match(
      /<content:encoded><!\[CDATA\[([\s\S]*?)\]\]><\/content:encoded>/
    );
    const content = contentMatch ? contentMatch[1] : "";

    const metaMatches = [...item.matchAll(/<wp:meta_key><!\[CDATA\[(.*?)\]\]><\/wp:meta_key>\s*<wp:meta_value><!\[CDATA\[([\s\S]*?)\]\]><\/wp:meta_value>/g)];
    const meta = {};
    for (const m of metaMatches) {
      if (m[1].includes("title") || m[1].includes("desc") || m[1].includes("seo")) {
        meta[m[1]] = m[2];
      }
    }

    extracted[slug] = {
      slug,
      title: titleMatch ? titleMatch[1] : "",
      content,
      meta,
    };
  }
}

fs.writeFileSync("src/data/pages_extracted.json", JSON.stringify(extracted, null, 2));
console.log("Extracted pages saved to src/data/pages_extracted.json");
