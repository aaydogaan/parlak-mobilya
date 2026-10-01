import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { useAdminStore } from "@/lib/admin/adminStore";
import {
  Upload,
  Plus,
  Trash2,
  Copy,
  Check,
  ExternalLink,
  Image as ImageIcon,
  X,
  AlertTriangle,
} from "lucide-react";

export const Route = createFileRoute("/admin/galeri")({
  component: AdminGaleriPage,
  head: () => ({
    meta: [
      { title: "Fotoğraf Galerisi - Parlak Mobilya Admin" },
      { name: "robots", content: "noindex, nofollow" },
    ],
  }),
});

export function AdminGaleriPage() {
  const { galeriImages, addGaleriImage, removeGaleriImage } = useAdminStore();
  const [copiedUrl, setCopiedUrl] = useState<string | null>(null);
  const [newUrlInput, setNewUrlInput] = useState("");
  const [deleteTargetUrl, setDeleteTargetUrl] = useState<string | null>(null);

  function copyToClipboard(url: string) {
    navigator.clipboard.writeText(url);
    setCopiedUrl(url);
    setTimeout(() => setCopiedUrl(null), 2000);
  }

  function handleAddUrl(e: React.FormEvent) {
    e.preventDefault();
    if (newUrlInput.trim()) {
      addGaleriImage(newUrlInput.trim());
      setNewUrlInput("");
    }
  }

  function confirmDelete() {
    if (deleteTargetUrl) {
      removeGaleriImage(deleteTargetUrl);
      setDeleteTargetUrl(null);
    }
  }

  return (
    <AdminLayout
      title="Fotoğraf Galerisi"
      subtitle="Web sitenizdeki galeri görsellerini buradan yönetin, yeni fotoğraflar ekleyin."
    >
      {/* Upload / Add Image Card */}
      <div className="rounded-[22px] bg-white p-6 border border-black/5 shadow-sm mb-8">
        <h3 className="font-display font-semibold text-[17px] text-[#09090b]">
          Yeni Görsel Ekle
        </h3>
        <p className="text-[13px] text-black/50 mt-0.5">
          Görsel URL adresini veya dosya yolunu galerinizde yayınlamak için ekleyin.
        </p>

        <form onSubmit={handleAddUrl} className="mt-4 flex flex-col sm:flex-row gap-3">
          <input
            type="text"
            value={newUrlInput}
            onChange={(e) => setNewUrlInput(e.target.value)}
            placeholder="Örn: /images/mutfak-dolaplari.webp"
            className="flex-1 rounded-full border border-black/15 bg-[#f7f6f1] px-5 py-3 text-[13.5px] text-ink focus:bg-white focus:outline-none focus:border-black transition"
          />
          <button
            type="submit"
            className="rounded-full bg-black px-6 py-3 text-[14px] font-semibold text-white hover:bg-zinc-800 transition shadow-sm inline-flex items-center justify-center gap-2 cursor-pointer shrink-0"
          >
            <Plus className="size-4" />
            <span>Galeriye Ekle</span>
          </button>
        </form>
      </div>

      {/* Media Grid Header */}
      <div className="flex items-center justify-between mb-4">
        <span className="text-[14px] font-semibold text-black/70">
          Yayındaki Görseller ({galeriImages.length} Adet)
        </span>
      </div>

      {/* Media Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
        {galeriImages.map((imgUrl, i) => (
          <div
            key={i}
            className="group relative aspect-square rounded-[18px] overflow-hidden bg-black border border-black/10 shadow-xs hover:shadow-md transition"
          >
            <img
              src={imgUrl}
              alt={`Galeri Fotoğrafı ${i + 1}`}
              className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
              loading="lazy"
            />

            {/* Hover Overlay */}
            <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-between p-3">
              <span className="text-[10.5px] text-white/70 font-mono truncate">
                #{i + 1}
              </span>

              <div className="flex items-center justify-center gap-2">
                <button
                  onClick={() => copyToClipboard(imgUrl)}
                  title="URL Kopyala"
                  className="size-8 rounded-full bg-white/20 text-white hover:bg-white hover:text-black flex items-center justify-center transition cursor-pointer"
                >
                  {copiedUrl === imgUrl ? (
                    <Check className="size-4 text-emerald-400" />
                  ) : (
                    <Copy className="size-4" />
                  )}
                </button>
                <button
                  onClick={() => setDeleteTargetUrl(imgUrl)}
                  title="Görseli Sil"
                  className="size-8 rounded-full bg-red-600/80 text-white hover:bg-red-600 flex items-center justify-center transition cursor-pointer"
                >
                  <Trash2 className="size-4" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Modern Delete Confirmation Popup */}
      {deleteTargetUrl && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
          <div className="relative w-full max-w-md rounded-[24px] bg-white p-6 sm:p-7 shadow-2xl border border-black/10 text-center animate-in fade-in zoom-in duration-200">
            <button
              onClick={() => setDeleteTargetUrl(null)}
              className="absolute right-4 top-4 p-2 text-black/40 hover:text-black rounded-lg cursor-pointer"
            >
              <X className="size-5" />
            </button>

            <div className="mx-auto size-12 rounded-full bg-red-50 text-red-600 flex items-center justify-center mb-4">
              <AlertTriangle className="size-6" />
            </div>

            <h3 className="text-[19px] font-display font-semibold text-[#09090b]">
              Görseli Silmek İstiyor musunuz?
            </h3>
            <p className="mt-2 text-[13.5px] text-black/60 leading-relaxed">
              Bu görsel galeriden ve projeler listesinden kaldırılacaktır. Bu işlem geri alınamaz.
            </p>

            {/* Thumbnail preview */}
            <div className="my-5 mx-auto size-28 rounded-2xl overflow-hidden border border-black/10 bg-black shadow-sm">
              <img
                src={deleteTargetUrl}
                alt="Silinecek Görsel"
                className="w-full h-full object-cover"
              />
            </div>

            <div className="flex items-center justify-center gap-3 mt-6">
              <button
                type="button"
                onClick={() => setDeleteTargetUrl(null)}
                className="flex-1 rounded-full border border-black/15 bg-white py-2.5 text-[14px] font-medium text-ink hover:bg-black/5 transition cursor-pointer"
              >
                Vazgeç
              </button>
              <button
                type="button"
                onClick={confirmDelete}
                className="flex-1 rounded-full bg-red-600 py-2.5 text-[14px] font-semibold text-white hover:bg-red-700 transition shadow-sm cursor-pointer"
              >
                Evet, Sil
              </button>
            </div>
          </div>
        </div>
      )}
    </AdminLayout>
  );
}
