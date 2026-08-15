import crypto from "crypto";
import {
  mysqlTable,
  text,
  varchar,
  timestamp,
} from "drizzle-orm/mysql-core";

// ─── Audit Log Table ───────────────────────────────────────────────────
// Mencatat setiap aktivitas penting sistem & pengurus untuk transparansi

export const auditLog = mysqlTable("audit_log", {
  id: varchar("id", { length: 36 }).primaryKey().$defaultFn(() => crypto.randomUUID()),
  userId: varchar("user_id", { length: 36 }),
  userName: varchar("user_name", { length: 100 }).notNull().default("System"),
  userRole: varchar("user_role", { length: 50 }).notNull().default("system"),
  action: varchar("action", { length: 100 }).notNull(), // e.g. 'CREATE_TRANSACTION', 'UPDATE_PROGRAM', 'DELETE_JEMAAH', 'LOGIN_SUCCESS'
  entity: varchar("entity", { length: 50 }).notNull(),   // e.g. 'transaction', 'program', 'jemaah', 'auth'
  entityId: varchar("entity_id", { length: 100 }),
  details: text("details"),                              // Metadata JSON atau deskripsi ringkas
  ipAddress: varchar("ip_address", { length: 45 }),      // Mampu menyimpan IPv4 dan IPv6
  userAgent: varchar("user_agent", { length: 255 }),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});
