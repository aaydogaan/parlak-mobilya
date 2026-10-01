import { useState, useMemo } from "react";
import { Link } from "@tanstack/react-router";
import { SiteLayout } from "@/components/layout/SiteLayout";
import { QuoteForm } from "@/components/sections/QuoteForm";
import { Reveal } from "@/components/motion/Reveal";
import { site } from "@/data/site";
import type { ProjectDetail } from "@/data/projects";
import { Phone, MessageCircle, ChevronDown, CheckCircle2, X } from "lucide-react";

interface Props {
  project: ProjectDetail;
}

export function ProjectDetailView({ project }: Props) {
  const [activeFaq, setActiveFaq] = useState<number | null>(0);
  const [lightboxImg, setLightboxImg] = useState<string | null>(null);

  // Karışık görsel sıralaması (kullanıcı isteği)
  const shuffledGallery = useMemo(() => {
    const list = [...project.gallery];
    // Deterministic pseudo-random shuffle
    for (let i = list.length - 1; i > 0; i--) {
      const j = Math.floor(
        (Math.abs(Math.sin(i * 127 + project.slug.length * 31)) % 1) * (i + 1)
      );
      [list[i], list[j]] = [list[j], list[i]];
    }
    return list;
  }, [project.gallery, project.slug]);

  const serviceSchema = {
    "@context": "https://schema.org",
    "@type": "Service",
    name: project.title,
    description: project.metaDesc,
    provider: {
      "@type": "LocalBusiness",
      name: "Parlak Mobilya ve Dekorasyon",
      telephone: "+905071721196",
      image: project.heroImage.startsWith("http") ? project.heroImage : `https://www.parlakmobilyadekorasyon.com${project.heroImage}`,
      address: {
        "@type": "PostalAddress",
        streetAddress: "Horozluhan Mah. Saraycık Sok. No:50",
        addressLocality: "Selçuklu",
        addressRegion: "Konya",
        addressCountry: "TR",
      },
    },
    areaServed: {
      "@type": "City",
      name: "Konya",
    },
    serviceType: project.category,
  };

  const breadcrumbSchema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      {
        "@type": "ListItem",
        position: 1,
        name: "Ana Sayfa",
        item: "https://www.parlakmobilyadekorasyon.com/",
      },
      {
        "@type": "ListItem",
        position: 2,
        name: "Projelerimiz",
        item: "https://www.parlakmobilyadekorasyon.com/projeler",
      },
      {
        "@type": "ListItem",
        position: 3,
        name: project.title,
        item: `https://www.parlakmobilyadekorasyon.com/projeler/${project.slug}`,
      },
    ],
  };

  return (
    <SiteLayout
      title={project.title}
      subtitle={project.metaDesc}
      eyebrow={`Konya Özel Ölçü İmalat — ${project.category}`}
    >
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(serviceSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
      />
      {/* Breadcrumb (Temiz, telefonsuz ve wp danışmasız) */}
      <section className="border-b border-black/5 bg-[#faf7f2] py-4">
        <div className="container-site text-[13.5px] text-subtle">
          <nav className="flex items-center gap-2">
            <Link to="/" className="hover:text-ink transition">Ana Sayfa</Link>
            <span>/</span>
            <Link to="/projeler" className="hover:text-ink transition">Projelerimiz</Link>
            <span>/</span>
            <span className="font-medium text-ink">{project.title}</span>
          </nav>
        </div>
      </section>

      {/* Hero Showcase & Specifications */}
      <section className="bg-white py-10 md:py-14">
        <div className="container-site">
          <div className="grid gap-10 lg:grid-cols-[1.1fr_0.9fr] lg:gap-14 items-start">
            {/* Main Featured Photo */}
            <Reveal>
              <div className="group relative overflow-hidden rounded-[24px] bg-[#1a120c] shadow-xl">
                <img
                  src={project.heroImage}
                  alt={project.title}
                  className="aspect-[4/3] w-full object-cover transition-transform duration-700 group-hover:scale-105"
                  loading="eager"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-80" />
                <div className="absolute bottom-6 left-6 right-6 flex items-end justify-between">
                  <div className="text-white">
                    <span className="inline-block rounded-full bg-white/90 px-3 py-1 text-[12px] font-semibold text-ink uppercase tracking-wider">
                      {project.category}
                    </span>
                    <h3 className="mt-2 text-[20px] font-medium font-display leading-snug">
                      Konya Atölye İmalatı
                    </h3>
                  </div>
                  <span className="rounded-full bg-white/20 backdrop-blur-md px-3.5 py-1.5 text-[12.5px] font-medium text-white">
                    40 Yıllık Tecrübe
                  </span>
                </div>
              </div>
            </Reveal>

            {/* Specifications Card */}
            <Reveal delay={100}>
              <div className="rounded-[24px] border border-black/10 bg-[#faf7f2] p-7 md:p-9 shadow-sm">
                <span className="text-[13px] font-bold uppercase tracking-wider text-muted">
                  Teknik Özellikler & Standartlar
                </span>
                <h3 className="mt-2 text-[24px] font-display font-medium text-ink md:text-[28px]">
                  Üretim & Malzeme Standartlarımız
                </h3>
                <p className="mt-2 text-[14.5px] text-subtle leading-relaxed">
                  Tüm ürünlerimizde kanserojen madde içermeyen E1 sertifikalı malzemeler ve dünya standardında menteşe/ray sistemleri kullanılmaktadır.
                </p>

                <div className="mt-6 divide-y divide-black/10 border-t border-b border-black/10">
                  {Object.entries(project.specs).map(([key, val]) => (
                    <div key={key} className="py-3.5 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1 text-[14px]">
                      <span className="font-medium text-ink/80 flex items-center gap-2">
                        <CheckCircle2 className="h-4 w-4 text-ink flex-shrink-0" />
                        {key}
                      </span>
                      <span className="font-semibold text-ink text-left sm:text-right">{val}</span>
                    </div>
                  ))}
                </div>

                <div className="mt-7 flex flex-wrap items-center gap-3">
                  <a
                    href={`tel:${site.phoneRaw}`}
                    className="inline-flex items-center justify-center gap-2 rounded-full bg-ink px-6 py-3 text-[14.5px] font-medium text-white shadow-md hover:bg-black transition"
                  >
                    <Phone className="h-4 w-4 text-white" />
                    <span>Hemen Fiyat Al: {site.phone}</span>
                  </a>
                  <a
                    href={site.whatsapp}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center justify-center gap-2 rounded-full bg-[#25D366] px-5 py-3 text-[14.5px] font-medium text-white shadow-md hover:brightness-110 transition"
                  >
                    <MessageCircle className="h-4 w-4" />
                    <span>WhatsApp</span>
                  </a>
                </div>
              </div>
            </Reveal>
          </div>
        </div>
      </section>

      {/* Rich Content Article & Quote Form */}
      <section className="bg-white py-10 md:py-16 border-t border-black/5">
        <div className="container-site grid items-start gap-12 lg:grid-cols-[1.2fr_0.8fr] lg:gap-16">
          {/* Article & Details */}
          <div>
            <Reveal>
              <h2 className="font-display text-[28px] font-medium tracking-[-0.03em] text-ink md:text-[34px]">
                {project.title} Hakkında Detaylar
              </h2>
              <div className="mt-6 space-y-5 text-[16px] leading-relaxed text-subtle">
                {project.paragraphs.slice(0, 8).map((p, i) => (
                  <p key={i}>{p}</p>
                ))}
              </div>
            </Reveal>

            {project.headings.length > 1 && (
              <div className="mt-12 space-y-10">
                {project.headings.slice(1, 4).map((h, idx) => (
                  <Reveal key={h} delay={idx * 60}>
                    <h3 className="font-display text-[22px] font-medium text-ink md:text-[26px]">
                      {h}
                    </h3>
                    <p className="mt-3 text-[15.5px] leading-relaxed text-subtle">
                      {project.paragraphs[8 + idx] ||
                        `Konya ve çevresinde ${h.toLowerCase()} uygulamalarında 40 yıllık tecrübemizle mekanınıza en uygun mimari tasarımı ve malzeme kalitesini bir araya getiriyoruz.`}
                    </p>
                  </Reveal>
                ))}
              </div>
            )}
          </div>

          {/* Sticky Quote Form */}
          <div className="lg:sticky lg:top-28">
            <Reveal delay={120}>
              <QuoteForm compact defaultService={project.slug} />
            </Reveal>
          </div>
        </div>
      </section>

      {/* Karışık Gerçek Proje Galerisi */}
      {shuffledGallery.length > 0 && (
        <section className="bg-[#faf7f2] py-14 md:py-20 border-t border-black/5">
          <div className="container-site">
            <div className="max-w-[700px]">
              <h2 className="font-display text-[30px] font-medium tracking-[-0.04em] text-ink md:text-[38px]">
                Konya'da Tamamlanan Gerçek Uygulamalarımız
              </h2>
              <p className="mt-3 text-[15.5px] text-subtle leading-relaxed">
                Tüm görseller Konya merkez, Selçuklu, Meram ve Karatay'da Ahmet Usta ve ekibimiz tarafından bizzat üretilip monte edilen gerçek projelerimize aittir.
              </p>
            </div>

            <div className="mt-10 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4 md:gap-5">
              {shuffledGallery.map((img, idx) => (
                <div
                  key={idx}
                  onClick={() => setLightboxImg(img)}
                  className="group relative cursor-pointer overflow-hidden rounded-[18px] bg-[#1a120c] aspect-square shadow-sm hover:shadow-md transition"
                >
                  <img
                    src={img}
                    alt={`${project.title} Konya uygulama ${idx + 1}`}
                    className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
                    loading="lazy"
                  />
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    <span className="rounded-full bg-white/90 px-3.5 py-1.5 text-[12px] font-semibold text-black shadow">
                      Büyüt
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Lightbox Modal */}
      {lightboxImg && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 p-4 backdrop-blur-sm"
          onClick={() => setLightboxImg(null)}
        >
          <div className="relative max-h-[90vh] max-w-[90vw]" onClick={(e) => e.stopPropagation()}>
            <button
              onClick={() => setLightboxImg(null)}
              className="absolute -top-12 right-0 rounded-full bg-white/20 p-2 text-white hover:bg-white/40 transition"
              aria-label="Kapat"
            >
              <X className="h-6 w-6" />
            </button>
            <img
              src={lightboxImg}
              alt="Konya Parlak Mobilya Proje Detayı"
              className="max-h-[85vh] max-w-[85vw] rounded-xl object-contain shadow-2xl"
            />
          </div>
        </div>
      )}

      {/* FAQ Section */}
      {project.faqs.length > 0 && (
        <section className="bg-white py-14 md:py-20 border-t border-black/5">
          <div className="container-site max-w-[880px]">
            <div className="text-center">
              <span className="text-[13px] font-bold uppercase tracking-wider text-muted">
                Merak Edilenler
              </span>
              <h2 className="mt-2 font-display text-[30px] font-medium tracking-[-0.04em] text-ink md:text-[36px]">
                Sıkça Sorulan Sorular
              </h2>
              <p className="mt-3 text-[15px] text-subtle">
                {project.title} hakkında müşterilerimizin en çok sorduğu sorular ve Ahmet Usta'nın yanıtları
              </p>
            </div>

            <div className="mt-10 divide-y divide-black/10 rounded-[24px] border border-black/10 bg-[#faf7f2] p-6 md:p-8">
              {project.faqs.map((faq, i) => {
                const isOpen = activeFaq === i;
                return (
                  <div key={i} className="py-4 first:pt-0 last:pb-0">
                    <button
                      onClick={() => setActiveFaq(isOpen ? null : i)}
                      className="flex w-full items-center justify-between text-left font-display text-[17px] font-medium text-ink transition hover:opacity-80"
                    >
                      <span>{faq.question}</span>
                      <ChevronDown
                        className={`h-5 w-5 text-subtle transition-transform duration-200 ${
                          isOpen ? "rotate-180 text-ink" : ""
                        }`}
                      />
                    </button>
                    {isOpen && (
                      <p className="mt-3 text-[14.5px] leading-relaxed text-subtle">
                        {faq.answer}
                      </p>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </section>
      )}
    </SiteLayout>
  );
}
