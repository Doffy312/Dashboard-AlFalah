import crypto from "crypto";
import { eq, like, and, sql, desc } from "drizzle-orm";
import { db } from "../config/db.js";
import { transaction, ziswafTransaction } from "../db/schema/index.js";

// ─── Types ───────────────────────────────────────────────────────────

export interface CreateTransactionInput {
  date: string;
  type: "Pemasukan" | "Pengeluaran";
  category: string;
  amount: string;
  description: string;
  programId?: string | null;
}

export interface TransactionFilters {
  search?: string;
  category?: string;
  month?: string; // YYYY-MM format
  page?: number;
  limit?: number;
}

// ─── Service ─────────────────────────────────────────────────────────

export class TransactionService {
  async findAll(filters: TransactionFilters = {}) {
    const { search, category, month, page = 1, limit = 1000 } = filters;
    const safePage = Math.max(1, Number(page) || 1);
    const safeLimit = Math.min(Math.max(1, Number(limit) || 1000), 2000);
    const conditions = [];

    if (search) {
      conditions.push(like(transaction.description, `%${search}%`));
    }
    if (category) {
      conditions.push(eq(transaction.category, category));
    }
    if (month) {
      // Filter by YYYY-MM
      conditions.push(
        sql`DATE_FORMAT(${transaction.date}, '%Y-%m') = ${month}`
      );
    }

    const where = conditions.length > 0 ? and(...conditions) : undefined;
    const offset = (safePage - 1) * safeLimit;

    const [data, countResult] = await Promise.all([
      db
        .select()
        .from(transaction)
        .where(where)
        .orderBy(desc(transaction.date), desc(transaction.createdAt))
        .limit(safeLimit)
        .offset(offset),
      db
        .select({ count: sql<number>`count(*)` })
        .from(transaction)
        .where(where),
    ]);

    const total = countResult[0]?.count ?? 0;
    return { data, total, page: safePage, limit: safeLimit };
  }

  async findById(id: string) {
    const result = await db
      .select()
      .from(transaction)
      .where(eq(transaction.id, id))
      .limit(1);
    return result[0] ?? null;
  }

  async create(data: CreateTransactionInput, userId?: string | null, isSystemSync = false) {
    if (!isSystemSync && data.category === "Program Kerja") {
      throw new Error("Kategori 'Program Kerja' hanya ditambahkan secara otomatis ketika Program Kerja berstatus Selesai.");
    }

    const id = crypto.randomUUID();
    await db
      .insert(transaction)
      .values({
        id,
        date: data.date,
        type: data.type,
        category: data.category,
        amount: data.amount,
        description: data.description,
        programId: data.programId || null,
        createdBy: userId || null,
      });

    const newTransaction = await this.findById(id);

    import("./notifications.service.js").then((ns) => {
      ns.notificationService.create({
        type: "Keuangan",
        title: `Transaksi ${data.type} Baru`,
        description: `Rp ${Number(data.amount).toLocaleString('id-ID')} - ${data.description}`,
      });
    });

    import("./auditLog.service.js").then((als) => {
      als.auditLogService.logActivity({
        userId: userId || null,
        action: "CREATE_TRANSACTION",
        entity: "transaction",
        entityId: id,
        details: { type: data.type, category: data.category, amount: data.amount, description: data.description },
      });
    });

    return newTransaction;
  }

  async createPublicDonation(data: {
    amount: string | number;
    donorName?: string;
    type?: string;
    description?: string;
  }) {
    const today = new Date().toISOString().split("T")[0];
    const donorName = data.donorName?.trim() || "Hamba Allah";
    const type = data.type?.trim() || "Infaq";
    const description = data.description?.trim() || "";
    const amountStr = String(data.amount);

    const txDescription = description
      ? `Donasi ${type} Scan QR - ${donorName} (${description})`
      : `Donasi ${type} Scan QR - ${donorName}`;

    const txId = crypto.randomUUID();
    const ziswafId = crypto.randomUUID();

    // Atomic database transaction: writes to both tables must succeed or rollback together
    await db.transaction(async (tx) => {
      await tx.insert(transaction).values({
        id: txId,
        date: today,
        type: "Pemasukan",
        category: type,
        amount: amountStr,
        description: txDescription,
        programId: null,
        createdBy: null,
      });

      await tx.insert(ziswafTransaction).values({
        id: ziswafId,
        date: today,
        type: type,
        donorName: donorName,
        amount: amountStr,
        description: description || "Donasi via Scan QR Code",
      });
    });

    const newTx = await this.findById(txId);

    import("./notifications.service.js").then((ns) => {
      const formattedAmount = Number(amountStr).toLocaleString("id-ID");
      ns.notificationService.create({
        type: "Donasi",
        title: `Donasi ${type} Scan QR Masuk`,
        description: `Rp ${formattedAmount} dari ${donorName} melalui Scan QR Code QRIS`,
      });
    });

    import("./auditLog.service.js").then((als) => {
      als.auditLogService.logActivity({
        userId: null,
        action: "PUBLIC_DONATION",
        entity: "transaction",
        entityId: txId,
        details: { type, donorName, amount: amountStr, description: txDescription, ziswafId },
      });
    });

    return newTx;
  }

