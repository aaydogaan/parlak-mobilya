import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { migratedBlogPosts, type BlogPostItem } from "@/data/posts";
import { adminAuthMiddleware, getAuthenticatedAdmin } from "./security/auth";
import { logAuditEvent } from "./security/audit";
import { sanitizeBlogHtml, sanitizeText } from "./security/sanitize";
import { checkRateLimit, getClientIp } from "./security/rate-limiter";

let blogMemoryCache: BlogPostItem[] | null = null;

function rowToPost(r: any): BlogPostItem {
  return {
    slug: r.slug,
    title: r.title,
    metaTitle: r.meta_title || `${r.title} - Parlak Mobilya ve Dekorasyon`,
    metaDesc: r.meta_desc || "",
    date: r.date || "Bugün",
    category: r.category || "Mobilya Rehberi",
    author: r.author || "Ahmet Parlak",
    readTime: r.read_time || "5 dk okuma",
    contentHtml: r.content_html || "",
    image: r.image || "/images/mutfak-dolaplari.webp",
    views: typeof r.views === "number" ? r.views : 0,
    status: (r.status as "published" | "draft") || "published",
  };
}

const BlogPostSchema = z.object({
  slug: z
    .string()
    .min(2)
    .max(160)
    .regex(/^[a-z0-9-]+$/, "Geçersiz slug formatı"),
  title: z.string().min(2).max(250),
  metaTitle: z.string().max(300).optional(),
  metaDesc: z.string().max(500).optional(),
  date: z.string().max(60).optional(),
  category: z.string().max(80).optional(),
  author: z.string().max(80).optional(),
  readTime: z.string().max(40).optional(),
  contentHtml: z.string().max(500000), // Max 500KB HTML content
  image: z.string().max(500).optional(),
  status: z.enum(["published", "draft"]).optional(),
  views: z.number().int().min(0).optional(),
});

// Get all blog posts (with verified draft inclusion for authenticated admins only)
export const getBlogPostsServerFn = createServerFn({ method: "GET" })
  .validator((d?: { includeDrafts?: boolean }) => d)
  .handler(async ({ data }): Promise<BlogPostItem[]> => {
    let includeDrafts = false;

    // Defense-in-depth: ONLY verified admins can view drafts
    if (data?.includeDrafts) {
      const { getRequest } = await import("@tanstack/react-start/server");
      const req = getRequest();
      const auth = await getAuthenticatedAdmin(req);
      if (auth && auth.user.role === "admin") {
        includeDrafts = true;
      }
    }

    try {
      const { getSql } = await import("@/lib/db");
      const sql = await getSql();

      // Ensure table exists
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

      const rows = await sql`
        SELECT * FROM blog_posts ORDER BY id DESC
      `;

      if (rows && rows.length > 0) {
        const posts = rows.map(rowToPost);
        blogMemoryCache = posts;
        return includeDrafts ? posts : posts.filter((p) => p.status !== "draft");
      }

      // Seed initial posts if empty
      for (const p of [...migratedBlogPosts].reverse()) {
        try {
          await sql`INSERT INTO blog_posts (
            slug, title, meta_title, meta_desc, date, category, author, read_time, content_html, image, status, views
          ) VALUES (
            ${p.slug}, ${p.title}, ${p.metaTitle}, ${p.metaDesc}, ${p.date}, ${p.category}, ${p.author}, ${p.readTime}, ${p.contentHtml}, ${p.image}, ${p.status || "published"}, ${p.views || 0}
          ) ON CONFLICT (slug) DO NOTHING`;
        } catch {
          // ignore
        }
      }

      blogMemoryCache = [...migratedBlogPosts];
      return includeDrafts
        ? blogMemoryCache
        : blogMemoryCache.filter((p) => p.status !== "draft");
    } catch (err) {
      console.warn("[blog] DB fetch error, falling back to cache/migrated:", err);
      if (blogMemoryCache && blogMemoryCache.length > 0) {
        return includeDrafts
          ? blogMemoryCache
          : blogMemoryCache.filter((p) => p.status !== "draft");
      }
      return includeDrafts
        ? migratedBlogPosts
        : migratedBlogPosts.filter((p) => p.status !== "draft");
    }
  });

