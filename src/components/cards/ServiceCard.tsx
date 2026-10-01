import { Link } from "@tanstack/react-router";
import type { Service } from "@/data/site";

export function ServiceCard({ service }: { service: Service }) {
  return (
    <Link
      to="/projeler/$slug"
      params={{ slug: service.slug }}
      className="group relative block overflow-hidden rounded-[20px] aspect-[1.03/1] shadow-sm cursor-pointer"
    >
      {/* Arka plan görseli */}
      {service.image ? (
        <img
          src={service.image}
          alt={service.title}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
          loading="lazy"
        />
      ) : (
        <div className="w-full h-full bg-[#271d12]" />
      )}

      {/* Karartma Gradient'i (Framer stili alttan üste) */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/35 to-transparent" />

      {/* Metin İçeriği */}
      <div className="absolute inset-x-0 bottom-0 p-6 md:p-7 flex flex-col justify-end">
        <h3 className="font-['Lexend'] text-[20px] md:text-[22px] font-semibold text-white tracking-[-0.5px]">
          {service.title}
        </h3>
        <p className="mt-2 font-['Lexend'] text-[14px] font-light leading-[1.6] text-white/80 line-clamp-2">
          {service.description}
        </p>
      </div>
    </Link>
  );
}
