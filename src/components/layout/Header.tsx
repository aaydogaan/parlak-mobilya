import { useEffect, useState } from "react";
import { Link, useRouterState } from "@tanstack/react-router";
import { Menu, X, ArrowRight, Phone } from "lucide-react";
import { Logo } from "@/components/brand/Logo";
import { GoldButton } from "@/components/ui/GoldButton";
import { site } from "@/data/site";
import { cn } from "@/lib/utils";

type Props = {
  variant?: "light" | "dark" | "transparent";
};

const navItems = [
  { label: "Ana Sayfa", href: "/" },
  { label: "Hakkımızda", href: "/hakkimizda" },
  { label: "Hizmetler", href: "/hizmetler" },
  { label: "Projeler", href: "/projeler" },
  { label: "Blog", href: "/blog" },
  { label: "Galeri", href: "/galeri" },
  { label: "İletişim", href: "/iletisim" },
] as const;

export function Header({ variant = "light" }: Props) {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [isAdminSubdomain, setIsAdminSubdomain] = useState(false);

  useEffect(() => {
    setIsAdminSubdomain(window.location.hostname.startsWith("admin."));
  }, []);

  if (isAdminSubdomain) return null;

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  const isTransparent = variant === "transparent";
  const light = variant === "light" && !isTransparent;

  const isActive = (href: string) => {
    if (href === "/") {
      return pathname === "/" || pathname === "";
    }
    if (href === "/hakkimizda") {
      return pathname === "/hakkimizda" || pathname === "/about";
    }
    if (href === "/hizmetler") {
      return pathname.startsWith("/hizmetler") || pathname.startsWith("/services");
    }
    if (href === "/projeler") {
      return pathname.startsWith("/projeler");
    }
    if (href === "/blog") {
      return pathname.startsWith("/blog");
    }
    if (href === "/galeri") {
      return pathname === "/galeri";
    }
    if (href === "/iletisim") {
      return pathname === "/iletisim" || pathname === "/contact";
    }
    return pathname === href;
  };

  return (
    <header
      className={cn(
        "z-50 transition-all duration-300 w-full",
        isTransparent
          ? cn(
              "fixed top-0 left-0 right-0",
              scrolled
                ? "bg-black/85 backdrop-blur-md py-3 shadow-lg border-b border-white/10"
                : "bg-transparent py-4 sm:py-6 lg:py-8"
            )
          : cn("relative pt-7 md:pt-8 pb-3 md:pb-4", light ? "bg-white" : "bg-[#271d12]")
      )}
    >
      <div className="container-site flex items-center justify-between gap-4">
        <Logo light={!light} />

        {/* Desktop Menü: WordPress Menüsü ile Birebir Aynı, Açılır Menü Yok */}
        <nav className={cn("hidden items-center gap-7 lg:flex font-['Lexend']", light ? "text-ink" : "text-white")}>
          {navItems.map((item) => {
            const active = isActive(item.href);
            return (
              <Link
                key={item.href}
                to={item.href}
                className={cn(
                  "nav-link transition-colors duration-200 text-[15px] font-medium tracking-normal",
                  active
                    ? light
                      ? "is-active font-bold text-ink underline decoration-2 underline-offset-8"
                      : "is-active font-bold text-white underline decoration-2 underline-offset-8"
                    : "opacity-80 hover:opacity-100"
                )}
              >
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div className="flex items-center gap-3">
          <GoldButton to="/iletisim" className="hidden sm:inline-flex font-['Lexend'] font-medium">
            Hızlı Teklif Al
          </GoldButton>
          <button
            type="button"
            className={cn(
              "inline-flex size-10 items-center justify-center rounded-full lg:hidden cursor-pointer",
              light ? "text-ink" : "text-white",
            )}
            aria-label={open ? "Menüyü Kapat" : "Menüyü Aç"}
            onClick={() => setOpen((v) => !v)}
          >
            {open ? <X className="size-6" /> : <Menu className="size-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Menü: Tam Ekran Kusursuz Siyah Panel (Üstte boşluk kalmaz, logo ve butonlar siyah zeminle bütünleşir) */}
      {open ? (
        <div className="fixed inset-0 z-[100] bg-black text-white flex flex-col lg:hidden animate-in fade-in duration-200">
          {/* Üst Bar: Logo ve Kapat Butonu */}
          <div className="container-site flex items-center justify-between py-5 border-b border-white/10">
            <Logo light={true} />
            <button
              type="button"
              className="inline-flex size-10 items-center justify-center rounded-full text-white hover:bg-white/10 transition-colors cursor-pointer"
              aria-label="Menüyü Kapat"
              onClick={() => setOpen(false)}
            >
              <X className="size-6 text-white" />
            </button>
          </div>

          {/* Menü Linkleri */}
          <div className="container-site flex-1 flex flex-col justify-between py-6 overflow-y-auto font-['Lexend']">
            <div className="flex flex-col gap-1">
              {navItems.map((item) => {
                const active = isActive(item.href);
                return (
                  <Link
                    key={item.href}
                    to={item.href}
                    onClick={() => setOpen(false)}
                    className={cn(
                      "py-3.5 text-[18px] sm:text-[20px] font-medium tracking-tight transition-all duration-200 border-b border-white/10 flex items-center justify-between",
                      active
                        ? "text-white font-bold pl-2 border-l-2 border-l-amber-500"
                        : "text-white/80 hover:text-white hover:pl-2"
                    )}
                  >
                    <span>{item.label}</span>
                    <ArrowRight className="size-4 opacity-40" />
                  </Link>
                );
              })}
            </div>

            {/* Alt Butonlar & İletişim */}
            <div className="mt-6 pt-4 flex flex-col gap-3">
              <GoldButton
                to="/iletisim"
                onClick={() => setOpen(false)}
                className="w-full justify-center py-4 text-[15px] font-semibold"
              >
                Hızlı Teklif Al
              </GoldButton>
              <a
                href={`tel:${site.phoneRaw}`}
                className="inline-flex items-center justify-center gap-2 py-3 rounded-full border border-white/15 text-[14px] text-white/85 hover:text-white hover:border-white/30 transition font-medium"
              >
                <Phone className="size-4 text-amber-500" />
                <span>Hemen Ara: {site.phone}</span>
              </a>
            </div>
          </div>
        </div>
      ) : null}
    </header>
  );
}
