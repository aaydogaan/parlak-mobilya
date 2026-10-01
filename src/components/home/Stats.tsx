const stats = [
  { value: "40+", label: "Yıllık Köklü Tecrübe" },
  { value: "5.000+", label: "Tamamlanan Özel Proje" },
  { value: "%100", label: "Müşteri Memnuniyeti" },
];

export function Stats() {
  return (
    <section className="bg-white py-16 md:py-24">
      <div className="container-site">
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-10 lg:gap-16">
          <div className="max-w-[400px]">
            <h2 className="font-['Lexend'] text-[32px] sm:text-[38px] md:text-[44px] font-semibold leading-[1.15] tracking-[-1.5px] text-[#0d0100]">
              Rakamlarla 40 Yıllık Güven ve Zanaat
            </h2>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-5 w-full lg:w-auto flex-1">
            {stats.map((s) => (
              <div
                key={s.label}
                className="bg-[#f6f5f5] rounded-[18px] p-6 sm:p-7 flex flex-col justify-between min-h-[140px] border border-black/[0.04]"
              >
                <span className="font-['Lexend'] text-[36px] sm:text-[42px] font-semibold leading-none tracking-[-1.5px] text-[#0d0100]">
                  {s.value}
                </span>
                <p className="mt-4 font-['Lexend'] text-[14px] md:text-[15px] font-medium text-[#524e4e]">
                  {s.label}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
