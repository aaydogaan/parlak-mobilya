interface EventLike {
  url: URL;
  req: { method?: string; headers?: Headers | Record<string, string | string[] | undefined> };
}

function getHeader(
  headers: Headers | Record<string, string | string[] | undefined> | undefined,
  name: string,
): string | undefined {
  if (!headers) return undefined;
  if (typeof (headers as Headers).get === "function") {
    return (headers as Headers).get(name) ?? undefined;
  }
  const val = (headers as Record<string, string | string[] | undefined>)[name.toLowerCase()];
  return Array.isArray(val) ? val[0] : val;
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

  const rawHost =
    getHeader(event.req?.headers, "x-forwarded-host") ??
    getHeader(event.req?.headers, "host") ??
    url.host ??
    "";
  const host = rawHost.toLowerCase().split(":")[0];
  const isAdminSubdomain = host.startsWith("admin.");
  const isLocal = host === "localhost" || host === "127.0.0.1";

  // 1. If accessing /admin on the main domain (parlakmobilyadekorasyon.com or www.),
  // do not open the admin panel or redirect to dashboard: redirect directly to home (/)
  // The admin panel remains exclusively accessible via admin.parlakmobilyadekorasyon.com
  if (!isAdminSubdomain && !isLocal && (pathname === "/admin" || pathname.startsWith("/admin/"))) {
    return new Response(null, {
      status: 302,
      headers: {
        Location: "/",
        "Cache-Control": "no-store, no-cache, must-revalidate",
      },
    });
  }

  // 2. Immediately drop spam/hacked URLs with HTTP 410 Gone (Permanently Removed)
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

  // 3. Legacy WordPress post slug redirects (301 Permanent Redirect)
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

  // 4. Trailing slash normalization: /projeler/ -> /projeler, /hakkimizda/ -> /hakkimizda
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
