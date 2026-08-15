import rateLimit from "express-rate-limit";
import { env } from "../config/env.js";

/**
 * Rate Limiter Global untuk seluruh endpoint API (/api/*)
 * Membatasi jumlah request per IP dalam jendela waktu 15 menit.
 */
export const globalRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 menit
  limit: env.NODE_ENV === "development" ? 1000 : 300, // 1000 req di dev, 300 di production
  standardHeaders: "draft-7", // `RateLimit-*` headers standar
  legacyHeaders: false,
  message: {
    status: 429,
    error: "Too Many Requests",
    message: "Terlalu banyak permintaan dari IP ini. Silakan coba lagi setelah 15 menit.",
  },
});

/**
 * Rate Limiter Ketat khusus untuk rute Otentikasi (/api/auth/*)
 * Mencegah serangan Brute-Force Password & Spam Registrasi Akun.
 */
export const authRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 menit
  limit: env.NODE_ENV === "development" ? 100 : 15, // 100 percobaan di dev, 15 di production
  standardHeaders: "draft-7",
  legacyHeaders: false,
  message: {
    status: 429,
    error: "Too Many Requests",
    message: "Terlalu banyak percobaan login/registrasi. Silakan tunggu 15 menit demi keamanan akun.",
  },
});
