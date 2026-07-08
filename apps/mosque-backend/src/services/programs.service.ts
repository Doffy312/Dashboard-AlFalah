import { eq, ilike, and, sql, desc, asc, isNotNull } from "drizzle-orm";
import { db } from "../config/db.js";
import { program, jemaah } from "../db/schema/index.js";
import { mailService } from "./mail.service.js";
import { calendarService } from "./calendar.service.js";

// ─── Types ───────────────────────────────────────────────────────────

export interface CreateProgramInput {
  name: string;
  pic: string;
  budget: string;
  status?: string;
  date: string;
  description: string;
  evaluation?: string | null;
}

export interface ProgramFilters {
  search?: string;
  status?: string;
}

// ─── Service ─────────────────────────────────────────────────────────

export class ProgramService {
  async findAll(filters: ProgramFilters = {}) {
    const { search, status } = filters;
    const conditions = [];

    if (search) {
      conditions.push(
        sql`(${ilike(program.name, `%${search}%`)} OR ${ilike(program.pic, `%${search}%`)})`
      );
    }
    if (status) {
      conditions.push(eq(program.status, status));
    }

    const where = conditions.length > 0 ? and(...conditions) : undefined;

    const data = await db
      .select()
      .from(program)
      .where(where)
      .orderBy(desc(program.createdAt));

    return data;
  }

  async findById(id: string) {
    const result = await db
      .select()
      .from(program)
      .where(eq(program.id, id))
      .limit(1);
    return result[0] ?? null;
  }

  async create(data: CreateProgramInput, userId: string) {
    const result = await db
      .insert(program)
      .values({
        name: data.name,
        pic: data.pic,
        budget: data.budget,
        status: data.status ?? "Direncanakan",
        date: data.date,
        description: data.description,
        evaluation: data.evaluation ?? null,
        createdBy: userId,
      })
      ;
      
    // Send email to Jemaah asynchronously
    try {
      const icsContent = await calendarService.createProgramEvent(data);
      const allJemaah = await db.select({ email: jemaah.email }).from(jemaah).where(isNotNull(jemaah.email));
      const emails = allJemaah.map((j) => j.email).filter(Boolean) as string[];
      
      if (emails.length > 0) {
        const textContent = `Assalamualaikum,\n\nProgram Kerja baru telah ditambahkan:\nNama: ${data.name}\nPIC: ${data.pic}\nTanggal: ${data.date}\n\nSilakan tambahkan ke kalender Anda dengan membuka lampiran .ics berikut.`;
        
        mailService.sendICS(
          emails.join(','), 
          `[Program Kerja Baru] ${data.name}`, 
          textContent, 
          icsContent
        ).catch(e => console.error("Error sending calendar email in background:", e));
      }
    } catch(err) {
      console.error("Failed to generate/send ICS:", err);
    }
    
    return result[0];
  }

  async update(id: string, data: Partial<CreateProgramInput>) {
    const result = await db
      .update(program)
      .set({
        ...data,
        updatedAt: new Date(),
      })
      .where(eq(program.id, id))
      ;
    return result[0] ?? null;
  }

  async updateStatus(id: string, status: string) {
    const result = await db
      .update(program)
      .set({ status, updatedAt: new Date() })
      .where(eq(program.id, id))
      ;
    return result[0] ?? null;
  }

  async completeProgram(id: string, reportDocUrl: string | null, documentationUrls: string[]) {
    const result = await db
      .update(program)
      .set({
        status: "Selesai",
        reportDocUrl,
        documentationUrls,
        updatedAt: new Date(),
      })
      .where(eq(program.id, id));
    return result[0] ?? null;
  }

  async delete(id: string) {
    const result = await db
      .delete(program)
      .where(eq(program.id, id))
      ;
    return result[0] ?? null;
  }

  /**
   * Program status counts. Mirrors ProgramContext.summaries.
   */
  async getSummary() {
    const result = await db
      .select({
        total: sql<number>`count(*)`,
        direncanakan: sql<number>`SUM(CASE WHEN ${program.status} = 'Direncanakan' THEN 1 ELSE 0 END)`,
        berjalan: sql<number>`SUM(CASE WHEN ${program.status} = 'Sedang Berjalan' THEN 1 ELSE 0 END)`,
        selesai: sql<number>`SUM(CASE WHEN ${program.status} = 'Selesai' THEN 1 ELSE 0 END)`,
      })
      .from(program);

    const row = result[0] || {};
    return {
      total: Number(row.total || 0),
      direncanakan: Number(row.direncanakan || 0),
      berjalan: Number(row.berjalan || 0),
      selesai: Number(row.selesai || 0),
    };
  }

  /**
   * Upcoming programs for dashboard widget.
   */
  async getUpcoming(limit = 3) {
    const data = await db
      .select()
      .from(program)
      .where(
        sql`${program.status} in ('Direncanakan', 'Sedang Berjalan')`
      )
      .orderBy(asc(program.date))
      .limit(limit);

    return data;
  }

  /**
   * Completed programs for dashboard widget.
   */
  async getCompleted(limit = 3) {
    const data = await db
      .select()
      .from(program)
      .where(
        eq(program.status, 'Selesai')
      )
      .orderBy(desc(program.date))
      .limit(limit);

    return data;
  }
}

export const programService = new ProgramService();
