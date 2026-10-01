import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { getSql } from "@/lib/db";
import {
  hashPassword,
  verifyPassword,
  validatePasswordStrength,
} from "./security/password";
import {
  createAdminSession,
  revokeAdminSession,
  revokeAllUserSessionsExcept,
  getActiveSessions,
  ensureAdminProvisioned,
  type ActiveSessionView,
} from "./security/session";
import {
  adminAuthMiddleware,
  getAuthenticatedAdmin,
  setAdminSessionCookie,
  clearAdminSessionCookie,
} from "./security/auth";
import {
  checkRateLimit,
  recordFailedAttempt,
  resetRateLimit,
  getClientIp,
} from "./security/rate-limiter";
import { logAuditEvent, getRecentAuditLogs, type AuditLogEntry } from "./security/audit";
import { verifyTurnstileToken } from "./security/turnstile";

const LoginSchema = z.object({
  email: z.string().trim().min(3).max(100),
  password: z.string().min(1).max(128),
  turnstileToken: z.string().optional(),
});

const ChangePasswordSchema = z.object({
  currentPassword: z.string().min(1).max(128),
  newPassword: z.string().min(8).max(128),
});

/**
 * Public Admin Login Endpoint (Hardened with rate limiting, Turnstile, and scrypt verification)
 */
export const adminLoginServerFn = createServerFn({ method: "POST" })
  .validator((d: unknown) => LoginSchema.parse(d))
  .handler(async ({ data }): Promise<{
    success: boolean;
    error?: string;
    user?: { id: string; email: string; name: string; role: string };
  }> => {
    const { getRequest } = await import("@tanstack/react-start/server");
    const req = getRequest();
    const ip = getClientIp(req);
    const userAgent = req?.headers.get("user-agent") || undefined;
    const cleanEmail = data.email.toLowerCase().trim();

    // 1. Rate Limiting Check (Brute Force Protection)
    const ipLimit = checkRateLimit(`login:ip:${ip}`, 5, 15 * 60 * 1000);
    const userLimit = checkRateLimit(`login:user:${cleanEmail}`, 5, 15 * 60 * 1000);

    if (!ipLimit.allowed || !userLimit.allowed) {
      const waitSec = Math.max(ipLimit.retryAfterSec, userLimit.retryAfterSec);
      await logAuditEvent({
        action: "RATE_LIMIT_EXCEEDED",
        status: "BLOCKED",
        details: { email: cleanEmail, waitSec },
        req,
      });
      return {
        success: false,
        error: `Çok fazla başarısız deneme yapıldı. Güvenliğiniz için lütfen ${Math.ceil(waitSec / 60)} dakika sonra tekrar deneyin.`,
      };
    }

    // 2. Cloudflare Turnstile Verification
    const turnstileResult = await verifyTurnstileToken(data.turnstileToken, ip);
    if (!turnstileResult.success) {
      return {
        success: false,
        error: turnstileResult.error || "Güvenlik robot doğrulamasını tamamlayın.",
      };
    }

    // 3. Ensure DB admin table exists
    await ensureAdminProvisioned();

    try {
      const sql = await getSql();

      // Look up user by email or username
      const rows = await sql<{
        id: string;
        username: string;
        email: string;
        password_hash: string;
        name: string;
        role: string;
      }>`
        SELECT * FROM admin_users 
        WHERE LOWER(email) = ${cleanEmail} OR LOWER(username) = ${cleanEmail}
        LIMIT 1
      `;

      if (!rows || rows.length === 0) {
        // Prevent username enumeration by simulating constant-time hash verification
        await verifyPassword(
          data.password,
          "scrypt:16384:8:1:a5d89f81a17c:9f976a47a192bf88147d33267d3ec57b9891823e59ba3d7890bc744161a07357",
        );
        recordFailedAttempt(`login:ip:${ip}`);
        recordFailedAttempt(`login:user:${cleanEmail}`);

        await logAuditEvent({
          action: "LOGIN_FAILED",
          status: "FAILED",
          details: { attemptUser: cleanEmail, reason: "User not found" },
          req,
        });

        // Generic error message (No user enumeration)
        return { success: false, error: "Giriş bilgileri hatalı." };
      }

      const user = rows[0];

      // 4. Verify Password
      const isPasswordValid = await verifyPassword(data.password, user.password_hash);
      if (!isPasswordValid) {
        recordFailedAttempt(`login:ip:${ip}`);
        recordFailedAttempt(`login:user:${cleanEmail}`);

        await logAuditEvent({
          userId: user.id,
          action: "LOGIN_FAILED",
          status: "FAILED",
          details: { reason: "Invalid password" },
          req,
        });

        return { success: false, error: "Giriş bilgileri hatalı." };
      }

      // 5. Successful Login -> Reset Rate Limits & Create Opaque Session
      resetRateLimit(`login:ip:${ip}`);
      resetRateLimit(`login:user:${cleanEmail}`);

      const { rawToken } = await createAdminSession(user.id, ip, userAgent);
      await setAdminSessionCookie(rawToken);

      await logAuditEvent({
        userId: user.id,
        action: "LOGIN_SUCCESS",
        status: "SUCCESS",
        req,
      });

      return {
        success: true,
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role,
        },
      };
    } catch (err) {
      console.error("[security] Login processing error:", err);
      return { success: false, error: "Giriş yapılırken bir sunucu hatası oluştu. Lütfen tekrar deneyin." };
    }
  });

