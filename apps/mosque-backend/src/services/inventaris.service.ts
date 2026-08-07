import crypto from "crypto";
import { eq, like, and, sql, desc } from "drizzle-orm";
import { db } from "../config/db.js";
import { inventaris } from "../db/schema/index.js";

// ─── Types ───────────────────────────────────────────────────────────

export interface CreateInventarisInput {
  name: string;
  quantity: number;
  date: string;
  location: string;
  condition?: string;
  notes?: string | null;
}

export interface InventarisFilters {
  search?: string;
  condition?: string;
  location?: string;
}

// ─── Service ─────────────────────────────────────────────────────────

export class InventarisService {
  async findAll(filters: InventarisFilters = {}) {
    const { search, condition, location } = filters;
    const conditions = [];

    if (search) {
      conditions.push(like(inventaris.name, `%${search}%`));
    }
    if (condition && condition !== "Semua") {
      conditions.push(eq(inventaris.condition, condition));
    }
    if (location && location !== "Semua") {
      conditions.push(eq(inventaris.location, location));
    }

    const where = conditions.length > 0 ? and(...conditions) : undefined;

    const data = await db
      .select()
      .from(inventaris)
      .where(where)
      .orderBy(desc(inventaris.createdAt));

    return data;
  }

  async findById(id: string) {
    const result = await db
      .select()
      .from(inventaris)
      .where(eq(inventaris.id, id))
      .limit(1);
    return result[0] ?? null;
  }

  async create(data: CreateInventarisInput, userId: string) {
    const id = crypto.randomUUID();
    await db
      .insert(inventaris)
      .values({
        id,
        name: data.name,
        quantity: data.quantity,
        date: data.date,
        location: data.location,
        condition: data.condition ?? "Baik",
        notes: data.notes ?? null,
        createdBy: userId,
      });

    return this.findById(id);
  }

  async update(id: string, data: Partial<CreateInventarisInput>) {
    const existing = await this.findById(id);
    if (!existing) return null;

    await db
      .update(inventaris)
      .set({
        ...data,
        updatedAt: new Date(),
      })
      .where(eq(inventaris.id, id));

    return this.findById(id);
  }

  async delete(id: string) {
    const existing = await this.findById(id);
    if (!existing) return null;

    await db
      .delete(inventaris)
      .where(eq(inventaris.id, id));

    return existing;
  }

  /**
   * Condition-based counts. Mirrors InventarisContext.summaries.
   */
  async getSummary() {
    const result = await db
      .select({
        total: sql<number>`count(*)`,
        Baik: sql<number>`SUM(CASE WHEN ${inventaris.condition} = 'Baik' THEN 1 ELSE 0 END)`,
        "Rusak Ringan": sql<number>`SUM(CASE WHEN ${inventaris.condition} = 'Rusak Ringan' THEN 1 ELSE 0 END)`,
        "Rusak Berat": sql<number>`SUM(CASE WHEN ${inventaris.condition} = 'Rusak Berat' THEN 1 ELSE 0 END)`,
      })
      .from(inventaris);

    const row = result[0] || {};
    return {
      total: Number(row.total || 0),
      Baik: Number(row.Baik || 0),
      "Rusak Ringan": Number(row["Rusak Ringan"] || 0),
      "Rusak Berat": Number(row["Rusak Berat"] || 0),
    };
  }
}

export const inventarisService = new InventarisService();
