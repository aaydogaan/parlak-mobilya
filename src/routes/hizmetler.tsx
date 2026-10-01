import { createFileRoute } from "@tanstack/react-router";
import { ServicesPageView } from "@/components/pages/ServicesPageView";

export const Route = createFileRoute("/hizmetler")({
  component: HizmetlerPage,
  head: () => ({
    meta: [
      { title: "Hizmetlerimiz - Parlak Mobilya ve Dekorasyon" },
      {
        name: "description",
        content:
          "Konya mobilya hizmetleri kapsamında özel ölçü mutfak dolapları, gardırop, vestiyer, TV ünitesi, çocuk odası ve komple ev yenileme çözümlerini Parlak Mobilya ve Dekorasyon ile keşfedin.",
      },
      { property: "og:title", content: "Hizmetlerimiz - Parlak Mobilya ve Dekorasyon" },
      { property: "og:url", content: "https://www.parlakmobilyadekorasyon.com/hizmetler" },
    ],
    links: [
      { rel: "canonical", href: "https://www.parlakmobilyadekorasyon.com/hizmetler" },
    ],
  }),
});

function HizmetlerPage() {
  return <ServicesPageView />;
}

