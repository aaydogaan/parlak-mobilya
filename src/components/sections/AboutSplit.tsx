import { Check } from "lucide-react";

const items = [
  "Mekana Özel Ölçü Çözümleri",
  "1. Sınıf Lake & Akrilik Kapak",
  "40 Yıllık Marangoz Ustalığı",
  "Zamanında ve Temiz Montaj",
];

export function AboutSplit() {
  return (
    <section className="bg-white py-16 md:py-24">
      <div className="container-site">
        <div className="flex flex-col lg:flex-row items-center justify-between gap-12 lg:gap-20">
          {/* Sol: Ahmet Usta / Atölye Görseli */}
          <div className="w-full lg:w-1/2 overflow-hidden rounded-[20px] aspect-[1.09/1] max-w-[580px] shadow-sm">
            <img
              src="/images/ahmet-parlak-mobilyaa-1.jpg"
              alt="Ahmet Parlak - Parlak Mobilya Kurucusu & Baş Marangoz Ustası"
              className="w-full h-full object-cover object-top"
              loading="lazy"
            />
          </div>

          {/* Sağ: İçerik */}
          <div className="w-full lg:w-1/2 max-w-[520px] flex flex-col items-start">
            <h2 className="font-['Lexend'] text-[32px] sm:text-[38px] md:text-[44px] lg:text-[48px] font-semibold leading-[1.2] tracking-[-1.8px] text-[#0d0100]">
              Mekanlarınıza değer katan 40 yıllık zanaat
            </h2>
            <p className="mt-5 font-['Lexend'] text-[16px] md:text-[17px] font-light leading-[1.7] text-[#524e4e]">
              Konya'da 1984 yılından bu yana usta marangozluk geleneği, birinci sınıf ahşap malzemeler ve titiz işçiliği bir araya getirerek eviniz ve iş yeriniz için dayanıklı, estetik ve fonksiyonel mobilyalar üretiyoruz.
            </p>

            <ul className="mt-8 grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-4 w-full">
              {items.map((item) => (
                <li key={item} className="flex items-center gap-3 font-['Lexend'] text-[15px] font-normal text-[#0d0100]">
                  <span className="flex size-5 shrink-0 items-center justify-center rounded-full bg-[#feedd1] text-[#271d12]">
                    <Check className="size-3.5" strokeWidth={2.8} />
                  </span>
                  {item}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </section>
  );
}
