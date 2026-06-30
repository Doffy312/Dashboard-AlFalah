import { db } from "../config/db.js";
import { transaction } from "./schema/transactions.js";
import { program } from "./schema/programs.js";
import { jemaah } from "./schema/jemaah.js";
import { inventaris } from "./schema/inventaris.js";

/**
 * Seed script — populates the database with the same mock data
 * used in the frontend for immediate testing.
 */
async function seed() {
  console.log("🌱 Seeding database...");

  // ─── Programs ────────────────────────────────────────────────
  console.log("  → Seeding programs...");
  const programs = await db
    .insert(program)
    .values([
      {
        name: "Kajian Akbar Akhir Tahun",
        pic: "Ust. Ahmad Zain",
        budget: "5000000",
        status: "Direncanakan",
        date: "2026-12-25",
        description:
          "Kajian akbar mengundang penceramah nasional. Target jemaah 1000 orang.",
        evaluation: null,
      },
      {
        name: "Santunan Yatim Rutin",
        pic: "Bpk. Budi Santoso",
        budget: "5000000",
        status: "Sedang Berjalan",
        date: "2026-06-20",
        description:
          "Pembagian sembako dan uang tunai untuk 50 anak yatim di sekitar masjid.",
        evaluation: null,
      },
      {
        name: "Renovasi Tempat Wudu",
        pic: "Hj. Siti",
        budget: "15000000",
        status: "Sedang Berjalan",
        date: "2026-06-15",
        description:
          "Perbaikan keramik dan saluran air tempat wudu pria dan wanita.",
        evaluation: null,
      },
      {
        name: "Peringatan Maulid Nabi",
        pic: "Ust. Hasan",
        budget: "8000000",
        status: "Selesai",
        date: "2026-02-15",
        description:
          "Acara peringatan maulid nabi dengan lomba tilawah tingkat anak.",
        evaluation:
          "Acara berjalan lancar, kehadiran jemaah melebih target (500 orang).",
      },
      {
        name: "TPA Sore Harian",
        pic: "Ust. Umar",
        budget: "2000000",
        status: "Sedang Berjalan",
        date: "2026-01-01",
        description:
          "Kegiatan belajar mengaji untuk anak-anak setiap sore hari.",
        evaluation: null,
      },
    ])
    .returning();

  // ─── Transactions ────────────────────────────────────────────
  console.log("  → Seeding transactions...");
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
      programId: programs[1]?.id ?? null, // Link to Santunan Yatim Rutin
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
  console.log("  → Seeding jemaah...");
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
  console.log("  → Seeding inventaris...");
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
      condition: "Rusak Berat",
      notes: "Sebagian patah, perlu diganti baru",
    },
  ]);

  console.log("✅ Seed completed successfully!");
  process.exit(0);
}

seed().catch((err) => {
  console.error("❌ Seed failed:", err);
  process.exit(1);
});
