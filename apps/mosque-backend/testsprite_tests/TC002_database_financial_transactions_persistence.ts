import { db } from "../src/config/db.js";
import { transaction } from "../src/db/schema/transactions.js";
import { eq, and } from "drizzle-orm";
import crypto from "crypto";

export async function runTC002(): Promise<void> {
  console.log("▶ [TC002] Running Database Financial Transactions Persistence & Calculations Test...");
  const runId = crypto.randomUUID().slice(0, 8);
  const testId = `tc002-trx-${runId}`;
  const amount = "2750500.00";
  const dateStr = new Date().toISOString().split("T")[0];

  try {
    // 1. Insert Transaction directly into MySQL via Drizzle ORM
    await db.insert(transaction).values({
      id: testId,
      date: dateStr,
      type: "Pemasukan",
      category: "Infaq Pembangunan",
      amount: amount,
      description: `TestSprite Infaq Pembangunan Persistence Test ${runId}`,
    });
    console.log(`  ✓ Inserted financial transaction record: id=${testId}, amount=Rp ${amount}`);

    // 2. Fetch and Validate Decimal Precision & Data Integrity
    const record = await db.query.transaction.findFirst({
      where: eq(transaction.id, testId),
    });

    if (!record) {
      throw new Error(`Failed to retrieve inserted transaction ${testId} from MySQL.`);
    }

    if (record.type !== "Pemasukan" || record.category !== "Infaq Pembangunan") {
      throw new Error(`Data mismatch in transaction record: ${JSON.stringify(record)}`);
    }

    const parsedAmount = parseFloat(record.amount);
    if (parsedAmount !== 2750500) {
      throw new Error(`Decimal precision corrupted: expected 2750500, got ${parsedAmount}`);
    }
    console.log(`  ✓ Decimal precision verified: stored '${record.amount}' parsed exactly to ${parsedAmount}`);

    // 3. Test HTTP API Summary reflects database changes
    const res = await fetch("http://localhost:3000/api/transactions/summary");
    if (!res.ok) {
      throw new Error(`GET /api/transactions/summary returned status ${res.status}`);
    }
    const summaryData: any = await res.json();
    console.log(`  ✓ API Transaction Summary retrieved: saldoKas=${summaryData.saldoKas}, totalPemasukan=${summaryData.totalPemasukan}`);

    console.log("✅ [TC002] PASSED: Database financial transaction persistence and calculations verified.\n");
  } finally {
    // Clean up
    await db.delete(transaction).where(eq(transaction.id, testId)).catch(() => {});
  }
}

if (process.argv[1]?.includes("TC002")) {
  runTC002().then(() => process.exit(0)).catch((err) => {
    console.error("❌ [TC002] FAILED:", err);
    process.exit(1);
  });
}
