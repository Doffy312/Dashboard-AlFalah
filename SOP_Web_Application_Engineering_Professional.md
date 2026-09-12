# SOP WEB APPLICATION ENGINEERING — PROFESSIONAL STANDARD

**Dokumen:** Standard Operating Procedure (SOP) Web Application Developer → Web Engineer  
**Status:** Engineering Standard  
**Versi:** 1.0  
**Tujuan:** Menjadi pedoman audit, pengembangan, refactoring, keamanan, performa, database, testing, deployment, dan maintenance untuk web app yang sudah berjalan.

---

## 1. Prinsip Utama

Setiap perubahan pada web app WAJIB mempertimbangkan:

1. **Correctness** — fitur bekerja sesuai requirement.
2. **Security** — data, session, API, database, dan user terlindungi.
3. **Performance** — query, rendering, network, bundle, dan resource efisien.
4. **Scalability** — desain tidak mudah menjadi bottleneck ketika data/user bertambah.
5. **Maintainability** — kode mudah dibaca, diuji, di-debug, dan dikembangkan.
6. **Reliability** — error ditangani dengan benar dan sistem dapat dipulihkan.
7. **Observability** — masalah dapat diketahui melalui log, metrics, tracing, dan monitoring.
8. **Accessibility** — UI dapat digunakan dengan keyboard, screen reader, dan perangkat yang relevan.
9. **Privacy** — hanya mengumpulkan, menyimpan, dan mengekspos data yang diperlukan.
10. **Least Privilege** — user, service, database, dan API hanya memiliki akses minimum yang diperlukan.

> **Golden Rule:** Jangan melakukan refactor besar hanya demi terlihat lebih modern. Pertahankan behavior yang benar, ukur sebelum mengoptimalkan, dan lakukan perubahan secara bertahap.

---

# 2. PROTOKOL SAAT MENGERJAKAN EXISTING WEB APP

Sebelum mengubah kode:

### 2.1 Audit struktur proyek

Identifikasi:

- framework dan versi;
- runtime;
- package manager;
- database dan ORM/query builder;
- authentication;
- authorization/RBAC;
- API layer;
- validation layer;
- state management;
- caching;
- file/object storage;
- email/notification;
- deployment platform;
- environment variables;
- logging/monitoring;
- test framework;
- CI/CD.

Jangan mengganti teknologi yang sudah ada tanpa alasan engineering yang jelas.

### 2.2 Buat baseline

Sebelum optimasi, catat:

- build time;
- bundle size;
- halaman paling lambat;
- API latency P50/P95/P99;
- query paling mahal;
- jumlah query per request;
- database connection usage;
- error rate;
- Core Web Vitals;
- memory/CPU usage jika tersedia.

**Tidak boleh mengklaim optimasi berhasil tanpa pengukuran sebelum/sesudah.**

### 2.3 Dependency audit

Periksa:

- dependency yang deprecated;
- vulnerability;
- package yang tidak digunakan;
- dependency duplicate;
- package terlalu besar;
- dependency dengan maintenance buruk.

Jangan menghapus package hanya berdasarkan nama; pastikan tidak digunakan secara transitif atau melalui konfigurasi/build script.

---

# 3. STANDAR CODE QUALITY

## 3.1 General

Kode harus:

- sederhana;
- eksplisit;
- konsisten;
- memiliki single responsibility;
- menghindari duplication;
- tidak memiliki dead code;
- tidak memiliki secret hardcoded;
- tidak menyembunyikan error;
- tidak menggunakan `any` secara sembarangan pada TypeScript.

Prioritas:

**Readable > clever.**

Hindari abstraksi berlebihan.

## 3.2 TypeScript

Jika menggunakan TypeScript:

- gunakan `strict: true`;
- hindari `any`;
- gunakan `unknown` untuk data eksternal yang belum tervalidasi;
- gunakan type inference jika cukup jelas;
- gunakan discriminated union untuk state yang kompleks;
- jangan menggunakan type assertion (`as`) sebagai cara untuk menghindari error;
- tipe database tidak boleh dianggap sebagai validasi input user.

Contoh:

```ts
const body: unknown = await request.json();
const parsed = schema.safeParse(body);

if (!parsed.success) {
  return badRequest();
}

const data = parsed.data;
```

---

# 4. VALIDASI DATA — ZOD / SCHEMA VALIDATION

Semua data dari luar sistem dianggap **UNTRUSTED**.

Validasi WAJIB dilakukan untuk:

- request body;
- query parameter;
- route parameter;
- form submission;
- headers yang digunakan untuk logic;
- webhook payload;
- environment variables;
- response API eksternal;
- data dari third-party service.

Gunakan schema validation seperti Zod.

Contoh:

