import { useState, useEffect, useRef } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { useAdminStore } from "@/lib/admin/adminStore";
import {
  getGaleriImagesServerFn,
  uploadImageToR2ServerFn,
  deleteGaleriImageServerFn,
  deleteGaleriImagesBulkServerFn,
  addGaleriImageServerFn,
} from "@/lib/server/galeri";
import {
  Upload,
  Trash2,
  Copy,
  Check,
  ExternalLink,
  X,
  AlertTriangle,
  Loader2,
  RefreshCw,
  CheckSquare,
  Square,
} from "lucide-react";

export const Route = createFileRoute("/admin/galeri")({
  loader: async () => {
    try {
      const images = await getGaleriImagesServerFn();
      return { initialImages: images };
    } catch {
      return { initialImages: [] };
    }
  },
  component: AdminGaleriPage,
  head: () => ({
    meta: [
      { title: "Fotoğraf Galerisi - Parlak Mobilya Admin" },
      { name: "robots", content: "noindex, nofollow" },
    ],
  }),
});

interface UploadQueueItem {
  id: string;
  name: string;
  originalSize: string;
  convertedSize?: string;
  status: "converting" | "uploading" | "success" | "error";
  errorMessage?: string;
  previewUrl?: string;
  finalUrl?: string;
}