/**
 * Logout Endpoint (Invalidates session in DB and destroys cookie)
 */
export const adminLogoutServerFn = createServerFn({ method: "POST" }).handler(
  async (): Promise<{ success: boolean }> => {
    const { getRequest } = await import("@tanstack/react-start/server");
    const req = getRequest();
    const auth = await getAuthenticatedAdmin(req);

    if (auth) {
      await revokeAdminSession(auth.session.id);
      await logAuditEvent({
        userId: auth.user.id,
        action: "LOGOUT",
        status: "SUCCESS",
        req,
      });
    }

    await clearAdminSessionCookie();
    return { success: true };
  },
);

/**
 * Get Current Admin Session Status & Active Sessions list
 */
export const getAdminSessionServerFn = createServerFn({ method: "GET" }).handler(
  async (): Promise<{
    authenticated: boolean;
    user: { id: string; email: string; name: string; role: string } | null;
    activeSessions: ActiveSessionView[];
  }> => {
    const { getRequest } = await import("@tanstack/react-start/server");
    const req = getRequest();
    const auth = await getAuthenticatedAdmin(req);

    if (!auth) {
      return { authenticated: false, user: null, activeSessions: [] };
    }

    const activeSessions = await getActiveSessions(auth.user.id, auth.session.id);

    return {
      authenticated: true,
      user: {
        id: auth.user.id,
        email: auth.user.email,
        name: auth.user.name,
        role: auth.user.role,
      },
      activeSessions,
    };
  },
);

/**
 * Change Admin Password Endpoint (Requires admin auth + current password verification)
 */
export const changeAdminPasswordServerFn = createServerFn({ method: "POST" })
  .middleware([adminAuthMiddleware])
  .validator((d: unknown) => ChangePasswordSchema.parse(d))
  .handler(async ({ data, context }): Promise<{ success: boolean; message: string }> => {
    const { adminUser, adminSession } = context;
    const { getRequest } = await import("@tanstack/react-start/server");
    const req = getRequest();

    const sql = await getSql();
    const rows = await sql<{ password_hash: string }>`
      SELECT password_hash FROM admin_users WHERE id = ${adminUser.id} LIMIT 1
    `;

    if (!rows || rows.length === 0) {
      throw new Error("Kullanıcı kaydı bulunamadı.");
    }

    // 1. Verify current password
    const isCurrentValid = await verifyPassword(data.currentPassword, rows[0].password_hash);
    if (!isCurrentValid) {
      await logAuditEvent({
        userId: adminUser.id,
        action: "PASSWORD_CHANGED",
        status: "FAILED",
        details: { reason: "Current password incorrect" },
        req,
      });
      throw new Error("Mevcut şifreniz hatalı.");
    }

    // 2. Validate new password strength
    const strengthCheck = validatePasswordStrength(data.newPassword);
    if (!strengthCheck.valid) {
      throw new Error(strengthCheck.message || "Yeni şifre yeterince güçlü değil.");
    }

    // 3. Hash new password and update in DB
    const newHash = await hashPassword(data.newPassword);
    await sql`
      UPDATE admin_users 
      SET password_hash = ${newHash}, updated_at = now() 
      WHERE id = ${adminUser.id}
    `;

    // 4. Revoke all other active sessions (Security standard)
    await revokeAllUserSessionsExcept(adminUser.id, adminSession.id);

    await logAuditEvent({
      userId: adminUser.id,
      action: "PASSWORD_CHANGED",
      status: "SUCCESS",
      details: { note: "All other active sessions revoked" },
      req,
    });

    return { success: true, message: "Şifreniz başarıyla güncellendi ve diğer tüm oturumlar kapatıldı." };
  });

/**
 * Revoke specific session by session ID
 */
export const revokeAdminSessionServerFn = createServerFn({ method: "POST" })
  .middleware([adminAuthMiddleware])
  .validator((d: { sessionId: string }) => d)
  .handler(async ({ data, context }): Promise<{ success: boolean; activeSessions: ActiveSessionView[] }> => {
    const { adminUser, adminSession } = context;
    const { getRequest } = await import("@tanstack/react-start/server");
    const req = getRequest();

    await revokeAdminSession(data.sessionId);

    await logAuditEvent({
      userId: adminUser.id,
      action: "SESSION_REVOKED",
      status: "SUCCESS",
      entityId: data.sessionId,
      req,
    });

    const activeSessions = await getActiveSessions(adminUser.id, adminSession.id);
    return { success: true, activeSessions };
  });

const AuditLogsSchema = z.object({
  limit: z.number().min(1).max(200).optional(),
}).optional();

/**
 * Fetch immutable security audit logs for the admin panel
 */
export const getAdminAuditLogsServerFn = createServerFn({ method: "GET" })
  .middleware([adminAuthMiddleware])
  .validator((d: unknown) => AuditLogsSchema.parse(d))
  .handler(async ({ data }): Promise<{ logs: AuditLogEntry[] }> => {
    const limit = data?.limit ?? 50;
    const logs = await getRecentAuditLogs(limit);
    return { logs };
  });
