import { mysqlTable, varchar, longtext, timestamp } from "drizzle-orm/mysql-core";

export const article = mysqlTable("articles", {
  id: varchar("id", { length: 36 }).primaryKey(),
  title: varchar("title", { length: 255 }).notNull(),
  category: varchar("category", { length: 100 }).notNull(),
  type: varchar("type", { length: 50 }).notNull().default("terlaksana"),
  date: varchar("date", { length: 20 }).notNull(),
  author: varchar("author", { length: 150 }).notNull(),
  readTime: varchar("read_time", { length: 50 }).notNull().default("3 min baca"),
  image: longtext("image").notNull(),
  summary: longtext("summary").notNull(),
  content: longtext("content").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow().onUpdateNow(),
});

