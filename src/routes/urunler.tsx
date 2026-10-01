import { createFileRoute } from "@tanstack/react-router";
import { ServicesPage } from "./services/index";

export const Route = createFileRoute("/urunler")({
  component: UrunlerPage,
  head: () => ({
    meta: [
      { title: "Ürünler & Modeller - Parlak Mobilya ve Dekorasyon" },
      {
        name: "description",
        content:
          "Konya mutfak dolapları, gardıroplar, vestiyerler ve özel ölçü ahşap mobilya modellerimizi inceleyin.",
      },
      { property: "og:title", content: "Ürünler & Modeller - Parlak Mobilya ve Dekorasyon" },
      { property: "og:url", content: "https://www.parlakmobilyadekorasyon.com/hizmetler" },
    ],
    links: [
      { rel: "canonical", href: "https://www.parlakmobilyadekorasyon.com/hizmetler" },
    ],
  }),
});

function UrunlerPage() {
  return <ServicesPage />;
}
