import { eq, desc } from "drizzle-orm";
import { db } from "../config/db.js";
import { jadwalPetugas } from "../db/schema/jadwal.js";

export const jadwalService = {
  async findAll() {
    return db.select().from(jadwalPetugas).orderBy(desc(jadwalPetugas.date), desc(jadwalPetugas.createdAt));
  },

  async findById(id: string) {
    const records = await db.select().from(jadwalPetugas).where(eq(jadwalPetugas.id, id));
    return records[0];
  },

  async create(data: typeof jadwalPetugas.$inferInsert) {
    await db.insert(jadwalPetugas).values(data);
    if (!data.id) return true;
    return this.findById(data.id);
  },

  async update(id: string, data: Partial<typeof jadwalPetugas.$inferInsert>) {
    await db.update(jadwalPetugas).set(data).where(eq(jadwalPetugas.id, id));
    return this.findById(id);
  },

  async remove(id: string) {
    await db.delete(jadwalPetugas).where(eq(jadwalPetugas.id, id));
    return true;
  }
};
