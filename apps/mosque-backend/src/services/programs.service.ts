import crypto from "crypto";
import { eq, like, and, sql, desc, asc, isNotNull } from "drizzle-orm";
import { db } from "../config/db.js";
import { program, user, transaction } from "../db/schema/index.js";
import { mailService } from "./mail.service.js";
import { calendarService } from "./calendar.service.js";
import { transactionService } from "./transactions.service.js";

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
        sql`(${like(program.name, `%${search}%`)} OR ${like(program.pic, `%${search}%`)})`
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

  async syncProgramTransaction(programData: {
    id: string;
    name: string;
    budget: string;
    status: string;
    date: string;
    createdBy?: string | null;
  }) {
    try {
      const existing = await db
        .select()
        .from(transaction)
        .where(eq(transaction.programId, programData.id))
        .limit(1);

      const existingTx = existing[0] ?? null;

      if (programData.status === "Selesai") {
        if (existingTx) {
          await transactionService.update(
            existingTx.id,
            {
              date: programData.date,
              type: "Pengeluaran",
              category: "Program Kerja",
              amount: String(programData.budget),
              description: programData.name,
              programId: programData.id,
            },
            true
          );
        } else {
          await transactionService.create(
            {
              date: programData.date,
              type: "Pengeluaran",
              category: "Program Kerja",
              amount: String(programData.budget),
              description: programData.name,
              programId: programData.id,
            },
            programData.createdBy || null,
            true
          );
        }
      } else {
        if (existingTx) {
          await transactionService.delete(existingTx.id, true);
        }
      }
    } catch (err) {
      console.error(`Error syncing transaction for program ${programData.id}:`, err);
    }
  }

  async syncAllCompletedPrograms() {
    try {
      const allPrograms = await db.select().from(program);
      for (const p of allPrograms) {
        await this.syncProgramTransaction(p);
      }
    } catch (err) {
      console.error("Error in syncAllCompletedPrograms:", err);
    }
  }

  async create(data: CreateProgramInput, userId: string) {
    const id = crypto.randomUUID();
    await db
      .insert(program)
      .values({
        id,
        name: data.name,
        pic: data.pic,
        budget: data.budget,
        status: data.status ?? "Direncanakan",
        date: data.date,
        description: data.description,
        evaluation: data.evaluation ?? null,
        createdBy: userId,
      });

    const created = await this.findById(id);
    if (created) {
      await this.syncProgramTransaction(created);
    }
      
    // Send email to Takmir asynchronously
    try {
      const icsContent = await calendarService.createProgramEvent(data);
      const allTakmir = await db.select({ email: user.email }).from(user).where(isNotNull(user.email));
      const emails = allTakmir.map((u) => u.email).filter(Boolean) as string[];
      
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
    
    return created;
  }

  async update(id: string, data: Partial<CreateProgramInput>) {
    const existing = await this.findById(id);
    if (!existing) return null;

    await db
      .update(program)
      .set({
        ...data,
        updatedAt: new Date(),
      })
      .where(eq(program.id, id));

    const updated = await this.findById(id);
    if (updated) {
      await this.syncProgramTransaction(updated);
    }

    return updated;
  }

  async updateStatus(id: string, status: string) {
    const existing = await this.findById(id);
    if (!existing) return null;

    await db
      .update(program)
      .set({ status, updatedAt: new Date() })
      .where(eq(program.id, id));

    const updated = await this.findById(id);
    if (updated) {
      await this.syncProgramTransaction(updated);
    }

    return updated;
  }

  async completeProgram(id: string, reportDocUrl: string | null, documentationUrls: string[]) {
    const existing = await this.findById(id);
    if (!existing) return null;

    await db
      .update(program)
      .set({
        status: "Selesai",
        reportDocUrl,
        documentationUrls,
        updatedAt: new Date(),
      })
      .where(eq(program.id, id));

    const updated = await this.findById(id);
    if (updated) {
      await this.syncProgramTransaction(updated);
    }

    return updated;
  }

  async delete(id: string) {
    const existing = await this.findById(id);
    if (!existing) return null;

    // Delete associated auto-generated transaction first
    await this.syncProgramTransaction({ ...existing, status: "Deleted" });

    await db
      .delete(program)
      .where(eq(program.id, id));

    return existing;
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