```ts
const CreateUserSchema = z.object({
  name: z.string().trim().min(1).max(100),
  email: z.string().trim().email().max(254),
  age: z.number().int().min(13).max(120),
});
```

### Jangan:

```ts
const user = req.body as User;
```

### Lakukan:

```ts
const result = CreateUserSchema.safeParse(req.body);

if (!result.success) {
  return Response.json(
    { error: "Invalid request" },
    { status: 400 }
  );
}
```

### Prinsip penting

**TypeScript menjamin asumsi saat development. Zod/runtime validation memeriksa data nyata saat runtime.**

---

# 5. AUTHENTICATION

Jika aplikasi menggunakan Next.js dan NextAuth/Auth.js atau sistem authentication sejenis:

### 5.1 Password

Password:

- WAJIB di-hash;
- TIDAK BOLEH disimpan plaintext;
- TIDAK BOLEH di-encrypt sebagai pengganti hashing;
- gunakan password hashing algorithm modern seperti Argon2id atau bcrypt sesuai stack dan threat model;
- jika menggunakan bcrypt, gunakan cost factor yang sesuai dengan kemampuan server; **round 12 dapat digunakan sebagai baseline yang perlu di-benchmark**.

Contoh bcrypt:

```ts
const passwordHash = await bcrypt.hash(password, 12);
```

Login:

```ts
const valid = await bcrypt.compare(password, user.passwordHash);
```

Jangan pernah log:

- password;
- password hash;
- reset token;
- session token;
- JWT;
- API key.

### 5.2 Password policy

Minimal:

- minimum length yang masuk akal;
- dukung password panjang;
- jangan memaksa aturan komposisi yang tidak perlu;
- rate-limit login;
- gunakan generic error untuk mencegah user enumeration.

Contoh:

> "Email atau password tidak valid."

Bukan:

> "Email tidak ditemukan."

---

# 6. SESSION, JWT, COOKIE

Jika menggunakan JWT:

- payload jangan berisi data sensitif;
- gunakan expiration;
- validasi signature;
- validasi issuer/audience jika digunakan;
- gunakan algorithm yang eksplisit;
- jangan menerima algorithm dari user;
- jangan menyimpan secret di source code;
- rotasi secret bila terjadi compromise.

Cookie authentication sebaiknya menggunakan:

- `HttpOnly`;
- `Secure` pada production HTTPS;
- `SameSite=Lax` atau `Strict` sesuai kebutuhan;
- expiration yang sesuai;
- domain/path yang minimum.

Jangan menyimpan token authentication sensitif di:

```text
localStorage
sessionStorage
URL query string
```

jika arsitektur dapat menggunakan secure HttpOnly cookies.

---

# 7. AUTHORIZATION / RBAC

Authentication menjawab:

> "Siapa user?"

Authorization menjawab:

> "Apa yang boleh dilakukan user?"

Setiap protected operation harus memeriksa authorization di **server-side**.

Contoh:

```ts
const session = await auth();

if (!session?.user) {
  return unauthorized();
}

if (session.user.role !== "ADMIN") {
  return forbidden();
}
```

Jangan mengandalkan:

```ts
if (user.role === "ADMIN") {
  // tampilkan tombol delete
}
```

sebagai satu-satunya proteksi.

UI permission hanyalah UX. **Server authorization adalah security boundary.**

---

# 8. IDOR / BROKEN ACCESS CONTROL

Setiap object/resource harus dicek ownership atau permission.

JANGAN:

```ts
const document = await db.document.findUnique({
  where: { id },
});
```

lalu langsung mengembalikannya kepada user.

Gunakan:

```ts
const document = await db.document.findFirst({
  where: {
    id,
    ownerId: session.user.id,
  },
});
```

atau policy/permission yang sesuai.

Audit semua endpoint:

- GET;
- POST;
- PUT/PATCH;
- DELETE;
- download;
- export;
- admin endpoint.

---

# 9. XSS PREVENTION

## 9.1 Default rule

**Never trust user-generated HTML.**

Framework modern biasanya melakukan HTML escaping secara default. Jangan mematikan mekanisme tersebut tanpa alasan kuat.

Hindari:

```tsx
<div dangerouslySetInnerHTML={{ __html: userInput }} />
```

Jika HTML memang harus dirender:

1. sanitize menggunakan sanitizer terpercaya;
2. gunakan allowlist;
3. buang script/event handler;
4. batasi URL protocol;
5. pertimbangkan Trusted Types/CSP.

### 9.2 Context-aware escaping

Perlakukan berbeda:

- HTML;
- HTML attribute;
- JavaScript;
- CSS;
- URL.

Jangan membuat sanitizer sendiri.

---

# 10. CONTENT SECURITY POLICY

