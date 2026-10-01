import { Link } from "@tanstack/react-router";
import { SiteLayout } from "@/components/layout/SiteLayout";
import { ArrowLeft, Home, Phone, Wrench } from "lucide-react";

export function NotFoundView() {
  return (
    <SiteLayout title="Sayfa Bulunamadı (404)" showCta={false}>
      <section className="bg-white py-20 text-center md:py-28">
        <div className="container-site max-w-[620px]">
          <span className="inline-block rounded-full bg-black/5 px-4 py-1.5 text-[14px] font-semibold text-ink">
            Hata Kodu 404
          </span>
          <h1 className="mt-4 font-display text-[32px] md:text-[42px] font-medium text-ink">
            Aradığınız Sayfa Bulunamadı
          </h1>
          <p className="mt-4 text-[16px] leading-relaxed text-subtle">
            Ulaşmaya çalıştığınız sayfa kaldırılmış, adı değiştirilmiş veya geçici olarak kullanım dışı kalmış olabilir. Aşağıdaki bağlantıları kullanarak aradığınız içeriğe ulaşabilirsiniz.
          </p>

          <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
            <Link
              to="/"
              className="inline-flex items-center gap-2 rounded-full bg-[#0d0100] px-6 py-3.5 text-[14.5px] font-medium text-white shadow hover:opacity-90 transition"
            >
              <Home className="h-4 w-4" />
              <span>Ana Sayfaya Dön</span>
            </Link>
            <Link
              to="/hizmetler"
              className="inline-flex items-center gap-2 rounded-full border border-black/15 bg-white px-6 py-3.5 text-[14.5px] font-medium text-ink hover:bg-black/5 transition"
            >
              <Wrench className="h-4 w-4" />
              <span>Hizmetlerimiz</span>
            </Link>
            <Link
              to="/iletisim"
              className="inline-flex items-center gap-2 rounded-full border border-black/15 bg-white px-6 py-3.5 text-[14.5px] font-medium text-ink hover:bg-black/5 transition"
            >
              <Phone className="h-4 w-4" />
              <span>İletişime Geçin</span>
            </Link>
          </div>
        </div>
      </section>
    </SiteLayout>
  );
}
