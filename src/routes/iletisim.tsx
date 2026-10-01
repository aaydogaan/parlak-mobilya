import { createFileRoute } from "@tanstack/react-router";
import { ContactPage } from "./contact";

export const Route = createFileRoute("/iletisim")({
  component: IletisimPage,
  head: () => ({
    meta: [
      { title: "İletişim - Parlak Mobilya ve Dekorasyon" },
      {
        name: "description",
        content:
          "Konya merkez, Selçuklu, Meram ve Karatay'da özel ölçü mobilya çözümleri için Parlak Mobilya ve Dekorasyon ile iletişime geçin. Ücretsiz keşif ve fiyat teklifi alın.",
      },
      { property: "og:title", content: "İletişim - Parlak Mobilya ve Dekorasyon" },
      { property: "og:url", content: "https://www.parlakmobilyadekorasyon.com/iletisim" },
    ],
    links: [
      { rel: "canonical", href: "https://www.parlakmobilyadekorasyon.com/iletisim" },
    ],
  }),
});

function IletisimPage() {
  return <ContactPage />;
}
