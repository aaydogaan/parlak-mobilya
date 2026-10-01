import { createFileRoute } from "@tanstack/react-router";
import { SiteLayout } from "@/components/layout/SiteLayout";
import { LegalAccordion } from "@/components/sections/LegalAccordion";
import { legalIntro, privacySections } from "@/data/site";

export const Route = createFileRoute("/privacy-policy")({
  component: PrivacyPage,
  head: () => ({
    meta: [
      { title: "Gizlilik Politikası - Parlak Mobilya ve Dekorasyon" },
      { name: "robots", content: "noindex, nofollow" },
    ],
  }),
});

function PrivacyPage() {
  return (
    <SiteLayout title="Privacy Policy">
      <section className="bg-white py-16 md:py-20">
        <div className="container-site">
          <LegalAccordion items={privacySections} intro={legalIntro} />
        </div>
      </section>
    </SiteLayout>
  );
}
