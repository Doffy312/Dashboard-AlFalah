import crypto from 'crypto';
import {
  mysqlTable,
  text,
  varchar,
  timestamp,
} from "drizzle-orm/mysql-core";
import { relations } from "drizzle-orm";
import { user } from "./auth.js";

// ─── Database Jemaah ─────────────────────────────────────────────────

export const jemaah = mysqlTable("jemaah", {
  id: varchar("id", { length: 36 }).primaryKey().$defaultFn(() => crypto.randomUUID()),
  name: varchar("name", { length: 255 }).notNull(),
  address: text("address").notNull(),
  phone: varchar("phone", { length: 20 }).notNull(),
  category: text("category").notNull().default("Umum"), // 'Muzakki' | 'Mustahik' | 'Yatim' | 'Lansia' | 'Umum'
  skills: varchar("skills", { length: 255 }),
  notes: text("notes"),
  createdBy: varchar("created_by", { length: 255 }).references(() => user.id, {
    onDelete: "set null",
  }),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const jemaahRelations = relations(jemaah, ({ one }) => ({
  creator: one(user, {
    fields: [jemaah.createdBy],
    references: [user.id],
  }),
}));
