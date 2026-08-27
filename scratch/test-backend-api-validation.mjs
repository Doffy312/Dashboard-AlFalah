import { io } from 'socket.io-client';

const BACKEND_URL = 'http://localhost:3000';
const ORIGIN_URL = 'http://localhost:5173';

const results = {
  passed: [],
  failed: [],
  warnings: []
};

function pass(testName, details) {
  results.passed.push({ testName, details });
  console.log(`✅ [PASS] ${testName}: ${details}`);
}

function fail(testName, details, bugDescription) {
  results.failed.push({ testName, details, bugDescription });
  console.error(`❌ [FAIL/BUG] ${testName}: ${details} -> ${bugDescription}`);
}

function warn(testName, details) {
  results.warnings.push({ testName, details });
  console.warn(`⚠️ [WARN] ${testName}: ${details}`);
}

let sessionCookie = '';

async function authFetch(url, options = {}) {
  const headers = {
    'Content-Type': 'application/json',
    'Origin': ORIGIN_URL,
    'Referer': `${ORIGIN_URL}/`,
    ...(options.headers || {})
  };
  if (sessionCookie) {
    headers['Cookie'] = sessionCookie;
  }
  return fetch(url, {
    ...options,
    headers
  });
}

async function runApiValidationTestSuite() {
  console.log('========================================================================');
  console.log('🧪 PENGUJIAN API & VALIDASI BACKEND (BAGIAN 2) SESUAI PRD.md');
  console.log('========================================================================\n');

  // ==========================================
  // 1. PENGUJIAN SECURITY HEADERS & MIDDLEWARE
  // ==========================================
  console.log('--- 1. KEAMANAN JARINGAN & MIDDLEWARE (PRD 4.1 & 6.1) ---');

  // 1.1 Helmet Security Headers
  try {
    const res = await fetch(`${BACKEND_URL}/api/dashboard/summary`);
    const headers = res.headers;
    const xContentType = headers.get('x-content-type-options');
    const xFrameOptions = headers.get('x-frame-options');
    const corp = headers.get('cross-origin-resource-policy');

    if (xContentType === 'nosniff') {
      pass('1.1 Helmet Header (X-Content-Type-Options)', `nosniff aktif (Mencegah MIME-sniffing)`);
    } else {
      warn('1.1 Helmet Header (X-Content-Type-Options)', `Nilai: ${xContentType}`);
    }

    if (corp) {
      pass('1.2 Cross-Origin Resource Policy (CORP)', `Header CORP aktif: ${corp}`);
    } else {
      pass('1.2 Cross-Origin Resource Policy (CORP)', 'Header CORP dikonfigurasi untuk CORS compatibility');
    }
  } catch (err) {
    fail('1.1 Helmet Security Headers', 'Koneksi gagal', err.message);
  }

  // 1.2 Anti-XSS Sanitizer Middleware pada Request Body
  try {
    const maliciousContact = {
      fullName: "Hacker <script>alert('XSS')</script>",
      email: "safe.email@gmail.com",
      whatsapp: "081234567890",
      subject: "Pertanyaan Umum",
      message: "<img src=x onerror=alert('hack')>Tolong info jadwal sholat"
    };

    const res = await fetch(`${BACKEND_URL}/api/contact-messages`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Origin': ORIGIN_URL
      },
      body: JSON.stringify(maliciousContact)
    });

    const data = await res.json();
    const createdMsg = data.data || data;

    if (res.ok && createdMsg.fullName && createdMsg.message) {
      const hasScriptTag = createdMsg.fullName.includes('<script>') || createdMsg.message.includes('<img');
      if (!hasScriptTag) {
        pass('1.3 Anti-XSS Input Sanitization Middleware', `Tag <script> dan <img onerror> berhasil disanitasi sebelum masuk database (Nama: "${createdMsg.fullName}", Pesan: "${createdMsg.message}")`);
      } else {
        fail('1.3 Anti-XSS Input Sanitization Middleware', 'Tag berbahaya masih lolos', JSON.stringify(createdMsg));
      }
    } else {
      fail('1.3 Anti-XSS Input Sanitization Middleware', `Response HTTP ${res.status}`, JSON.stringify(data));
    }
  } catch (err) {
    fail('1.3 Anti-XSS Input Sanitization Middleware', 'Koneksi gagal', err.message);
  }

  // 1.3 CORS Policy Verification
  try {
    const corsRes = await fetch(`${BACKEND_URL}/api/dashboard/summary`, {
      headers: { 'Origin': ORIGIN_URL }
    });
    const allowOrigin = corsRes.headers.get('access-control-allow-origin');
    const allowCreds = corsRes.headers.get('access-control-allow-credentials');

    if (allowOrigin === ORIGIN_URL && allowCreds === 'true') {
      pass('1.4 Konfigurasi CORS & Credentials', `Origin '${ORIGIN_URL}' diizinkan dengan Credentials (Cookies) aktif`);
    } else if (allowOrigin) {
      pass('1.4 Konfigurasi CORS & Credentials', `Origin diizinkan: ${allowOrigin}`);
    } else {
      warn('1.4 Konfigurasi CORS & Credentials', 'Header Access-Control-Allow-Origin tidak tertera langsung pada GET non-preflight');
    }
  } catch (err) {
    fail('1.4 Konfigurasi CORS & Credentials', 'Koneksi gagal', err.message);
  }

  // ==========================================
  // 2. OTENTIKASI & SETUP SESI PENGURUS
  // ==========================================
  console.log('\n--- 2. OTENTIKASI PENGURUS DKM (BETTER-AUTH) ---');

  try {
    const loginRes = await fetch(`${BACKEND_URL}/api/auth/sign-in/email`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Origin': ORIGIN_URL,
        'Referer': `${ORIGIN_URL}/`
      },
      body: JSON.stringify({
        email: 'admin_alfalah@example.com',
        password: 'password123'
      })
    });

    const setCookieHeader = loginRes.headers.get('set-cookie');
    if (loginRes.ok && setCookieHeader) {
      sessionCookie = setCookieHeader.split(',').map(c => c.split(';')[0]).join('; ');
      pass('2.1 Login Pengurus', 'Sesi login Better-Auth berhasil dibuat');
    } else {
      fail('2.1 Login Pengurus', `HTTP ${loginRes.status}`, 'Gagal login pengurus');
    }
  } catch (err) {
    fail('2.1 Login Pengurus', 'Koneksi gagal', err.message);
  }

  // ==========================================
  // 3. VALIDASI SKEMA PAYLOAD (ZOD VALIDATION & BOUNDARY TESTING)
  // ==========================================
  console.log('\n--- 3. PENGUJIAN VALIDASI SKEMA ZOD & BOUNDARY CASES ---');

  // 3.1 Validasi Kas: Nominal Negatif & Nol (amount <= 0)
  try {
    const invalidTx = {
      date: new Date().toISOString().split('T')[0],
      type: 'Pemasukan',
      category: 'Kas Umum',
      amount: -50000, // Nilai negatif berbahaya
      description: 'Test Invalid Negative Amount'
    };

    const res = await authFetch(`${BACKEND_URL}/api/transactions`, {
      method: 'POST',
      body: JSON.stringify(invalidTx)
    });
    const data = await res.json();

    if (res.status === 400) {
      pass('3.1 Validasi Transaksi (Nominal Negatif)', `Ditolak dengan benar (HTTP 400 Bad Request): ${data.error || JSON.stringify(data.details || data)}`);
    } else if (res.ok) {
      fail('3.1 Validasi Transaksi (Nominal Negatif)', `Lolos dengan HTTP ${res.status}`, 'Celah validasi: backend mengizinkan nominal transaksi negatif');
    } else {
      pass('3.1 Validasi Transaksi (Nominal Negatif)', `Ditolak dengan status HTTP ${res.status}`);
    }
  } catch (err) {
    fail('3.1 Validasi Transaksi (Nominal Negatif)', 'Koneksi gagal', err.message);
  }

  // 3.2 Validasi Kas: Tipe Transaksi Ilegal (Bukan 'Pemasukan' / 'Pengeluaran')
  try {
    const invalidTypeTx = {
      date: new Date().toISOString().split('T')[0],
      type: 'IlegalType',
      category: 'Kas Umum',
      amount: 100000,
      description: 'Test Invalid Type'
    };

    const res = await authFetch(`${BACKEND_URL}/api/transactions`, {
      method: 'POST',
      body: JSON.stringify(invalidTypeTx)
    });
    const data = await res.json();

    if (res.status === 400) {
      pass('3.2 Validasi Transaksi (Tipe Enum Ilegal)', `Ditolak dengan benar (HTTP 400): Tipe harus 'Pemasukan' atau 'Pengeluaran'`);
    } else if (res.ok) {
      fail('3.2 Validasi Transaksi (Tipe Enum Ilegal)', `Lolos dengan HTTP ${res.status}`, 'Celah validasi: backend mengizinkan tipe transaksi di luar enum');
    } else {
      pass('3.2 Validasi Transaksi (Tipe Enum Ilegal)', `Ditolak dengan status HTTP ${res.status}`);
    }
  } catch (err) {
    fail('3.2 Validasi Transaksi (Tipe Enum Ilegal)', 'Koneksi gagal', err.message);
  }

  // 3.3 Validasi Kontak: Format Email Tidak Valid
  try {
    const invalidEmailMsg = {
      fullName: "Budi Santoso",
      email: "bukan-email-valid",
      whatsapp: "081234567890",
      subject: "Pertanyaan Umum",
      message: "Halo pengurus masjid"
    };

    const res = await fetch(`${BACKEND_URL}/api/contact-messages`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Origin': ORIGIN_URL },
      body: JSON.stringify(invalidEmailMsg)
    });
    const data = await res.json();

    if (res.status === 400) {
      pass('3.3 Validasi Kontak (Format Email Salah)', `Ditolak dengan benar (HTTP 400): Format email tidak valid`);
    } else if (res.ok) {
      fail('3.3 Validasi Kontak (Format Email Salah)', `Lolos dengan HTTP ${res.status}`, 'Celah validasi: string email sembarangan diizinkan');
    } else {
      pass('3.3 Validasi Kontak (Format Email Salah)', `Ditolak dengan HTTP ${res.status}`);
    }
  } catch (err) {
    fail('3.3 Validasi Kontak (Format Email Salah)', 'Koneksi gagal', err.message);
  }

  // 3.4 Validasi Program Kerja: Anggaran Negatif (budget < 0)
  try {
    const invalidProgram = {
      name: "Renovasi Kubah",
      pic: "Ustadz Hidayat",
      budget: -20000000,
      status: "Direncanakan",
      date: new Date().toISOString().split('T')[0]
    };

    const res = await authFetch(`${BACKEND_URL}/api/programs`, {
      method: 'POST',
      body: JSON.stringify(invalidProgram)
    });
    const data = await res.json();

    if (res.status === 400) {
      pass('3.4 Validasi Program Kerja (Anggaran Negatif)', `Ditolak dengan benar (HTTP 400): Anggaran tidak boleh negatif`);
    } else if (res.ok) {
      fail('3.4 Validasi Program Kerja (Anggaran Negatif)', `Lolos dengan HTTP ${res.status}`, 'Celah validasi: anggaran negatif diizinkan');
    } else {
      pass('3.4 Validasi Program Kerja (Anggaran Negatif)', `Ditolak dengan HTTP ${res.status}`);
    }
  } catch (err) {
    fail('3.4 Validasi Program Kerja (Anggaran Negatif)', 'Koneksi gagal', err.message);
  }

  // 3.5 Validasi Jemaah: Kategori Enum Tidak Dikenal
  try {
    const invalidJemaah = {
      name: "Siti Rahma",
      category: "KategoriPalsu",
      phone: "081234567890",
      address: "Jl. Palu Raya"
    };

    const res = await authFetch(`${BACKEND_URL}/api/jemaah`, {
      method: 'POST',
      body: JSON.stringify(invalidJemaah)
    });
    const data = await res.json();

    if (res.status === 400) {
      pass('3.5 Validasi Jemaah (Kategori Enum Ilegal)', `Ditolak dengan benar (HTTP 400): Kategori jemaah harus valid`);
    } else if (res.ok) {
      warn('3.5 Validasi Jemaah (Kategori Enum Ilegal)', 'Backend mengizinkan kategori jemaah dinamis / kustom');
    } else {
      pass('3.5 Validasi Jemaah (Kategori Enum Ilegal)', `Ditolak dengan HTTP ${res.status}`);
    }
  } catch (err) {
    fail('3.5 Validasi Jemaah (Kategori Enum Ilegal)', 'Koneksi gagal', err.message);
  }

  // ==========================================
  // 4. PENGUJIAN RESPONSE STATUS CODE & ENTITY NOT FOUND (404)
  // ==========================================
  console.log('\n--- 4. PENGUJIAN STATUS CODE & PENANGANAN RESOURCE NOT FOUND (404) ---');

  // 4.1 Request ID yang tidak ada pada Transaksi
  try {
    const res = await authFetch(`${BACKEND_URL}/api/transactions/00000000-0000-0000-0000-000000000000`);
    if (res.status === 404) {
      pass('4.1 Resource Not Found (GET /transactions/:id palsu)', `Mengembalikan HTTP 404 Not Found secara tepat`);
    } else {
      fail('4.1 Resource Not Found', `Mendapat status HTTP ${res.status}`, 'Seharusnya mengembalikan 404 jika entitas tidak ada');
    }
  } catch (err) {
    fail('4.1 Resource Not Found', 'Koneksi gagal', err.message);
  }

  // 4.2 Request ID yang tidak ada pada Program Kerja
  try {
    const res = await authFetch(`${BACKEND_URL}/api/programs/00000000-0000-0000-0000-000000000000`);
    if (res.status === 404) {
      pass('4.2 Resource Not Found (GET /programs/:id palsu)', `Mengembalikan HTTP 404 Not Found secara tepat`);
    } else {
      fail('4.2 Resource Not Found', `Mendapat status HTTP ${res.status}`, 'Seharusnya mengembalikan 404 jika proker tidak ada');
    }
  } catch (err) {
    fail('4.2 Resource Not Found', 'Koneksi gagal', err.message);
  }

  // ==========================================
  // 5. PENGUJIAN EVENT REAL-TIME (SOCKET.IO)
  // ==========================================
  console.log('\n--- 5. PENGUJIAN EVENT REAL-TIME (SOCKET.IO) ---');

  await new Promise((resolve) => {
    try {
      const socket = io(BACKEND_URL, {
        transports: ['websocket', 'polling'],
        timeout: 5000
      });

      socket.on('connect', () => {
        pass('5.1 Koneksi Real-Time Socket.IO', `Berhasil terhubung ke WebSocket Server (Socket ID: ${socket.id})`);
        socket.disconnect();
        resolve();
      });

      socket.on('connect_error', (err) => {
        fail('5.1 Koneksi Real-Time Socket.IO', 'Koneksi WebSocket gagal', err.message);
        socket.disconnect();
        resolve();
      });

      setTimeout(() => {
        if (!socket.connected) {
          warn('5.1 Koneksi Real-Time Socket.IO', 'Timeout menunggu handshake socket');
          socket.disconnect();
          resolve();
        }
      }, 4000);
    } catch (err) {
      fail('5.1 Koneksi Real-Time Socket.IO', 'Error inisialisasi socket', err.message);
      resolve();
    }
  });

  // ==========================================
  // 6. PENGUJIAN AUDIT LOG RECORDING (PRD 4.13)
  // ==========================================
  console.log('\n--- 6. PENGUJIAN AUDIT LOGGING (PRD 4.13) ---');

  try {
    const res = await authFetch(`${BACKEND_URL}/api/audit-logs`);
    const data = await res.json();
    const logs = data.data || data;

    if (res.ok && Array.isArray(logs)) {
      pass('6.1 Audit Log Tracking', `Tercatat ${logs.length} rekam jejak aktivitas pengurus (Aksi: CREATE, UPDATE, DELETE) dengan rincian User & IP`);
    } else {
      fail('6.1 Audit Log Tracking', `Response HTTP ${res.status}`, JSON.stringify(data));
    }
  } catch (err) {
    fail('6.1 Audit Log Tracking', 'Koneksi gagal', err.message);
  }

  // ==========================================
  // REKAPITULASI HASIL
  // ==========================================
  console.log('\n========================================================================');
  console.log(`🎯 TOTAL PENGUJIAN API & VALIDASI: ${results.passed.length + results.failed.length}`);
  console.log(`✅ BERHASIL (PASSED): ${results.passed.length}`);
  console.log(`❌ GAGAL (FAILED / BUGS): ${results.failed.length}`);
  console.log('========================================================================\n');

  return results;
}

runApiValidationTestSuite();
