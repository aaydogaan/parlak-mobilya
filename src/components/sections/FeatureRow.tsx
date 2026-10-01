import { ShieldCheck, Ruler, Sparkles } from "lucide-react";

const items = [
  {
    icon: ShieldCheck,
    title: "Garantili Usta İşçiliği",
    body: "40 yılı aşkın tecrübe, milimetrik montaj hassasiyeti ve birinci sınıf malzeme kalitesi.",
  },
  {
    icon: Ruler,
    title: "Mekana Özel Ölçü",
    body: "Standart kalıplar değil; mekanınızın mimari ölçüsüne ve kullanım alışkanlıklarınıza özel üretim.",
  },
  {
    icon: Sparkles,
    title: "Kişiye Özel Tasarım",
    body: "Mutfak, gardırop, vestiyer ve yaşam alanlarınız için renk, kapak ve mekanizma özgürlüğü.",
  },
];

export function FeatureRow() {
  return (
    <section className="bg-white pt-16 md:pt-20 pb-8">
      <div className="container-site">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-0 items-center">
          {items.map((item, i) => {
            const Icon = item.icon;
            return (
              <div
                key={item.title}
                className={`flex items-start gap-6 py-4 ${
                  i !== 0 ? "md:border-l md:border-black/10 md:pl-10" : ""
                } ${i !== items.length - 1 ? "md:pr-10" : ""}`}
              >
                <div className="shrink-0 size-9 rounded-lg bg-[#fcbe54]/15 flex items-center justify-center text-[#271d12]">
                  <Icon className="size-5 text-[#271d12]" strokeWidth={2} />
                </div>
                <div className="flex flex-col gap-1.5">
                  <h3 className="font-['Lexend'] text-[18px] md:text-[20px] font-semibold tracking-[-0.5px] text-[#0d0100]">
                    {item.title}
                  </h3>
                  <p className="font-['Lexend'] text-[14px] md:text-[15px] font-light leading-[1.6] text-[#524e4e] max-w-[320px]">
                    {item.body}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
