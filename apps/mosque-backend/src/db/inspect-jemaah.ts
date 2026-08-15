import { pool } from "../config/db.js";

async function main() {
  const connection = await pool.getConnection();
  try {
    const [rows]: any = await connection.query("SHOW CREATE TABLE jemaah");
    console.log("JEMAAH DDL:", rows[0]['Create Table']);
  } finally {
    connection.release();
    process.exit(0);
  }
}
main();
