import { Link } from "@tanstack/react-router";

export function CtaBanner() {
  return (
    <section className="w-full bg-white py-8 sm:py-12 md:py-16 px-4 sm:px-6">
      {/* 
        Orijinal Framer CTA Card: 
        Tam ekran genişlik (calc(100vw - 48px), 1920px ekranda tam 1849px),
        Framer yüksekliği: tam 472px, border-radius: 20px
      */}
      <div className="relative w-full h-[472px] min-h-[472px] rounded-[20px] overflow-hidden flex items-center shadow-sm">
        {/* Kullanıcının istediği gerçek atölye görseli: DSCF4566-2-scaled.webp */}
        <img
          decoding="auto"
          src="/images/DSCF4566-2-scaled.webp"
          alt="Konya Parlak Mobilya ve Dekorasyon İmalatı"
          className="absolute inset-0 w-full h-full object-cover object-[center_top]"
          loading="lazy"
        />

        {/* Orijinal Framer Lineer Gradyan Katmanı (div.framer-1yci8p4) */}
        <div
          className="absolute inset-y-0 left-0 w-full sm:w-[60%] md:w-[50%] min-w-[340px] pointer-events-none"
          style={{
            background: "linear-gradient(90deg, rgba(39, 29, 18, 0.95) 0%, rgba(39, 29, 18, 0.85) 60%, rgba(39, 29, 18, 0) 100%)",
            opacity: 1,
          }}
        />

        {/* Mobil ek karartma katmanı */}
        <div className="absolute inset-0 bg-black/40 sm:hidden pointer-events-none" />

        {/* İçerik Kapsayıcı */}
        <div className="relative z-10 w-full max-w-[1280px] mx-auto px-6 sm:px-12 md:px-16 flex items-center">
          <div className="max-w-[540px] flex flex-col items-start gap-8 md:gap-9">
            <h2 className="font-['Lexend'] text-[32px] sm:text-[40px] md:text-[48px] lg:text-[50px] font-semibold leading-[1.15] tracking-[-2px] text-white drop-shadow-md">
              Konya'da hayalinizdeki mobilyayı birlikte tasarlayalım
            </h2>

            <Link
              to="/iletisim"
              className="inline-flex items-center justify-center px-8 py-4 rounded-[90px] bg-[#0d0100] text-white font-['Lexend'] font-medium text-[16px] hover:bg-black/80 border border-white/20 transition-all shadow-sm cursor-pointer"
            >
              Ücretsiz Keşif &amp; Fiyat Teklifi Al
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
