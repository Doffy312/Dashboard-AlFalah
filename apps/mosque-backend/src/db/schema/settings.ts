import crypto from 'crypto';
import {
  mysqlTable,
  varchar,
  json,
  timestamp,
  uniqueIndex,
} from "drizzle-orm/mysql-core";

export const setting = mysqlTable("settings", {
  id: varchar("id", { length: 36 }).primaryKey().$defaultFn(() => crypto.randomUUID()),
  key: varchar("key", { length: 100 }).notNull(),
  value: json("value").notNull(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
}, (table) => ({
  keyIdx: uniqueIndex("settings_key_idx").on(table.key),
}));
