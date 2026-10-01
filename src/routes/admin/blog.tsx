import { useState, useEffect, useRef } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { useAdminStore } from "@/lib/admin/adminStore";
import type { BlogPostItem } from "@/data/posts";
import { TipTapEditor } from "@/components/admin/TipTapEditor";
import {
  getBlogPostsServerFn,
  saveBlogPostServerFn,
  deleteBlogPostServerFn,
  toggleBlogPostStatusServerFn,
} from "@/lib/server/blog";
import { uploadImageToR2ServerFn } from "@/lib/server/galeri";
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
  UploadCloud,
  Globe,
  CheckCircle2,
  AlertCircle,
  RefreshCw,
  X,
  EyeOff,
  Smartphone,
  Monitor,
  Sparkles,
} from "lucide-react";

export const Route = createFileRoute("/admin/blog")({
  loader: async () => {
    try {
      const posts = await getBlogPostsServerFn({ data: { includeDrafts: true } });
      return { posts };
    } catch {
      return { posts: [] };
    }
  },
  component: AdminBlogPage,
  head: () => ({
    meta: [
      { title: "Blog & Makale Yönetimi - Parlak Mobilya Admin" },
      { name: "robots", content: "noindex, nofollow" },
    ],
  }),
});

function getTurkishTodayDate(): string {
  const months = [
    "Ocak", "Şubat", "Mart", "Nisan", "Mayıs", "Haziran",
    "Temmuz", "Ağustos", "Eylül", "Ekim", "Kasım", "Aralık"
  ];
  const now = new Date();
  const day = String(now.getDate()).padStart(2, "0");
  const month = months[now.getMonth()];
  const year = now.getFullYear();
  return `${day} ${month} ${year}`;
}

function turkishDateToIso(dateStr: string): string {
  if (!dateStr) return new Date().toISOString().split("T")[0];
  const months: Record<string, string> = {
    ocak: "01",
    subat: "02",
    şubat: "02",
    mart: "03",
    nisan: "04",
    mayis: "05",
    mayıs: "05",
    haziran: "06",
    temmuz: "07",
    agustos: "08",
    ağustos: "08",
    eylul: "09",
    eylül: "09",
    ekim: "10",
    kasim: "11",
    kasım: "11",
    aralik: "12",
    aralık: "12",
  };
  const parts = dateStr.trim().split(/\s+/);
  if (parts.length >= 3) {
    const day = parts[0].padStart(2, "0");
    const monthKey = parts[1].toLowerCase();
    const month = months[monthKey] || "10";
    const year = parts[2];
    return `${year}-${month}-${day}`;
  }
  return new Date().toISOString().split("T")[0];
}

function isoToTurkishDate(isoStr: string): string {
  if (!isoStr) return getTurkishTodayDate();
  const [year, monthNum, dayNum] = isoStr.split("-");
  const months = [
    "Ocak", "Şubat", "Mart", "Nisan", "Mayıs", "Haziran",
    "Temmuz", "Ağustos", "Eylül", "Ekim", "Kasım", "Aralık"
  ];
  const monthName = months[parseInt(monthNum, 10) - 1] || "Ekim";
  return `${parseInt(dayNum, 10).toString().padStart(2, "0")} ${monthName} ${year}`;
}

