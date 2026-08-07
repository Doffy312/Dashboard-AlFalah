import { z } from "zod";

export const createJemaahSchema = z.object({
  name: z.string().trim().min(1, "Nama jemaah tidak boleh kosong").max(200, "Nama terlalu panjang"),
  address: z.string().trim().min(1, "Alamat tidak boleh kosong").max(500, "Alamat terlalu panjang"),
  phone: z.string().trim().min(1, "Nomor HP tidak boleh kosong").max(20, "Nomor HP terlalu panjang"),
  email: z.string().email("Format email tidak valid").max(255, "Email terlalu panjang").optional().nullable().or(z.literal("")),
  category: z.string().trim().min(1, "Kategori jemaah tidak boleh kosong").max(50, "Kategori terlalu panjang").default("Umum"),
  skills: z.string().trim().max(300, "Skills terlalu panjang").optional().nullable().or(z.literal("")),
  notes: z.string().trim().max(1000, "Catatan terlalu panjang").optional().nullable().or(z.literal("")),
});
