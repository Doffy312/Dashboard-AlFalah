import crypto from 'crypto';
import {
  mysqlTable,
  varchar,
  text,
  timestamp,
  index,
  int,
} from "drizzle-orm/mysql-core";

export const qurbanParticipant = mysqlTable("qurban_participants", {
  id: varchar("id", { length: 36 }).primaryKey().$defaultFn(() => crypto.randomUUID()),
  year: int("year").notNull(),
  animalType: varchar("animal_type", { length: 50 }).notNull(), // 'Sapi', 'Kambing', 'Domba'
  participantName: varchar("participant_name", { length: 255 }).notNull(),
  status: varchar("status", { length: 50 }).notNull().default('Lunas'), // 'Lunas', 'Belum Lunas'
  notes: text("notes"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
}, (table) => ({
  yearIdx: index("qurban_year_idx").on(table.year),
}));