export function AdminGaleriPage() {
  const { initialImages } = Route.useLoaderData();
  const [images, setImages] = useState<string[]>(initialImages || []);
  const [copiedUrl, setCopiedUrl] = useState<string | null>(null);

  // Single delete modal
  const [deleteTargetUrl, setDeleteTargetUrl] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Multi-select & bulk delete
  const [selectedUrls, setSelectedUrls] = useState<string[]>([]);
  const [isBulkDeleteModalOpen, setIsBulkDeleteModalOpen] = useState(false);
  const [isBulkDeleting, setIsBulkDeleting] = useState(false);

  const [isRefreshing, setIsRefreshing] = useState(false);

  // Upload state
  const [isDragging, setIsDragging] = useState(false);
  const [uploadQueue, setUploadQueue] = useState<UploadQueueItem[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [showUrlAdd, setShowUrlAdd] = useState(false);
  const [manualUrlInput, setManualUrlInput] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Sync with store
  const { removeGaleriImage, addGaleriImage } = useAdminStore();

  useEffect(() => {
    if (initialImages && initialImages.length > 0) {
      setImages(initialImages);
    }
  }, [initialImages]);

  async function refreshGallery() {
    setIsRefreshing(true);
    try {
      const refreshed = await getGaleriImagesServerFn();
      setImages(refreshed);
      setSelectedUrls([]);
    } catch (err) {
      console.error("Yenileme hatası:", err);
    } finally {
      setIsRefreshing(false);
    }
  }

  function copyToClipboard(url: string) {
    navigator.clipboard.writeText(url);
    setCopiedUrl(url);
    setTimeout(() => setCopiedUrl(null), 2000);
  }

  function formatBytes(bytes: number) {
    if (bytes === 0) return "0 B";
    const k = 1024;
    const sizes = ["B", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return `${parseFloat((bytes / Math.pow(k, i)).toFixed(1))} ${sizes[i]}`;
  }

  // Convert any image (JPG/PNG/WebP) to high-quality compressed WebP via Canvas
  async function convertFileToWebP(
    file: File
  ): Promise<{ blob: Blob; fileName: string; size: number }> {
    const bitmap = await createImageBitmap(file);
    const canvas = document.createElement("canvas");
    canvas.width = bitmap.width;
    canvas.height = bitmap.height;
    const ctx = canvas.getContext("2d", { alpha: true });
    if (!ctx) throw new Error("Canvas context oluşturulamadı");

    ctx.drawImage(bitmap, 0, 0);

    const blob = await new Promise<Blob>((resolve, reject) => {
      canvas.toBlob(
        (b) => {
          if (b) resolve(b);
          else reject(new Error("WebP formatına dönüştürülemedi"));
        },
        "image/webp",
        0.92
      );
    });

    const originalName =
      file.name.substring(0, file.name.lastIndexOf(".")) || file.name;
    const cleanName = originalName
      .toLowerCase()
      .replace(/[^a-z0-9ğüşıöç]+/g, "-")
      .replace(/ğ/g, "g")
      .replace(/ü/g, "u")
      .replace(/ş/g, "s")
      .replace(/ı/g, "i")
      .replace(/ö/g, "o")
      .replace(/ç/g, "c")
      .replace(/^-+|-+$/g, "");

    const webpFileName = `${cleanName || "foto"}.webp`;
    return { blob, fileName: webpFileName, size: blob.size };
  }

  // Process and upload a list of files
  async function handleFilesUpload(files: FileList | File[]) {
    const fileArray = Array.from(files).filter((f) =>
      f.type.startsWith("image/")
    );
    if (fileArray.length === 0) return;

    setIsUploading(true);

    for (const file of fileArray) {
      const queueId = `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
      const previewUrl = URL.createObjectURL(file);

      const newItem: UploadQueueItem = {
        id: queueId,
        name: file.name,
        originalSize: formatBytes(file.size),
        status: "converting",
        previewUrl,
      };

      setUploadQueue((prev) => [newItem, ...prev]);

      try {
        const { blob, fileName, size } = await convertFileToWebP(file);

        setUploadQueue((prev) =>
          prev.map((item) =>
            item.id === queueId
              ? {
                  ...item,
                  convertedSize: formatBytes(size),
                  status: "uploading",
                }
              : item
          )
        );

        const base64Data = await new Promise<string>((resolve, reject) => {
          const reader = new FileReader();
          reader.onload = () => {
            const res = reader.result as string;
            const base64 = res.split(",")[1];
            resolve(base64);
          };
          reader.onerror = reject;
          reader.readAsDataURL(blob);
        });

        const response = await uploadImageToR2ServerFn({
          data: {
            fileName,
            base64Data,
            contentType: "image/webp",
          },
        });

        if (response.success && response.url) {
          setImages(response.images);
          addGaleriImage(response.url);

          setUploadQueue((prev) =>
            prev.map((item) =>
              item.id === queueId
                ? {
                    ...item,
                    status: "success",
                    finalUrl: response.url,
                  }
                : item
            )
          );
        } else {
          throw new Error("Sunucu yanıtı başarısız");
        }
      } catch (err: any) {
        console.error("Yükleme hatası:", err);
        setUploadQueue((prev) =>
          prev.map((item) =>
            item.id === queueId
              ? {
                  ...item,
                  status: "error",
                  errorMessage: err?.message || "Yükleme başarısız oldu",
                }
              : item
          )
        );
      }
    }

    setIsUploading(false);
  }

  function handleDragOver(e: React.DragEvent) {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  }

  function handleDragLeave(e: React.DragEvent) {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  }

  function handleDrop(e: React.DragEvent) {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFilesUpload(e.dataTransfer.files);
    }
  }

  async function handleAddUrl(e: React.FormEvent) {
    e.preventDefault();
    if (!manualUrlInput.trim()) return;

    try {
      const res = await addGaleriImageServerFn({
        data: { url: manualUrlInput.trim() },
      });
      if (res.success) {
        setImages(res.images);
        addGaleriImage(manualUrlInput.trim());
        setManualUrlInput("");
        setShowUrlAdd(false);
      }
    } catch (err) {
      console.error("URL ekleme hatası:", err);
    }
  }

  // Single Delete
  async function confirmDelete() {
    if (!deleteTargetUrl) return;

    setIsDeleting(true);
    try {
      const res = await deleteGaleriImageServerFn({
        data: { url: deleteTargetUrl },
      });

      if (res.success) {
        setImages(res.images);
        removeGaleriImage(deleteTargetUrl);
      } else {
        setImages((prev) => prev.filter((u) => u !== deleteTargetUrl));
        removeGaleriImage(deleteTargetUrl);
      }
      setSelectedUrls((prev) => prev.filter((u) => u !== deleteTargetUrl));
    } catch (err) {
      console.error("Silme hatası:", err);
      setImages((prev) => prev.filter((u) => u !== deleteTargetUrl));
      removeGaleriImage(deleteTargetUrl);
    } finally {
      setIsDeleting(false);
      setDeleteTargetUrl(null);
    }
  }

  // Multi-Selection helpers
  function toggleSelect(url: string) {
    setSelectedUrls((prev) =>
      prev.includes(url) ? prev.filter((u) => u !== url) : [...prev, url]
    );
  }

  function selectAll() {
    setSelectedUrls([...images]);
  }

  function clearSelection() {
    setSelectedUrls([]);
  }

  // Bulk Delete
  async function handleBulkDelete() {
    if (selectedUrls.length === 0) return;

    setIsBulkDeleting(true);
    try {
      const res = await deleteGaleriImagesBulkServerFn({
        data: { urls: selectedUrls },
      });

      if (res.success) {
        setImages(res.images);
        selectedUrls.forEach((u) => removeGaleriImage(u));
      } else {
        const urlSet = new Set(selectedUrls);
        setImages((prev) => prev.filter((u) => !urlSet.has(u)));
        selectedUrls.forEach((u) => removeGaleriImage(u));
      }
      setSelectedUrls([]);
      setIsBulkDeleteModalOpen(false);
    } catch (err) {
      console.error("Toplu silme hatası:", err);
      const urlSet = new Set(selectedUrls);
      setImages((prev) => prev.filter((u) => !urlSet.has(u)));
      selectedUrls.forEach((u) => removeGaleriImage(u));
      setSelectedUrls([]);
      setIsBulkDeleteModalOpen(false);
    } finally {
      setIsBulkDeleting(false);
    }
  }

  const isAllSelected = images.length > 0 && selectedUrls.length === images.length;

  return (
    <AdminLayout
      title="Fotoğraf Galerisi"
      subtitle="Görsellerinizi bilgisayarınızdan doğrudan yükleyin veya mevcut fotoğrafları yönetin."
      actions={
        <div className="flex items-center gap-2">
          <button
            onClick={refreshGallery}
            disabled={isRefreshing}
            className="inline-flex items-center gap-2 rounded-full border border-black/10 bg-white px-4 py-2 text-[13px] font-medium text-black hover:bg-black/5 transition cursor-pointer shadow-xs disabled:opacity-50"
            title="Galeriyi Yenile"
          >
            <RefreshCw
              className={`size-3.5 ${isRefreshing ? "animate-spin" : ""}`}
            />
            <span className="hidden sm:inline">Listeyi Yenile</span>
          </button>

          <button
            onClick={() => fileInputRef.current?.click()}
            className="inline-flex items-center gap-2 rounded-full bg-black px-5 py-2.5 text-[13.5px] font-semibold text-white hover:bg-zinc-800 transition shadow-sm cursor-pointer"
          >
            <Upload className="size-4" />
            <span>Görsel Yükle</span>
          </button>
        </div>
      }
    >
      {/* Hidden File Input */}
      <input
        type="file"
        ref={fileInputRef}
        onChange={(e) => {
          if (e.target.files) handleFilesUpload(e.target.files);
        }}
        multiple
        accept="image/png,image/jpeg,image/jpg,image/webp"
        className="hidden"
      />

      {/* Main Drag & Drop Upload Zone (Clean, No Technical Badges) */}
      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
        className={`relative overflow-hidden rounded-[24px] border-2 border-dashed p-8 md:p-10 text-center transition-all cursor-pointer mb-8 ${
          isDragging
            ? "border-black bg-zinc-50 scale-[1.005] shadow-lg"
            : "border-black/15 bg-white hover:border-black/30 hover:bg-[#faf9f5]"
        }`}
      >
        <div className="mx-auto flex size-14 items-center justify-center rounded-full bg-[#f4f2ec] text-ink mb-3.5 shadow-xs">
          <Upload className="size-6" />
        </div>

        <h3 className="font-display font-semibold text-[18px] md:text-[20px] text-[#09090b]">
          Görselleri Buraya Sürükleyin veya Bilgisayarınızdan Seçin
        </h3>

        <p className="mt-1.5 text-[14px] text-black/60 max-w-lg mx-auto leading-relaxed">
          Fotoğraflarınızı seçip tekli veya toplu olarak doğrudan galeriye ekleyebilirsiniz.
        </p>
      </div>

      {/* Upload Queue Progress */}
      {uploadQueue.length > 0 && (
        <div className="rounded-[22px] bg-white p-5 border border-black/5 shadow-sm mb-8 space-y-3">
          <div className="flex items-center justify-between pb-3 border-b border-black/5">
            <h4 className="text-[14px] font-semibold text-[#09090b] flex items-center gap-2">
              <span>Yükleme Durumu</span>
              {isUploading && (
                <Loader2 className="size-3.5 animate-spin text-black/60" />
              )}
            </h4>
            <button
              onClick={() => setUploadQueue([])}
              className="text-[12px] text-black/40 hover:text-black transition cursor-pointer"
            >
              Listeyi Temizle
            </button>
          </div>

          <div className="divide-y divide-black/5 max-h-60 overflow-y-auto pr-1">
            {uploadQueue.map((item) => (
              <div
                key={item.id}
                className="py-3 flex items-center justify-between gap-4"
              >
                <div className="flex items-center gap-3 min-w-0">
                  {item.previewUrl && (
                    <img
                      src={item.previewUrl}
                      alt={item.name}
                      className="size-10 rounded-lg object-cover border border-black/10 shrink-0"
                    />
                  )}
                  <div className="min-w-0">
                    <p className="text-[13.5px] font-medium text-black truncate">
                      {item.name}
                    </p>
                    <p className="text-[11.5px] text-black/50 font-mono">
                      {item.originalSize}
                      {item.convertedSize ? ` → ${item.convertedSize}` : ""}
                    </p>
                  </div>
                </div>

                <div className="shrink-0 flex items-center gap-2">
                  {item.status === "converting" && (
                    <span className="inline-flex items-center gap-1.5 text-[12px] text-amber-600 font-medium bg-amber-50 px-3 py-1 rounded-full">
                      <Loader2 className="size-3 animate-spin" />
                      İşleniyor
                    </span>
                  )}
                  {item.status === "uploading" && (
                    <span className="inline-flex items-center gap-1.5 text-[12px] text-blue-600 font-medium bg-blue-50 px-3 py-1 rounded-full">
                      <Loader2 className="size-3 animate-spin" />
                      Yükleniyor
                    </span>
                  )}
                  {item.status === "success" && (
                    <span className="inline-flex items-center gap-1.5 text-[12px] text-emerald-600 font-medium bg-emerald-50 px-3 py-1 rounded-full">
                      <Check className="size-3.5" />
                      Yüklendi & Yayında
                    </span>
                  )}
                  {item.status === "error" && (
                    <span className="inline-flex items-center gap-1.5 text-[12px] text-red-600 font-medium bg-red-50 px-3 py-1 rounded-full">
                      <AlertTriangle className="size-3.5" />
                      {item.errorMessage || "Hata"}
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Secondary URL Input Accordion */}
      <div className="mb-6">
        <button
          onClick={() => setShowUrlAdd(!showUrlAdd)}
          className="text-[13px] font-medium text-black/60 hover:text-black transition flex items-center gap-1.5 cursor-pointer"
        >
          <span>{showUrlAdd ? "− URL Ekleme Kutusunu Gizle" : "+ Harici URL ile Ekle"}</span>
        </button>

        {showUrlAdd && (
          <form
            onSubmit={handleAddUrl}
            className="mt-3 p-4 rounded-[18px] bg-white border border-black/10 flex flex-col sm:flex-row gap-3 animate-in fade-in duration-200"
          >
            <input
              type="text"
              value={manualUrlInput}
              onChange={(e) => setManualUrlInput(e.target.value)}
              placeholder="https://cdn.parlakmobilyadekorasyon.com/..."
              className="flex-1 rounded-full border border-black/15 bg-[#f7f6f1] px-5 py-2.5 text-[13.5px] text-ink focus:bg-white focus:outline-none focus:border-black"
            />
            <button
              type="submit"
              className="rounded-full bg-black px-6 py-2.5 text-[13.5px] font-semibold text-white hover:bg-zinc-800 transition cursor-pointer"
            >
              Ekle
            </button>
          </form>
        )}
      </div>

      {/* Media Grid Header & Multi-Select Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4 bg-white p-4 rounded-[18px] border border-black/5 shadow-xs">
        <div className="flex items-center gap-3">
          <span className="text-[14.5px] font-semibold text-black/80">
            Yayındaki Galeri Görselleri ({images.length} Adet)
          </span>

          {selectedUrls.length > 0 && (
            <span className="rounded-full bg-black text-white px-2.5 py-0.5 text-[12px] font-medium">
              {selectedUrls.length} seçildi
            </span>
          )}
        </div>

        <div className="flex items-center gap-2">
          {images.length > 0 && (
            <button
              onClick={isAllSelected ? clearSelection : selectAll}
              className="inline-flex items-center gap-1.5 text-[13px] font-medium text-black/70 hover:text-black px-3 py-1.5 rounded-lg border border-black/10 hover:bg-black/5 transition cursor-pointer"
            >
              {isAllSelected ? (
                <>
                  <CheckSquare className="size-4 text-black" />
                  <span>Seçimi Kaldır</span>
                </>
              ) : (
                <>
                  <Square className="size-4 text-black/50" />
                  <span>Tümünü Seç</span>
                </>
              )}
            </button>
          )}

          {selectedUrls.length > 0 && (
            <button
              onClick={() => setIsBulkDeleteModalOpen(true)}
              className="inline-flex items-center gap-1.5 text-[13px] font-semibold text-white bg-red-600 hover:bg-red-700 px-3.5 py-1.5 rounded-lg transition cursor-pointer shadow-xs"
            >
              <Trash2 className="size-3.5" />
              <span>Seçilenleri Sil ({selectedUrls.length})</span>
            </button>
          )}
        </div>
      </div>

      {/* Media Grid with Multi-Select Checkboxes */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
        {images.map((imgUrl, i) => {
          const isSelected = selectedUrls.includes(imgUrl);

          return (
            <div
              key={`${imgUrl}-${i}`}
              onClick={() => toggleSelect(imgUrl)}
              className={`group relative aspect-square rounded-[18px] overflow-hidden bg-black transition-all cursor-pointer ${
                isSelected
                  ? "ring-3 ring-black shadow-lg scale-[0.98]"
                  : "border border-black/10 shadow-xs hover:shadow-md"
              }`}
            >
              <img
                src={imgUrl}
                alt={`Galeri Fotoğrafı ${i + 1}`}
                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                loading="lazy"
              />

              {/* Selection Checkbox (Always visible if selected, visible on hover if unselected) */}
              <div
                onClick={(e) => {
                  e.stopPropagation();
                  toggleSelect(imgUrl);
                }}
                className={`absolute top-2.5 left-2.5 z-20 size-7 rounded-lg flex items-center justify-center transition-all cursor-pointer ${
                  isSelected
                    ? "bg-black text-white shadow-md scale-100"
                    : "bg-white/80 backdrop-blur-xs text-black/40 border border-black/20 opacity-0 group-hover:opacity-100 hover:bg-white hover:text-black"
                }`}
              >
                <Check
                  className={`size-4 stroke-[3] ${
                    isSelected ? "text-white" : "opacity-0"
                  }`}
                />
              </div>

              {/* Index Number */}
              <div className="absolute top-2.5 right-2.5 z-10 px-2 py-0.5 rounded-md bg-black/60 backdrop-blur-xs text-[10.5px] text-white/80 font-mono">
                #{i + 1}
              </div>

              {/* Hover Actions Overlay */}
              <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2 p-3">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    copyToClipboard(imgUrl);
                  }}
                  title="URL Kopyala"
                  className="size-8 rounded-full bg-white/20 text-white hover:bg-white hover:text-black flex items-center justify-center transition cursor-pointer"
                >
                  {copiedUrl === imgUrl ? (
                    <Check className="size-4 text-emerald-400" />
                  ) : (
                    <Copy className="size-4" />
                  )}
                </button>

                <a
                  href={imgUrl}
                  target="_blank"
                  rel="noreferrer"
                  onClick={(e) => e.stopPropagation()}
                  title="Yeni Sekmede Aç"
                  className="size-8 rounded-full bg-white/20 text-white hover:bg-white hover:text-black flex items-center justify-center transition"
                >
                  <ExternalLink className="size-4" />
                </a>

                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setDeleteTargetUrl(imgUrl);
                  }}
                  title="Görseli Sil"
                  className="size-8 rounded-full bg-red-600/90 text-white hover:bg-red-600 flex items-center justify-center transition cursor-pointer"
                >
                  <Trash2 className="size-4" />
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Floating Bottom Sticky Bar for Multi-Select Actions */}
      {selectedUrls.length > 0 && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-40 bg-zinc-950/95 text-white backdrop-blur-md rounded-full shadow-2xl px-6 py-3.5 flex items-center gap-3 sm:gap-4 border border-white/10 animate-in slide-in-from-bottom duration-200">
          <span className="text-[13.5px] font-semibold text-white shrink-0">
            {selectedUrls.length} görsel seçildi
          </span>

          <div className="h-4 w-px bg-white/20 shrink-0" />

          <button
            onClick={isAllSelected ? clearSelection : selectAll}
            className="text-[13px] text-white/80 hover:text-white font-medium cursor-pointer shrink-0"
          >
            {isAllSelected ? "Seçimi Kaldır" : `Tümünü Seç (${images.length})`}
          </button>

          <button
            onClick={clearSelection}
            className="text-[13px] text-white/50 hover:text-white font-medium cursor-pointer shrink-0"
          >
            Temizle
          </button>

          <button
            onClick={() => setIsBulkDeleteModalOpen(true)}
            className="inline-flex items-center gap-2 bg-red-600 hover:bg-red-700 text-white px-4 py-1.5 rounded-full text-[13px] font-semibold transition cursor-pointer shadow-sm shrink-0"
          >
            <Trash2 className="size-3.5" />
            <span>Seçilenleri Sil ({selectedUrls.length})</span>
          </button>
        </div>
      )}

      {/* Single Delete Confirmation Modal */}
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
              Bu görsel hem sunucudaki galeriden hem de kamuya açık ana siteden
              kaldırılacaktır.
            </p>

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
                disabled={isDeleting}
                className="flex-1 rounded-full border border-black/15 bg-white py-2.5 text-[14px] font-medium text-ink hover:bg-black/5 transition cursor-pointer disabled:opacity-50"
              >
                Vazgeç
              </button>
              <button
                type="button"
                onClick={confirmDelete}
                disabled={isDeleting}
                className="flex-1 rounded-full bg-red-600 py-2.5 text-[14px] font-semibold text-white hover:bg-red-700 transition shadow-sm cursor-pointer disabled:opacity-50 inline-flex items-center justify-center gap-2"
              >
                {isDeleting ? (
                  <>
                    <Loader2 className="size-4 animate-spin" />
                    <span>Siliniyor...</span>
                  </>
                ) : (
                  <span>Evet, Sil</span>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Bulk Delete Confirmation Modal */}
      {isBulkDeleteModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
          <div className="relative w-full max-w-lg rounded-[24px] bg-white p-6 sm:p-7 shadow-2xl border border-black/10 text-center animate-in fade-in zoom-in duration-200">
            <button
              onClick={() => setIsBulkDeleteModalOpen(false)}
              className="absolute right-4 top-4 p-2 text-black/40 hover:text-black rounded-lg cursor-pointer"
            >
              <X className="size-5" />
            </button>

            <div className="mx-auto size-12 rounded-full bg-red-50 text-red-600 flex items-center justify-center mb-4">
              <AlertTriangle className="size-6" />
            </div>

            <h3 className="text-[20px] font-display font-semibold text-[#09090b]">
              {selectedUrls.length} Görseli Silmek İstiyor musunuz?
            </h3>
            <p className="mt-2 text-[13.5px] text-black/60 leading-relaxed">
              Seçilen <strong className="text-black font-semibold">{selectedUrls.length}</strong> adet görsel sunucudan ve sitedeki galeriden kalıcı olarak kaldırılacaktır.
            </p>

            {/* Thumbnail Preview Grid */}
            <div className="my-5 grid grid-cols-4 sm:grid-cols-6 gap-2 max-h-48 overflow-y-auto p-2 bg-[#f7f6f1] rounded-2xl border border-black/5">
              {selectedUrls.slice(0, 12).map((url, idx) => (
                <div
                  key={idx}
                  className="aspect-square rounded-lg overflow-hidden bg-black border border-black/10"
                >
                  <img
                    src={url}
                    alt="Silinecek"
                    className="w-full h-full object-cover"
                  />
                </div>
              ))}
              {selectedUrls.length > 12 && (
                <div className="aspect-square rounded-lg bg-black/10 flex items-center justify-center text-[12px] font-semibold text-black/70">
                  +{selectedUrls.length - 12}
                </div>
              )}
            </div>

            <div className="flex items-center justify-center gap-3 mt-6">
              <button
                type="button"
                onClick={() => setIsBulkDeleteModalOpen(false)}
                disabled={isBulkDeleting}
                className="flex-1 rounded-full border border-black/15 bg-white py-2.5 text-[14px] font-medium text-ink hover:bg-black/5 transition cursor-pointer disabled:opacity-50"
              >
                Vazgeç
              </button>
              <button
                type="button"
                onClick={handleBulkDelete}
                disabled={isBulkDeleting}
                className="flex-1 rounded-full bg-red-600 py-2.5 text-[14px] font-semibold text-white hover:bg-red-700 transition shadow-sm cursor-pointer disabled:opacity-50 inline-flex items-center justify-center gap-2"
              >
                {isBulkDeleting ? (
                  <>
                    <Loader2 className="size-4 animate-spin" />
                    <span>Siliniyor...</span>
                  </>
                ) : (
                  <span>Evet, Hepsini Sil ({selectedUrls.length})</span>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </AdminLayout>
  );
}