Gunakan Content Security Policy sebagai defense-in-depth.

Minimal pertimbangkan:

```http
Content-Security-Policy:
  default-src 'self';
  object-src 'none';
  base-uri 'self';
  frame-ancestors 'none';
```

Sesuaikan dengan kebutuhan aplikasi.

Hindari `unsafe-inline` dan `unsafe-eval` jika memungkinkan.

CSP harus diuji karena konfigurasi yang terlalu ketat dapat mematahkan aplikasi.

---

# 11. CSRF

Jika authentication menggunakan cookies, semua state-changing request harus mempertimbangkan CSRF.

Lindungi:

- POST;
- PUT;
- PATCH;
- DELETE;
- mutation endpoint.

Gunakan kombinasi yang sesuai dengan framework:

- SameSite cookies;
- CSRF token/double-submit token;
- Origin/Referer verification;
- framework built-in CSRF protection bila tersedia.

Jangan menganggap:

> "API menggunakan POST, jadi aman dari CSRF."

POST bukan otomatis anti-CSRF.

---

# 12. SQL INJECTION / DATABASE SECURITY

Gunakan:

- parameterized query;
- ORM yang benar;
- prepared statements.

Jangan:

```ts
db.query(`SELECT * FROM users WHERE email = '${email}'`);
```

Gunakan parameter:

```ts
db.query(
  "SELECT * FROM users WHERE email = ?",
  [email]
);
```

ORM juga bukan jaminan keamanan jika developer membuat raw query secara tidak aman.

Audit seluruh:

- raw SQL;
- dynamic query;
- search;
- sorting;
- filtering;
- reporting.

---

# 13. DATABASE ENGINEERING & PERFORMANCE

Database sering menjadi bottleneck utama.

## 13.1 Prinsip

Sebelum mengoptimalkan database:

1. lihat query;
2. lihat execution plan;
3. ukur latency;
4. lihat index;
5. lihat cardinality;
6. lihat jumlah rows;
7. lihat query frequency.

Jangan menambahkan index secara membabi buta.

---

# 14. DATABASE INDEXING

Index digunakan untuk kolom yang sering digunakan dalam:

- `WHERE`;
- `JOIN`;
- `ORDER BY`;
- `GROUP BY` dalam kondisi tertentu;
- lookup unik.

Contoh:

```sql
CREATE INDEX idx_users_email
ON users(email);
```

Untuk kombinasi:

```sql
CREATE INDEX idx_orders_user_status_created
ON orders(user_id, status, created_at);
```

Urutan composite index harus mempertimbangkan pola query.

### Hindari over-indexing

Setiap index:

- memakai storage;
- memperlambat INSERT;
- memperlambat UPDATE;
- memperlambat DELETE;
- menambah maintenance.

**Index harus dibuktikan manfaatnya.**

---

# 15. N+1 QUERY

Jangan melakukan:

```text
SELECT users
FOR EACH user:
    SELECT orders
```

Gunakan:

- JOIN;
- eager loading;
- batch query;
- DataLoader;
- query aggregation sesuai kebutuhan.

Target:

> 1 request → jumlah query terkendali.

Monitor query count pada endpoint penting.

---

# 16. SELECT HANYA KOLOM YANG DIPERLUKAN

Jangan selalu:

```sql
SELECT *
```

Gunakan:

```sql
SELECT id, name, email
FROM users
WHERE id = ?
```

Hal ini mengurangi:

- database I/O;
- network payload;
- serialization;
- memory;
- response time.

Pada ORM, gunakan field selection.

---

# 17. PAGINATION

Jangan mengambil ribuan atau jutaan row sekaligus.

Hindari:

```sql
SELECT *
FROM logs
LIMIT 100000;
```

Gunakan pagination.

Untuk dataset besar, pertimbangkan **cursor/keyset pagination**:

```text
WHERE id > lastSeenId
ORDER BY id
LIMIT 50
```

dibanding offset pagination yang semakin mahal pada dataset tertentu.

---

# 18. TRANSACTION

Gunakan transaction ketika beberapa perubahan database harus atomic.

Contoh:

```ts
await db.$transaction(async (tx) => {
  await tx.order.create(...);
  await tx.inventory.update(...);
});
```

Prinsip:

- transaction harus singkat;
- jangan melakukan HTTP request di dalam transaction;
- jangan melakukan pekerjaan berat di dalam transaction;
- pahami isolation level;
- tangani deadlock/retry sesuai database.

---

# 19. CONSTRAINT DATABASE

Business-critical integrity harus diperkuat di database.

Gunakan bila sesuai:

- `PRIMARY KEY`;
- `FOREIGN KEY`;
- `UNIQUE`;
- `NOT NULL`;
- `CHECK`;
- constraint lainnya.

