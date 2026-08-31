import React, { useState, useEffect, useMemo } from 'react';
import { useLocation } from 'react-router-dom';
import { X, Search, ChevronDown, ChevronUp, BookOpen, ShieldCheck, Sparkles, HelpCircle, CheckCircle2, Phone, Mail } from 'lucide-react';

// Panduan komprehensif seluruh modul dashboard sesuai PRD.md
const HELP_GUIDES = [
  {
    id: 'dashboard',
    path: '/dashboard',
    name: 'Dashboard Overview',
    icon: 'dashboard',
    role: 'Seluruh Pengurus',
    badgeColor: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20',
    summary: 'Pusat pantauan eksekutif untuk melihat ringkasan keuangan, jemaah, program kerja aktif, dan jadwal sholat secara real-time.',
    keyFeatures: [
      {
        title: 'Kartu Ringkasan Metrik',
        desc: 'Pantau Saldo Kas, Total Jemaah, Program Kerja Aktif, dan Jadwal Sholat hari ini dalam sekali pandang.'
      },
      {
        title: 'Grafik Arus Kas',
        desc: 'Visualisasi grafik tren pemasukan vs pengeluaran mingguan/bulanan untuk evaluasi finansial cepat.'
      },
      {
        title: 'Aksi Cepat (Quick Actions)',
        desc: 'Pintasan langsung untuk mencatat transaksi, menambah program kerja, atau mendaftarkan jemaah baru.'
      }
    ],
    faqs: [
      {
        q: 'Dari mana data saldo kas dan metrik utama dihitung?',
        a: 'Saldo kas dihitung otomatis dari seluruh akumulasi transaksi pemasukan dikurangi pengeluaran di modul Keuangan. Data diperbarui secara real-time berkat integrasi WebSocket (Socket.IO).'
      },
      {
        q: 'Apakah jadwal waktu sholat disesuaikan dengan koordinat masjid?',
        a: 'Ya, jadwal sholat dan waktu countdown dihitung otomatis berdasarkan lokasi koordinat masjid yang terdaftar pada menu Pengaturan.'
      }
    ]
  },
  {
    id: 'keuangan',
    path: '/dashboard/keuangan',
    name: 'Manajemen Keuangan',
    icon: 'payments',
    role: 'Bendahara & Ketua',
    badgeColor: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20',
    summary: 'Pengelolaan pembukuan kas masjid, pencatatan transaksi multi-kategori, filter periode, dan ekspor laporan resmi.',
    keyFeatures: [
      {
        title: 'Pencatatan Pemasukan & Pengeluaran',
        desc: 'Mencatat transaksi dengan kategori dinamis (Kas Umum, Infaq, Zakat, Operasional, Pembangunan) beserta tanggal dan rincian.'
      },
      {
        title: 'Filter Periode & Kategori',
        desc: 'Menyaring mutasi kas berdasarkan rentang tanggal tertentu atau kategori dana tertentu.'
      },
      {
        title: 'Ekspor Dokumen Resmi',
        desc: 'Cetak dan unduh laporan kas ke format PDF resmi siap rapat/papan pengumuman serta format Excel (XLSX) untuk pembukuan akuntansi.'
      }
    ],
    faqs: [
      {
        q: 'Bagaimana cara mencatat pengeluaran yang berasal dari Program Kerja?',
        a: 'Anda tidak perlu mencatat dua kali. Saat status Program Kerja diubah menjadi "Selesai" di modul Program Kerja, sistem akan otomatis mencatatkan nominal realisasinya ke dalam modul Keuangan.'
      },
      {
        q: 'Bagaimana cara mencetak laporan keuangan bulanan?',
        a: 'Gunakan filter tanggal di bagian atas halaman untuk memilih rentang bulan yang diinginkan, kemudian klik tombol "Ekspor PDF" atau "Ekspor Excel".'
      },
      {
        q: 'Apakah kategori kas bisa ditambah atau disesuaikan?',
        a: 'Bisa, daftar kategori kas dan rekening resmi dapat dikonfigurasi melalui menu Pengaturan > Tab Kategori & Bank oleh Ketua/Admin.'
      }
    ]
  },
  {
    id: 'program-kerja',
    path: '/dashboard/program-kerja',
    name: 'Program Kerja & Kanban',
    icon: 'view_kanban',
    role: 'Sekretaris & Ketua',
    badgeColor: 'text-blue-400 bg-blue-500/10 border-blue-500/20',
    summary: 'Manajemen kegiatan DKM dengan papan visual Kanban, monitoring anggaran vs realisasi, dan sinkronisasi otomatis ke kas.',
    keyFeatures: [
      {
        title: 'Papan Kanban Interaktif',
        desc: 'Geser kartu kegiatan (Drag & Drop) antar status: Direncanakan, Sedang Berjalan, Selesai, dan Dibatalkan.'
      },
      {
        title: 'Auto-Financial Sync saat Selesai',
        desc: 'Ketika program digeser ke kolom "Selesai", modal realisasi anggaran akan muncul dan otomatis membukukan pengeluaran ke kas masjid.'
      },
      {
        title: 'Manajemen LPJ & Dokumentasi',
        desc: 'Simpan link dokumen LPJ serta URL dokumentasi foto kegiatan untuk arsip digital yang rapi.'
      }
    ],
    faqs: [
      {
        q: 'Apa yang terjadi jika saya mengubah status program menjadi "Selesai"?',
        a: 'Sistem akan meminta konfirmasi input realisasi anggaran riil dan evaluasi program. Nominal realisasi tersebut langsung tercatat sebagai transaksi pengeluaran di modul Keuangan dengan tautan ID program.'
      },
      {
        q: 'Bisakah saya beralih antara tampilan Kanban dan Tabel?',
        a: 'Ya, Anda dapat menekan tombol toggle tampilan (Kanban / Tabel) di pojok kanan atas halaman Program Kerja sesuai kenyamanan Anda.'
      }
    ]
  },
  {
    id: 'jemaah',
    path: '/dashboard/jemaah',
    name: 'Database Jemaah & GIS',
    icon: 'group',
    role: 'Seluruh Pengurus',
    badgeColor: 'text-purple-400 bg-purple-500/10 border-purple-500/20',
    summary: 'Basis data warga jemaah, klasifikasi sosial mustahik/muzakki, pencatatan keahlian, dan peta sebaran geografis (GIS).',
    keyFeatures: [
      {
        title: 'Profil Terpadu & Klasifikasi',
        desc: 'Data kontak, alamat, dan kategori jemaah (Muzakki, Mustahik, Yatim, Lansia, Umum) serta pencatatan keahlian warga.'
      },
      {
        title: 'Geotagging & Peta Interaktif',
        desc: 'Peta Leaflet (OpenStreetMap) yang memvisualisasikan klaster tempat tinggal jemaah untuk memudahkan zonasi bantuan.'
      },
      {
        title: 'Impor & Ekspor Excel',
        desc: 'Dukungan ekspor seluruh data jemaah serta impor massal dari file spreadsheet.'
      }
    ],
    faqs: [
      {
        q: 'Bagaimana cara menentukan titik koordinat jemaah pada peta?',
        a: 'Saat mengisi atau mengedit form jemaah, Anda dapat mengklik langsung lokasi pada peta yang tersedia atau mengetikkan nilai Latitude & Longitude.'
      },
      {
        q: 'Apa manfaat mengisi kolom Keahlian/Skill jemaah?',
        a: 'Data keahlian membantu DKM dalam memberdayakan potensi jemaah ketika masjid membutuhkan tenaga ahli untuk kegiatan atau pembangunan tertentu.'
      }
    ]
  },
  {
    id: 'inventaris',
    path: '/dashboard/inventaris',
    name: 'Aset & Inventaris',
    icon: 'inventory_2',
    role: 'Seluruh Pengurus',
    badgeColor: 'text-amber-400 bg-amber-500/10 border-amber-500/20',
    summary: 'Pendataan sarana prasarana fisik masjid, lokasi penempatan, dan pemantauan kondisi kelayakan fasilitas.',
    keyFeatures: [
      {
        title: 'Pendataan Aset Masjid',
        desc: 'Catat nama barang, jumlah unit, tanggal perolehan, dan lokasi (Ruang Utama, Gudang, Sound Room, dll).'
      },
      {
        title: 'Monitoring Kondisi Fisik',
        desc: 'Klasifikasi status kondisi: Baik, Rusak Ringan, Rusak Berat untuk mendeteksi kebutuhan perawatan (maintenance).'
      }
    ],
    faqs: [
      {
        q: 'Bagaimana memperbarui status fasilitas yang telah selesai diservis?',
        a: 'Cari barang di daftar inventaris, klik tombol Edit, lalu perbarui status kondisinya kembali menjadi "Baik".'
      }
    ]
  },
  {
    id: 'ziswaf',
    path: '/dashboard/ziswaf',
    name: 'Pengelolaan ZISWAF',
    icon: 'volunteer_activism',
    role: 'Bendahara & Ketua',
    badgeColor: 'text-teal-400 bg-teal-500/10 border-teal-500/20',
    summary: 'Pencatatan penerimaan Zakat Fitrah, Zakat Mal, Infaq, Sedekah, dan Wakaf beserta rekapitulasi amil zakat.',
    keyFeatures: [
      {
        title: 'Multi-Kategori ZISWAF',
        desc: 'Pencatatan donasi dalam bentuk uang tunai maupun beras (untuk Zakat Fitrah).'
      },
      {
        title: 'Bukti & Tanda Terima Donasi',
        desc: 'Pencatatan nama donatur/muzakki, tanggal transaksi, catatan akad, dan cetak bukti penerimaan.'
      },
      {
        title: 'Rekapitulasi Panitia Amil',
        desc: 'Ringkasan total penerimaan per jenis dana untuk laporan pertanggungjawaban amil zakat.'
      }
    ],
    faqs: [
      {
        q: 'Apakah data donatur bisa diambil dari database jemaah?',
        a: 'Ya, Anda dapat memilih nama donatur dari database jemaah atau memasukkan nama donatur eksternal secara langsung.'
      }
    ]
  },
  {
    id: 'qurban',
    path: '/dashboard/qurban',
    name: 'Manajemen Qurban',
    icon: 'cruelty_free',
    role: 'Seluruh Pengurus',
    badgeColor: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20',
    summary: 'Pengelolaan tahun qurban, pembentukan kelompok shohibul qurban sapi (maks. 7 orang) & kambing, serta pelacakan pembayaran.',
    keyFeatures: [
      {
        title: 'Validasi Syariat Kelompok Sapi (Maks. 7 Orang)',
        desc: 'Sistem secara otomatis membatasi anggota kelompok sapi tepat maksimal 7 orang sesuai ketentuan syariat fiqih.'
      },
      {
        title: 'Penetapan Kelompok Otomatis / Manual',
        desc: 'Sistem dapat mengelompokkan pequrban sapi secara otomatis ke kelompok yang belum penuh atau memilih kelompok manual.'
      },
      {
        title: 'Pelacakan Pembayaran & Tren',
        desc: 'Status pequrban (Proses, Lunas, Selesai) dan grafik pertumbuhan hewan qurban dari tahun ke tahun.'
      }
    ],
    faqs: [
      {
        q: 'Mengapa tombol tambah anggota pada kelompok sapi tidak bisa diklik?',
        a: 'Hal tersebut menandakan kelompok sapi tersebut sudah mencapai kuota maksimal 7 orang. Anda dapat membuat kelompok sapi baru untuk pequrban berikutnya.'
      },
      {
        q: 'Bagaimana cara mengganti tahun qurban yang aktif?',
        a: 'Gunakan dropdown pemilih Tahun Qurban di bagian atas untuk berpindah tahun atau membuat tahun qurban baru.'
      }
    ]
  },
  {
    id: 'jadwal',
    path: '/dashboard/jadwal',
    name: 'Jadwal Petugas Ibadah',
    icon: 'event_note',
    role: 'Sekretaris & Pengurus',
    badgeColor: 'text-indigo-400 bg-indigo-500/10 border-indigo-500/20',
    summary: 'Penjadwalan petugas Khotib Jumat, Imam Rawatib, Muadzin, dan penceramah kultum.',
    keyFeatures: [
      {
        title: 'Penugasan Petugas',
        desc: 'Jadwalkan nama petugas, peran ibadah, nomor kontak, serta judul/topik materi khutbah.'
      },
      {
        title: 'Sinkronisasi ke Portal Publik',
        desc: 'Jadwal yang diagendakan dapat dipublikasikan untuk dilihat oleh jemaah masjid secara luas.'
      }
    ],
    faqs: [
      {
        q: 'Bagaimana jika petugas berhalangan hadir?',
        a: 'Buka jadwal tanggal terkait, klik tombol Edit, lalu perbarui nama petugas pengganti dan kontak yang bisa dihubungi.'
      }
    ]
  },
  {
    id: 'berita',
    path: '/dashboard/berita',
    name: 'Berita & Artikel Kegiatan',
    icon: 'newspaper',
    role: 'Sekretaris & Pengurus',
    badgeColor: 'text-amber-400 bg-amber-500/10 border-amber-500/20',
    summary: 'Pusat publikasi konten informasi, dokumentasi kegiatan, kajian, dan pengumuman DKM ke portal publik.',
    keyFeatures: [
      {
        title: 'Penerbitan Artikel Instan',
        desc: 'Tulis berita dengan kategori (Kajian, Sosial, Pembangunan, PHBI), ringkasan, dan unggah foto banner dokumentasi.'
      },
      {
        title: 'Sinkronisasi Dua Arah',
        desc: 'Berita yang diterbitkan langsung tampil di portal publik jemaah (/berita-kegiatan dan Landing Page).'
      }
    ],
    faqs: [
      {
        q: 'Berapa ukuran foto artikel yang disarankan?',
        a: 'Gunakan gambar berorientasi lanskap (rasio 16:9) dengan resolusi minimal 800x450 piksel agar tampil optimal di ponsel maupun desktop.'
      }
    ]
  },
  {
    id: 'pesan',
    path: '/dashboard/pesan',
    name: 'Layanan Pesan Jemaah',
    icon: 'mark_email_unread',
    role: 'Seluruh Pengurus',
    badgeColor: 'text-cyan-400 bg-cyan-500/10 border-cyan-500/20',
    summary: 'Kotak masuk pesan, pertanyaan, konsultasi, dan aspirasi jemaah dari portal landing page.',
    keyFeatures: [
      {
        title: 'Status Penanganan',
        desc: 'Pantau pesan baru, tandai sebagai telah dibaca, atau selesaikan pesan yang telah ditindaklanjuti.'
      },
      {
        title: 'Direct Reply via WhatsApp',
        desc: 'Tombol balas cepat yang otomatis membuka WhatsApp dengan nomor jemaah dan template salam resmi DKM.'
      }
    ],
    faqs: [
      {
        q: 'Dari mana pesan-pesan ini berasal?',
        a: 'Pesan dikirim oleh masyarakat atau jemaah melalui formulir Kontak di bagian bawah Landing Page portal publik.'
      }
    ]
  },
  {
    id: 'analisis',
    path: '/dashboard/analisis',
    name: 'Laporan & Analisis',
    icon: 'analytics',
    role: 'Pengurus & Ketua',
    badgeColor: 'text-pink-400 bg-pink-500/10 border-pink-500/20',
    summary: 'Laporan analitik komprehensif perkembangan kas, tren donasi, demografi jemaah, dan ekspor LPJ.',
    keyFeatures: [
      {
        title: 'Analitik Pertumbuhan Keuangan',
        desc: 'Grafik komparasi pemasukan vs pengeluaran tahunan dan visualisasi komposisi kategori kas.'
      },
      {
        title: 'Distribusi Demografi Jemaah',
        desc: 'Statistik perbandingan kategori muzakki vs mustahik untuk evaluasi program kemaslahatan umat.'
      }
    ],
    faqs: [
      {
        q: 'Bagaimana cara memilih periode analisis?',
        a: 'Pilih tahun atau rentang waktu yang tersedia di bagian atas untuk memperbarui seluruh diagram analisis.'
      }
    ]
  },
  {
    id: 'settings',
    path: '/dashboard/settings',
    name: 'Pengaturan & RBAC',
    icon: 'settings',
    role: 'Ketua / Admin',
    badgeColor: 'text-rose-400 bg-rose-500/10 border-rose-500/20',
    summary: 'Konfigurasi profil masjid, rekening bank resmi donasi, kategori kas, dan manajemen hak akses pengguna (RBAC).',
    keyFeatures: [
      {
        title: 'Profil Organisasi & Titik Peta',
        desc: 'Atur nama masjid, alamat, nomor hotline DKM, logo, visi misi, dan koordinat peta utama.'
      },
      {
        title: 'Rekening Resmi Donasi',
        desc: 'Kelola daftar rekening bank dan QRIS yang tampil di portal publik jemaah.'
      },
      {
        title: 'Manajemen Pengguna (RBAC)',
        desc: 'Kelola akun pengurus dengan peran: Ketua (Super Admin), Sekretaris, Bendahara, dan Pengurus.'
      }
    ],
    faqs: [
      {
        q: 'Siapa yang berhak menambah atau mengubah peran pengurus?',
        a: 'Sesuai aturan keamanan RBAC, hanya akun dengan peran "Ketua" yang memiliki izin mengelola data pengguna lain.'
      }
    ]
  }
];

