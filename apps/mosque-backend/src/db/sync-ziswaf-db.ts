import { pool } from "../config/db.js";

/**
 * Ensures that the production MySQL database table 'ziswaf_transactions'
 * has all necessary columns for Two-Step Verification (status, transaction_id, verified_by, verified_at, rejection_reason).
 * Automatically executed on backend startup via autoInitDatabase().
 */
export async function syncZiswafTable() {
  console.log("⚡ [Auto-Init] Checking and updating ZISWAF database schema...");
  const connection = await pool.getConnection();

  try {
    const [rows]: any = await connection.query(
      "SHOW COLUMNS FROM `ziswaf_transactions` LIKE 'status'"
    );

    if (rows.length === 0) {
      console.log("Adding verification columns to 'ziswaf_transactions' table...");

      // 1. Add status column
      await connection.query(
        "ALTER TABLE `ziswaf_transactions` ADD COLUMN `status` varchar(20) NOT NULL DEFAULT 'verified' AFTER `amount`;"
      );

      // 2. Add transaction_id column
      await connection.query(
        "ALTER TABLE `ziswaf_transactions` ADD COLUMN `transaction_id` varchar(36) DEFAULT NULL AFTER `status`;"
      );

      // 3. Add verified_by column
      await connection.query(
        "ALTER TABLE `ziswaf_transactions` ADD COLUMN `verified_by` varchar(255) DEFAULT NULL AFTER `transaction_id`;"
      );

      // 4. Add verified_at column
      await connection.query(
        "ALTER TABLE `ziswaf_transactions` ADD COLUMN `verified_at` timestamp NULL DEFAULT NULL AFTER `verified_by`;"
      );

      // 5. Add rejection_reason column
      await connection.query(
        "ALTER TABLE `ziswaf_transactions` ADD COLUMN `rejection_reason` text DEFAULT NULL AFTER `verified_at`;"
      );

      // 6. Add indexes for performance
      try {
        await connection.query(
          "CREATE INDEX `ziswaf_status_idx` ON `ziswaf_transactions` (`status`);"
        );
      } catch (idxErr) {
        // Index might already exist
      }

      console.log("✅ Verification columns added to 'ziswaf_transactions' successfully.");
    } else {
      console.log("✅ ZISWAF verification columns already exist.");
    }
  } catch (error) {
    console.error("❌ Failed to update ZISWAF database schema:", error);
    // Do not throw fatal error if already exists or partial
  } finally {
    connection.release();
  }
}

// If run directly
if (process.argv[1] && process.argv[1].includes("sync-ziswaf-db")) {
  syncZiswafTable()
    .then(() => process.exit(0))
    .catch(() => process.exit(1));
}
