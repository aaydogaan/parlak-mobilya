import { useState } from "react";
import { Reveal } from "@/components/motion/Reveal";
import { TestimonialCard } from "@/components/cards/TestimonialCard";
import type { Testimonial } from "@/data/site";
import { cn } from "@/lib/utils";

type Props = {
  items: Testimonial[];
  heading?: string;
  showRating?: boolean;
};

export function Testimonials({
  items,
  heading = "Müşterilerimizin Yorumları ve Deneyimleri",
  showRating = true,
}: Props) {
  const pageSize = 3;
  const pages = Math.max(1, Math.ceil(items.length / pageSize));
  const [page, setPage] = useState(0);
  const slice = items.slice(page * pageSize, page * pageSize + pageSize);

  return (
    <section className="bg-fog py-16 md:py-24">
      <div className="container-site">
        <Reveal>
          <div className="mb-10 flex flex-col gap-4 md:mb-12 md:flex-row md:items-end md:justify-between">
            <h2 className="max-w-[480px] font-display text-[30px] font-medium leading-[1.15] tracking-[-0.04em] text-ink md:text-[38px] md:whitespace-pre-line">
              {heading}
            </h2>
            {showRating ? (
              <div className="text-left md:text-right">
                <p className="font-display text-[18px] font-medium text-[#ea4335]">Google Haritalar</p>
                <p className="text-[13.5px] text-muted">Google Puanı: 5.0 / 5.0 ★ (Doğrulanmış Müşteri)</p>
              </div>
            ) : null}
          </div>
        </Reveal>
        <div className="grid gap-5 md:grid-cols-3">
          {slice.map((item, i) => (
            <Reveal key={`${item.name}-${page}`} delay={i * 80}>
              <TestimonialCard item={item} />
            </Reveal>
          ))}
        </div>
        {pages > 1 ? (
          <div className="mt-8 flex items-center justify-center gap-2">
            {Array.from({ length: pages }).map((_, i) => (
              <button
                key={i}
                type="button"
                aria-label={`Testimonials page ${i + 1}`}
                onClick={() => setPage(i)}
                className={cn(
                  "size-2 rounded-full",
                  i === page ? "bg-ink" : "bg-ink/20",
                )}
              />
            ))}
          </div>
        ) : null}
      </div>
    </section>
  );
}
