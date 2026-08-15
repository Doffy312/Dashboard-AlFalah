import { pool } from "../config/db.js";

async function main() {
  console.log("⚡ Syncing Audit Log table schema...");
  const connection = await pool.getConnection();

  try {
    await connection.query(`
      CREATE TABLE IF NOT EXISTS \`audit_log\` (
        \`id\` varchar(36) NOT NULL,
        \`user_id\` varchar(36) DEFAULT NULL,
        \`user_name\` varchar(100) NOT NULL DEFAULT 'System',
        \`user_role\` varchar(50) NOT NULL DEFAULT 'system',
        \`action\` varchar(100) NOT NULL,
        \`entity\` varchar(50) NOT NULL,
        \`entity_id\` varchar(100) DEFAULT NULL,
        \`details\` text DEFAULT NULL,
        \`ip_address\` varchar(45) DEFAULT NULL,
        \`user_agent\` varchar(255) DEFAULT NULL,
        \`created_at\` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
        PRIMARY KEY (\`id\`)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    `);
    console.log("✅ Table 'audit_log' created / verified successfully.");
  } catch (error) {
    console.error("❌ Failed to create audit_log table:", error);
    process.exit(1);
  } finally {
    connection.release();
    process.exit(0);
  }
}

main();
