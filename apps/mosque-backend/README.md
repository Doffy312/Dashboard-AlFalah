# 🕌 Mosque Backend — Al-Falah Dashboard API

Backend API untuk Sistem Informasi Manajemen & Portal Publik Masjid Al-Falah.

## Tech Stack

- **Runtime:** Node.js v24.x
- **Framework:** Express.js 5 + TypeScript
- **Database:** MySQL (Drizzle ORM)
- **Auth:** Better Auth (Cookie-based session)
- **Realtime:** Socket.IO
- **Security:** Helmet, Rate Limiter, Input Sanitizer, RBAC

---

## 🚀 Quick Start (Development)

### Prasyarat

- [Node.js](https://nodejs.org/) **v24.x** (lihat `.nvmrc`)
- [MySQL](https://dev.mysql.com/downloads/) **8.0+** (lokal atau cloud)
- [Git](https://git-scm.com/)

### 1. Clone & Install

```bash
git clone <repository-url>
cd Dashboard
npm install          # Install root + semua workspace
```

### 2. Setup Environment

```bash
cd apps/mosque-backend
cp .env.example .env
```

Edit `.env` dan sesuaikan:

```env
DATABASE_URL=mysql://root:password@localhost:3306/mosque_dashboard
BETTER_AUTH_SECRET=ganti-dengan-string-random-min-16-karakter
BETTER_AUTH_URL=http://localhost:3000
FRONTEND_URL=http://localhost:5173
```

> ⚠️ **PENTING:** `BETTER_AUTH_SECRET` harus string acak minimal 16 karakter.
> Gunakan: `node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"`

### 3. Setup Database

```bash
# Buat database MySQL
mysql -u root -p -e "CREATE DATABASE mosque_dashboard;"

# Push schema ke database
npm run db:push

# (Opsional) Seed data contoh
npm run db:seed

# (Opsional) Seed akun admin pertama
npm run db:seed:user
```

### 4. Jalankan Server

```bash
# Dari root project (jalankan backend + frontend bersamaan)
cd ../..
npm run dev

# Atau dari folder backend saja
cd apps/mosque-backend
npm run dev
```

Server berjalan di `http://localhost:3000`

---

## 📦 Deployment (Production)

### Environment Variables yang Wajib

| Variable | Deskripsi | Contoh |
|---|---|---|
| `NODE_ENV` | Mode environment | `production` |
| `PORT` | Port server | `3000` |
| `DATABASE_URL` | Connection string MySQL | `mysql://user:pass@host:3306/db` |
| `BETTER_AUTH_SECRET` | Secret key untuk session (min 16 char) | `a1b2c3d4e5f6...` |
| `BETTER_AUTH_URL` | URL publik backend | `https://api.masjid-alfalah.org` |
| `FRONTEND_URL` | URL publik frontend | `https://masjid-alfalah.org` |

### Environment Variables Opsional

| Variable | Deskripsi | Default |
|---|---|---|
| `CORS_ORIGINS` | Extra allowed origins (comma-separated) | — |
| `SMTP_HOST` | SMTP server untuk email | — |
| `SMTP_PORT` | SMTP port | `587` |
| `SMTP_USER` | Email pengirim | — |
| `SMTP_PASS` | App password email | — |
| `EMAIL_FROM` | Display name email | `Takmir Masjid <noreply@masjid.local>` |

### Build & Start

```bash
npm run build     # Compile TypeScript → dist/
npm start         # Jalankan dari dist/index.js
```

### Deploy ke Render.com

Project sudah memiliki `render.yaml` di root. Cukup:

1. Push ke GitHub
2. Hubungkan repo di [Render Dashboard](https://dashboard.render.com/)
3. Set environment variables di Render
4. Deploy otomatis dari branch `main`

---

## 🗄️ Perintah Database

```bash
npm run db:push       # Push schema langsung ke DB (development)
npm run db:generate   # Generate migration files
npm run db:migrate    # Jalankan migration files
npm run db:seed       # Seed data contoh
npm run db:seed:user  # Seed akun admin
npm run db:studio     # Buka Drizzle Studio (GUI browser)
```

---

## 🧪 Testing

```bash
npm test              # Jalankan semua unit test (Vitest)
```

---

## 📁 Struktur Folder

```
mosque-backend/
├── src/
│   ├── config/         # Environment & database config
│   ├── controllers/    # Route handlers (13 controllers)
│   ├── db/
│   │   └── schema/     # Drizzle ORM schema (14 tables)
│   ├── lib/            # Utilities (auth, socket, etc.)
│   ├── middlewares/     # Auth, RBAC, rate limiter, sanitizer
│   ├── routes/         # Express route definitions
│   ├── services/       # Business logic layer
│   ├── validations/    # Zod validation schemas
│   ├── __tests__/      # Unit tests
│   └── index.ts        # Entry point
├── uploads/            # User-uploaded files
├── drizzle.config.ts   # Drizzle Kit config
├── tsconfig.json
└── package.json
```

---

## 🔐 Catatan Keamanan

- **Jangan pernah** commit file `.env` ke Git
- Gunakan `BETTER_AUTH_SECRET` yang berbeda untuk setiap environment
- Rotasi password database dan secret key secara berkala (per 6 bulan)
- Periksa kerentanan dependencies: `npm audit`
- Backup database otomatis setiap hari jam 02:00 WIB (lihat `backup.service.ts`)
