import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { getSql } from "@/lib/db";
import { adminAuthMiddleware } from "./security/auth";
import { logAuditEvent } from "./security/audit";
import { sanitizeText } from "./security/sanitize";
import { checkRateLimit, getClientIp } from "./security/rate-limiter";
import type { TalepItem, TalepStatus } from "@/lib/admin/adminStore";

const TalepInputSchema = z.object({
  name: z.string().min(2).max(100),
  phone: z.string().min(8).max(30),
  email: z.string().email().max(120).optional().or(z.literal("")),
  district: z.string().max(100).optional(),
  category: z.string().max(100).optional(),
  message: z.string().max(2000).optional(),
  estimatedBudget: z.string().max(100).optional(),
});

function rowToTalep(r: any): TalepItem {
  const dateStr = r.created_at
    ? new Date(r.created_at).toLocaleDateString("tr-TR", {
        timeZone: "Europe/Istanbul",
        day: "2-digit",
        month: "long",
        hour: "2-digit",
        minute: "2-digit",
      })
    : "Yeni";

  return {
    id: r.tracking_id || `TLP-${r.id}`,
    name: r.name,
    phone: r.phone,
    email: r.email || undefined,
    district: r.district || "Konya / Merkez",
    category: r.category || "Özel Mobilya Talebi",
    message: r.message || "",
    status: (r.status as TalepStatus) || "Yeni",
    notes: r.notes || undefined,
    estimatedBudget: r.estimated_budget || undefined,
    date: dateStr,
    timestamp: r.created_at ? new Date(r.created_at).getTime() : Date.now(),
  };
}

// Public Submission Endpoint (Rate-Limited & Validated)
export const submitTalepServerFn = createServerFn({ method: "POST" })
  .validator((d: unknown) => TalepInputSchema.parse(d))
  .handler(async ({ data }): Promise<{ success: boolean; trackingId: string }> => {
    const { getRequest } = await import("@tanstack/react-start/server");
    const req = getRequest();
    const ip = getClientIp(req);

    // Rate limit: max 10 quote requests per IP per hour (prevents abuse while allowing legitimate testing)
    const limit = checkRateLimit(`quote:${ip}`, 10, 60 * 60 * 1000);
    if (!limit.allowed) {
      throw new Error("Kısa sürede çok fazla talep gönderildi. Lütfen biraz sonra tekrar deneyin veya bizi doğrudan arayın.");
    }

    const cleanName = sanitizeText(data.name, 100);
    const cleanPhone = sanitizeText(data.phone, 30);
    const cleanEmail = data.email ? sanitizeText(data.email, 120) : null;
    const cleanDistrict = sanitizeText(data.district || "Konya / Merkez", 100);
    const cleanCategory = sanitizeText(data.category || "Özel Mobilya Talebi", 100);
    const cleanMessage = sanitizeText(data.message || "", 2000);
    const cleanBudget = data.estimatedBudget ? sanitizeText(data.estimatedBudget, 100) : null;

    const trackingId = `TLP-${Math.floor(1000 + Math.random() * 9000)}`;

    try {
      const { getSql } = await import("@/lib/db");
      const sql = await getSql();

      await sql`CREATE TABLE IF NOT EXISTS customer_requests (
        id SERIAL PRIMARY KEY,
        tracking_id TEXT NOT NULL UNIQUE,
        name TEXT NOT NULL,
        phone TEXT NOT NULL,
        email TEXT,
        district TEXT NOT NULL,
        category TEXT NOT NULL,
        message TEXT NOT NULL,
        status TEXT NOT NULL DEFAULT 'Yeni',
        notes TEXT,
        estimated_budget TEXT,
        ip_address TEXT,
        created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
        updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
      )`;

      await sql`INSERT INTO customer_requests (
        tracking_id, name, phone, email, district, category, message, status, estimated_budget, ip_address
      ) VALUES (
        ${trackingId}, ${cleanName}, ${cleanPhone}, ${cleanEmail}, ${cleanDistrict},
        ${cleanCategory}, ${cleanMessage}, 'Yeni', ${cleanBudget}, ${ip}
      )`;

      return { success: true, trackingId };
    } catch (err: any) {
      console.error("[talepler] DB submit error:", err);
      throw new Error("Talebiniz kaydedilirken bir veritabanı hatası oluştu: " + (err?.message || "Lütfen tekrar deneyin."));
    }
  });

