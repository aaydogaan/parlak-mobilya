import { cn } from "@/lib/utils";

type Props = {
  title: string;
  subtitle?: string;
  eyebrow?: string;
  className?: string;
};

export function PageHero({ title, subtitle, eyebrow, className }: Props) {
  return (
    <div className={cn("bg-brown px-5 pb-16 pt-6 text-center md:pb-20 md:pt-8", className)}>
      {eyebrow ? (
        <p className="mb-4 inline-flex rounded-full border border-white/15 px-3 py-1 text-[12.5px] text-white/80">
          {eyebrow}
        </p>
      ) : null}
      <h1 className="mx-auto max-w-[820px] font-display text-[40px] font-medium leading-[1.12] tracking-[-0.04em] text-white md:text-[56px]">
        {title}
      </h1>
      {subtitle ? (
        <p className="mx-auto mt-4 max-w-[520px] text-[15.5px] leading-relaxed text-white/70">
          {subtitle}
        </p>
      ) : null}
    </div>
  );
}