Jangan hanya mengandalkan validation aplikasi.

Contoh:

```sql
UNIQUE(email)
```

tetap diperlukan walaupun aplikasi sudah melakukan pengecekan email.

---

# 20. SOFT DELETE

Jika menggunakan soft delete:

```text
deletedAt
```

pastikan semua query yang membutuhkan data aktif menggunakan filter yang konsisten.

Pertimbangkan:

- unique constraint;
- index;
- retention;
- restore;
- data privacy;
- ukuran tabel.

Soft delete bukan pengganti data retention policy.

---

# 21. DATABASE MIGRATION

Semua perubahan schema harus melalui migration.

Jangan mengubah production database secara manual tanpa migration yang terdokumentasi.

Migration harus:

- versioned;
- reproducible;
- dapat diaudit;
- diuji;
- aman terhadap data existing.

Untuk perubahan besar:

1. expand;
2. migrate/backfill;
3. switch application;
4. contract/remove old schema.

---

# 22. CONNECTION POOLING

Pastikan database connection tidak dibuat berlebihan.

Serverless environment perlu perhatian khusus terhadap:

- connection explosion;
- pool size;
- connection reuse;
- external pooler bila diperlukan.

Monitor:

- active connections;
- idle connections;
- connection wait time;
- query latency.

---

# 23. CACHING

Gunakan caching hanya jika ada alasan.

Candidate:

- data read-heavy;
- konfigurasi;
- metadata;
- hasil query mahal;
- external API response.

Tetapkan:

- TTL;
- invalidation;
- cache key;
- stale behavior;
- failure behavior.

> Cache invalidation adalah bagian dari desain data, bukan fitur tambahan.

Jangan cache data sensitif sembarangan.

---

# 24. API DESIGN

API harus konsisten.

Gunakan status HTTP yang tepat:

```text
200 OK
201 Created
204 No Content
400 Bad Request
401 Unauthorized
403 Forbidden
404 Not Found
409 Conflict
422 Unprocessable Content
429 Too Many Requests
500 Internal Server Error
```

Response error jangan membocorkan:

- SQL;
- stack trace;
- file path;
- secret;
- internal architecture;
- database structure.

Production:

```json
{
  "error": "Internal server error",
  "requestId": "..."
}
```

Log detail hanya di server.

---

# 25. RATE LIMITING

Rate limit endpoint sensitif:

- login;
- password reset;
- OTP;
- search mahal;
- export;
- upload;
- public API;
- webhook tertentu.

Rate limit berdasarkan kebutuhan:

- IP;
- user ID;
- API key;
- endpoint;
- kombinasi beberapa identifier.

Gunakan distributed rate limiting jika aplikasi berjalan pada banyak instance.

---

# 26. INPUT SIZE LIMIT

Batasi:

- JSON body;
- multipart upload;
- file size;
- number of records per request;
- pagination limit;
- query length.

Jangan membiarkan client meminta:

```text
limit=100000000
```

Gunakan maximum server-side.

---

# 27. FILE UPLOAD SECURITY

File upload harus:

- membatasi ukuran;
- memvalidasi MIME;
- memvalidasi extension;
- tidak mempercayai filename;
- mengganti nama file;
- menyimpan di lokasi yang tepat;
- mencegah executable upload;
- melakukan content validation untuk file berisiko;
- menggunakan antivirus scanning bila threat model memerlukannya.

Jangan menjadikan filename user sebagai path server.

---

# 28. HTTP SECURITY HEADERS

Production sebaiknya mempertimbangkan:

```http
Strict-Transport-Security
Content-Security-Policy
X-Content-Type-Options: nosniff
Referrer-Policy
Permissions-Policy
```

Jika aplikasi tidak perlu framing:

```http
X-Frame-Options: DENY
```

atau gunakan `frame-ancestors` pada CSP.

---

# 29. HTTPS / TLS

Production:

- HTTPS only;
- redirect HTTP → HTTPS;
- gunakan TLS modern;
- jangan mengirim credential melalui HTTP;
- secure cookies;
- HSTS setelah siap.

---

# 30. ENVIRONMENT VARIABLES & SECRET MANAGEMENT

Jangan commit:

```text
.env
.env.production
private keys
API keys
database password
JWT secret
service account credentials
```

Gunakan secret manager/environment secret platform.

Pisahkan:

```text
development
test
staging
production
```

Public environment variables tidak boleh mengandung secret.

Contoh konsep:

```text
PUBLIC_API_URL       → boleh public
DATABASE_URL         → SECRET
AUTH_SECRET          → SECRET
STRIPE_SECRET_KEY    → SECRET
```

---

# 31. LOGGING

Log harus berguna untuk debugging tanpa membocorkan data.

