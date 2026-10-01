import { SiteLayout } from "@/components/layout/SiteLayout";
import { services } from "@/data/site";
import { ServiceCard } from "@/components/cards/ServiceCard";
import { HowItWorks } from "@/components/sections/HowItWorks";
import { QuoteForm } from "@/components/sections/QuoteForm";
import { Reveal } from "@/components/motion/Reveal";
import { Link } from "@tanstack/react-router";


export function ServicesPageView() {
  return (
    <SiteLayout
      title="Mobilya ve Dekorasyon Hizmetlerimiz"
      subtitle="Konya'da 40 yılı aşkın tecrübeyle özel ölçü mutfak dolapları, modern gardıroplar, vestiyerler, TV üniteleri ve anahtar teslim ev yenileme çözümleri."
      eyebrow="Tasarım, Üretim & Kusursuz Montaj"
    >
      <section className="bg-white py-16 md:py-20">
        <div className="container-site">
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {services.map((s, i) => (
              <Reveal key={s.slug} delay={i * 50}>
                <ServiceCard service={s} />
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      <HowItWorks title="Nasıl Çalışıyoruz?" showArrows />

      <section className="bg-white py-16 md:py-20">
        <div className="container-site grid gap-6 lg:grid-cols-2">
          <Reveal>
            <div className="relative overflow-hidden rounded-[24px] bg-[#1a120c] h-full flex flex-col justify-end">
              <div className="absolute inset-0">
                <img
                  src="/images/komple-ev.webp"
                  alt="Konya Parlak Mobilya Özel İmalat"
                  className="h-full w-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/50 to-transparent" />
              </div>
              <div className="relative p-8 md:p-10 text-white">
                <span className="rounded-full bg-white/90 px-3 py-1 text-[12px] font-semibold text-ink uppercase tracking-wider">
                  Ücretsiz Keşif
                </span>
                <h3 className="mt-3 font-display text-[28px] font-medium leading-tight text-white md:text-[34px]">
                  Evinize Özel Ölçü & Mimari Çözümler
                </h3>
                <p className="mt-3 text-[15px] leading-relaxed text-white/80">
                  Konya merkez, Selçuklu, Meram ve Karatay'da evinize gelerek milimetrik ölçü alıyor, 3D çizim ve şeffaf malzeme teklifiyle projenizi başlatıyoruz.
                </p>
                <div className="mt-6 flex flex-wrap gap-3">
                  <Link to="/iletisim" className="rounded-full bg-white px-6 py-3 text-[14.5px] font-medium text-ink hover:bg-white/90 transition shadow-sm inline-flex">
                    Hemen İletişime Geçin
                  </Link>
                  <Link to="/projeler" className="rounded-full bg-white/20 backdrop-blur-md px-6 py-3 text-[14px] font-medium text-white hover:bg-white/30 transition">
                    Projelerimizi Görün
                  </Link>
                </div>
              </div>
            </div>
          </Reveal>
          <Reveal delay={80}>
            <QuoteForm className="h-full" />
          </Reveal>
        </div>
      </section>
    </SiteLayout>
  );
}
