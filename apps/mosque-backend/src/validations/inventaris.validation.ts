import { z } from "zod";

export const createInventarisSchema = z.object({
  name: z.string().trim().min(1, "Nama barang tidak boleh kosong").max(200, "Nama terlalu panjang"),
  quantity: z.number().int().min(1, "Jumlah barang minimal 1"),
  date: z.string().trim().min(1, "Tanggal tidak boleh kosong"),
  location: z.string().trim().min(1, "Lokasi tidak boleh kosong").max(300, "Lokasi terlalu panjang"),
  condition: z.enum(["Baik", "Rusak Ringan", "Rusak Berat"], {
    errorMap: () => ({ message: "Kondisi barang tidak valid" })
  }),
  notes: z.string().trim().max(1000, "Catatan terlalu panjang").optional(),
});
