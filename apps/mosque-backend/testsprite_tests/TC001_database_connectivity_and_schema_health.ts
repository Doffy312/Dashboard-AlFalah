import { db, pool } from "../src/config/db.js";

export async function runTC001(): Promise<void> {
  console.log("▶ [TC001] Running Database Connectivity & Schema Health Test...");
  const startTime = Date.now();

  // 1. Test MySQL Connection Pool Ping
  const connection = await pool.getConnection();
  try {
    const [result]: any = await connection.query("SELECT DATABASE() AS db_name, VERSION() AS db_version, 1 AS ping");
    if (!result || result[0].ping !== 1) {
      throw new Error("MySQL connection pool failed ping test.");
    }
    const latency = Date.now() - startTime;
    console.log(`  ✓ MySQL Connected: Database=${result[0].db_name}, Version=${result[0].db_version}, Latency=${latency}ms`);
  } finally {
    connection.release();
  }

  // 2. Test All Required Tables in Schema
  const [tablesResult]: any = await pool.query("SHOW TABLES");
  const tableNames = tablesResult.map((row: any) => Object.values(row)[0]);

  const requiredTables = [
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
    "audit_log"
  ];

  const missingTables = requiredTables.filter((tbl) => !tableNames.includes(tbl));
  if (missingTables.length > 0) {
    throw new Error(`Missing database tables: ${missingTables.join(", ")}`);
  }

  console.log(`  ✓ All ${requiredTables.length} required database tables exist in MySQL schema.`);
  console.log("✅ [TC001] PASSED: Database connectivity and schema structure verified successfully.\n");
}

if (process.argv[1]?.includes("TC001")) {
  runTC001().then(() => process.exit(0)).catch((err) => {
    console.error("❌ [TC001] FAILED:", err);
    process.exit(1);
  });
}
