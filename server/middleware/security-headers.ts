interface EventLike {
  url: URL;
  req: { method?: string; headers?: Headers };
}

export default async function securityHeadersMiddleware(
  event: EventLike,
  next: () => unknown | Promise<unknown>,
): Promise<unknown> {
  const result = await next();
  if (result instanceof Response) {
    const headers = new Headers(result.headers);
    headers.set("X-Content-Type-Options", "nosniff");
    headers.set("X-Frame-Options", "DENY");
    headers.set("Referrer-Policy", "strict-origin-when-cross-origin");
    headers.set("Permissions-Policy", "camera=(), microphone=(), geolocation=(), payment=()");
    headers.set("Strict-Transport-Security", "max-age=63072000; includeSubDomains; preload");

    const cspDirectives = [
      "default-src 'self'",
      "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://challenges.cloudflare.com https://grok.com",
      "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
      "font-src 'self' https://fonts.gstatic.com data:",
      "img-src 'self' data: blob: https://cdn.parlakmobilyadekorasyon.com https://pub-*.r2.dev https://*.r2.cloudflarestorage.com https://challenges.cloudflare.com",
      "connect-src 'self' https://challenges.cloudflare.com https://cdn.parlakmobilyadekorasyon.com https://*.r2.cloudflarestorage.com",
      "frame-src 'self' https://challenges.cloudflare.com",
      "frame-ancestors 'none'",
      "base-uri 'self'",
      "form-action 'self'",
    ];

    headers.set("Content-Security-Policy", cspDirectives.join("; "));

    return new Response(result.body, {
      status: result.status,
      statusText: result.statusText,
      headers,
    });
  }
  return result;
}
