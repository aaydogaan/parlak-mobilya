import { useEffect } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { useAdminStore } from "@/lib/admin/adminStore";
import { getTaleplerServerFn } from "@/lib/server/talepler";
import {
  Inbox,
  FolderKanban,
  FileText,
  Image as ImageIcon,
  TrendingUp,
  Users,
  Eye,
  ArrowUpRight,
  Clock,
  Sparkles,
  Zap,
} from "lucide-react";

export const Route = createFileRoute("/admin/dashboard")({
  component: AdminDashboardPage,
  head: () => ({
    meta: [
      { title: "Genel Bakış Dashboard - Parlak Mobilya Admin" },
      { name: "robots", content: "noindex, nofollow" },
    ],
  }),
});

function AdminDashboardPage() {
  const { talepler, setTalepler, projeler, blogPosts, galeriImages } = useAdminStore();

  useEffect(() => {
    getTaleplerServerFn()
      .then((res) => {
        if (res?.talepler) {
          setTalepler(res.talepler);
        }
      })
      .catch((err) => {
        console.error("Dashboard talepleri yüklenemedi:", err);
      });
  }, [setTalepler]);

  const newTalepler = talepler.filter((t) => t.status === "Yeni");

  return (
    <AdminLayout
      title="Genel Bakış Dashboard"
      subtitle="Parlak Mobilya & Dekorasyon dijital operasyon ve müşteri etkileşim merkezi."
      actions={
        <Link
          to="/admin/talepler"
          className="rounded-full bg-black px-5 py-2.5 text-[14px] font-semibold text-white hover:bg-zinc-800 transition shadow-sm inline-flex items-center gap-2"
        >
          <Inbox className="size-4" />
          <span>Tüm Talepleri İncele ({newTalepler.length} Yeni)</span>
        </Link>
      }
    >
      {/* 4 Main Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-8">
        <div className="rounded-[22px] bg-white p-6 border border-black/5 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-[13px] font-medium text-black/60">Bekleyen Keşif Talebi</span>
            <div className="size-9 rounded-full bg-black text-white flex items-center justify-center">
              <Inbox className="size-4.5" />
            </div>
          </div>
          <p className="mt-3 text-[32px] font-display font-semibold text-[#09090b]">
            {newTalepler.length}
          </p>
          <div className="mt-2 flex items-center gap-1.5 text-[12.5px] text-zinc-600 font-medium">
            <TrendingUp className="size-3.5" />
            <span>Toplam {talepler.length} müşteri başvurusu</span>
          </div>
        </div>

        <div className="rounded-[22px] bg-white p-6 border border-black/5 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-[13px] font-medium text-black/60">Yayındaki Projeler</span>
            <div className="size-9 rounded-full bg-zinc-100 text-zinc-900 flex items-center justify-center">
              <FolderKanban className="size-4.5" />
            </div>
          </div>
          <p className="mt-3 text-[32px] font-display font-semibold text-[#09090b]">
            {projeler.length}
          </p>
          <div className="mt-2 text-[12.5px] text-black/50">
            6 Ana Mobilya Kategorisi
          </div>
        </div>

        <div className="rounded-[22px] bg-white p-6 border border-black/5 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-[13px] font-medium text-black/60">Yayınlanmış Blog</span>
            <div className="size-9 rounded-full bg-zinc-100 text-zinc-900 flex items-center justify-center">
              <FileText className="size-4.5" />
            </div>
          </div>
          <p className="mt-3 text-[32px] font-display font-semibold text-[#09090b]">
            {blogPosts.length}
          </p>
          <div className="mt-2 text-[12.5px] text-black/50">
            SEO Rehber Makaleleri
          </div>
        </div>

        <div className="rounded-[22px] bg-white p-6 border border-black/5 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-[13px] font-medium text-black/60">Galeri Fotoğrafları</span>
            <div className="size-9 rounded-full bg-zinc-100 text-zinc-900 flex items-center justify-center">
              <ImageIcon className="size-4.5" />
            </div>
          </div>
          <p className="mt-3 text-[32px] font-display font-semibold text-[#09090b]">
            {galeriImages.length}
          </p>
          <div className="mt-2 text-[12.5px] text-black/50">
            Yayındaki Görsel
          </div>
        </div>
      </div>

      {/* 2 Column Quick Actions & Recent Table */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Son Gelen Keşif Başvuruları */}
        <div className="lg:col-span-2 bg-white rounded-[24px] border border-black/5 p-6 sm:p-7 shadow-sm">
          <div className="flex items-center justify-between pb-5 border-b border-black/5">
            <div>
              <h3 className="font-display text-[19px] font-bold text-[#09090b]">
                Son Gelen Keşif Talepleri
              </h3>
              <p className="text-[13px] text-black/50 mt-0.5">
                En son web sitesi üzerinden gönderilen başvurular.
              </p>
            </div>
            <Link
              to="/admin/talepler"
              className="text-[13px] font-semibold text-black hover:underline flex items-center gap-1"
            >
              <span>Hepsini Gör</span>
              <ArrowUpRight className="size-4" />
            </Link>
          </div>

          <div className="mt-4 divide-y divide-black/5">
            {talepler.slice(0, 4).map((t) => (
              <div key={t.id} className="py-3.5 flex items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="size-10 rounded-full bg-black text-white font-bold text-xs flex items-center justify-center shrink-0">
                    {t.name.slice(0, 2).toUpperCase()}
                  </div>
                  <div>
                    <span className="font-semibold text-[14.5px] text-[#09090b] block">
                      {t.name}
                    </span>
                    <span className="text-[12.5px] text-black/50">
                      {t.category} · {t.district}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <span className="text-[12px] text-black/40 hidden sm:inline font-mono">
                    {t.date}
                  </span>
                  <span className="px-2.5 py-1 rounded-full text-[11.5px] font-semibold bg-black text-white">
                    {t.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right 1 Col: Hızlı Kısayollar */}
        <div className="space-y-5">
          <div className="rounded-[24px] bg-black text-white p-6 sm:p-7 shadow-lg">
            <span className="text-[11px] font-semibold text-white/60 uppercase tracking-wider block font-mono">
              HIZLI İŞLEMLER
            </span>
            <h4 className="mt-2 text-[18px] font-display font-medium text-white">
              Yeni İçerik Ekle
            </h4>
            <div className="mt-5 space-y-2.5">
              <Link
                to="/admin/projeler"
                className="w-full flex items-center justify-between p-3 rounded-[14px] bg-white/10 hover:bg-white/15 text-white text-[13.5px] font-medium transition"
              >
                <span>+ Yeni Proje Ekle</span>
                <ArrowUpRight className="size-4 text-white" />
              </Link>
              <Link
                to="/admin/blog"
                className="w-full flex items-center justify-between p-3 rounded-[14px] bg-white/10 hover:bg-white/15 text-white text-[13.5px] font-medium transition"
              >
                <span>+ Yeni Blog Yazısı Yaz</span>
                <ArrowUpRight className="size-4 text-white" />
              </Link>
              <Link
                to="/admin/galeri"
                className="w-full flex items-center justify-between p-3 rounded-[14px] bg-white/10 hover:bg-white/15 text-white text-[13.5px] font-medium transition"
              >
                <span>+ Galeriye Fotoğraf Ekle</span>
                <ArrowUpRight className="size-4 text-white" />
              </Link>
            </div>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}
