import { createFileRoute } from "@tanstack/react-router";
import { LegalPageView } from "@/components/pages/LegalPageView";
import { legalPolicies } from "@/data/posts";

export const Route = createFileRoute("/gizlilik-politikasi")({
  component: PrivacyPolicyPage,
  head: () => ({
    meta: [
      { title: legalPolicies["gizlilik-politikasi"].metaTitle },
      { name: "description", content: legalPolicies["gizlilik-politikasi"].metaDesc },
      { name: "robots", content: "noindex, nofollow" },
    ],
    links: [
      { rel: "canonical", href: "https://www.parlakmobilyadekorasyon.com/gizlilik-politikasi" },
    ],
  }),
});

function PrivacyPolicyPage() {
  const policy = legalPolicies["gizlilik-politikasi"];
  return (
    <LegalPageView
      title={policy.title}
      metaDesc={policy.metaDesc}
      contentHtml={policy.contentHtml}
    />
  );
}
