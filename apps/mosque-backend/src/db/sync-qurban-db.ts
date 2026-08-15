import { pool } from "../config/db.js";

async function main() {
  console.log("⚡ Re-creating Qurban tables with consistent collation...");
  const connection = await pool.getConnection();

  try {
    await connection.query(`DROP TABLE IF EXISTS \`pequrban\`;`);
    await connection.query(`DROP TABLE IF EXISTS \`qurban_kelompok\`;`);
    await connection.query(`DROP TABLE IF EXISTS \`qurban_tahun\`;`);
    console.log("✅ Previous Qurban tables dropped.");

    // 1. Create qurban_tahun table
    await connection.query(`
      CREATE TABLE \`qurban_tahun\` (
        \`id\` varchar(36) NOT NULL,
        \`tahun\` int NOT NULL,
        \`status_aktif\` tinyint(1) NOT NULL DEFAULT '1',
        \`created_at\` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
        PRIMARY KEY (\`id\`),
        UNIQUE KEY \`qurban_tahun_tahun_unique\` (\`tahun\`),
        KEY \`qurban_tahun_idx\` (\`tahun\`)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
    `);
    console.log("✅ Table qurban_tahun created.");

    // 2. Create qurban_kelompok table
    await connection.query(`
      CREATE TABLE \`qurban_kelompok\` (
        \`id\` varchar(36) NOT NULL,
        \`qurban_tahun_id\` varchar(36) NOT NULL,
        \`nama_kelompok\` varchar(100) NOT NULL,
        \`jenis_hewan\` varchar(20) NOT NULL DEFAULT 'Sapi',
        \`nomor_urut\` int NOT NULL DEFAULT '1',
        \`created_at\` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
        PRIMARY KEY (\`id\`),
        KEY \`kelompok_tahun_id_idx\` (\`qurban_tahun_id\`),
        CONSTRAINT \`qurban_kelompok_qurban_tahun_id_fk\` FOREIGN KEY (\`qurban_tahun_id\`) REFERENCES \`qurban_tahun\` (\`id\`) ON DELETE CASCADE
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
    `);
    console.log("✅ Table qurban_kelompok created.");

    // 3. Create pequrban table
    await connection.query(`
      CREATE TABLE \`pequrban\` (
        \`id\` varchar(36) NOT NULL,
        \`jemaah_id\` varchar(36) NOT NULL,
        \`qurban_tahun_id\` varchar(36) NOT NULL,
        \`qurban_kelompok_id\` varchar(36) DEFAULT NULL,
        \`jenis_hewan\` varchar(20) NOT NULL DEFAULT 'Sapi',
        \`status\` varchar(20) NOT NULL DEFAULT 'Proses',
        \`catatan\` text,
        \`created_at\` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
        PRIMARY KEY (\`id\`),
        KEY \`pequrban_jemaah_idx\` (\`jemaah_id\`),
        KEY \`pequrban_tahun_idx\` (\`qurban_tahun_id\`),
        KEY \`pequrban_kelompok_idx\` (\`qurban_kelompok_id\`),
        CONSTRAINT \`pequrban_jemaah_id_fk\` FOREIGN KEY (\`jemaah_id\`) REFERENCES \`jemaah\` (\`id\`) ON DELETE CASCADE,
        CONSTRAINT \`pequrban_qurban_tahun_id_fk\` FOREIGN KEY (\`qurban_tahun_id\`) REFERENCES \`qurban_tahun\` (\`id\`) ON DELETE CASCADE,
        CONSTRAINT \`pequrban_qurban_kelompok_id_fk\` FOREIGN KEY (\`qurban_kelompok_id\`) REFERENCES \`qurban_kelompok\` (\`id\`) ON DELETE SET NULL
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
    `);
    console.log("✅ Table pequrban created.");

    // 4. Insert default active Qurban Year (current year e.g. 2026)
    const currentYear = new Date().getFullYear();
    const uuid = crypto.randomUUID();
    await connection.query(
      `INSERT INTO \`qurban_tahun\` (\`id\`, \`tahun\`, \`status_aktif\`) VALUES (?, ?, 1)`,
      [uuid, currentYear]
    );
    console.log(`✅ Default Qurban Year ${currentYear} inserted.`);

    console.log("🎉 Qurban schema migration completed successfully!");
  } catch (error) {
    console.error("❌ Failed to sync Qurban tables:", error);
    process.exit(1);
  } finally {
    connection.release();
    process.exit(0);
  }
}

main();
