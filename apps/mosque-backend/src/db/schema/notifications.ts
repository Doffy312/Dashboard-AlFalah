import crypto from 'crypto';
import {
  mysqlTable,
  text,
  varchar,
  timestamp,
  boolean,
  index,
} from "drizzle-orm/mysql-core";

// ─── Database Notifications ──────────────────────────────────────────

export const notification = mysqlTable("notification", {
  id: varchar("id", { length: 36 }).primaryKey().$defaultFn(() => crypto.randomUUID()),
  type: varchar("type", { length: 50 }).notNull(), // 'Keuangan' | 'Kegiatan' | 'Inventaris'
  title: varchar("title", { length: 255 }).notNull(),
  description: text("description").notNull(),
  isRead: boolean("is_read").notNull().default(false),
  createdAt: timestamp("created_at").notNull().defaultNow(),
}, (table) => ({
  isReadIdx: index("notif_is_read_idx").on(table.isRead),
  createdAtIdx: index("notif_created_at_idx").on(table.createdAt),
  typeIdx: index("notif_type_idx").on(table.type),
}));