Jangan log:

- password;
- authorization header;
- session cookie;
- JWT;
- API key;
- secret;
- data pribadi yang tidak diperlukan.

Gunakan structured logging:

```json
{
  "level": "error",
  "event": "payment_failed",
  "requestId": "...",
  "userId": "...",
  "errorCode": "PAYMENT_TIMEOUT"
}
```

Gunakan correlation/request ID.

---

# 32. ERROR HANDLING

Jangan:

```ts
try {
  ...
} catch {
  // ignore
}
```

Error harus:

- ditangani;
- dicatat jika perlu;
- diberi response aman;
- memiliki error code jika membantu debugging;
- tidak mengekspos internal details.

Gunakan centralized error handling bila arsitektur memungkinkan.

---

# 33. OBSERVABILITY

Production application idealnya memiliki:

### Logs
Apa yang terjadi?

### Metrics
Seberapa sering/berapa besar?

### Traces
Di mana waktu request digunakan?

Monitor minimal:

- request rate;
- error rate;
- latency;
- database latency;
- cache hit/miss;
- CPU;
- memory;
- disk;
- external service latency.

Gunakan P50/P95/P99 untuk latency, bukan hanya average.

---

# 34. FRONTEND PERFORMANCE

Perhatikan:

- bundle size;
- JavaScript execution;
- image size;
- lazy loading;
- code splitting;
- caching;
- font loading;
- hydration cost;
- unnecessary re-render;
- third-party scripts.

Jangan menambahkan library besar untuk kebutuhan sederhana.

Contoh:

> Jangan menggunakan library 100 KB hanya untuk melakukan satu fungsi yang dapat ditulis beberapa baris kode dengan aman.

---

# 35. NEXT.JS / SSR / SERVER COMPONENTS

Jika menggunakan Next.js:

Gunakan server-side execution untuk pekerjaan yang memang server-only:

- database access;
- secret operations;
- privileged API calls.

Jangan expose database credential ke client.

Gunakan client component hanya jika membutuhkan:

- browser API;
- interactivity;
- state;
- event handler;
- client-only library.

Kurangi `"use client"` pada component tree jika tidak diperlukan.

---

# 36. DATA FETCHING

Hindari:

```text
Browser
 → API
 → API lain
 → Database
```

jika server component/backend dapat mengambil data langsung dengan aman.

Tetap gunakan API boundary ketika memang dibutuhkan:

- mobile client;
- external consumers;
- third-party integrations;
- public API.

---

# 37. SECURITY OF EXTERNAL API

Semua external API dianggap untrusted.

Validasi:

- response schema;
- status code;
- timeout;
- retry;
- payload size;
- authentication;
- rate limit.

Jangan retry tanpa batas.

Gunakan:

```text
timeout
exponential backoff
jitter
maximum retry
```

---

# 38. SSRF PREVENTION

Jika server menerima URL dari user:

Jangan langsung:

```ts
fetch(userProvidedUrl)
```

Pertimbangkan:

- allowlist domain;
- block localhost;
- block private IP ranges;
- block cloud metadata endpoints;
- validasi protocol;
- DNS rebinding protection;
- redirect validation;
- timeout.

---

# 39. CORS

Jangan menggunakan:

```http
Access-Control-Allow-Origin: *
```

untuk endpoint yang membutuhkan credential.

Gunakan allowlist origin.

CORS bukan authentication dan bukan authorization.

---

# 40. SECURITY TESTING

Minimal lakukan:

### Static analysis
- TypeScript;
- ESLint;
- dependency audit.

### Dynamic testing
- authentication;
- authorization;
- XSS;
- CSRF;
- SQL injection;
- IDOR;
- rate limit;
- file upload;
- input validation.

### Dependency

Audit secara berkala.

---

# 41. TESTING PYRAMID

Prioritas:

```text
        E2E
       /   \
 Integration
   /         \
 Unit Tests
```

Gunakan unit test untuk logic murni.

Integration test untuk:

- database;
- API;
- authentication;
- authorization.

E2E untuk critical user journey:

- login;
- registration;
- checkout;
- CRUD penting;
- permission boundary.

Jangan hanya mengejar coverage percentage. **Behavior yang penting harus teruji.**

---

# 42. TEST CASE SECURITY

Setiap protected resource minimal memiliki test:

```text
✓ unauthenticated → 401
✓ authenticated but unauthorized → 403
✓ authorized → success
✓ owner → success
✓ non-owner → denied
✓ invalid input → 400/422
✓ malformed ID → safely rejected
```

---

# 43. GIT WORKFLOW

Gunakan:

```text
main
develop (optional)
feature/*
fix/*
hotfix/*
```

Commit harus menjelaskan perubahan.