// Fetch all customer requests - PROTECTED WITH ADMIN AUTH
export const getTaleplerServerFn = createServerFn({ method: "GET" })
  .middleware([adminAuthMiddleware])
  .handler(async (): Promise<{ talepler: TalepItem[] }> => {
    try {
      const { getSql } = await import("@/lib/db");
      const sql = await getSql();

      await sql`CREATE TABLE IF NOT EXISTS customer_requests (
        id SERIAL PRIMARY KEY,
        tracking_id TEXT NOT NULL UNIQUE,
        name TEXT NOT NULL,
        phone TEXT NOT NULL,
        email TEXT,
        district TEXT NOT NULL,
        category TEXT NOT NULL,
        message TEXT NOT NULL,
        status TEXT NOT NULL DEFAULT 'Yeni',
        notes TEXT,
        estimated_budget TEXT,
        ip_address TEXT,
        created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
        updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
      )`;

      const rows = await sql`
        SELECT * FROM customer_requests ORDER BY id DESC LIMIT 500
      `;

      if (rows && rows.length > 0) {
        return { talepler: rows.map(rowToTalep) };
      }
      return { talepler: [] };
    } catch (err) {
      console.error("[talepler] DB get error:", err);
      return { talepler: [] };
    }
  });

// Update Talep Status - PROTECTED WITH ADMIN AUTH
export const updateTalepStatusServerFn = createServerFn({ method: "POST" })
  .middleware([adminAuthMiddleware])
  .validator((d: { id: string; status: TalepStatus }) =>
    z.object({ id: z.string().min(1), status: z.string().min(1) }).parse(d),
  )
  .handler(async ({ data, context }): Promise<{ success: boolean }> => {
    const { id, status } = data;
    const { adminUser } = context;
    const { getRequest } = await import("@tanstack/react-start/server");
    const req = getRequest();

    try {
      const { getSql } = await import("@/lib/db");
      const sql = await getSql();

      await sql`
        UPDATE customer_requests 
        SET status = ${status}, updated_at = now() 
        WHERE tracking_id = ${id} OR id::text = ${id}
      `;

      await logAuditEvent({
        userId: adminUser.id,
        action: "TALEP_STATUS_UPDATED",
        entityType: "customer_request",
        entityId: id,
        details: { newStatus: status },
        req,
      });

      return { success: true };
    } catch (err) {
      console.error("[talepler] DB update status error:", err);
      throw new Error("Durum güncellenirken hata oluştu.");
    }
  });

// Update Talep Notes - PROTECTED WITH ADMIN AUTH
export const updateTalepNotesServerFn = createServerFn({ method: "POST" })
  .middleware([adminAuthMiddleware])
  .validator((d: { id: string; notes: string }) =>
    z.object({ id: z.string().min(1), notes: z.string().max(2000) }).parse(d),
  )
  .handler(async ({ data }): Promise<{ success: boolean }> => {
    const { id, notes } = data;
    const cleanNotes = sanitizeText(notes, 2000);

    try {
      const { getSql } = await import("@/lib/db");
      const sql = await getSql();

      await sql`
        UPDATE customer_requests 
        SET notes = ${cleanNotes}, updated_at = now() 
        WHERE tracking_id = ${id} OR id::text = ${id}
      `;

      return { success: true };
    } catch (err) {
      console.error("[talepler] DB update notes error:", err);
      throw new Error("Not güncellenirken hata oluştu.");
    }
  });

// Delete Talep - PROTECTED WITH ADMIN AUTH
export const deleteTalepServerFn = createServerFn({ method: "POST" })
  .middleware([adminAuthMiddleware])
  .validator((d: { id: string }) => z.object({ id: z.string().min(1) }).parse(d))
  .handler(async ({ data, context }): Promise<{ success: boolean }> => {
    const { id } = data;
    const { adminUser } = context;
    const { getRequest } = await import("@tanstack/react-start/server");
    const req = getRequest();

    try {
      const { getSql } = await import("@/lib/db");
      const sql = await getSql();

      await sql`
        DELETE FROM customer_requests 
        WHERE tracking_id = ${id} OR id::text = ${id}
      `;

      await logAuditEvent({
        userId: adminUser.id,
        action: "TALEP_DELETED",
        entityType: "customer_request",
        entityId: id,
        req,
      });

      return { success: true };
    } catch (err) {
      console.error("[talepler] DB delete error:", err);
      throw new Error("Talep silinirken hata oluştu.");
    }
  });
