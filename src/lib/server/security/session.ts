import { randomBytes, createHash } from "node:crypto";
import { getSql, isProduction } from "../../db";
import { hashPassword } from "./password";

export const SESSION_COOKIE_NAME = isProduction ? "__Host-admin_session" : "admin_session";
export const SESSION_MAX_AGE_SECONDS = 7 * 24 * 60 * 60; // 7 days absolute lifetime
export const SESSION_INACTIVITY_MS = 24 * 60 * 60 * 1000; // 24 hours inactivity timeout

export interface AdminUserRecord {
  id: string;
  username: string;
  email: string;
  name: string;
  role: string;
  created_at: string;
  updated_at: string;
}

export interface AdminSessionRecord {
  id: string;
  user_id: string;
  token_hash: string;
  ip_address: string | null;
  user_agent: string | null;
  created_at: string;
  last_active_at: string;
  expires_at: string;
  revoked_at: string | null;
}

export interface ActiveSessionView {
  id: string;
  ipAddress: string;
  userAgent: string;
  createdAt: string;
  lastActiveAt: string;
  isCurrent: boolean;
}

export function hashSessionToken(token: string): string {
  return createHash("sha256").update(token).digest("hex");
}

let adminProvisioned = false;

/**
 * Ensures admin tables exist and initial admin account is provisioned with a secure hash.
 */
export async function ensureAdminProvisioned(): Promise<void> {
  if (adminProvisioned) return;

  try {
    const sql = await getSql();

    // Ensure schema
    await sql`CREATE TABLE IF NOT EXISTS admin_users (
      id TEXT PRIMARY KEY,
      username TEXT UNIQUE NOT NULL,
      email TEXT UNIQUE NOT NULL,
      password_hash TEXT NOT NULL,
      name TEXT NOT NULL,
      role TEXT NOT NULL DEFAULT 'admin',
      created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
      updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
    )`;

    await sql`CREATE TABLE IF NOT EXISTS admin_sessions (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL REFERENCES admin_users(id) ON DELETE CASCADE,
      token_hash TEXT NOT NULL UNIQUE,
      ip_address TEXT,
      user_agent TEXT,
      created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
      last_active_at TIMESTAMPTZ NOT NULL DEFAULT now(),
      expires_at TIMESTAMPTZ NOT NULL,
      revoked_at TIMESTAMPTZ
    )`;

    // Check if any admin exists
    const users = await sql<{ id: string }>`SELECT id FROM admin_users LIMIT 1`;
    if (!users || users.length === 0) {
      const initialPassword = process.env.INITIAL_ADMIN_PASSWORD || "parlak1984";
      const initialHash = await hashPassword(initialPassword);
      const adminId = "adm_parlak_master";

      await sql`INSERT INTO admin_users (
        id, username, email, password_hash, name, role
      ) VALUES (
        ${adminId},
        'admin',
        'info@parlakmobilyadekorasyon.com',
        ${initialHash},
        'Ahmet Parlak',
        'admin'
      ) ON CONFLICT (email) DO NOTHING`;
    }

    adminProvisioned = true;
  } catch (err) {
    console.error("[security] Admin provisioning notice:", err);
  }
}

/**
 * Create a new cryptographically random opaque session.
 */
export async function createAdminSession(
  userId: string,
  ipAddress?: string | null,
  userAgent?: string | null,
): Promise<{ rawToken: string; session: AdminSessionRecord }> {
  await ensureAdminProvisioned();

  const rawToken = randomBytes(32).toString("base64url");
  const tokenHash = hashSessionToken(rawToken);
  const sessionId = `ses_${randomBytes(16).toString("hex")}`;
  const expiresAt = new Date(Date.now() + SESSION_MAX_AGE_SECONDS * 1000).toISOString();

  const sql = await getSql();
  const rows = await sql<AdminSessionRecord>`
    INSERT INTO admin_sessions (
      id, user_id, token_hash, ip_address, user_agent, expires_at
    ) VALUES (
      ${sessionId}, ${userId}, ${tokenHash}, ${ipAddress || null}, ${userAgent || null}, ${expiresAt}
    ) RETURNING *
  `;

  return { rawToken, session: rows[0] };
}

/**
 * Verifies an opaque session token against the database.
 * Enforces:
 * 1. Valid hash match
 * 2. Revocation status (revoked_at must be null)
 * 3. Absolute expiration (expires_at > now())
 * 4. Inactivity timeout (last_active_at within 24h)
 * 5. Active admin user role
 */
