import { useState, useEffect } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { useAdminStore } from "@/lib/admin/adminStore";
import {
  Settings,
  Phone,
  Mail,
  MapPin,
  Clock,
  Lock,
  Save,
  CheckCircle2,
  ShieldCheck,
  Laptop,
  Trash2,
  Activity,
  AlertTriangle,
  Loader2,
} from "lucide-react";
import {
  changeAdminPasswordServerFn,
  getAdminSessionServerFn,
  revokeAdminSessionServerFn,
  getAdminAuditLogsServerFn,
} from "@/lib/server/admin";
import type { ActiveSessionView } from "@/lib/server/security/session";
import type { AuditLogEntry } from "@/lib/server/security/audit";

export const Route = createFileRoute("/admin/ayarlar")({
  component: AdminAyarlarPage,
  head: () => ({
    meta: [
      { title: "Site & Sistem Ayarları - Parlak Mobilya Admin" },
      { name: "robots", content: "noindex, nofollow" },
    ],
  }),
});

export function AdminAyarlarPage() {
  const { settings, updateSettings } = useAdminStore();
  const [saved, setSaved] = useState(false);
  const [passwordSaved, setPasswordSaved] = useState(false);

  // Form states
  const [phone, setPhone] = useState(settings.phone);
  const [whatsapp, setWhatsapp] = useState(settings.whatsapp);
  const [email, setEmail] = useState(settings.email);
  const [address1, setAddress1] = useState(settings.addressLines[0] || "");
  const [address2, setAddress2] = useState(settings.addressLines[1] || "");
  const [workingHours, setWorkingHours] = useState(settings.workingHours);

  // Password state
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [isChangingPassword, setIsChangingPassword] = useState(false);

  // Active Sessions state
  const [activeSessions, setActiveSessions] = useState<ActiveSessionView[]>([]);
  const [loadingSessions, setLoadingSessions] = useState(true);

  // Audit Logs state
  const [auditLogs, setAuditLogs] = useState<AuditLogEntry[]>([]);
  const [loadingLogs, setLoadingLogs] = useState(true);

  useEffect(() => {
    // Load sessions
    getAdminSessionServerFn()
      .then((res) => {
        if (res.activeSessions) {
          setActiveSessions(res.activeSessions);
        }
      })
      .finally(() => setLoadingSessions(false));

    // Load audit logs
    getAdminAuditLogsServerFn({ data: { limit: 25 } })
      .then((res: any) => {
        if (res?.logs) {
          setAuditLogs(res.logs);
        }
      })
      .catch((err) => console.error("Denetim kayıtları yüklenemedi:", err))
      .finally(() => setLoadingLogs(false));
  }, []);

  function handleSave(e: React.FormEvent) {
    e.preventDefault();
    updateSettings({
      phone,
      whatsapp,
      email,
      addressLines: [address1, address2],
      workingHours,
    });
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  }

  async function handlePasswordChange(e: React.FormEvent) {
    e.preventDefault();
    setPasswordError("");

    if (!currentPassword) {
      setPasswordError("Lütfen mevcut şifrenizi girin.");
      return;
    }

    if (newPassword.length < 8) {
      setPasswordError("Yeni şifre en az 8 karakter olmalıdır.");
      return;
    }

    if (!/[a-zA-Z]/.test(newPassword) || !/[0-9]/.test(newPassword)) {
      setPasswordError("Yeni şifre en az bir harf ve bir rakam içermelidir.");
      return;
    }

    if (newPassword !== confirmPassword) {
      setPasswordError("Yeni şifreler birbiriyle eşleşmiyor!");
      return;
    }

    setIsChangingPassword(true);
    try {
      const res = await changeAdminPasswordServerFn({
        data: {
          currentPassword,
          newPassword,
        },
      });

      if (res.success) {
        setPasswordSaved(true);
        setCurrentPassword("");
        setNewPassword("");
        setConfirmPassword("");
        setTimeout(() => setPasswordSaved(false), 4000);

        // Refresh sessions list
        const sessionRes = await getAdminSessionServerFn();
        if (sessionRes.activeSessions) {
          setActiveSessions(sessionRes.activeSessions);
        }
      }
    } catch (err: any) {
      setPasswordError(err?.message || "Şifre güncellenirken bir hata oluştu.");
    } finally {
      setIsChangingPassword(false);
    }
  }

  async function handleRevokeSession(sessionId: string) {
    try {
      const res = await revokeAdminSessionServerFn({ data: { sessionId } });
      if (res.success) {
        setActiveSessions(res.activeSessions);
      }
    } catch (err) {
      console.error("Oturum kapatılamadı:", err);
    }
  }

  return (
    <AdminLayout
      title="Site & Sistem Ayarları"
      subtitle="Web sitenizdeki iletişim bilgilerini, çalışma saatlerini ve atölye adresini güncelleyin."
    >
      <div className="space-y-8 max-w-4xl">
        {/* İletişim Bilgileri Kartı */}
        <div className="bg-white rounded-[24px] border border-black/5 p-6 sm:p-8 shadow-sm">
          {saved && (
            <div className="mb-6 rounded-[16px] bg-emerald-50 border border-emerald-200 p-4 text-emerald-800 text-[14px] flex items-center gap-2">
              <CheckCircle2 className="size-5 text-emerald-600 shrink-0" />
              <span>Ayarlar başarıyla kaydedildi ve güncellendi!</span>
            </div>
          )}

          <form onSubmit={handleSave} className="space-y-6 text-[14px]">
            <div>
              <span className="text-[12px] font-semibold text-black/40 uppercase tracking-wider block mb-4 font-mono">
                İLETİŞİM BİLGİLERİ
              </span>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[13px] font-medium text-black/70 mb-1.5 flex items-center gap-1.5">
                    <Phone className="size-3.5" />
                    <span>Telefon Numarası</span>
                  </label>
                  <input
                    type="text"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full rounded-[14px] border border-black/15 bg-[#f7f6f1] px-4 py-2.5 text-[14px] text-ink focus:bg-white focus:outline-none focus:border-black"
                  />
                </div>

                <div>
                  <label className="block text-[13px] font-medium text-black/70 mb-1.5 flex items-center gap-1.5">
                    <Phone className="size-3.5 text-emerald-600" />
                    <span>WhatsApp Numarası / Linki</span>
                  </label>
                  <input
                    type="text"
                    value={whatsapp}
                    onChange={(e) => setWhatsapp(e.target.value)}
                    className="w-full rounded-[14px] border border-black/15 bg-[#f7f6f1] px-4 py-2.5 text-[14px] text-ink focus:bg-white focus:outline-none focus:border-black"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-[13px] font-medium text-black/70 mb-1.5 flex items-center gap-1.5">
                    <Mail className="size-3.5" />
                    <span>E-posta Adresi</span>
                  </label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full rounded-[14px] border border-black/15 bg-[#f7f6f1] px-4 py-2.5 text-[14px] text-ink focus:bg-white focus:outline-none focus:border-black"
                  />
                </div>
              </div>
            </div>

            <div className="border-t border-black/5 pt-5">
              <span className="text-[12px] font-semibold text-black/40 uppercase tracking-wider block mb-4 font-mono">
                ADRES VE ÇALIŞMA SAATLERİ
              </span>

              <div className="space-y-4">
                <div>
                  <label className="block text-[13px] font-medium text-black/70 mb-1.5 flex items-center gap-1.5">
                    <MapPin className="size-3.5" />
                    <span>Adres Satırı 1</span>
                  </label>
                  <input
                    type="text"
                    value={address1}
                    onChange={(e) => setAddress1(e.target.value)}
                    className="w-full rounded-[14px] border border-black/15 bg-[#f7f6f1] px-4 py-2.5 text-[14px] text-ink focus:bg-white focus:outline-none focus:border-black"
                  />
                </div>

                <div>
                  <label className="block text-[13px] font-medium text-black/70 mb-1.5 flex items-center gap-1.5">
                    <MapPin className="size-3.5" />
                    <span>Adres Satırı 2 (İlçe / İl)</span>
                  </label>
                  <input
                    type="text"
                    value={address2}
                    onChange={(e) => setAddress2(e.target.value)}
                    className="w-full rounded-[14px] border border-black/15 bg-[#f7f6f1] px-4 py-2.5 text-[14px] text-ink focus:bg-white focus:outline-none focus:border-black"
                  />
                </div>

                <div>
                  <label className="block text-[13px] font-medium text-black/70 mb-1.5 flex items-center gap-1.5">
                    <Clock className="size-3.5" />
                    <span>Çalışma Saatleri</span>
                  </label>
                  <input
                    type="text"
                    value={workingHours}
                    onChange={(e) => setWorkingHours(e.target.value)}
                    className="w-full rounded-[14px] border border-black/15 bg-[#f7f6f1] px-4 py-2.5 text-[14px] text-ink focus:bg-white focus:outline-none focus:border-black"
                  />
                </div>
              </div>
            </div>

            <div className="pt-2 flex justify-end">
              <button
                type="submit"
                className="rounded-full bg-black px-6 py-2.5 text-[13.5px] font-semibold text-white hover:bg-zinc-800 transition shadow-sm inline-flex items-center gap-2 cursor-pointer"
              >
                <Save className="size-4" />
                <span>Ayarları Kaydet</span>
              </button>
            </div>
          </form>
        </div>

        {/* Güvenlik & Şifre Değiştirme Kartı */}
        <div className="bg-white rounded-[24px] border border-black/5 p-6 sm:p-8 shadow-sm">
          <div className="flex items-center gap-3 mb-4">
            <div className="size-9 rounded-full bg-black text-white flex items-center justify-center">
              <Lock className="size-4.5" />
            </div>
            <div>
              <h3 className="font-display font-semibold text-[17px] text-[#09090b]">
                Yönetici Şifresini Değiştir
              </h3>
              <p className="text-[12.5px] text-black/50">
                Argon2id/Scrypt şifreli ve oturum rotasyon korumalı güvenli şifre güncelleme.
              </p>
            </div>
          </div>

          {passwordSaved && (
            <div className="mb-5 rounded-[16px] bg-emerald-50 border border-emerald-200 p-4 text-emerald-800 text-[14px] flex items-center gap-2">
              <CheckCircle2 className="size-5 text-emerald-600 shrink-0" />
              <span>Yönetici şifreniz güvenle güncellendi ve diğer tüm oturumlar kapatıldı!</span>
            </div>
          )}

          {passwordError && (
            <div className="mb-5 rounded-[16px] bg-red-50 border border-red-200 p-4 text-red-800 text-[13.5px] flex items-center gap-2">
              <AlertTriangle className="size-4 text-red-600 shrink-0" />
              <span>{passwordError}</span>
            </div>
          )}

          <form onSubmit={handlePasswordChange} className="space-y-4 text-[14px]">
            <div>
              <label className="block text-[13px] font-medium text-black/70 mb-1.5">
                Mevcut Yönetici Şifresi
              </label>
              <input
                type="password"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                placeholder="Mevcut şifrenizi girin"
                required
                className="w-full rounded-[14px] border border-black/15 bg-[#f7f6f1] px-4 py-2.5 text-[14px] text-ink focus:bg-white focus:outline-none focus:border-black"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-[13px] font-medium text-black/70 mb-1.5">
                  Yeni Şifre
                </label>
                <input
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="En az 8 karakter (harf + rakam)"
                  required
                  className="w-full rounded-[14px] border border-black/15 bg-[#f7f6f1] px-4 py-2.5 text-[14px] text-ink focus:bg-white focus:outline-none focus:border-black"
                />
              </div>

              <div>
                <label className="block text-[13px] font-medium text-black/70 mb-1.5">
                  Yeni Şifre (Tekrar)
                </label>
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Yeni şifreyi tekrar yazın"
                  required
                  className="w-full rounded-[14px] border border-black/15 bg-[#f7f6f1] px-4 py-2.5 text-[14px] text-ink focus:bg-white focus:outline-none focus:border-black"
                />
              </div>
            </div>

            <div className="pt-2 flex items-center justify-between">
              <span className="text-[12px] text-black/40">
                Güvenlik kuralı: En az 8 karakter, harf ve rakam kombinasyonu.
              </span>
              <button
                type="submit"
                disabled={isChangingPassword}
                className="rounded-full bg-black px-6 py-2.5 text-[13.5px] font-semibold text-white hover:bg-zinc-800 transition shadow-sm inline-flex items-center gap-2 cursor-pointer disabled:opacity-50"
              >
                {isChangingPassword ? (
                  <>
                    <Loader2 className="size-4 animate-spin" />
                    <span>Güncelleniyor...</span>
                  </>
                ) : (
                  <>
                    <ShieldCheck className="size-4" />
                    <span>Şifreyi Güncelle</span>
                  </>
                )}
              </button>
            </div>
          </form>
        </div>

        {/* Aktif Oturumlar Kartı (Session Security) */}
        <div className="bg-white rounded-[24px] border border-black/5 p-6 sm:p-8 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="size-9 rounded-full bg-black text-white flex items-center justify-center">
                <Laptop className="size-4.5" />
              </div>
              <div>
                <h3 className="font-display font-semibold text-[17px] text-[#09090b]">
                  Aktif Oturumlar
                </h3>
                <p className="text-[12.5px] text-black/50">
                  Hesabınıza bağlı aktif oturumları inceleyebilir, şüpheli oturumları sonlandırabilirsiniz.
                </p>
              </div>
            </div>
          </div>

          {loadingSessions ? (
            <div className="py-6 text-center text-[13px] text-black/40">
              Oturumlar yükleniyor...
            </div>
          ) : activeSessions.length === 0 ? (
            <div className="py-6 text-center text-[13px] text-black/40">
              Aktif oturum kaydı bulunamadı.
            </div>
          ) : (
            <div className="divide-y divide-black/5 border border-black/5 rounded-[16px] overflow-hidden">
              {activeSessions.map((ses) => (
                <div key={ses.id} className="p-4 flex items-center justify-between bg-white hover:bg-[#faf9f6] transition">
                  <div className="flex items-center gap-3">
                    <div className={`size-8 rounded-full flex items-center justify-center ${ses.isCurrent ? 'bg-emerald-100 text-emerald-800' : 'bg-black/5 text-black/60'}`}>
                      <Laptop className="size-4" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-[13.5px] font-semibold text-ink">
                          IP: {ses.ipAddress}
                        </span>
                        {ses.isCurrent && (
                          <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
                            Şu Anki Oturum
                          </span>
                        )}
                      </div>
                      <p className="text-[12px] text-black/50 mt-0.5 truncate max-w-md">
                        {ses.userAgent}
                      </p>
                    </div>
                  </div>

                  {!ses.isCurrent && (
                    <button
                      type="button"
                      onClick={() => handleRevokeSession(ses.id)}
                      className="px-3 py-1.5 rounded-full text-red-600 hover:bg-red-50 text-[12px] font-medium transition cursor-pointer flex items-center gap-1"
                    >
                      <Trash2 className="size-3" />
                      <span>Kapat</span>
                    </button>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Güvenlik & Denetim Kayıtları Kartı (Audit Logs) */}
        <div className="bg-white rounded-[24px] border border-black/5 p-6 sm:p-8 shadow-sm">
          <div className="flex items-center gap-3 mb-4">
            <div className="size-9 rounded-full bg-black text-white flex items-center justify-center">
              <Activity className="size-4.5" />
            </div>
            <div>
              <h3 className="font-display font-semibold text-[17px] text-[#09090b]">
                Güvenlik &amp; Denetim Kayıtları (Audit Log)
              </h3>
              <p className="text-[12.5px] text-black/50">
                Girişler, içerik değişiklikleri ve güvenlik olaylarının değişmez kayıtları.
              </p>
            </div>
          </div>

          {loadingLogs ? (
            <div className="py-6 text-center text-[13px] text-black/40">
              Denetim kayıtları yükleniyor...
            </div>
          ) : auditLogs.length === 0 ? (
            <div className="py-6 text-center text-[13px] text-black/40">
              Henüz bir denetim kaydı bulunmuyor.
            </div>
          ) : (
            <div className="border border-black/5 rounded-[16px] overflow-hidden max-h-96 overflow-y-auto">
              <table className="w-full text-left text-[12.5px]">
                <thead className="bg-[#f7f5f0] text-black/70 sticky top-0 border-b border-black/10">
                  <tr>
                    <th className="py-2.5 px-4 font-semibold">Tarih</th>
                    <th className="py-2.5 px-4 font-semibold">İşlem</th>
                    <th className="py-2.5 px-4 font-semibold">IP</th>
                    <th className="py-2.5 px-4 font-semibold">Durum</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-black/5 bg-white">
                  {auditLogs.map((log) => (
                    <tr key={log.id} className="hover:bg-[#faf9f6]">
                      <td className="py-2 px-4 text-black/60 whitespace-nowrap">
                        {new Date(log.createdAt).toLocaleString("tr-TR")}
                      </td>
                      <td className="py-2 px-4 font-mono font-medium text-ink">
                        {log.action}
                      </td>
                      <td className="py-2 px-4 text-black/60 font-mono">
                        {log.ipAddress || "-"}
                      </td>
                      <td className="py-2 px-4">
                        <span
                          className={`px-2 py-0.5 rounded-full text-[11px] font-semibold ${
                            log.status === "SUCCESS"
                              ? "bg-emerald-100 text-emerald-800"
                              : log.status === "BLOCKED"
                                ? "bg-amber-100 text-amber-800"
                                : "bg-red-100 text-red-800"
                          }`}
                        >
                          {log.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </AdminLayout>
  );
}
