import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { useAdminStore } from "@/lib/admin/adminStore";
import type { BlogPostItem } from "@/data/posts";
import {
  Plus,
  Search,
  Trash2,
  Edit3,
  ExternalLink,
  Calendar,
  Eye,
  ArrowLeft,
  Check,
  FileText,
  AlertTriangle,
  TrendingUp,
  Image as ImageIcon,
  Sparkles,
} from "lucide-react";

export const Route = createFileRoute("/admin/blog")({
  component: AdminBlogPage,
  head: () => ({
    meta: [
      { title: "Blog & Makale Yönetimi - Parlak Mobilya Admin" },
      { name: "robots", content: "noindex, nofollow" },
    ],
  }),
});

export function AdminBlogPage() {
  const { blogPosts, addBlogPost, updateBlogPost, deleteBlogPost } = useAdminStore();
  const [searchQuery, setSearchQuery] = useState("");
  const [viewMode, setViewMode] = useState<"list" | "editor">("list");
  const [editingSlug, setEditingSlug] = useState<string | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<BlogPostItem | null>(null);

  // Form State
  const [formTitle, setFormTitle] = useState("");
  const [formCategory, setFormCategory] = useState("Mobilya Rehberi");
  const [formMetaDesc, setFormMetaDesc] = useState("");
  const [formImage, setFormImage] = useState("");
  const [formContentHtml, setFormContentHtml] = useState("");
  const [formViews, setFormViews] = useState<number>(0);

  function getPostViews(post: BlogPostItem): number {
    if (typeof post.views === "number" && post.views > 0) return post.views;
    return post.slug === "yeni-web-sitemiz-yayinda" ? 1420 : 890;
  }

  const filteredPosts = blogPosts.filter((b) =>
    b.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    b.category.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const totalViews = blogPosts.reduce((acc, p) => acc + getPostViews(p), 0);
  const avgViews = blogPosts.length ? Math.round(totalViews / blogPosts.length) : 0;

  function startCreate() {
    setEditingSlug(null);
    setFormTitle("");
    setFormCategory("Mobilya Rehberi");
    setFormMetaDesc("");
    setFormImage("/images/mutfak-dolaplari.webp");
    setFormContentHtml("<p>Buraya yeni makalenizin içeriğini yazın...</p>\n\n<h2>Alt Başlık</h2>\n<p>Detaylı açıklamalar...</p>");
    setFormViews(0);
    setViewMode("editor");
  }

  function startEdit(post: BlogPostItem) {
    setEditingSlug(post.slug);
    setFormTitle(post.title);
    setFormCategory(post.category);
    setFormMetaDesc(post.metaDesc);
    setFormImage(post.image);
    setFormContentHtml(post.contentHtml);
    setFormViews(getPostViews(post));
    setViewMode("editor");
  }

  function handleSavePost(e: React.FormEvent) {
    e.preventDefault();
    const slug =
      editingSlug ||
      formTitle
        .toLowerCase()
        .replace(/[^a-z0-9ğüşıöç]+/g, "-")
        .replace(/ğ/g, "g")
        .replace(/ü/g, "u")
        .replace(/ş/g, "s")
        .replace(/ı/g, "i")
        .replace(/ö/g, "o")
        .replace(/ç/g, "c");

    if (editingSlug) {
      updateBlogPost(editingSlug, {
        title: formTitle,
        category: formCategory,
        metaDesc: formMetaDesc,
        image: formImage,
        contentHtml: formContentHtml,
        views: formViews,
      });
    } else {
      const newPost: BlogPostItem = {
        slug,
        title: formTitle,
        metaTitle: `${formTitle} - Parlak Mobilya ve Dekorasyon`,
        metaDesc: formMetaDesc,
        date: "01 Ekim 2026",
        category: formCategory,
        author: "Ahmet Parlak (Ahmet Usta)",
        readTime: "4 dk okuma",
        image: formImage || "/images/mutfak-dolaplari.webp",
        contentHtml: formContentHtml,
        views: formViews || 1,
      };
      addBlogPost(newPost);
    }
    setViewMode("list");
  }

  function confirmDelete() {
    if (deleteTarget) {
      deleteBlogPost(deleteTarget.slug);
      setDeleteTarget(null);
    }
  }

  // --- EDITOR VIEW (IN-PAGE) ---
  if (viewMode === "editor") {
    return (
      <AdminLayout
        title={editingSlug ? "Makaleyi Düzenle" : "Yeni Blog Yazısı Yaz"}
        subtitle="Makale başlığı, SEO açıklaması, kapak görseli ve içeriğini sayfa üzerinden düzenleyin."
        actions={
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setViewMode("list")}
              className="inline-flex items-center gap-2 rounded-full border border-black/10 bg-white px-4 py-2 sm:px-5 sm:py-2.5 text-[13px] sm:text-[13.5px] font-medium text-black hover:bg-black/5 transition cursor-pointer shadow-xs"
            >
              <ArrowLeft className="size-4" />
              <span>Listeye Dön</span>
            </button>
          </div>
        }
      >
        <form onSubmit={handleSavePost} className="max-w-5xl mx-auto space-y-6">
          <div className="bg-white rounded-[24px] border border-black/5 shadow-sm p-6 sm:p-8 space-y-6">
            <div className="flex items-center justify-between pb-4 border-b border-black/5">
              <span className="text-[12px] font-semibold text-black/40 uppercase tracking-wider font-mono">
                {editingSlug ? "MEVCUT YAZI DÜZENLEME" : "YENİ YAZI FORMU"}
              </span>
              <div className="flex items-center gap-2">
                <span className="text-[12.5px] text-black/50">Görüntülenme:</span>
                <span className="font-semibold text-black bg-[#f7f6f1] px-3 py-1 rounded-full text-[13px] flex items-center gap-1.5">
                  <Eye className="size-3.5 text-black/40" />
                  {formViews.toLocaleString("tr-TR")}
                </span>
              </div>
            </div>

            {/* Title */}
            <div>
              <label className="block text-[13.5px] font-semibold text-[#09090b] mb-2">
                Makale Başlığı *
              </label>
              <input
                type="text"
                value={formTitle}
                onChange={(e) => setFormTitle(e.target.value)}
                placeholder="Örn: 2026 Mutfak Dolabı Renk ve Model Trendleri"
                required
                className="w-full rounded-[16px] border border-black/15 px-4 py-3 text-[15px] font-medium text-ink focus:outline-none focus:border-black transition"
              />
            </div>

            {/* Category & Cover Image */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <div>
                <label className="block text-[13.5px] font-semibold text-[#09090b] mb-2">
                  Kategori *
                </label>
                <select
                  value={formCategory}
                  onChange={(e) => setFormCategory(e.target.value)}
                  className="w-full rounded-[16px] border border-black/15 px-4 py-3 text-[14px] text-ink focus:outline-none focus:border-black bg-white cursor-pointer"
                >
                  <option value="Mobilya Rehberi">Mobilya Rehberi</option>
                  <option value="Duyurular">Duyurular</option>
                  <option value="Tasarım Fikirleri">Tasarım Fikirleri</option>
                  <option value="Bakım & Temizlik">Bakım & Temizlik</option>
                  <option value="Mutfak & Dekorasyon">Mutfak & Dekorasyon</option>
                </select>
              </div>

              <div>
                <label className="block text-[13.5px] font-semibold text-[#09090b] mb-2">
                  Kapak Görseli URL *
                </label>
                <input
                  type="text"
                  value={formImage}
                  onChange={(e) => setFormImage(e.target.value)}
                  placeholder="/images/mutfak-dolaplari.webp"
                  required
                  className="w-full rounded-[16px] border border-black/15 px-4 py-3 text-[14px] text-ink focus:outline-none focus:border-black"
                />
              </div>
            </div>

            {/* Cover Preview */}
            {formImage && (
              <div className="rounded-[18px] bg-[#f7f6f1] p-3 flex items-center gap-4 border border-black/5">
                <img
                  src={formImage}
                  alt="Önizleme"
                  className="size-16 rounded-[12px] object-cover border border-black/10 shrink-0"
                  onError={(e) => {
                    (e.target as HTMLElement).style.display = "none";
                  }}
                />
                <div className="text-[12.5px] text-black/60 truncate">
                  <span className="font-semibold text-[#09090b] block">Seçili Kapak Görseli</span>
                  <span className="font-mono text-[11.5px] truncate block">{formImage}</span>
                </div>
              </div>
            )}

            {/* Meta Description */}
            <div>
              <label className="block text-[13.5px] font-semibold text-[#09090b] mb-2">
                Kısa Özet & SEO Açıklaması (Meta Description) *
              </label>
              <textarea
                value={formMetaDesc}
                onChange={(e) => setFormMetaDesc(e.target.value)}
                placeholder="Google aramalarında ve blog kartlarında görünecek açıklama metni..."
                rows={2}
                required
                className="w-full rounded-[16px] border border-black/15 p-3.5 text-[14px] text-ink focus:outline-none focus:border-black"
              />
            </div>

            {/* Content Editor */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="block text-[13.5px] font-semibold text-[#09090b]">
                  Makale İçeriği (HTML / Metin) *
                </label>
                <span className="text-[12px] text-black/40">
                  {`<p>, <h2>, <ul>, <li> etiketleri desteklenir`}
                </span>
              </div>
              <textarea
                value={formContentHtml}
                onChange={(e) => setFormContentHtml(e.target.value)}
                placeholder="<p>Makale paragrafları...</p> <h2>Alt Başlık</h2>..."
                rows={12}
                required
                className="w-full rounded-[16px] border border-black/15 p-4 text-[13.5px] font-mono leading-relaxed text-ink focus:outline-none focus:border-black bg-[#faf9f5]"
              />
            </div>

            {/* Views Simulated counter */}
            <div>
              <label className="block text-[13px] font-medium text-black/60 mb-1.5">
                Okunma / Tıklanma Sayısı (İstatistik)
              </label>
              <input
                type="number"
                value={formViews}
                onChange={(e) => setFormViews(parseInt(e.target.value) || 0)}
                className="w-48 rounded-[12px] border border-black/15 px-3 py-2 text-[13.5px] text-ink focus:outline-none focus:border-black"
              />
            </div>

            {/* Bottom Actions */}
            <div className="pt-5 border-t border-black/10 flex flex-col sm:flex-row items-center justify-between gap-3">
              <button
                type="button"
                onClick={() => setViewMode("list")}
                className="w-full sm:w-auto rounded-full px-6 py-2.5 text-[14px] font-medium text-black/60 hover:bg-black/5 transition cursor-pointer"
              >
                Vazgeç
              </button>

              <button
                type="submit"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-full bg-black px-7 py-3 text-[14px] font-semibold text-white hover:bg-zinc-800 transition shadow-md cursor-pointer"
              >
                <Check className="size-4" />
                <span>{editingSlug ? "Değişiklikleri Kaydet" : "Makaleyi Yayınla"}</span>
              </button>
            </div>
          </div>
        </form>
      </AdminLayout>
    );
  }

  // --- LIST VIEW (DEFAULT) ---
  return (
    <AdminLayout
      title="Blog & Makale Yönetimi"
      subtitle="Web sitenizdeki rehber makaleleri, tıklanma istatistiklerini ve duyuruları yönetin."
      actions={
        <button
          onClick={startCreate}
          className="inline-flex items-center gap-2 rounded-full bg-black px-4 sm:px-5 py-2 sm:py-2.5 text-[13.5px] sm:text-[14px] font-semibold text-white hover:bg-zinc-800 transition shadow-sm cursor-pointer"
        >
          <Plus className="size-4" />
          <span>Yeni Yazı Yaz</span>
        </button>
      }
    >
      {/* Top Stats Row */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
        <div className="rounded-[20px] bg-white p-4.5 sm:p-5 border border-black/5 shadow-xs flex items-center gap-4">
          <div className="size-11 rounded-full bg-black text-white flex items-center justify-center shrink-0">
            <FileText className="size-5" />
          </div>
          <div>
            <span className="text-[12.5px] text-black/50 block font-medium">Yayındaki Makaleler</span>
            <span className="text-[26px] font-display font-semibold text-[#09090b] leading-tight">
              {blogPosts.length}
            </span>
          </div>
        </div>

        <div className="rounded-[20px] bg-white p-4.5 sm:p-5 border border-black/5 shadow-xs flex items-center gap-4">
          <div className="size-11 rounded-full bg-zinc-100 text-zinc-900 flex items-center justify-center shrink-0">
            <Eye className="size-5" />
          </div>
          <div>
            <span className="text-[12.5px] text-black/50 block font-medium">Toplam Okunma / Tıklanma</span>
            <span className="text-[26px] font-display font-semibold text-[#09090b] leading-tight">
              {totalViews.toLocaleString("tr-TR")}
            </span>
          </div>
        </div>

        <div className="rounded-[20px] bg-black p-4.5 sm:p-5 text-white shadow-xs flex items-center gap-4">
          <div className="size-11 rounded-full bg-white/10 text-white flex items-center justify-center shrink-0">
            <TrendingUp className="size-5" />
          </div>
          <div>
            <span className="text-[12.5px] text-white/70 block font-medium">Ortalama Okunma</span>
            <span className="text-[26px] font-display font-semibold text-white leading-tight">
              {avgViews.toLocaleString("tr-TR")}
            </span>
          </div>
        </div>
      </div>

      {/* Search Bar */}
      <div className="bg-white rounded-[20px] p-3.5 sm:p-4 border border-black/5 shadow-sm mb-6 flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="relative flex-1 w-full max-w-md">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 size-4 text-black/40" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Makale başlığı veya kategori ara..."
            className="w-full rounded-full bg-[#f7f6f1] border border-black/5 py-2 pl-10 pr-4 text-[13.5px] text-ink placeholder-black/40 focus:bg-white focus:outline-none"
          />
        </div>
        <span className="text-[12.5px] sm:text-[13px] text-black/50 font-medium self-end sm:self-center">
          Toplam {filteredPosts.length} Makale Listeleniyor
        </span>
      </div>

      {/* Compact Responsive List View */}
      <div className="bg-white rounded-[24px] border border-black/5 shadow-sm overflow-hidden divide-y divide-black/5">
        {filteredPosts.length === 0 ? (
          <div className="py-12 text-center text-muted text-[14px]">
            Makale bulunamadı.
          </div>
        ) : (
          filteredPosts.map((post) => {
            const viewsCount = getPostViews(post);

            return (
              <div
                key={post.slug}
                className="p-4 sm:p-5 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 hover:bg-[#faf9f5] transition"
              >
                {/* Thumbnail + Title + Meta info */}
                <div className="flex items-center gap-4 min-w-0 flex-1">
                  <div className="relative size-14 sm:size-16 rounded-[14px] overflow-hidden bg-black shrink-0 border border-black/10">
                    <img
                      src={post.image}
                      alt={post.title}
                      className="w-full h-full object-cover"
                    />
                  </div>

                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2 mb-1">
                      <span className="rounded-full bg-zinc-100 px-2.5 py-0.5 text-[11px] font-semibold text-zinc-800">
                        {post.category}
                      </span>
                      <span className="text-[12px] text-black/40 font-mono">
                        • {post.date}
                      </span>
                      <span className="text-[12px] text-black/40">
                        • {post.readTime}
                      </span>
                    </div>

                    <h3 className="font-display font-semibold text-[15px] sm:text-[16px] text-[#09090b] truncate">
                      {post.title}
                    </h3>

                    <p className="text-[12.5px] text-black/50 line-clamp-1 mt-0.5">
                      {post.metaDesc}
                    </p>
                  </div>
                </div>

                {/* Tıklanma / Okunma Metriği + Butonlar */}
                <div className="flex flex-wrap items-center justify-between md:justify-end gap-3 w-full md:w-auto shrink-0 pt-2 md:pt-0 border-t md:border-t-0 border-black/5">
                  {/* Tıklanma Badge */}
                  <div
                    title="Bu makalenin toplam tıklanma ve okunma sayısı"
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-black text-white text-[12px] font-semibold shadow-xs"
                  >
                    <Eye className="size-3.5" />
                    <span>{viewsCount.toLocaleString("tr-TR")} Okunma</span>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-1.5">
                    <a
                      href={`/blog/${post.slug}`}
                      target="_blank"
                      rel="noreferrer"
                      className="px-3 py-1.5 rounded-lg text-[12.5px] font-medium text-black/70 hover:text-black hover:bg-black/5 transition inline-flex items-center gap-1.5"
                    >
                      <span className="hidden sm:inline">Sitede Gör</span>
                      <ExternalLink className="size-3.5" />
                    </a>

                    <button
                      onClick={() => startEdit(post)}
                      className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-zinc-100 text-zinc-900 hover:bg-zinc-200 text-[12.5px] font-semibold transition cursor-pointer"
                      title="Sayfada Düzenle"
                    >
                      <Edit3 className="size-3.5" />
                      <span>Düzenle</span>
                    </button>

                    <button
                      onClick={() => setDeleteTarget(post)}
                      className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition cursor-pointer"
                      title="Sil"
                    >
                      <Trash2 className="size-4" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Modern Deletion Confirmation Modal */}
      {deleteTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
          <div className="relative w-full max-w-md rounded-[24px] bg-white p-6 sm:p-7 shadow-2xl border border-black/10 text-center animate-in fade-in zoom-in duration-200">
            <div className="mx-auto size-12 rounded-full bg-red-50 text-red-600 flex items-center justify-center mb-4">
              <AlertTriangle className="size-6" />
            </div>

            <h3 className="text-[19px] font-display font-semibold text-[#09090b]">
              Yazıyı Silmek İstiyor musunuz?
            </h3>
            <p className="mt-2 text-[13.5px] text-black/60 leading-relaxed">
              <strong className="text-black">"{deleteTarget.title}"</strong> başlıklı makale yayından kaldırılacaktır.
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
