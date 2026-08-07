import crypto from "crypto";
import { eq, desc } from "drizzle-orm";
import { db } from "../config/db.js";
import { ziswafTransaction } from "../db/schema/ziswaf.js";

export const ziswafService = {
  async findAll() {
    return db.select().from(ziswafTransaction).orderBy(desc(ziswafTransaction.date), desc(ziswafTransaction.createdAt));
  },

  async findById(id: string) {
    const records = await db.select().from(ziswafTransaction).where(eq(ziswafTransaction.id, id));
    return records[0];
  },

  async create(data: typeof ziswafTransaction.$inferInsert) {
    const id = data.id || crypto.randomUUID();
    await db.insert(ziswafTransaction).values({ ...data, id });
    return this.findById(id);
  },

  async update(id: string, data: Partial<typeof ziswafTransaction.$inferInsert>) {
    await db.update(ziswafTransaction).set(data).where(eq(ziswafTransaction.id, id));
    return this.findById(id);
  },

  async remove(id: string) {
    await db.delete(ziswafTransaction).where(eq(ziswafTransaction.id, id));
    return true;
  }
};
