import { useState } from "react";
import { Plus } from "lucide-react";
import { cn } from "@/lib/utils";

type Item = { title: string; body: string };

export function LegalAccordion({ items, intro }: { items: Item[]; intro: string }) {
  const [open, setOpen] = useState(0);

  return (
    <div className="mx-auto max-w-[820px]">
      <p className="text-[13.5px] text-muted">Last Updated: June 6, 2026</p>
      <p className="mt-6 text-[16px] leading-relaxed text-subtle">{intro}</p>
      <div className="mt-10 divide-y divide-line border-t border-b border-line">
        {items.map((item, i) => {
          const active = open === i;
          return (
            <div key={item.title}>
              <button
                type="button"
                onClick={() => setOpen(active ? -1 : i)}
                className="flex w-full items-center justify-between gap-4 py-5 text-left"
              >
                <span className="font-display text-[20px] font-medium tracking-[-0.03em] text-ink md:text-[24px]">
                  {item.title}
                </span>
                <Plus
                  className={cn(
                    "size-5 shrink-0 text-ink",
                    active && "rotate-45",
                  )}
                />
              </button>
              {active ? (
                <p className="pb-6 text-[15.5px] leading-relaxed text-subtle">{item.body}</p>
              ) : null}
            </div>
          );
        })}
      </div>
    </div>
  );
}
