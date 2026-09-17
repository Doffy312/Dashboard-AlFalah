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
import { transaction } from "./transactions.js";

export const ziswafTransaction = mysqlTable("ziswaf_transactions", {
  id: varchar("id", { length: 36 }).primaryKey().$defaultFn(() => crypto.randomUUID()),
  date: date("date", { mode: "string" }).notNull(),
  type: varchar("type", { length: 50 }).notNull(), // 'Zakat Fitrah', 'Zakat Mal', 'Infaq', 'Sedekah', 'Wakaf'
  donorName: varchar("donor_name", { length: 255 }).notNull(),
  amount: decimal("amount", { precision: 15, scale: 2 }).notNull(),
  status: varchar("status", { length: 20 }).notNull().default("verified"), // 'pending', 'verified', 'rejected'
  transactionId: varchar("transaction_id", { length: 36 }).references(() => transaction.id, {
    onDelete: "set null",
  }),
  verifiedBy: varchar("verified_by", { length: 255 }).references(() => user.id, {
    onDelete: "set null",
  }),
  verifiedAt: timestamp("verified_at"),
  rejectionReason: text("rejection_reason"),
  description: text("description"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
}, (table) => ({
  dateIdx: index("ziswaf_date_idx").on(table.date),
  typeIdx: index("ziswaf_type_idx").on(table.type),
  statusIdx: index("ziswaf_status_idx").on(table.status),
  createdAtIdx: index("ziswaf_created_at_idx").on(table.createdAt),
}));

export const ziswafTransactionRelations = relations(ziswafTransaction, ({ one }) => ({
  transaction: one(transaction, {
    fields: [ziswafTransaction.transactionId],
    references: [transaction.id],
  }),
  verifier: one(user, {
    fields: [ziswafTransaction.verifiedBy],
    references: [user.id],
  }),
}));