function generateSlug(text: string): string {
  return text
    .toLowerCase()
    .replace(/ğ/g, "g")
    .replace(/ü/g, "u")
    .replace(/ş/g, "s")
    .replace(/ı/g, "i")
    .replace(/ö/g, "o")
    .replace(/ç/g, "c")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

const CATEGORY_OPTIONS = [
  "Mobilya Rehberi",
  "Duyurular",
  "Mutfak & Dekorasyon",
  "Özel İmalat & Rehber",
  "Tasarım Fikirleri",
  "Bakım & Temizlik",
];

export function AdminBlogPage() {
  const loaderData = Route.useLoaderData();
  const { blogPosts, setBlogPosts } = useAdminStore();

  const [posts, setPosts] = useState<BlogPostItem[]>(() => {
    if (loaderData?.posts && loaderData.posts.length > 0) {
      return loaderData.posts;
    }
    return blogPosts;
  });

  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | "published" | "draft">("all");
  const [viewMode, setViewMode] = useState<"list" | "editor">("list");
  const [editingSlug, setEditingSlug] = useState<string | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<BlogPostItem | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccessMsg, setSaveSuccessMsg] = useState("");

  // Form State
  const [formTitle, setFormTitle] = useState("");
  const [formSlug, setFormSlug] = useState("");
  const [formCategory, setFormCategory] = useState("Mobilya Rehberi");
  const [customCategory, setCustomCategory] = useState("");
  const [isCustomCategory, setIsCustomCategory] = useState(false);
  const [formDate, setFormDate] = useState("");
  const [formStatus, setFormStatus] = useState<"published" | "draft">("published");
  const [formMetaDesc, setFormMetaDesc] = useState("");
  const [formImage, setFormImage] = useState("");
  const [formContentHtml, setFormContentHtml] = useState("");
  const [formViews, setFormViews] = useState<number>(0);

  // Cover Image Upload State
  const [isUploadingCover, setIsUploadingCover] = useState(false);
  const [coverUploadError, setCoverUploadError] = useState("");
  const [showManualUrlInput, setShowManualUrlInput] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const datePickerInputRef = useRef<HTMLInputElement>(null);

  function handleOpenCalendar() {
    if (datePickerInputRef.current) {
      if ("showPicker" in HTMLInputElement.prototype) {
        try {
          datePickerInputRef.current.showPicker();
          return;
        } catch {
          // fallback
        }
      }
      datePickerInputRef.current.focus();
    }
  }

  // SERP Preview Device State
  const [serpDevice, setSerpDevice] = useState<"desktop" | "mobile">("desktop");

  // Sync with initial server data
  useEffect(() => {
    if (loaderData?.posts && loaderData.posts.length > 0) {
      setPosts(loaderData.posts);
      setBlogPosts(loaderData.posts);
    }
  }, [loaderData, setBlogPosts]);

  function getPostViews(post: BlogPostItem): number {
    return typeof post.views === "number" ? post.views : 0;
  }

  const publishedCount = posts.filter((p) => p.status !== "draft").length;
  const draftCount = posts.filter((p) => p.status === "draft").length;
  const totalViews = posts.reduce((acc, p) => acc + getPostViews(p), 0);
  const avgViews = posts.length ? Math.round(totalViews / posts.length) : 0;

  const filteredPosts = posts.filter((b) => {
    const matchesSearch =
      b.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      b.category.toLowerCase().includes(searchQuery.toLowerCase());
    if (!matchesSearch) return false;

    if (statusFilter === "published") return b.status !== "draft";
    if (statusFilter === "draft") return b.status === "draft";
    return true;
  });

  function startCreate() {
    setEditingSlug(null);
    setFormTitle("");
    setFormSlug("");
    setFormCategory("Mobilya Rehberi");
    setIsCustomCategory(false);
    setCustomCategory("");
    setFormDate(getTurkishTodayDate());
    setFormStatus("published");
    setFormMetaDesc("");
    setFormImage("");
    setFormContentHtml(
      "<h2>Konu Başlığı</h2>\n<p>Buraya makalenizin detaylı içeriğini yazın. Paragraflar, alt başlıklar ve görseller ekleyebilirsiniz.</p>"
    );
    setFormViews(0);
    setShowManualUrlInput(false);
    setCoverUploadError("");
    setSaveSuccessMsg("");
    setViewMode("editor");
  }

  function startEdit(post: BlogPostItem) {
    setEditingSlug(post.slug);
    setFormTitle(post.title);
    setFormSlug(post.slug);
    if (CATEGORY_OPTIONS.includes(post.category)) {
      setFormCategory(post.category);
      setIsCustomCategory(false);
    } else {
      setFormCategory("__custom__");
      setIsCustomCategory(true);
      setCustomCategory(post.category);
    }
    setFormDate(post.date || getTurkishTodayDate());
    setFormStatus(post.status || "published");
    setFormMetaDesc(post.metaDesc || "");
    setFormImage(post.image || "");
    setFormContentHtml(post.contentHtml || "");
    setFormViews(getPostViews(post));
    setShowManualUrlInput(false);
    setCoverUploadError("");
    setSaveSuccessMsg("");
    setViewMode("editor");
  }

  // Cover Image PC File Upload Handler
  async function handleCoverFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploadingCover(true);
    setCoverUploadError("");

    try {
      // 1. Convert to WebP in browser using Canvas
      const bitmap = await createImageBitmap(file);
      const canvas = document.createElement("canvas");
      canvas.width = bitmap.width;
      canvas.height = bitmap.height;
      const ctx = canvas.getContext("2d");
      if (ctx) ctx.drawImage(bitmap, 0, 0);

      const blob = await new Promise<Blob>((resolve) => {
        canvas.toBlob((b) => resolve(b!), "image/webp", 0.92);
      });

      const base64Data = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => {
          const res = reader.result as string;
          resolve(res.split(",")[1]);
        };
        reader.onerror = reject;
        reader.readAsDataURL(blob);
      });

      const cleanName = file.name
        .replace(/\.[^/.]+$/, "")
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-");
      const fileName = `kapak-${cleanName}-${Date.now()}.webp`;

      // 2. Upload to Cloudflare R2
      const res = await uploadImageToR2ServerFn({
        data: {
          fileName,
          base64Data,
          contentType: "image/webp",
          addToGallery: false,
        },
      });

      if (res.success && res.url) {
        setFormImage(res.url);
      } else {
        throw new Error("Yükleme başarısız oldu");
      }
    } catch (err: any) {
      console.error("Kapak görseli yükleme hatası:", err);
      setCoverUploadError("Görsel yüklenirken bir hata oluştu. Lütfen tekrar deneyin.");
    } finally {
      setIsUploadingCover(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  }

  // Handle Save (Create or Update)
  async function handleSavePost(e?: React.FormEvent) {
    if (e) e.preventDefault();
    if (!formTitle.trim()) {
      alert("Lütfen makale başlığını girin.");
      return;
    }

    const finalSlug = formSlug.trim() ? generateSlug(formSlug) : generateSlug(formTitle);
    const finalCategory = isCustomCategory ? customCategory.trim() || "Mobilya Rehberi" : formCategory;
    const finalImage = formImage.trim() || "/images/mutfak-dolaplari.webp";
    const finalDate = formDate.trim() || getTurkishTodayDate();

    setIsSaving(true);
    setSaveSuccessMsg("");

    // Normalize empty paragraphs so multiple Enters are preserved
    const normalizedContentHtml = formContentHtml
      ? formContentHtml
          .replace(/<p>\s*<\/p>/gi, "<p>&nbsp;</p>")
          .replace(/<p>\s*<br\s*\/?>\s*<\/p>/gi, "<p>&nbsp;</p>")
      : "";

    const postToSave: BlogPostItem = {
      slug: finalSlug,
      title: formTitle.trim(),
      metaTitle: `${formTitle.trim()} - Parlak Mobilya ve Dekorasyon`,
      metaDesc: formMetaDesc.trim() || formTitle.trim(),
      date: finalDate,
      category: finalCategory,
      author: "Ahmet Parlak",
      readTime: "5 dk okuma",
      image: finalImage,
      contentHtml: normalizedContentHtml,
      status: formStatus,
      views: formViews,
    };

    try {
      const res = await saveBlogPostServerFn({ data: { post: postToSave } });
      if (res.success) {
        setPosts(res.posts);
        setBlogPosts(res.posts);
        setSaveSuccessMsg("Makale başarıyla kaydedildi!");
        setTimeout(() => {
          setViewMode("list");
          setSaveSuccessMsg("");
        }, 900);
      }
    } catch (err) {
      console.error("Makale kaydedilirken hata:", err);
      alert("Makale kaydedilirken bir hata oluştu. Lütfen tekrar deneyin.");
    } finally {
      setIsSaving(false);
    }
  }

  // Handle Status Toggle (1-click from list row)
  async function handleToggleStatus(slug: string, currentStatus?: "published" | "draft") {
    const newStatus = currentStatus === "draft" ? "published" : "draft";

    // Optimistic UI update
    setPosts((prev) =>
      prev.map((p) => (p.slug === slug ? { ...p, status: newStatus } : p))
    );

    try {
      const res = await toggleBlogPostStatusServerFn({
        data: { slug, status: newStatus },
      });
      if (res.success) {
        setPosts(res.posts);
        setBlogPosts(res.posts);
      }
    } catch (err) {
      console.error("Durum güncellenirken hata:", err);
      // Revert if error
      setPosts((prev) =>
        prev.map((p) => (p.slug === slug ? { ...p, status: currentStatus } : p))
      );
    }
  }

  // Handle Delete
  async function confirmDelete() {
    if (!deleteTarget) return;

    setIsDeleting(true);
    try {
      const res = await deleteBlogPostServerFn({ data: { slug: deleteTarget.slug } });
      if (res.success) {
        setPosts(res.posts);
        setBlogPosts(res.posts);
        setDeleteTarget(null);
      }
    } catch (err) {
      console.error("Silme hatası:", err);
      alert("Makale silinirken hata oluştu.");
    } finally {
      setIsDeleting(false);
    }
  }

  // Calculations for Google SERP Snippet
  const currentSlugPreview = formSlug.trim() ? generateSlug(formSlug) : generateSlug(formTitle || "yazi-basligi");
  const serpTitle = formTitle.trim()
    ? `${formTitle.trim()} - Parlak Mobilya ve Dekorasyon`
    : "Makale Başlığı - Parlak Mobilya ve Dekorasyon";
  const serpDesc =
    formMetaDesc.trim() ||
    "Google arama sonuçlarında ve blog kartlarında görünecek açıklama metni burada yer alacaktır...";
  const titleCharCount = serpTitle.length;
  const descCharCount = formMetaDesc.length;

  // --- EDITOR VIEW ---
  if (viewMode === "editor") {
    return (
      <AdminLayout
        title={editingSlug ? "Makaleyi Düzenle" : "Yeni Blog Yazısı Yaz"}
        subtitle="Makale başlığı, kapak görseli, zengin metin içeriği, yayın durumu ve Google arama önizlemesi."
        stickyHeader={false}
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

            <button
              type="button"
              onClick={handleSavePost}
              disabled={isSaving}
              className="inline-flex items-center gap-2 rounded-full bg-black px-5 py-2.5 text-[13.5px] font-semibold text-white hover:bg-zinc-800 transition shadow-sm cursor-pointer disabled:opacity-50"
            >
              {isSaving ? (
                <>
                  <RefreshCw className="size-4 animate-spin" />
                  <span>Kaydediliyor...</span>
                </>
              ) : (
                <>
                  <Check className="size-4" />
                  <span>{editingSlug ? "Değişiklikleri Kaydet" : "Makaleyi Yayınla"}</span>
                </>
              )}
            </button>
          </div>
        }
      >
        {saveSuccessMsg && (
          <div className="mb-6 rounded-[16px] bg-emerald-500/10 border border-emerald-500/20 p-4 text-[14px] text-emerald-800 font-medium flex items-center gap-2.5 animate-in fade-in">
            <CheckCircle2 className="size-5 text-emerald-600 shrink-0" />
            <span>{saveSuccessMsg}</span>
          </div>
        )}

        <form onSubmit={handleSavePost} className="max-w-5xl mx-auto space-y-7 pb-12">
          {/* 1. Status Selection Banner */}
          <div className="bg-white rounded-[24px] border border-black/5 shadow-xs p-5 sm:p-6">
            <span className="text-[12px] font-semibold text-black/40 uppercase tracking-wider font-mono block mb-3">
              YAYIN DURUMU
            </span>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              <label
                onClick={() => setFormStatus("published")}
                className={`flex items-start gap-3.5 p-4 rounded-[18px] border cursor-pointer transition select-none ${
                  formStatus === "published"
                    ? "border-emerald-600/40 bg-emerald-50/50 shadow-xs"
                    : "border-black/10 bg-white hover:bg-[#faf9f5]"
                }`}
              >
                <input
                  type="radio"
                  name="status"
                  value="published"
                  checked={formStatus === "published"}
                  onChange={() => setFormStatus("published")}
                  className="mt-1 size-4 accent-emerald-600"
                />
                <div>
                  <div className="flex items-center gap-2">
                    <span className="inline-block size-2 rounded-full bg-emerald-500" />
                    <span className="text-[14.5px] font-semibold text-[#09090b]">
                      Yayında (Aktif)
                    </span>
                  </div>
                  <p className="text-[12.5px] text-black/60 mt-1 leading-relaxed">
                    Makale sitede anında canlıya alınır ve ziyaretçiler tarafından okunabilir.
                  </p>
                </div>
              </label>

              <label
                onClick={() => setFormStatus("draft")}
                className={`flex items-start gap-3.5 p-4 rounded-[18px] border cursor-pointer transition select-none ${
                  formStatus === "draft"
                    ? "border-amber-600/40 bg-amber-50/50 shadow-xs"
                    : "border-black/10 bg-white hover:bg-[#faf9f5]"
                }`}
              >
                <input
                  type="radio"
                  name="status"
                  value="draft"
                  checked={formStatus === "draft"}
                  onChange={() => setFormStatus("draft")}
                  className="mt-1 size-4 accent-amber-600"
                />
                <div>
                  <div className="flex items-center gap-2">
                    <span className="inline-block size-2 rounded-full bg-amber-500" />
                    <span className="text-[14.5px] font-semibold text-[#09090b]">
                      Pasif / Taslak
                    </span>
                  </div>
                  <p className="text-[12.5px] text-black/60 mt-1 leading-relaxed">
                    Sitede görünmez. Sadece admin panelinde saklanır ve daha sonra yayınlanabilir.
                  </p>
                </div>
              </label>
            </div>
          </div>

          {/* 2. Article Core Info */}
          <div className="bg-white rounded-[24px] border border-black/5 shadow-xs p-6 sm:p-8 space-y-6">
            <span className="text-[12px] font-semibold text-black/40 uppercase tracking-wider font-mono block border-b border-black/5 pb-3">
              TEMEL BİLGİLER
            </span>

            {/* Title */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="block text-[13.5px] font-semibold text-[#09090b]">
                  Makale Başlığı *
                </label>
                <span className="text-[12px] text-black/40">
                  {formTitle.length} karakter
                </span>
              </div>
              <input
                type="text"
                value={formTitle}
                onChange={(e) => {
                  setFormTitle(e.target.value);
                  if (!editingSlug) {
                    setFormSlug(generateSlug(e.target.value));
                  }
                }}
                placeholder="Örn: Özel Ölçü Mobilya Yaptırmadan Önce Bilmeniz Gerekenler"
                required
                className="w-full rounded-[16px] border border-black/15 px-4 py-3 text-[16px] font-medium text-ink focus:outline-none focus:border-black transition placeholder:text-black/35"
              />
            </div>

            {/* Custom URL Slug */}
            <div>
              <label className="block text-[13px] font-medium text-black/70 mb-1.5">
                Sayfa Bağlantısı (URL Slug)
              </label>
              <div className="flex items-center rounded-[14px] border border-black/15 bg-[#faf9f5] px-3.5 py-2.5 text-[13.5px] text-black/70">
                <span className="text-black/40 shrink-0">
                  parlakmobilyadekorasyon.com/blog/
                </span>
                <input
                  type="text"
                  value={formSlug}
                  onChange={(e) => setFormSlug(generateSlug(e.target.value))}
                  placeholder="makale-url-adresi"
                  className="w-full bg-transparent font-mono text-[13px] text-ink focus:outline-none ml-1 font-medium"
                />
              </div>
            </div>

            {/* Category & Date Row */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              {/* Category */}
              <div>
                <label className="block text-[13.5px] font-semibold text-[#09090b] mb-2">
                  Kategori *
                </label>
                <select
                  value={isCustomCategory ? "__custom__" : formCategory}
                  onChange={(e) => {
                    if (e.target.value === "__custom__") {
                      setIsCustomCategory(true);
                    } else {
                      setIsCustomCategory(false);
                      setFormCategory(e.target.value);
                    }
                  }}
                  className="w-full rounded-[16px] border border-black/15 px-4 py-3 text-[14px] text-ink focus:outline-none focus:border-black bg-white cursor-pointer"
                >
                  {CATEGORY_OPTIONS.map((cat) => (
                    <option key={cat} value={cat}>
                      {cat}
                    </option>
                  ))}
                  <option value="__custom__">+ Farklı Kategori Yaz...</option>
                </select>

                {isCustomCategory && (
                  <input
                    type="text"
                    value={customCategory}
                    onChange={(e) => setCustomCategory(e.target.value)}
                    placeholder="Kategori adını yazın..."
                    className="mt-2 w-full rounded-[14px] border border-black/15 px-3.5 py-2 text-[13.5px] text-ink focus:outline-none focus:border-black"
                  />
                )}
              </div>

              {/* Date with Interactive Calendar Picker */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="block text-[13.5px] font-semibold text-[#09090b]">
                    Yayın Tarihi *
                  </label>
                  <button
                    type="button"
                    onClick={() => setFormDate(getTurkishTodayDate())}
                    className="text-[12px] text-amber-800 hover:underline font-medium cursor-pointer"
                  >
                    Bugünün Tarihini Al
                  </button>
                </div>

                {/* Hidden native date input for browser calendar picker */}
                <input
                  ref={datePickerInputRef}
                  type="date"
                  value={turkishDateToIso(formDate)}
                  onChange={(e) => {
                    if (e.target.value) {
                      setFormDate(isoToTurkishDate(e.target.value));
                    }
                  }}
                  className="sr-only pointer-events-none"
                  tabIndex={-1}
                />

                <div
                  onClick={handleOpenCalendar}
                  className="relative group cursor-pointer"
                >
                  <Calendar className="absolute left-3.5 top-1/2 -translate-y-1/2 size-4 text-black/40 group-hover:text-black transition" />
                  <input
                    type="text"
                    readOnly
                    value={formDate}
                    onClick={handleOpenCalendar}
                    placeholder="Tarih seçmek için tıklayın..."
                    className="w-full rounded-[16px] border border-black/15 pl-10 pr-24 py-3 text-[14px] text-ink focus:outline-none group-hover:border-black/50 transition cursor-pointer bg-white font-medium select-none"
                  />
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleOpenCalendar();
                    }}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 rounded-full bg-zinc-100 hover:bg-zinc-200 px-3 py-1.5 text-[11.5px] font-semibold text-zinc-800 transition cursor-pointer flex items-center gap-1 shadow-2xs"
                  >
                    <Calendar className="size-3" />
                    <span>Takvim</span>
                  </button>
                </div>
              </div>
            </div>

            {/* Cover Image Upload (Direct PC Upload with WebP + R2) */}
            <div>
              <label className="block text-[13.5px] font-semibold text-[#09090b] mb-2">
                Kapak Görseli *
              </label>

              {/* Hidden File Input */}
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleCoverFileChange}
                className="hidden"
              />

              {/* If Image is Uploaded / Selected */}
              {formImage ? (
                <div className="rounded-[20px] border border-black/10 bg-[#faf9f5] p-4 flex flex-col sm:flex-row items-center gap-4">
                  <div className="relative w-full sm:w-44 aspect-[16/9] rounded-[14px] overflow-hidden bg-black/5 border border-black/10 shrink-0">
                    <img
                      src={formImage}
                      alt="Kapak Görseli"
                      className="w-full h-full object-cover"
                    />
                  </div>

                  <div className="min-w-0 flex-1 space-y-1.5 w-full">
                    <span className="text-[12px] font-semibold text-emerald-700 bg-emerald-100/70 px-2.5 py-0.5 rounded-full inline-flex items-center gap-1">
                      <CheckCircle2 className="size-3" /> Yüklendi (Cloudflare R2 / WebP)
                    </span>
                    <p className="font-mono text-[11.5px] text-black/60 truncate block">
                      {formImage}
                    </p>
                    <div className="flex items-center gap-2 pt-1">
                      <button
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        disabled={isUploadingCover}
                        className="rounded-full bg-black text-white px-3.5 py-1.5 text-[12px] font-semibold hover:bg-zinc-800 transition cursor-pointer"
                      >
                        Görseli Değiştir
                      </button>
                      <button
                        type="button"
                        onClick={() => setFormImage("")}
                        className="rounded-full border border-black/15 bg-white text-red-600 px-3 py-1.5 text-[12px] font-medium hover:bg-red-50 transition cursor-pointer"
                      >
                        Kaldır
                      </button>
                    </div>
                  </div>
                </div>
              ) : (
                /* Drag & Drop Upload Zone */
                <div
                  onClick={() => fileInputRef.current?.click()}
                  className={`border-2 border-dashed rounded-[20px] p-8 text-center cursor-pointer transition select-none ${
                    isUploadingCover
                      ? "border-black/20 bg-black/5"
                      : "border-black/15 bg-[#faf9f5] hover:border-black/40 hover:bg-white"
                  }`}
                >
                  {isUploadingCover ? (
                    <div className="flex flex-col items-center justify-center gap-2 py-3">
                      <RefreshCw className="size-8 text-black/50 animate-spin" />
                      <span className="text-[14px] font-semibold text-black">
                        Görsel WebP formatına dönüştürülüp yükleniyor...
                      </span>
                      <span className="text-[12px] text-black/40">Lütfen bekleyin</span>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center justify-center gap-2 py-2">
                      <div className="size-12 rounded-full bg-black/5 flex items-center justify-center text-black/70 mb-1">
                        <UploadCloud className="size-6" />
                      </div>
                      <span className="text-[14.5px] font-semibold text-[#09090b]">
                        Bilgisayardan Kapak Görseli Seç
                      </span>
                      <p className="text-[12.5px] text-black/50 max-w-sm">
                        JPG, PNG veya WEBP görseller otomatik olarak kayıpsız WebP formatına dönüştürülüp Cloudflare R2'ye yüklenir.
                      </p>
                    </div>
                  )}
                </div>
              )}

              {coverUploadError && (
                <p className="text-[12.5px] text-red-600 mt-2 flex items-center gap-1.5">
                  <AlertCircle className="size-3.5" />
                  {coverUploadError}
                </p>
              )}

              {/* Toggle manual URL input */}
              <div className="mt-2 text-right">
                <button
                  type="button"
                  onClick={() => setShowManualUrlInput(!showManualUrlInput)}
                  className="text-[12px] text-black/50 hover:text-black hover:underline cursor-pointer"
                >
                  {showManualUrlInput ? "URL Girişini Kapat" : "veya Manuel Görsel URL'si Gir"}
                </button>
              </div>

              {showManualUrlInput && (
                <div className="mt-2">
                  <input
                    type="text"
                    value={formImage}
                    onChange={(e) => setFormImage(e.target.value)}
                    placeholder="https://... veya /images/..."
                    className="w-full rounded-[14px] border border-black/15 px-3.5 py-2 text-[13px] text-ink focus:outline-none focus:border-black font-mono"
                  />
                </div>
              )}
            </div>

            {/* Meta Description */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="block text-[13.5px] font-semibold text-[#09090b]">
                  Kısa Özet & SEO Açıklaması (Meta Description) *
                </label>
                <span
                  className={`text-[12px] font-medium ${
                    descCharCount > 160 ? "text-amber-600" : "text-black/40"
                  }`}
                >
                  {descCharCount} / 160 karakter
                </span>
              </div>
              <textarea
                value={formMetaDesc}
                onChange={(e) => setFormMetaDesc(e.target.value)}
                placeholder="Google aramalarında ve blog kartlarında görünecek 120-160 karakter arası özet metin..."
                rows={3}
                required
                className="w-full rounded-[16px] border border-black/15 p-3.5 text-[14px] text-ink focus:outline-none focus:border-black"
              />
            </div>
          </div>

          {/* 3. Google SERP Snippet Preview (Arama Sonucu Nasıl Görünecek?) */}
          <div className="bg-white rounded-[24px] border border-black/5 shadow-xs p-6 sm:p-8 space-y-5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-black/5 pb-3">
              <div>
                <div className="flex items-center gap-2">
                  <Globe className="size-4 text-blue-600" />
                  <span className="text-[13.5px] font-semibold text-[#09090b]">
                    Google Arama Sonucu Önizlemesi (SERP)
                  </span>
                </div>
                <p className="text-[12px] text-black/50 mt-0.5">
                  Bu makalenin Google aramalarında ziyaretçilere nasıl görüneceğini canlı olarak izleyin.
                </p>
              </div>

              {/* Desktop / Mobile Switcher */}
              <div className="flex items-center rounded-full bg-[#f4f3ee] p-1 border border-black/5 self-start sm:self-center">
                <button
                  type="button"
                  onClick={() => setSerpDevice("desktop")}
                  className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-[12px] font-medium transition cursor-pointer ${
                    serpDevice === "desktop"
                      ? "bg-white text-black shadow-xs font-semibold"
                      : "text-black/60 hover:text-black"
                  }`}
                >
                  <Monitor className="size-3.5" />
                  <span>Masaüstü</span>
                </button>
                <button
                  type="button"
                  onClick={() => setSerpDevice("mobile")}
                  className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-[12px] font-medium transition cursor-pointer ${
                    serpDevice === "mobile"
                      ? "bg-white text-black shadow-xs font-semibold"
                      : "text-black/60 hover:text-black"
                  }`}
                >
                  <Smartphone className="size-3.5" />
                  <span>Mobil</span>
                </button>
              </div>
            </div>

            {/* Google Result Card */}
            <div
              className={`rounded-[18px] border border-black/10 bg-[#ffffff] p-5 shadow-xs transition-all ${
                serpDevice === "mobile" ? "max-w-[420px] mx-auto" : "w-full"
              }`}
            >
              {/* Site Header */}
              <div className="flex items-center gap-2.5 mb-1.5">
                <div className="size-6 rounded-full bg-[#f1f3f4] flex items-center justify-center text-[11px] font-bold text-black border border-black/10 shrink-0">
                  P
                </div>
                <div className="min-w-0">
                  <span className="text-[13px] text-[#202124] font-medium block leading-tight truncate">
                    Parlak Mobilya ve Dekorasyon
                  </span>
                  <span className="text-[11px] text-[#5f6368] font-mono block leading-tight truncate">
                    https://www.parlakmobilyadekorasyon.com › blog › {currentSlugPreview}
                  </span>
                </div>
              </div>

              {/* Blue Link Heading */}
              <h4 className="text-[19px] sm:text-[20px] text-[#1a0dab] hover:underline font-normal cursor-pointer leading-snug line-clamp-2 mt-1">
                {serpTitle}
              </h4>

              {/* Snippet */}
              <p className="text-[13.5px] text-[#4d5156] leading-relaxed mt-1.5 line-clamp-2">
                <span className="text-[#70757a] text-[12.5px] mr-1">{formDate || "Bugün"} —</span>
                {serpDesc}
              </p>
            </div>

            {/* SEO Health Check Indicators */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 text-[12.5px]">
              <div className="flex items-center justify-between p-3 rounded-[14px] bg-[#faf9f5] border border-black/5">
                <span className="text-black/60">Başlık Uzunluğu:</span>
                <span
                  className={`font-semibold px-2 py-0.5 rounded-full text-[11.5px] ${
                    titleCharCount >= 30 && titleCharCount <= 65
                      ? "bg-emerald-100 text-emerald-800"
                      : "bg-amber-100 text-amber-800"
                  }`}
                >
                  {titleCharCount} Karakter {titleCharCount > 65 ? "(Google kesebilir)" : "(İdeal)"}
                </span>
              </div>

              <div className="flex items-center justify-between p-3 rounded-[14px] bg-[#faf9f5] border border-black/5">
                <span className="text-black/60">Meta Açıklama:</span>
                <span
                  className={`font-semibold px-2 py-0.5 rounded-full text-[11.5px] ${
                    descCharCount >= 100 && descCharCount <= 165
                      ? "bg-emerald-100 text-emerald-800"
                      : "bg-amber-100 text-amber-800"
                  }`}
                >
                  {descCharCount} Karakter {descCharCount > 165 ? "(Biraz uzun)" : "(İdeal: 120-160)"}
                </span>
              </div>
            </div>
          </div>

          {/* 4. Professional Rich Text Editor */}
          <div className="bg-white rounded-[24px] border border-black/5 shadow-xs p-3 sm:p-5">
            <TipTapEditor
              content={formContentHtml}
              onChange={(newHtml) => setFormContentHtml(newHtml)}
              onSave={handleSavePost}
              isSaving={isSaving}
            />
          </div>

          {/* Bottom Action Buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-4 border-t border-black/10">
            <button
              type="button"
              onClick={() => setViewMode("list")}
              className="w-full sm:w-auto rounded-full px-6 py-3 text-[14px] font-medium text-black/70 hover:bg-black/5 transition cursor-pointer"
            >
              Vazgeç
            </button>

            <button
              type="submit"
              disabled={isSaving}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-full bg-black px-8 py-3.5 text-[14.5px] font-semibold text-white hover:bg-zinc-800 transition shadow-md cursor-pointer disabled:opacity-50"
            >
              {isSaving ? (
                <>
                  <RefreshCw className="size-4 animate-spin" />
                  <span>Kaydediliyor...</span>
                </>
              ) : (
                <>
                  <Check className="size-4" />
                  <span>{editingSlug ? "Değişiklikleri Kaydet" : "Makaleyi Yayınla"}</span>
                </>
              )}
            </button>
          </div>
        </form>
      </AdminLayout>
    );
  }

  // --- LIST VIEW (DEFAULT) ---
  return (
    <AdminLayout
      title="Blog & Makale Yönetimi"
      subtitle="Web sitenizdeki rehber makaleleri, SEO içeriklerini ve duyuruları yönetin."
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
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 mb-6">
        <div className="rounded-[20px] bg-white p-4.5 sm:p-5 border border-black/5 shadow-xs flex items-center gap-4">
          <div className="size-11 rounded-full bg-black text-white flex items-center justify-center shrink-0">
            <FileText className="size-5" />
          </div>
          <div>
            <span className="text-[12px] text-black/50 block font-medium">Yayında</span>
            <span className="text-[24px] font-display font-semibold text-[#09090b] leading-tight">
              {publishedCount}
            </span>
          </div>
        </div>

        <div className="rounded-[20px] bg-white p-4.5 sm:p-5 border border-black/5 shadow-xs flex items-center gap-4">
          <div className="size-11 rounded-full bg-amber-500/10 text-amber-700 flex items-center justify-center shrink-0">
            <EyeOff className="size-5" />
          </div>
          <div>
            <span className="text-[12px] text-black/50 block font-medium">Pasif / Taslak</span>
            <span className="text-[24px] font-display font-semibold text-[#09090b] leading-tight">
              {draftCount}
            </span>
          </div>
        </div>

        <div className="rounded-[20px] bg-white p-4.5 sm:p-5 border border-black/5 shadow-xs flex items-center gap-4">
          <div className="size-11 rounded-full bg-zinc-100 text-zinc-900 flex items-center justify-center shrink-0">
            <Eye className="size-5" />
          </div>
          <div>
            <span className="text-[12px] text-black/50 block font-medium">Toplam Okunma</span>
            <span className="text-[24px] font-display font-semibold text-[#09090b] leading-tight">
              {totalViews.toLocaleString("tr-TR")}
            </span>
          </div>
        </div>

        <div className="rounded-[20px] bg-black p-4.5 sm:p-5 text-white shadow-xs flex items-center gap-4">
          <div className="size-11 rounded-full bg-white/10 text-white flex items-center justify-center shrink-0">
            <TrendingUp className="size-5" />
          </div>
          <div>
            <span className="text-[12px] text-white/70 block font-medium">Ortalama Okunma</span>
            <span className="text-[24px] font-display font-semibold text-white leading-tight">
              {avgViews.toLocaleString("tr-TR")}
            </span>
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
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

        {/* Status Filter Tabs */}
        <div className="flex items-center gap-1.5 self-start sm:self-center">
          <button
            type="button"
            onClick={() => setStatusFilter("all")}
            className={`px-3 py-1.5 rounded-full text-[12px] font-semibold transition cursor-pointer ${
              statusFilter === "all"
                ? "bg-black text-white"
                : "bg-zinc-100 text-black/70 hover:bg-zinc-200"
            }`}
          >
            Tümü ({posts.length})
          </button>
          <button
            type="button"
            onClick={() => setStatusFilter("published")}
            className={`px-3 py-1.5 rounded-full text-[12px] font-semibold transition cursor-pointer ${
              statusFilter === "published"
                ? "bg-emerald-600 text-white"
                : "bg-zinc-100 text-black/70 hover:bg-zinc-200"
            }`}
          >
            Yayında ({publishedCount})
          </button>
          <button
            type="button"
            onClick={() => setStatusFilter("draft")}
            className={`px-3 py-1.5 rounded-full text-[12px] font-semibold transition cursor-pointer ${
              statusFilter === "draft"
                ? "bg-amber-600 text-white"
                : "bg-zinc-100 text-black/70 hover:bg-zinc-200"
            }`}
          >
            Pasif ({draftCount})
          </button>
        </div>
      </div>

      {/* Posts List */}
      <div className="bg-white rounded-[24px] border border-black/5 shadow-sm overflow-hidden divide-y divide-black/5">
        {filteredPosts.length === 0 ? (
          <div className="py-14 text-center text-muted text-[14px]">
            Henüz makale bulunamadı.
          </div>
        ) : (
          filteredPosts.map((post) => {
            const viewsCount = getPostViews(post);
            const isDraft = post.status === "draft";

            return (
              <div
                key={post.slug}
                className={`p-4 sm:p-5 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 transition ${
                  isDraft ? "bg-[#fffdfa] opacity-80" : "hover:bg-[#faf9f5]"
                }`}
              >
                {/* Thumbnail + Title + Meta info */}
                <div className="flex items-center gap-4 min-w-0 flex-1">
                  <div className="relative size-16 rounded-[14px] overflow-hidden bg-black shrink-0 border border-black/10">
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

                    <h3
                      onClick={() => startEdit(post)}
                      className="font-display font-semibold text-[15px] sm:text-[16px] text-[#09090b] truncate cursor-pointer hover:underline"
                    >
                      {post.title}
                    </h3>

                    <p className="text-[12.5px] text-black/50 line-clamp-1 mt-0.5">
                      {post.metaDesc}
                    </p>
                  </div>
                </div>

                {/* Right side: Status toggle badge + Views + Action buttons */}
                <div className="flex flex-wrap items-center justify-between md:justify-end gap-3 w-full md:w-auto shrink-0 pt-2 md:pt-0 border-t md:border-t-0 border-black/5">
                  {/* Status Toggle Button */}
                  <button
                    type="button"
                    onClick={() => handleToggleStatus(post.slug, post.status)}
                    title={
                      isDraft
                        ? "Pasif / Taslak (Yayınlamak için tıklayın)"
                        : "Yayında (Pasife almak için tıklayın)"
                    }
                    className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[12px] font-semibold transition cursor-pointer shadow-xs ${
                      isDraft
                        ? "bg-amber-100 text-amber-900 border border-amber-300 hover:bg-amber-200"
                        : "bg-emerald-100 text-emerald-900 border border-emerald-300 hover:bg-emerald-200"
                    }`}
                  >
                    <span
                      className={`size-2 rounded-full ${
                        isDraft ? "bg-amber-500" : "bg-emerald-500"
                      }`}
                    />
                    <span>{isDraft ? "Pasif / Taslak" : "Yayında"}</span>
                  </button>

                  {/* Views Metric */}
                  <div
                    title="Bu makalenin gerçek görüntülenme sayısı"
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-zinc-100 text-zinc-800 text-[12px] font-semibold"
                  >
                    <Eye className="size-3.5 text-black/50" />
                    <span>{viewsCount.toLocaleString("tr-TR")}</span>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-1.5">
                    {!isDraft && (
                      <a
                        href={`/blog/${post.slug}`}
                        target="_blank"
                        rel="noreferrer"
                        className="px-2.5 py-1.5 rounded-lg text-[12.5px] font-medium text-black/70 hover:text-black hover:bg-black/5 transition inline-flex items-center gap-1"
                        title="Sitede Canlı Gör"
                      >
                        <span className="hidden lg:inline">Sitede Gör</span>
                        <ExternalLink className="size-3.5" />
                      </a>
                    )}

                    <button
                      onClick={() => startEdit(post)}
                      className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-zinc-100 text-zinc-900 hover:bg-zinc-200 text-[12.5px] font-semibold transition cursor-pointer"
                      title="Düzenle"
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

      {/* Delete Confirmation Modal */}
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
              <strong className="text-black">"{deleteTarget.title}"</strong> başlıklı makale kalıcı olarak silinecektir.
            </p>

            <div className="flex items-center justify-center gap-3 mt-6">
              <button
                type="button"
                onClick={() => setDeleteTarget(null)}
                disabled={isDeleting}
                className="flex-1 rounded-full border border-black/15 bg-white py-2.5 text-[14px] font-medium text-ink hover:bg-black/5 transition cursor-pointer"
              >
                Vazgeç
              </button>
              <button
                type="button"
                onClick={confirmDelete}
                disabled={isDeleting}
                className="flex-1 rounded-full bg-red-600 py-2.5 text-[14px] font-semibold text-white hover:bg-red-700 transition shadow-sm cursor-pointer disabled:opacity-50"
              >
                {isDeleting ? "Siliniyor..." : "Evet, Sil"}
              </button>
            </div>
          </div>
        </div>
      )}
    </AdminLayout>
  );
}
