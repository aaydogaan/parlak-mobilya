import { useState, useMemo, useEffect, useCallback } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { useAdminStore, type TalepItem, type TalepStatus } from "@/lib/admin/adminStore";
import {
  getTaleplerServerFn,
  updateTalepStatusServerFn,
  updateTalepNotesServerFn,
  deleteTalepServerFn,
} from "@/lib/server/talepler";
import {
  Search,
  Filter,
  Phone,
  MessageCircle,
  Mail,
  MapPin,
  Calendar,
  CheckCircle2,
  Clock,
  Trash2,
  Edit3,
  ExternalLink,
  ChevronDown,
  Sparkles,
  Download,
  RefreshCw,
} from "lucide-react";

export const Route = createFileRoute("/admin/talepler")({
  component: AdminTaleplerPage,
  head: () => ({
    meta: [
      { title: "Keşif ve Teklif Talepleri - Parlak Mobilya Admin" },
      { name: "robots", content: "noindex, nofollow" },
    ],
  }),
});

// Avatar color palette for initials
const avatarBgColors = [
  "bg-[#c9f227] text-[#0d1a15]",
  "bg-[#60a5fa] text-white",
  "bg-[#f59e0b] text-white",
  "bg-[#a78bfa] text-white",
  "bg-[#f87171] text-white",
  "bg-[#34d399] text-[#0d1a15]",
];

