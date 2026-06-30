import { eq, ilike, and, sql, desc } from "drizzle-orm";
import { db } from "../config/db.js";
import { jemaah } from "../db/schema/index.js";

// ─── Types ───────────────────────────────────────────────────────────

export interface CreateJemaahInput {
  name: string;
  address: string;
  phone: string;
  category?: string;
  skills?: string | null;
  notes?: string | null;
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
        sql`(${ilike(jemaah.name, `%${search}%`)} OR ${jemaah.phone} LIKE ${`%${search}%`})`
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
    const result = await db
      .insert(jemaah)
      .values({
        name: data.name,
        address: data.address,
        phone: data.phone,
        category: data.category ?? "Umum",
        skills: data.skills ?? null,
        notes: data.notes ?? null,
        createdBy: userId,
      })
      ;
    return result[0];
  }

  async update(id: string, data: Partial<CreateJemaahInput>) {
    const result = await db
      .update(jemaah)
      .set({
        ...data,
        updatedAt: new Date(),
      })
      .where(eq(jemaah.id, id))
      ;
    return result[0] ?? null;
  }

  async delete(id: string) {
    const result = await db
      .delete(jemaah)
      .where(eq(jemaah.id, id))
      ;
    return result[0] ?? null;
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
