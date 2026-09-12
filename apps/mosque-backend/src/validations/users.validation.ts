import { z } from "zod";

export const roleEnum = z.enum(["Ketua", "Sekretaris", "Bendahara", "Pengurus"], {
  errorMap: () => ({ message: "Peran pengguna harus salah satu dari: Ketua, Sekretaris, Bendahara, Pengurus" }),
});

export const createUserSchema = z.object({
  name: z
    .string()
    .trim()
    .min(1, "Nama pengguna wajib diisi")
    .max(100, "Nama terlalu panjang"),
  email: z
    .string()
    .trim()
    .email("Format email tidak valid")
    .max(255, "Email terlalu panjang"),
  role: roleEnum.default("Pengurus"),
  password: z
    .string()
    .min(8, "Kata sandi minimal 8 karakter")
    .optional(),
});

export const updateUserRoleSchema = z.object({
  role: roleEnum,
});

export const verifyAndSetPasswordSchema = z.object({
  token: z
    .string()
    .trim()
    .min(1, "Token verifikasi wajib diisi"),
  password: z
    .string()
    .min(8, "Kata sandi baru minimal 8 karakter"),
});
