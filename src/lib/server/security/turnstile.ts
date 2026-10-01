import { isProduction } from "../../db";

interface TurnstileVerifyResponse {
  success: boolean;
  "error-codes"?: string[];
  challenge_ts?: string;
  hostname?: string;
}

/**
 * Verify Cloudflare Turnstile token server-side via Cloudflare's siteverify API.
 */
export async function verifyTurnstileToken(
  token: string | undefined | null,
  remoteIp?: string,
): Promise<{ success: boolean; error?: string }> {
  const secretKey = process.env.TURNSTILE_SECRET_KEY?.trim();

  // If Turnstile secret key is not configured:
  // In development, allow bypass with warning.
  // In production, if explicitly required, reject.
  if (!secretKey) {
    if (isProduction && process.env.REQUIRE_TURNSTILE === "true") {
      return { success: false, error: "Turnstile secret key is not configured on production server." };
    }
    return { success: true };
  }

  if (!token) {
    return { success: false, error: "Güvenlik doğrulaması (Turnstile) gereklidir." };
  }

  try {
    const formData = new URLSearchParams();
    formData.append("secret", secretKey);
    formData.append("response", token);
    if (remoteIp) {
      formData.append("remoteip", remoteIp);
    }

    const res = await fetch("https://challenges.cloudflare.com/turnstile/v0/siteverify", {
      method: "POST",
      body: formData,
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
    });

    if (!res.ok) {
      return { success: false, error: "Turnstile doğrulama servisine ulaşılamadı." };
    }

    const data = (await res.json()) as TurnstileVerifyResponse;
    if (data.success) {
      return { success: true };
    }

    return {
      success: false,
      error: `Güvenlik doğrulaması başarısız oldu (${data["error-codes"]?.join(", ") || "invalid token"}).`,
    };
  } catch (err) {
    console.error("[turnstile] Verification request error:", err);
    return { success: false, error: "Güvenlik doğrulaması sırasında bir hata oluştu." };
  }
}
