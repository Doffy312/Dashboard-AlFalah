import crypto from 'crypto';
import {
  mysqlTable,
  text,
  varchar,
  timestamp,
  boolean,
} from "drizzle-orm/mysql-core";

// ─── Database Notifications ──────────────────────────────────────────

export const notification = mysqlTable("notification", {
  id: varchar("id", { length: 36 }).primaryKey().$defaultFn(() => crypto.randomUUID()),
  type: varchar("type", { length: 50 }).notNull(), // 'Keuangan' | 'Kegiatan' | 'Inventaris'
  title: varchar("title", { length: 255 }).notNull(),
  description: text("description").notNull(),
  isRead: boolean("is_read").notNull().default(false),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});
