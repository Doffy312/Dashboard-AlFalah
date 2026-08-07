import { z } from "zod";

export const createQurbanSchema = z.object({
  participantName: z.string().trim().min(1, "Nama peserta tidak boleh kosong").max(200, "Nama terlalu panjang"),
  animalType: z.enum(["Sapi", "Kambing", "Domba"], {
    errorMap: () => ({ message: "Jenis hewan tidak valid" })
  }),
  year: z.coerce.number().int().min(2000, "Tahun tidak valid"),
  status: z.enum(["Lunas", "Belum Lunas"], {
    errorMap: () => ({ message: "Status pembayaran tidak valid" })
  }),
  notes: z.string().trim().max(1000, "Catatan terlalu panjang").optional(),
});
