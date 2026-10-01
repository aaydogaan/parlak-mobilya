import { generateSitemapXml } from "../../src/lib/server/sitemap";

interface EventLike {
  url: URL;
  req: { method?: string; headers?: Headers };
}

export default async function sitemapMiddleware(
  event: EventLike,
  next: () => unknown | Promise<unknown>,
): Promise<unknown> {
  const path = event.url.pathname;
  if (path === "/sitemap.xml" || path === "/sitemap") {
    try {
      const xml = await generateSitemapXml();
      return new Response(xml, {
        status: 200,
        headers: {
          "Content-Type": "application/xml; charset=utf-8",
          "Cache-Control": "public, max-age=1800, s-maxage=3600",
        },
      });
    } catch (err) {
      console.error("[sitemap] Failed to generate sitemap in middleware:", err);
    }
  }
  return next();
}
