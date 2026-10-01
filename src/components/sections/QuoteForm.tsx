import { useState, type FormEvent } from "react";
import { GoldButton } from "@/components/ui/GoldButton";
import { services, site } from "@/data/site";
import { cn } from "@/lib/utils";
import { submitTalepServerFn } from "@/lib/server/talepler";

type Props = {
  className?: string;
  compact?: boolean;
  defaultService?: string;
};

export function QuoteForm({ className, compact, defaultService }: Props) {
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setErrorMessage(null);
    setLoading(true);

    const fd = new FormData(e.currentTarget);
    const name = (fd.get("name") as string)?.trim();
    const phone = (fd.get("phone") as string)?.trim();
    const email = (fd.get("email") as string)?.trim();
    const serviceSlug = fd.get("service") as string;

    const matchedService = services.find((s) => s.slug === serviceSlug);

    try {
      await submitTalepServerFn({
        data: {
          name: name || "Müşteri",
          phone: phone || "05XX XXX XX XX",
          email: email || undefined,
          district: "Konya / Merkez",
          category: matchedService?.title || "Özel Mobilya Talebi",
          message: `${name || "Müşteri"} web sitesi üzerinden ${matchedService?.title || "özel mobilya"} için keşif ve teklif talebinde bulundu.`,
        },
      });
      setSent(true);
    } catch (err: any) {
      console.error("Talep gönderim hatası:", err);
      setErrorMessage(err?.message || "Talep gönderilirken bir hata oluştu. Lütfen tekrar deneyiniz.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className={cn("rounded-[24px] bg-brown p-6 text-white md:p-8", className)}>
      <h3
        className={cn(
          "font-display font-medium tracking-[-0.04em]",
          compact ? "text-[26px] leading-tight" : "text-[28px] leading-tight md:text-[32px]",
        )}
      >
        Ücretsiz Keşif & Fiyat Teklifi Alın
      </h3>
      {!compact ? (
        <p className="mt-3 text-[14.5px] leading-relaxed text-white/70">
          Konya ve çevresinde hayalinizdeki mobilya projesini anlatın; Ahmet Usta ve uzman ekibimiz
          ölçülerinize özel en doğru çözümü ve şeffaf fiyat teklifini hazırlasın.
        </p>
      ) : null}

      {sent ? (
        <div className="mt-6 rounded-2xl bg-white/10 p-5 text-white/95">
          <p className="font-medium text-[16px] text-white">Talebiniz Alındı!</p>
          <p className="mt-2 text-[14.5px] leading-relaxed text-white/80">
            En kısa sürede sizinle iletişime geçeceğiz. Dilerseniz hemen WhatsApp üzerinden projenizin
            fotoğraf veya ölçülerini bize iletebilirsiniz.
          </p>
          <a
            href={site.whatsapp}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-4 inline-flex items-center gap-2 rounded-full bg-[#25D366] px-5 py-2.5 text-[14px] font-medium text-white transition hover:brightness-110"
          >
            <span>WhatsApp ile Hemen Yazın</span>
            <span>→</span>
          </a>
        </div>
      ) : (
        <form onSubmit={onSubmit} className="mt-7 space-y-4">
          <Field label="Adınız Soyadınız">
            <input
              required
              name="name"
              placeholder="Örn: Mehmet Yılmaz"
              className="field"
              autoComplete="name"
            />
          </Field>
          <Field label="Telefon Numaranız">
            <input
              required
              type="tel"
              name="phone"
              placeholder="05XX XXX XX XX"
              className="field"
              autoComplete="tel"
            />
          </Field>
          <Field label="İlgilendiğiniz Hizmet / Proje">
            <select
              required
              name="service"
              className="field"
              defaultValue={defaultService ?? ""}
            >
              <option value="" disabled>
                Lütfen bir hizmet seçiniz
              </option>
              {services.map((s) => (
                <option key={s.slug} value={s.slug}>
                  {s.title}
                </option>
              ))}
            </select>
          </Field>
          <Field label="E-posta Adresiniz (Opsiyonel)">
            <input
              type="email"
              name="email"
              placeholder="ornek@mail.com"
              className="field"
              autoComplete="email"
            />
          </Field>
          {errorMessage ? (
            <div className="rounded-xl bg-red-500/20 border border-red-500/40 p-3 text-red-100 text-[13.5px]">
              {errorMessage}
            </div>
          ) : null}
          <button
            type="submit"
            disabled={loading}
            className="mt-2 w-full justify-center inline-flex items-center gap-2 rounded-full bg-white px-6 py-3.5 text-[15px] font-medium text-ink hover:bg-white/90 disabled:opacity-50 transition shadow-sm cursor-pointer"
          >
            {loading ? (
              <>
                <span className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-ink border-t-transparent" />
                <span>Gönderiliyor...</span>
              </>
            ) : (
              <span>Ücretsiz Teklif Talebini Gönder</span>
            )}
          </button>
        </form>
      )}
      <style>{`
        .field {
          width: 100%;
          border-radius: 12px;
          border: 1px solid rgba(255,255,255,0.16);
          background: transparent;
          color: #fff;
          padding: 13px 16px;
          font-size: 14.5px;
          outline: none;
        }
        .field::placeholder { color: rgba(255,255,255,0.45); }
        .field:focus { border-color: rgba(255,255,255,0.6); }
        .field option { color: #0d0100; }
      `}</style>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="mb-2 block text-[13.5px] text-white/90">{label}</span>
      {children}
    </label>
  );
}
