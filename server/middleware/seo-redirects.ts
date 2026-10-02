interface EventLike {
  url: URL;
  req: { method?: string; headers?: Headers };
}

/**
 * Checks if incoming request matches the old WordPress spam/injection pattern
 * (Japanese SEO hack query injection: ?item/..., ?item=..., /item/..., etc.)
 */
export function isSpamRequest(url: URL): boolean {
  const search = url.search.toLowerCase();
  const pathname = url.pathname.toLowerCase();

  // Query parameter spam: ?item/t7093125, ?item=..., ?item/..., &item=...
  if (
    search.includes("item/") ||
    search.startsWith("?item") ||
    search.includes("&item=") ||
    search.includes("?item=") ||
    /^\?item($|[/?=&])/i.test(search)
  ) {
    return true;
  }

  // Path spam: /item/..., /wp-admin, /wp-includes, xmlrpc.php, wp-login.php
  if (
    pathname.startsWith("/item/") ||
    pathname === "/item" ||
    pathname.startsWith("/wp-includes") ||
    pathname.startsWith("/wp-admin") ||
    pathname.includes("xmlrpc.php") ||
    pathname.includes("wp-login.php")
  ) {
    return true;
  }

  // Other common spam patterns found in infected WordPress sites
  if (search.startsWith("?shop/") || search.startsWith("?brand/")) {
    return true;
  }

  return false;
}

export default async function seoRedirectsMiddleware(
  event: EventLike,
  next: () => unknown | Promise<unknown>,
): Promise<unknown> {
  const method = (event.req?.method ?? "GET").toUpperCase();
  if (method !== "GET" && method !== "HEAD") {
    return next();
  }

  const url = event.url;
  const pathname = url.pathname;
  const search = url.search;

  // 1. Immediately drop spam/hacked URLs with HTTP 410 Gone (Permanently Removed)
  // Googlebot prioritizes 410 over 404 to rapidly purge dead URLs from the index.
  if (isSpamRequest(url)) {
    return new Response(
      '<!DOCTYPE html><html lang="tr"><head><meta charset="UTF-8"><title>410 Gone</title><meta name="robots" content="noindex, nofollow, noarchive"></head><body><h1>410 Gone</h1><p>Bu bağlantı kalıcı olarak silinmiştir ve mevcut değildir.</p></body></html>',
      {
        status: 410,
        statusText: "Gone",
        headers: {
          "Content-Type": "text/html; charset=utf-8",
          "X-Robots-Tag": "noindex, nofollow, noarchive",
          "Cache-Control": "public, max-age=604800, s-maxage=604800",
        },
      },
    );
  }

  // 2. Legacy WordPress post slug redirects (301 Permanent Redirect)
  const cleanPath = pathname.length > 1 ? pathname.replace(/\/+$/, "") : pathname;
  if (cleanPath === "/ozel-olcu-mobilya-yaptirmadan-once-dikkat-edilmesi-gerekenler") {
    return new Response(null, {
      status: 301,
      headers: {
        Location: `/blog/ozel-olcu-mobilya-yaptirmadan-once-dikkat-edilmesi-gerekenler${search}`,
        "Cache-Control": "public, max-age=31536000, immutable",
      },
    });
  }
  if (cleanPath === "/yeni-web-sitemiz-yayinda") {
    return new Response(null, {
      status: 301,
      headers: {
        Location: `/blog/yeni-web-sitemiz-yayinda${search}`,
        "Cache-Control": "public, max-age=31536000, immutable",
      },
    });
  }

  // 3. Trailing slash normalization: /projeler/ -> /projeler, /hakkimizda/ -> /hakkimizda
  // Ensures Googlebot consolidates link equity to the canonical non-trailing-slash URL.
  if (pathname.length > 1 && pathname.endsWith("/")) {
    return new Response(null, {
      status: 301,
      headers: {
        Location: `${cleanPath}${search}`,
        "Cache-Control": "public, max-age=31536000, immutable",
      },
    });
  }

  return next();
}
