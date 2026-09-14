# Panduan Deployment Backend ke Railway (`mosque-backend`)

Panduan ini memandu langkah-langkah deployment backend Express + TypeScript (`apps/mosque-backend`) ke platform **Railway**, termasuk setup database MySQL.

---

## 1. File Konfigurasi yang Telah Disiapkan

| File | Fungsi |
| :--- | :--- |
| [`railway.json`](file:///e:/Dashboard/apps/mosque-backend/railway.json) | Konfigurasi builder, build/start command, health check, dan restart policy |
| [`.railwayignore`](file:///e:/Dashboard/apps/mosque-backend/.railwayignore) | Mengecualikan `node_modules`, `dist`, `uploads`, `.env` dari upload |
| [`auth.ts`](file:///e:/Dashboard/apps/mosque-backend/src/config/auth.ts) | **Perbaikan kritis**: Auto-detect cross-domain deployment dan set `SameSite=None; Secure` pada session cookies |

---

## 2. Langkah Deploy melalui Railway Dashboard

### Langkah A: Buat Project & Add Database MySQL

1. Buka [railway.app/dashboard](https://railway.app/dashboard) dan login dengan GitHub.
2. Klik **"New Project"**.
3. Pilih **"Add a Service"** → **"Database"** → **"MySQL"**.
4. Railway akan otomatis membuat instance MySQL. Klik service MySQL tersebut, lalu buka tab **"Variables"**.
5. Salin nilai variabel `DATABASE_URL` (format: `mysql://root:password@host:port/railway`). Simpan ini untuk langkah berikutnya.

### Langkah B: Deploy Backend dari GitHub

1. Di project yang sama, klik **"New Service"** → **"GitHub Repo"**.
2. Pilih repositori GitHub Anda (`Dashboard-AlFalah` atau nama repo Anda).
3. Setelah terhubung, buka **"Settings"** pada service backend:

   **Root Directory** (SANGAT PENTING untuk Monorepo):
   ```
   apps/mosque-backend
   ```

4. Railway akan otomatis mendeteksi `railway.json` dan menggunakan konfigurasi:
   - **Build Command**: `npm install && npm run build`
   - **Start Command**: `npm start`
   - **Health Check**: `/api/health`

### Langkah C: Konfigurasi Environment Variables

Buka tab **"Variables"** pada service backend, lalu tambahkan:

| Variable | Value | Keterangan |
| :--- | :--- | :--- |
| `NODE_ENV` | `production` | Mode production |
| `PORT` | `3000` | Railway juga meng-inject `PORT` sendiri, 3000 sebagai fallback |
| `DATABASE_URL` | `mysql://root:...@...railway.app:PORT/railway` | Salin dari service MySQL Railway (Langkah A.5) |
| `BETTER_AUTH_SECRET` | *(string acak min 32 karakter)* | Generate dengan: `openssl rand -hex 32` |
| `BETTER_AUTH_URL` | `https://<nama-service>.up.railway.app` | URL publik backend dari Railway |
| `FRONTEND_URL` | `https://<nama-project>.vercel.app` | URL frontend yang dideploy di Vercel |

**Opsional (Email SMTP):**

| Variable | Value |
| :--- | :--- |
| `SMTP_HOST` | `smtp.gmail.com` |
| `SMTP_PORT` | `587` |
| `SMTP_USER` | `email@gmail.com` |
| `SMTP_PASS` | *(App Password Gmail)* |

> [!IMPORTANT]
> **Jangan gunakan password Gmail biasa!** Gunakan **App Password** dari Google Account → Security → 2-Step Verification → App Passwords.

### Langkah D: Hubungkan Database (Reference Variable)

Railway mendukung **Reference Variables** agar backend otomatis terhubung ke database tanpa copy-paste manual:

1. Pada service backend, buka tab **"Variables"**.
2. Klik **"Add Variable"** → pilih **"Add Reference"**.
3. Pilih service MySQL → variabel `DATABASE_URL`.
4. Railway akan otomatis meng-inject connection string yang benar.

### Langkah E: Deploy

Klik **"Deploy"** atau tunggu Railway auto-deploy saat ada push ke branch utama. Verifikasi:
1. Buka **Deployments** tab dan tunggu status menjadi **"Success"**.
2. Buka URL publik backend (tab **"Settings"** → **"Public Networking"** → **"Generate Domain"**).
3. Akses `https://<domain>.up.railway.app/api/health` — harus menampilkan `{"status":"ok"}`.

---

## 3. Inisialisasi Database (Pertama Kali)

Setelah backend dan database MySQL terhubung, Anda perlu membuat tabel-tabel database.

### Opsi A: Menggunakan `db:push` (Cepat, Tanpa Migration History)

Dari terminal lokal Anda, set `DATABASE_URL` ke database Railway lalu jalankan:

```bash
cd apps/mosque-backend
set DATABASE_URL=mysql://root:password@host:port/railway
npx drizzle-kit push
```

### Opsi B: Menggunakan Migration Files

```bash
cd apps/mosque-backend
set DATABASE_URL=mysql://root:password@host:port/railway
npx tsx src/db/migrate.ts
```

### Seed User Admin (Opsional)

Setelah tabel dibuat, buat user admin pertama:

```bash
cd apps/mosque-backend
set DATABASE_URL=mysql://root:password@host:port/railway
set BETTER_AUTH_SECRET=<secret-yang-sama-dengan-railway>
set BETTER_AUTH_URL=https://<domain>.up.railway.app
npx tsx src/db/seed-user.ts
```

---

## 4. Sinkronisasi dengan Frontend (Vercel)

Setelah backend Railway berjalan, pastikan saling terhubung:

### Di Vercel (Frontend):
```
VITE_API_URL = https://<backend-domain>.up.railway.app
```

### Di Railway (Backend):
```
FRONTEND_URL = https://<frontend-domain>.vercel.app
```

---

## 5. Catatan Penting

### ⚠️ File Uploads (Ephemeral Filesystem)
Railway menggunakan filesystem **ephemeral** — file yang ditulis ke disk (folder `uploads/`) akan **hilang** setiap kali service di-redeploy. Untuk solusi permanen, pertimbangkan:
- **Cloudinary** (gratis tier 25GB)
- **AWS S3** / **Cloudflare R2**
- **Supabase Storage**

### ⚠️ Cross-Domain Cookies (Sudah Ditangani)
File [`auth.ts`](file:///e:/Dashboard/apps/mosque-backend/src/config/auth.ts) telah dimodifikasi untuk otomatis mendeteksi deployment cross-domain. Ketika `FRONTEND_URL` dan `BETTER_AUTH_URL` berada di domain berbeda, session cookies akan menggunakan `SameSite=None; Secure` agar login berfungsi lintas domain.

### ⚠️ Railway Pricing
Railway memberikan **$5 free credit per bulan** pada Hobby plan. Untuk backend Node.js sederhana dengan MySQL, ini biasanya cukup. Monitor penggunaan di dashboard Railway.

---

## 6. Checklist Verifikasi Pasca-Deploy

- [ ] Akses `https://<backend>.up.railway.app/api/health` → respons `{"status":"ok"}`
- [ ] Akses `https://<frontend>.vercel.app` → halaman landing tampil normal
- [ ] Buka DevTools (F12) → Console — tidak ada error CORS
- [ ] Login dengan akun admin → session tersimpan dan halaman dashboard dapat diakses
- [ ] Socket.IO realtime indicator aktif di dashboard
- [ ] Coba refresh browser di halaman `/dashboard` — tidak 404
