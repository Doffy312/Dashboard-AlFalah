import { pool } from "../config/db.js";

async function verifySafetyAndIntegrity() {
  const connection = await pool.getConnection();
  try {
    const [jemaah]: any = await connection.query("SELECT COUNT(*) AS count FROM jemaah WHERE id LIKE '%test%' OR id LIKE '%tc00%'");
    const [trx]: any = await connection.query("SELECT COUNT(*) AS count FROM transactions WHERE id LIKE '%test%' OR id LIKE '%tc00%'");
    const [prog]: any = await connection.query("SELECT COUNT(*) AS count FROM programs WHERE id LIKE '%test%' OR id LIKE '%tc00%'");
    const [inv]: any = await connection.query("SELECT COUNT(*) AS count FROM inventaris WHERE id LIKE '%test%' OR id LIKE '%tc00%'");
    const [setting]: any = await connection.query("SELECT COUNT(*) AS count FROM settings WHERE `key` LIKE '%test%' OR `key` LIKE '%tc00%'");

    console.log("SAFETY_CHECK_RESULTS:", {
      residualJemaah: jemaah[0].count,
      residualTransactions: trx[0].count,
      residualPrograms: prog[0].count,
      residualInventaris: inv[0].count,
      residualSettings: setting[0].count,
    });
  } finally {
    connection.release();
    process.exit(0);
  }
}

verifySafetyAndIntegrity();
