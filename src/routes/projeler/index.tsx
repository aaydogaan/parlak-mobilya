import { useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { SiteLayout } from "@/components/layout/SiteLayout";
import { Reveal } from "@/components/motion/Reveal";
import { allProjectsList } from "@/data/projects";
import { ArrowRight } from "lucide-react";

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
          {/* Kategori Filtre */}
          <div className="flex flex-wrap items-center justify-center gap-2 pb-12">
            {categories.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id)}
                className={`rounded-full px-5 py-2.5 text-[14px] font-medium font-['Lexend'] transition-all cursor-pointer ${
                  selectedCategory === cat.id
                    ? "bg-[#0d0100] text-white shadow-md"
                    : "bg-[#f5f2eb] text-[#524e4e] hover:bg-black/10 hover:text-[#0d0100]"
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>

          {/* Proje Kartları (2'li Mimari Portfolyo Dizilimi) */}
          <div className="grid gap-8 md:grid-cols-2 lg:gap-10">
            {filteredProjects.map((project, idx) => (
              <Reveal key={project.slug} delay={idx * 60}>
                <Link
                  to="/projeler/$slug"
                  params={{ slug: project.slug }}
                  className="group flex h-full flex-col overflow-hidden rounded-[24px] border border-black/[0.08] bg-[#fbf9f5] shadow-[0_4px_24px_rgba(0,0,0,0.03)] transition-all duration-500 hover:-translate-y-1.5 hover:shadow-[0_20px_45px_rgba(0,0,0,0.08)] hover:border-black/15 cursor-pointer"
                >
                  {/* Görsel */}
                  <div className="relative aspect-[16/10] overflow-hidden bg-[#1a120c]">
                    <img
                      src={project.heroImage}
                      alt={project.title}
                      className="h-full w-full object-cover transition-transform duration-700 ease-out group-hover:scale-105"
                      loading="lazy"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
                    <div className="absolute top-4 left-4">
                      <span className="rounded-full bg-white/95 backdrop-blur-md px-3.5 py-1.5 text-[11.5px] font-medium text-[#0d0100] shadow-sm uppercase tracking-wider font-['Lexend']">
                        {project.category}
                      </span>
                    </div>
                  </div>

                  {/* İçerik */}
                  <div className="flex flex-1 flex-col p-6 sm:p-8">
                    <div className="flex items-start justify-between gap-4">
                      <h3 className="font-['Lexend'] text-[20px] sm:text-[23px] font-semibold text-[#0d0100] group-hover:text-amber-900 transition-colors leading-snug">
                        {project.title}
                      </h3>
                      <div className="mt-1 size-9 rounded-full bg-white border border-black/8 flex items-center justify-center shrink-0 group-hover:bg-[#0d0100] group-hover:text-white transition-all duration-300 shadow-sm">
                        <ArrowRight className="size-4 transition-transform duration-300 group-hover:translate-x-0.5" />
                      </div>
                    </div>

                    <p className="mt-3 font-['Lexend'] font-light text-[14px] leading-relaxed text-[#524e4e] line-clamp-2">
                      {project.metaDesc}
                    </p>

                    <div className="mt-auto pt-6 flex items-center gap-2 font-['Lexend'] text-[13.5px] font-medium text-[#0d0100] group-hover:text-amber-900 transition-colors">
                      <span className="underline underline-offset-4 decoration-black/20 group-hover:decoration-amber-900">
                        Proje Detaylarını & Galeriyi İncele
                      </span>
                    </div>
                  </div>
                </Link>
              </Reveal>
            ))}
          </div>
        </div>
      </section>
    </SiteLayout>
  );
}
