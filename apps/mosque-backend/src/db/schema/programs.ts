import crypto from 'crypto';
import {
  mysqlTable,
  date,
  text,
  varchar,
  decimal,
  timestamp,
  json,
  index,
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
  status: varchar("status", { length: 50 }).notNull().default("Direncanakan"), // 'Direncanakan' | 'Sedang Berjalan' | 'Selesai'
  date: date("date", { mode: "string" }).notNull(),
  originalDate: date("original_date", { mode: "string" }), // Stores initial planned date; null for legacy data
  description: text("description").notNull(),
  evaluation: text("evaluation"), // Only filled when status = 'Selesai'
  reportDocUrl: text("report_doc_url"),
  documentationUrls: json("documentation_urls"),
  createdBy: varchar("created_by", { length: 255 }).references(() => user.id, {
    onDelete: "set null",
  }),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
}, (table) => ({
  statusIdx: index("status_idx").on(table.status),
  dateIdx: index("date_idx").on(table.date),
}));

export const programRelations = relations(program, ({ one, many }) => ({
  creator: one(user, {
    fields: [program.createdBy],
    references: [user.id],
  }),
  transactions: many(transaction),
}));
