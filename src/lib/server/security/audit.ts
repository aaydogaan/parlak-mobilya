import { getSql } from "../../db";
import { getClientIp } from "./rate-limiter";

export type AuditAction =
  | "LOGIN_SUCCESS"
  | "LOGIN_FAILED"
  | "LOGOUT"
  | "PASSWORD_CHANGED"
  | "SESSION_REVOKED"
  | "ARTICLE_CREATED"
  | "ARTICLE_UPDATED"
  | "ARTICLE_DELETED"
  | "ARTICLE_STATUS_CHANGED"
  | "GALLERY_IMAGE_UPLOADED"
  | "GALLERY_IMAGE_DELETED"
  | "GALLERY_IMAGES_BULK_DELETED"
  | "SETTINGS_UPDATED"
  | "TALEP_STATUS_UPDATED"
  | "TALEP_DELETED"
  | "RATE_LIMIT_EXCEEDED"
  | "CSRF_BLOCKED"
  | "UNAUTHORIZED_ACCESS_ATTEMPT";

export interface AuditLogEntry {
  id: number;
  userId: string | null;
  action: AuditAction;
  entityType?: string;
  entityId?: string;
  ipAddress?: string;
  userAgent?: string;
  details?: Record<string, any>;
  status: "SUCCESS" | "FAILED" | "BLOCKED";
  createdAt: string;
}

const REDACT_KEYS = new Set([
  "password",
  "newpassword",
  "currentpassword",
  "confirmpassword",
  "token",
  "secret",
  "accesstoken",
  "refreshtoken",
  "cookie",
  "session",
  "authorization",
  "r2_secret_access_key",
  "turnstilesecret",
]);

function sanitizeDetails(details?: Record<string, any>): Record<string, any> | null {
  if (!details || typeof details !== "object") return null;

  const sanitized: Record<string, any> = {};
  for (const [key, val] of Object.entries(details)) {
    const lowerKey = key.toLowerCase();
    if (REDACT_KEYS.has(lowerKey)) {
      sanitized[key] = "[REDACTED]";
    } else if (typeof val === "object" && val !== null && !Array.isArray(val)) {
      sanitized[key] = sanitizeDetails(val as Record<string, any>);
    } else {
      sanitized[key] = val;
    }
  }
  return sanitized;
}

/**
 * Log a security or administrative action to the immutable audit log table.
 */
export async function logAuditEvent(params: {
  userId?: string | null;
  action: AuditAction;
  entityType?: string;
  entityId?: string;
  details?: Record<string, unknown>;
  status?: "SUCCESS" | "FAILED" | "BLOCKED";
  req?: Request | Headers | null;
}): Promise<void> {
  const {
    userId = null,
    action,
    entityType = null,
    entityId = null,
    details = undefined,
    status = "SUCCESS",
    req = null,
  } = params;

  const ipAddress = getClientIp(req);
  const userAgent =
    req && "headers" in req
      ? req.headers.get("user-agent") || null
      : req instanceof Headers
        ? req.get("user-agent")
        : null;

  const safeDetails = sanitizeDetails(details);

  try {
    const sql = await getSql();

    await sql`CREATE TABLE IF NOT EXISTS admin_audit_logs (
      id SERIAL PRIMARY KEY,
      user_id TEXT,
      action TEXT NOT NULL,
      entity_type TEXT,
      entity_id TEXT,
      ip_address TEXT,
      user_agent TEXT,
      details JSONB,
      status TEXT NOT NULL DEFAULT 'SUCCESS',
      created_at TIMESTAMPTZ NOT NULL DEFAULT now()
    )`;

    await sql`
      INSERT INTO admin_audit_logs (
        user_id, action, entity_type, entity_id, ip_address, user_agent, details, status
      ) VALUES (
        ${userId},
        ${action},
        ${entityType},
        ${entityId},
        ${ipAddress},
        ${userAgent},
        ${safeDetails ? JSON.stringify(safeDetails) : null}::jsonb,
        ${status}
      )
    `;
  } catch (err) {
    console.error("[security audit] Audit log write failed:", err);
  }
}

/**
 * Fetch recent audit logs for the admin security dashboard.
 */
export async function getRecentAuditLogs(limit = 50): Promise<AuditLogEntry[]> {
  try {
    const sql = await getSql();
    const rows = await sql<{
      id: number;
      user_id: string | null;
      action: string;
      entity_type: string | null;
      entity_id: string | null;
      ip_address: string | null;
      user_agent: string | null;
      details: any;
      status: string;
      created_at: string;
    }>`
      SELECT * FROM admin_audit_logs 
      ORDER BY id DESC 
      LIMIT ${Math.min(limit, 100)}
    `;

    return rows.map((r) => ({
      id: r.id,
      userId: r.user_id,
      action: r.action as AuditAction,
      entityType: r.entity_type || undefined,
      entityId: r.entity_id || undefined,
      ipAddress: r.ip_address || undefined,
      userAgent: r.user_agent || undefined,
      details: r.details || undefined,
      status: (r.status as any) || "SUCCESS",
      createdAt: r.created_at,
    }));
  } catch {
    return [];
  }
}
