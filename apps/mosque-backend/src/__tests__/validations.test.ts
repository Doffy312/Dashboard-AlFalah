import { describe, it, expect } from "vitest";
import { createUserSchema, updateUserRoleSchema, verifyAndSetPasswordSchema } from "../validations/users.validation.js";
import { createQurbanTahunSchema, createPequrbanSchema } from "../validations/qurban.validation.js";
import { createContactMessageSchema } from "../validations/contactMessages.validation.js";
import { settingKeyEnum, profileSettingsSchema } from "../validations/settings.validation.js";

describe("Backend Zod Validation Schemas", () => {
  describe("Users Validation", () => {
    it("harus meloloskan user baru dengan data valid", () => {
      const valid = createUserSchema.safeParse({
        name: "Ahmad Dahlan",
        email: "ahmad@masjid.id",
        role: "Bendahara",
        password: "securePassword123",
      });
      expect(valid.success).toBe(true);
    });

    it("harus menolak user dengan email tidak valid", () => {
      const result = createUserSchema.safeParse({
        name: "Test User",
        email: "not-an-email",
      });
      expect(result.success).toBe(false);
    });

    it("harus menolak password kurang dari 8 karakter", () => {
      const result = verifyAndSetPasswordSchema.safeParse({
        token: "uuid-token-123",
        password: "12345",
      });
      expect(result.success).toBe(false);
    });

    it("harus menolak role yang tidak ada dalam daftar yang diizinkan", () => {
      const result = updateUserRoleSchema.safeParse({
        role: "SuperAdmin",
      });
      expect(result.success).toBe(false);
    });
  });

  describe("Qurban Validation", () => {
    it("harus meloloskan tahun qurban yang valid dengan type coercion", () => {
      const result = createQurbanTahunSchema.safeParse({
        tahun: "2025",
        statusAktif: true,
      });
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.tahun).toBe(2025);
      }
    });

    it("harus menolak hewan selain Sapi dan Kambing", () => {
      const result = createPequrbanSchema.safeParse({
        jemaahId: "j-123",
        qurbanTahunId: "q-2025",
        jenisHewan: "Unta",
      });
      expect(result.success).toBe(false);
    });
  });

  describe("Contact Messages Validation", () => {
    it("harus menolak pesan kontak dengan email tidak valid atau nama kosong", () => {
      const result = createContactMessageSchema.safeParse({
        fullName: "",
        email: "invalid-email",
        whatsapp: "08123456789",
        subject: "Tanya",
        message: "Halo",
      });
      expect(result.success).toBe(false);
    });

    it("harus meloloskan pesan kontak dengan data lengkap", () => {
      const result = createContactMessageSchema.safeParse({
        fullName: "Fulan bin Fulan",
        email: "fulan@example.com",
        whatsapp: "081234567890",
        subject: "Pertanyaan Infaq",
        message: "Bagaimana cara konfirmasi infaq transfer?",
      });
      expect(result.success).toBe(true);
    });
  });

  describe("Settings Validation", () => {
    it("harus menerima key yang diizinkan dan menolak key sembarang", () => {
      expect(settingKeyEnum.safeParse("profile").success).toBe(true);
      expect(settingKeyEnum.safeParse("finance").success).toBe(true);
      expect(settingKeyEnum.safeParse("arbitraryKey").success).toBe(false);
    });

    it("harus memvalidasi profil masjid", () => {
      const result = profileSettingsSchema.safeParse({
        orgName: "Masjid Al-Falah",
        email: "info@masjidalfalah.id",
      });
      expect(result.success).toBe(true);
    });
  });
});