export function AdminTaleplerPage() {
  const { talepler, setTalepler, updateTalepStatus, updateTalepNotes, deleteTalep } = useAdminStore();
  const [selectedId, setSelectedId] = useState<string>(talepler[0]?.id ?? "");
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [editingNotes, setEditingNotes] = useState(false);
  const [noteText, setNoteText] = useState("");
  const [loading, setLoading] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const fetchTalepler = useCallback(async (silent = false) => {
    if (!silent) setIsRefreshing(true);
    try {
      const res = await getTaleplerServerFn();
      if (res?.talepler) {
        setTalepler(res.talepler);
      }
    } catch (err) {
      console.error("Talepler sunucudan yüklenemedi:", err);
    } finally {
      if (!silent) setIsRefreshing(false);
    }
  }, [setTalepler]);

  useEffect(() => {
    fetchTalepler();
    // 20 saniyede bir yeni gelen talepleri arka planda kontrol et
    const interval = setInterval(() => {
      fetchTalepler(true);
    }, 20000);
    return () => clearInterval(interval);
  }, [fetchTalepler]);

  const filteredTalepler = useMemo(() => {
    return talepler.filter((t) => {
      const matchesSearch =
        t.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        t.phone.includes(searchQuery) ||
        t.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
        t.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
        t.district.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesStatus = statusFilter === "all" || t.status === statusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [talepler, searchQuery, statusFilter]);

  const selectedTalep = talepler.find((t) => t.id === selectedId) ?? filteredTalepler[0];

  // KPI calculations
  const countNew = talepler.filter((t) => t.status === "Yeni").length;
  const countInReview = talepler.filter((t) => t.status === "İncelendi" || t.status === "Arandı").length;
  const countDiscovery = talepler.filter((t) => t.status === "Keşif Planlandı").length;
  const countCompleted = talepler.filter((t) => t.status === "Tamamlandı").length;
  const countTotal = talepler.length;

  function getInitials(name: string) {
    const parts = name.trim().split(" ");
    if (parts.length >= 2) {
      return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
    }
    return name.slice(0, 2).toUpperCase();
  }

  function formatTalepDate(dateStr?: string, timestamp?: number): string {
    if (timestamp && !isNaN(timestamp)) {
      try {
        return new Date(timestamp).toLocaleDateString("tr-TR", {
          timeZone: "Europe/Istanbul",
          day: "2-digit",
          month: "long",
          hour: "2-digit",
          minute: "2-digit",
        });
      } catch {
        // fallback
      }
    }
    return dateStr || "Yeni";
  }

  function getStatusBadgeClass(status: TalepStatus) {
    switch (status) {
      case "Yeni":
        return "bg-black text-white font-semibold";
      case "İncelendi":
        return "bg-zinc-100 text-zinc-800 font-medium";
      case "Arandı":
        return "bg-zinc-100 text-zinc-800 font-medium";
      case "Keşif Planlandı":
        return "bg-zinc-200 text-black font-semibold";
      case "Tamamlandı":
        return "bg-zinc-100 text-zinc-700 font-medium";
      case "İptal":
        return "bg-red-50 text-red-700 font-medium";
      default:
        return "bg-black/5 text-[#09090b]";
    }
  }

  const [deleteTargetTalep, setDeleteTargetTalep] = useState<TalepItem | null>(null);

  return (
    <AdminLayout
      title="Keşif & Teklif Talepleri"
      subtitle="Web sitesi ve iletişim formlarından gelen tüm müşteri taleplerini buradan yönetin."
      actions={
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => fetchTalepler(false)}
            disabled={isRefreshing}
            className="inline-flex items-center gap-2 rounded-full border border-black/10 bg-white px-4 sm:px-5 py-2 sm:py-2.5 text-[13px] sm:text-[13.5px] font-medium text-black shadow-xs hover:bg-black/5 transition cursor-pointer disabled:opacity-50"
            title="Talepleri Sunucudan Yenile"
          >
            <RefreshCw className={`size-4 ${isRefreshing ? "animate-spin" : ""}`} />
            <span>{isRefreshing ? "Yenileniyor..." : "Yenile"}</span>
          </button>

          <button
            onClick={() => {
              const csvData =
                "ID,Ad Soyad,Telefon,İlçe,Kategori,Tarih,Durum\n" +
                talepler.map((t) => `"${t.id}","${t.name}","${t.phone}","${t.district}","${t.category}","${formatTalepDate(t.date, t.timestamp)}","${t.status}"`).join("\n");
              const blob = new Blob([csvData], { type: "text/csv;charset=utf-8;" });
              const url = URL.createObjectURL(blob);
              const a = document.createElement("a");
              a.href = url;
              a.download = `parlak-mobilya-talepler-${new Date().toISOString().slice(0, 10)}.csv`;
              a.click();
            }}
            className="inline-flex items-center gap-2 rounded-full bg-black px-4 sm:px-5 py-2 sm:py-2.5 text-[13px] sm:text-[13.5px] font-medium text-white shadow-sm hover:bg-zinc-800 transition cursor-pointer"
          >
            <Download className="size-4" />
            <span>Dışa Aktar (CSV)</span>
          </button>
        </div>
      }
    >
      {/* 1. Top KPI Summary Cards Row (Clean, Unified Black & White Palette) */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 sm:gap-4 mb-6">
        {/* KPI 1: Yeni */}
        <div
          onClick={() => setStatusFilter(statusFilter === "Yeni" ? "all" : "Yeni")}
          className={`cursor-pointer rounded-[20px] p-4 sm:p-5 transition-all flex items-center gap-3.5 border ${
            statusFilter === "Yeni"
              ? "bg-black text-white border-black shadow-md ring-2 ring-zinc-400"
              : "bg-white text-[#09090b] border-black/5 hover:border-black/15 shadow-xs"
          }`}
        >
          <div className={`size-2 rounded-full shrink-0 ${statusFilter === "Yeni" ? "bg-white" : "bg-black"}`} />
          <div className="min-w-0">
            <span className={`text-[12px] block font-medium truncate ${statusFilter === "Yeni" ? "text-white/70" : "text-black/50"}`}>
              Yeni Talepler
            </span>
            <span className={`text-[24px] sm:text-[28px] font-display font-semibold leading-tight ${statusFilter === "Yeni" ? "text-white" : "text-[#09090b]"}`}>
              {countNew}
            </span>
          </div>
        </div>

        {/* KPI 2: İncelenen */}
        <div
          onClick={() => setStatusFilter(statusFilter === "İncelendi" ? "all" : "İncelendi")}
          className={`cursor-pointer rounded-[20px] p-4 sm:p-5 transition-all flex items-center gap-3.5 border ${
            statusFilter === "İncelendi"
              ? "bg-black text-white border-black shadow-md ring-2 ring-zinc-400"
              : "bg-white text-[#09090b] border-black/5 hover:border-black/15 shadow-xs"
          }`}
        >
          <div className={`size-2 rounded-full shrink-0 ${statusFilter === "İncelendi" ? "bg-white" : "bg-zinc-400"}`} />
          <div className="min-w-0">
            <span className={`text-[12px] block font-medium truncate ${statusFilter === "İncelendi" ? "text-white/70" : "text-black/50"}`}>
              İncelenen
            </span>
            <span className={`text-[24px] sm:text-[28px] font-display font-semibold leading-tight ${statusFilter === "İncelendi" ? "text-white" : "text-[#09090b]"}`}>
              {countInReview}
            </span>
          </div>
        </div>

        {/* KPI 3: Keşif Planlanan */}
        <div
          onClick={() => setStatusFilter(statusFilter === "Keşif Planlandı" ? "all" : "Keşif Planlandı")}
          className={`cursor-pointer rounded-[20px] p-4 sm:p-5 transition-all flex items-center gap-3.5 border ${
            statusFilter === "Keşif Planlandı"
              ? "bg-black text-white border-black shadow-md ring-2 ring-zinc-400"
              : "bg-white text-[#09090b] border-black/5 hover:border-black/15 shadow-xs"
          }`}
        >
          <div className={`size-2 rounded-full shrink-0 ${statusFilter === "Keşif Planlandı" ? "bg-white" : "bg-zinc-400"}`} />
          <div className="min-w-0">
            <span className={`text-[12px] block font-medium truncate ${statusFilter === "Keşif Planlandı" ? "text-white/70" : "text-black/50"}`}>
              Keşif Planlanan
            </span>
            <span className={`text-[24px] sm:text-[28px] font-display font-semibold leading-tight ${statusFilter === "Keşif Planlandı" ? "text-white" : "text-[#09090b]"}`}>
              {countDiscovery}
            </span>
          </div>
        </div>

        {/* KPI 4: Tamamlanan */}
        <div
          onClick={() => setStatusFilter(statusFilter === "Tamamlandı" ? "all" : "Tamamlandı")}
          className={`cursor-pointer rounded-[20px] p-4 sm:p-5 transition-all flex items-center gap-3.5 border ${
            statusFilter === "Tamamlandı"
              ? "bg-black text-white border-black shadow-md ring-2 ring-zinc-400"
              : "bg-white text-[#09090b] border-black/5 hover:border-black/15 shadow-xs"
          }`}
        >
          <div className={`size-2 rounded-full shrink-0 ${statusFilter === "Tamamlandı" ? "bg-white" : "bg-zinc-400"}`} />
          <div className="min-w-0">
            <span className={`text-[12px] block font-medium truncate ${statusFilter === "Tamamlandı" ? "text-white/70" : "text-black/50"}`}>
              Tamamlanan
            </span>
            <span className={`text-[24px] sm:text-[28px] font-display font-semibold leading-tight ${statusFilter === "Tamamlandı" ? "text-white" : "text-[#09090b]"}`}>
              {countCompleted}
            </span>
          </div>
        </div>

        {/* KPI 5: Toplam */}
        <div
          onClick={() => setStatusFilter("all")}
          className={`col-span-2 sm:col-span-1 cursor-pointer rounded-[20px] p-4 sm:p-5 transition-all flex items-center gap-3.5 border ${
            statusFilter === "all"
              ? "bg-black text-white border-black shadow-md ring-2 ring-zinc-400"
              : "bg-white text-[#09090b] border-black/5 hover:border-black/15 shadow-xs"
          }`}
        >
          <div className={`size-2 rounded-full shrink-0 ${statusFilter === "all" ? "bg-white" : "bg-black"}`} />
          <div className="min-w-0">
            <span className={`text-[12px] block font-medium truncate ${statusFilter === "all" ? "text-white/70" : "text-black/50"}`}>
              Tüm Talepler
            </span>
            <span className={`text-[24px] sm:text-[28px] font-display font-semibold leading-tight ${statusFilter === "all" ? "text-white" : "text-[#09090b]"}`}>
              {countTotal}
            </span>
          </div>
        </div>
      </div>

      {/* 2. Main Master-Detail View */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Side: Inquiry List (7 Cols) */}
        <div className="lg:col-span-7 bg-white rounded-[24px] border border-black/5 shadow-sm p-4 sm:p-6 overflow-hidden">
          {/* Search & Filter Bar */}
          <div className="flex flex-col sm:flex-row items-center gap-3 pb-4 border-b border-black/5">
            <div className="relative flex-1 w-full">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 size-4 text-black/40" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Müşteri adı, telefon veya ilçe ara..."
                className="w-full rounded-full bg-[#f7f6f1] border border-black/5 py-2.5 pl-10 pr-4 text-[13.5px] text-ink placeholder-black/40 focus:bg-white focus:border-black/20 focus:outline-none transition"
              />
            </div>

            <div className="flex items-center gap-2 w-full sm:w-auto">
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="rounded-full bg-[#f7f6f1] border border-black/5 px-4 py-2.5 text-[13px] font-medium text-ink focus:outline-none cursor-pointer w-full sm:w-auto"
              >
                <option value="all">Tüm Durumlar ({talepler.length})</option>
                <option value="Yeni">Yeni ({countNew})</option>
                <option value="İncelendi">İncelendi</option>
                <option value="Arandı">Arandı</option>
                <option value="Keşif Planlandı">Keşif Planlandı</option>
                <option value="Tamamlandı">Tamamlandı</option>
                <option value="İptal">İptal</option>
              </select>
            </div>
          </div>

          {/* List Items */}
          <div className="mt-3 space-y-1.5">
            {filteredTalepler.length === 0 ? (
              <div className="py-12 text-center text-muted text-[14px]">
                Arama kriterine uygun talep bulunamadı.
              </div>
            ) : (
              filteredTalepler.map((item) => {
                const isSelected = item.id === (selectedTalep?.id ?? "");

                return (
                  <div
                    key={item.id}
                    onClick={() => setSelectedId(item.id)}
                    className={`p-3.5 sm:p-4 rounded-[18px] transition-all cursor-pointer flex items-center justify-between gap-3 border ${
                      isSelected
                        ? "bg-[#f2f6f4] border-[#0d1a15] shadow-xs"
                        : "bg-white border-black/5 hover:bg-[#faf9f5] hover:border-black/10"
                    }`}
                  >
                    {/* Left info: Avatar + ID + Name + Subtitle */}
                    <div className="flex items-center gap-3 min-w-0">
                      <div
                        className="size-10 rounded-full flex items-center justify-center font-bold text-[12px] shrink-0 bg-black text-white border border-black/10"
                      >
                        {getInitials(item.name)}
                      </div>
                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="font-semibold text-[14px] text-[#09090b] truncate">
                            {item.name}
                          </span>
                          <span className="text-[11px] text-black/40 font-mono">
                            {item.id}
                          </span>
                        </div>
                        <p className="text-[12.5px] text-black/50 truncate mt-0.5">
                          {item.category} · <span className="text-black/40">{item.district}</span>
                        </p>
                      </div>
                    </div>

                    {/* Right info: Date + Status Pill */}
                    <div className="flex flex-col sm:flex-row items-end sm:items-center gap-1.5 sm:gap-3 shrink-0 text-right">
                      <span className="text-[11.5px] text-black/40 font-mono hidden sm:inline-block">
                        {formatTalepDate(item.date, item.timestamp)}
                      </span>

                      <span
                        className={`px-2.5 py-1 rounded-full text-[11.5px] tracking-wide shrink-0 ${getStatusBadgeClass(
                          item.status
                        )}`}
                      >
                        {item.status}
                      </span>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Right Side: Selected Inquiry Detail Panel (5 Cols) */}
        {selectedTalep ? (
          <div className="lg:col-span-5 bg-white rounded-[24px] border border-black/5 shadow-sm p-5 sm:p-7 sticky top-28 space-y-6">
            {/* Header: ID + Placed Date + Status */}
            <div className="flex items-start justify-between gap-4 pb-4 border-b border-black/5">
              <div>
                <h3 className="text-[20px] sm:text-[22px] font-display font-bold text-[#09090b]">
                  #{selectedTalep.id}
                </h3>
                <p className="text-[12px] sm:text-[12.5px] text-black/50 mt-0.5">
                  Tarih: {formatTalepDate(selectedTalep.date, selectedTalep.timestamp)}
                </p>
              </div>
              <span
                className={`px-3 py-1 rounded-full text-[12px] font-semibold ${getStatusBadgeClass(
                  selectedTalep.status
                )}`}
              >
                {selectedTalep.status}
              </span>
            </div>

            {/* Customer Box with Quick Actions (WhatsApp & Call) */}
            <div className="rounded-[20px] bg-[#f7f6f1] p-4 sm:p-5 border border-black/5">
              <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="size-11 rounded-full bg-black text-white font-bold text-[14px] flex items-center justify-center shrink-0 border border-black/10">
                    {getInitials(selectedTalep.name)}
                  </div>
                  <div>
                    <h4 className="font-semibold text-[15px] sm:text-[16px] text-[#09090b]">
                      {selectedTalep.name}
                    </h4>
                    <p className="text-[12.5px] text-black/60">{selectedTalep.phone}</p>
                  </div>
                </div>

                <div className="flex items-center gap-1.5">
                  <a
                    href={`https://wa.me/90${selectedTalep.phone.replace(/[^0-9]/g, "").replace(/^0/, "")}?text=${encodeURIComponent(
                      `Merhaba ${selectedTalep.name} Hanım/Bey, Parlak Mobilya & Dekorasyon'dan iletişime geçiyoruz. ${selectedTalep.category} talebinizle ilgili yardımcı olmak isteriz.`
                    )}`}
                    target="_blank"
                    rel="noreferrer"
                    title="WhatsApp'tan Yaz"
                    className="size-9 rounded-full bg-black text-white hover:bg-zinc-800 flex items-center justify-center hover:scale-105 transition shadow-sm"
                  >
                    <MessageCircle className="size-4" />
                  </a>
                  <a
                    href={`tel:${selectedTalep.phone.replace(/[^0-9+]/g, "")}`}
                    title="Telefonla Ara"
                    className="size-9 rounded-full bg-black text-white hover:bg-zinc-800 flex items-center justify-center hover:scale-105 transition shadow-sm"
                  >
                    <Phone className="size-3.5" />
                  </a>
                </div>
              </div>

              {selectedTalep.email && (
                <div className="mt-3 pt-3 border-t border-black/5 flex items-center gap-2 text-[12.5px] text-black/70">
                  <Mail className="size-3.5 text-black/40" />
                  <span>{selectedTalep.email}</span>
                </div>
              )}
            </div>

            {/* Details Section */}
            <div className="space-y-3 text-[13.5px]">
              <span className="text-[11px] font-semibold text-black/40 uppercase tracking-wider block font-mono">
                TALEP BİLGİLERİ
              </span>

              <div className="flex items-center justify-between py-2 border-b border-black/5">
                <span className="text-black/60">Mobilya Kategorisi:</span>
                <span className="font-semibold text-[#09090b] bg-black/5 px-2.5 py-0.5 rounded-full text-[12.5px]">
                  {selectedTalep.category}
                </span>
              </div>

              <div className="flex items-center justify-between py-2 border-b border-black/5">
                <span className="text-black/60">Konum / İlçe:</span>
                <span className="font-medium text-[#09090b] flex items-center gap-1.5">
                  <MapPin className="size-3.5 text-black/40" />
                  {selectedTalep.district}
                </span>
              </div>

              {selectedTalep.estimatedBudget && (
                <div className="flex items-center justify-between py-2 border-b border-black/5">
                  <span className="text-black/60">Tahmini Bütçe:</span>
                  <span className="font-semibold text-[#09090b]">
                    {selectedTalep.estimatedBudget}
                  </span>
                </div>
              )}

              {/* Message */}
              <div className="pt-2">
                <span className="text-black/60 text-[12.5px] block mb-1.5">
                  Müşteri Mesajı & Notu:
                </span>
                <div className="rounded-[16px] bg-[#f7f6f1] p-3.5 text-[13.5px] leading-relaxed text-[#09090b] border border-black/5">
                  "{selectedTalep.message}"
                </div>
              </div>
            </div>

            {/* Admin Internal Notes */}
            <div className="pt-1">
              <div className="flex items-center justify-between mb-2">
                <span className="text-[11px] font-semibold text-black/40 uppercase tracking-wider font-mono">
                  YÖNETİCİ NOTLARI
                </span>
                {!editingNotes ? (
                  <button
                    onClick={() => {
                      setNoteText(selectedTalep.notes ?? "");
                      setEditingNotes(true);
                    }}
                    className="text-[12px] text-black font-medium hover:underline flex items-center gap-1 cursor-pointer"
                  >
                    <Edit3 className="size-3.5" />
                    <span>Düzenle</span>
                  </button>
                ) : null}
              </div>

              {editingNotes ? (
                <div className="space-y-2">
                  <textarea
                    value={noteText}
                    onChange={(e) => setNoteText(e.target.value)}
                    placeholder="Keşif randevusu, malzeme teklifi notları..."
                    rows={3}
                    className="w-full rounded-[14px] border border-black/15 bg-white p-3 text-[13px] text-ink focus:outline-none focus:border-black"
                  />
                  <div className="flex items-center justify-end gap-2">
                    <button
                      onClick={() => setEditingNotes(false)}
                      className="px-3 py-1.5 rounded-lg text-[12.5px] text-black/60 hover:bg-black/5 cursor-pointer"
                    >
                      İptal
                    </button>
                    <button
                      onClick={async () => {
                        updateTalepNotes(selectedTalep.id, noteText);
                        setEditingNotes(false);
                        try {
                          await updateTalepNotesServerFn({
                            data: { id: selectedTalep.id, notes: noteText },
                          });
                        } catch (err) {
                          console.error("Not kaydedilemedi:", err);
                        }
                      }}
                      className="px-4 py-1.5 rounded-lg bg-black text-white text-[12.5px] font-medium cursor-pointer hover:bg-zinc-800"
                    >
                      Kaydet
                    </button>
                  </div>
                </div>
              ) : (
                <div className="rounded-[14px] bg-[#faf9f5] border border-black/5 p-3 text-[13px] text-black/70 italic">
                  {selectedTalep.notes || "Henüz not eklenmedi. Keşif veya fiyat notu eklemek için düzenleye tıklayın."}
                </div>
              )}
            </div>

            {/* Status Changer & Delete Action */}
            <div className="pt-4 border-t border-black/5 flex items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <span className="text-[12.5px] text-black/60">Durumu Değiştir:</span>
                <select
                  value={selectedTalep.status}
                  onChange={async (e) => {
                    const newStatus = e.target.value as TalepStatus;
                    updateTalepStatus(selectedTalep.id, newStatus);
                    try {
                      await updateTalepStatusServerFn({
                        data: { id: selectedTalep.id, status: newStatus },
                      });
                    } catch (err) {
                      console.error("Durum güncellenemedi:", err);
                    }
                  }}
                  className="rounded-xl border border-black/10 bg-white px-3 py-1.5 text-[12.5px] font-semibold text-[#09090b] shadow-xs cursor-pointer"
                >
                  <option value="Yeni">Yeni</option>
                  <option value="İncelendi">İncelendi</option>
                  <option value="Arandı">Arandı</option>
                  <option value="Keşif Planlandı">Keşif Planlandı</option>
                  <option value="Tamamlandı">Tamamlandı</option>
                  <option value="İptal">İptal</option>
                </select>
              </div>

              <button
                onClick={() => setDeleteTargetTalep(selectedTalep)}
                className="p-2 text-red-500 hover:bg-red-50 rounded-xl transition cursor-pointer"
                title="Talebi Sil"
              >
                <Trash2 className="size-4" />
              </button>
            </div>
          </div>
        ) : null}
      </div>

      {/* Modern Deletion Confirmation Modal */}
      {deleteTargetTalep && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
          <div className="relative w-full max-w-md rounded-[24px] bg-white p-6 sm:p-7 shadow-2xl border border-black/10 text-center animate-in fade-in zoom-in duration-200">
            <button
              onClick={() => setDeleteTargetTalep(null)}
              className="absolute right-4 top-4 p-2 text-black/40 hover:text-black rounded-lg cursor-pointer"
            >
              <Trash2 className="size-4 hidden" />
            </button>

            <div className="mx-auto size-12 rounded-full bg-red-50 text-red-600 flex items-center justify-center mb-4">
              <Trash2 className="size-6" />
            </div>

            <h3 className="text-[18px] font-display font-semibold text-[#0d1a15]">
              Talebi Silmek İstiyor musunuz?
            </h3>
            <p className="mt-2 text-[13.5px] text-black/60 leading-relaxed">
              <strong className="text-black">"{deleteTargetTalep.name} (#{deleteTargetTalep.id})"</strong> adlı müşterinin talebi kalıcı olarak silinecektir.
            </p>

            <div className="flex items-center justify-center gap-3 mt-6">
              <button
                type="button"
                onClick={() => setDeleteTargetTalep(null)}
                className="flex-1 rounded-full border border-black/15 bg-white py-2.5 text-[13.5px] font-medium text-ink hover:bg-black/5 transition cursor-pointer"
              >
                Vazgeç
              </button>
              <button
                type="button"
                onClick={async () => {
                  const targetId = deleteTargetTalep.id;
                  deleteTalep(targetId);
                  setDeleteTargetTalep(null);
                  try {
                    await deleteTalepServerFn({ data: { id: targetId } });
                  } catch (err) {
                    console.error("Talep silinemedi:", err);
                  }
                }}
                className="flex-1 rounded-full bg-red-600 py-2.5 text-[13.5px] font-semibold text-white hover:bg-red-700 transition shadow-sm cursor-pointer"
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