Contoh:

```text
feat: add role-based authorization
fix: prevent unauthorized document access
perf: optimize dashboard queries
security: add CSRF validation
refactor: simplify user service
```

Jangan commit:

```text
fix
update
test
asdf
```

---

# 44. PULL REQUEST CHECKLIST

Setiap PR harus menjawab:

- Apa yang berubah?
- Mengapa berubah?
- Apakah ada perubahan database?
- Apakah ada perubahan API?
- Apakah ada security impact?
- Apakah ada performance impact?
- Apakah ada migration?
- Apakah test ditambahkan?
- Apakah backward compatibility terjaga?
- Apakah environment variable baru diperlukan?

---

# 45. CI/CD

Pipeline minimal:

```text
Install
  ↓
Lint
  ↓
Type Check
  ↓
Unit Test
  ↓
Integration Test
  ↓
Build
  ↓
Security / Dependency Scan
  ↓
Deploy
```

Production deployment harus dapat diulang secara konsisten.

---

# 46. DATABASE DEPLOYMENT

Migration production:

- backup/restore strategy tersedia;
- migration diuji pada staging;
- migration memiliki rollback/recovery plan;
- perubahan besar dilakukan bertahap;
- tidak mengunci tabel besar tanpa analisis;
- monitor setelah deployment.

---

# 47. BACKUP & DISASTER RECOVERY

Backup harus diuji, bukan hanya dibuat.

Minimal pahami:

### RPO
Berapa banyak data yang boleh hilang?

### RTO
Berapa lama sistem boleh down?

Lakukan restore test secara berkala.

Backup harus:

- terenkripsi;
- memiliki access control;
- memiliki retention policy;
- tidak berada hanya pada server yang sama.

---

# 48. DATA PRIVACY

Kumpulkan data seminimal mungkin.

Untuk setiap field tanyakan:

> Apakah data ini benar-benar diperlukan?

Tentukan:

- tujuan penggunaan;
- retention;
- access policy;
- deletion policy;
- export policy;
- audit requirement.

Jangan mengirim seluruh object database ke frontend jika hanya membutuhkan 5 field.

---

# 49. SECURITY OF RESPONSE DATA

Gunakan DTO/serializer.

Jangan:

```ts
return user;
```

jika object database mengandung:

```text
passwordHash
resetToken
internalNotes
securityFlags
```

Gunakan explicit projection:

```ts
return {
  id: user.id,
  name: user.name,
  email: user.email,
};
```

---

# 50. BUSINESS LOGIC

Business rule harus berada di server/service layer, bukan hanya UI.

Contoh:

```text
UI:
"button delete hanya muncul untuk admin"

Server:
"apakah user benar-benar admin?"
```

Server harus menjadi source of truth.

---

# 51. CONCURRENCY / RACE CONDITION

Perhatikan operasi:

```text
check balance
↓
withdraw
```

Dua request bersamaan dapat menyebabkan race condition.

Gunakan:

- transaction;
- row locking;
- atomic update;
- unique constraint;
- optimistic concurrency;
- idempotency key.

Untuk operasi finansial/payment, concurrency harus diperlakukan sebagai security/reliability concern.

---

# 52. IDEMPOTENCY

Endpoint seperti:

- payment;
- order creation;
- webhook;
- retryable mutation;

harus mempertimbangkan idempotency.

Contoh:

```text
Idempotency-Key: abc123
```

Request yang sama tidak boleh menghasilkan duplicate side effect.

---

# 53. WEBHOOK SECURITY

Webhook harus:

- signature verified;
- timestamp checked bila tersedia;
- replay protection;
- payload validation;
- idempotent;
- rate limited;
- logged tanpa secret.

Jangan percaya `userId` atau `eventType` sebelum signature validation.

---

# 54. SECURITY REVIEW SEBELUM RELEASE

Checklist:

### Authentication
- [ ] Password hashed
- [ ] Session secure
- [ ] Cookie flags benar
- [ ] Login rate limit
- [ ] Password reset aman

### Authorization
- [ ] Semua endpoint protected sesuai kebutuhan
- [ ] RBAC/permission server-side
- [ ] IDOR checked
- [ ] Ownership checked

### Input
- [ ] Zod/schema validation
- [ ] Input length limit
- [ ] File upload validation
- [ ] Query parameter validation

### Injection
- [ ] Parameterized queries
- [ ] No unsafe raw SQL
- [ ] No shell command injection
- [ ] No unsafe HTML injection

### Browser
- [ ] XSS protection
- [ ] CSP reviewed
- [ ] CSRF protection
- [ ] Security headers
- [ ] CORS reviewed

### Secrets
- [ ] No secret in Git
- [ ] No secret in frontend bundle
- [ ] Environment separated
- [ ] Rotation procedure available

