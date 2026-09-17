import crypto from "crypto";
import { eq, desc, and } from "drizzle-orm";
import { db } from "../config/db.js";
import { ziswafTransaction } from "../db/schema/ziswaf.js";
import { transaction } from "../db/schema/transactions.js";

export const ziswafService = {
  async findAll(options: { limit?: number; status?: string } = {}) {
    const safeLimit = Math.min(Number(options.limit) || 1000, 2000);
    const conditions = [];

    if (options.status && options.status !== "Semua") {
      conditions.push(eq(ziswafTransaction.status, options.status));
    }

    const whereClause = conditions.length > 0 ? and(...conditions) : undefined;

    return db
      .select()
      .from(ziswafTransaction)
      .where(whereClause)
      .orderBy(desc(ziswafTransaction.date), desc(ziswafTransaction.createdAt))
      .limit(safeLimit);
  },

  async findById(id: string) {
    const records = await db.select().from(ziswafTransaction).where(eq(ziswafTransaction.id, id));
    return records[0] || null;
  },

  async create(data: typeof ziswafTransaction.$inferInsert) {
    const id = data.id || crypto.randomUUID();
    // Jika ditambahkan manual oleh takmir, default status 'verified' kecuali dispesifikasikan lain
    const status = data.status || "verified";
    await db.insert(ziswafTransaction).values({ ...data, id, status });
    return this.findById(id);
  },

  async update(id: string, data: Partial<typeof ziswafTransaction.$inferInsert>) {
    await db.update(ziswafTransaction).set(data).where(eq(ziswafTransaction.id, id));
    return this.findById(id);
  },

  async remove(id: string) {
    const existing = await this.findById(id);
    if (existing?.transactionId) {
      // Hapus juga transaksi kas terkait jika ada
      await db.delete(transaction).where(eq(transaction.id, existing.transactionId));
    }
    await db.delete(ziswafTransaction).where(eq(ziswafTransaction.id, id));
    return true;
  },

  /**
   * Verifikasi donasi: Memvalidasi bahwa mutasi rekening benar-benar ada.
   * Transaksi atomik:
   * 1. Update status ZISWAF ke 'verified'
   * 2. Catat sebagai Pemasukan di tabel transactions (Kas Umum)
   */
  async verifyDonation(id: string, verifierId: string) {
    const record = await this.findById(id);
    if (!record) {
      throw new Error("Data transaksi ZISWAF tidak ditemukan.");
    }

    if (record.status === "verified") {
      throw new Error("Transaksi donasi ini sudah diverifikasi sebelumnya.");
    }

    const txId = crypto.randomUUID();
    const today = new Date().toISOString().split("T")[0];
    const amountStr = String(record.amount);

    await db.transaction(async (tx) => {
      // 1. Masukkan ke Buku Kas Utama (transactions) sebagai Pemasukan
      await tx.insert(transaction).values({
        id: txId,
        date: record.date || today,
        type: "Pemasukan",
        category: record.type,
        amount: amountStr,
        description: `Donasi ${record.type} - ${record.donorName} (Verifikasi Rekening Bank)`,
        programId: null,
        createdBy: verifierId,
      });

      // 2. Perbarui status ZISWAF menjadi 'verified' dan tautkan ke transaction_id
      await tx.update(ziswafTransaction).set({
        status: "verified",
        transactionId: txId,
        verifiedBy: verifierId,
        verifiedAt: new Date(),
        rejectionReason: null,
      }).where(eq(ziswafTransaction.id, id));
    });

    import("./notifications.service.js").then((ns) => {
      const formattedAmount = Number(amountStr).toLocaleString("id-ID");
      ns.notificationService.create({
        type: "Keuangan",
        title: `Donasi ${record.type} Terverifikasi Masuk Kas`,
        description: `Dana Rp ${formattedAmount} dari ${record.donorName} telah diverifikasi masuk mutasi rekening dan dibukukan ke Kas.`,
      });
    });

    import("./auditLog.service.js").then((als) => {
      als.auditLogService.logActivity({
        userId: verifierId,
        action: "VERIFY_ZISWAF_DONATION",
        entity: "ziswaf",
        entityId: id,
        details: { transactionId: txId, amount: amountStr, donorName: record.donorName, type: record.type },
      });
    });

    return this.findById(id);
  },

  /**
   * Tolak donasi fiktif:
   * Menandai status sebagai 'rejected' dan mencatat alasan penolakan.
   * Menjamin dana TIDAK PERNAH masuk ke Buku Kas Utama.
   */
  async rejectDonation(id: string, verifierId: string, reason?: string) {
    const record = await this.findById(id);
    if (!record) {
      throw new Error("Data transaksi ZISWAF tidak ditemukan.");
    }

    await db.transaction(async (tx) => {
      // Jika sebelumnya pernah ada kaitan dengan transactions (misal status salah), hapus dari kas
      if (record.transactionId) {
        await tx.delete(transaction).where(eq(transaction.id, record.transactionId));
      }

      await tx.update(ziswafTransaction).set({
        status: "rejected",
        transactionId: null,
        verifiedBy: verifierId,
        verifiedAt: new Date(),
        rejectionReason: reason || "Transaksi fiktif: Dana tidak ditemukan pada mutasi rekening bank",
      }).where(eq(ziswafTransaction.id, id));
    });

    import("./auditLog.service.js").then((als) => {
      als.auditLogService.logActivity({
        userId: verifierId,
        action: "REJECT_ZISWAF_DONATION",
        entity: "ziswaf",
        entityId: id,
        details: { donorName: record.donorName, amount: record.amount, reason },
      });
    });

    return this.findById(id);
  }
};