export async function verifyAdminSession(
  rawToken: string,
): Promise<{ user: AdminUserRecord; session: AdminSessionRecord } | null> {
  if (!rawToken || typeof rawToken !== "string") {
    return null;
  }

  await ensureAdminProvisioned();
  const tokenHash = hashSessionToken(rawToken);

  try {
    const sql = await getSql();
    const rows = await sql<
      AdminSessionRecord & {
        u_id: string;
        u_username: string;
        u_email: string;
        u_name: string;
        u_role: string;
        u_created_at: string;
        u_updated_at: string;
      }
    >`
      SELECT 
        s.*,
        u.id as u_id,
        u.username as u_username,
        u.email as u_email,
        u.name as u_name,
        u.role as u_role,
        u.created_at as u_created_at,
        u.updated_at as u_updated_at
      FROM admin_sessions s
      JOIN admin_users u ON u.id = s.user_id
      WHERE s.token_hash = ${tokenHash}
        AND s.revoked_at IS NULL
        AND s.expires_at > now()
      LIMIT 1
    `;

    if (!rows || rows.length === 0) {
      return null;
    }

    const row = rows[0];

    // Check inactivity timeout
    const lastActive = new Date(row.last_active_at).getTime();
    if (Date.now() - lastActive > SESSION_INACTIVITY_MS) {
      // Invalidate inactive session
      await sql`UPDATE admin_sessions SET revoked_at = now() WHERE id = ${row.id}`;
      return null;
    }

    // Role check (Default DENY)
    if (row.u_role !== "admin") {
      return null;
    }

    // Update last active timestamp
    await sql`UPDATE admin_sessions SET last_active_at = now() WHERE id = ${row.id}`;

    return {
      session: {
        id: row.id,
        user_id: row.user_id,
        token_hash: row.token_hash,
        ip_address: row.ip_address,
        user_agent: row.user_agent,
        created_at: row.created_at,
        last_active_at: row.last_active_at,
        expires_at: row.expires_at,
        revoked_at: row.revoked_at,
      },
      user: {
        id: row.u_id,
        username: row.u_username,
        email: row.u_email,
        name: row.u_name,
        role: row.u_role,
        created_at: row.u_created_at,
        updated_at: row.u_updated_at,
      },
    };
  } catch (err) {
    console.error("[security] Session verification error:", err);
    return null;
  }
}

/**
 * Revoke a single session by its session ID.
 */
export async function revokeAdminSession(sessionId: string): Promise<boolean> {
  try {
    const sql = await getSql();
    await sql`UPDATE admin_sessions SET revoked_at = now() WHERE id = ${sessionId}`;
    return true;
  } catch (err) {
    console.error("[security] Session revocation error:", err);
    return false;
  }
}

/**
 * Revoke all sessions for a user, optionally preserving the current active session.
 */
export async function revokeAllUserSessionsExcept(
  userId: string,
  exceptSessionId?: string,
): Promise<number> {
  try {
    const sql = await getSql();
    if (exceptSessionId) {
      const res = await sql`
        UPDATE admin_sessions 
        SET revoked_at = now() 
        WHERE user_id = ${userId} 
          AND id != ${exceptSessionId} 
          AND revoked_at IS NULL
      `;
      return res.length;
    } else {
      const res = await sql`
        UPDATE admin_sessions 
        SET revoked_at = now() 
        WHERE user_id = ${userId} 
          AND revoked_at IS NULL
      `;
      return res.length;
    }
  } catch (err) {
    console.error("[security] Revoke all sessions error:", err);
    return 0;
  }
}

/**
 * Get active sessions for the user to display in the admin security center.
 */
export async function getActiveSessions(
  userId: string,
  currentSessionId?: string,
): Promise<ActiveSessionView[]> {
  try {
    const sql = await getSql();
    const rows = await sql<AdminSessionRecord>`
      SELECT * FROM admin_sessions
      WHERE user_id = ${userId}
        AND revoked_at IS NULL
        AND expires_at > now()
      ORDER BY last_active_at DESC
      LIMIT 20
    `;

    return rows.map((r) => ({
      id: r.id,
      ipAddress: r.ip_address || "Bilinmiyor",
      userAgent: r.user_agent || "Bilinmiyor",
      createdAt: r.created_at,
      lastActiveAt: r.last_active_at,
      isCurrent: r.id === currentSessionId,
    }));
  } catch {
    return [];
  }
}
