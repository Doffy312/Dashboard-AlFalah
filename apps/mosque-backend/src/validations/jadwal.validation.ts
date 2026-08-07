import { z } from "zod";

export const createJadwalSchema = z.object({
  date: z.string().trim().min(1, "Tanggal tidak boleh kosong"),
  role: z.enum(["Khotib Jumat", "Imam Rawatib", "Muadzin", "Penceramah Kajian"], {
    errorMap: () => ({ message: "Peran/Tugas tidak valid" })
  }),
  personName: z.string().trim().min(1, "Nama petugas tidak boleh kosong").max(200, "Nama terlalu panjang"),
  contact: z.string().trim().max(20, "Kontak terlalu panjang").optional(),
  topic: z.string().trim().max(300, "Topik terlalu panjang").optional(),
});
