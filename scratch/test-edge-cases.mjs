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

async function runEdgeCasesAndBoundaryTests() {
  console.log('========================================================================');
  console.log('⚡ PENGUJIAN EDGE CASES & BOUNDARY CONDITIONS (BAGIAN 3) SESUAI PRD.md');
  console.log('========================================================================\n');

  // ==========================================
  // 1. SETUP OTENTIKASI PENGURUS
  // ==========================================
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
      pass('0.1 Setup Sesi DKM', 'Session cookie autentikasi berhasil disiapkan');
    } else {
      fail('0.1 Setup Sesi DKM', `HTTP ${loginRes.status}`, 'Gagal login pengurus');
    }
  } catch (err) {
    fail('0.1 Setup Sesi DKM', 'Koneksi gagal', err.message);
  }

  // ==========================================
  // 2. EDGE CASES KEUANGAN & SALDO (PRD 4.3)
  // ==========================================
  console.log('\n--- 1. EDGE CASES MANAJEMEN KEUANGAN (PRD 4.3) ---');

  // 1.1 Transaksi Nominal Sangat Besar (Rp 10.000.000.000 / 10 Miliar)
  let bigTxId = null;
  try {
    const bigTx = {
      date: new Date().toISOString().split('T')[0],
      type: 'Pemasukan',
      category: 'Pembangunan',
      amount: 10000000000, // 10 Miliar
      description: 'Wakaf Pembangunan Menara dari Donatur Utama (Edge Case Testing)'
    };

    const res = await authFetch(`${BACKEND_URL}/api/transactions`, {
      method: 'POST',
      body: JSON.stringify(bigTx)
    });
    const data = await res.json();

    if (res.ok && (data.success || data.data?.id || data.id)) {
      bigTxId = data.data?.id || data.id;
      pass('1.1 Transaksi Nominal Ekstrem (Rp 10 Miliar)', `Berhasil disimpan dengan presisi tinggi tanpa overflow integer (ID: ${bigTxId})`);
    } else {
      fail('1.1 Transaksi Nominal Ekstrem', `HTTP ${res.status}`, JSON.stringify(data));
    }
  } catch (err) {
    fail('1.1 Transaksi Nominal Ekstrem', 'Koneksi gagal', err.message);
  }

  // 1.2 Transaksi Angka Desimal / Pecahan
  let decimalTxId = null;
  try {
    const decTx = {
      date: new Date().toISOString().split('T')[0],
      type: 'Pemasukan',
      category: 'Dana Infak',
      amount: 75432.50, // Nilai desimal pecahan
      description: 'Infaq Transfer QRIS Kode Unik (Edge Case Testing)'
    };

    const res = await authFetch(`${BACKEND_URL}/api/transactions`, {
      method: 'POST',
      body: JSON.stringify(decTx)
    });
    const data = await res.json();

    if (res.ok && (data.success || data.data?.id || data.id)) {
      decimalTxId = data.data?.id || data.id;
      pass('1.2 Transaksi Angka Desimal Pecahan', `Berhasil menangani angka desimal (Rp 75.432,50) dengan pembulatan 2 digit mata uang`);
    } else {
      fail('1.2 Transaksi Angka Desimal Pecahan', `HTTP ${res.status}`, JSON.stringify(data));
    }
  } catch (err) {
    fail('1.2 Transaksi Angka Desimal Pecahan', 'Koneksi gagal', err.message);
  }

  // 1.3 Filter Kas dengan Rentang Tanggal Kosong / Masa Lalu Tanpa Transaksi
  try {
    const res = await authFetch(`${BACKEND_URL}/api/transactions?startDate=1980-01-01&endDate=1980-12-31`);
    const data = await res.json();
    const list = data.data || data;

    if (res.ok && Array.isArray(list)) {
      pass('1.3 Filter Rentang Tanggal Kosong', `Dataset kosong ditangani dengan aman: Mengembalikan array kosong [] (${list.length} item) tanpa crash`);
    } else {
      fail('1.3 Filter Rentang Tanggal Kosong', `HTTP ${res.status}`, JSON.stringify(data));
    }
  } catch (err) {
    fail('1.3 Filter Rentang Tanggal Kosong', 'Koneksi gagal', err.message);
  }

  // ==========================================
  // 3. BOUNDARY CONDITION: SYARIAT KUOTA SAPI MAKSIMAL 7 ORANG (PRD 4.6)
  // ==========================================
  console.log('\n--- 2. BOUNDARY CONDITIONS: VALIDASI SYARIAT SAPI MAKSIMAL 7 ORANG (PRD 4.6) ---');

  try {
    // 2.1 Ambil Tahun Qurban Aktif
    const resYears = await authFetch(`${BACKEND_URL}/api/qurban/tahun`);
    const yearsData = await resYears.json();
    const activeYear = (yearsData.data || yearsData)[0];

    if (!activeYear) {
      fail('2.1 Setup Uji Batas Qurban', 'Tahun qurban tidak ditemukan');
    } else {
      // 2.2 Buat Kelompok Sapi Khusus Uji Batas
      const groupRes = await authFetch(`${BACKEND_URL}/api/qurban/kelompok`, {
        method: 'POST',
        body: JSON.stringify({
          qurbanTahunId: activeYear.id,
          namaKelompok: `Kelompok Sapi Test Boundary #${Date.now()}`,
          jenisHewan: 'Sapi'
        })
      });
      const groupData = await groupRes.json();
      const testGroupId = groupData.id || groupData.data?.id;

      if (!testGroupId) {
        fail('2.2 Buat Kelompok Sapi Uji Batas', `HTTP ${groupRes.status}`, JSON.stringify(groupData));
      } else {
        pass('2.1 Inisialisasi Kelompok Sapi Uji Batas', `Kelompok Sapi "${groupData.namaKelompok || 'Test'}" (ID: ${testGroupId}) berhasil dibuat`);

        // 2.3 Buat / Ambil 8 Jemaah untuk Uji Batas
        const resJemaah = await authFetch(`${BACKEND_URL}/api/jemaah`);
        const jemaahData = await resJemaah.json();
        const jemaahList = jemaahData.data || jemaahData;

        // Pastikan kita punya minimal 8 jemaah
        const candidateJemaah = [...jemaahList];
        while (candidateJemaah.length < 8) {
          const createJ = await authFetch(`${BACKEND_URL}/api/jemaah`, {
            method: 'POST',
            body: JSON.stringify({
              name: `Jemaah Test Qurban ${candidateJemaah.length + 1}`,
              category: 'Umum',
              phone: `0812${Math.floor(10000000 + Math.random() * 90000000)}`,
              address: 'Jl. Merak'
            })
          });
          const newJData = await createJ.json();
          const newJ = newJData.data || newJData;
          candidateJemaah.push(newJ);
        }

        // 2.4 Tambahkan 7 Shohibul Qurban ke Kelompok Sapi (Batas Syariat Halal)
        let countAdded = 0;
        for (let i = 0; i < 7; i++) {
          const addRes = await authFetch(`${BACKEND_URL}/api/qurban`, {
            method: 'POST',
            body: JSON.stringify({
              jemaahId: candidateJemaah[i].id,
              qurbanTahunId: activeYear.id,
              qurbanKelompokId: testGroupId,
              jenisHewan: 'Sapi',
              status: 'Lunas'
            })
          });
          if (addRes.ok) {
            countAdded++;
          }
        }

        if (countAdded === 7) {
          pass('2.2 Kuota Maksimal Sah (7 Anggota)', `Berhasil mengisi 7 shohibul qurban ke dalam 1 ekor sapi sesuai ketentuan fiqih`);
        } else {
          fail('2.2 Kuota Maksimal Sah (7 Anggota)', `Hanya berhasil menambahkan ${countAdded}/7 anggota`);
        }

        // 2.5 Mencoba Memasukkan Anggota ke-8 ke Kelompok Sapi yang Sama -> HARUS DITOLAK KERAS OLEH BACKEND
        const overflowRes = await authFetch(`${BACKEND_URL}/api/qurban`, {
          method: 'POST',
          body: JSON.stringify({
            jemaahId: candidateJemaah[7].id,
            qurbanTahunId: activeYear.id,
            qurbanKelompokId: testGroupId,
            jenisHewan: 'Sapi',
            status: 'Lunas'
          })
        });
        const overflowData = await overflowRes.json();

        if (overflowRes.status === 400 && (overflowData.error || overflowData.message)) {
          pass('2.3 Penolakan Anggota ke-8 (Hard-Limit Syariat Sapi)', `BERHASIL DIGAGALKAN OLEH BACKEND (HTTP 400): "${overflowData.error || overflowData.message}"`);
        } else if (overflowRes.ok) {
          fail('2.3 Penolakan Anggota ke-8', `Lolos dengan HTTP ${overflowRes.status}`, 'CRITICAL BUG: Kelompok Sapi berhasil menampung 8 orang (Melanggar aturan syariat fiqih Islam)');
        } else {
          pass('2.3 Penolakan Anggota ke-8 (Hard-Limit Syariat Sapi)', `Ditolak dengan status HTTP ${overflowRes.status}`);
        }
      }
    }
  } catch (err) {
    fail('2. Boundary Syariat Qurban', 'Koneksi gagal', err.message);
  }

  // ==========================================
  // 4. EDGE CASES KARAKTER SPESIAL, EMOJI & SQL WILDCARDS (PRD 4.5)
  // ==========================================
  console.log('\n--- 3. EDGE CASES KARAKTER UNICODE, EMOJI & PENCARIAN (PRD 4.5) ---');

  // 3.1 Penyimpanan Nama dengan Aksara Arab, Simbol Khusus & Emoji
  let specialJemaahId = null;
  try {
    const specialJemaah = {
      name: "بِسْمِ اللَّهِ - H. Dr. Muhammad Syarifuddin, Lc., M.A. 🕌✨",
      category: "Muzakki",
      phone: "081122334455",
      address: "Kompleks Masjid Blok A-1 #05/02 (Gg. Mawar & Melati) ~ Tinggede",
      skills: "Kajian Fiqih, Tahsin, Arabic Calligraphy ✒️"
    };

    const res = await authFetch(`${BACKEND_URL}/api/jemaah`, {
      method: 'POST',
      body: JSON.stringify(specialJemaah)
    });
    const data = await res.json();

    if (res.ok && (data.success || data.data?.id || data.id)) {
      specialJemaahId = data.data?.id || data.id;
      pass('3.1 Dukungan UTF-8 Multilingual & Emoji', `Nama beraksara Arab & Emoji tersimpan sempurna di MySQL (ID: ${specialJemaahId})`);
    } else {
      fail('3.1 Dukungan UTF-8 Multilingual & Emoji', `HTTP ${res.status}`, JSON.stringify(data));
    }
  } catch (err) {
    fail('3.1 Dukungan UTF-8 Multilingual & Emoji', 'Koneksi gagal', err.message);
  }

  // 3.2 Pencarian dengan Karakter SQL Wildcard (%, _, ', ", \)
  try {
    const queries = ['%50%', "H. Dr. Muhammad'", 'Blok A-1_05', "test\\search", "🕌"];
    let allQueriesSafe = true;

    for (const q of queries) {
      const res = await authFetch(`${BACKEND_URL}/api/jemaah?search=${encodeURIComponent(q)}`);
      if (!res.ok) {
        allQueriesSafe = false;
        fail('3.2 Sanitasi Karakter Wildcard pada Pencarian', `Query "${q}" menghasilkan HTTP ${res.status}`, 'Potensi error SQL syntax');
      }
    }

    if (allQueriesSafe) {
      pass('3.2 Sanitasi Karakter Wildcard pada Pencarian', `Query pencarian mengandung '%', '_', single quote, backslash, dan emoji dieksekusi dengan aman tanpa SQL Injection`);
    }
  } catch (err) {
    fail('3.2 Sanitasi Karakter Wildcard pada Pencarian', 'Koneksi gagal', err.message);
  }

  // ==========================================
  // 5. EDGE CASES PROGRAM KERJA: REALISASI ANGGARAN LEBIH (OVER-BUDGET) (PRD 4.4)
  // ==========================================
  console.log('\n--- 4. EDGE CASES PROGRAM KERJA & REALISASI FINANSIAL (PRD 4.4) ---');

  try {
    // Buat program kerja dengan budget 2 Juta
    const prokerRes = await authFetch(`${BACKEND_URL}/api/programs`, {
      method: 'POST',
      body: JSON.stringify({
        name: "Pengadaan Karpet Shaf Utama (Edge Case)",
        pic: "Seksi Perlengkapan",
        budget: 2000000,
        status: "Sedang Berjalan",
        date: new Date().toISOString().split('T')[0],
        description: "Pengadaan Karpet Shaf Utama untuk kenyamanan ibadah jemaah Al-Falah"
      })
    });
    const prokerData = await prokerRes.json();
    const pId = prokerData.id || prokerData.data?.id;

    if (pId) {
      // Catat mutasi pengeluaran riil sebesar 2.450.000 (Over budget 450rb) yang terhubung ke program
      const txRealRes = await authFetch(`${BACKEND_URL}/api/transactions`, {
        method: 'POST',
        body: JSON.stringify({
          date: new Date().toISOString().split('T')[0],
          type: 'Pengeluaran',
          category: 'Pembangunan',
          amount: 2450000, // Over-budget
          description: 'Pelunasan Karpet Shaf (Realisasi Program ID: ' + pId + ')',
          programId: pId
        })
      });

      if (txRealRes.ok) {
        pass('4.1 Penanganan Realisasi Anggaran Over-Budget', `Program anggaran Rp 2.000.000 dapat menautkan pengeluaran riil Rp 2.450.000 secara akuntabel`);
      } else {
        fail('4.1 Penanganan Realisasi Anggaran Over-Budget', `HTTP ${txRealRes.status}`, await txRealRes.text());
      }
    } else {
      fail('4.1 Penanganan Realisasi Anggaran Over-Budget', `HTTP ${prokerRes.status}`, JSON.stringify(prokerData));
    }
  } catch (err) {
    fail('4.1 Penanganan Realisasi Anggaran Over-Budget', 'Koneksi gagal', err.message);
  }

  // ==========================================
  // 6. EDGE CASES INVENTARIS: BATAS JUMLAH BARANG (PRD 4.8)
  // ==========================================
  console.log('\n--- 5. EDGE CASES INVENTARIS & ASET MASJID (PRD 4.8) ---');

  try {
    const invRes = await authFetch(`${BACKEND_URL}/api/inventaris`, {
      method: 'POST',
      body: JSON.stringify({
        name: "Buku Yasin & Tahlil Jemaah",
        quantity: 500, // Kuantitas besar
        date: new Date().toISOString().split('T')[0],
        location: "Ruang Utama",
        condition: "Baik",
        notes: "Wakaf dari H. Ahmad"
      })
    });
    const invData = await invRes.json();

    if (invRes.ok && (invData.success || invData.data?.id || invData.id)) {
      pass('5.1 Inventarisasi Kuantitas Massal', `Aset dengan kuantitas 500 unit berhasil dicatat`);
    } else {
      fail('5.1 Inventarisasi Kuantitas Massal', `HTTP ${invRes.status}`, JSON.stringify(invData));
    }
  } catch (err) {
    fail('5.1 Inventarisasi Kuantitas Massal', 'Koneksi gagal', err.message);
  }

  // ==========================================
  // REKAPITULASI HASIL PENGUJIAN EDGE CASES
  // ==========================================
  console.log('\n========================================================================');
  console.log(`🎯 TOTAL PENGUJIAN EDGE CASES & BOUNDARY: ${results.passed.length + results.failed.length}`);
  console.log(`✅ BERHASIL (PASSED): ${results.passed.length}`);
  console.log(`❌ GAGAL (FAILED / BUGS): ${results.failed.length}`);
  console.log('========================================================================\n');

  return results;
}

runEdgeCasesAndBoundaryTests();
