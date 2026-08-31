import { drizzle } from "drizzle-orm/mysql2";
import mysql from "mysql2/promise";
import { env } from "./env.js";
import * as schema from "../db/schema/index.js";

export const pool = mysql.createPool({
  uri: env.DATABASE_URL,
  connectionLimit: 25, // Kapasitas 25 koneksi paralel (meningkat dari default 10)
  waitForConnections: true,
  queueLimit: 0, // Antrean query tak terbatas saat traffic spike
  enableKeepAlive: true,
  keepAliveInitialDelay: 10000, // Ping koneksi setiap 10 detik agar koneksi DB tidak idle drop
  connectTimeout: 20000,
});

export const db = drizzle(pool, { schema, mode: "default" });
