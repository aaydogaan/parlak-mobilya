import { createMiddleware } from "@tanstack/react-start";
import { isProduction } from "../../db.ts";
import {
  SESSION_COOKIE_NAME,
  SESSION_MAX_AGE_SECONDS,
  verifyAdminSession,
  createAdminSession,
  revokeAdminSession,
  type AdminUserRecord,
  type AdminSessionRecord,
} from "./session";
import { logAuditEvent } from "./audit";

export class CrossSiteRequestError extends Error {
  readonly status = 403;
  constructor(message = "Forbidden: cross-site request blocked") {
    super(message);
    this.name = "CrossSiteRequestError";
  }
}

export function assertSameSiteRequest(req?: Request | null): void {
  if (!req) return;
  const h = req.headers;
  const site = h.get("sec-fetch-site");
  if (!site || site === "same-origin" || site === "none") return;
  const dest = h.get("sec-fetch-dest");
  const isTopLevelGet =
    h.get("sec-fetch-mode") === "navigate" &&
    req.method === "GET" &&
    dest !== "object" &&
    dest !== "embed";
  if (isTopLevelGet) return;
  throw new CrossSiteRequestError();
}

export class AdminUnauthorizedError extends Error {
  readonly status = 401;
  constructor(message = "Yetkisiz Erişim: Lütfen yönetici girişi yapın.") {
    super(message);
    this.name = "AdminUnauthorizedError";
  }
}

export class AdminForbiddenError extends Error {
  readonly status = 403;
  constructor(message = "Erişim Reddedildi: Bu işlem için yönetici yetkisi gereklidir.") {
    super(message);
    this.name = "AdminForbiddenError";
  }
}

const ALLOWED_ORIGINS = new Set([
  "https://parlakmobilyadekorasyon.com",
  "https://www.parlakmobilyadekorasyon.com",
  "https://admin.parlakmobilyadekorasyon.com",
  "http://localhost:8080",
  "http://127.0.0.1:8080",
  "http://localhost:3000",
  "http://127.0.0.1:3000",
]);

/**
 * Strict CSRF and Origin validator for all state-changing admin requests.
 */
export function validateCsrfOrigin(req?: Request | null): void {
  // 1. Fetch metadata check
  assertSameSiteRequest(req);

  if (!req) return;
  const origin = req.headers.get("origin");
  if (!origin) return; // Non-browser / curl or same-origin direct request without origin

  const originClean = origin.trim().toLowerCase();
  if (!ALLOWED_ORIGINS.has(originClean)) {
    // If running under a dynamic Coolify / preview domain, check hostname
    const url = new URL(originClean);
    const hostname = url.hostname;
    const isLocal = hostname === "localhost" || hostname === "127.0.0.1";
    const isDomain = hostname.endsWith("parlakmobilyadekorasyon.com");

    if (!isLocal && !isDomain) {
      console.warn("[security CSRF] Blocked request from disallowed origin:", originClean);
      throw new CrossSiteRequestError();
    }
  }
}

/**
 * Extracts and verifies the current admin session from incoming cookies.
 * Default behavior: DENY. Returns null if unauthenticated.
 */
export async function getAuthenticatedAdmin(
  req?: Request | null,
): Promise<{ user: AdminUserRecord; session: AdminSessionRecord } | null> {
  const { getCookie } = await import("@tanstack/react-start/server");
  const token =
    getCookie("__Host-admin_session") ||
    getCookie("admin_session") ||
    (req ? req.headers.get("cookie")?.match(/(?:^|;\s*)(?:__Host-admin_session|admin_session)=([^;]+)/)?.[1] : null);

  if (!token) {
    return null;
  }

  const result = await verifyAdminSession(token);
  return result;
}

/**
 * Require valid admin authentication or throw AdminUnauthorizedError.
 */
export async function requireAdmin(
  req?: Request | null,
): Promise<{ user: AdminUserRecord; session: AdminSessionRecord }> {
  const auth = await getAuthenticatedAdmin(req);
  if (!auth) {
    throw new AdminUnauthorizedError();
  }
  return auth;
}

/**
 * Sets the hardened HTTP-only admin session cookie.
 */
export async function setAdminSessionCookie(rawToken: string): Promise<void> {
  const { setCookie } = await import("@tanstack/react-start/server");
  // Use __Host- prefix in production HTTPS
  setCookie(SESSION_COOKIE_NAME, rawToken, {
    httpOnly: true,
    secure: isProduction,
    sameSite: "strict",
    path: "/",
    maxAge: SESSION_MAX_AGE_SECONDS,
  });

  // If in dev and not __Host-, ensure standard cookie is set
  if (!isProduction && SESSION_COOKIE_NAME !== "admin_session") {
    setCookie("admin_session", rawToken, {
      httpOnly: true,
      secure: false,
      sameSite: "strict",
      path: "/",
      maxAge: SESSION_MAX_AGE_SECONDS,
    });
  }
}

/**
 * Clear the admin session cookie on logout or invalidation.
 */
export async function clearAdminSessionCookie(): Promise<void> {
  const { deleteCookie } = await import("@tanstack/react-start/server");
  deleteCookie(SESSION_COOKIE_NAME, {
    path: "/",
  });
  deleteCookie("__Host-admin_session", {
    path: "/",
  });
  deleteCookie("admin_session", {
    path: "/",
  });
}

/**
 * Enterprise Admin Authentication & Authorization Middleware for TanStack Start server functions.
 * Protects every administrative mutation, upload, deletion, and query.
 *
 * Flow:
 * Request -> CSRF & Origin Validation -> Session Verification -> Role Check -> Pass Context
 * Default: DENY
 */
export const adminAuthMiddleware = createMiddleware({ type: "function" })
  .server(async ({ next }) => {
    const { getRequest } = await import("@tanstack/react-start/server");
    const req = getRequest();

    // 1. Strict CSRF & Fetch-Metadata verification
    validateCsrfOrigin(req);

    // 2. Cryptographic session resolution (Server/DB only)
    const auth = await getAuthenticatedAdmin(req);
    if (!auth) {
      await logAuditEvent({
        action: "UNAUTHORIZED_ACCESS_ATTEMPT",
        status: "BLOCKED",
        req,
      });
      throw new AdminUnauthorizedError("Yetkisiz işlem: Oturumunuz geçersiz veya süresi dolmuş.");
    }

    // 3. Authorization Role Check (Default DENY)
    if (auth.user.role !== "admin") {
      await logAuditEvent({
        userId: auth.user.id,
        action: "UNAUTHORIZED_ACCESS_ATTEMPT",
        status: "BLOCKED",
        details: { reason: "Non-admin role", role: auth.user.role },
        req,
      });
      throw new AdminForbiddenError("Bu işlem için yönetici yetkisi bulunmuyor.");
    }

    // 4. Pass verified admin user and session ID to handler context
    return next({
      context: {
        adminUser: auth.user,
        adminSession: auth.session,
      },
    });
  });
