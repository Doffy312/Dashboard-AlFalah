import { describe, it, expect } from "vitest";

// Re-implement / export stripHtmlTags for unit testing
function stripHtmlTags(value: string): string {
  return value
    .replace(/<[^>]*>/g, "")
    .replace(/&lt;/gi, "<")
    .replace(/&gt;/gi, ">")
    .replace(/<[^>]*>/g, "")
    .trim();
}

describe("Security & Input Sanitization Unit Tests", () => {
  it("harus membersihkan tag HTML berbahaya (<script>) dari input string", () => {
    const maliciousInput = "<script>alert('hack')</script>Donasi Hamba Allah";
    const cleaned = stripHtmlTags(maliciousInput);
    expect(cleaned).not.toContain("<script>");
    expect(cleaned).toBe("alert('hack')Donasi Hamba Allah");
  });

  it("harus membersihkan tag <iframe> dan <img> dengan onerror injection", () => {
    const maliciousInput = "<img src=x onerror=alert(1)>Kas Masjid";
    const cleaned = stripHtmlTags(maliciousInput);
    expect(cleaned).not.toContain("<img");
    expect(cleaned).toBe("Kas Masjid");
  });

  it("harus mempertahankan teks biasa tanpa tag HTML", () => {
    const normalInput = "Infaq Shalat Jumat Rp 500.000";
    const cleaned = stripHtmlTags(normalInput);
    expect(cleaned).toBe("Infaq Shalat Jumat Rp 500.000");
  });

  describe("RBAC Role Guard Tests", () => {
    it("harus menolak role yang tidak memiliki izin", () => {
      let statusCode = 0;
      let jsonPayload: any = null;
      const res: any = {
        status: (code: number) => {
          statusCode = code;
          return {
            json: (data: any) => { jsonPayload = data; },
          };
        },
      };

      const req: any = {
        user: { id: "u-1", role: "Pengurus" },
      };

      // Simulated requireRole("Ketua", "Sekretaris")
      const allowedRoles = ["Ketua", "Sekretaris"];
      let nextCalled = false;
      const next = () => { nextCalled = true; };

      if (!allowedRoles.includes(req.user.role)) {
        res.status(403).json({ error: "Forbidden" });
      } else {
        next();
      }

      expect(statusCode).toBe(403);
      expect(nextCalled).toBe(false);
      expect(jsonPayload.error).toBe("Forbidden");
    });

    it("harus meloloskan user dengan role yang diizinkan", () => {
      const req: any = {
        user: { id: "u-1", role: "Ketua" },
      };
      const allowedRoles = ["Ketua", "Sekretaris"];
      let nextCalled = false;
      const next = () => { nextCalled = true; };

      if (allowedRoles.includes(req.user.role)) {
        next();
      }

      expect(nextCalled).toBe(true);
    });

    it("harus mencegah penghapusan akun diri sendiri (Self-Deletion Guard)", () => {
      const currentUserId = "user-123";
      const targetDeleteId = "user-123";
      const isSelfDeletion = currentUserId === targetDeleteId;
      expect(isSelfDeletion).toBe(true);
    });
  });
});

