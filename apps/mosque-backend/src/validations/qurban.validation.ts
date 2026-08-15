import { z } from "zod";

export const createQurbanTahunSchema = z.object({
  tahun: z.number({ required_error: "Tahun harus diisi" }).int().min(2000).max(2100),
  statusAktif: z.boolean().optional().default(true),
});

export const createQurbanKelompokSchema = z.object({
  qurbanTahunId: z.string().min(1, "Tahun Qurban ID harus diisi"),
  namaKelompok: z.string().trim().min(1, "Nama Kelompok harus diisi"),
  jenisHewan: z.enum(["Sapi", "Kambing"]).default("Sapi"),
  nomorUrut: z.number().int().optional().default(1),
});

export const createPequrbanSchema = z.object({
  jemaahId: z.string().min(1, "Jemaah harus dipilih"),
  qurbanTahunId: z.string().min(1, "Tahun Qurban harus dipilih"),
  jenisHewan: z.enum(["Sapi", "Kambing"], {
    errorMap: () => ({ message: "Jenis hewan harus Sapi atau Kambing" }),
  }),
  qurbanKelompokId: z.string().optional().nullable(),
  namaKelompokBaru: z.string().optional().nullable(),
  status: z.enum(["Proses", "Lunas", "Selesai"]).default("Proses"),
  catatan: z.string().trim().max(1000, "Catatan terlalu panjang").optional().nullable(),
});

export const updatePequrbanSchema = createPequrbanSchema.partial();
