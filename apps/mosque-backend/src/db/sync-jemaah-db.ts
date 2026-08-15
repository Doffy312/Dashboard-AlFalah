import { pool } from "../config/db.js";

async function main() {
  console.log("⚡ Checking and updating Jemaah database schema...");
  const connection = await pool.getConnection();

  try {
    const [rows]: any = await connection.query("SHOW COLUMNS FROM jemaah LIKE 'lat'");
    if (rows.length === 0) {
      console.log("Adding 'lat' and 'lng' columns to 'jemaah' table...");
      await connection.query("ALTER TABLE `jemaah` ADD COLUMN `lat` double DEFAULT NULL AFTER `notes`;");
      await connection.query("ALTER TABLE `jemaah` ADD COLUMN `lng` double DEFAULT NULL AFTER `lat`;");
      console.log("✅ Columns 'lat' and 'lng' added successfully.");
    } else {
      console.log("✅ Columns 'lat' and 'lng' already exist.");
    }
  } catch (error) {
    console.error("❌ Failed to update Jemaah database schema:", error);
    process.exit(1);
  } finally {
    connection.release();
    process.exit(0);
  }
}

main();
