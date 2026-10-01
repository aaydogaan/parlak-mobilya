import { Reveal } from "@/components/motion/Reveal";
import { ServiceCard } from "@/components/cards/ServiceCard";
import { featuredServices } from "@/data/site";

export function HomeServices() {
  return (
    <section className="bg-white py-16 md:py-24">
      <div className="container-site">
        <Reveal>
          <div className="mx-auto max-w-[620px] text-center">
            <h2 className="font-['Lexend'] text-[32px] sm:text-[38px] md:text-[44px] font-semibold tracking-[-2px] text-[#0d0100]">
              Mobilya ve Dekorasyon Hizmetlerimiz
            </h2>
            <p className="mt-3 font-['Lexend'] text-[15px] sm:text-[16px] leading-relaxed text-[#524e4e]">
              Konya'da 40 yıllık usta tecrübemizle mekanlarınıza özel ölçü, kaliteli malzeme ve fonksiyonel ahşap çözümleri üretiyoruz.
            </p>
          </div>
        </Reveal>
        <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {featuredServices.map((s, i) => (
            <Reveal key={s.slug} delay={i * 60}>
              <ServiceCard service={s} />
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
