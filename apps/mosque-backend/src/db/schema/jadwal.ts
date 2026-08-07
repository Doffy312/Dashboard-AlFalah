import crypto from 'crypto';
import {
  mysqlTable,
  date,
  varchar,
  text,
  timestamp,
  index,
} from "drizzle-orm/mysql-core";

export const jadwalPetugas = mysqlTable("jadwal_petugas", {
  id: varchar("id", { length: 36 }).primaryKey().$defaultFn(() => crypto.randomUUID()),
  date: date("date", { mode: "string" }).notNull(),
  role: varchar("role", { length: 50 }).notNull(), // 'Khotib Jumat', 'Imam Rawatib', 'Muadzin'
  personName: varchar("person_name", { length: 255 }).notNull(),
  contact: varchar("contact", { length: 100 }),
  topic: text("topic"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
}, (table) => ({
  dateIdx: index("jadwal_date_idx").on(table.date),
  roleIdx: index("jadwal_role_idx").on(table.role),
}));
