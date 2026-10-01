import { createFileRoute } from "@tanstack/react-router";
import { NotFoundView } from "@/components/pages/NotFoundView";

export const Route = createFileRoute("/404")({
  component: NotFoundView,
  head: () => ({
    meta: [
      { title: "404 Sayfa Bulunamadı - Parlak Mobilya ve Dekorasyon" },
      { name: "robots", content: "noindex, nofollow" },
    ],
  }),
});
