import { createFileRoute } from "@tanstack/react-router";
import { LegalPageView } from "@/components/pages/LegalPageView";
import { legalPolicies } from "@/data/posts";

export const Route = createFileRoute("/cerez-politikasi")({
  component: CookiePolicyPage,
  head: () => ({
    meta: [
      { title: legalPolicies["cerez-politikasi"].metaTitle },
      { name: "description", content: legalPolicies["cerez-politikasi"].metaDesc },
      { name: "robots", content: "noindex, nofollow" },
    ],
    links: [
      { rel: "canonical", href: "https://www.parlakmobilyadekorasyon.com/cerez-politikasi" },
    ],
  }),
});

function CookiePolicyPage() {
  const policy = legalPolicies["cerez-politikasi"];
  return (
    <LegalPageView
      title={policy.title}
      metaDesc={policy.metaDesc}
      contentHtml={policy.contentHtml}
    />
  );
}
