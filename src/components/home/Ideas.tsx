import { Check } from "lucide-react";
import { Link } from "@tanstack/react-router";

export function Ideas() {
  return (
    <section className="w-full bg-white py-8 sm:py-12 md:py-16 px-4 sm:px-6">
      {/* 
        Orijinal Framer About/Ideas Card:
        Tam ekran genişlik (calc(100vw - 48px), 1920px ekranda tam 1849px)
        Framer yüksekliği: tam 755px, border-radius: 20px, bg: #271d12
      */}
      <div className="relative w-full min-h-[680px] lg:h-[755px] bg-[#271d12] rounded-[20px] overflow-hidden flex items-center justify-center px-6 sm:px-12 md:px-16 lg:px-20 py-16 lg:py-0 shadow-sm">
        <div className="w-full max-w-[1240px] mx-auto grid grid-cols-1 lg:grid-cols-2 items-center gap-14 lg:gap-20">
          {/* Sol Kolon: Metin, Liste ve Buton */}
          <div className="flex flex-col items-start max-w-[540px]">
            <h2 className="font-['Lexend'] text-[34px] sm:text-[42px] md:text-[48px] lg:text-[50px] font-semibold leading-[1.15] tracking-[-2px] text-white">
              Fikirlerinizi estetik ve kaliteli mekanlara dönüştürüyoruz
            </h2>
            <p className="mt-5 font-['Lexend'] text-[16px] md:text-[18px] font-light leading-[1.7] text-[#f6f5f5]">
              1984'ten bu yana Konya'da ahşaba hayat veriyor; özel ölçü mutfak, gardırop ve yaşam alanı projelerinizi titizlikle üretiyoruz.
            </p>

            <ul className="mt-8 space-y-4 w-full">
              <li className="flex items-center gap-3.5 font-['Lexend'] text-[15px] sm:text-[16px] text-white/95">
                <span className="flex size-5 shrink-0 items-center justify-center rounded-full bg-white text-[#0d0100]">
                  <Check className="size-3.5" strokeWidth={3} />
                </span>
                Birinci sınıf malzeme, lake ve akrilik kapak kalitesi
              </li>
              <li className="flex items-center gap-3.5 font-['Lexend'] text-[15px] sm:text-[16px] text-white/95">
                <span className="flex size-5 shrink-0 items-center justify-center rounded-full bg-white text-[#0d0100]">
                  <Check className="size-3.5" strokeWidth={3} />
                </span>
                Zamana meydan okuyan 40 yıllık usta işçiliği
              </li>
            </ul>

            <Link
              to="/hizmetler"
              className="mt-10 inline-flex items-center justify-center px-8 py-4 rounded-[90px] bg-[#0d0100] text-white font-['Lexend'] font-medium text-[16px] hover:bg-black/80 border border-white/20 transition-all shadow-sm cursor-pointer"
            >
              Hizmetlerimizi İnceleyin
            </Link>
          </div>

          {/* Sağ Kolon: Düz, Modern & Şık Görsel Alanı */}
          <div className="relative w-full max-w-[480px] lg:max-w-[500px] mx-auto flex items-center justify-center pt-6 pb-6">
            {/* Ana Büyük Görsel (Düz, modern gölge ve radius) */}
            <div className="relative w-full aspect-[975/845] rounded-[20px] overflow-hidden shadow-2xl border border-white/10">
              <img
                src="/images/DSCF4566-2-scaled.webp"
                alt="Parlak Mobilya Atölye ve Özel Ahşap Üretimi"
                className="w-full h-full object-cover"
                loading="lazy"
              />
            </div>

            {/* İkinci Küçük Kare Görsel (Sol Altta Düz Yerleşim) */}
            <div className="absolute -top-3 -left-3 sm:-left-6 size-[120px] sm:size-[150px] rounded-[16px] overflow-hidden border-[3px] border-[#271d12] shadow-2xl pointer-events-none hidden sm:block">
              <img
                src="/images/mutfak-dolaplari.webp"
                alt="Özel Ölçü Mutfak ve Ahşap Detayı"
                className="w-full h-full object-cover"
                loading="lazy"
              />
            </div>

            {/* 5000+ Proje Rozeti (Sağ Altta Düz Yerleşim) */}
            <div className="absolute -bottom-4 sm:-bottom-6 -right-2 sm:-right-4 bg-white rounded-[18px] p-4 sm:p-5 shadow-[0_15px_40px_rgba(0,0,0,0.3)] max-w-[200px] sm:max-w-[220px] text-center pointer-events-none border border-black/5">
              <div className="flex items-baseline justify-center gap-0.5">
                <span className="font-['Lexend'] text-[28px] sm:text-[34px] font-semibold text-[#0d0100] tracking-[-1px] leading-none">
                  5.000
                </span>
                <span className="font-['Lexend'] text-[22px] sm:text-[26px] font-semibold text-[#0d0100] leading-none">
                  +
                </span>
              </div>
              <p className="mt-1.5 font-['Lexend'] text-[11.5px] sm:text-[12.5px] font-medium leading-tight text-[#0d0100]">
                Tamamlanan Özel Ölçü Ahşap ve Mobilya Projesi
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
