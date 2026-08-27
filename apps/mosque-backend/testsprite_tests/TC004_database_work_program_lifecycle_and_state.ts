import { db } from "../src/config/db.js";
import { program } from "../src/db/schema/programs.js";
import { eq } from "drizzle-orm";
import crypto from "crypto";

export async function runTC004(): Promise<void> {
  console.log("▶ [TC004] Running Database Work Program Lifecycle & State Persistence Test...");
  const runId = crypto.randomUUID().slice(0, 8);
  const testProgramId = `tc004-prog-${runId}`;
  const dateStr = new Date().toISOString().split("T")[0];

  try {
    // 1. CREATE Program (Status = 'Direncanakan')
    await db.insert(program).values({
      id: testProgramId,
      name: `Program Lifecycle Test ${runId}`,
      pic: "Ustadz Ahmad",
      budget: "4500000.00",
      status: "Direncanakan",
      date: dateStr,
      description: `Testing program status lifecycle in MySQL ${runId}`,
    });
    console.log(`  ✓ Inserted Program: id=${testProgramId}, status=Direncanakan`);

    // 2. UPDATE Status to 'Sedang Berjalan'
    await db.update(program).set({ status: "Sedang Berjalan" }).where(eq(program.id, testProgramId));
    let current = await db.query.program.findFirst({ where: eq(program.id, testProgramId) });
    if (current?.status !== "Sedang Berjalan") {
      throw new Error(`Expected status 'Sedang Berjalan', got '${current?.status}'`);
    }
    console.log(`  ✓ State transition: Direncanakan -> Sedang Berjalan`);

    // 3. UPDATE Status to 'Selesai' with Evaluation
    const evalText = "Program terlaksana sesuai jadwal dengan evaluasi positif.";
    await db.update(program).set({
      status: "Selesai",
      evaluation: evalText,
    }).where(eq(program.id, testProgramId));

    current = await db.query.program.findFirst({ where: eq(program.id, testProgramId) });
    if (current?.status !== "Selesai" || current?.evaluation !== evalText) {
      throw new Error(`Failed to verify completed status and evaluation in MySQL.`);
    }
    console.log(`  ✓ State transition: Sedang Berjalan -> Selesai (Evaluation stored)`);

    // 4. Test iCal Feed & Public Summary Endpoints
    const summaryRes = await fetch("http://localhost:3000/api/programs/summary");
    if (!summaryRes.ok) {
      throw new Error(`GET /api/programs/summary returned status ${summaryRes.status}`);
    }
    console.log(`  ✓ GET /api/programs/summary responded 200 OK`);

    const icsRes = await fetch("http://localhost:3000/api/programs/feed.ics");
    if (!icsRes.ok) {
      throw new Error(`GET /api/programs/feed.ics returned status ${icsRes.status}`);
    }
    const icsText = await icsRes.text();
    if (!icsText.includes("BEGIN:VCALENDAR")) {
      throw new Error("iCal feed does not contain valid VCALENDAR header.");
    }
    console.log(`  ✓ GET /api/programs/feed.ics verified iCalendar output`);

    console.log("✅ [TC004] PASSED: Database program lifecycle and calendar feed verified.\n");
  } finally {
    // Clean up
    await db.delete(program).where(eq(program.id, testProgramId)).catch(() => {});
  }
}

if (process.argv[1]?.includes("TC004")) {
  runTC004().then(() => process.exit(0)).catch((err) => {
    console.error("❌ [TC004] FAILED:", err);
    process.exit(1);
  });
}
