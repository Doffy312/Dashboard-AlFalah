import { z } from "zod";

export const createZiswafSchema = z.object({
  type: z.enum(["Zakat Fitrah", "Zakat Mal", "Infaq", "Sedekah", "Wakaf"], {
    errorMap: () => ({ message: "Tipe ZISWAF tidak valid" })
  }),
  amount: z.union([z.string(), z.number()]).transform((val) => String(val)).refine((val) => !isNaN(Number(val)) && Number(val) > 0, "Nominal harus angka lebih dari 0"),
  date: z.string().trim().min(1, "Tanggal tidak boleh kosong"),
  donorName: z.string().trim().min(1, "Nama donatur tidak boleh kosong").max(200, "Nama terlalu panjang"),
  description: z.string().trim().max(500, "Deskripsi terlalu panjang").optional().nullable(),
});
