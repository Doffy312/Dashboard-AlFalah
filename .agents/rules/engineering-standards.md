# Engineering Standards & Core Operating Rules

> **Status:** Active Workspace Rules  
> **Master Reference:** Consult [SOP_Web_Application_Engineering_Professional.md](../../SOP_Web_Application_Engineering_Professional.md) for deep architectural, database, testing, and deployment audits.

---

## 1. Core Principles & Priority Hierarchy

When modifying or developing features, prioritize in this strict order:
1. **Preserve existing functionality** (Golden Rule: Jangan refactor besar hanya demi modernisasi; jaga backward compatibility).
2. **Security & Least Privilege** (Lindungi data, session, API, dan database).
3. **Data Integrity & Correctness** (Pastikan transaksi atomik & validasi ketat).
4. **Performance & Scalability** (Ukur sebelum optimasi; hindari query & render berlebih).
5. **Maintainability & Observability** (Kode sederhana, konsisten, log error jelas).

---

## 2. The Engineering Commandments (Non-Negotiable)

- **Input & Validation:** *Never trust client input.* Validasi runtime wajib dengan Zod/schema validation; jangan berasumsi TypeScript types menggantikan validasi runtime.
- **Security & Auth:**
  - *Never expose secrets/credentials* ke client atau commit ke repo.
  - *Never rely on UI for authorization.* Proteksi hak akses (RBAC/IDOR) WAJIB dieksekusi di backend API.
  - *Never concatenate untrusted input into SQL* (wajib parameterized query / ORM).
  - *Never render untrusted HTML without sanitization* (cegah XSS via DOMPurify).
  - *Never assume authentication means authorization* (selalu verifikasi kepemilikan data / resource ownership).
- **Database & Performance:**
  - *Never return more data than needed* (larang `SELECT *` liar, gunakan column selection & pagination).
  - *Never optimize without measuring* (ukur latency, query count, & bundle size sebelum/sesudah).
  - *Never deploy untested destructive migrations* (hindari penghapusan kolom/tabel tanpa audit).
  - Hindari N+1 query: gunakan batching / eager loading yang terukur.
- **Reliability:**
  - *Never hide errors just to make the build pass.*
  - Tangani error secara terpusat tanpa membocorkan internal stack trace atau detail database ke response client.

---

## 3. Project Architecture Rules (`apps/mosque-backend` & `apps/mosque-dashboard`)

### Backend (Node.js / Express / TypeScript):
- Setiap endpoint mutasi (POST/PUT/PATCH) wajib memiliki middleware validasi Zod & sanitasi input.
- Gunakan database transaction (`BEGIN...COMMIT` atau Prisma transaction) untuk operasi multi-tabel atau perubahan finansial/kuota.
- Respons API harus seragam: `{ success: boolean, data?: any, message?: string, errors?: any }`.
- Gunakan HTTP status code yang tepat (400 Bad Request, 401 Unauthorized, 403 Forbidden, 404 Not Found, 500 Internal Server Error).

### Frontend (React / Vite):
- Jangan pasang library berukuran besar untuk fungsi kecil yang bisa ditulis sederhana.
- Gunakan dynamic `import()` dan code-splitting (`manualChunks`) untuk library berat (misal: PDF export, charting kompleks) agar tidak membebani initial bundle.
- Gunakan environment variable (`import.meta.env.VITE_API_URL`) untuk konfigurasi base URL API, jangan hardcode domain atau path statis tanpa fallback yang teruji.
- Hindari unnecessary re-renders; gunakan pagination/virtualization untuk data list panjang.
- Validasi form di frontend hanya untuk UX/feedback cepat, bukan pengganti validasi backend.

---

## 4. On-Demand Deep Audits & Extended Policies

Untuk audit dan panduan teknis mendalam, rujuk:
- **Master SOP Web Engineering:** [SOP_Web_Application_Engineering_Professional.md](../../SOP_Web_Application_Engineering_Professional.md)
  - Database Indexing & Query Tuning: Bab 13–23 (Indexing, N+1, Transactions, Connection Pooling).
  - Security Hardening (OWASP): Bab 7–12, 27–29 (RBAC, IDOR, CSP, CSRF, File Upload, Security Headers).
  - Logging & Monitoring: Bab 31–33 (Structured Logging, Observability P50/P95/P99).
  - Deployment & Migrations: Bab 21, 60–63 (Safe Migrations, Rollback Strategy).
- **Master AI Engineering Control Policy:** [ai-engineering-policy.md](./ai-engineering-policy.md) (43 fase engineering gate & kontrol operasional AI komprehensif).
