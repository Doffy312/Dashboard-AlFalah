import { describe, it, expect } from "vitest";

function formatAuditLogEntry(params: {
  userName: string;
  userRole: string;
  action: string;
  entity: string;
  details?: Record<string, any>;
}) {
  return {
    userName: params.userName || "System",
    userRole: params.userRole || "system",
    action: params.action,
    entity: params.entity,
    details: params.details ? JSON.stringify(params.details) : null,
    timestamp: new Date().toISOString(),
  };
}

describe("Audit Log Service & Payload Formatting Unit Tests", () => {
  it("harus membuat struktur data audit log secara valid dan terformat", () => {
    const entry = formatAuditLogEntry({
      userName: "Ustadz Ahmad",
      userRole: "Bendahara",
      action: "CREATE_TRANSACTION",
      entity: "transaction",
      details: { amount: 1000000, category: "Infaq" },
    });

    expect(entry.userName).toBe("Ustadz Ahmad");
    expect(entry.userRole).toBe("Bendahara");
    expect(entry.action).toBe("CREATE_TRANSACTION");
    expect(entry.entity).toBe("transaction");
    expect(typeof entry.details).toBe("string");
    expect(entry.details).toContain("1000000");
  });

  it("harus menggunakan default System jika userName tidak diberikan", () => {
    const entry = formatAuditLogEntry({
      userName: "",
      userRole: "",
      action: "SYSTEM_SYNC",
      entity: "program",
    });

    expect(entry.userName).toBe("System");
    expect(entry.userRole).toBe("system");
    expect(entry.details).toBeNull();
  });
});
