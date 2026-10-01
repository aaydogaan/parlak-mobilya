import { createFileRoute, redirect } from "@tanstack/react-router";

export const Route = createFileRoute(
  "/ozel-olcu-mobilya-yaptirmadan-once-dikkat-edilmesi-gerekenler"
)({
  beforeLoad: () => {
    throw redirect({
      to: "/blog/$slug",
      params: {
        slug: "ozel-olcu-mobilya-yaptirmadan-once-dikkat-edilmesi-gerekenler",
      },
      statusCode: 301,
    });
  },
  component: () => null,
});


