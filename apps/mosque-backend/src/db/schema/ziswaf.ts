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

export const ziswafTransaction = mysqlTable("ziswaf_transactions", {
  id: varchar("id", { length: 36 }).primaryKey().$defaultFn(() => crypto.randomUUID()),
  date: date("date", { mode: "string" }).notNull(),
  type: varchar("type", { length: 50 }).notNull(), // 'Zakat Fitrah', 'Zakat Mal', 'Infaq', 'Sedekah', 'Wakaf'
  donorName: varchar("donor_name", { length: 255 }).notNull(),
  amount: decimal("amount", { precision: 15, scale: 2 }).notNull(),
  description: text("description"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
}, (table) => ({
  dateIdx: index("ziswaf_date_idx").on(table.date),
  typeIdx: index("ziswaf_type_idx").on(table.type),
}));
