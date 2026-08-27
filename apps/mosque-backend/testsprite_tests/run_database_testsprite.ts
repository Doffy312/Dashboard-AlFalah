import { runTC001 } from "./TC001_database_connectivity_and_schema_health.js";
import { runTC002 } from "./TC002_database_financial_transactions_persistence.js";
import { runTC003 } from "./TC003_database_relational_integrity_and_jemaah.js";
import { runTC004 } from "./TC004_database_work_program_lifecycle_and_state.js";
import { runTC005 } from "./TC005_database_inventaris_and_settings_storage.js";
import { runTC006 } from "./TC006_database_atomic_transactions_and_rollback.js";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function main() {
  console.log("==========================================================");
  console.log(" 🌙 TESTSPRITE DATABASE TEST SUITE EXECUTION");
  console.log(" Environment: MySQL & Drizzle ORM (mosque_dashboard)");
  console.log(" Target: Local Database & API Services");
  console.log("==========================================================\n");

  const testCases = [
    { id: "TC001", title: "TC001 - Database Connectivity & Schema Health", fn: runTC001 },
    { id: "TC002", title: "TC002 - Database Financial Transactions Persistence & Calculations", fn: runTC002 },
    { id: "TC003", title: "TC003 - Database Relational Integrity & Jemaah Records", fn: runTC003 },
    { id: "TC004", title: "TC004 - Database Work Program Lifecycle & State Persistence", fn: runTC004 },
    { id: "TC005", title: "TC005 - Database Inventaris & Settings Storage", fn: runTC005 },
    { id: "TC006", title: "TC006 - Database Atomic Transactions & Rollback Verification", fn: runTC006 },
  ];

  const results: any[] = [];
  let passedCount = 0;
  let failedCount = 0;

  for (const tc of testCases) {
    const start = Date.now();
    try {
      await tc.fn();
      const duration = Date.now() - start;
      results.push({
        id: tc.id,
        title: tc.title,
        status: "PASSED",
        durationMs: duration,
        error: null,
      });
      passedCount++;
    } catch (error: any) {
      const duration = Date.now() - start;
      console.error(`❌ ${tc.title} FAILED:`, error.message);
      results.push({
        id: tc.id,
        title: tc.title,
        status: "FAILED",
        durationMs: duration,
        error: error.message,
      });
      failedCount++;
    }
  }

  console.log("==========================================================");
  console.log(" 📊 TESTSPRITE DATABASE TEST SUMMARY");
  console.log("==========================================================");
  console.log(` Total Tests : ${testCases.length}`);
  console.log(` ✅ Passed    : ${passedCount}`);
  console.log(` ❌ Failed    : ${failedCount}`);
  console.log(` 📈 Pass Rate : ${((passedCount / testCases.length) * 100).toFixed(2)}%`);
  console.log("==========================================================\n");

  // Write results into tmp/test_results.json
  const tmpDir = path.join(__dirname, "tmp");
  if (!fs.existsSync(tmpDir)) {
    fs.mkdirSync(tmpDir, { recursive: true });
  }

  const reportData = results.map((r) => ({
    projectId: "0036acaa-c9de-5b8a-bd2b-3f4c87f2a7fa",
    testId: r.id,
    title: r.title,
    testType: "DATABASE",
    testStatus: r.status,
    durationMs: r.durationMs,
    error: r.error,
    timestamp: new Date().toISOString(),
  }));

  fs.writeFileSync(
    path.join(tmpDir, "test_results.json"),
    JSON.stringify(reportData, null, 2),
    "utf8"
  );

  if (failedCount > 0) {
    process.exit(1);
  } else {
    process.exit(0);
  }
}

main().catch((err) => {
  console.error("Fatal Error running database test suite:", err);
  process.exit(1);
});
