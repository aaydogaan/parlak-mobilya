import { createFileRoute } from "@tanstack/react-router";
import { LegalPageView } from "@/components/pages/LegalPageView";
import { legalPolicies } from "@/data/posts";

export const Route = createFileRoute("/kvkk")({
  component: KvkkPage,
  head: () => ({
    meta: [
      { title: legalPolicies.kvkk.metaTitle },
      { name: "description", content: legalPolicies.kvkk.metaDesc },
      { name: "robots", content: "noindex, nofollow" },
    ],
    links: [
      { rel: "canonical", href: "https://www.parlakmobilyadekorasyon.com/kvkk" },
    ],
  }),
});

function KvkkPage() {
  const policy = legalPolicies.kvkk;
  return (
    <LegalPageView
      title={policy.title}
      metaDesc={policy.metaDesc}
      contentHtml={policy.contentHtml}
    />
  );
}
