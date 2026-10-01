import { allProjectsList } from "../../data/projects.ts";
import { migratedBlogPosts } from "../../data/posts.ts";
import { writeFileSync } from "node:fs";
import { resolve } from "node:path";

export interface SitemapUrl {
  loc: string;
  lastmod?: string;
  changefreq?: "always" | "hourly" | "daily" | "weekly" | "monthly" | "yearly" | "never";
  priority?: string;
}

const BASE_URL = "https://www.parlakmobilyadekorasyon.com";

/**
 * Generates an up-to-date XML sitemap including all static pages,
 * dynamic projects, and all published blog posts from the database.
 */
export async function generateSitemapXml(): Promise<string> {
  const today = new Date().toISOString().split("T")[0];

  // 1. Static Pages
  const staticPages: SitemapUrl[] = [
    { loc: `${BASE_URL}/`, lastmod: today, changefreq: "daily", priority: "1.0" },
    { loc: `${BASE_URL}/hakkimizda`, lastmod: today, changefreq: "monthly", priority: "0.8" },
    { loc: `${BASE_URL}/iletisim`, lastmod: today, changefreq: "monthly", priority: "0.8" },
    { loc: `${BASE_URL}/galeri`, lastmod: today, changefreq: "weekly", priority: "0.8" },
    { loc: `${BASE_URL}/hizmetler`, lastmod: today, changefreq: "weekly", priority: "0.9" },
    { loc: `${BASE_URL}/projeler`, lastmod: today, changefreq: "weekly", priority: "0.9" },
    { loc: `${BASE_URL}/blog`, lastmod: today, changefreq: "daily", priority: "0.8" },
    { loc: `${BASE_URL}/kvkk`, lastmod: today, changefreq: "yearly", priority: "0.5" },
    { loc: `${BASE_URL}/gizlilik-politikasi`, lastmod: today, changefreq: "yearly", priority: "0.5" },
    { loc: `${BASE_URL}/cerez-politikasi`, lastmod: today, changefreq: "yearly", priority: "0.5" },
  ];

  // 2. Dynamic Projects
  const projectPages: SitemapUrl[] = allProjectsList.map((p) => ({
    loc: `${BASE_URL}/projeler/${p.slug}`,
    lastmod: today,
    changefreq: "weekly",
    priority: "0.8",
  }));

  // 3. Dynamic Published Blog Posts from Database
  let blogEntries: { slug: string; date?: string; updatedAt?: string }[] = [];
  try {
    const { getSql } = await import("../db.ts");
    const sql = await getSql();

    await sql`CREATE TABLE IF NOT EXISTS blog_posts (
      id SERIAL PRIMARY KEY,
      slug TEXT NOT NULL UNIQUE,
      title TEXT NOT NULL,
      meta_title TEXT NOT NULL,
      meta_desc TEXT NOT NULL,
      date TEXT NOT NULL,
      category TEXT NOT NULL,
      author TEXT NOT NULL DEFAULT 'Ahmet Parlak',
      read_time TEXT NOT NULL DEFAULT '5 dk okuma',
      content_html TEXT NOT NULL,
      image TEXT NOT NULL,
      status TEXT NOT NULL DEFAULT 'published',
      views INT NOT NULL DEFAULT 0,
      created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
      updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
    )`;

    const rows = await sql<{
      slug: string;
      date: string;
      updated_at: string;
      status: string;
    }>`
      SELECT slug, date, updated_at, status 
      FROM blog_posts 
      WHERE status = 'published' 
      ORDER BY id DESC
    `;

    if (rows && rows.length > 0) {
      blogEntries = rows.map((r) => ({
        slug: r.slug,
        date: r.date,
        updatedAt: r.updated_at,
      }));
    }
  } catch (err) {
    console.warn("[sitemap] DB query failed, falling back to static migrated posts:", err);
  }

  // Fallback to migrated posts if DB is not populated yet
  if (blogEntries.length === 0) {
    blogEntries = migratedBlogPosts
      .filter((p) => p.status !== "draft")
      .map((p) => ({ slug: p.slug, date: p.date }));
  }

  const blogPages: SitemapUrl[] = blogEntries.map((p) => {
    let postDate = today;
    if (p.updatedAt) {
      try {
        postDate = new Date(p.updatedAt).toISOString().split("T")[0];
      } catch {
        postDate = today;
      }
    }
    return {
      loc: `${BASE_URL}/blog/${p.slug}`,
      lastmod: postDate,
      changefreq: "weekly",
      priority: "0.8",
    };
  });

  const allUrls = [...staticPages, ...projectPages, ...blogPages];

  const urlEntries = allUrls
    .map(
      (u) => `  <url>
    <loc>${u.loc}</loc>${u.lastmod ? `\n    <lastmod>${u.lastmod}</lastmod>` : ""}${u.changefreq ? `\n    <changefreq>${u.changefreq}</changefreq>` : ""}${u.priority ? `\n    <priority>${u.priority}</priority>` : ""}
  </url>`,
    )
    .join("\n");

  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urlEntries}
</urlset>`;
}

/**
 * Synchronizes public/sitemap.xml file with latest database content.
 * Safe against read-only filesystem environments.
 */
export async function syncSitemapFile(): Promise<void> {
  try {
    const xml = await generateSitemapXml();
    const publicSitemapPath = resolve(process.cwd(), "public", "sitemap.xml");
    writeFileSync(publicSitemapPath, xml, "utf-8");
    console.log(`[sitemap] Successfully synced public/sitemap.xml with live database posts.`);
  } catch (err) {
    console.warn("[sitemap] Failed to write sitemap to disk:", err);
  }
}
