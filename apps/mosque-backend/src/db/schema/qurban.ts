import crypto from 'crypto';
import {
  mysqlTable,
  varchar,
  text,
  timestamp,
  index,
  int,
  boolean,
} from "drizzle-orm/mysql-core";
import { relations } from "drizzle-orm";
import { jemaah } from "./jemaah.js";

// ─── 1. Qurban Tahun ──────────────────────────────────────────────────────────
export const qurbanTahun = mysqlTable("qurban_tahun", {
  id: varchar("id", { length: 36 }).primaryKey().$defaultFn(() => crypto.randomUUID()),
  tahun: int("tahun").notNull().unique(),
  statusAktif: boolean("status_aktif").notNull().default(true),
  createdAt: timestamp("created_at").notNull().defaultNow(),
}, (table) => ({
  tahunIdx: index("qurban_tahun_idx").on(table.tahun),
}));

// ─── 2. Qurban Kelompok ───────────────────────────────────────────────────────
export const qurbanKelompok = mysqlTable("qurban_kelompok", {
  id: varchar("id", { length: 36 }).primaryKey().$defaultFn(() => crypto.randomUUID()),
  qurbanTahunId: varchar("qurban_tahun_id", { length: 36 }).notNull().references(() => qurbanTahun.id, {
    onDelete: "cascade",
  }),
  namaKelompok: varchar("nama_kelompok", { length: 100 }).notNull(),
  jenisHewan: varchar("jenis_hewan", { length: 20 }).notNull().default('Sapi'), // 'Sapi', 'Kambing'
  nomorUrut: int("nomor_urut").notNull().default(1),
  createdAt: timestamp("created_at").notNull().defaultNow(),
}, (table) => ({
  tahunIdIdx: index("kelompok_tahun_id_idx").on(table.qurbanTahunId),
}));

// ─── 3. PeQurban ─────────────────────────────────────────────────────────────
export const pequrban = mysqlTable("pequrban", {
  id: varchar("id", { length: 36 }).primaryKey().$defaultFn(() => crypto.randomUUID()),
  jemaahId: varchar("jemaah_id", { length: 36 }).notNull().references(() => jemaah.id, {
    onDelete: "cascade",
  }),
  qurbanTahunId: varchar("qurban_tahun_id", { length: 36 }).notNull().references(() => qurbanTahun.id, {
    onDelete: "cascade",
  }),
  qurbanKelompokId: varchar("qurban_kelompok_id", { length: 36 }).references(() => qurbanKelompok.id, {
    onDelete: "set null",
  }),
  jenisHewan: varchar("jenis_hewan", { length: 20 }).notNull().default('Sapi'), // 'Sapi', 'Kambing'
  status: varchar("status", { length: 20 }).notNull().default('Proses'), // 'Proses', 'Lunas', 'Selesai'
  catatan: text("catatan"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
}, (table) => ({
  jemaahIdx: index("pequrban_jemaah_idx").on(table.jemaahId),
  tahunIdx: index("pequrban_tahun_idx").on(table.qurbanTahunId),
  kelompokIdx: index("pequrban_kelompok_idx").on(table.qurbanKelompokId),
}));

// ─── Relations ──────────────────────────────────────────────────────────────
export const qurbanTahunRelations = relations(qurbanTahun, ({ many }) => ({
  kelompokList: many(qurbanKelompok),
  pequrbanList: many(pequrban),
}));

export const qurbanKelompokRelations = relations(qurbanKelompok, ({ one, many }) => ({
  tahun: one(qurbanTahun, {
    fields: [qurbanKelompok.qurbanTahunId],
    references: [qurbanTahun.id],
  }),
  pequrbanList: many(pequrban),
}));

export const pequrbanRelations = relations(pequrban, ({ one }) => ({
  jemaah: one(jemaah, {
    fields: [pequrban.jemaahId],
    references: [jemaah.id],
  }),
  tahun: one(qurbanTahun, {
    fields: [pequrban.qurbanTahunId],
    references: [qurbanTahun.id],
  }),
  kelompok: one(qurbanKelompok, {
    fields: [pequrban.qurbanKelompokId],
    references: [qurbanKelompok.id],
  }),
}));
