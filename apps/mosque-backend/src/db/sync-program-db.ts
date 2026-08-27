import { pool } from "../config/db.js";

export async function syncProgramTable() {
  console.log("⚡ Checking and updating Program database schema...");
  const connection = await pool.getConnection();

  try {
    const [rows]: any = await connection.query("SHOW COLUMNS FROM programs LIKE 'original_date'");
    if (rows.length === 0) {
      console.log("Adding 'original_date' column to 'programs' table...");
      await connection.query("ALTER TABLE `programs` ADD COLUMN `original_date` date DEFAULT NULL AFTER `date`;");
      // Backfill existing rows so their initial original_date equals their current date
      await connection.query("UPDATE `programs` SET `original_date` = `date` WHERE `original_date` IS NULL;");
      console.log("✅ Column 'original_date' added and backfilled successfully.");
    } else {
      console.log("✅ Column 'original_date' already exists.");
    }
  } catch (error) {
    console.error("❌ Failed to update Program database schema:", error);
    throw error;
  } finally {
    connection.release();
  }
}

// If run directly
if (process.argv[1] && process.argv[1].includes("sync-program-db")) {
  syncProgramTable()
    .then(() => process.exit(0))
    .catch(() => process.exit(1));
}
