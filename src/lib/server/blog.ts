import { createServerFn } from "@tanstack/react-start";
import { migratedBlogPosts, type BlogPostItem } from "@/data/posts";

let blogMemoryCache: BlogPostItem[] | null = null;

function rowToPost(r: any): BlogPostItem {
  return {
    slug: r.slug,
    title: r.title,
    metaTitle: r.meta_title || `${r.title} - Parlak Mobilya ve Dekorasyon`,
    metaDesc: r.meta_desc || "",
    date: r.date || "Bugün",
    category: r.category || "Mobilya Rehberi",
    author: r.author || "Ahmet Parlak (Ahmet Usta)",
    readTime: r.read_time || "5 dk okuma",
    contentHtml: r.content_html || "",
    image: r.image || "/images/mutfak-dolaplari.webp",
    views: typeof r.views === "number" ? r.views : 0,
    status: (r.status as "published" | "draft") || "published",
  };
}

// Get all blog posts (with optional draft inclusion for admin)
export const getBlogPostsServerFn = createServerFn({ method: "GET" })
  .validator((d?: { includeDrafts?: boolean }) => d)
  .handler(async ({ data }): Promise<BlogPostItem[]> => {
    const includeDrafts = data?.includeDrafts ?? false;

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
        author TEXT NOT NULL DEFAULT 'Ahmet Parlak (Ahmet Usta)',
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

// Get single blog post by slug
export const getBlogPostBySlugServerFn = createServerFn({ method: "POST" })
  .validator((d: { slug: string }) => d)
  .handler(async ({ data }): Promise<BlogPostItem | null> => {
    const { slug } = data;
    if (!slug) return null;

    try {
      const { getSql } = await import("@/lib/db");
      const sql = await getSql();

      const rows = await sql`
        SELECT * FROM blog_posts WHERE slug = ${slug} LIMIT 1
      `;
      if (rows && rows.length > 0) {
        return rowToPost(rows[0]);
      }
    } catch (err) {
      console.warn("[blog] DB get by slug error:", err);
    }

    if (blogMemoryCache) {
      const found = blogMemoryCache.find((p) => p.slug === slug);
      if (found) return found;
    }

    return migratedBlogPosts.find((p) => p.slug === slug) || null;
  });

// Save (create or update) blog post
export const saveBlogPostServerFn = createServerFn({ method: "POST" })
  .validator((d: { post: BlogPostItem }) => d)
  .handler(
    async ({
      data,
    }): Promise<{ success: boolean; post: BlogPostItem; posts: BlogPostItem[] }> => {
      const p = data.post;
      if (!p || !p.slug || !p.title) {
        throw new Error("Geçersiz makale verisi");
      }

      const status = p.status || "published";
      const views = typeof p.views === "number" ? p.views : 0;

      try {
        const { getSql } = await import("@/lib/db");
        const sql = await getSql();

        await sql`INSERT INTO blog_posts (
          slug, title, meta_title, meta_desc, date, category, author, read_time, content_html, image, status, views, updated_at
        ) VALUES (
          ${p.slug}, ${p.title}, ${p.metaTitle}, ${p.metaDesc}, ${p.date}, ${p.category}, ${p.author}, ${p.readTime}, ${p.contentHtml}, ${p.image}, ${status}, ${views}, now()
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
          updated_at = now()`;
      } catch (err) {
        console.warn("[blog] DB save error:", err);
      }

      const savedPost: BlogPostItem = { ...p, status, views };

      if (blogMemoryCache) {
        const idx = blogMemoryCache.findIndex((item) => item.slug === p.slug);
        if (idx >= 0) {
          blogMemoryCache[idx] = savedPost;
        } else {
          blogMemoryCache = [savedPost, ...blogMemoryCache];
        }
      }

      const allPosts = await getBlogPostsServerFn({ data: { includeDrafts: true } });
      return { success: true, post: savedPost, posts: allPosts };
    }
  );

// Delete blog post
export const deleteBlogPostServerFn = createServerFn({ method: "POST" })
  .validator((d: { slug: string }) => d)
  .handler(
    async ({
      data,
    }): Promise<{ success: boolean; posts: BlogPostItem[] }> => {
      const { slug } = data;
      if (!slug) return { success: false, posts: blogMemoryCache || [] };

      try {
        const { getSql } = await import("@/lib/db");
        const sql = await getSql();

        await sql`DELETE FROM blog_posts WHERE slug = ${slug}`;
      } catch (err) {
        console.warn("[blog] DB delete error:", err);
      }

      if (blogMemoryCache) {
        blogMemoryCache = blogMemoryCache.filter((p) => p.slug !== slug);
      }

      const allPosts = await getBlogPostsServerFn({ data: { includeDrafts: true } });
      return { success: true, posts: allPosts };
    }
  );

// Toggle blog post status (published / draft)
export const toggleBlogPostStatusServerFn = createServerFn({ method: "POST" })
  .validator((d: { slug: string; status: "published" | "draft" }) => d)
  .handler(
    async ({
      data,
    }): Promise<{ success: boolean; status: "published" | "draft"; posts: BlogPostItem[] }> => {
      const { slug, status } = data;

      try {
        const { getSql } = await import("@/lib/db");
        const sql = await getSql();

        await sql`UPDATE blog_posts SET status = ${status}, updated_at = now() WHERE slug = ${slug}`;
      } catch (err) {
        console.warn("[blog] DB toggle status error:", err);
      }

      if (blogMemoryCache) {
        blogMemoryCache = blogMemoryCache.map((p) =>
          p.slug === slug ? { ...p, status } : p
        );
      }

      const allPosts = await getBlogPostsServerFn({ data: { includeDrafts: true } });
      return { success: true, status, posts: allPosts };
    }
  );

// Increment view count in database
export const incrementBlogPostViewServerFn = createServerFn({ method: "POST" })
  .validator((d: { slug: string }) => d)
  .handler(async ({ data }): Promise<{ success: boolean; views: number }> => {
    const { slug } = data;
    if (!slug) return { success: false, views: 0 };

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
