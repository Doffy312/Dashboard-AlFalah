import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const BASE_URL = process.env.BACKEND_TEST_URL || "http://localhost:3000";

interface TestCase {
  id: string;
  title: string;
  fn: () => Promise<void>;
}

async function runTC001_PublicSettings() {
  const res = await fetch(`${BASE_URL}/api/settings/public`);
  if (!res.ok) {
    throw new Error(`Expected HTTP 200, received ${res.status}`);
  }
  const data = await res.json();
  if (typeof data !== "object" || data === null) {
    throw new Error("Settings response is not a valid JSON object");
  }
  console.log("  ✓ Public settings endpoint verified (HTTP 200)");
}

async function runTC002_ProgramsSummary() {
  const res = await fetch(`${BASE_URL}/api/programs/summary`);
  if (!res.ok) {
    throw new Error(`Expected HTTP 200, received ${res.status}`);
  }
  const data = await res.json();
  if (typeof data.total !== "number" || typeof data.direncanakan !== "number") {
    throw new Error("Invalid program summary structure");
  }
  console.log(`  ✓ Programs summary verified: total=${data.total}, direncanakan=${data.direncanakan}`);
}

async function runTC003_JemaahSummary() {
  const res = await fetch(`${BASE_URL}/api/jemaah/summary`);
  if (!res.ok) {
    throw new Error(`Expected HTTP 200, received ${res.status}`);
  }
  const data = await res.json();
  if (typeof data.total !== "number") {
    throw new Error("Invalid jemaah summary structure");
  }
  console.log(`  ✓ Jemaah demographic summary verified: total=${data.total}`);
}

async function runTC004_CalendarFeed() {
  const res = await fetch(`${BASE_URL}/api/programs/feed.ics`);
  if (!res.ok) {
    throw new Error(`Expected HTTP 200, received ${res.status}`);
  }
  const text = await res.text();
  if (!text.includes("VCALENDAR")) {
    throw new Error("Response is not an iCalendar feed");
  }
  console.log("  ✓ iCalendar feed verified: Content contains standard VCALENDAR structure");
}

async function runTC005_ContactMessagesValidation() {
  // Negative test: Empty payload must fail validation
  const badRes = await fetch(`${BASE_URL}/api/contact-messages`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({}),
  });
  if (badRes.status !== 400) {
    throw new Error(`Expected HTTP 400 for empty payload, received ${badRes.status}`);
  }
  const badData = await badRes.json();
  if (!badData.errors || !Array.isArray(badData.errors)) {
    throw new Error("Expected validation errors array in response");
  }
  console.log("  ✓ Negative test passed: Zod schema validator rejected empty submission (HTTP 400)");

  // Positive test: Valid submission
  const goodRes = await fetch(`${BASE_URL}/api/contact-messages`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      fullName: "Test Visitor TestSprite",
      email: "visitor@example.com",
      whatsapp: "081234567890",
      subject: "Pengujian TestSprite Otomatis",
      message: "Pesan verifikasi sistem otomatis dari TestSprite test suite.",
    }),
  });
  if (!goodRes.ok) {
    throw new Error(`Expected HTTP 200/201, received ${goodRes.status}`);
  }
  console.log("  ✓ Positive test passed: Contact message submission saved successfully");
}

async function runTC006_AuthSecurityRejection() {
  const res = await fetch(`${BASE_URL}/api/auth/sign-in/email`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      email: "invalid_unauthorized_user@example.com",
      password: "WrongPassword999!",
    }),
  });

  // Better-Auth typically returns 400, 401, or 403 for bad credentials
  if (res.status !== 400 && res.status !== 401 && res.status !== 403) {
    throw new Error(`Expected auth rejection (400/401/403), received ${res.status}`);
  }
  console.log(`  ✓ Auth security test passed: Unauthorized attempt rejected with HTTP ${res.status}`);
}

async function main() {
  console.log("==========================================================");
  console.log(" 🌐 TESTSPRITE BACKEND API TEST SUITE EXECUTION");
  console.log(` Target Service: ${BASE_URL}`);
  console.log("==========================================================\n");

  const testCases: TestCase[] = [
    { id: "API-TC001", title: "API-TC001 - Public Mosque Settings & Metadata", fn: runTC001_PublicSettings },
    { id: "API-TC002", title: "API-TC002 - Work Programs Summary & Categorization", fn: runTC002_ProgramsSummary },
    { id: "API-TC003", title: "API-TC003 - Jemaah Demographics & Aggregations", fn: runTC003_JemaahSummary },
    { id: "API-TC004", title: "API-TC004 - iCalendar (.ics) Feed Generator", fn: runTC004_CalendarFeed },
    { id: "API-TC005", title: "API-TC005 - Contact Messages Schema Validation & Persistence", fn: runTC005_ContactMessagesValidation },
    { id: "API-TC006", title: "API-TC006 - Authentication Security & Credential Protection", fn: runTC006_AuthSecurityRejection },
  ];

  const results: any[] = [];
  let passedCount = 0;
  let failedCount = 0;

  for (const tc of testCases) {
    const start = Date.now();
    try {
      console.log(`▶ [${tc.id}] Running ${tc.title}...`);
      await tc.fn();
      const duration = Date.now() - start;
      results.push({
        id: tc.id,
        title: tc.title,
        status: "PASSED",
        durationMs: duration,
        error: null,
      });
      passedCount++;
      console.log(`✅ [${tc.id}] PASSED (${duration}ms)\n`);
    } catch (err: any) {
      const duration = Date.now() - start;
      console.error(`❌ [${tc.id}] FAILED:`, err.message, `\n`);
      results.push({
        id: tc.id,
        title: tc.title,
        status: "FAILED",
        durationMs: duration,
        error: err.message,
      });
      failedCount++;
    }
  }

  console.log("==========================================================");
  console.log(" 📊 TESTSPRITE BACKEND TEST SUMMARY");
  console.log("==========================================================");
  console.log(` Total Tests : ${testCases.length}`);
  console.log(` ✅ Passed    : ${passedCount}`);
  console.log(` ❌ Failed    : ${failedCount}`);
  console.log(` 📈 Pass Rate : ${((passedCount / testCases.length) * 100).toFixed(2)}%`);
  console.log("==========================================================\n");

  const tmpDir = path.join(__dirname, "tmp");
  if (!fs.existsSync(tmpDir)) {
    fs.mkdirSync(tmpDir, { recursive: true });
  }

  fs.writeFileSync(
    path.join(tmpDir, "backend_api_test_results.json"),
    JSON.stringify(results, null, 2),
    "utf8"
  );

  if (failedCount > 0) {
    process.exitCode = 1;
  }
}

main().catch((err) => {
  console.error("Fatal Error running backend test suite:", err);
  process.exitCode = 1;
});
