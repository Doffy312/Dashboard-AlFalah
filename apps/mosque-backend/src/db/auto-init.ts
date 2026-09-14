import path from "path";
import fs from "fs";
import { fileURLToPath } from "url";
import crypto from "crypto";
import { migrate } from "drizzle-orm/mysql2/migrator";
import { db } from "../config/db.js";
import { pool } from "../config/db.js";
import { auth } from "../config/auth.js";
import { transaction } from "./schema/transactions.js";
import { program } from "./schema/programs.js";
import { jemaah } from "./schema/jemaah.js";
import { inventaris } from "./schema/inventaris.js";
import { article } from "./schema/articles.js";
import { syncProgramTable } from "./sync-program-db.js";
import { programService } from "../services/programs.service.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * Safely resolves the Drizzle migrations folder across diverse execution contexts:
 * - Monorepo root cwd (Railway Railpack)
 * - Subfolder cwd (apps/mosque-backend)
 * - Development (tsx)
 * - Production (dist/index.js)
 */
export function getMigrationsFolder(): string {
  const possiblePaths = [
    path.resolve(process.cwd(), "apps/mosque-backend/drizzle"),
    path.resolve(process.cwd(), "drizzle"),
    path.resolve(__dirname, "../../drizzle"),
    path.resolve(__dirname, "../drizzle"),
  ];

  for (const p of possiblePaths) {
    if (fs.existsSync(p) && fs.existsSync(path.join(p, "meta"))) {
      return p;
    }
  }

  throw new Error(
    `Could not locate Drizzle migrations folder. Checked:\n${possiblePaths.join("\n")}`
  );
}

/**
 * Seeds initial application mock data (programs, transactions, jemaah, articles, inventaris)
 * so that both the Landing Page and Takmir Dashboard are immediately populated and functional.
 */
