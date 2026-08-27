import { z } from "zod";

export const createProgramSchema = z.object({
  name: z.string().trim().min(1, "Nama program tidak boleh kosong").max(200, "Nama terlalu panjang"),
  pic: z.string().trim().min(1, "Penanggung jawab (PIC) tidak boleh kosong").max(200, "PIC terlalu panjang"),
  budget: z.union([z.string(), z.number()]).transform((val) => String(val)).refine((val) => !isNaN(Number(val)) && Number(val) > 0, "Anggaran harus angka lebih dari 0"),
  status: z.enum(["Direncanakan", "Sedang Berjalan", "Selesai"], {
    errorMap: () => ({ message: "Status program tidak valid" })
  }),
  date: z.string().trim().min(1, "Tanggal tidak boleh kosong"),
  originalDate: z.string().trim().nullable().optional(),
  description: z.string().trim().min(1, "Deskripsi tidak boleh kosong").max(2000, "Deskripsi terlalu panjang"),
  evaluation: z.string().trim().max(2000, "Evaluasi terlalu panjang").optional(),
});
