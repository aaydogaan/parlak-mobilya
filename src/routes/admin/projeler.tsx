import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { useAdminStore } from "@/lib/admin/adminStore";
import type { ProjectDetail } from "@/data/projects";
import {
  Plus,
  Search,
  Trash2,
  Edit3,
  ExternalLink,
  Eye,
  CheckCircle2,
  X,
  Upload,
  Image as ImageIcon,
  AlertTriangle,
} from "lucide-react";

export const Route = createFileRoute("/admin/projeler")({
  component: AdminProjelerPage,
  head: () => ({
    meta: [
      { title: "Projeler Yönetimi - Parlak Mobilya Admin" },
      { name: "robots", content: "noindex, nofollow" },
    ],
  }),
});

export function AdminProjelerPage() {
  const { projeler, addProje, updateProje, deleteProje } = useAdminStore();
  const [searchQuery, setSearchQuery] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingSlug, setEditingSlug] = useState<string | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<ProjectDetail | null>(null);

  // Form State
  const [formTitle, setFormTitle] = useState("");
  const [formSlug, setFormSlug] = useState("");
  const [formCategory, setFormCategory] = useState("Mutfak Dolapları");
  const [formMetaDesc, setFormMetaDesc] = useState("");
  const [formHeroImage, setFormHeroImage] = useState("");
  const [formGalleryImages, setFormGalleryImages] = useState<string[]>([]);
  const [galleryInput, setGalleryInput] = useState("");

  const filteredProjects = projeler.filter((p) =>
    p.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    p.category.toLowerCase().includes(searchQuery.toLowerCase())
  );

  function openCreateModal() {
    setEditingSlug(null);
    setFormTitle("");
    setFormSlug("");
    setFormCategory("Mutfak Dolapları");
    setFormMetaDesc("");
    setFormHeroImage("/images/mutfak-dolaplari.webp");
    setFormGalleryImages([]);
    setIsModalOpen(true);
  }

  function openEditModal(project: ProjectDetail) {
    setEditingSlug(project.slug);
    setFormTitle(project.title);
    setFormSlug(project.slug);
    setFormCategory(project.category);
    setFormMetaDesc(project.metaDesc);
    setFormHeroImage(project.heroImage);
    setFormGalleryImages(project.gallery || []);
    setIsModalOpen(true);
  }

  function handleSaveProject(e: React.FormEvent) {
    e.preventDefault();
    const slug = formSlug.trim() || formTitle.toLowerCase().replace(/[^a-z0-9]+/g, "-");

    if (editingSlug) {
      updateProje(editingSlug, {
        title: formTitle,
        category: formCategory,
        metaDesc: formMetaDesc,
        heroImage: formHeroImage,
        gallery: formGalleryImages,
      });
    } else {
      const newProject: ProjectDetail = {
        slug,
        title: formTitle,
        category: formCategory,
        metaTitle: `${formTitle} - Parlak Mobilya ve Dekorasyon`,
        metaDesc: formMetaDesc,
        heroImage: formHeroImage || "/images/mutfak-dolaplari.webp",
        specs: {
          "Gövde Malzemesi": "1. Sınıf E1 Kalite MDF Lam",
          "Kapak Seçeneği": "Mat / Parlak Lake & Akrilik",
          "Mekanizma": "Frenli Samet / Blum Ray Sistemleri",
          "Garanti": "İşçilik ve Montaj Garantisi",
        },
        headings: ["Özel Tasarım & Mimari İmalat", "Kullanılan Malzeme Kalitesi", "Montaj Süreci"],
        paragraphs: [
          formMetaDesc,
          "Konya atölyemizde Ahmet Usta gözetiminde üretilen bu projede milimetrik hassasiyet ve birinci sınıf işçilik uygulanmıştır.",
          "Müşterimizin mekan ölçülerine ve kullanım alışkanlıklarına göre özel olarak planlanıp teslim edilmiştir.",
        ],
        faqs: [
          {
            question: "Keşif ve ölçülendirme ücretli mi?",
            answer: "Konya merkez ilçelerinde (Selçuklu, Meram, Karatay) keşif ve ölçülendirme tamamen ücretsizdir.",
          },
          {
            question: "Üretim ve montaj süresi ne kadar sürer?",
            answer: "Tasarım onayından sonra 15-25 iş günü içerisinde teslim edilir.",
          },
        ],
        gallery: formGalleryImages.length > 0 ? formGalleryImages : [formHeroImage || "/images/mutfak-dolaplari.webp"],
      };
      addProje(newProject);
    }
    setIsModalOpen(false);
  }

  return (
    <AdminLayout
      title="Projeler Yönetimi"
      subtitle="Sitede yayınlanan tüm özel ölçü mobilya ve anahtar teslim projelerini düzenleyin."
      actions={
        <button
          onClick={openCreateModal}
          className="inline-flex items-center gap-2 rounded-full bg-black px-5 py-2.5 text-[14px] font-semibold text-white hover:bg-zinc-800 transition shadow-sm cursor-pointer"
        >
          <Plus className="size-4" />
          <span>Yeni Proje Ekle</span>
        </button>
      }
    >
      {/* Search Bar */}
      <div className="bg-white rounded-[20px] p-4 border border-black/5 shadow-sm mb-6 flex items-center justify-between gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 size-4 text-black/40" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Proje adı veya kategori ara..."
            className="w-full rounded-full bg-[#f7f6f1] border border-black/5 py-2 pl-10 pr-4 text-[13.5px] text-ink placeholder-black/40 focus:bg-white focus:outline-none"
          />
        </div>
        <span className="text-[13px] text-black/50 font-medium">
          Toplam {filteredProjects.length} Proje
        </span>
      </div>

      {/* Projects Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredProjects.map((p) => (
          <div
            key={p.slug}
            className="group rounded-[22px] bg-white border border-black/5 p-5 shadow-sm hover:shadow-md transition flex flex-col justify-between"
          >
            <div>
              {/* Hero Image */}
              <div className="relative aspect-[16/10] rounded-[16px] overflow-hidden bg-black mb-4">
                <img
                  src={p.heroImage}
                  alt={p.title}
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                />
                <span className="absolute top-3 left-3 rounded-full bg-white/90 backdrop-blur-md px-3 py-1 text-[11px] font-semibold text-black">
                  {p.category}
                </span>
              </div>

              {/* Title & Excerpt */}
              <h3 className="font-display font-semibold text-[17px] text-[#09090b] leading-snug">
                {p.title}
              </h3>
              <p className="mt-1.5 text-[13px] text-black/60 line-clamp-2 leading-relaxed">
                {p.metaDesc}
              </p>
            </div>

            {/* Actions */}
            <div className="mt-5 pt-4 border-t border-black/5 flex items-center justify-between">
              <a
                href={`/projeler/${p.slug}`}
                target="_blank"
                rel="noreferrer"
                className="text-[13px] font-medium text-black/60 hover:text-black transition inline-flex items-center gap-1"
              >
                <span>Sitede Gör</span>
                <ExternalLink className="size-3.5" />
              </a>

              <div className="flex items-center gap-1.5">
                <button
                  onClick={() => openEditModal(p)}
                  className="p-2 text-black/70 hover:text-black hover:bg-black/5 rounded-lg transition"
                  title="Düzenle"
                >
                  <Edit3 className="size-4" />
                </button>
                <button
                  onClick={() => setDeleteTarget(p)}
                  className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition cursor-pointer"
                  title="Sil"
                >
                  <Trash2 className="size-4" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Create / Edit Project Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 overflow-y-auto">
          <div className="relative w-full max-w-2xl rounded-[24px] bg-white p-6 sm:p-8 shadow-2xl border border-black/10 my-8">
            <div className="flex items-center justify-between pb-4 border-b border-black/10">
              <h3 className="font-display font-bold text-[20px] text-[#09090b]">
                {editingSlug ? "Projeyi Düzenle" : "Yeni Proje Ekle"}
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-2 text-black/40 hover:text-black rounded-lg cursor-pointer"
              >
                <X className="size-5" />
              </button>
            </div>

            <form onSubmit={handleSaveProject} className="mt-6 space-y-4 text-[14px]">
              <div>
                <label className="block text-[13px] font-medium text-black/70 mb-1.5">
                  Proje Başlığı
                </label>
                <input
                  type="text"
                  value={formTitle}
                  onChange={(e) => setFormTitle(e.target.value)}
                  placeholder="Örn: Konya Özel Ölçü Ada Mutfak Dolabı"
                  required
                  className="w-full rounded-[14px] border border-black/15 px-4 py-2.5 text-[14px] text-ink focus:outline-none focus:border-black"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[13px] font-medium text-black/70 mb-1.5">
                    Kategori
                  </label>
                  <select
                    value={formCategory}
                    onChange={(e) => setFormCategory(e.target.value)}
                    className="w-full rounded-[14px] border border-black/15 px-4 py-2.5 text-[14px] text-ink focus:outline-none cursor-pointer"
                  >
                    <option value="Mutfak Dolapları">Mutfak Dolapları</option>
                    <option value="Yatak Odası & Gardırop">Gardırop Modelleri</option>
                    <option value="Antre & Vestiyer">Vestiyer Modelleri</option>
                    <option value="Salon & Yaşam Alanı">TV Üniteleri</option>
                    <option value="Genç & Çocuk Odası">Çocuk Odası</option>
                    <option value="Anahtar Teslim Yenileme">Komple Ev Yenileme</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[13px] font-medium text-black/70 mb-1.5">
                    Kapak Görseli URL
                  </label>
                  <input
                    type="text"
                    value={formHeroImage}
                    onChange={(e) => setFormHeroImage(e.target.value)}
                    placeholder="/images/mutfak-dolaplari.webp"
                    required
                    className="w-full rounded-[14px] border border-black/15 px-4 py-2.5 text-[14px] text-ink focus:outline-none focus:border-black"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[13px] font-medium text-black/70 mb-1.5">
                  Proje Açıklaması & Özeti
                </label>
                <textarea
                  value={formMetaDesc}
                  onChange={(e) => setFormMetaDesc(e.target.value)}
                  placeholder="Projenin detayları, kullanılan malzemeler, mekan özellikleri..."
                  rows={3}
                  required
                  className="w-full rounded-[14px] border border-black/15 px-4 py-2.5 text-[14px] text-ink focus:outline-none focus:border-black"
                />
              </div>

              {/* Gallery Photos URL Adder */}
              <div>
                <label className="block text-[13px] font-medium text-black/70 mb-1.5">
                  Galeri Fotoğrafları ({formGalleryImages.length} adet)
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    value={galleryInput}
                    onChange={(e) => setGalleryInput(e.target.value)}
                    placeholder="Görsel yolu veya URL yapıştırın..."
                    className="flex-1 rounded-[14px] border border-black/15 px-4 py-2 text-[13.5px] text-ink focus:outline-none focus:border-black"
                  />
                  <button
                    type="button"
                    onClick={() => {
                      if (galleryInput.trim()) {
                        setFormGalleryImages([...formGalleryImages, galleryInput.trim()]);
                        setGalleryInput("");
                      }
                    }}
                    className="rounded-full bg-black/10 px-4 py-2 text-[13px] font-medium text-ink hover:bg-black/20 cursor-pointer"
                  >
                    Ekle
                  </button>
                </div>

                {formGalleryImages.length > 0 && (
                  <div className="mt-3 flex flex-wrap gap-2 max-h-32 overflow-y-auto p-2 border border-black/5 rounded-xl bg-[#faf9f5]">
                    {formGalleryImages.map((img, i) => (
                      <div key={i} className="relative group size-14 rounded-lg overflow-hidden border border-black/10">
                        <img src={img} alt="Galeri" className="w-full h-full object-cover" />
                        <button
                          type="button"
                          onClick={() => setFormGalleryImages(formGalleryImages.filter((_, idx) => idx !== i))}
                          className="absolute inset-0 bg-red-600/80 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition cursor-pointer"
                        >
                          <X className="size-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Submit Buttons */}
              <div className="mt-6 pt-4 border-t border-black/10 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="rounded-full px-5 py-2.5 text-[14px] font-medium text-black/60 hover:bg-black/5 transition cursor-pointer"
                >
                  İptal
                </button>
                <button
                  type="submit"
                  className="rounded-full bg-black px-6 py-2.5 text-[14px] font-semibold text-white hover:bg-zinc-800 transition shadow-sm cursor-pointer"
                >
                  {editingSlug ? "Değişiklikleri Kaydet" : "Projeyi Yayınla"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modern Deletion Confirmation Modal */}
      {deleteTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
          <div className="relative w-full max-w-md rounded-[24px] bg-white p-6 sm:p-7 shadow-2xl border border-black/10 text-center animate-in fade-in zoom-in duration-200">
            <button
              onClick={() => setDeleteTarget(null)}
              className="absolute right-4 top-4 p-2 text-black/40 hover:text-black rounded-lg cursor-pointer"
            >
              <X className="size-5" />
            </button>

            <div className="mx-auto size-12 rounded-full bg-red-50 text-red-600 flex items-center justify-center mb-4">
              <AlertTriangle className="size-6" />
            </div>

            <h3 className="text-[19px] font-display font-semibold text-[#09090b]">
              Projeyi Silmek İstiyor musunuz?
            </h3>
            <p className="mt-2 text-[13.5px] text-black/60 leading-relaxed">
              <strong className="text-black">"{deleteTarget.title}"</strong> projesi siteden ve projeler listesinden kaldırılacaktır.
            </p>

            <div className="flex items-center justify-center gap-3 mt-6">
              <button
                type="button"
                onClick={() => setDeleteTarget(null)}
                className="flex-1 rounded-full border border-black/15 bg-white py-2.5 text-[14px] font-medium text-ink hover:bg-black/5 transition cursor-pointer"
              >
                Vazgeç
              </button>
              <button
                type="button"
                onClick={() => {
                  deleteProje(deleteTarget.slug);
                  setDeleteTarget(null);
                }}
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