### Database
- [ ] Index reviewed
- [ ] N+1 checked
- [ ] Query plan checked
- [ ] Pagination implemented
- [ ] Migration tested
- [ ] Backup verified

### Performance
- [ ] API latency measured
- [ ] Bundle analyzed
- [ ] Images optimized
- [ ] Unnecessary client components removed
- [ ] Expensive queries optimized

### Reliability
- [ ] Error handling
- [ ] Logging
- [ ] Monitoring
- [ ] Rate limiting
- [ ] Retry/timeout
- [ ] Backup/restore plan

---

# 55. DEFINITION OF DONE

Sebuah fitur dianggap selesai hanya jika:

```text
Requirement
    ↓
Design
    ↓
Implementation
    ↓
Validation
    ↓
Security Review
    ↓
Testing
    ↓
Performance Check
    ↓
Code Review
    ↓
CI/CD
    ↓
Deployment
    ↓
Monitoring
```

"Fitur sudah muncul di browser" **bukan** Definition of Done.

---

# 56. PROTOCOL UNTUK AI CODING AGENT / ANTIGRAVITY

Saat AI agent mengubah existing codebase, ikuti aturan berikut.

## BEFORE CODING

1. Baca struktur repository.
2. Identifikasi framework.
3. Identifikasi database.
4. Identifikasi authentication.
5. Identifikasi authorization.
6. Identifikasi validation.
7. Identifikasi existing conventions.
8. Cari code yang sudah menangani masalah yang sama.
9. Jangan membuat duplicate abstraction.
10. Jangan mengganti architecture tanpa kebutuhan.

## DURING CODING

1. Buat perubahan sekecil mungkin.
2. Pertahankan public API jika tidak perlu diubah.
3. Validasi semua external input.
4. Jangan memasukkan secret.
5. Jangan bypass type system.
6. Jangan disable lint/security rule hanya untuk membuat build lewat.
7. Jangan menggunakan raw SQL tanpa parameterization.
8. Jangan menambahkan dependency tanpa alasan.
9. Jangan melakukan destructive migration tanpa explicit requirement.
10. Jangan menghapus test yang gagal hanya agar CI hijau.

## AFTER CODING

Jalankan bila tersedia:

```bash
npm run lint
npm run typecheck
npm test
npm run build
```

atau command yang sesuai dengan project.

Kemudian periksa:

- security;
- database queries;
- N+1;
- authorization;
- error handling;
- performance;
- regression.

---

# 57. RULE: DO NOT "FIX" SECURITY BY HIDING ERRORS

Jangan:

```ts
catch {
  return null;
}
```

hanya untuk menghilangkan error.

Jangan:

```ts
// @ts-ignore
```

tanpa alasan.

Jangan:

```ts
eslint-disable
```

secara global hanya karena satu rule mengganggu.

Jika exception benar-benar diperlukan:

1. scope sekecil mungkin;
2. berikan komentar alasan;
3. pastikan security impact dipahami.

---

# 58. PERFORMANCE INVESTIGATION PROTOCOL

Jika halaman/API lambat:

```text
1. Reproduce
2. Measure
3. Identify bottleneck
4. Form hypothesis
5. Optimize
6. Measure again
7. Compare
8. Add regression protection
```

Jangan langsung:

```text
"Tambahkan cache."
```

Bottleneck dapat berasal dari:

- database;
- network;
- serialization;
- rendering;
- hydration;
- third-party API;
- CPU;
- memory;
- bundle;
- inefficient algorithm.

---

# 59. DATABASE QUERY REVIEW PROTOCOL

Untuk query penting:

```text
[ ] SELECT fields minimal
[ ] WHERE indexed
[ ] JOIN indexed
[ ] Pagination
[ ] No N+1
[ ] Query plan reviewed
[ ] Appropriate transaction
[ ] Appropriate isolation
[ ] No unnecessary sorting
[ ] No unnecessary data transfer
[ ] Index overhead considered
```

Untuk query yang sangat sering dipanggil, ukur dampaknya terhadap database secara keseluruhan.

---

# 60. SECURITY PRIORITY

Jika menemukan vulnerability:

### Critical
Contoh:

- authentication bypass;
- arbitrary code execution;
- remote command execution;
- mass data exposure;
- leaked production secret.

→ **Hentikan deployment terkait dan remediasi segera.**

### High

- IDOR pada data sensitif;
- privilege escalation;
- SQL injection;
- stored XSS;
- account takeover.

→ Prioritaskan sebelum release.

### Medium

- missing security headers;
- rate-limit weakness;
- information disclosure terbatas.

### Low

- hardening minor;
- best-practice gap tanpa exploit yang berarti.

