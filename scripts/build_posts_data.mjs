import fs from "fs";

const pagesData = JSON.parse(
  fs.readFileSync("src/data/pages_extracted.json", "utf8")
);

const blogSlugs = [
  "yeni-web-sitemiz-yayinda",
  "ozel-olcu-mobilya-yaptirmadan-once-dikkat-edilmesi-gerekenler",
];

const posts = blogSlugs.map((slug) => {
  const p = pagesData[slug];
  const meta = p.meta || {};
  
  // Extract clean html
  let html = p.content
    .replace(/<!-- \/?wp:[^>]+ -->/g, "")
    .trim();

  // Replace any old uploads URLs with cdn.parlakmobilyadekorasyon.com
  html = html.replace(
    /https?:\/\/[^"'<>\s]+\/wp-content\/uploads\//g,
    "https://cdn.parlakmobilyadekorasyon.com/wp-content/uploads/"
  );

  return {
    slug,
    title: p.title,
    metaTitle: meta._yoast_wpseo_title || `${p.title} - Parlak Mobilya`,
    metaDesc: meta._yoast_wpseo_metadesc || "",
    date: slug === "yeni-web-sitemiz-yayinda" ? "15 Haziran 2026" : "28 Mayıs 2026",
    category: slug === "yeni-web-sitemiz-yayinda" ? "Duyurular" : "Mobilya Rehberi",
    author: "Ahmet Parlak (Ahmet Usta)",
    readTime: "5 dk okuma",
    contentHtml: html,
    image:
      slug === "yeni-web-sitemiz-yayinda"
        ? "/images/komple-ev.webp"
        : "/images/mutfak-dolaplari.webp",
  };
});

const legalPages = {
  kvkk: {
    title: "KVKK Aydınlatma Metni",
    metaTitle: "KVKK Aydınlatma Metni - Parlak Mobilya ve Dekorasyon",
    metaDesc: "Parlak Mobilya ve Dekorasyon 6698 Sayılı Kişisel Verilerin Korunması Kanunu (KVKK) kapsamındaki aydınlatma metnimiz.",
    contentHtml: (pagesData["kvkk"]?.content || "")
      .replace(/<!-- \/?wp:[^>]+ -->/g, "")
      .replace(/https?:\/\/[^"'<>\s]+\/wp-content\/uploads\//g, "https://cdn.parlakmobilyadekorasyon.com/wp-content/uploads/"),
  },
  "gizlilik-politikasi": {
    title: "Gizlilik Politikası",
    metaTitle: "Gizlilik Politikası - Parlak Mobilya ve Dekorasyon",
    metaDesc: "Parlak Mobilya ve Dekorasyon olarak ziyaretçilerimizin gizliliğine ve kişisel verilerine saygı duyuyoruz.",
    contentHtml: (pagesData["gizlilik-politikasi"]?.content || "")
      .replace(/<!-- \/?wp:[^>]+ -->/g, "")
      .replace(/https?:\/\/[^"'<>\s]+\/wp-content\/uploads\//g, "https://cdn.parlakmobilyadekorasyon.com/wp-content/uploads/"),
  },
  "cerez-politikasi": {
    title: "Çerez Politikası",
    metaTitle: "Çerez Politikası - Parlak Mobilya ve Dekorasyon",
    metaDesc: "Web sitemizde kullanıcı deneyimini iyileştirmek için kullanılan çerezler (cookies) hakkında bilgilendirme.",
    contentHtml: (pagesData["cerez-politikasi"]?.content || "")
      .replace(/<!-- \/?wp:[^>]+ -->/g, "")
      .replace(/https?:\/\/[^"'<>\s]+\/wp-content\/uploads\//g, "https://cdn.parlakmobilyadekorasyon.com/wp-content/uploads/"),
  },
};

const output = `// Auto-generated blog posts and legal policies from WordPress migration
export interface BlogPostItem {
  slug: string;
  title: string;
  metaTitle: string;
  metaDesc: string;
  date: string;
  category: string;
  author: string;
  readTime: string;
  contentHtml: string;
  image: string;
}

export const migratedBlogPosts: BlogPostItem[] = ${JSON.stringify(posts, null, 2)};

export function getBlogPost(slug: string): BlogPostItem | undefined {
  return migratedBlogPosts.find((p) => p.slug === slug);
}

export const legalPolicies = ${JSON.stringify(legalPages, null, 2)};
`;

fs.writeFileSync("src/data/posts.ts", output, "utf8");
console.log("Successfully created src/data/posts.ts!");
