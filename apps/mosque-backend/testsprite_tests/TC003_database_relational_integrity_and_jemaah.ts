import { db } from "../src/config/db.js";
import { jemaah } from "../src/db/schema/jemaah.js";
import { user } from "../src/db/schema/auth.js";
import { eq } from "drizzle-orm";
import crypto from "crypto";

export async function runTC003(): Promise<void> {
  console.log("▶ [TC003] Running Database Relational Integrity & Jemaah Records Test...");
  const runId = crypto.randomUUID().slice(0, 8);
  const testJemaahId = `tc003-jemaah-${runId}`;

  // 1. Get an existing admin user ID for FK testing
  const adminUser = await db.query.user.findFirst();
  const creatorId = adminUser ? adminUser.id : null;

  try {
    // 2. Insert Jemaah Record with Foreign Key Reference
    await db.insert(jemaah).values({
      id: testJemaahId,
      name: `Jemaah Relational Test ${runId}`,
      address: "Kompleks Masjid Al-Falah Blok B3",
      phone: "085711223344",
      category: "Pemuda",
      skills: "Desain Grafis, Multimedia",
      notes: "Relational integrity test record",
      email: `jemaah-${runId}@example.com`,
      createdBy: creatorId,
    });
    console.log(`  ✓ Inserted Jemaah record (id=${testJemaahId}) with foreign key createdBy=${creatorId}`);

    // 3. Query with Relation / Join
    const recordWithRelations = await db.query.jemaah.findFirst({
      where: eq(jemaah.id, testJemaahId),
      with: {
        creator: true,
      },
    });

    if (!recordWithRelations) {
      throw new Error(`Jemaah ${testJemaahId} was not found in MySQL.`);
    }

    if (creatorId && recordWithRelations.creator?.id !== creatorId) {
      throw new Error(`Relational join failed: expected creator id ${creatorId}, got ${recordWithRelations.creator?.id}`);
    }
    console.log(`  ✓ Relational query succeeded: Creator name=${recordWithRelations.creator?.name || 'N/A'}`);

    // 4. Test Public API Summary Endpoint for Jemaah
    const res = await fetch("http://localhost:3000/api/jemaah/summary");
    if (!res.ok) {
      throw new Error(`GET /api/jemaah/summary returned status ${res.status}`);
    }
    const summary: any = await res.json();
    console.log(`  ✓ Jemaah Summary retrieved: total=${summary.total}, categories=${JSON.stringify(summary.categories || summary)}`);

    console.log("✅ [TC003] PASSED: Database relational integrity and Jemaah operations verified.\n");
  } finally {
    // Clean up
    await db.delete(jemaah).where(eq(jemaah.id, testJemaahId)).catch(() => {});
  }
}

if (process.argv[1]?.includes("TC003")) {
  runTC003().then(() => process.exit(0)).catch((err) => {
    console.error("❌ [TC003] FAILED:", err);
    process.exit(1);
  });
}
