import { useState, type FormEvent } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { Mail, MapPin, Phone, MessageCircle, ArrowUpRight, Clock } from "lucide-react";
import { SiteLayout } from "@/components/layout/SiteLayout";
import { GoldButton } from "@/components/ui/GoldButton";
import { Reveal } from "@/components/motion/Reveal";
import { services, site } from "@/data/site";

export const Route = createFileRoute("/contact")({
  component: ContactPage,
  head: () => ({
    meta: [
      { title: "İletişim - Parlak Mobilya ve Dekorasyon" },
      {
        name: "description",
        content:
          "Konya merkez, Selçuklu, Meram ve Karatay'da özel ölçü mobilya çözümleri için Parlak Mobilya ve Dekorasyon ile iletişime geçin. Ücretsiz keşif ve fiyat teklifi alın.",
      },
      { property: "og:title", content: "İletişim - Parlak Mobilya ve Dekorasyon" },
      { property: "og:url", content: "https://www.parlakmobilyadekorasyon.com/iletisim" },
    ],
    links: [
      { rel: "canonical", href: "https://www.parlakmobilyadekorasyon.com/iletisim" },
    ],
  }),
});

import { useAdminStore } from "@/lib/admin/adminStore";

export function ContactPage() {
  const [sent, setSent] = useState(false);
  const addTalep = useAdminStore((s) => s.addTalep);

  function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const name = fd.get("name") as string;
    const phone = fd.get("phone") as string;
    const email = fd.get("email") as string;
    const serviceSlug = fd.get("service") as string;
    const message = fd.get("message") as string;

    const matchedService = services.find((s) => s.slug === serviceSlug);

    addTalep({
      name: name || "İletişim Formu Müşterisi",
      phone: phone || "05XX XXX XX XX",
      email: email || undefined,
      district: "Konya / Merkez",
      category: matchedService?.title || "Özel Mobilya Keşif Talebi",
      message: message || `${name} iletişim sayfasından keşif ve bilgi talebinde bulundu.`,
    });

    setSent(true);
  }

  return (
    <SiteLayout
      title="Bize Ulaşın"
      subtitle="Hayalinizdeki yaşam alanını birlikte tasarlamak ve Ahmet Usta'nın 40 yıllık tecrübesiyle tanışmak için sizi Konya Selçuklu'daki atölyemize bekliyoruz."
    >
      <section className="bg-white py-16 md:py-20">
        <div className="container-site grid items-start gap-10 lg:grid-cols-[1fr_1fr] lg:gap-14">
          {/* Sol Taraf: Modern, Minimalist & Şık Mimari İletişim Bilgileri */}
          <Reveal>
            <div className="flex flex-col gap-6">
              <div>
                <h2 className="font-['Lexend'] text-[28px] sm:text-[32px] font-semibold text-ink tracking-tight">
                  Konya'daki Atölyemize Bekleriz
                </h2>
                <p className="mt-2.5 font-['Lexend'] text-[15px] text-muted font-light leading-relaxed">
                  Tasarım aşamasından ahşabın işlenişine kadar tüm süreci atölyemizde yerinde görebilir, mekana özel projeniz için Ahmet Usta ile yüz yüze görüşebilirsiniz.
                </p>
              </div>

              {/* Minimalist İletişim Listesi (Tek ve Şık Mimari Panel) */}
              <div className="rounded-[22px] border border-black/8 bg-[#faf7f2]/80 p-4 sm:p-7 shadow-[0_4px_20px_rgba(0,0,0,0.03)] backdrop-blur-sm divide-y divide-black/8 w-full max-w-full overflow-hidden">
                {/* 1. Atölye & Adres */}
                <a
                  href={site.addressHref}
                  target="_blank"
                  rel="noreferrer"
                  className="group flex items-center sm:items-start justify-between gap-3 pb-4 pt-1 transition-colors min-w-0 w-full"
                >
                  <div className="flex items-start gap-3 min-w-0 flex-1">
                    <div className="size-9 rounded-xl bg-white border border-black/8 flex items-center justify-center text-ink shrink-0 group-hover:border-black/30 transition-colors shadow-xs mt-0.5">
                      <MapPin className="size-4.5 text-ink" strokeWidth={2} />
                    </div>
                    <div className="min-w-0 flex-1">
                      <span className="text-[11px] font-semibold uppercase tracking-wider text-muted/80 block">
                        Atölye &amp; Üretim Merkezi
                      </span>
                      <p className="mt-1 font-['Lexend'] text-[14.5px] sm:text-[15px] font-medium text-ink leading-snug break-words">
                        {site.addressLines[0]}
                      </p>
                      <p className="text-[13px] sm:text-[13.5px] text-muted font-light">
                        {site.addressLines[1]}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-1 text-[13px] font-medium text-ink shrink-0 opacity-80 group-hover:opacity-100 group-hover:translate-x-0.5 transition-all pl-2">
                    <span className="hidden sm:inline">Harita</span>
                    <ArrowUpRight className="size-4" />
                  </div>
                </a>

                {/* 2. Telefon & Danışma */}
                <a
                  href={`tel:${site.phoneRaw}`}
                  className="group flex items-center sm:items-start justify-between gap-3 py-4 transition-colors min-w-0 w-full"
                >
                  <div className="flex items-start gap-3 min-w-0 flex-1">
                    <div className="size-9 rounded-xl bg-white border border-black/8 flex items-center justify-center text-ink shrink-0 group-hover:border-black/30 transition-colors shadow-xs mt-0.5">
                      <Phone className="size-4.5 text-ink" strokeWidth={2} />
                    </div>
                    <div className="min-w-0 flex-1">
                      <span className="text-[11px] font-semibold uppercase tracking-wider text-muted/80 block">
                        Telefon &amp; Danışma Hattı
                      </span>
                      <p className="mt-1 font-['Lexend'] text-[15px] sm:text-[16px] font-semibold text-ink tracking-tight">
                        {site.phone}
                      </p>
                      <p className="mt-0.5 flex items-center gap-1.5 text-[12px] sm:text-[12.5px] text-muted font-light">
                        <Clock className="size-3 text-muted/70 shrink-0" />
                        <span>Pazartesi – Cumartesi: 08:30 – 19:00</span>
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-1 text-[13px] font-medium text-ink shrink-0 opacity-80 group-hover:opacity-100 group-hover:translate-x-0.5 transition-all pl-2">
                    <span className="hidden sm:inline">Hemen Ara</span>
                    <ArrowUpRight className="size-4" />
                  </div>
                </a>

                {/* 3. WhatsApp Hattı */}
                <a
                  href={site.whatsapp}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group flex items-center sm:items-start justify-between gap-3 py-4 transition-colors min-w-0 w-full"
                >
                  <div className="flex items-start gap-3 min-w-0 flex-1">
                    <div className="size-9 rounded-xl bg-white border border-black/8 flex items-center justify-center text-[#25D366] shrink-0 group-hover:border-[#25D366]/60 transition-colors shadow-xs mt-0.5">
                      <MessageCircle className="size-4.5 text-[#25D366]" strokeWidth={2} />
                    </div>
                    <div className="min-w-0 flex-1">
                      <span className="text-[11px] font-semibold uppercase tracking-wider text-muted/80 block">
                        WhatsApp Hızlı İletişim
                      </span>
                      <p className="mt-1 font-['Lexend'] text-[14.5px] sm:text-[15.5px] font-medium text-ink">
                        Ölçü &amp; Fotoğraf Paylaşımı
                      </p>
                      <p className="text-[12.5px] sm:text-[13px] text-muted font-light leading-snug">
                        Mekanınızın görselini göndererek ön fiyat alabilirsiniz
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-1 text-[13px] font-medium text-[#25D366] shrink-0 opacity-80 group-hover:opacity-100 group-hover:translate-x-0.5 transition-all pl-2">
                    <span className="hidden sm:inline">Mesaj Yaz</span>
                    <ArrowUpRight className="size-4" />
                  </div>
                </a>

                {/* 4. E-posta */}
                <a
                  href={`mailto:${site.email}`}
                  className="group flex items-center sm:items-start justify-between gap-3 pt-4 pb-1 transition-colors min-w-0 w-full"
                >
                  <div className="flex items-start gap-3 min-w-0 flex-1">
                    <div className="size-9 rounded-xl bg-white border border-black/8 flex items-center justify-center text-ink shrink-0 group-hover:border-black/30 transition-colors shadow-xs mt-0.5">
                      <Mail className="size-4.5 text-ink" strokeWidth={2} />
                    </div>
                    <div className="min-w-0 flex-1">
                      <span className="text-[11px] font-semibold uppercase tracking-wider text-muted/80 block">
                        Kurumsal &amp; Teklif
                      </span>
                      <p className="mt-1 font-['Lexend'] text-[14px] sm:text-[15px] font-medium text-ink break-all">
                        {site.email}
                      </p>
                      <p className="text-[12.5px] sm:text-[13px] text-muted font-light">
                        Mimari proje dosyalarınız için
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-1 text-[13px] font-medium text-ink shrink-0 opacity-80 group-hover:opacity-100 group-hover:translate-x-0.5 transition-all pl-2">
                    <span className="hidden sm:inline">E-posta Gönder</span>
                    <ArrowUpRight className="size-4" />
                  </div>
                </a>
              </div>
            </div>
          </Reveal>

          {/* Sağ Taraf: İletişim ve Teklif Formu */}
          <Reveal delay={80}>
            <div className="rounded-[24px] bg-[#271d12] p-7 text-white md:p-9 shadow-xl">
              <h3 className="font-['Lexend'] text-[24px] sm:text-[28px] font-semibold leading-tight">
                Mesaj Bırakın, Biz Sizi Arayalım
              </h3>
              <p className="mt-2 text-[14.5px] text-white/75 font-light leading-relaxed">
                Mobilya ihtiyacınızı kısaca belirtin, Ahmet Usta projeniz için en uygun çözümü sunsun.
              </p>

              {sent ? (
                <div className="mt-8 rounded-2xl bg-white/10 p-6 text-white/95">
                  <p className="font-medium text-[16px] text-white">Mesajınız Alındı!</p>
                  <p className="mt-2 text-[14.5px] leading-relaxed text-white/80">
                    En kısa sürede sizinle iletişime geçeceğiz. Dilerseniz hemen WhatsApp üzerinden projenizi aktarabilirsiniz.
                  </p>
                  <a
                    href={site.whatsapp}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-4 inline-flex items-center gap-2 rounded-full bg-[#25D366] px-5 py-2.5 text-[14px] font-medium text-white transition hover:brightness-110"
                  >
                    <span>WhatsApp ile Yazın</span>
                    <span>→</span>
                  </a>
                </div>
              ) : (
                <form onSubmit={onSubmit} className="mt-7 space-y-4">
                  <label className="block">
                    <span className="mb-2 block text-[13.5px] text-white/90">Adınız Soyadınız</span>
                    <input required name="name" placeholder="Ad Soyad" className="c-field" autoComplete="name" />
                  </label>
                  <label className="block">
                    <span className="mb-2 block text-[13.5px] text-white/90">Telefon Numaranız</span>
                    <input required type="tel" name="phone" placeholder="05XX XXX XX XX" className="c-field" autoComplete="tel" />
                  </label>
                  <label className="block">
                    <span className="mb-2 block text-[13.5px] text-white/90">İlgilendiğiniz Hizmet</span>
                    <select required name="service" className="c-field" defaultValue="">
                      <option value="" disabled>Lütfen bir hizmet seçiniz</option>
                      {services.map((s) => (
                        <option key={s.slug} value={s.slug}>{s.title}</option>
                      ))}
                    </select>
                  </label>
                  <label className="block">
                    <span className="mb-2 block text-[13.5px] text-white/90">Mesajınız / Notunuz (Opsiyonel)</span>
                    <textarea rows={3} name="message" placeholder="Mekanınızın yaklaşık ölçüleri veya istediğiniz model detayları..." className="c-field resize-none" />
                  </label>
                  <button
                    type="submit"
                    className="mt-2 w-full justify-center inline-flex items-center rounded-full bg-white px-6 py-3.5 text-[15px] font-medium text-ink hover:bg-white/90 transition shadow-sm cursor-pointer"
                  >
                    Mesajı Gönder
                  </button>
                </form>
              )}
              <style>{`
                .c-field {
                  width: 100%;
                  border-radius: 12px;
                  border: 1px solid rgba(255,255,255,0.16);
                  background: transparent;
                  color: #fff;
                  padding: 13px 16px;
                  font-size: 14.5px;
                  outline: none;
                }
                .c-field::placeholder { color: rgba(255,255,255,0.45); }
                .c-field:focus { border-color: rgba(255,255,255,0.6); }
                .c-field option { color: #0d0100; }
              `}</style>
            </div>
          </Reveal>
        </div>
      </section>

      {/* Google Harita Bölümü */}
      <section className="bg-white pb-16 md:pb-24 border-t border-black/5 pt-10">
        <div className="container-site">
          <div className="mb-6">
            <h3 className="font-['Lexend'] text-[24px] font-semibold text-ink md:text-[28px]">
              Konya Selçuklu'daki Atölyemizi Ziyaret Edin
            </h3>
          </div>
          <Reveal>
            <div className="w-full overflow-hidden rounded-[24px] border border-black/10 bg-[#faf7f2] shadow-md">
              <iframe
                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3147.883588439275!2d32.5066647!3d37.9097836!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x14d08f102bd1f767%3A0xff4e508c71eb11f0!2sParlak%20Mobilya%20%26%20Dekorasyon!5e0!3m2!1str!2sbf!4v1790861914337!5m2!1str!2sbf"
                width="100%"
                height="450"
                style={{ border: 0 }}
                allowFullScreen={true}
                loading="lazy"
                referrerPolicy="strict-origin-when-cross-origin"
                title="Parlak Mobilya ve Dekorasyon Google Harita Konumu"
              />
            </div>
          </Reveal>
        </div>
      </section>
    </SiteLayout>
  );
}