export async function seedInitialData() {
  const programIds = [
    crypto.randomUUID(),
    crypto.randomUUID(),
    crypto.randomUUID(),
    crypto.randomUUID(),
    crypto.randomUUID(),
  ];

  // ─── Programs ────────────────────────────────────────────────
  await db.insert(program).values([
    {
      id: programIds[0],
      name: "Kajian Akbar Akhir Tahun",
      pic: "Ust. Ahmad Zain",
      budget: "5000000",
      status: "Direncanakan",
      date: "2026-12-25",
      description: "Kajian akbar mengundang penceramah nasional. Target jemaah 1000 orang.",
      evaluation: null,
    },
    {
      id: programIds[1],
      name: "Santunan Yatim Rutin",
      pic: "Bpk. Budi Santoso",
      budget: "5000000",
      status: "Sedang Berjalan",
      date: "2026-06-20",
      description: "Pembagian sembako dan uang tunai untuk 50 anak yatim di sekitar masjid.",
      evaluation: null,
    },
    {
      id: programIds[2],
      name: "Renovasi Tempat Wudu",
      pic: "Hj. Siti",
      budget: "15000000",
      status: "Sedang Berjalan",
      date: "2026-06-15",
      description: "Perbaikan keramik dan saluran air tempat wudu pria dan wanita.",
      evaluation: null,
    },
    {
      id: programIds[3],
      name: "Peringatan Maulid Nabi",
      pic: "Ust. Hasan",
      budget: "8000000",
      status: "Selesai",
      date: "2026-02-15",
      description: "Acara peringatan maulid nabi dengan lomba tilawah tingkat anak.",
      evaluation: "Acara berjalan lancar, kehadiran jemaah melebih target (500 orang).",
    },
    {
      id: programIds[4],
      name: "TPA Sore Harian",
      pic: "Ust. Umar",
      budget: "2000000",
      status: "Sedang Berjalan",
      date: "2026-01-01",
      description: "Kegiatan belajar mengaji untuk anak-anak setiap sore hari.",
      evaluation: null,
    },
  ]);

  // ─── Transactions ────────────────────────────────────────────
  await db.insert(transaction).values([
    {
      date: "2026-06-12",
      type: "Pemasukan",
      category: "Infaq",
      amount: "4500000",
      description: "Infaq Kotak Amal Jumat (12 Juni)",
      programId: null,
    },
    {
      date: "2026-06-10",
      type: "Pengeluaran",
      category: "Pembangunan",
      amount: "8000000",
      description: "Pembelian Sound System Baru",
      programId: null,
    },
    {
      date: "2026-06-08",
      type: "Pengeluaran",
      category: "Operasional",
      amount: "1200000",
      description: "Pembayaran Tagihan Listrik Mei",
      programId: null,
    },
    {
      date: "2026-06-05",
      type: "Pemasukan",
      category: "Wakaf",
      amount: "10000000",
      description: "Wakaf Tunai dari Hamba Allah",
      programId: null,
    },
    {
      date: "2026-06-02",
      type: "Pengeluaran",
      category: "Operasional",
      amount: "800000",
      description: "Insentif Petugas Kebersihan",
      programId: null,
    },
    {
      date: "2026-05-28",
      type: "Pemasukan",
      category: "Infaq",
      amount: "3800000",
      description: "Infaq Kotak Amal Jumat (28 Mei)",
      programId: null,
    },
    {
      date: "2026-05-20",
      type: "Pengeluaran",
      category: "Sosial",
      amount: "5000000",
      description: "Santunan Anak Yatim Rutin",
      programId: programIds[1],
    },
    {
      date: "2026-05-15",
      type: "Pemasukan",
      category: "Zakat",
      amount: "15000000",
      description: "Zakat Maal Bapak H. Ahmad",
      programId: null,
    },
  ]);

  // ─── Jemaah ──────────────────────────────────────────────────
  await db.insert(jemaah).values([
    {
      name: "Bapak H. Ahmad",
      address: "Jl. Merdeka No. 12",
      phone: "081234567890",
      category: "Muzakki",
      skills: "Pengusaha, Manajemen",
      notes: "Donatur tetap yatim piatu",
    },
    {
      name: "Ibu Siti Aminah",
      address: "Jl. Mawar Raya Blok C2",
      phone: "085612345678",
      category: "Mustahik",
      skills: "Memasak",
      notes: "Penerima bantuan sembako rutin",
    },
    {
      name: "Budi Santoso",
      address: "Perumahan Indah Asri No. 45",
      phone: "087812345678",
      category: "Umum",
      skills: "Desain Grafis, IT",
      notes: "Sering membantu publikasi masjid",
    },
    {
      name: "Hj. Fatimah",
      address: "Jl. Kenanga Indah No. 3",
      phone: "082112345678",
      category: "Lansia",
      skills: null,
      notes: "Perlu transportasi antar-jemput kajian",
    },
    {
      name: "Rudi Hermawan",
      address: "Gg. Swadaya RT 03/04",
      phone: "089612345678",
      category: "Yatim",
      skills: "Pramuka, Olahraga",
      notes: "Peserta TPA, usia 12 tahun",
    },
  ]);

  // ─── Inventaris ──────────────────────────────────────────────
  await db.insert(inventaris).values([
    {
      name: "Karpet Sajadah Utama",
      quantity: 50,
      date: "2025-01-10",
      location: "Ruang Utama",
      condition: "Baik",
      notes: "Roll panjang, warna hijau",
    },
    {
      name: "AC Daikin 2PK",
      quantity: 6,
      date: "2025-03-15",
      location: "Ruang Utama",
      condition: "Baik",
      notes: "Service berkala 3 bulan sekali",
    },
    {
      name: "Sound System (Speaker)",
      quantity: 4,
      date: "2023-11-20",
      location: "Gudang",
      condition: "Rusak Ringan",
      notes: "Satu speaker sember, butuh servis",
    },
    {
      name: "Mimbar Kayu Jati",
      quantity: 1,
      date: "2020-05-12",
      location: "Ruang Utama",
      condition: "Baik",
      notes: "Wakaf dari keluarga H. Soleh",
    },
    {
      name: "Kursi Lipat Jamaah",
      quantity: 20,
      date: "2024-08-05",
      location: "Gudang",
      condition: "Baik",
      notes: "Untuk jamaah lansia",
    },
  ]);

  // ─── Articles & News ─────────────────────────────────────────
  await db.insert(article).values([
    {
      id: "news-01",
      category: "Kegiatan Terlaksana",
      type: "terlaksana",
      title: "Dokumentasi Laporan: Pelaksanaan Kajian Akbar & Doa Bersama Sambut Bulan Suci",
      date: "2026-07-25",
      author: "Humas Masjid Al-Falah",
      readTime: "4 min baca",
      image: "https://images.unsplash.com/photo-1542810634-71277d95dcbb?q=80&w=800&auto=format&fit=crop",
      summary: "Alhamdulillah, pelaksanaan Kajian Akbar yang dihadiri lebih dari 300 jemaah berlangsung khidmat dengan ceramah kebangsaan & santunan infaq.",
      content: `Alhamdulillah, Takmir Masjid Al-Falah telah sukses menyelenggarakan acara Kajian Akbar & Doa Bersama. Acara ini dihadiri oleh lebih dari 300 jemaah. Seluruh dana infaq keliling yang terkumpul selama kajian langsung dimasukkan ke dalam saldo kas terbuka masjid.`,
    },
    {
      id: "news-02",
      category: "Kegiatan Terlaksana",
      type: "terlaksana",
      title: "Penyaluran Santunan Yatim & Paket Sembako Bagi 50 Keluarga Dhuafa",
      date: "2026-07-18",
      author: "Sie Sosial & Ziswaf",
      readTime: "3 min baca",
      image: "https://images.unsplash.com/photo-1593113598332-cd288d649433?q=80&w=800&auto=format&fit=crop",
      summary: "Tim Ziswaf Masjid Al-Falah menyalurkan bantuan perlengkapan sekolah dan santunan tunai kepada anak yatim dan keluarga kurang mampu.",
      content: `Sebagai wujud akuntabilitas dan penyaluran amanah donatur, Takmir Masjid Al-Falah melalui Sie Sosial & Ziswaf telah melaksanakan program Santunan Yatim & Pembagian Paket Sembako.`,
    },
    {
      id: "news-03",
      category: "Artikel & Edukasi",
      type: "edukasi",
      title: "Wisuda Tahfiz & Generasi Qur'ani: Melahirkan 30 Hafiz Muda Berprestasi",
      date: "2026-07-10",
      author: "Ust. Ahmad Hidayat (Madrasah Al-Falah)",
      readTime: "5 min baca",
      image: "https://images.unsplash.com/photo-1584286595398-a59f21d313f5?q=80&w=800&auto=format&fit=crop",
      summary: "Program Rumah Tahfiz Al-Falah meluluskan 30 santri muda yang berhasil menuntaskan hafalan Al-Qur'an mulai 5 juz hingga 30 juz.",
      content: `Pendidikan Al-Qur'an merupakan salah satu pilar utama pelayanan di Masjid Al-Falah. Rumah Tahfiz Al-Falah berhasil mengantarkan 30 santri muda dalam Wisuda Tahfiz Kelulusan 2026.`,
    },
  ]);
}

