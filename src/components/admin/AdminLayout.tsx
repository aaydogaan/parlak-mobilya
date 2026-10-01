import { type ReactNode, useState, useEffect } from "react";
import { Link, useLocation, useNavigate } from "@tanstack/react-router";
import {
  LayoutDashboard,
  Inbox,
  FolderKanban,
  FileText,
  Image as ImageIcon,
  Settings,
  ExternalLink,
  LogOut,
  Zap,
  Menu,
  X,
  ChevronRight,
  ShieldAlert,
} from "lucide-react";
import { useAdminStore } from "@/lib/admin/adminStore";
import { AdminLoginPage } from "@/routes/admin/login";
import { getGaleriImagesServerFn } from "@/lib/server/galeri";

interface Props {
  children: ReactNode;
  title: string;
  subtitle?: string;
  actions?: ReactNode;
  stickyHeader?: boolean;
}

export function AdminLayout({
  children,
  title,
  subtitle,
  actions,
  stickyHeader = true,
}: Props) {
  const location = useLocation();
  const {
    isAuthenticated,
    logout,
    talepler,
    projeler,
    galeriImages,
    setGaleriImages,
    checkSession,
    authChecked,
    adminUser,
  } = useAdminStore();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    checkSession();

    // Live sync actual gallery count from database
    getGaleriImagesServerFn()
      .then((imgs) => {
        if (imgs && Array.isArray(imgs)) {
          setGaleriImages(imgs);
        }
      })
      .catch(() => {});

    // Google ve arama motorlarının admin paneli indekslemesini engelle
    let metaRobots = document.querySelector<HTMLMetaElement>('meta[name="robots"]');
    if (!metaRobots) {
      metaRobots = document.createElement("meta");
      metaRobots.name = "robots";
      document.head.appendChild(metaRobots);
    }
    metaRobots.content = "noindex, nofollow";
  }, [checkSession]);

  if (!mounted || !authChecked) {
    return (
      <div className="min-h-screen bg-[#faf8f5] flex items-center justify-center font-['Lexend',sans-serif]">
        <div className="flex flex-col items-center gap-3">
          <div className="size-9 rounded-full border-2 border-black border-t-transparent animate-spin" />
          <p className="text-[13px] font-medium text-black/60">Güvenli oturum doğrulanıyor...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <AdminLoginPage />;
  }

  const newTaleplerCount = talepler.filter((t) => t.status === "Yeni").length;

  const navItems = [
    {
      to: "/admin/dashboard",
      label: "Genel Bakış",
      icon: LayoutDashboard,
      active: location.pathname === "/admin/dashboard" || location.pathname === "/admin",
    },
    {
      to: "/admin/talepler",
      label: "Keşif Talepleri",
      icon: Inbox,
      badge: newTaleplerCount > 0 ? newTaleplerCount : undefined,
      active: location.pathname.startsWith("/admin/talepler"),
    },
    {
      to: "/admin/projeler",
      label: "Projelerimiz",
      icon: FolderKanban,
      count: projeler.length,
      active: location.pathname.startsWith("/admin/projeler"),
    },
    {
      to: "/admin/blog",
      label: "Blog Yazıları",
      icon: FileText,
      active: location.pathname.startsWith("/admin/blog"),
    },
    {
      to: "/admin/galeri",
      label: "Galeri",
      icon: ImageIcon,
      count: galeriImages.length,
      active: location.pathname.startsWith("/admin/galeri"),
    },
  ];

  const settingItems = [
    {
      to: "/admin/ayarlar",
      label: "Site Ayarları",
      icon: Settings,
      active: location.pathname.startsWith("/admin/ayarlar"),
    },
  ];

  return (
    <div className="min-h-screen bg-[#f7f6f1] text-[#09090b] flex flex-col md:flex-row font-['Lexend',sans-serif]">
      {/* Mobile Top Header */}
      <div className="md:hidden bg-black text-white px-4 py-3.5 flex items-center justify-between border-b border-white/10 sticky top-0 z-40">
        <div className="flex items-center gap-3">
          <img
            src="/images/logo-header.png"
            alt="Parlak Mobilya"
            className="h-6 w-auto object-contain brightness-0 invert"
          />
          <span className="font-semibold text-[15px] tracking-tight text-white/90">Admin Panel</span>
        </div>
        <button
          onClick={() => setMobileOpen(!mobileOpen)}
          className="p-2 rounded-xl bg-white/10 text-white hover:bg-white/20 transition cursor-pointer"
          aria-label="Menüyü Aç/Kapat"
        >
          {mobileOpen ? <X className="size-5" /> : <Menu className="size-5" />}
        </button>
      </div>

      {/* Mobile Drawer Backdrop Overlay */}
      {mobileOpen && (
        <div
          onClick={() => setMobileOpen(false)}
          className="fixed inset-0 bg-black/60 backdrop-blur-xs z-45 md:hidden animate-in fade-in duration-200"
        />
      )}

      {/* Sidebar - Sleek Deep Black */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 w-[270px] bg-black text-[#a1a1aa] flex flex-col justify-between p-5 transition-transform duration-300 ease-in-out md:static md:translate-x-0 ${
          mobileOpen ? "translate-x-0 shadow-2xl" : "-translate-x-full"
        }`}
      >
        <div>
          {/* Brand Logo & ADMIN Pill */}
          <div className="flex items-center justify-between pb-5 pt-1 border-b border-white/10">
            <Link to="/admin/dashboard" onClick={() => setMobileOpen(false)} className="flex items-center gap-2 group">
              <img
                src="/images/logo-header.png"
                alt="Parlak Mobilya"
                className="h-7 max-w-[150px] w-auto object-contain brightness-0 invert"
              />
            </Link>
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full bg-white/15 text-white text-[10px] font-bold tracking-wider uppercase border border-white/20">
                ADMIN
              </span>
              <button
                onClick={() => setMobileOpen(false)}
                className="md:hidden p-1 text-white/50 hover:text-white cursor-pointer"
              >
                <X className="size-4" />
              </button>
            </div>
          </div>

          {/* Nav Group 1: MAIN */}
          <div className="mt-6">
            <span className="text-[11px] font-semibold text-white/40 tracking-wider uppercase px-3 block mb-2 font-mono">
              ANA MENÜ
            </span>
            <nav className="space-y-1">
              {navItems.map((item) => {
                const Icon = item.icon;
                return (
                  <Link
                    key={item.to}
                    to={item.to}
                    onClick={() => setMobileOpen(false)}
                    className={`flex items-center justify-between px-3.5 py-2.5 rounded-[14px] text-[14px] font-medium transition-all ${
                      item.active
                        ? "bg-[#18181b] text-white shadow-sm font-semibold border-l-4 border-white"
                        : "hover:bg-white/5 hover:text-white"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <Icon className={`size-[18px] ${item.active ? "text-white" : "text-white/60"}`} />
                      <span>{item.label}</span>
                    </div>
                    {item.badge ? (
                      <span className="px-2 py-0.5 rounded-full bg-white text-black text-[11px] font-bold">
                        {item.badge}
                      </span>
                    ) : item.count !== undefined ? (
                      <span className="text-[12px] text-white/40 font-mono">
                        {item.count}
                      </span>
                    ) : null}
                  </Link>
                );
              })}
            </nav>
          </div>

          {/* Nav Group 2: SYSTEM & SETTINGS */}
          <div className="mt-8">
            <span className="text-[11px] font-semibold text-white/40 tracking-wider uppercase px-3 block mb-2 font-mono">
              AYARLAR & SİSTEM
            </span>
            <nav className="space-y-1">
              {settingItems.map((item) => {
                const Icon = item.icon;
                return (
                  <Link
                    key={item.to}
                    to={item.to}
                    onClick={() => setMobileOpen(false)}
                    className={`flex items-center justify-between px-3.5 py-2.5 rounded-[14px] text-[14px] font-medium transition-all ${
                      item.active
                        ? "bg-[#18181b] text-white shadow-sm font-semibold border-l-4 border-white"
                        : "hover:bg-white/5 hover:text-white"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <Icon className={`size-[18px] ${item.active ? "text-white" : "text-white/60"}`} />
                      <span>{item.label}</span>
                    </div>
                  </Link>
                );
              })}

              <a
                href="/"
                target="_blank"
                rel="noreferrer"
                className="flex items-center justify-between px-3.5 py-2.5 rounded-[14px] text-[14px] font-medium hover:bg-white/5 hover:text-white transition text-white/70"
              >
                <div className="flex items-center gap-3">
                  <ExternalLink className="size-[18px] text-white/50" />
                  <span>Canlı Siteyi Gör</span>
                </div>
                <ChevronRight className="size-3.5 text-white/30" />
              </a>
            </nav>
          </div>
        </div>

        {/* Bottom User / Logout */}
        <div className="mt-6 pt-4 border-t border-white/10">
          <div className="flex items-center justify-between px-1">
            <div className="flex items-center gap-2.5 overflow-hidden">
              <div className="size-8 rounded-full bg-[#18181b] border border-white/20 flex items-center justify-center text-white text-xs font-bold shrink-0">
                AP
              </div>
              <div className="truncate">
                <span className="text-[13px] font-medium text-white block truncate">
                  {adminUser?.name || "Ahmet Parlak"}
                </span>
                <span className="text-[11px] text-white/50 block truncate">
                  {adminUser?.email || "Yönetici"}
                </span>
              </div>
            </div>
            <button
              onClick={async () => {
                await logout();
              }}
              title="Çıkış Yap"
              className="p-2 text-white/50 hover:text-white hover:bg-white/5 rounded-lg transition cursor-pointer"
            >
              <LogOut className="size-4" />
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col min-w-0 overflow-y-auto">
        {/* Top Breadcrumb / Action Bar */}
        <header
          className={`px-6 py-6 sm:px-8 md:py-8 flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-black/5 bg-white/60 backdrop-blur-sm ${
            stickyHeader ? "sticky top-0 z-30" : ""
          }`}
        >
          <div>
            <h1 className="text-[26px] sm:text-[30px] font-display font-semibold tracking-[-0.03em] text-[#09090b]">
              {title}
            </h1>
            {subtitle && (
              <p className="mt-1 text-[14px] text-black/50">
                {subtitle}
              </p>
            )}
          </div>
          {actions && <div className="flex items-center gap-3 shrink-0">{actions}</div>}
        </header>

        {/* Page Body */}
        <div className="flex-1 p-6 sm:p-8 max-w-[1600px] w-full mx-auto">
          {children}
        </div>
      </main>
    </div>
  );
}
