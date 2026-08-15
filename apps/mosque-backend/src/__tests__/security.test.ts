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
});
