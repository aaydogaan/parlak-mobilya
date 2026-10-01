interface EventLike {
  url: URL;
  req: { method?: string };
}

export default async function wpUploadsRedirect(
  event: EventLike,
  next: () => unknown | Promise<unknown>,
): Promise<unknown> {
  const path = event.url.pathname;
  if (path.startsWith("/wp-content/uploads/")) {
    const cleanPath = path.replace(/^\/wp-content\/uploads\//, "/");
    return new Response(null, {
      status: 301,
      headers: {
        Location: `https://cdn.parlakmobilyadekorasyon.com${cleanPath}${event.url.search}`,
      },
    });
  }
  return next();
}
