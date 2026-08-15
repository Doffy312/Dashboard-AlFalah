import { z } from "zod";

export const createTransactionSchema = z.object({
  date: z.string().trim().min(1, "Tanggal tidak boleh kosong"),
  type: z.enum(["Pemasukan", "Pengeluaran"], {
    errorMap: () => ({ message: "Tipe transaksi tidak valid" })
  }),
  category: z.string().trim().min(1, "Kategori tidak boleh kosong").max(100, "Kategori terlalu panjang"),
  amount: z.union([z.string(), z.number()]).transform((val) => String(val)).refine((val) => !isNaN(Number(val)) && Number(val) > 0, "Nominal harus angka lebih dari 0"),
  description: z.string().trim().min(1, "Deskripsi tidak boleh kosong").max(500, "Deskripsi terlalu panjang"),
  programId: z.string().optional().or(z.literal("")),
});

export const publicDonateSchema = z.object({
  amount: z.union([z.string(), z.number()]).transform((val) => String(val)).refine((val) => !isNaN(Number(val)) && Number(val) > 0, "Nominal donasi harus angka lebih dari 0"),
  donorName: z.string().trim().optional().transform((val) => val && val.trim().length > 0 ? val : "Hamba Allah"),
  type: z.string().trim().optional().transform((val) => val && val.trim().length > 0 ? val : "Infaq"),
  description: z.string().trim().optional(),
});

