import { z } from "zod";

export const createJemaahSchema = z.object({
  name: z.string().trim().min(1, "Nama jemaah tidak boleh kosong").max(200, "Nama terlalu panjang"),
  address: z.string().trim().min(1, "Alamat tidak boleh kosong").max(500, "Alamat terlalu panjang"),
  phone: z.string().trim().min(1, "Nomor HP tidak boleh kosong").max(20, "Nomor HP terlalu panjang"),
  email: z.string().email("Format email tidak valid").max(255, "Email terlalu panjang").optional().nullable().or(z.literal("")),
  category: z.string().trim().min(1, "Kategori jemaah tidak boleh kosong").max(50, "Kategori terlalu panjang").default("Umum"),
  skills: z.string().trim().max(300, "Skills terlalu panjang").optional().nullable().or(z.literal("")),
  notes: z.string().trim().max(1000, "Catatan terlalu panjang").optional().nullable().or(z.literal("")),
  lat: z.number().optional().nullable(),
  lng: z.number().optional().nullable(),
});

export const publicRegisterJemaahSchema = z.object({
  name: z.string().trim().min(1, "Nama lengkap wajib diisi").max(200, "Nama terlalu panjang"),
  address: z.string().trim().min(1, "Alamat wajib diisi").max(500, "Alamat terlalu panjang"),
  category: z.string().trim().min(1, "Kategori jemaah wajib diisi").max(50, "Kategori terlalu panjang"),
  phone: z.string().trim().max(20, "Nomor telepon terlalu panjang").optional().nullable().or(z.literal("")),
  email: z.string().email("Format email tidak valid").max(255, "Email terlalu panjang").optional().nullable().or(z.literal("")),
  lat: z.number().optional().nullable(),
  lng: z.number().optional().nullable(),
}).superRefine((data, ctx) => {
  const requiresPhone = ["Mustahik", "Fakir", "Yatim"].includes(data.category);
  if (requiresPhone && (!data.phone || data.phone.trim() === "")) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: `Nomor telepon wajib diisi untuk kategori ${data.category}`,
      path: ["phone"],
    });
  }
});