// Get single blog post by slug (Drafts only accessible to admins)
export const getBlogPostBySlugServerFn = createServerFn({ method: "POST" })
  .validator((d: { slug: string }) => d)
  .handler(async ({ data }): Promise<BlogPostItem | null> => {
    const { slug } = data;
    if (!slug) return null;

    let post: BlogPostItem | null = null;

    try {
      const { getSql } = await import("@/lib/db");
      const sql = await getSql();

      const rows = await sql`
        SELECT * FROM blog_posts WHERE slug = ${slug} LIMIT 1
      `;
      if (rows && rows.length > 0) {
        post = rowToPost(rows[0]);
      }
    } catch (err) {
      console.warn("[blog] DB get by slug error:", err);
    }

    if (!post && blogMemoryCache) {
      post = blogMemoryCache.find((p) => p.slug === slug) || null;
    }

    if (!post) {
      post = migratedBlogPosts.find((p) => p.slug === slug) || null;
    }

    if (post && post.status === "draft") {
      const { getRequest } = await import("@tanstack/react-start/server");
      const req = getRequest();
      const auth = await getAuthenticatedAdmin(req);
      if (!auth || auth.user.role !== "admin") {
        return null; // Don't leak drafts to unauthorized visitors
      }
    }

    return post;
  });

// Save (create or update) blog post - PROTECTED WITH ADMIN AUTH
export const saveBlogPostServerFn = createServerFn({ method: "POST" })
  .middleware([adminAuthMiddleware])
  .validator((d: { post: unknown }) => BlogPostSchema.parse(d.post))
  .handler(
    async ({
      data: postData,
      context,
    }): Promise<{ success: boolean; post: BlogPostItem; posts: BlogPostItem[] }> => {
      const { adminUser } = context;
      const { getRequest } = await import("@tanstack/react-start/server");
      const req = getRequest();

      // Sanitize inputs to prevent Stored XSS
      const cleanSlug = sanitizeText(postData.slug, 160).toLowerCase();
      const cleanTitle = sanitizeText(postData.title, 250);
      const cleanMetaTitle = postData.metaTitle
        ? sanitizeText(postData.metaTitle, 300)
        : `${cleanTitle} - Parlak Mobilya ve Dekorasyon`;
      const cleanMetaDesc = postData.metaDesc ? sanitizeText(postData.metaDesc, 500) : "";
      const cleanDate = postData.date ? sanitizeText(postData.date, 60) : "Bugün";
      const cleanCategory = postData.category ? sanitizeText(postData.category, 80) : "Duyurular";
      const cleanAuthor = "Ahmet Parlak";
      const cleanReadTime = postData.readTime ? sanitizeText(postData.readTime, 40) : "5 dk okuma";
      const cleanImage = postData.image ? sanitizeText(postData.image, 500) : "/images/mutfak-dolaplari.webp";
      const cleanStatus = postData.status || "published";
      const views = typeof postData.views === "number" ? postData.views : 0;

      // Deep HTML Sanitization
      const cleanContentHtml = sanitizeBlogHtml(postData.contentHtml);

      try {
        const { getSql } = await import("@/lib/db");
        const sql = await getSql();

        await sql`INSERT INTO blog_posts (
          slug, title, meta_title, meta_desc, date, category, author, read_time, content_html, image, status, views, updated_at
        ) VALUES (
          ${cleanSlug}, ${cleanTitle}, ${cleanMetaTitle}, ${cleanMetaDesc}, ${cleanDate}, ${cleanCategory},
          ${cleanAuthor}, ${cleanReadTime}, ${cleanContentHtml}, ${cleanImage}, ${cleanStatus}, ${views}, now()
        ) ON CONFLICT (slug) DO UPDATE SET
          title = EXCLUDED.title,
          meta_title = EXCLUDED.meta_title,
          meta_desc = EXCLUDED.meta_desc,
          date = EXCLUDED.date,
          category = EXCLUDED.category,
          author = EXCLUDED.author,
          read_time = EXCLUDED.read_time,
          content_html = EXCLUDED.content_html,
          image = EXCLUDED.image,
          status = EXCLUDED.status,
          updated_at = now()
        `;

        await logAuditEvent({
          userId: adminUser.id,
          action: "ARTICLE_UPDATED",
          entityType: "blog_post",
          entityId: cleanSlug,
          details: { title: cleanTitle, status: cleanStatus },
          req,
        });
      } catch (dbErr) {
        console.error("[blog] DB save error:", dbErr);
        throw new Error("Makale veritabanına kaydedilirken bir hata oluştu.");
      }

      const allPosts = await getBlogPostsServerFn({ data: { includeDrafts: true } });
      const saved = allPosts.find((p) => p.slug === cleanSlug) || {
        slug: cleanSlug,
        title: cleanTitle,
        metaTitle: cleanMetaTitle,
        metaDesc: cleanMetaDesc,
        date: cleanDate,
        category: cleanCategory,
        author: cleanAuthor,
        readTime: cleanReadTime,
        contentHtml: cleanContentHtml,
        image: cleanImage,
        status: cleanStatus,
        views,
      };

      return { success: true, post: saved, posts: allPosts };
    },
  );

