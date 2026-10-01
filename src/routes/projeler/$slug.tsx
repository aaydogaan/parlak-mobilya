import { createFileRoute, notFound } from "@tanstack/react-router";
import { getProjectBySlug } from "@/data/projects";
import { ProjectDetailView } from "@/components/pages/ProjectDetailView";

export const Route = createFileRoute("/projeler/$slug")({
  loader: ({ params }) => {
    const project = getProjectBySlug(params.slug);
    if (!project) throw notFound();
    return { project };
  },
  component: ProjectDetailPage,
  head: ({ loaderData, params }) => ({
    meta: [
      { title: loaderData?.project.metaTitle ?? "Proje Detayı — Parlak Mobilya" },
      { name: "description", content: loaderData?.project.metaDesc ?? "" },
      { property: "og:title", content: loaderData?.project.metaTitle ?? "Proje Detayı — Parlak Mobilya" },
      { property: "og:description", content: loaderData?.project.metaDesc ?? "" },
      { property: "og:image", content: loaderData?.project.heroImage ?? "" },
      { property: "og:url", content: `https://www.parlakmobilyadekorasyon.com/projeler/${params.slug}` },
    ],
    links: [
      { rel: "canonical", href: `https://www.parlakmobilyadekorasyon.com/projeler/${params.slug}` },
    ],
  }),
});

function ProjectDetailPage() {
  const { project } = Route.useLoaderData();
  return <ProjectDetailView project={project} />;
}
