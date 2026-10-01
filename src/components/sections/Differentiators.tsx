import { useState } from "react";
import { ArrowUpRight, Leaf, Layers, Package } from "lucide-react";
import { PhImg } from "@/components/media/PhImg";
import { Reveal } from "@/components/motion/Reveal";
import { differentiators } from "@/data/site";
import { cn } from "@/lib/utils";

const icons = [Package, Layers, Leaf];

export function Differentiators() {
  const [open, setOpen] = useState(0);

  return (
    <section className="bg-white py-16 md:py-24">
      <div className="container-site grid items-center gap-10 lg:grid-cols-[0.92fr_1.08fr] lg:gap-16">
        <Reveal>
          <h2 className="max-w-[380px] font-display text-[32px] font-medium leading-[1.15] tracking-[-0.04em] text-ink md:text-[40px]">
            What makes our carpentry different
          </h2>
          <p className="mt-4 max-w-[420px] text-[15.5px] leading-relaxed text-muted">
            We combine skilled craftsmanship, premium materials, and attention to detail to create
            custom carpentry.
          </p>
          <div className="mt-8 space-y-3">
            {differentiators.map((item, i) => {
              const Icon = icons[i] ?? Package;
              const active = open === i;
              return (
                <button
                  key={item.title}
                  type="button"
                  onClick={() => setOpen(i)}
                  className={cn(
                    "w-full rounded-[18px] border px-5 py-4 text-left",
                    active
                      ? "border-gold bg-gold"
                      : "border-card-line bg-white hover:border-gold/40",
                  )}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-start gap-3">
                      <Icon className="mt-0.5 size-5 shrink-0" strokeWidth={1.7} />
                      <div>
                        <p className="font-display text-[17px] font-medium tracking-[-0.03em]">
                          {item.title}
                        </p>
                        {active ? (
                          <p className="mt-1.5 max-w-[420px] text-[14px] leading-relaxed text-ink/80">
                            {item.body}
                          </p>
                        ) : null}
                      </div>
                    </div>
                    <ArrowUpRight className="size-4 shrink-0 opacity-70" />
                  </div>
                </button>
              );
            })}
          </div>
        </Reveal>
        <Reveal delay={120}>
          <div className="rounded-[28px] bg-cream p-4 md:p-6">
            <div className="img-zoom overflow-hidden rounded-[20px]">
              <div className="aspect-[5/4]">
                <PhImg alt="Carpentry workshop" />
              </div>
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
