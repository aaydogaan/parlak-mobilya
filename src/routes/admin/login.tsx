import { useState, type FormEvent } from "react";
import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useAdminStore } from "@/lib/admin/adminStore";
import {
  ArrowRight,
  Eye,
  EyeOff,
  Check,
} from "lucide-react";

export const Route = createFileRoute("/admin/login")({
  component: AdminLoginPage,
  head: () => ({
    meta: [
      { title: "Yönetici Girişi - Parlak Mobilya Admin" },
      { name: "robots", content: "noindex, nofollow" },
    ],
  }),
});

export function AdminLoginPage() {
  const [username, setUsername] = useState("ahmetusta");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState(false);
  const { login } = useAdminStore();
  const navigate = useNavigate();

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    const success = login(password);
    if (success) {
      navigate({ to: "/admin/talepler" });
    } else {
      setError(true);
    }
  }

  return (
    <div className="min-h-screen w-full flex flex-col md:flex-row font-['Lexend',sans-serif] bg-white">
      {/* Sol %50 Görsel Alanı (Tam Ekran Boydan Boya) */}
      <div className="w-full md:w-1/2 relative min-h-[360px] md:min-h-screen flex flex-col justify-between p-8 md:p-14 text-white overflow-hidden">
        {/* Arka Plan Görseli */}
        <img
          src="/images/DSCF4488-2.webp"
          alt="Parlak Mobilya"
          className="absolute inset-0 w-full h-full object-cover object-center"
        />
        {/* Karartma & Degrade Katmanları */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/95 via-black/60 to-black/40" />
        <div className="absolute inset-0 bg-black/30 mix-blend-multiply" />

        {/* Sol Üst: Sadece Logo */}
        <div className="relative z-10">
          <Link to="/" className="inline-block group">
            <img
              src="/images/logo-header.png"
              alt="Parlak Mobilya"
              className="h-8 md:h-9 w-auto object-contain brightness-0 invert opacity-95 group-hover:opacity-100 transition"
            />
          </Link>
        </div>

        {/* Sol Alt: Başlık ve Açıklama Metni */}
        <div className="relative z-10 mt-auto pt-12 max-w-lg">
          <h1 className="text-[30px] sm:text-[38px] md:text-[44px] font-display font-bold leading-[1.15] tracking-tight text-white">
            Parlak Mobilya & Dekorasyon
          </h1>
          <p className="mt-3 text-[14px] sm:text-[15px] text-white/80 leading-relaxed font-light">
            Konya genelinde 40 yılı aşkın üretim tecrübesiyle özel ölçü mutfak, gardırop ve yaşam alanı projeleri.
          </p>
        </div>
      </div>

      {/* Sağ %50 Form Alanı (Tam Ekran) */}
      <div className="w-full md:w-1/2 flex flex-col justify-between p-6 sm:p-12 md:p-16 lg:p-20 bg-white">
        {/* Üst Boşluk Dengeleyici */}
        <div className="hidden md:block" />

        {/* Form Kartı / İçeriği */}
        <div className="max-w-[420px] w-full mx-auto my-auto py-8">
          <div className="mb-8">
            <h2 className="text-[28px] sm:text-[32px] font-display font-bold text-[#09090b] tracking-tight">
              Yönetici Girişi
            </h2>
            <p className="mt-1.5 text-[14.5px] text-black/50">
              Panele erişmek için lütfen yönetici bilgilerinizi girin.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Kullanıcı Adı */}
            <div>
              <label className="block text-[13px] font-semibold text-[#09090b] mb-1.5">
                Kullanıcı Adı
              </label>
              <div className="relative">
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="Kullanıcı adı"
                  className="w-full rounded-[16px] bg-[#f7f6f1] border border-black/10 px-4 py-3.5 text-[15px] text-[#09090b] font-medium placeholder-black/30 focus:bg-white focus:border-black focus:outline-none transition"
                />
                <div className="absolute right-3.5 top-1/2 -translate-y-1/2 size-6 rounded-full bg-zinc-100 text-black flex items-center justify-center">
                  <Check className="size-3.5" />
                </div>
              </div>
            </div>

            {/* Yönetici Şifresi */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-[13px] font-semibold text-[#09090b]">
                  Yönetici Şifresi
                </label>
                <button
                  type="button"
                  onClick={() => {
                    setPassword("parlak1984");
                    setError(false);
                  }}
                  className="text-[12px] text-black/60 font-semibold hover:underline cursor-pointer"
                >
                  Şifreyi Doldur
                </button>
              </div>

              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    setError(false);
                  }}
                  placeholder="••••••••••••"
                  autoFocus
                  required
                  className="w-full rounded-[16px] bg-[#f7f6f1] border border-black/10 px-4 py-3.5 pr-11 text-[15px] text-[#09090b] placeholder-black/30 focus:bg-white focus:border-black focus:outline-none transition"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 p-1 text-black/40 hover:text-black transition cursor-pointer"
                  title={showPassword ? "Şifreyi Gizle" : "Şifreyi Göster"}
                >
                  {showPassword ? <EyeOff className="size-5" /> : <Eye className="size-5" />}
                </button>
              </div>

              {error ? (
                <p className="mt-2 text-[12.5px] text-red-600 font-medium">
                  Hatalı şifre! (Varsayılan şifre: <code className="bg-red-50 px-1.5 py-0.5 rounded text-red-700 font-mono font-bold">parlak1984</code>)
                </p>
              ) : (
                <p className="mt-1.5 text-[12px] text-black/40">
                  Varsayılan şifre: <code className="font-mono text-black/60 font-semibold">parlak1984</code>
                </p>
              )}
            </div>

            {/* Ultra Modern Giriş Yap Butonu (Monochrome Black & White) */}
            <div className="pt-3">
              <button
                type="submit"
                className="group relative w-full overflow-hidden rounded-[20px] bg-black p-[1px] shadow-[0_10px_30px_rgba(0,0,0,0.25)] hover:shadow-[0_14px_40px_rgba(0,0,0,0.35)] hover:scale-[1.01] active:scale-[0.99] transition-all duration-300 cursor-pointer"
              >
                <div className="relative flex items-center justify-center gap-3 rounded-[19px] bg-black px-6 py-4 transition-colors group-hover:bg-[#18181b]">
                  <span className="text-[15.5px] font-semibold tracking-wide text-white transition-colors">
                    Panele Giriş Yap
                  </span>
                  <div className="size-7 rounded-full bg-white text-black flex items-center justify-center group-hover:bg-white group-hover:text-black transition-all duration-300 shadow-sm">
                    <ArrowRight className="size-4 group-hover:translate-x-0.5 transition-transform duration-300" />
                  </div>
                </div>
              </button>
            </div>
          </form>

          {/* Siteden Çıkış / Ana Sayfa Bağlantısı */}
          <div className="mt-8 pt-6 border-t border-black/5 text-center">
            <Link
              to="/"
              className="text-black text-[13.5px] font-medium hover:underline inline-flex items-center gap-1.5"
            >
              <span>← Sitenin Ana Sayfasına Dön</span>
            </Link>
          </div>
        </div>

        {/* Alt Telif / Sade Bilgi */}
        <div className="text-center text-[12px] text-black/40 pt-4">
          Parlak Mobilya ve Dekorasyon © {new Date().getFullYear()}
        </div>
      </div>
    </div>
  );
}
