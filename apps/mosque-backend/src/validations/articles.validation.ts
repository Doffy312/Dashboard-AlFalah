import { z } from "zod";

export const createArticleSchema = z.object({
  title: z
    .string()
    .trim()
    .min(1, "Judul berita/artikel wajib diisi")
    .max(255, "Judul terlalu panjang (maksimal 255 karakter)"),
  category: z
    .string()
    .trim()
    .min(1, "Kategori wajib dipilih")
    .max(100, "Kategori terlalu panjang"),
  type: z.string().trim().optional(),
  date: z
    .string()
    .trim()
    .min(1, "Tanggal publikasi wajib diisi"),
  author: z
    .string()
    .trim()
    .min(1, "Nama penulis/sumber wajib diisi")
    .max(150, "Nama penulis terlalu panjang"),
  readTime: z.string().trim().optional(),
  image: z.string().optional(),
  summary: z.string().optional(),
  content: z
    .string()
    .trim()
    .min(1, "Isi berita/artikel lengkap wajib diisi"),
});

export const updateArticleSchema = createArticleSchema.partial();
