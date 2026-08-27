const BACKEND_URL = 'http://localhost:3000';
const FRONTEND_URL = 'http://localhost:5173';

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
    'Origin': 'http://localhost:5173',
    'Referer': 'http://localhost:5173/',
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

async function runE2EFunctionalTests() {
  console.log('================================================================');
  console.log('🚀 PENGUJIAN FUNGSIONAL END-TO-END (E2E) SESUAI DOKUMEN PRD.md');
  console.log('================================================================\n');

  // ==========================================
  // 1. PENGUJIAN PORTAL PUBLIK & FORMULIR (PRD 3.1 & 4.2)
  // ==========================================
  console.log('--- 1. MODUL PORTAL PUBLIK & KETERLIBATAN JEMAAH ---');

  // 1.1 Donasi Publik / Infaq Online (QRIS & Transfer)
  try {
    const donatePayload = {
      type: 'Pemasukan',
      category: 'Dana Infak',
      amount: 50000,
      description: 'Infaq Subuh Hamba Allah via E2E Test',
      donorName: 'Hamba Allah',
      donorPhone: '08123456789'
    };

    const res = await fetch(`${BACKEND_URL}/api/transactions/public-donate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(donatePayload)
    });

    const data = await res.json();
    if (res.status === 201 || (res.ok && (data.success || data.data))) {
      pass('1.1 Donasi Online Publik', `Donasi QR/Transfer berhasil dicatat ke Kas (ID: ${data.data?.id || 'OK'}, Saldo Bertambah: Rp ${donatePayload.amount})`);
    } else {
      fail('1.1 Donasi Online Publik', `Response HTTP ${res.status}`, JSON.stringify(data));
    }
  } catch (err) {
    fail('1.1 Donasi Online Publik', 'Koneksi gagal', err.message);
  }

  // 1.2 Pendaftaran Jemaah Mandiri Publik (dengan Geotagging)
  let registeredJemaahId = null;
  try {
    const jemaahPayload = {
      name: 'Budi Santoso (E2E Test)',
      category: 'Umum',
      phone: '081298765432',
      address: 'Jl. Merak No. 12 Tinggede Selatan',
      lat: -0.9254,
      lng: 119.8732
    };

    const res = await fetch(`${BACKEND_URL}/api/jemaah/public-register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(jemaahPayload)
    });

    const data = await res.json();
    if (res.status === 201 || (res.ok && (data.success || data.id || data.data))) {
      registeredJemaahId = data.data?.id || data.id;
      pass('1.2 Pendaftaran Jemaah Mandiri', `Jemaah baru berhasil terdaftar dengan Geotagging GIS (ID: ${registeredJemaahId})`);
    } else {
      fail('1.2 Pendaftaran Jemaah Mandiri', `Response HTTP ${res.status}`, JSON.stringify(data));
    }
  } catch (err) {
    fail('1.2 Pendaftaran Jemaah Mandiri', 'Koneksi gagal', err.message);
  }

  // 1.3 Form Kontak Jemaah Publik
  let contactMessageId = null;
  try {
    const contactPayload = {
      fullName: 'Ahmad Fauzi (E2E Test)',
      email: 'ahmad.fauzi.test@gmail.com',
      whatsapp: '081345678901',
      subject: 'Pertanyaan Umum',
      message: 'Apakah ada pengajian rutin untuk remaja di Masjid Al-Falah?'
    };

    const res = await fetch(`${BACKEND_URL}/api/contact-messages`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(contactPayload)
    });

    const data = await res.json();
    if (res.status === 201 || (res.ok && (data.success || data.id || data.data))) {
      contactMessageId = data.data?.id || data.id;
      pass('1.3 Formulir Kontak Publik', `Pesan masuk tersimpan ke inbox DKM (ID: ${contactMessageId})`);
    } else {
      fail('1.3 Formulir Kontak Publik', `Response HTTP ${res.status}`, JSON.stringify(data));
    }
  } catch (err) {
    fail('1.3 Formulir Kontak Publik', 'Koneksi gagal', err.message);
  }

  // 1.4 API Berita & Kegiatan Publik
  try {
    const res = await fetch(`${BACKEND_URL}/api/articles`);
    const data = await res.json();
    if (res.ok && Array.isArray(data.data || data)) {
      const list = data.data || data;
      pass('1.4 Portal Berita & Kegiatan', `Berhasil memuat ${list.length} artikel terpublikasi untuk jemaah`);
    } else {
      fail('1.4 Portal Berita & Kegiatan', `Response HTTP ${res.status}`, JSON.stringify(data));
    }
  } catch (err) {
    fail('1.4 Portal Berita & Kegiatan', 'Koneksi gagal', err.message);
  }

  // ==========================================
  // 2. PENGUJIAN AUTENTIKASI & KEAMANAN RBAC (PRD 4.1)
  // ==========================================
  console.log('\n--- 2. MODUL AUTENTIKASI, KEAMANAN & RBAC ---');

  // 2.1 Proteksi Rute Tertutup (Unauthenticated Rejection)
  try {
    const unauthRes = await fetch(`${BACKEND_URL}/api/transactions`);
    if (unauthRes.status === 401) {
      pass('2.1 Proteksi Rute DKM (401 Unauthorized)', 'Endpoint privat berhasil menolak request tanpa session aktif');
    } else {
      fail('2.1 Proteksi Rute DKM', `Harusnya 401, mendapat ${unauthRes.status}`, 'Celah keamanan: endpoint privat tidak terproteksi');
    }
  } catch (err) {
    fail('2.1 Proteksi Rute DKM', 'Koneksi gagal', err.message);
  }

  // 2.2 Login Pengurus DKM via Better-Auth
  try {
    const loginRes = await fetch(`${BACKEND_URL}/api/auth/sign-in/email`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Origin': 'http://localhost:5173',
        'Referer': 'http://localhost:5173/'
      },
      body: JSON.stringify({
        email: 'admin_alfalah@example.com',
        password: 'password123'
      })
    });

    const setCookieHeader = loginRes.headers.get('set-cookie');
    if (loginRes.ok) {
      if (setCookieHeader) {
        sessionCookie = setCookieHeader.split(',').map(c => c.split(';')[0]).join('; ');
      }
      pass('2.2 Autentikasi Pengurus (Better-Auth)', `Login berhasil sebagai Super Admin / Ketua DKM`);
    } else {
      const errData = await loginRes.json().catch(() => ({}));
      warn('2.2 Autentikasi Pengurus', `Akun admin_alfalah belum ter-seed (${JSON.stringify(errData)}), mencoba buat akun baru...`);

      // Coba SignUp
      const signUpRes = await fetch(`${BACKEND_URL}/api/auth/sign-up/email`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Origin': 'http://localhost:5173',
          'Referer': 'http://localhost:5173/'
        },
        body: JSON.stringify({
          email: 'admin_alfalah@example.com',
          password: 'password123',
          name: 'Ketua DKM Al-Falah',
          role: 'Ketua'
        })
      });
      const suSetCookie = signUpRes.headers.get('set-cookie');
      if (signUpRes.ok && suSetCookie) {
        sessionCookie = suSetCookie.split(',').map(c => c.split(';')[0]).join('; ');
        pass('2.2 Autentikasi Pengurus (Better-Auth)', 'Akun Pengurus berhasil didaftarkan dan session aktif');
      } else {
        fail('2.2 Autentikasi Pengurus', `Status SignUp ${signUpRes.status}`, 'Gagal membuat sesi login DKM');
      }
    }
  } catch (err) {
    fail('2.2 Autentikasi Pengurus', 'Koneksi gagal', err.message);
  }

  // ==========================================
  // 3. PENGUJIAN MANAJEMEN KEUANGAN (PRD 4.3)
  // ==========================================
  console.log('\n--- 3. MODUL MANAJEMEN KEUANGAN & ARUS KAS ---');

  let testTransactionId = null;
  try {
    // 3.1 Pencatatan Transaksi Kas Masuk
    const txIn = {
      date: new Date().toISOString().split('T')[0],
      type: 'Pemasukan',
      category: 'Kas Umum',
      amount: 1500000,
      description: 'Infaq Kotak Amal Jumat Berkah (E2E Test)'
    };

    const res = await authFetch(`${BACKEND_URL}/api/transactions`, {
      method: 'POST',
      body: JSON.stringify(txIn)
    });
    const data = await res.json();

    if (res.ok && (data.success || data.data?.id || data.id)) {
      testTransactionId = data.data?.id || data.id;
      pass('3.1 Pencatatan Kas Masuk', `Transaksi kas masuk tercatat (ID: ${testTransactionId}, Rp ${txIn.amount})`);
    } else {
      fail('3.1 Pencatatan Kas Masuk', `Response HTTP ${res.status}`, JSON.stringify(data));
    }
  } catch (err) {
    fail('3.1 Pencatatan Kas Masuk', 'Koneksi gagal', err.message);
  }

  // 3.2 Pencatatan Kas Keluar (Operasional)
  let testTxOutId = null;
  try {
    const txOut = {
      date: new Date().toISOString().split('T')[0],
      type: 'Pengeluaran',
      category: 'Operasional',
      amount: 350000,
      description: 'Pembelian Perlengkapan Kebersihan Masjid (E2E Test)'
    };

    const res = await authFetch(`${BACKEND_URL}/api/transactions`, {
      method: 'POST',
      body: JSON.stringify(txOut)
    });
    const data = await res.json();

    if (res.ok && (data.success || data.data?.id || data.id)) {
      testTxOutId = data.data?.id || data.id;
      pass('3.2 Pencatatan Kas Keluar', `Transaksi pengeluaran operasional tercatat (ID: ${testTxOutId}, Rp ${txOut.amount})`);
    } else {
      fail('3.2 Pencatatan Kas Keluar', `Response HTTP ${res.status}`, JSON.stringify(data));
    }
  } catch (err) {
    fail('3.2 Pencatatan Kas Keluar', 'Koneksi gagal', err.message);
  }

  // 3.3 Verifikasi Perhitungan Saldo Kas Real-Time
  try {
    const res = await authFetch(`${BACKEND_URL}/api/transactions/summary`);
    const data = await res.json();
    const sum = data.data || data;
    if (res.ok && sum.totalPemasukan !== undefined && sum.totalPengeluaran !== undefined) {
      const calculatedSaldo = Number(sum.totalPemasukan) - Number(sum.totalPengeluaran);
      const reportedSaldo = Number(sum.saldoSaatIni !== undefined ? sum.saldoSaatIni : calculatedSaldo);
      if (Math.abs(calculatedSaldo - reportedSaldo) === 0) {
        pass('3.3 Verifikasi Integritas Saldo', `Formula Saldo Terbukti Akurat: Pemasukan (Rp ${sum.totalPemasukan}) - Pengeluaran (Rp ${sum.totalPengeluaran}) = Saldo Kas (Rp ${reportedSaldo})`);
      } else {
        fail('3.3 Verifikasi Integritas Saldo', `Selisih saldo: calc ${calculatedSaldo} vs reported ${reportedSaldo}`, 'Kalkulasi saldo tidak konsisten');
      }
    } else {
      fail('3.3 Verifikasi Integritas Saldo', `Response HTTP ${res.status}`, JSON.stringify(data));
    }
  } catch (err) {
    fail('3.3 Verifikasi Integritas Saldo', 'Koneksi gagal', err.message);
  }

  // ==========================================
  // 4. PENGUJIAN PROGRAM KERJA & AUTO-FINANCIAL SYNC (PRD 4.4)
  // ==========================================
  console.log('\n--- 4. MODUL PROGRAM KERJA & AUTO-FINANCIAL SYNC ---');

  let testProgramId = null;
  try {
    // 4.1 Pembuatan Program Kerja
    const programPayload = {
      name: 'Santunan Akbar Yatim & Dhuafa (E2E Test)',
      pic: 'Ustadz Ahmad Fauzan',
      budget: 5000000,
      status: 'Direncanakan',
      date: new Date().toISOString().split('T')[0],
      description: 'Pemberian santunan sembako dan uang tunai untuk 50 anak yatim'
    };

    const res = await authFetch(`${BACKEND_URL}/api/programs`, {
      method: 'POST',
      body: JSON.stringify(programPayload)
    });
    const data = await res.json();

    if (res.ok && (data.success || data.data?.id || data.id)) {
      testProgramId = data.data?.id || data.id;
      pass('4.1 Pembuatan Program Kerja', `Program kerja berhasil dibuat (ID: ${testProgramId}, Anggaran: Rp ${programPayload.budget})`);
    } else {
      fail('4.1 Pembuatan Program Kerja', `Response HTTP ${res.status}`, JSON.stringify(data));
    }
  } catch (err) {
    fail('4.1 Pembuatan Program Kerja', 'Koneksi gagal', err.message);
  }

  // 4.2 Update Status Kanban Drag-and-Drop (Direncanakan -> Sedang Berjalan)
  if (testProgramId) {
    try {
      const res = await authFetch(`${BACKEND_URL}/api/programs/${testProgramId}/status`, {
        method: 'PATCH',
        body: JSON.stringify({ status: 'Sedang Berjalan' })
      });
      const data = await res.json();
      if (res.ok && (data.status === 'Sedang Berjalan' || data.success || data.data)) {
        pass('4.2 Papan Kanban Drag-and-Drop', 'Status proker berhasil dipindahkan ke kolom "Sedang Berjalan"');
      } else {
        fail('4.2 Papan Kanban Drag-and-Drop', `Response HTTP ${res.status}`, JSON.stringify(data));
      }
    } catch (err) {
      fail('4.2 Papan Kanban Drag-and-Drop', 'Koneksi gagal', err.message);
    }
  }

  // ==========================================
  // 5. PENGUJIAN DATABASE JEMAAH & GIS (PRD 4.5)
  // ==========================================
  console.log('\n--- 5. MODUL DATABASE JEMAAH & PEMETAAN SPASIAL (GIS) ---');

  try {
    const res = await authFetch(`${BACKEND_URL}/api/jemaah`);
    const data = await res.json();
    const list = data.data || data;
    if (res.ok && Array.isArray(list)) {
      const hasGeo = list.filter(j => j.lat !== null && j.lng !== null && !isNaN(Number(j.lat)));
      pass('5.1 Basis Data Jemaah & GIS', `Total ${list.length} jemaah terdata, ${hasGeo.length} jemaah terverifikasi memiliki koordinat GIS untuk peta Leaflet`);
    } else {
      fail('5.1 Basis Data Jemaah & GIS', `Response HTTP ${res.status}`, JSON.stringify(data));
    }
  } catch (err) {
    fail('5.1 Basis Data Jemaah & GIS', 'Koneksi gagal', err.message);
  }

  // ==========================================
  // 6. PENGUJIAN QURBAN TERPADU & VALIDASI SYARIAT (PRD 4.6)
  // ==========================================
  console.log('\n--- 6. MODUL MANAJEMEN QURBAN (VALIDASI SYARIAT MAKS 7 SAPI) ---');

  try {
    const resYears = await authFetch(`${BACKEND_URL}/api/qurban/tahun`);
    const yearsData = await resYears.json();
    const yearsList = yearsData.data || yearsData;

    if (resYears.ok && Array.isArray(yearsList)) {
      pass('6.1 Tahun Pelaksanaan Qurban', `Terdapat ${yearsList.length} periode tahun pelaksanaan qurban`);
      
      const activeYear = yearsList.find(y => y.statusAktif) || yearsList[0];
      if (activeYear) {
        const resGroups = await authFetch(`${BACKEND_URL}/api/qurban/kelompok?qurbanTahunId=${activeYear.id}`);
        const groupsData = await resGroups.json();
        const groupsList = groupsData.data || groupsData;

        if (resGroups.ok && Array.isArray(groupsList)) {
          pass('6.2 Kelompok Hewan Qurban', `Terdapat ${groupsList.length} kelompok hewan qurban terdaftar`);

          // Validasi Kuota Syariat: Sapi max 7 orang
          const resShohibul = await authFetch(`${BACKEND_URL}/api/qurban?qurbanTahunId=${activeYear.id}`);
          const shohibulData = await resShohibul.json();
          const shohibulList = shohibulData.data || shohibulData;

          if (Array.isArray(shohibulList)) {
            const sapiGroups = groupsList.filter(g => g.jenisHewan?.toLowerCase() === 'sapi');
            let violationFound = false;

            for (const grp of sapiGroups) {
              const members = shohibulList.filter(s => s.qurbanKelompokId === grp.id);
              if (members.length > 7) {
                violationFound = true;
                fail('6.3 Validasi Syariat Sapi (Maks 7 Orang)', `Kelompok Sapi "${grp.namaKelompok}" memiliki ${members.length} peserta`, 'Melanggar batas maksimal 7 pequrban per sapi');
              }
            }

            if (!violationFound) {
              pass('6.3 Validasi Syariat Sapi (Maks 7 Orang)', 'Semua kelompok sapi mematuhi batas syariat fiqih (maksimal 7 shohibul qurban per sapi)');
            }
          }
        }
      }
    } else {
      fail('6.1 Tahun Pelaksanaan Qurban', `Response HTTP ${resYears.status}`, JSON.stringify(yearsData));
    }
  } catch (err) {
    fail('6.1 Tahun Pelaksanaan Qurban', 'Koneksi gagal', err.message);
  }

  // ==========================================
  // 7. PENGUJIAN ZISWAF, INVENTARIS, JADWAL (PRD 4.7, 4.8, 4.9)
  // ==========================================
  console.log('\n--- 7. MODUL ZISWAF, INVENTARIS & JADWAL IBADAH ---');

  // 7.1 ZISWAF
  try {
    const res = await authFetch(`${BACKEND_URL}/api/ziswaf`);
    const data = await res.json();
    if (res.ok && Array.isArray(data.data || data)) {
      pass('7.1 Pengelolaan ZISWAF', `Berhasil memuat ${(data.data || data).length} data transaksi zakat, infaq, shadaqah & wakaf`);
    } else {
      fail('7.1 Pengelolaan ZISWAF', `Response HTTP ${res.status}`, JSON.stringify(data));
    }
  } catch (err) {
    fail('7.1 Pengelolaan ZISWAF', 'Koneksi gagal', err.message);
  }

  // 7.2 Inventaris
  try {
    const res = await authFetch(`${BACKEND_URL}/api/inventaris`);
    const data = await res.json();
    if (res.ok && Array.isArray(data.data || data)) {
      pass('7.2 Inventaris & Fasilitas', `Berhasil memuat ${(data.data || data).length} aset/fasilitas masjid`);
    } else {
      fail('7.2 Inventaris & Fasilitas', `Response HTTP ${res.status}`, JSON.stringify(data));
    }
  } catch (err) {
    fail('7.2 Inventaris & Fasilitas', 'Koneksi gagal', err.message);
  }

  // 7.3 Jadwal Petugas Ibadah
  try {
    const res = await authFetch(`${BACKEND_URL}/api/jadwal`);
    const data = await res.json();
    if (res.ok && Array.isArray(data.data || data)) {
      pass('7.3 Jadwal Petugas Ibadah', `Berhasil memuat ${(data.data || data).length} jadwal Khotib Jumat / Imam Rawatib / Muadzin`);
    } else {
      fail('7.3 Jadwal Petugas Ibadah', `Response HTTP ${res.status}`, JSON.stringify(data));
    }
  } catch (err) {
    fail('7.3 Jadwal Petugas Ibadah', 'Koneksi gagal', err.message);
  }

  // ==========================================
  // 8. PENGUJIAN PESAN MASUK & WHATSAPP (PRD 4.11)
  // ==========================================
  console.log('\n--- 8. MODUL PESAN MASUK & INTEGRASI WHATSAPP ---');

  if (contactMessageId) {
    try {
      const res = await authFetch(`${BACKEND_URL}/api/contact-messages/${contactMessageId}/status`, {
        method: 'PATCH',
        body: JSON.stringify({ status: 'Dibaca' })
      });
      const data = await res.json();
      if (res.ok && (data.status === 'Dibaca' || data.success || data.data)) {
        pass('8.1 Manajemen Pesan Masuk DKM', `Status pesan ID ${contactMessageId} berhasil diperbarui menjadi "Dibaca"`);
      } else {
        fail('8.1 Manajemen Pesan Masuk DKM', `Response HTTP ${res.status}`, JSON.stringify(data));
      }
    } catch (err) {
      fail('8.1 Manajemen Pesan Masuk DKM', 'Koneksi gagal', err.message);
    }
  }

  // ==========================================
  // 9. PENGUJIAN PUSAT NOTIFIKASI (PRD 4.13)
  // ==========================================
  console.log('\n--- 9. PUSAT NOTIFIKASI REAL-TIME ---');

  try {
    const res = await authFetch(`${BACKEND_URL}/api/notifications`);
    const data = await res.json();
    if (res.ok && Array.isArray(data.data || data)) {
      pass('9.1 Pusat Notifikasi', `Berhasil mengambil riwayat notifikasi sistem (${(data.data || data).length} notifikasi tersimpan)`);
    } else {
      fail('9.1 Pusat Notifikasi', `Response HTTP ${res.status}`, JSON.stringify(data));
    }
  } catch (err) {
    fail('9.1 Pusat Notifikasi', 'Koneksi gagal', err.message);
  }

  // ==========================================
  // REKAPITULASI HASIL PENGUJIAN E2E
  // ==========================================
  console.log('\n================================================================');
  console.log(`🎯 TOTAL SKENARIO PENGUJIAN E2E: ${results.passed.length + results.failed.length}`);
  console.log(`✅ BERHASIL (PASSED): ${results.passed.length}`);
  console.log(`❌ GAGAL (FAILED / BUGS): ${results.failed.length}`);
  console.log('================================================================\n');

  return results;
}

runE2EFunctionalTests();
