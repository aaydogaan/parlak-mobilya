import { Link } from "@tanstack/react-router";

export function Hero() {
  return (
    <section className="relative w-full h-screen min-h-[700px] p-4 sm:p-5 md:p-6 flex items-center justify-center bg-white overflow-hidden">
      {/* Kart Kapsayıcı (Framer: border-radius: 20px, height: 100%, relative) */}
      <div className="relative w-full h-full rounded-[20px] overflow-hidden flex items-center px-6 sm:px-12 md:px-16 lg:px-20">
        {/* Kullanıcının WordPress'teki Gerçek Tanıtım Videosu */}
        <video
          src="/videos/konya_parlak_mobilya_dekorasyon.mp4"
          autoPlay
          loop
          muted
          playsInline
          poster="/images/DSCF4566-2-scaled.webp"
          className="absolute inset-0 w-full h-full object-cover object-center"
        />

        {/* Orijinal Framer Karartma Lineer Gradyanı (.framer-k2e2m4) */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background: "linear-gradient(90deg, rgba(0, 0, 0, 0.92) 0%, rgba(0, 0, 0, 0.65) 50%, rgba(0, 0, 0, 0.25) 85%)",
          }}
        />

        {/* Mobil ek karartma katmanı */}
        <div className="absolute inset-0 bg-black/40 sm:hidden pointer-events-none" />

        {/* Hero İçerik Alanı (max-w-[671px]) */}
        <div className="relative z-10 w-full max-w-[680px] flex flex-col items-start gap-8 md:gap-9 pt-12 sm:pt-0">
          <div className="flex flex-col items-start gap-4 md:gap-5">
            <h1 className="font-['Lexend'] text-[36px] sm:text-[48px] md:text-[58px] lg:text-[68px] font-semibold leading-[1.1] tracking-[-1.8px] sm:tracking-[-2.4px] lg:tracking-[-3px] text-white">
              Konya'da 40 yıllık tecrübeyle özel mobilya
            </h1>
            <p className="font-['Lexend'] text-[16px] md:text-[18px] font-light leading-[1.7] text-[#f6f5f5] max-w-[540px]">
              Ahmet Usta'nın ustalığıyla özel ölçü mutfak dolapları, modern gardıroplar, vestiyer ve komple ev yenileme çözümleri sunuyoruz.
            </p>
          </div>

          {/* Butonlar Grubu */}
          <div className="flex flex-wrap items-center gap-4 w-full">
            {/* Buton 01: Ücretsiz Keşif Al */}
            <Link
              to="/iletisim"
              className="inline-flex items-center justify-center px-8 py-4 rounded-[90px] bg-[#0d0100] text-white font-['Lexend'] font-medium text-[15px] sm:text-[16px] hover:bg-black/80 border border-white/20 transition-all shadow-sm cursor-pointer"
            >
              Ücretsiz Keşif Al
            </Link>

            {/* Buton 02: Hizmetlerimizi İncele */}
            <Link
              to="/hizmetler"
              className="inline-flex items-center justify-center px-8 py-4 rounded-[90px] bg-white text-[#0d0100] font-['Lexend'] font-medium text-[15px] sm:text-[16px] hover:bg-white/90 transition-colors shadow-sm cursor-pointer"
            >
              Hizmetlerimizi İncele
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
