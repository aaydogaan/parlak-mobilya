import { createFileRoute } from "@tanstack/react-router";
import { AboutPage } from "./about";

export const Route = createFileRoute("/hakkimizda")({
  component: HakkimizdaPage,
  head: () => ({
    meta: [
      { title: "Hakkımızda - Parlak Mobilya ve Dekorasyon" },
      {
        name: "description",
        content:
          "Konya mobilya sektöründe 40 yılı aşkın deneyime sahip Parlak Mobilya ve Dekorasyon'u tanıyın. Özel ölçü mutfak dolapları, gardırop, vestiyer ve TV ünitesi üretim süreçlerimizi inceleyin.",
      },
      { property: "og:title", content: "Hakkımızda - Parlak Mobilya ve Dekorasyon" },
      { property: "og:url", content: "https://www.parlakmobilyadekorasyon.com/hakkimizda" },
    ],
    links: [
      { rel: "canonical", href: "https://www.parlakmobilyadekorasyon.com/hakkimizda" },
    ],
  }),
});

function HakkimizdaPage() {
  return <AboutPage />;
}
