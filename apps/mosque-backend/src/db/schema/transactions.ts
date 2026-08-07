import crypto from 'crypto';
import {
  mysqlTable,
  date,
  text,
  varchar,
  decimal,
  timestamp,
  index,
} from "drizzle-orm/mysql-core";
import { relations } from "drizzle-orm";
import { user } from "./auth.js";
import { program } from "./programs.js";

// ─── Transactions (Arus Kas / Keuangan) ──────────────────────────────

export const transaction = mysqlTable("transactions", {
  id: varchar("id", { length: 36 }).primaryKey().$defaultFn(() => crypto.randomUUID()),
  date: date("date", { mode: "string" }).notNull(),
  type: varchar("type", { length: 50 }).notNull(), // 'Pemasukan' | 'Pengeluaran'
  category: varchar("category", { length: 50 }).notNull(),
  amount: decimal("amount", { precision: 15, scale: 2 }).notNull(),
  description: text("description").notNull(),
  programId: varchar("program_id", { length: 36 }).references(() => program.id, {
    onDelete: "set null",
  }),
  createdBy: varchar("created_by", { length: 255 }).references(() => user.id, {
    onDelete: "set null",
  }),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
}, (table) => ({
  dateIdx: index("date_idx").on(table.date),
  typeIdx: index("type_idx").on(table.type),
  categoryIdx: index("category_idx").on(table.category),
}));

export const transactionRelations = relations(transaction, ({ one }) => ({
  program: one(program, {
    fields: [transaction.programId],
    references: [program.id],
  }),
  creator: one(user, {
    fields: [transaction.createdBy],
    references: [user.id],
  }),
}));