Prioritas akhir tetap mengikuti threat model dan konteks aplikasi.

---

# 61. ARCHITECTURE PRINCIPLES

Gunakan separation of concerns:

```text
UI
 ↓
Route / Controller
 ↓
Validation
 ↓
Authorization
 ↓
Service / Business Logic
 ↓
Repository / Data Access
 ↓
Database
```

Tidak semua project membutuhkan seluruh layer secara formal.

Tujuannya adalah memisahkan:

- presentation;
- validation;
- authorization;
- business logic;
- data access.

Jangan membuat 10 layer hanya untuk CRUD sederhana.

---

# 62. ANTI-PATTERNS

Hindari:

```text
❌ God component
❌ God service
❌ SELECT *
❌ N+1 query
❌ any everywhere
❌ password plaintext
❌ token di URL
❌ secret di Git
❌ client-side authorization only
❌ raw SQL string interpolation
❌ unrestricted file upload
❌ unlimited API request
❌ unlimited pagination
❌ catch-and-ignore
❌ unnecessary dependency
❌ premature optimization
❌ premature microservices
❌ giant client bundle
❌ destructive migration without plan
```

---

# 63. FINAL ENGINEERING GATE

Sebelum menyatakan pekerjaan selesai, AI/developer harus dapat menjawab:

### Architecture
- Apakah perubahan sesuai architecture existing?
- Apakah ada duplicate logic?

### Security
- Apakah input tervalidasi?
- Apakah authorization benar?
- Apakah XSS/CSRF/Injection dipertimbangkan?
- Apakah secret aman?

### Database
- Apakah query efisien?
- Apakah index tepat?
- Apakah N+1 terjadi?
- Apakah pagination diperlukan?
- Apakah migration aman?

### Performance
- Apakah perubahan menambah network request?
- Apakah bundle bertambah?
- Apakah database load bertambah?
- Apakah ada unnecessary rendering?

### Reliability
- Apa yang terjadi jika database gagal?
- Apa yang terjadi jika API eksternal timeout?
- Apakah retry aman?
- Apakah operation idempotent?

### Testing
- Apakah happy path diuji?
- Apakah error path diuji?
- Apakah unauthorized access diuji?
- Apakah regression diuji?

### Deployment
- Apakah environment variable baru diperlukan?
- Apakah migration harus dijalankan?
- Apakah rollback/recovery tersedia?

---

# 64. ENGINEERING COMMANDMENT

> **Never trust client input.**
>
> **Never expose secrets.**
>
> **Never rely on UI for authorization.**
>
> **Never concatenate untrusted input into SQL.**
>
> **Never render untrusted HTML without sanitization.**
>
> **Never optimize without measuring.**
>
> **Never add an index without understanding the query.**
>
> **Never deploy an untested destructive migration.**
>
> **Never hide errors just to make the build pass.**
>
> **Never return more data than the client needs.**
>
> **Never assume authentication means authorization.**
>
> **Never assume TypeScript validation replaces runtime validation.**
>
> **Never assume a framework default is a complete security strategy.**

---

# 65. RECOMMENDED ENGINEERING REFERENCES

Standar dan guidance yang sebaiknya menjadi referensi:

- OWASP Top 10
- OWASP ASVS
- OWASP Cheat Sheet Series
- OWASP API Security Top 10
- CWE
- MDN Web Security
- HTTP security specifications
- framework security documentation
- database vendor documentation
- cloud provider security documentation

Gunakan versi standar dan dokumentasi yang masih relevan dengan stack aplikasi saat audit dilakukan.

---

# 66. AI AGENT FINAL INSTRUCTION

Ketika bekerja pada repository ini, bertindak sebagai **Senior Web Engineer / Application Security Engineer / Database Engineer**.

Prioritas:

```text
1. Preserve existing functionality
2. Security
3. Data integrity
4. Correctness
5. Performance
6. Reliability
7. Maintainability
8. Developer experience
```

Sebelum mengubah sesuatu yang berisiko tinggi, identifikasi dampaknya terhadap:

```text
Authentication
Authorization
Database
Data integrity
API compatibility
Security
Performance
Deployment
Existing users
```

Jangan melakukan perubahan destructive, migrasi data, penghapusan data, penggantian authentication architecture, atau perubahan production configuration secara diam-diam.

Jika terdapat beberapa solusi, pilih solusi yang:

- paling sederhana;
- paling aman;
- paling mudah dipelihara;
- paling sesuai dengan architecture existing;
- memiliki dependency paling sedikit;
- dapat diukur hasilnya.

**Target akhir bukan sekadar "kode berjalan".**

Target akhir adalah:

> **Secure + Correct + Fast + Reliable + Maintainable + Observable + Scalable Web Application.**