  async update(id: string, data: Partial<CreateTransactionInput>, isSystemSync = false) {
    const existing = await this.findById(id);
    if (!existing) return null;

    if (!isSystemSync) {
      if (existing.category === "Program Kerja" || data.category === "Program Kerja") {
        throw new Error("Transaksi dengan kategori 'Program Kerja' dikelola secara otomatis dari Program Kerja.");
      }
    }

    await db
      .update(transaction)
      .set({
        ...data,
        programId: data.programId || null,
        updatedAt: new Date(),
      })
      .where(eq(transaction.id, id));

    import("./auditLog.service.js").then((als) => {
      als.auditLogService.logActivity({
        action: "UPDATE_TRANSACTION",
        entity: "transaction",
        entityId: id,
        details: { before: existing, updated: data },
      });
    });

    return this.findById(id);
  }

  async delete(id: string, isSystemSync = false) {
    const existing = await this.findById(id);
    if (!existing) return null;

    if (!isSystemSync) {
      if (existing.category === "Program Kerja") {
        throw new Error("Transaksi dengan kategori 'Program Kerja' dikelola secara otomatis dari Program Kerja.");
      }
    }

    await db
      .delete(transaction)
      .where(eq(transaction.id, id));

    import("./auditLog.service.js").then((als) => {
      als.auditLogService.logActivity({
        action: "DELETE_TRANSACTION",
        entity: "transaction",
        entityId: id,
        details: { deletedRecord: existing },
      });
    });

    return existing;
  }

  /**
   * Financial summary: saldo, totals, and current month breakdown.
   * Mirrors the logic in KeuanganContext.summaries.
   */
  async getSummary() {
    const now = new Date();
    const currentMonth = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;

    const result = await db
      .select({
        totalPemasukan: sql<string>`coalesce(sum(case when ${transaction.type} = 'Pemasukan' then ${transaction.amount} else 0 end), 0)`,
        totalPengeluaran: sql<string>`coalesce(sum(case when ${transaction.type} = 'Pengeluaran' then ${transaction.amount} else 0 end), 0)`,
        pemasukanBulanIni: sql<string>`coalesce(sum(case when ${transaction.type} = 'Pemasukan' and DATE_FORMAT(${transaction.date}, '%Y-%m') = ${currentMonth} then ${transaction.amount} else 0 end), 0)`,
        pengeluaranBulanIni: sql<string>`coalesce(sum(case when ${transaction.type} = 'Pengeluaran' and DATE_FORMAT(${transaction.date}, '%Y-%m') = ${currentMonth} then ${transaction.amount} else 0 end), 0)`,
      })
      .from(transaction);

    const row = result[0];
    const totalPemasukan = Number(row?.totalPemasukan ?? 0);
    const totalPengeluaran = Number(row?.totalPengeluaran ?? 0);

    return {
      saldoSaatIni: totalPemasukan - totalPengeluaran,
      totalPemasukan,
      totalPengeluaran,
      pemasukanBulanIni: Number(row?.pemasukanBulanIni ?? 0),
      pengeluaranBulanIni: Number(row?.pengeluaranBulanIni ?? 0),
    };
  }

  /**
   * Monthly cashflow grouped by month for a given year.
   * Used by the Dashboard bar chart.
   */
  async getMonthlyCashflow(year: number) {
    const result = await db
      .select({
        month: sql<string>`DATE_FORMAT(${transaction.date}, '%m')`,
        type: transaction.type,
        total: sql<string>`sum(${transaction.amount})`,
      })
      .from(transaction)
      .where(sql`YEAR(${transaction.date}) = ${year}`)
      .groupBy(sql`DATE_FORMAT(${transaction.date}, '%m')`, transaction.type)
      .orderBy(sql`DATE_FORMAT(${transaction.date}, '%m')`);

    return result;
  }

  /**
   * Category distribution for the donut chart.
   */
  async getCategoryDistribution(type: string = "Pengeluaran") {
    const result = await db
      .select({
        category: transaction.category,
        total: sql<string>`sum(${transaction.amount})`,
      })
      .from(transaction)
      .where(eq(transaction.type, type))
      .groupBy(transaction.category)
      .orderBy(sql`sum(${transaction.amount}) desc`);

    return result;
  }

  /**
   * Monthly category distribution for category growth trends on public transparency page.
   */
  async getCategoryMonthlyTrends(type: string = "Pemasukan", year: number) {
    const result = await db
      .select({
        month: sql<string>`DATE_FORMAT(${transaction.date}, '%m')`,
        category: transaction.category,
        total: sql<string>`sum(${transaction.amount})`,
      })
      .from(transaction)
      .where(sql`${transaction.type} = ${type} AND YEAR(${transaction.date}) = ${year}`)
      .groupBy(sql`DATE_FORMAT(${transaction.date}, '%m')`, transaction.category)
      .orderBy(sql`DATE_FORMAT(${transaction.date}, '%m')`);

    return result;
  }
}

export const transactionService = new TransactionService();
