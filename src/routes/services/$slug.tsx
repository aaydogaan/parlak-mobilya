import { createFileRoute, redirect } from "@tanstack/react-router";

export const Route = createFileRoute("/services/$slug")({
  beforeLoad: ({ params }) => {
    throw redirect({
      to: "/projeler/$slug",
      params: { slug: params.slug },
      statusCode: 301,
    });
  },
  component: () => null,
});
