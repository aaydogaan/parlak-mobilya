import { useState, useEffect, type FormEvent } from "react";
import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useAdminStore } from "@/lib/admin/adminStore";
import {
  ArrowRight,
  Eye,
  EyeOff,
  Check,
  Loader2,
  ShieldCheck,
  AlertCircle,
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
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [turnstileToken, setTurnstileToken] = useState<string | undefined>();
  const { login, isAuthenticated, checkSession } = useAdminStore();
  const navigate = useNavigate();

  const turnstileSiteKey =
    typeof import.meta !== "undefined" && import.meta.env?.VITE_TURNSTILE_SITE_KEY
      ? (import.meta.env.VITE_TURNSTILE_SITE_KEY as string)
      : undefined;

  useEffect(() => {
    checkSession().then((authenticated) => {
      if (authenticated) {
        navigate({ to: "/admin/dashboard" });
      }
    });
  }, [checkSession, navigate]);

  // Turnstile script loader if site key is configured
  useEffect(() => {
    if (turnstileSiteKey && typeof window !== "undefined") {
      const scriptId = "cf-turnstile-script";
      if (!document.getElementById(scriptId)) {
        const script = document.createElement("script");
        script.id = scriptId;
        script.src = "https://challenges.cloudflare.com/turnstile/v0/api.js";
        script.async = true;
        script.defer = true;
        document.head.appendChild(script);
      }

      // Turnstile callback
      (window as any).onTurnstileSuccess = (token: string) => {
        setTurnstileToken(token);
      };
    }
  }, [turnstileSiteKey]);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setErrorMsg("");
    setIsSubmitting(true);

    try {
      const result = await login(email, password, turnstileToken);
      if (result.success) {
        navigate({ to: "/admin/dashboard" });
      } else {
        setErrorMsg(result.error || "Giriş bilgileri hatalı.");
      }
    } catch {
      setErrorMsg("Giriş yapılırken bir bağlantı hatası oluştu.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="min-h-screen w-full flex flex-col md:flex-row font-['Lexend',sans-serif] bg-white">
      {/* Sol %50 Görsel Alanı */}
      <div className="w-full md:w-1/2 relative min-h-[360px] md:min-h-screen flex flex-col justify-between p-8 md:p-14 text-white overflow-hidden">
        <img
          src="/images/DSCF4488-2.webp"
          alt="Parlak Mobilya"
          className="absolute inset-0 w-full h-full object-cover object-center"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/95 via-black/60 to-black/40" />
        <div className="absolute inset-0 bg-black/30 mix-blend-multiply" />

        <div className="relative z-10">
          <Link to="/" className="inline-block group">
            <img
              src="/images/logo-header.png"
              alt="Parlak Mobilya"
              className="h-8 md:h-9 w-auto object-contain brightness-0 invert opacity-95 group-hover:opacity-100 transition"
            />
          </Link>
        </div>

        <div className="relative z-10 mt-auto pt-12 max-w-lg">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-[12px] font-medium text-white/90 mb-4">
            <ShieldCheck className="size-3.5 text-amber-400" />
            <span>Güvenli Yönetim Portalı</span>
          </div>
          <h1 className="text-[30px] sm:text-[38px] md:text-[44px] font-display font-bold leading-[1.15] tracking-tight text-white">
            Parlak Mobilya &amp; Dekorasyon
          </h1>
          <p className="mt-3 text-[14px] sm:text-[15px] text-white/80 leading-relaxed font-light">
            Konya genelinde 40 yılı aşkın üretim tecrübesiyle özel ölçü mutfak, gardırop ve yaşam alanı projeleri.
          </p>
        </div>
      </div>

      {/* Sağ %50 Form Alanı */}
      <div className="w-full md:w-1/2 flex flex-col justify-between p-6 sm:p-12 md:p-16 lg:p-20 bg-white">
        <div className="hidden md:block" />

        <div className="max-w-[420px] w-full mx-auto my-auto py-8">
          <div className="mb-8">
            <h2 className="text-[28px] sm:text-[32px] font-display font-bold text-[#09090b] tracking-tight">
              Yönetici Girişi
            </h2>
            <p className="mt-1.5 text-[14.5px] text-black/50">
              Panele erişmek için lütfen yetkili yönetici bilgilerinizi girin.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            {errorMsg && (
              <div className="rounded-[16px] bg-red-50 border border-red-200 p-4 text-[13.5px] text-red-700 flex items-start gap-2.5 animate-in fade-in duration-200">
                <AlertCircle className="size-5 text-red-600 shrink-0 mt-0.5" />
                <div className="flex-1 font-medium">{errorMsg}</div>
              </div>
            )}

            {/* E-posta Adresi */}
            <div>
              <label className="block text-[13px] font-semibold text-[#09090b] mb-1.5">
                E-posta veya Kullanıcı Adı
              </label>
              <div className="relative">
                <input
                  type="text"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="info@parlakmobilyadekorasyon.com"
                  required
                  autoComplete="username"
                  className="w-full rounded-[16px] bg-[#f7f6f1] border border-black/10 px-4 py-3.5 text-[15px] text-[#09090b] font-medium placeholder-black/30 focus:bg-white focus:border-black focus:outline-none transition"
                />
              </div>
            </div>

            {/* Yönetici Şifresi */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-[13px] font-semibold text-[#09090b]">
                  Yönetici Şifresi
                </label>
              </div>

              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    setErrorMsg("");
                  }}
                  placeholder="••••••••••••"
                  required
                  autoComplete="current-password"
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
            </div>

            {/* Turnstile Widget (if configured) */}
            {turnstileSiteKey && (
              <div
                className="cf-turnstile my-2"
                data-sitekey={turnstileSiteKey}
                data-callback="onTurnstileSuccess"
                data-theme="light"
              />
            )}

            {/* Giriş Butonu */}
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full rounded-[16px] bg-[#09090b] hover:bg-black text-white font-medium py-4 px-6 text-[15px] flex items-center justify-center gap-2 transition duration-200 shadow-md cursor-pointer disabled:opacity-50"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="size-5 animate-spin" />
                  <span>Doğrulanıyor...</span>
                </>
              ) : (
                <>
                  <span>Giriş Yap</span>
                  <ArrowRight className="size-4" />
                </>
              )}
            </button>
          </form>

          {/* Alt Güvenlik Bilgisi */}
          <div className="mt-8 pt-6 border-t border-black/5 text-center">
            <p className="text-[12.5px] text-black/40 flex items-center justify-center gap-1.5">
              <ShieldCheck className="size-4 text-emerald-600" />
              <span>TLS 1.3 ve HTTP-Only Şifreli Oturum Korumalı</span>
            </p>
          </div>
        </div>

        <div className="hidden md:block" />
      </div>
    </div>
  );
}
