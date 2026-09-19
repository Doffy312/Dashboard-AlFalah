import { describe, it, expect } from "vitest";
import { maskSensitiveData } from "../services/errorLog.service.js";

describe("Error Log Service & Sanitization Unit Tests", () => {
  it("harus menyensor field sensitif seperti password, token, dan secret", () => {
    const rawData = {
      username: "admin_alfalah",
      password: "SuperSecretPassword123!",
      nested: {
        token: "jwt-token-value-xyz",
        apiKey: "private_key_12345",
        normalField: "safe value",
      },
      tags: ["admin", "testing"],
    };

    const sanitized = maskSensitiveData(rawData);

    expect(sanitized.username).toBe("admin_alfalah");
    expect(sanitized.password).toBe("[REDACTED]");
    expect(sanitized.nested.token).toBe("[REDACTED]");
    expect(sanitized.nested.apiKey).toBe("[REDACTED]");
    expect(sanitized.nested.normalField).toBe("safe value");
    expect(sanitized.tags).toEqual(["admin", "testing"]);
  });

  it("harus aman menangani null, undefined, dan tipe data primitif", () => {
    expect(maskSensitiveData(null)).toBeNull();
    expect(maskSensitiveData(undefined)).toBeUndefined();
    expect(maskSensitiveData("simple string")).toBe("simple string");
    expect(maskSensitiveData(12345)).toBe(12345);
  });

  it("harus melakukan rekursif masking pada array of objects", () => {
    const arrayData = [
      { id: 1, secret: "classified" },
      { id: 2, pin: "1234" },
    ];

    const sanitized = maskSensitiveData(arrayData);
    expect(sanitized[0].secret).toBe("[REDACTED]");
    expect(sanitized[1].pin).toBe("[REDACTED]");
    expect(sanitized[0].id).toBe(1);
  });
});
