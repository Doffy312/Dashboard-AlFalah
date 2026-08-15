import { z } from "zod";

export const createContactMessageSchema = z.object({
  fullName: z
    .string()
    .trim()
    .min(1, "Nama lengkap wajib diisi")
    .max(255, "Nama lengkap terlalu panjang"),
  email: z
    .string()
    .trim()
    .email("Alamat email tidak valid")
    .max(255, "Email terlalu panjang"),
  whatsapp: z
    .string()
    .trim()
    .min(1, "Nomor WhatsApp wajib diisi")
    .max(50, "Nomor WhatsApp terlalu panjang"),
  subject: z
    .string()
    .trim()
    .min(1, "Subjek wajib dipilih/diisi")
    .max(255, "Subjek terlalu panjang"),
  message: z
    .string()
    .trim()
    .min(1, "Isi pesan wajib diisi"),
});

export const updateContactMessageStatusSchema = z.object({
  status: z.enum(["Baru", "Dibaca", "Selesai"], {
    message: "Status harus Baru, Dibaca, atau Selesai",
  }),
});
