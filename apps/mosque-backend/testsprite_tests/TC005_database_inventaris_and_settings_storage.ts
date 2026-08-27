import { db } from "../src/config/db.js";
import { inventaris } from "../src/db/schema/inventaris.js";
import { setting } from "../src/db/schema/settings.js";
import { eq } from "drizzle-orm";
import crypto from "crypto";

export async function runTC005(): Promise<void> {
  console.log("▶ [TC005] Running Database Inventaris & Settings Storage Test...");
  const runId = crypto.randomUUID().slice(0, 8);
  const testItemId = `tc005-inv-${runId}`;
  const testSettingKey = `tc005_config_${runId}`;
  const dateStr = new Date().toISOString().split("T")[0];

  try {
    // 1. Test Inventaris Asset Insertion & Query
    await db.insert(inventaris).values({
      id: testItemId,
      name: `Proyektor Laser HD ${runId}`,
      quantity: 2,
      date: dateStr,
      location: "Ruang Utama Masjid",
      condition: "Baik",
      notes: "Inventaris tes otomatisasi",
    });
    console.log(`  ✓ Inserted inventaris asset: id=${testItemId}`);

    const invItem = await db.query.inventaris.findFirst({
      where: eq(inventaris.id, testItemId),
    });
    if (!invItem || invItem.quantity !== 2) {
      throw new Error(`Failed to query inserted inventaris item from MySQL.`);
    }
    console.log(`  ✓ Inventaris item verified: ${invItem.name}, quantity=${invItem.quantity}, condition=${invItem.condition}`);

    // 2. Test Key-Value Settings JSON Storage
    const sampleConfig = { theme: "emerald", maxAttendance: 500, features: ["kajian", "qurban"] };
    await db.insert(setting).values({
      key: testSettingKey,
      value: sampleConfig,
    });
    console.log(`  ✓ Stored JSON configuration setting: key=${testSettingKey}`);

    const fetchedSetting = await db.query.setting.findFirst({
      where: eq(setting.key, testSettingKey),
    });
    if (!fetchedSetting || (fetchedSetting.value as any).maxAttendance !== 500) {
      throw new Error(`Setting JSON retrieval failed: ${JSON.stringify(fetchedSetting)}`);
    }
    console.log(`  ✓ Setting JSON parsed correctly: maxAttendance=${(fetchedSetting.value as any).maxAttendance}`);

    // 3. Test Public API Summary for Inventaris
    const invRes = await fetch("http://localhost:3000/api/inventaris/summary");
    if (!invRes.ok) {
      throw new Error(`GET /api/inventaris/summary returned status ${invRes.status}`);
    }
    const invSummary: any = await invRes.json();
    console.log(`  ✓ GET /api/inventaris/summary verified: totalBarang=${invSummary.totalBarang}`);

    console.log("✅ [TC005] PASSED: Database inventaris and JSON settings storage verified.\n");
  } finally {
    // Clean up
    await db.delete(inventaris).where(eq(inventaris.id, testItemId)).catch(() => {});
    await db.delete(setting).where(eq(setting.key, testSettingKey)).catch(() => {});
  }
}

if (process.argv[1]?.includes("TC005")) {
  runTC005().then(() => process.exit(0)).catch((err) => {
    console.error("❌ [TC005] FAILED:", err);
    process.exit(1);
  });
}
