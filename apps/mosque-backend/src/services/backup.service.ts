import cron from "node-cron";
import { execFile } from "child_process";
import { promisify } from "util";
import path from "path";
import fs from "fs";
import { env } from "../config/env.js";

const execFileAsync = promisify(execFile);

export const initBackupService = () => {
  // Jadwal: Setiap hari jam 02:00 pagi
  cron.schedule("0 2 * * *", async () => {
    console.log("🕒 Memulai auto-backup database...");
    await runBackup();
  });
  console.log("✅ Backup service initialized (Scheduled for 02:00 AM daily)");
};

// Fungsi ini di-export agar bisa dipanggil secara manual jika diperlukan
export const runBackup = async () => {
  try {
    const dbUrl = new URL(env.DATABASE_URL);
    const user = dbUrl.username;
    const password = dbUrl.password;
    const host = dbUrl.hostname;
    const port = dbUrl.port || "3306";
    const database = dbUrl.pathname.replace("/", "");

    // Buat direktori backups di root server (sejajar dengan folder apps)
    const backupDir = path.resolve(process.cwd(), "../../backups");
    if (!fs.existsSync(backupDir)) {
      fs.mkdirSync(backupDir, { recursive: true });
    }

    const dateStr = new Date().toISOString().split("T")[0]; // Format: YYYY-MM-DD
    const fileName = `backup-${database}-${dateStr}.sql`;
    const filePath = path.join(backupDir, fileName);

    // Use execFile with argument array to prevent command injection.
    // Password passed via MYSQL_PWD env var to avoid exposure in process list.
    const args = [
      "-h", host,
      "-P", port,
      "-u", user,
      "--single-transaction",
      "--routines",
      database,
    ];

    const { stdout } = await execFileAsync("mysqldump", args, {
      env: { ...process.env, MYSQL_PWD: password },
      maxBuffer: 100 * 1024 * 1024, // 100MB buffer for large databases
    });

    fs.writeFileSync(filePath, stdout, "utf-8");
    console.log(`✅ Backup berhasil disimpan: ${fileName}`);

    // Auto cleanup (hapus backup yang lebih tua dari 7 hari)
    cleanupOldBackups(backupDir, 7);

  } catch (error) {
    console.error("❌ Gagal melakukan backup database:", error);
  }
};

const cleanupOldBackups = (backupDir: string, maxDays: number) => {
  try {
    const files = fs.readdirSync(backupDir);
    const now = Date.now();

    files.forEach((file) => {
      if (file.endsWith(".sql")) {
        const filePath = path.join(backupDir, file);
        const stats = fs.statSync(filePath);
        const ageInDays = (now - stats.mtimeMs) / (1000 * 60 * 60 * 24);

        if (ageInDays > maxDays) {
          fs.unlinkSync(filePath);
          console.log(`🗑️ Backup lama otomatis dihapus: ${file}`);
        }
      }
    });
  } catch (error) {
    console.error("❌ Gagal membersihkan backup lama:", error);
  }
};
