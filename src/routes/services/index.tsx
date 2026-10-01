import { createFileRoute, redirect } from "@tanstack/react-router";

export const Route = createFileRoute("/services/")({
  beforeLoad: () => {
    throw redirect({ to: "/hizmetler", statusCode: 301 });
  },
  component: () => null,
});