const HelpGuideModal = ({ isOpen, onClose }) => {
  const location = useLocation();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedGuideId, setSelectedGuideId] = useState('dashboard');
  const [expandedFaqIndex, setExpandedFaqIndex] = useState(null);

  // Otomatis pilih panduan sesuai halaman yang sedang dibuka user saat ini
  useEffect(() => {
    if (isOpen) {
      const currentPath = location.pathname;
      const matchingGuide = HELP_GUIDES.find(g => 
        g.path === currentPath || (g.path !== '/dashboard' && currentPath.startsWith(g.path))
      );
      if (matchingGuide) {
        setSelectedGuideId(matchingGuide.id);
      } else {
        setSelectedGuideId('dashboard');
      }
      setSearchQuery('');
      setExpandedFaqIndex(null);
    }
  }, [isOpen, location.pathname]);

  // Handle ESC key to close
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => {
      document.body.style.overflow = 'auto';
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onClose]);

  // Filtered guides based on search query
  const filteredGuides = useMemo(() => {
    if (!searchQuery.trim()) return HELP_GUIDES;
    const query = searchQuery.toLowerCase();
    return HELP_GUIDES.filter(g => 
      g.name.toLowerCase().includes(query) ||
      g.summary.toLowerCase().includes(query) ||
      g.keyFeatures.some(f => f.title.toLowerCase().includes(query) || f.desc.toLowerCase().includes(query)) ||
      g.faqs.some(faq => faq.q.toLowerCase().includes(query) || faq.a.toLowerCase().includes(query))
    );
  }, [searchQuery]);

  const activeGuide = useMemo(() => {
    return HELP_GUIDES.find(g => g.id === selectedGuideId) || HELP_GUIDES[0];
  }, [selectedGuideId]);

  // Check if current guide matches active location
  const isCurrentPage = (guidePath) => {
    if (guidePath === '/dashboard') return location.pathname === '/dashboard';
    return location.pathname.startsWith(guidePath);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 md:p-6 animate-in fade-in duration-200">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/75 backdrop-blur-md transition-opacity"
        onClick={onClose}
        aria-label="Tutup Modal"
      />

      {/* Modal Container */}
      <div 
        className="relative w-full max-w-5xl h-[92vh] max-h-[820px] bg-surface/95 dark:bg-surface/95 backdrop-blur-2xl border border-outline-variant rounded-2xl md:rounded-3xl shadow-2xl overflow-hidden flex flex-col z-10 animate-in zoom-in-95 duration-200"
        role="dialog"
        aria-modal="true"
      >
        {/* Modal Header */}
        <div className="flex items-center justify-between px-4 sm:px-6 py-4 border-b border-outline-variant bg-surface-variant/40 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-primary/15 border border-primary/30 flex items-center justify-center text-primary shadow-sm shadow-primary/20">
              <BookOpen className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base sm:text-lg font-bold text-on-surface flex items-center gap-1.5 m-0">
                  Pusat Bantuan & Panduan Fitur
                </h2>
                <span className="hidden sm:inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold bg-primary/10 text-primary border border-primary/20">
                  <Sparkles className="w-3 h-3" /> PRD v2.0
                </span>
              </div>
              <p className="text-xs text-on-surface-variant m-0">
                Panduan operasional dan FAQ fitur Sistem Informasi Manajemen Masjid Al-Falah
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-9 h-9 rounded-full flex items-center justify-center text-on-surface-variant hover:text-white hover:bg-surface-variant border border-transparent hover:border-outline-variant transition-all cursor-pointer"
            title="Tutup (Esc)"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Search Bar Baris Atas */}
        <div className="px-4 sm:px-6 py-3 border-b border-outline-variant bg-surface/80 flex items-center gap-3 shrink-0">
          <div className="relative flex-1">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-on-surface-variant pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Cari fitur, kata kunci, atau pertanyaan (misal: kas, sapi 7 orang, ekspor pdf)..."
              className="w-full pl-10 pr-4 py-2 bg-surface-variant/60 hover:bg-surface-variant border border-outline-variant rounded-xl text-xs sm:text-sm text-on-surface placeholder-on-surface-variant focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all"
            />
            {searchQuery && (
              <button 
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-on-surface-variant hover:text-on-surface px-1.5 py-0.5 rounded bg-surface border border-outline-variant"
              >
                Clear
              </button>
            )}
          </div>
        </div>

        {/* Modal Main Body (2 Columns on Desktop) */}
        <div className="flex-1 flex flex-col md:flex-row overflow-hidden">
          {/* Kolom Kiri: Daftar Modul / Halaman */}
          <div className="w-full md:w-72 lg:w-80 border-b md:border-b-0 md:border-r border-outline-variant bg-surface/50 overflow-y-auto shrink-0 max-h-48 md:max-h-full">
            <div className="p-3 space-y-1">
              <div className="px-2 py-1 text-[11px] font-bold uppercase tracking-wider text-on-surface-variant/70">
                Pilih Modul Halaman
              </div>
              {filteredGuides.length === 0 ? (
                <div className="p-4 text-center text-xs text-on-surface-variant">
                  Tidak ada modul yang cocok dengan pencarian "{searchQuery}"
                </div>
              ) : (
                filteredGuides.map((guide) => {
                  const isSelected = guide.id === activeGuide.id;
                  const isCurrent = isCurrentPage(guide.path);

                  return (
                    <button
                      key={guide.id}
                      onClick={() => {
                        setSelectedGuideId(guide.id);
                        setExpandedFaqIndex(null);
                      }}
                      className={`w-full flex items-center justify-between gap-2 px-3 py-2.5 rounded-xl text-left transition-all cursor-pointer ${
                        isSelected
                          ? 'bg-primary text-white font-semibold shadow-md shadow-primary/20'
                          : 'text-on-surface hover:bg-surface-variant/80 hover:text-white'
                      }`}
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        <span 
                          className="material-symbols-outlined text-[18px] shrink-0" 
                          style={{ fontVariationSettings: isSelected ? "'FILL' 1" : "'FILL' 0" }}
                        >
                          {guide.icon}
                        </span>
                        <span className="text-xs sm:text-sm truncate">
                          {guide.name}
                        </span>
                      </div>
                      {isCurrent && (
                        <span className={`shrink-0 text-[10px] font-bold px-1.5 py-0.5 rounded-md ${
                          isSelected 
                            ? 'bg-white/20 text-white' 
                            : 'bg-primary/20 text-primary border border-primary/30'
                        }`}>
                          Aktif
                        </span>
                      )}
                    </button>
                  );
                })
              )}
            </div>
          </div>

          {/* Kolom Kanan: Detail Panduan & FAQ Modul Terpilih */}
          <div className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-7 space-y-6">
            {/* Header Modul */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-outline-variant">
              <div className="flex items-start sm:items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-primary/10 border border-primary/25 flex items-center justify-center text-primary shrink-0 shadow-inner">
                  <span className="material-symbols-outlined text-[26px]" style={{ fontVariationSettings: "'FILL' 1" }}>
                    {activeGuide.icon}
                  </span>
                </div>
                <div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <h3 className="text-base sm:text-xl font-bold text-on-surface m-0">
                      {activeGuide.name}
                    </h3>
                    {isCurrentPage(activeGuide.path) && (
                      <span className="inline-flex items-center gap-1 text-[11px] font-semibold px-2 py-0.5 rounded-full bg-primary/15 text-primary border border-primary/25">
                        <CheckCircle2 className="w-3 h-3" /> Halaman Anda Saat Ini
                      </span>
                    )}
                  </div>
                  <p className="text-xs sm:text-sm text-on-surface-variant mt-0.5 mb-0">
                    {activeGuide.summary}
                  </p>
                </div>
              </div>

              {/* Hak Akses Badge */}
              <div className="shrink-0 flex items-center">
                <div className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold border ${activeGuide.badgeColor}`}>
                  <ShieldCheck className="w-3.5 h-3.5" />
                  <span>Akses: {activeGuide.role}</span>
                </div>
              </div>
            </div>

            {/* Fitur Utama Modul */}
            <div className="space-y-3">
              <h4 className="text-xs sm:text-sm font-bold uppercase tracking-wider text-primary flex items-center gap-1.5">
                <Sparkles className="w-4 h-4" /> Fitur & Cara Kerja Utama
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {activeGuide.keyFeatures.map((feature, idx) => (
                  <div 
                    key={idx} 
                    className="p-3.5 rounded-xl bg-surface-variant/40 border border-outline-variant hover:border-primary/40 transition-colors flex flex-col justify-start"
                  >
                    <div className="flex items-center gap-2 mb-1.5 text-on-surface font-semibold text-xs sm:text-sm">
                      <div className="w-5 h-5 rounded-full bg-primary/15 text-primary text-[10px] font-bold flex items-center justify-center shrink-0">
                        {idx + 1}
                      </div>
                      {feature.title}
                    </div>
                    <p className="text-xs text-on-surface-variant leading-relaxed m-0 pl-7">
                      {feature.desc}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            {/* FAQ / Pertanyaan Sering Diajukan */}
            <div className="space-y-3 pt-2">
              <h4 className="text-xs sm:text-sm font-bold uppercase tracking-wider text-primary flex items-center gap-1.5">
                <HelpCircle className="w-4 h-4" /> Pertanyaan Sering Diajukan (FAQ)
              </h4>
              <div className="space-y-2">
                {activeGuide.faqs.map((faq, idx) => {
                  const isExpanded = expandedFaqIndex === idx;
                  return (
                    <div 
                      key={idx}
                      className="border border-outline-variant rounded-xl overflow-hidden bg-surface-variant/20 transition-colors"
                    >
                      <button
                        onClick={() => setExpandedFaqIndex(isExpanded ? null : idx)}
                        className="w-full flex items-center justify-between gap-3 p-3.5 text-left hover:bg-surface-variant/40 transition-colors cursor-pointer"
                      >
                        <span className="text-xs sm:text-sm font-semibold text-on-surface flex items-start gap-2">
                          <span className="text-primary font-bold">Q:</span>
                          {faq.q}
                        </span>
                        {isExpanded ? (
                          <ChevronUp className="w-4 h-4 text-primary shrink-0" />
                        ) : (
                          <ChevronDown className="w-4 h-4 text-on-surface-variant shrink-0" />
                        )}
                      </button>
                      {isExpanded && (
                        <div className="px-3.5 pb-3.5 pt-1 text-xs sm:text-sm text-on-surface-variant border-t border-outline-variant/60 bg-surface-variant/30 leading-relaxed">
                          <p className="m-0 pl-5 relative">
                            <span className="absolute left-0 top-0 text-emerald-400 font-bold">A:</span>
                            {faq.a}
                          </p>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Footer Tip & Dukungan Teknis */}
            <div className="pt-4 border-t border-outline-variant/80 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 bg-surface-variant/20 p-4 rounded-xl text-xs text-on-surface-variant">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-primary text-[18px]">support_agent</span>
                <span>Butuh bantuan lebih lanjut atau kendala teknis?</span>
              </div>
              <div className="flex items-center gap-3">
                <span className="inline-flex items-center gap-1 text-primary hover:underline cursor-pointer">
                  <Phone className="w-3.5 h-3.5" /> Hotline DKM
                </span>
                <span className="text-outline-variant">•</span>
                <span className="inline-flex items-center gap-1 text-primary hover:underline cursor-pointer">
                  <Mail className="w-3.5 h-3.5" /> it@masjid-alfalah.id
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HelpGuideModal;
