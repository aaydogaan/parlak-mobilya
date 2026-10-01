import { useState, useEffect, useRef } from "react";
import { Phone, MapPin, X, MessageCircle } from "lucide-react";
import { useLocation } from "@tanstack/react-router";

export function FloatingChatyWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const widgetRef = useRef<HTMLDivElement>(null);
  const location = useLocation();

  // Admin panelinde veya admin subdomain'de gösterme
  const isAdmin =
    location.pathname.startsWith("/admin") ||
    (typeof window !== "undefined" && window.location.hostname.startsWith("admin."));

  // Dışarı tıklayınca kapat
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (widgetRef.current && !widgetRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  if (isAdmin) {
    return null;
  }

  const channels = [
    {
      id: "whatsapp",
      name: "WhatsApp",
      subtitle: "Hemen Mesaj Yazın",
      icon: (
        <svg className="size-6 fill-current" viewBox="0 0 24 24">
          <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.414-.003 6.557-5.338 11.892-11.893 11.892-1.99-.001-3.951-.5-5.688-1.448l-6.305 1.654zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884-.001 2.225.651 3.891 1.746 5.634l-.999 3.648 3.742-.981zm11.387-5.464c-.074-.124-.272-.198-.57-.347-.297-.149-1.758-.868-2.031-.967-.272-.099-.47-.149-.669.149-.198.297-.768.967-.941 1.165-.173.198-.347.223-.644.074-.297-.149-1.255-.462-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.297-.347.446-.521.151-.172.2-.296.3-.495.099-.198.05-.372-.025-.521-.075-.148-.669-1.611-.916-2.206-.242-.579-.487-.501-.669-.51l-.57-.01c-.198 0-.52.074-.792.372s-1.04 1.016-1.04 2.479 1.065 2.876 1.213 3.074c.149.198 2.095 3.2 5.076 4.487.709.306 1.263.489 1.694.626.712.226 1.36.194 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.695.248-1.29.173-1.414z" />
        </svg>
      ),
      bgColor: "bg-[#25D366] hover:bg-[#20ba5a] text-white shadow-emerald-500/20",
      href: "https://wa.me/905071721196?text=Merhaba%20Ahmet%20Usta,%20web%20sitenizden%20ula%C5%9F%C4%B1yorum.%20Mobilya%20projemiz%20i%C3%A7in%20bilgi%20almak%20istiyorum.",
      target: "_blank",
    },
    {
      id: "phone",
      name: "Hemen Ara",
      subtitle: "0507 172 11 96",
      icon: <Phone className="size-5.5 text-white" />,
      bgColor: "bg-[#0d1a15] hover:bg-[#183427] text-white shadow-black/20",
      href: "tel:+905071721196",
      target: "_self",
    },
    {
      id: "location",
      name: "Atölye Konumu",
      subtitle: "Selçuklu / Konya",
      icon: <MapPin className="size-5.5 text-white" />,
      bgColor: "bg-[#ea4335] hover:bg-[#d33828] text-white shadow-red-500/20",
      href: "https://maps.google.com/?q=Horozluhan+Mah.+Saraycık+Sok.+No:50+Selçuklu+Konya",
      target: "_blank",
    },
  ];

  return (
    <div
      ref={widgetRef}
      className="fixed bottom-4 right-4 sm:bottom-7 sm:right-7 z-50 flex flex-col items-end select-none font-['Lexend',sans-serif]"
    >
      {/* Açılan Kanallar Menüsü (Chaty Style Popout) */}
      <div
        className={`flex flex-col items-end gap-2.5 sm:gap-3 mb-3 sm:mb-3.5 transition-all duration-300 origin-bottom-right ${
          isOpen
            ? "opacity-100 scale-100 pointer-events-auto translate-y-0"
            : "opacity-0 scale-75 pointer-events-none translate-y-4"
        }`}
      >
        {channels.map((channel, index) => (
          <a
            key={channel.id}
            href={channel.href}
            target={channel.target}
            rel={channel.target === "_blank" ? "noreferrer" : undefined}
            onClick={() => setIsOpen(false)}
            style={{
              transitionDelay: isOpen ? `${index * 50}ms` : "0ms",
            }}
            className={`group flex items-center gap-2.5 sm:gap-3 transition-all duration-200 ${
              isOpen ? "translate-x-0 opacity-100" : "translate-x-4 opacity-0"
            }`}
          >
            {/* Tooltip / Açıklama Etiketi */}
            <div className="bg-white/95 backdrop-blur-md px-2.5 py-1 sm:px-3.5 sm:py-1.5 rounded-full shadow-md border border-black/5 text-right transition-transform group-hover:scale-105">
              <span className="text-[11px] sm:text-[13px] font-bold text-[#0d1a15] block leading-tight">
                {channel.name}
              </span>
              <span className="text-[9.5px] sm:text-[11px] text-black/50 block font-medium">
                {channel.subtitle}
              </span>
            </div>

            {/* Kanal Butonu */}
            <div
              className={`size-10 sm:size-13 rounded-full flex items-center justify-center shadow-lg transition-transform duration-200 group-hover:scale-110 active:scale-95 ${channel.bgColor}`}
            >
              {channel.icon}
            </div>
          </a>
        ))}
      </div>

      {/* Ana Tetikleyici Buton (Chaty Floating Action Button) */}
      <div className="relative">
        {/* Dalga / Pulse Efekti */}
        {!isOpen && (
          <span className="absolute -inset-1 rounded-full bg-[#25D366] opacity-40 animate-ping pointer-events-none" />
        )}

        <button
          onClick={() => setIsOpen(!isOpen)}
          aria-label={isOpen ? "İletişim Menüsünü Kapat" : "Hızlı İletişim Menüsü"}
          className={`relative size-11 sm:size-15 rounded-full shadow-xl sm:shadow-2xl flex items-center justify-center transition-all duration-300 cursor-pointer active:scale-95 ${
            isOpen
              ? "bg-[#0d1a15] text-white rotate-90 shadow-black/30"
              : "bg-[#25D366] text-white hover:bg-[#20ba5a] shadow-emerald-600/40 hover:scale-105"
          }`}
        >
          {isOpen ? (
            <X className="size-5 sm:size-6.5 text-white" />
          ) : (
            <div className="relative flex items-center justify-center">
              {/* WhatsApp İkonu */}
              <svg className="size-5.5 sm:size-7.5 fill-current" viewBox="0 0 24 24">
                <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.414-.003 6.557-5.338 11.892-11.893 11.892-1.99-.001-3.951-.5-5.688-1.448l-6.305 1.654zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884-.001 2.225.651 3.891 1.746 5.634l-.999 3.648 3.742-.981zm11.387-5.464c-.074-.124-.272-.198-.57-.347-.297-.149-1.758-.868-2.031-.967-.272-.099-.47-.149-.669.149-.198.297-.768.967-.941 1.165-.173.198-.347.223-.644.074-.297-.149-1.255-.462-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.297-.347.446-.521.151-.172.2-.296.3-.495.099-.198.05-.372-.025-.521-.075-.148-.669-1.611-.916-2.206-.242-.579-.487-.501-.669-.51l-.57-.01c-.198 0-.52.074-.792.372s-1.04 1.016-1.04 2.479 1.065 2.876 1.213 3.074c.149.198 2.095 3.2 5.076 4.487.709.306 1.263.489 1.694.626.712.226 1.36.194 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.695.248-1.29.173-1.414z" />
              </svg>
            </div>
          )}
        </button>
      </div>
    </div>
  );
}
