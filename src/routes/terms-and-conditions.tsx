import { createFileRoute } from "@tanstack/react-router";
import { SiteLayout } from "@/components/layout/SiteLayout";
import { LegalAccordion } from "@/components/sections/LegalAccordion";
import { legalIntro, termsSections } from "@/data/site";

export const Route = createFileRoute("/terms-and-conditions")({
  component: TermsPage,
  head: () => ({
    meta: [
      { title: "Kullanım Şartları - Parlak Mobilya ve Dekorasyon" },
      { name: "robots", content: "noindex, nofollow" },
    ],
  }),
});

function TermsPage() {
  return (
    <SiteLayout title="Terms & conditions">
      <section className="bg-white py-16 md:py-20">
        <div className="container-site">
          <LegalAccordion items={termsSections} intro={legalIntro} />
        </div>
      </section>
    </SiteLayout>
  );
}
