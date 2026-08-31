import rateLimit from "express-rate-limit";
import { env } from "../config/env.js";

/**
 * Rate Limiter Global untuk seluruh endpoint API (/api/*)
 * Membatasi jumlah request per IP dalam jendela waktu 15 menit.
 */
export const globalRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 menit
  limit: env.NODE_ENV === "development" ? 3000 : 1500, // 1.500 req di production (aman untuk SPA & multiple users di 1 WiFi/NAT)
  standardHeaders: "draft-7", // `RateLimit-*` headers standar
  legacyHeaders: false,
  message: {
    status: 429,
    error: "Too Many Requests",
    message: "Terlalu banyak permintaan dari IP ini. Silakan coba lagi setelah beberapa menit.",
  },
});

/**
 * Rate Limiter Ketat khusus untuk rute Otentikasi (/api/auth/*)
 * Mencegah serangan Brute-Force Password & Spam Registrasi Akun.
 */
export const authRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 menit
  limit: env.NODE_ENV === "development" ? 100 : 30, // 30 percobaan di production, 100 di dev
  standardHeaders: "draft-7",
  legacyHeaders: false,
  message: {
    status: 429,
    error: "Too Many Requests",
    message: "Terlalu banyak percobaan login/registrasi. Silakan tunggu 15 menit demi keamanan akun.",
  },
});