// Delete blog post - PROTECTED WITH ADMIN AUTH
export const deleteBlogPostServerFn = createServerFn({ method: "POST" })
  .middleware([adminAuthMiddleware])
  .validator((d: { slug: string }) => z.object({ slug: z.string().min(1).max(160) }).parse(d))
  .handler(
    async ({
      data,
      context,
    }): Promise<{ success: boolean; posts: BlogPostItem[] }> => {
      const { slug } = data;
      const { adminUser } = context;
      const { getRequest } = await import("@tanstack/react-start/server");
      const req = getRequest();

      try {
        const { getSql } = await import("@/lib/db");
        const sql = await getSql();

        await sql`DELETE FROM blog_posts WHERE slug = ${slug}`;

        await logAuditEvent({
          userId: adminUser.id,
          action: "ARTICLE_DELETED",
          entityType: "blog_post",
          entityId: slug,
          req,
        });
      } catch (err) {
        console.error("[blog] DB delete error:", err);
        throw new Error("Makale silinirken bir hata oluştu.");
      }

      const allPosts = await getBlogPostsServerFn({ data: { includeDrafts: true } });
      return { success: true, posts: allPosts };
    },
  );

// Toggle blog post published/draft status - PROTECTED WITH ADMIN AUTH
export const toggleBlogPostStatusServerFn = createServerFn({ method: "POST" })
  .middleware([adminAuthMiddleware])
  .validator((d: { slug: string; status: "published" | "draft" }) =>
    z.object({ slug: z.string().min(1), status: z.enum(["published", "draft"]) }).parse(d),
  )
  .handler(
    async ({
      data,
      context,
    }): Promise<{ success: boolean; status: "published" | "draft"; posts: BlogPostItem[] }> => {
      const { slug, status } = data;
      const { adminUser } = context;
      const { getRequest } = await import("@tanstack/react-start/server");
      const req = getRequest();

      try {
        const { getSql } = await import("@/lib/db");
        const sql = await getSql();

        await sql`UPDATE blog_posts SET status = ${status}, updated_at = now() WHERE slug = ${slug}`;

        await logAuditEvent({
          userId: adminUser.id,
          action: "ARTICLE_STATUS_CHANGED",
          entityType: "blog_post",
          entityId: slug,
          details: { newStatus: status },
          req,
        });
      } catch (err) {
        console.error("[blog] DB status toggle error:", err);
        throw new Error("Makale durumu güncellenirken bir hata oluştu.");
      }

      const allPosts = await getBlogPostsServerFn({ data: { includeDrafts: true } });
      return { success: true, status, posts: allPosts };
    },
  );

// Increment view count in database (Public, rate-limited by IP to prevent inflation attacks)
export const incrementBlogPostViewServerFn = createServerFn({ method: "POST" })
  .validator((d: { slug: string }) => z.object({ slug: z.string().min(1).max(160) }).parse(d))
  .handler(async ({ data }): Promise<{ success: boolean; views: number }> => {
    const { slug } = data;
    const { getRequest } = await import("@tanstack/react-start/server");
    const req = getRequest();
    const ip = getClientIp(req);

    // Rate limit: max 1 view count increment per IP per post per 5 minutes
    const viewLimit = checkRateLimit(`view:${slug}:${ip}`, 1, 5 * 60 * 1000);
    if (!viewLimit.allowed) {
      return { success: true, views: 0 };
    }

    try {
      const { getSql } = await import("@/lib/db");
      const sql = await getSql();

      const result = await sql<{ views: number }>`
        UPDATE blog_posts SET views = views + 1 WHERE slug = ${slug} RETURNING views
      `;
      if (result && result.length > 0) {
        return { success: true, views: result[0].views };
      }
    } catch (err) {
      console.warn("[blog] DB increment view error:", err);
    }

    return { success: true, views: 1 };
  });
