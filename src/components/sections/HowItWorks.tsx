import { Bell, CalendarDays, Search } from "lucide-react";
import { Reveal } from "@/components/motion/Reveal";
import { howItWorks } from "@/data/site";
import { cn } from "@/lib/utils";

const icons = [Search, CalendarDays, Bell];

type Props = {
  title?: string;
  showArrows?: boolean;
};

export function HowItWorks({ title = "Nasıl Çalışıyoruz?", showArrows = false }: Props) {
  return (
    <section className="bg-white py-16 md:py-24">
      <div className="container-site">
        <Reveal>
          <div className="mx-auto max-w-[620px] text-center">
            <h2 className="font-['Lexend'] text-[32px] sm:text-[38px] md:text-[44px] font-semibold tracking-[-2px] text-[#0d0100]">
              {title}
            </h2>
            <p className="mt-3 font-['Lexend'] text-[15px] sm:text-[16px] leading-relaxed text-[#524e4e]">
              İlk keşif ve ölçüden atölye üretimine, anahtar teslim montaja kadar tüm süreci şeffaf ve profesyonelce yönetiyoruz.
            </p>
          </div>
        </Reveal>

        <div className="relative mt-12 grid gap-5 md:grid-cols-3 md:gap-6">
          {showArrows ? (
            <svg
              className="pointer-events-none absolute left-[16%] top-8 hidden h-10 w-[68%] text-black/25 lg:block"
              viewBox="0 0 800 40"
              fill="none"
              aria-hidden="true"
            >
              <path
                d="M10 30C140 5 220 5 330 22"
                stroke="currentColor"
                strokeWidth="1.6"
                strokeDasharray="5 6"
              />
              <path
                d="M470 22C580 5 660 5 790 30"
                stroke="currentColor"
                strokeWidth="1.6"
                strokeDasharray="5 6"
              />
            </svg>
          ) : null}
          {howItWorks.map((step, i) => {
            const Icon = icons[i] ?? Search;
            return (
              <Reveal key={step.title} delay={i * 90}>
                <article
                  className={cn(
                    "relative rounded-[22px] border border-card-line bg-white px-7 py-10 text-center",
                  )}
                >
                  <span className="mx-auto mb-5 flex size-12 items-center justify-center rounded-2xl bg-fog border border-black/8 text-ink">
                    <Icon className="size-6" strokeWidth={1.6} />
                  </span>
                  <h3 className="font-display text-[20px] font-medium tracking-[-0.03em] text-ink">
                    {step.title}
                  </h3>
                  <p className="mt-2 text-[14.5px] leading-relaxed text-muted">{step.body}</p>
                </article>
              </Reveal>
            );
          })}
        </div>
      </div>
    </section>
  );
}
