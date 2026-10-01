import { useState, useEffect } from "react";
import { Link } from "@tanstack/react-router";
import { Mail, MapPin, Phone, MessageCircle } from "lucide-react";
import { Logo } from "@/components/brand/Logo";
import { services, site } from "@/data/site";

const kurumsalNav = [
  { label: "Hakkımızda", href: "/hakkimizda" },
  { label: "Projelerimiz", href: "/projeler" },
  { label: "Galeri", href: "/galeri" },
  { label: "Blog & Rehber", href: "/blog" },
  { label: "İletişim", href: "/iletisim" },
];

const legalNav = [
  { label: "KVKK Aydınlatma", href: "/kvkk" },
  { label: "Gizlilik Politikası", href: "/gizlilik-politikasi" },
  { label: "Çerez Politikası", href: "/cerez-politikasi" },
];

export function Footer() {
  const [isAdminSubdomain, setIsAdminSubdomain] = useState(false);

  useEffect(() => {
    setIsAdminSubdomain(window.location.hostname.startsWith("admin."));
  }, []);

  if (isAdminSubdomain) return null;
  return (
    <footer className="w-full bg-white pt-20 md:pt-24 lg:pt-[116px] pb-8 md:pb-10 lg:pb-[32px] px-6 sm:px-8 md:px-12">
      <div className="mx-auto w-full max-w-[1280px]">
        {/* Üst Ana Kısım: Logo Sol Tarafta, Menüler ve İletişim Sağda */}
        <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-12 sm:gap-16 lg:gap-[100px] pb-14 lg:pb-[57px]">
          {/* Logo Alanı (Parlak Mobilya Logo) */}
          <div className="shrink-0 max-w-[320px]">
            <Logo variant="footer" />
            <p className="mt-5 text-[14px] leading-relaxed text-[#524e4e] font-['Lexend']">
              1984 yılından bu yana Konya'da kaliteli işçilik, sağlam ahşap malzeme ve özel ölçü tasarımı bir araya getiriyoruz.
            </p>
            <div className="mt-5">
              <a
                href={site.whatsapp}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 rounded-full bg-[#25D366] px-4 py-2 text-[13.5px] font-medium text-white shadow-sm hover:brightness-110 transition"
              >
                <MessageCircle className="h-4 w-4" />
                <span>WhatsApp Danışma</span>
              </a>
            </div>
          </div>

          {/* Menü Listeleri (Hızlı Menü, Hizmetler, İletişim) */}
          <div className="grid flex-1 grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-10 sm:gap-12 lg:gap-12">
            {/* Hızlı Menü */}
            <div>
              <h3 className="font-['Lexend'] text-[18px] md:text-[20px] font-medium tracking-[-0.5px] text-[#0d0100] mb-5">
                Kurumsal
              </h3>
              <ul className="space-y-3">
                {kurumsalNav.map((item) => (
                  <li key={item.href}>
                    <Link
                      to={item.href as "/"}
                      className="font-['Lexend'] text-[14.5px] text-[#524e4e] hover:text-[#0d0100] transition-colors inline-block"
                    >
                      {item.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* Hizmetlerimiz */}
            <div>
              <h3 className="font-['Lexend'] text-[18px] md:text-[20px] font-medium tracking-[-0.5px] text-[#0d0100] mb-5">
                Projelerimiz
              </h3>
              <ul className="space-y-3">
                {services.map((s) => (
                  <li key={s.slug}>
                    <Link
                      to="/projeler/$slug"
                      params={{ slug: s.slug }}
                      className="font-['Lexend'] text-[14.5px] text-[#524e4e] hover:text-[#0d0100] transition-colors inline-block"
                    >
                      {s.title}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* Contact Information */}
            <div>
              <h3 className="font-['Lexend'] text-[18px] md:text-[20px] font-medium tracking-[-0.5px] text-[#0d0100] mb-5">
                İletişim & Atölye
              </h3>
              <div className="space-y-4">
                <a
                  href={site.addressHref}
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-start gap-3 font-['Lexend'] text-[14px] text-[#524e4e] hover:text-[#0d0100] transition-colors group"
                >
                  <MapPin className="mt-0.5 size-5 shrink-0 text-[#0d0100] group-hover:opacity-75 transition-opacity" strokeWidth={1.8} />
                  <span>
                    {site.addressLines[0]}
                    <br />
                    {site.addressLines[1]}
                  </span>
                </a>

                <a
                  href={`tel:${site.phoneRaw}`}
                  className="flex items-center gap-3 font-['Lexend'] text-[14px] text-[#524e4e] hover:text-[#0d0100] transition-colors group"
                >
                  <Phone className="size-5 shrink-0 text-[#0d0100] group-hover:opacity-75 transition-opacity" strokeWidth={1.8} />
                  <span className="font-medium">{site.phone}</span>
                </a>

                <a
                  href={`mailto:${site.email}`}
                  className="flex items-center gap-3 font-['Lexend'] text-[14px] text-[#524e4e] hover:text-[#0d0100] transition-colors group"
                >
                  <Mail className="size-5 shrink-0 text-[#0d0100] group-hover:opacity-75 transition-opacity" strokeWidth={1.8} />
                  <span>{site.email}</span>
                </a>
              </div>
            </div>
          </div>
        </div>

        {/* Çizgi Bölücü */}
        <div className="w-full h-px bg-[#f0ece5]" />

        {/* Alt Satır: Yasal Bağlantılar ve Telif Bilgisi */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-6 md:pt-8 font-['Lexend'] text-[13.5px]">
          <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-[#524e4e]">
            {legalNav.map((item) => (
              <Link
                key={item.href}
                to={item.href as "/"}
                className="hover:text-ink transition-colors"
              >
                {item.label}
              </Link>
            ))}
          </div>

          <p className="text-[#524e4e]">
            Tüm Hakları Saklıdır © Parlak Mobilya ve Dekorasyon — 1984'ten Bugüne
          </p>
        </div>
      </div>
    </footer>
  );
}
