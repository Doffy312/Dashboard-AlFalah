import { db } from "../src/config/db.js";
import { setting } from "../src/db/schema/settings.js";
import { auditLog } from "../src/db/schema/auditLogs.js";
import { eq } from "drizzle-orm";
import crypto from "crypto";

export async function runTC006(): Promise<void> {
  console.log("▶ [TC006] Running Database Atomic Transactions & Rollback Test...");
  const runId = crypto.randomUUID().slice(0, 8);
  const testKey = `tc006_tx_${runId}`;
  const testAuditId = `tc006_audit_${runId}`;

  // Skenario: Eksekusi transaksi multi-tabel di mana salah satu operasi gagal.
  // Seluruh perubahan dalam transaksi HARUS di-rollback secara otomatis.
  let errorCaught = false;

  try {
    await db.transaction(async (tx) => {
      // 1. Simpan setting
      await tx.insert(setting).values({
        key: testKey,
        value: { status: "testing_transaction_isolation" },
      });

      // 2. Simpan audit log
      await tx.insert(auditLog).values({
        id: testAuditId,
        userName: "Test Runner",
        userRole: "admin",
        action: "TEST_ATOMICITY",
        entity: "system",
        entityId: testKey,
      });

      // 3. Paksa error untuk menguji rollback atomik
      throw new Error("INTENTIONAL_ROLLBACK_TRIGGER");
    });
  } catch (err: any) {
    if (err.message === "INTENTIONAL_ROLLBACK_TRIGGER") {
      errorCaught = true;
    } else {
      throw err;
    }
  }

  if (!errorCaught) {
    throw new Error("Transaction did not throw expected intentional error.");
  }
  console.log("  ✓ Simulated transaction failure was triggered.");

  // 4. Verifikasi bahwa TIDAK ADA baris yang tersimpan (Rollback Sukses)
  const settingCheck = await db.query.setting.findFirst({
    where: eq(setting.key, testKey),
  });
  const auditCheck = await db.query.auditLog.findFirst({
    where: eq(auditLog.id, testAuditId),
  });

  if (settingCheck !== undefined || auditCheck !== undefined) {
    throw new Error(
      `ACID Rollback failed! Found orphaned data: setting=${JSON.stringify(settingCheck)}, audit=${JSON.stringify(auditCheck)}`
    );
  }

  console.log("  ✓ ACID Rollback Verified: Zero dirty / orphaned rows created in database.");
  console.log("✅ [TC006] PASSED: Database atomic transactions and rollback verified.\n");
}

if (process.argv[1]?.includes("TC006")) {
  runTC006().then(() => process.exit(0)).catch((err) => {
    console.error("❌ [TC006] FAILED:", err);
    process.exit(1);
  });
}
