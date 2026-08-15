import crypto from "crypto";
import { eq, like, and, sql, desc, or } from "drizzle-orm";
import { db } from "../config/db.js";
import { jemaah } from "../db/schema/index.js";

// ─── Types ───────────────────────────────────────────────────────────

export interface CreateJemaahInput {
  name: string;
  address: string;
  phone: string;
  email?: string | null;
  category?: string;
  skills?: string | null;
  notes?: string | null;
  lat?: number | null;
  lng?: number | null;
}

export interface PublicRegisterInput {
  name: string;
  address: string;
  phone?: string | null;
  email?: string | null;
  category: string;
  lat?: number | null;
  lng?: number | null;
}

export interface JemaahFilters {
  search?: string;
  category?: string;
}

// ─── Service ─────────────────────────────────────────────────────────

export class JemaahService {
  async findAll(filters: JemaahFilters = {}) {
    const { search, category } = filters;
    const conditions = [];

    if (search) {
      conditions.push(
        or(
          like(jemaah.name, `%${search}%`),
          like(jemaah.phone, `%${search}%`)
        )!
      );
    }
    if (category && category !== "Semua") {
      conditions.push(eq(jemaah.category, category));
    }

    const where = conditions.length > 0 ? and(...conditions) : undefined;

    const data = await db
      .select()
      .from(jemaah)
      .where(where)
      .orderBy(desc(jemaah.createdAt));

    return data;
  }

  async findById(id: string) {
    const result = await db
      .select()
      .from(jemaah)
      .where(eq(jemaah.id, id))
      .limit(1);
    return result[0] ?? null;
  }

  async create(data: CreateJemaahInput, userId: string) {
    const id = crypto.randomUUID();
    await db
      .insert(jemaah)
      .values({
        id,
        name: data.name,
        address: data.address,
        phone: data.phone ?? "-",
        email: data.email ?? null,
        category: data.category ?? "Umum",
        skills: data.skills ?? null,
        notes: data.notes ?? null,
        lat: data.lat ?? null,
        lng: data.lng ?? null,
        createdBy: userId,
      });

    return this.findById(id);
  }

  async publicRegister(data: PublicRegisterInput) {
    const id = crypto.randomUUID();
    await db
      .insert(jemaah)
      .values({
        id,
        name: data.name,
        address: data.address,
        phone: data.phone && data.phone.trim() !== "" ? data.phone : "-",
        email: data.email ?? null,
        category: data.category ?? "Umum",
        notes: "Pendaftaran Mandiri Landing Page (Scan QR)",
        lat: data.lat ?? null,
        lng: data.lng ?? null,
        createdBy: null,
      });

    return this.findById(id);
  }

  async update(id: string, data: Partial<CreateJemaahInput>) {
    const existing = await this.findById(id);
    if (!existing) return null;

    await db
      .update(jemaah)
      .set({
        ...data,
        updatedAt: new Date(),
      })
      .where(eq(jemaah.id, id));

    return this.findById(id);
  }

  async delete(id: string) {
    const existing = await this.findById(id);
    if (!existing) return null;

    await db
      .delete(jemaah)
      .where(eq(jemaah.id, id));

    return existing;
  }

  /**
   * Category-based counts. Mirrors JemaahContext.summaries.
   */
  async getSummary() {
    const result = await db
      .select({
        total: sql<number>`count(*)`,
        Muzakki: sql<number>`SUM(CASE WHEN ${jemaah.category} = 'Muzakki' THEN 1 ELSE 0 END)`,
        Mustahik: sql<number>`SUM(CASE WHEN ${jemaah.category} = 'Mustahik' THEN 1 ELSE 0 END)`,
        Umum: sql<number>`SUM(CASE WHEN ${jemaah.category} = 'Umum' THEN 1 ELSE 0 END)`,
        Lansia: sql<number>`SUM(CASE WHEN ${jemaah.category} = 'Lansia' THEN 1 ELSE 0 END)`,
        Yatim: sql<number>`SUM(CASE WHEN ${jemaah.category} = 'Yatim' THEN 1 ELSE 0 END)`,
        Fakir: sql<number>`SUM(CASE WHEN ${jemaah.category} = 'Fakir' THEN 1 ELSE 0 END)`,
      })
      .from(jemaah);

    const row = result[0] || {};
    return {
      total: Number(row.total || 0),
      Muzakki: Number(row.Muzakki || 0),
      Mustahik: Number(row.Mustahik || 0),
      Umum: Number(row.Umum || 0),
      Lansia: Number(row.Lansia || 0),
      Yatim: Number(row.Yatim || 0),
      Fakir: Number(row.Fakir || 0),
    };
  }
}

export const jemaahService = new JemaahService();
