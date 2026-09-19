import { pool } from "../config/db.js";

export async function syncErrorLogTable(): Promise<void> {
  console.log("⚡ Syncing Error Log table schema...");
  const connection = await pool.getConnection();

  try {
    await connection.query(`
      CREATE TABLE IF NOT EXISTS \`error_logs\` (
        \`id\` varchar(36) NOT NULL,
        \`level\` varchar(10) NOT NULL DEFAULT 'ERROR',
        \`source\` varchar(15) NOT NULL DEFAULT 'BACKEND',
        \`request_id\` varchar(36) DEFAULT NULL,
        \`error_name\` varchar(150) NOT NULL,
        \`error_message\` text NOT NULL,
        \`error_code\` varchar(50) DEFAULT NULL,
        \`stack_trace\` text DEFAULT NULL,
        \`http_method\` varchar(10) DEFAULT NULL,
        \`http_url\` varchar(500) DEFAULT NULL,
        \`http_status_code\` int DEFAULT NULL,
        \`user_id\` varchar(36) DEFAULT NULL,
        \`user_role\` varchar(50) DEFAULT NULL,
        \`ip_address\` varchar(45) DEFAULT NULL,
        \`user_agent\` varchar(255) DEFAULT NULL,
        \`context_data\` text DEFAULT NULL,
        \`is_resolved\` int NOT NULL DEFAULT 0,
        \`created_at\` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
        PRIMARY KEY (\`id\`),
        KEY \`error_log_created_at_idx\` (\`created_at\`),
        KEY \`error_log_level_idx\` (\`level\`),
        KEY \`error_log_source_idx\` (\`source\`),
        KEY \`error_log_request_id_idx\` (\`request_id\`),
        KEY \`error_log_status_code_idx\` (\`http_status_code\`),
        KEY \`error_log_user_id_idx\` (\`user_id\`)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    `);
    console.log("✅ Table 'error_logs' created / verified successfully.");
  } catch (error) {
    console.error("❌ Failed to create error_logs table:", error);
    throw error;
  } finally {
    connection.release();
  }
}

// Standalone runner
if (process.argv[1] && process.argv[1].includes("sync-error-log-db")) {
  syncErrorLogTable()
    .then(() => process.exit(0))
    .catch(() => process.exit(1));
}
