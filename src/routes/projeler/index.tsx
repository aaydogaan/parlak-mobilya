import { useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { SiteLayout } from "@/components/layout/SiteLayout";
import { Reveal } from "@/components/motion/Reveal";
import { allProjectsList } from "@/data/projects";
import { ArrowRight, CheckCircle2 } from "lucide-react";

export const Route = createFileRoute("/projeler/")({
  component: ProjectsIndexPage,
  head: () => ({
    meta: [
      { title: "Projelerimiz - Parlak Mobilya ve Dekorasyon" },
      {
        name: "description",
        content:
          "Konya mobilya projeleri, özel ölçü mutfak dolapları, gardırop, vestiyer, TV ünitesi ve çocuk odası uygulamalarımızı inceleyin. Tamamladığımız gerçek projeleri keşfedin.",
      },
      { property: "og:title", content: "Projelerimiz - Parlak Mobilya ve Dekorasyon" },
      { property: "og:url", content: "https://www.parlakmobilyadekorasyon.com/projeler" },
    ],
    links: [
      { rel: "canonical", href: "https://www.parlakmobilyadekorasyon.com/projeler" },
    ],
  }),
});

function ProjectsIndexPage() {
  const [selectedCategory, setSelectedCategory] = useState("all");

  const categories = [
    { id: "all", label: "Tüm Projeler" },
    { id: "Mutfak Dolapları", label: "Mutfak Dolapları" },
    { id: "Yatak Odası & Gardırop", label: "Gardırop Modelleri" },
    { id: "Antre & Vestiyer", label: "Vestiyer Modelleri" },
    { id: "Salon & Yaşam Alanı", label: "TV Üniteleri" },
    { id: "Genç & Çocuk Odası", label: "Çocuk Odası" },
    { id: "Anahtar Teslim Yenileme", label: "Komple Ev Yenileme" },
  ];

  const filteredProjects =
    selectedCategory === "all"
      ? allProjectsList
      : allProjectsList.filter((p) => p.category === selectedCategory);

  return (
    <SiteLayout
      title="Tamamlanan Projelerimiz"
      subtitle="Konya genelinde 40 yılı aşkın süredir hayata geçirdiğimiz özel ölçü mutfak, gardırop, vestiyer ve komple dekorasyon projelerinden seçkiler."
      eyebrow="1984'ten Bugüne Konya'da Zanaat"
    >
      <section className="bg-white py-12 md:py-16">
        <div className="container-site">
          {/* Category Filter Pills */}
          <div className="flex flex-wrap items-center justify-center gap-2.5 pb-10">
            {categories.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id)}
                className={`rounded-full px-5 py-2.5 text-[14px] font-medium transition ${
                  selectedCategory === cat.id
                    ? "bg-brown text-white shadow-sm"
                    : "bg-[#f5f2eb] text-subtle hover:bg-black/10 hover:text-ink"
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>

          {/* Projects Grid */}
          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
            {filteredProjects.map((project, idx) => (
              <Reveal key={project.slug} delay={idx * 60}>
                <article className="group flex h-full flex-col overflow-hidden rounded-[24px] border border-black/10 bg-[#faf7f2] shadow-sm transition hover:-translate-y-1 hover:shadow-xl">
                  {/* Photo */}
                  <div className="relative aspect-[4/3] overflow-hidden bg-[#1a120c]">
                    <img
                      src={project.heroImage}
                      alt={project.title}
                      className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
                      loading="lazy"
                    />
                    <div className="absolute top-4 left-4">
                      <span className="rounded-full bg-white/90 backdrop-blur-md px-3 py-1 text-[11.5px] font-semibold text-ink shadow-sm uppercase tracking-wider">
                        {project.category}
                      </span>
                    </div>
                  </div>

                  {/* Body */}
                  <div className="flex flex-1 flex-col p-6 md:p-7">
                    <h3 className="font-display text-[22px] font-medium text-ink transition group-hover:opacity-80">
                      {project.title}
                    </h3>
                    <p className="mt-2.5 line-clamp-3 text-[14px] leading-relaxed text-subtle">
                      {project.metaDesc}
                    </p>

                    <div className="mt-4 space-y-1.5 border-t border-black/10 pt-4 text-[13px] text-ink/80">
                      <div className="flex items-center gap-1.5">
                        <CheckCircle2 className="h-3.5 w-3.5 text-ink flex-shrink-0" />
                        <span>Konya İçi Ücretsiz Keşif & Montaj</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <CheckCircle2 className="h-3.5 w-3.5 text-ink flex-shrink-0" />
                        <span>Kişiye ve Mekana Özel 3D Tasarım</span>
                      </div>
                    </div>

                    <div className="mt-auto pt-6">
                      <Link
                        to="/projeler/$slug"
                        params={{ slug: project.slug }}
                        className="inline-flex items-center gap-2 text-[14px] font-medium text-brown transition group-hover:text-ink group-hover:translate-x-1"
                      >
                        <span>Projeyi ve Galeriyi İncele</span>
                        <ArrowRight className="h-4 w-4" />
                      </Link>
                    </div>
                  </div>
                </article>
              </Reveal>
            ))}
          </div>
        </div>
      </section>
    </SiteLayout>
  );
}