/**
 * Main Auto-Init orchestrator:
 * 1. Executes Drizzle migrations (safe & idempotent)
 * 2. Checks and creates default admin user if none exists
 * 3. Checks and seeds initial data if database is brand new
 * 4. Syncs table schema columns
 * 5. Syncs completed programs status
 */
export async function autoInitDatabase() {
  console.log("🔄 [Auto-Init] Starting database schema & data initialization...");

  try {
    const migrationsFolder = getMigrationsFolder();
    console.log(`📦 [Auto-Init] Applying migrations from: ${migrationsFolder}`);
    await migrate(db, { migrationsFolder });
    console.log("✅ [Auto-Init] Drizzle migrations applied successfully.");
  } catch (error) {
    console.error("⚠️ [Auto-Init] Migration step encountered a notice/error:", error);
  }

  // Check and seed default admin user
  try {
    const connection = await pool.getConnection();
    try {
      const [users]: any = await connection.query("SELECT id, email FROM `user` LIMIT 1");
      if (!users || users.length === 0) {
        console.log("🌱 [Auto-Init] No users found. Creating default admin user...");
        await auth.api.signUpEmail({
          body: {
            email: "admin_alfalah@example.com",
            password: "password123",
            name: "Admin Al-Falah",
            role: "Ketua",
          },
        });
        console.log("✅ [Auto-Init] Default admin user created: admin_alfalah@example.com / password123");
      } else {
        console.log("✅ [Auto-Init] Admin user exists in database.");
      }

      // Check if programs or transactions need initial seed
      const [programs]: any = await connection.query("SELECT id FROM `programs` LIMIT 1");
      if (!programs || programs.length === 0) {
        console.log("🌱 [Auto-Init] Database is empty. Seeding initial data for Landing Page & Dashboard...");
        await seedInitialData();
        console.log("✅ [Auto-Init] Initial mock data seeded successfully.");
      } else {
        console.log("✅ [Auto-Init] Application data exists.");
      }
    } finally {
      connection.release();
    }
  } catch (err) {
    console.error("⚠️ [Auto-Init] User/Data check encountered error:", err);
  }

  // Schema adjustments & completed programs status sync
  try {
    await syncProgramTable();
    await programService.syncAllCompletedPrograms();
    console.log("✅ [Auto-Init] Program schema & status sync completed.");
  } catch (err) {
    console.error("⚠️ [Auto-Init] Program sync notice:", err);
  }

  console.log("🎉 [Auto-Init] Database ready!");
}
