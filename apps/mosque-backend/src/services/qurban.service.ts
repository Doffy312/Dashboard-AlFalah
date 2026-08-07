import { eq, desc } from "drizzle-orm";
import { db } from "../config/db.js";
import { qurbanParticipant } from "../db/schema/qurban.js";

export const qurbanService = {
  async findAll() {
    return db.select().from(qurbanParticipant).orderBy(desc(qurbanParticipant.year), desc(qurbanParticipant.createdAt));
  },

  async findById(id: string) {
    const records = await db.select().from(qurbanParticipant).where(eq(qurbanParticipant.id, id));
    return records[0];
  },

  async create(data: typeof qurbanParticipant.$inferInsert) {
    await db.insert(qurbanParticipant).values(data);
    if (!data.id) return true;
    return this.findById(data.id);
  },

  async update(id: string, data: Partial<typeof qurbanParticipant.$inferInsert>) {
    await db.update(qurbanParticipant).set(data).where(eq(qurbanParticipant.id, id));
    return this.findById(id);
  },

  async remove(id: string) {
    await db.delete(qurbanParticipant).where(eq(qurbanParticipant.id, id));
    return true;
  }
};
