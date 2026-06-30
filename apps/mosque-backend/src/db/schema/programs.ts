import crypto from 'crypto';
import {
  mysqlTable,
  date,
  text,
  varchar,
  decimal,
  timestamp,
} from "drizzle-orm/mysql-core";
import { relations } from "drizzle-orm";
import { user } from "./auth.js";
import { transaction } from "./transactions.js";

// ─── Program Kerja ───────────────────────────────────────────────────

export const program = mysqlTable("programs", {
  id: varchar("id", { length: 36 }).primaryKey().$defaultFn(() => crypto.randomUUID()),
  name: varchar("name", { length: 255 }).notNull(),
  pic: varchar("pic", { length: 255 }).notNull(), // Person In Charge
  budget: decimal("budget", { precision: 15, scale: 2 }).notNull(),
  status: text("status").notNull().default("Direncanakan"), // 'Direncanakan' | 'Sedang Berjalan' | 'Selesai'
  date: date("date", { mode: "string" }).notNull(),
  description: text("description").notNull(),
  evaluation: text("evaluation"), // Only filled when status = 'Selesai'
  createdBy: varchar("created_by", { length: 255 }).references(() => user.id, {
    onDelete: "set null",
  }),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const programRelations = relations(program, ({ one, many }) => ({
  creator: one(user, {
    fields: [program.createdBy],
    references: [user.id],
  }),
  transactions: many(transaction),
}));
