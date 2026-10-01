import { createFileRoute } from "@tanstack/react-router";
import { SiteLayout } from "@/components/layout/SiteLayout";
import { Hero } from "@/components/home/Hero";
import { FeatureRow } from "@/components/sections/FeatureRow";
import { AboutSplit } from "@/components/sections/AboutSplit";
import { Stats } from "@/components/home/Stats";
import { Ideas } from "@/components/home/Ideas";
import { HomeServices } from "@/components/home/HomeServices";
import { HowItWorks } from "@/components/sections/HowItWorks";
import { HomeBlog } from "@/components/home/HomeBlog";

export const Route = createFileRoute("/")({
  component: Home,
  head: () => ({
    meta: [
      { title: "Parlak Mobilya ve Dekorasyon - Konya Özel Ölçü Mobilya & Mutfak Dolabı" },
      {
        name: "description",
        content:
          "Konya Parlak Mobilya ve Dekorasyon; 1984'ten bu yana 40 yılı aşkın tecrübeyle özel ölçü mutfak dolabı, gardırop, vestiyer, TV ünitesi ve dekorasyon çözümleri sunar.",
      },
      { property: "og:title", content: "Parlak Mobilya ve Dekorasyon - Konya Özel Ölçü Mobilya & Mutfak Dolabı" },
      { property: "og:url", content: "https://www.parlakmobilyadekorasyon.com/" },
    ],
    links: [
      { rel: "canonical", href: "https://www.parlakmobilyadekorasyon.com/" },
    ],
  }),
});

function Home() {
  return (
    <SiteLayout variant="transparent">
      <Hero />
      <FeatureRow />
      <AboutSplit />
      <Stats />
      <Ideas />
      <HomeServices />
      <HowItWorks showArrows={true} />
      <HomeBlog />
    </SiteLayout>
  );
}
