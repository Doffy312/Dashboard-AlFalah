import crypto from 'crypto';
import {
  mysqlTable,
  date,
  text,
  varchar,
  int,
  timestamp,
  index,
} from "drizzle-orm/mysql-core";
import { relations } from "drizzle-orm";
import { user } from "./auth.js";

// ─── Inventaris Masjid ───────────────────────────────────────────────

export const inventaris = mysqlTable("inventaris", {
  id: varchar("id", { length: 36 }).primaryKey().$defaultFn(() => crypto.randomUUID()),
  name: varchar("name", { length: 255 }).notNull(),
  quantity: int("quantity").notNull(),
  date: date("date", { mode: "string" }).notNull(), // Acquisition date
  location: varchar("location", { length: 100 }).notNull(),
  condition: text("condition").notNull().default("Baik"), // 'Baik' | 'Rusak Ringan' | 'Rusak Berat'
  notes: text("notes"),
  createdBy: varchar("created_by", { length: 255 }).references(() => user.id, {
    onDelete: "set null",
  }),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
}, (table) => ({
  nameIdx: index("inventaris_name_idx").on(table.name),
  dateIdx: index("inventaris_date_idx").on(table.date),
  locationIdx: index("inventaris_location_idx").on(table.location),
  createdAtIdx: index("inventaris_created_at_idx").on(table.createdAt),
}));

export const inventarisRelations = relations(inventaris, ({ one }) => ({
  creator: one(user, {
    fields: [inventaris.createdBy],
    references: [user.id],
  }),
}));
