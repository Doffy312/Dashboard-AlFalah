import { describe, it, expect, beforeAll, afterAll } from "vitest";
import { db, pool } from "../config/db.js";
import * as schema from "../db/schema/index.js";
import { eq, sql } from "drizzle-orm";
import crypto from "crypto";

describe("Database & Drizzle ORM Integration Tests", () => {
  const testRunId = crypto.randomUUID().slice(0, 8);
  let testUserId: string | null = null;
  let testJemaahId: string | null = null;
  let testTransactionId: string | null = null;
  let testProgramId: string | null = null;

  beforeAll(async () => {
    // Pastikan koneksi pool database aktif
    const [rows]: any = await pool.query("SELECT 1 AS connected");
    expect(rows[0].connected).toBe(1);

    // Ambil atau buat user referensi untuk foreign key
    const existingUser = await db.query.user.findFirst();
    if (existingUser) {
      testUserId = existingUser.id;
    }
  });

  afterAll(async () => {
    // Bersihkan data tes jika masih ada
    if (testTransactionId) {
      await db.delete(schema.transaction).where(eq(schema.transaction.id, testTransactionId)).catch(() => {});
    }
    if (testProgramId) {
      await db.delete(schema.program).where(eq(schema.program.id, testProgramId)).catch(() => {});
    }
    if (testJemaahId) {
      await db.delete(schema.jemaah).where(eq(schema.jemaah.id, testJemaahId)).catch(() => {});
    }
  });

  it("1. Harus berhasil terhubung ke MySQL connection pool dan merespon query sederhana", async () => {
    const connection = await pool.getConnection();
    try {
      const [result]: any = await connection.query("SELECT DATABASE() as db_name, VERSION() as db_version");
      expect(result).toBeDefined();
      expect(result[0].db_name).toBe("mosque_dashboard");
      expect(typeof result[0].db_version).toBe("string");
    } finally {
      connection.release();
    }
  });

  it("2. Harus memverifikasi keberadaan seluruh tabel utama skema database", async () => {
    const [tablesResult]: any = await pool.query("SHOW TABLES");
    const tableNames = tablesResult.map((row: any) => Object.values(row)[0]);

    const expectedTables = [
      "user",
      "session",
      "account",
      "verification",
      "transactions",
      "programs",
      "jemaah",
      "inventaris",
      "notification",
      "ziswaf_transactions",
      "qurban_tahun",
      "qurban_kelompok",
      "pequrban",
      "jadwal_petugas",
      "settings",
      "articles",
      "contact_messages",
      "audit_log",
    ];

    for (const expected of expectedTables) {
      expect(tableNames).toContain(expected);
    }
  });

  it("3. Harus mampu melakukan operasi CRUD pada tabel Jemaah dengan Foreign Key User", async () => {
    testJemaahId = `test-jemaah-${testRunId}`;
    const newJemaah = {
      id: testJemaahId,
      name: `Jemaah Test ${testRunId}`,
      address: "Jl. Masjid Al-Falah No. 123",
      phone: "081234567890",
      category: "Dewasa",
      skills: "IT, Audio Visual",
      notes: "Catatan pengujian database integrasi",
      email: `jemaah-${testRunId}@example.com`,
      createdBy: testUserId,
    };

    // CREATE
    await db.insert(schema.jemaah).values(newJemaah);

    // READ
    const fetched = await db.query.jemaah.findFirst({
      where: eq(schema.jemaah.id, testJemaahId),
    });
    expect(fetched).toBeDefined();
    expect(fetched?.name).toBe(newJemaah.name);
    expect(fetched?.phone).toBe(newJemaah.phone);
    expect(fetched?.category).toBe(newJemaah.category);

    // UPDATE
    await db
      .update(schema.jemaah)
      .set({ notes: "Catatan telah diperbarui oleh automated test", category: "Lansia" })
      .where(eq(schema.jemaah.id, testJemaahId));

    const updated = await db.query.jemaah.findFirst({
      where: eq(schema.jemaah.id, testJemaahId),
    });
    expect(updated?.notes).toBe("Catatan telah diperbarui oleh automated test");
    expect(updated?.category).toBe("Lansia");

    // DELETE
    await db.delete(schema.jemaah).where(eq(schema.jemaah.id, testJemaahId));
    const deleted = await db.query.jemaah.findFirst({
      where: eq(schema.jemaah.id, testJemaahId),
    });
    expect(deleted).toBeUndefined();
    testJemaahId = null;
  });

  it("4. Harus mampu menyimpan dan menghitung transaksi keuangan dengan presisi Decimal", async () => {
    testTransactionId = `test-trx-${testRunId}`;
    const amountVal = "1500750.50";

    // CREATE
    await db.insert(schema.transaction).values({
      id: testTransactionId,
      date: new Date().toISOString().split("T")[0],
      type: "Pemasukan",
      category: "Infaq Jumat",
      amount: amountVal,
      description: `Infaq pengujian database test ${testRunId}`,
      createdBy: testUserId,
    });

    // READ & VALIDATE DECIMAL PRECISION
    const trx = await db.query.transaction.findFirst({
      where: eq(schema.transaction.id, testTransactionId),
    });
    expect(trx).toBeDefined();
    expect(trx?.type).toBe("Pemasukan");
    expect(parseFloat(trx?.amount || "0")).toBe(1500750.5);

    // CLEANUP
    await db.delete(schema.transaction).where(eq(schema.transaction.id, testTransactionId));
    testTransactionId = null;
  });

  it("5. Harus mampu mengelola siklus status Program Kerja (Direncanakan -> Selesai)", async () => {
    testProgramId = `test-prog-${testRunId}`;

    // CREATE
    await db.insert(schema.program).values({
      id: testProgramId,
      name: `Kajian Spesial DB Test ${testRunId}`,
      pic: "Ustadz Test",
      budget: "5000000.00",
      status: "Direncanakan",
      date: new Date().toISOString().split("T")[0],
      description: "Program uji siklus status database",
      createdBy: testUserId,
    });

    let prog = await db.query.program.findFirst({
      where: eq(schema.program.id, testProgramId),
    });
    expect(prog?.status).toBe("Direncanakan");

    // UPDATE STATUS TO 'Sedang Berjalan'
    await db
      .update(schema.program)
      .set({ status: "Sedang Berjalan" })
      .where(eq(schema.program.id, testProgramId));

    prog = await db.query.program.findFirst({
      where: eq(schema.program.id, testProgramId),
    });
    expect(prog?.status).toBe("Sedang Berjalan");

    // UPDATE STATUS TO 'Selesai' DENGAN EVALUASI
    await db
      .update(schema.program)
      .set({
        status: "Selesai",
        evaluation: "Kajian berlangsung sukses dengan kehadiran 150 jemaah",
      })
      .where(eq(schema.program.id, testProgramId));

    prog = await db.query.program.findFirst({
      where: eq(schema.program.id, testProgramId),
    });
    expect(prog?.status).toBe("Selesai");
    expect(prog?.evaluation).toContain("berlangsung sukses");

    // CLEANUP
    await db.delete(schema.program).where(eq(schema.program.id, testProgramId));
    testProgramId = null;
  });

  it("6. Harus memvalidasi rollback transaksi database (ACID atomicity) saat terjadi exception", async () => {
    const rollbackTestId = `rb-test-${testRunId}`;

    let rollbackErrorThrown = false;
    try {
      await db.transaction(async (tx) => {
        // Operasi 1: Insert setting sementara
        await tx.insert(schema.setting).values({
          key: rollbackTestId,
          value: "temporary_value_should_be_rolled_back",
        });

        // Operasi 2: Sengaja lempar error untuk memicu rollback
        throw new Error("SIMULATED_TRANSACTION_FAILURE");
      });
    } catch (err: any) {
      if (err.message === "SIMULATED_TRANSACTION_FAILURE") {
        rollbackErrorThrown = true;
      }
    }

    expect(rollbackErrorThrown).toBe(true);

    // Verifikasi bahwa data Operasi 1 TIDAK tersimpan (telah di-rollback)
    const record = await db.query.setting.findFirst({
      where: eq(schema.setting.key, rollbackTestId),
    });
    expect(record).toBeUndefined();
  });
});
