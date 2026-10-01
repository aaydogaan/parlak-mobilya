import type { Testimonial } from "@/data/site";

export function TestimonialCard({ item }: { item: Testimonial }) {
  return (
    <article className="flex h-full flex-col justify-between rounded-[20px] bg-white p-6 sm:p-7 shadow-[0_4px_25px_rgba(13,1,0,0.04)] border border-black/[0.04]">
      <div>
        <span className="font-['Lexend'] text-[38px] leading-none text-ink font-serif block select-none">
          “
        </span>
        <h3 className="mt-2 font-['Lexend'] text-[18px] sm:text-[19px] font-semibold tracking-[-0.3px] text-[#0d0100]">
          {item.title}
        </h3>
        <p className="mt-3 text-[14.5px] font-['Lexend'] font-light leading-[1.65] text-[#524e4e]">
          “{item.quote}”
        </p>
      </div>

      <div className="mt-6 pt-4 border-t border-black/[0.05] flex items-center gap-3">
        {item.avatar ? (
          <img
            src={item.avatar}
            alt={item.name}
            className="size-11 rounded-full object-cover ring-2 ring-black/10"
            loading="lazy"
          />
        ) : (
          <div className="size-11 rounded-full bg-fog text-ink border border-black/10 flex items-center justify-center font-bold text-sm">
            {item.name[0]}
          </div>
        )}
        <div>
          <p className="font-['Lexend'] text-[14.5px] font-medium text-[#0d0100]">{item.name}</p>
          <p className="font-['Lexend'] text-[12.5px] text-[#908c8c]">{item.role}</p>
        </div>
      </div>
    </article>
  );
}
