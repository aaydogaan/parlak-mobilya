import { createFileRoute } from "@tanstack/react-router";
import { AboutPageView } from "@/components/pages/AboutPageView";

export const Route = createFileRoute("/about")({
  component: AboutPageView,
  head: () => ({
    meta: [
      { title: "Hakkımızda - Parlak Mobilya ve Dekorasyon | 1984'ten Bugüne" },
      {
        name: "description",
        content:
          "1984 yılında Konya'da Ahmet Parlak tarafından temelleri atılan Parlak Mobilya, 40 yılı aşkın marangozluk zanaatını modern 3D mimari tasarımla birleştiriyor.",
      },
      { property: "og:title", content: "Hakkımızda - Parlak Mobilya ve Dekorasyon" },
      { property: "og:url", content: "https://www.parlakmobilyadekorasyon.com/hakkimizda" },
    ],
    links: [
      { rel: "canonical", href: "https://www.parlakmobilyadekorasyon.com/hakkimizda" },
    ],
  }),
});
