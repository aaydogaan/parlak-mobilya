import { createFileRoute, redirect } from "@tanstack/react-router";

export const Route = createFileRoute("/yeni-web-sitemiz-yayinda")({
  beforeLoad: () => {
    throw redirect({
      to: "/blog/$slug",
      params: { slug: "yeni-web-sitemiz-yayinda" },
      statusCode: 301,
    });
  },
  component: () => null,
});


