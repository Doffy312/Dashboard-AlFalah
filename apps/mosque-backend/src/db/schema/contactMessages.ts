import crypto from 'crypto';
import {
  mysqlTable,
  text,
  varchar,
  timestamp,
  index,
} from "drizzle-orm/mysql-core";

// ─── Contact Messages (Pesan Masuk Landing Page) ──────────────────────

export const contactMessages = mysqlTable("contact_messages", {
  id: varchar("id", { length: 36 }).primaryKey().$defaultFn(() => crypto.randomUUID()),
  fullName: varchar("full_name", { length: 255 }).notNull(),
  email: varchar("email", { length: 255 }).notNull(),
  whatsapp: varchar("whatsapp", { length: 50 }).notNull(),
  subject: varchar("subject", { length: 255 }).notNull(),
  message: text("message").notNull(),
  status: varchar("status", { length: 50 }).notNull().default("Baru"), // 'Baru' | 'Dibaca' | 'Selesai'
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow().onUpdateNow(),
}, (table) => ({
  statusIdx: index("contact_status_idx").on(table.status),
  createdAtIdx: index("contact_created_at_idx").on(table.createdAt),
}));
