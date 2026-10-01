import { createRootRoute, HeadContent, Outlet, Scripts } from "@tanstack/react-router";
import { AuthProvider } from "@/lib/auth/provider";
import { PreviewHostBridge } from "@/components/preview-host-bridge";
import { NotFoundView } from "@/components/pages/NotFoundView";
import { FloatingChatyWidget } from "@/components/common/FloatingChatyWidget";
import appCss from "../styles.css?url";

const localBusinessSchema = {
  "@context": "https://schema.org",
  "@type": "FurnitureStore",
  name: "Parlak Mobilya ve Dekorasyon",
  image: "https://cdn.parlakmobilyadekorasyon.com/wp-content/uploads/2026/07/konya-parlak-mobilya-dekorasyon-gardrop-45-scaled.webp",
  logo: "https://www.parlakmobilyadekorasyon.com/images/logo.png",
  telephone: "+905071721196",
  email: "info@parlakmobilyadekorasyon.com",
  url: "https://www.parlakmobilyadekorasyon.com",
  foundingDate: "1984",
  priceRange: "₺₺",
  founder: {
    "@type": "Person",
    name: "Ahmet Parlak",
  },
  address: {
    "@type": "PostalAddress",
    streetAddress: "Horozluhan Mah. Saraycık Sok. No:50",
    addressLocality: "Selçuklu",
    addressRegion: "Konya",
    postalCode: "42100",
    addressCountry: "TR",
  },
  geo: {
    "@type": "GeoCoordinates",
    latitude: 37.942,
    longitude: 32.518,
  },
  areaServed: [
    { "@type": "City", name: "Konya" },
    { "@type": "AdministrativeArea", name: "Selçuklu" },
    { "@type": "AdministrativeArea", name: "Meram" },
    { "@type": "AdministrativeArea", name: "Karatay" },
  ],
  sameAs: [
    "https://www.instagram.com/parlakmobilyadekorasyon",
    "https://www.facebook.com/",
  ],
  knowsAbout: [
    "Mutfak Dolabı",
    "Özel Ölçü Gardırop",
    "Vestiyer Modelleri",
    "TV Ünitesi",
    "Çocuk Odası",
    "Komple Ev Yenileme",
    "Ahşap Mobilya İmalatı",
  ],
  openingHoursSpecification: [
    {
      "@type": "OpeningHoursSpecification",
      dayOfWeek: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"],
      opens: "08:30",
      closes: "19:00",
    },
  ],
};

export const Route = createRootRoute({
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1" },
      { title: "Parlak Mobilya ve Dekorasyon - Konya Özel Ölçü Mobilya & Mutfak Dolabı" },
      {
        name: "description",
        content:
          "Konya Parlak Mobilya ve Dekorasyon; 1984'ten bu yana 40 yılı aşkın tecrübeyle özel ölçü mutfak dolabı, gardırop, vestiyer, TV ünitesi ve ev dekorasyon çözümleri sunar.",
      },
      { name: "theme-color", content: "#0d0100" },
      { name: "geo.region", content: "TR-42" },
      { name: "geo.placename", content: "Konya" },
      { name: "geo.position", content: "37.942;32.518" },
      { name: "ICBM", content: "37.942, 32.518" },
      { property: "og:type", content: "website" },
      { property: "og:site_name", content: "Parlak Mobilya ve Dekorasyon" },
      { property: "og:locale", content: "tr_TR" },
      { property: "og:title", content: "Parlak Mobilya ve Dekorasyon - Konya Özel Ölçü Mobilya & Mutfak Dolabı" },
      {
        property: "og:description",
        content:
          "Konya'da 1984'ten bu yana 40 yılı aşkın tecrübeyle özel ölçü mutfak dolabı, gardırop, vestiyer ve ahşap mobilya imalatı.",
      },
      {
        property: "og:image",
        content: "https://cdn.parlakmobilyadekorasyon.com/wp-content/uploads/2026/07/konya-parlak-mobilya-dekorasyon-gardrop-45-scaled.webp",
      },
      { property: "og:url", content: "https://www.parlakmobilyadekorasyon.com" },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "twitter:title", content: "Parlak Mobilya ve Dekorasyon - Konya Özel Ölçü Mobilya" },
      {
        name: "twitter:description",
        content: "Konya'da 40 yıllık tecrübeyle özel ölçü mutfak dolabı, gardırop ve ev mobilyaları imalatı.",
      },
      {
        name: "twitter:image",
        content: "https://cdn.parlakmobilyadekorasyon.com/wp-content/uploads/2026/07/konya-parlak-mobilya-dekorasyon-gardrop-45-scaled.webp",
      },
    ],
    links: [
      { rel: "icon", type: "image/png", href: "/favicon.png" },
      { rel: "apple-touch-icon", href: "/favicon.png" },
      { rel: "stylesheet", href: appCss },
      { rel: "manifest", href: "/__grok/manifest.webmanifest" },
      {
        rel: "stylesheet",
        href: "https://fonts.googleapis.com/css2?family=Inclusive+Sans:ital,wght@0,400..700;1,400..700&family=Lexend:wght@300;400;500;600;700;800&display=swap",
      },
    ],
    scripts: [
      {
        type: "application/ld+json",
        children: JSON.stringify(localBusinessSchema),
      },
    ],
  }),
  component: RootDocument,
  notFoundComponent: NotFoundView,
});

function RootDocument() {
  return (
    <html lang="tr" className="antialiased" suppressHydrationWarning>
      <head>
        <HeadContent />
      </head>
      <body>
        <PreviewHostBridge />
        <AuthProvider>
          <Outlet />
          <FloatingChatyWidget />
        </AuthProvider>
        <Scripts />
      </body>
    </html>
  );
}
