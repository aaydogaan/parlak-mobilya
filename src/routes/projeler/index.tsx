import { useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { SiteLayout } from "@/components/layout/SiteLayout";
import { Reveal } from "@/components/motion/Reveal";
import { allProjectsList } from "@/data/projects";
import { ArrowRight, Camera, Sparkles } from "lucide-react";

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
          <div className="flex flex-wrap items-center justify-center gap-2 pb-10">
            {categories.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id)}
                className={`rounded-full px-5 py-2.5 text-[14px] font-medium font-['Lexend'] transition-all cursor-pointer ${
                  selectedCategory === cat.id
                    ? "bg-[#0d0100] text-white shadow-md scale-102"
                    : "bg-[#f5f2eb] text-[#524e4e] hover:bg-black/10 hover:text-[#0d0100]"
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>

          {/* Projects Grid: Kurumsal, Usta İşi Mimari Kartlar (Tüm Kart Tıklanabilir) */}
          <div className="grid gap-7 md:grid-cols-2 lg:grid-cols-3">
            {filteredProjects.map((project, idx) => (
              <Reveal key={project.slug} delay={idx * 50}>
                <Link
                  to="/projeler/$slug"
                  params={{ slug: project.slug }}
                  className="group flex h-full flex-col overflow-hidden rounded-[22px] border border-black/8 bg-white shadow-[0_4px_20px_rgba(0,0,0,0.04)] transition-all duration-300 hover:-translate-y-1.5 hover:shadow-[0_16px_36px_rgba(0,0,0,0.12)] hover:border-black/20 cursor-pointer"
                >
                  {/* Görsel Alanı */}
                  <div className="relative aspect-[16/11] overflow-hidden bg-[#1a120c]">
                    <img
                      src={project.heroImage}
                      alt={project.title}
                      className="h-full w-full object-cover transition-transform duration-700 ease-out group-hover:scale-106"
                      loading="lazy"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/10 to-transparent pointer-events-none" />

                    {/* Kategori Rozeti */}
                    <div className="absolute top-4 left-4">
                      <span className="rounded-full bg-white/95 backdrop-blur-md px-3.5 py-1 text-[11px] font-semibold text-[#0d0100] shadow-sm uppercase tracking-wider font-['Lexend']">
                        {project.category}
                      </span>
                    </div>

                    {/* Uygulama Fotoğraf Sayısı */}
                    <div className="absolute top-4 right-4">
                      <div className="rounded-full bg-black/65 backdrop-blur-md px-3 py-1 text-[11.5px] font-medium text-white/95 border border-white/15 flex items-center gap-1.5 shadow-sm font-['Lexend']">
                        <Camera className="size-3 text-amber-400" />
                        <span>{project.gallery?.length || 10}+ Fotoğraf</span>
                      </div>
                    </div>
                  </div>

                  {/* Kart İçeriği */}
                  <div className="flex flex-1 flex-col p-6 sm:p-7">
                    <h3 className="font-['Lexend'] text-[20px] font-semibold text-[#0d0100] group-hover:text-amber-900 transition-colors leading-[1.3] line-clamp-1">
                      {project.title}
                    </h3>

                    <p className="mt-2 font-['Lexend'] font-light text-[13.5px] leading-relaxed text-[#524e4e] line-clamp-2">
                      {project.metaDesc}
                    </p>

                    {/* Atölye ve İmalat Özellikleri */}
                    <div className="mt-4 pt-3.5 border-t border-black/5 flex flex-wrap gap-1.5">
                      <span className="text-[11.5px] font-medium text-[#524e4e] bg-[#f8f6f2] border border-black/5 px-2.5 py-1 rounded-md">
                        Özel Ölçü Tasarım
                      </span>
                      <span className="text-[11.5px] font-medium text-[#524e4e] bg-[#f8f6f2] border border-black/5 px-2.5 py-1 rounded-md">
                        Atölye Montajı
                      </span>
                      <span className="text-[11.5px] font-medium text-[#524e4e] bg-[#f8f6f2] border border-black/5 px-2.5 py-1 rounded-md">
                        40 Yıllık Ustalık
                      </span>
                    </div>

                    {/* Alt CTA Satırı */}
                    <div className="mt-auto pt-5 border-t border-black/5 flex items-center justify-between">
                      <span className="font-['Lexend'] text-[13.5px] font-semibold text-[#0d0100] group-hover:text-amber-900 transition-colors">
                        Projeyi & Galeriyi İncele
                      </span>
                      <div className="size-8 rounded-full bg-[#faf7f2] group-hover:bg-amber-900 group-hover:text-white transition-all duration-300 flex items-center justify-center shrink-0">
                        <ArrowRight className="size-4 transition-transform duration-300 group-hover:translate-x-0.5 text-inherit" />
                      </div>
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
