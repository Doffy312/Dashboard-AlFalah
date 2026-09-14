# Panduan Deployment Frontend ke Vercel (`mosque-dashboard`)

Panduan ini memandu langkah-langkah deployment aplikasi frontend React Vite (`apps/mosque-dashboard`) ke platform **Vercel** dengan konfigurasi arsitektur monorepo.

---

## 1. Persiapan yang Telah Dikonfigurasi di Repositori

File konfigurasi [`vercel.json`](file:///e:/Dashboard/apps/mosque-dashboard/vercel.json) telah dibuat di dalam direktori `apps/mosque-dashboard/` dengan fitur:
- **SPA Rewrites**: Mencegah error 404 ketika browser me-refresh URL halaman selain root (misalnya `/dashboard`, `/keuangan`, `/agenda`, `/login`).
- **Security Headers**: Dilengkapi header keamanan `X-Content-Type-Options`, `X-Frame-Options`, dan `Referrer-Policy`.
- **Cache Optimization**: Header `Cache-Control: public, max-age=31536000, immutable` untuk bundle aset statis di `/assets/*`.

---

## 2. Langkah Deploy melalui Dashboard Vercel (Web UI - Direkomendasikan)

### Langkah A: Import Repositori
1. Buka [dashboard vercel.com](https://vercel.com/dashboard) dan login menggunakan akun GitHub Anda.
2. Klik tombol **"Add New..."** > **"Project"**.
3. Cari repositori Anda (`Dashboard-AlFalah` atau nama repo GitHub Anda) lalu klik **"Import"**.

### Langkah B: Pengaturan Root Directory (SANGAT PENTING)
Karena repositori ini berbentuk **Monorepo**, Anda wajib menentukan folder frontend:
1. Pada bagian **"Root Directory"**, klik tombol **"Edit"**.
2. Pilih atau ketik: `apps/mosque-dashboard`.
3. Klik **"Continue"**.

### Langkah C: Konfigurasi Build & Output
Vercel akan otomatis mendeteksi:
- **Framework Preset**: `Vite`
- **Build Command**: `npm run build`
- **Output Directory**: `dist`
- **Install Command**: `npm install`
*(Biarkan pengaturan default sesuai di atas)*.

### Langkah D: Konfigurasi Environment Variables
Di bagian **Environment Variables**, tambahkan variabel berikut:

| Key | Value Contoh | Keterangan |
| :--- | :--- | :--- |
| `VITE_API_URL` | `https://mosque-backend.onrender.com` | URL root backend API production (tanpa trailing slash) |

> [!NOTE]
> Frontend sudah dirancang cerdas: baik Anda mengisi `https://backend.com` atau `https://backend.com/api`, modul [`src/lib/api.js`](file:///e:/Dashboard/apps/mosque-dashboard/src/lib/api.js) dan [`src/lib/auth-client.js`](file:///e:/Dashboard/apps/mosque-dashboard/src/lib/auth-client.js) akan otomatis menormalkannya.

### Langkah E: Deploy
Klik tombol **"Deploy"**. Tunggu proses build selesai (~1-2 menit). Vercel akan memberikan domain publik (contoh: `https://mosque-dashboard-xxx.vercel.app`).

---

## 3. Sinkronisasi Konfigurasi Backend (Render / VPS)

Setelah mendapatkan URL domain dari Vercel, pastikan backend mengizinkan origin tersebut agar proses **Login (Better Auth)**, **Cookies/Session**, dan **Socket.IO Realtime** dapat berjalan normal:

Pada dashboard hosting backend Anda (misalnya di Render / VPS `.env`):
1. **`FRONTEND_URL`**: Isi dengan domain Vercel Anda:
   ```env
   FRONTEND_URL=https://mosque-dashboard.vercel.app
   ```
2. **`CORS_ORIGINS`** *(opsional jika ada domain lain/custom domain)*:
   ```env
   CORS_ORIGINS=https://mosque-dashboard.vercel.app,https://masjid-alfalah.com
   ```
3. Restart / redeploy backend agar variabel lingkungan baru terbaca.

---

## 4. Opsi Alternatif: Deploy Menggunakan Vercel CLI

Jika ingin mendeploy langsung dari terminal komputer Anda:

1. Buka terminal dan masuk ke folder frontend:
   ```bash
   cd apps/mosque-dashboard
   ```
2. Jalankan perintah Vercel CLI:
   ```bash
   npx vercel
   ```
3. Ikuti panduan interaktif:
   - *Set up and deploy?* -> `Y`
   - *Which scope?* -> Pilih akun Vercel Anda.
   - *Link to existing project?* -> `N` (atau `Y` jika sudah pernah dibuat).
   - *What's your project's name?* -> `mosque-dashboard` (atau nama pilihan).
   - *In which directory is your code located?* -> `./` (karena sudah berada di dalam `apps/mosque-dashboard`).
4. Untuk deploy ke production:
   ```bash
   npx vercel --prod
   ```

---

## 5. Checklist Verifikasi Pasca-Deploy

- [ ] Buka URL Vercel di browser (contoh: `https://mosque-dashboard.vercel.app`).
- [ ] Coba navigasi ke halaman sub-rute (misal: `/login`, `/agenda`, `/jadwal-sholat`).
- [ ] Lakukan **Refresh Browser (F5)** di halaman rute tersebut — pastikan tidak muncul error 404 (sudah ditangani oleh `vercel.json`).
- [ ] Buka Developer Tools (F12) > tab **Console** dan **Network**, verifikasi bahwa request API mengarah ke URL backend production dan tidak ada CORS error.
- [ ] Uji coba Login takmir dan periksa status indikator realtime Socket.IO.
