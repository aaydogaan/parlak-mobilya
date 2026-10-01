import { useState } from "react";
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
} from "lucide-react";

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
  const { settings, updateSettings, updatePassword, adminPassword } = useAdminStore();
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
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [passwordError, setPasswordError] = useState("");

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

  function handlePasswordChange(e: React.FormEvent) {
    e.preventDefault();
    setPasswordError("");

    if (newPassword.length < 6) {
      setPasswordError("Şifre en az 6 karakter olmalıdır.");
      return;
    }

    if (newPassword !== confirmPassword) {
      setPasswordError("Şifreler birbiriyle eşleşmiyor!");
      return;
    }

    updatePassword(newPassword);
    setPasswordSaved(true);
    setNewPassword("");
    setConfirmPassword("");
    setTimeout(() => setPasswordSaved(false), 3000);
  }

  return (
    <AdminLayout
      title="Site & İletişim Ayarları"
      subtitle="Web sitenizdeki iletişim bilgilerini, çalışma saatlerini ve atölye adresini güncelleyin."
    >
      <div className="space-y-8 max-w-3xl">
        <div className="bg-white rounded-[24px] border border-black/5 p-6 sm:p-8 shadow-sm">
          {saved && (
            <div className="mb-6 rounded-[16px] bg-emerald-50 border border-emerald-200 p-4 text-emerald-800 text-[14px] flex items-center gap-2">
              <CheckCircle2 className="size-5 text-emerald-600 shrink-0" />
              <span>Ayarlar başarıyla kaydedildi ve güncellendi!</span>
            </div>
          )}

          <form onSubmit={handleSave} className="space-y-6 text-[14px]">
            {/* İletişim Bilgileri */}
            <div>
              <span className="text-[12px] font-semibold text-black/40 uppercase tracking-wider block mb-4 font-mono">
                İLETİŞİM BİLGİLERİ
              </span>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[13px] font-medium text-black/70 mb-1.5 flex items-center gap-1.5">
                    <Phone className="size-3.5 text-black/40" />
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
                    <Mail className="size-3.5 text-black/40" />
                    <span>E-Posta Adresi</span>
                  </label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full rounded-[14px] border border-black/15 bg-[#f7f6f1] px-4 py-2.5 text-[14px] text-ink focus:bg-white focus:outline-none focus:border-black"
                  />
                </div>
              </div>

              <div className="mt-4">
                <label className="block text-[13px] font-medium text-black/70 mb-1.5">
                  WhatsApp İletişim Bağlantısı
                </label>
                <input
                  type="text"
                  value={whatsapp}
                  onChange={(e) => setWhatsapp(e.target.value)}
                  className="w-full rounded-[14px] border border-black/15 bg-[#f7f6f1] px-4 py-2.5 text-[14px] text-ink focus:bg-white focus:outline-none focus:border-black"
                />
              </div>
            </div>

            {/* Adres & Çalışma Saatleri */}
            <div className="pt-4 border-t border-black/5">
              <span className="text-[12px] font-semibold text-black/40 uppercase tracking-wider block mb-4 font-mono">
                ADRES VE ÇALIŞMA SAATLERİ
              </span>

              <div className="space-y-4">
                <div>
                  <label className="block text-[13px] font-medium text-black/70 mb-1.5 flex items-center gap-1.5">
                    <MapPin className="size-3.5 text-black/40" />
                    <span>Atölye Adresi (Satır 1)</span>
                  </label>
                  <input
                    type="text"
                    value={address1}
                    onChange={(e) => setAddress1(e.target.value)}
                    className="w-full rounded-[14px] border border-black/15 bg-[#f7f6f1] px-4 py-2.5 text-[14px] text-ink focus:bg-white focus:outline-none focus:border-black"
                  />
                </div>

                <div>
                  <label className="block text-[13px] font-medium text-black/70 mb-1.5">
                    İlçe / Şehir (Satır 2)
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
                    <Clock className="size-3.5 text-black/40" />
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

            {/* Submit */}
            <div className="pt-6 border-t border-black/10 flex items-center justify-end">
              <button
                type="submit"
                className="rounded-full bg-black px-7 py-3 text-[14.5px] font-semibold text-white hover:bg-zinc-800 transition shadow-sm inline-flex items-center gap-2 cursor-pointer"
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
                Admin paneline giriş yaparken kullandığınız şifreyi buradan güncelleyebilirsiniz.
              </p>
            </div>
          </div>

          {passwordSaved && (
            <div className="mb-5 rounded-[16px] bg-emerald-50 border border-emerald-200 p-4 text-emerald-800 text-[14px] flex items-center gap-2">
              <CheckCircle2 className="size-5 text-emerald-600 shrink-0" />
              <span>Yönetici şifreniz başarıyla güncellendi!</span>
            </div>
          )}

          {passwordError && (
            <div className="mb-5 rounded-[16px] bg-red-50 border border-red-200 p-4 text-red-800 text-[13.5px]">
              {passwordError}
            </div>
          )}

          <form onSubmit={handlePasswordChange} className="space-y-4 text-[14px]">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-[13px] font-medium text-black/70 mb-1.5">
                  Yeni Şifre
                </label>
                <input
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="En az 6 karakter"
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
                  placeholder="Şifreyi tekrar yazın"
                  required
                  className="w-full rounded-[14px] border border-black/15 bg-[#f7f6f1] px-4 py-2.5 text-[14px] text-ink focus:bg-white focus:outline-none focus:border-black"
                />
              </div>
            </div>

            <div className="pt-2 flex items-center justify-between">
              <span className="text-[12px] text-black/40">
                Mevcut şifre: <code className="font-mono">{adminPassword || "parlak1984"}</code>
              </span>
              <button
                type="submit"
                className="rounded-full bg-black px-6 py-2.5 text-[13.5px] font-semibold text-white hover:bg-zinc-800 transition shadow-sm inline-flex items-center gap-2 cursor-pointer"
              >
                <ShieldCheck className="size-4" />
                <span>Şifreyi Güncelle</span>
              </button>
            </div>
          </form>
        </div>
      </div>
    </AdminLayout>
  );
}
