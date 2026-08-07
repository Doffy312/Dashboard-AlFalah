import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  LayoutDashboard, 
  CalendarDays, 
  Users, 
  Wallet, 
  Box, 
  BarChart3, 
  ArrowRight,
  Moon,
  User,
  CheckCircle2,
  Calendar,
  X,
  Sparkles,
  Info
} from 'lucide-react';
import { useProgram } from '../context/ProgramContext';
import { useKeuangan } from '../context/KeuanganContext';
import { useJemaah } from '../context/JemaahContext';
import { useInventaris } from '../context/InventarisContext';
import { useAuth } from '../context/AuthContext';

const formatCurrency = (amount) => {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0
  }).format(amount || 0);
};

const formatDate = (dateStr) => {
  if (!dateStr) return '-';
  return new Date(dateStr).toLocaleDateString('id-ID', {
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  });
};

const LandingPage = () => {
  const navigate = useNavigate();
  const { currentUser } = useAuth();

  // Web App Real-time Data Contexts
  const programContext = useProgram();
  const keuanganContext = useKeuangan();
  const jemaahContext = useJemaah();
  const inventarisContext = useInventaris();

  const programs = programContext?.programs || [];
  const programSummaries = programContext?.summaries || { total: 0, direncanakan: 0, berjalan: 0, selesai: 0 };
  const keuanganSummaries = keuanganContext?.summaries || { saldoSaatIni: 0, totalPemasukan: 0, totalPengeluaran: 0 };
  const jemaahSummaries = jemaahContext?.summaries || { total: 0, Muzakki: 0, Mustahik: 0, Yatim: 0, Lansia: 0 };
  const inventarisSummaries = inventarisContext?.summaries || { total: 0 };

  // Filter tab state for activities
  const [activeTab, setActiveTab] = useState('semua');
  const [selectedActivity, setSelectedActivity] = useState(null);

  // Filter activities based on tab
  const filteredActivities = useMemo(() => {
    if (activeTab === 'berjalan') {
      return programs.filter(p => p.status === 'Sedang Berjalan');
    }
    if (activeTab === 'direncanakan') {
      return programs.filter(p => p.status === 'Direncanakan');
    }
    if (activeTab === 'selesai') {
      return programs.filter(p => p.status === 'Selesai');
    }
    return programs;
  }, [programs, activeTab]);

  const features = [
    {
      title: 'Dashboard Interaktif',
      description: `Ringkasan real-time dengan saldo kas ${formatCurrency(keuanganSummaries.saldoSaatIni)}, data jemaah, & program kerja.`,
      icon: <LayoutDashboard size={28} className="feature-icon-color" />,
      delay: '0.1s'
    },
    {
      title: 'Program Kerja & Kegiatan',
      description: `Manajemen ${programSummaries.total} kegiatan masjid dari perencanaan hingga evaluasi & laporan absensi.`,
      icon: <CalendarDays size={28} className="feature-icon-color" />,
      delay: '0.2s'
    },
    {
      title: 'Database Jemaah',
      description: `Pengelolaan data ${jemaahSummaries.total} jemaah (Muzakki, Mustahik, Yatim) untuk penyaluran bantuan tepat sasaran.`,
      icon: <Users size={28} className="feature-icon-color" />,
      delay: '0.3s'
    },
    {
      title: 'Arus Kas Transparan',
      description: `Pencatatan kas otomatis real-time, bukti transaksi digital, serta transparansi laporan bulanan.`,
      icon: <Wallet size={28} className="feature-icon-color" />,
      delay: '0.4s'
    },
    {
      title: 'Inventaris Aset Masjid',
      description: `Monitoring ${inventarisSummaries.total} barang/aset masjid lengkap dengan lokasi penyimpanan & kondisi barang.`,
      icon: <Box size={28} className="feature-icon-color" />,
      delay: '0.5s'
    },
    {
      title: 'Analisis & Laporan PDF/Excel',
      description: 'Grafik realisasi anggaran, tren infaq bulanan, serta fitur export laporan publik siap cetak.',
      icon: <BarChart3 size={28} className="feature-icon-color" />,
      delay: '0.6s'
    }
  ];

  const getStatusClass = (status) => {
    if (status === 'Sedang Berjalan') return 'berjalan';
    if (status === 'Selesai') return 'selesai';
    return 'direncanakan';
  };

  return (
    <div className="landing-container">
      {/* Navbar */}
      <nav className="landing-nav">
        <div className="landing-brand">
          <div className="brand-icon-landing">
            <Moon size={24} color="#fff" />
          </div>
          <span className="brand-text">Masjid Al-Falah</span>
        </div>
        <div className="flex items-center gap-3">
          <button 
            className="btn-secondary" 
            onClick={() => navigate(currentUser ? '/dashboard' : '/login')}
          >
            {currentUser ? 'Masuk Dashboard' : 'Login Pengurus'} <ArrowRight size={16} />
          </button>
        </div>
      </nav>

      {/* Hero Section */}
      <main className="hero-section">
        <div className="hero-content">
          <div className="hero-badge flex items-center gap-2">
            <Sparkles size={16} /> Data Terintegrasi Real-Time Web App 🚀
          </div>
          <h1 className="hero-title">
            Manajemen Masjid yang <span className="text-gradient">Modern</span> & Transparan
          </h1>
          <p className="hero-subtitle">
            Sentralisasi agenda kegiatan, transparansi saldo kas, dan database jemaah 
            dalam satu platform takmir masjid yang terintegrasi secara real-time.
          </p>
          <div className="hero-cta-group flex flex-wrap justify-center gap-4">
            <button className="btn-primary-large" onClick={() => navigate(currentUser ? '/dashboard' : '/login')}>
              {currentUser ? 'Buka Dashboard Takmir' : 'Mulai Gunakan Dashboard'} <ArrowRight size={20} />
            </button>
            <a href="#kegiatan" className="btn-secondary" style={{ padding: '16px 28px', borderRadius: '30px' }}>
              Lihat Agenda Kegiatan
            </a>
          </div>

          {/* Live Web App Stats Banner */}
          <div className="stats-banner-grid">
            <div className="stat-box-card">
              <div className="flex items-center justify-between">
                <span className="stat-box-label">Saldo Kas Masjid</span>
                <Wallet size={20} className="text-emerald-400" />
              </div>
              <div className="stat-box-value text-emerald-400">
                {formatCurrency(keuanganSummaries.saldoSaatIni)}
              </div>
            </div>

            <div className="stat-box-card">
              <div className="flex items-center justify-between">
                <span className="stat-box-label">Kegiatan & Program</span>
                <CalendarDays size={20} className="text-blue-400" />
              </div>
              <div className="stat-box-value">
                {programSummaries.total} <span className="text-sm font-normal text-gray-400">Program</span>
              </div>
            </div>

            <div className="stat-box-card">
              <div className="flex items-center justify-between">
                <span className="stat-box-label">Total Jemaah</span>
                <Users size={20} className="text-purple-400" />
              </div>
              <div className="stat-box-value">
                {jemaahSummaries.total} <span className="text-sm font-normal text-gray-400">Orang</span>
              </div>
            </div>

            <div className="stat-box-card">
              <div className="flex items-center justify-between">
                <span className="stat-box-label">Aset Inventaris</span>
                <Box size={20} className="text-amber-400" />
              </div>
              <div className="stat-box-value">
                {inventarisSummaries.total} <span className="text-sm font-normal text-gray-400">Item</span>
              </div>
            </div>
          </div>
        </div>

        {/* Decorative background spheres */}
        <div className="hero-decoration">
          <div className="glow-sphere sphere-1"></div>
          <div className="glow-sphere sphere-2"></div>
        </div>
      </main>

      {/* Dynamic Activities Section (Kegiatan Masjid - High Priority) */}
      <section id="kegiatan" className="activities-section">
        <div className="features-header">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-sm font-medium mb-3">
            <CalendarDays size={16} /> Agenda & Kegiatan Masjid Real-Time
          </div>
          <h2 className="section-title">Kegiatan & Program Kerja</h2>
          <p className="section-subtitle">
            Daftar kegiatan masjid terkini yang bersumber langsung dari sistem manajemen takmir.
          </p>
        </div>

        {/* Filter Tabs */}
        <div className="filter-tabs">
          <button 
            className={`tab-btn ${activeTab === 'semua' ? 'active' : ''}`}
            onClick={() => setActiveTab('semua')}
          >
            Semua Kegiatan ({programs.length})
          </button>
          <button 
            className={`tab-btn ${activeTab === 'berjalan' ? 'active' : ''}`}
            onClick={() => setActiveTab('berjalan')}
          >
            Sedang Berjalan ({programSummaries.berjalan})
          </button>
          <button 
            className={`tab-btn ${activeTab === 'direncanakan' ? 'active' : ''}`}
            onClick={() => setActiveTab('direncanakan')}
          >
            Direncanakan ({programSummaries.direncanakan})
          </button>
          <button 
            className={`tab-btn ${activeTab === 'selesai' ? 'active' : ''}`}
            onClick={() => setActiveTab('selesai')}
          >
            Selesai ({programSummaries.selesai})
          </button>
        </div>

        {/* Dynamic Activity Cards Grid */}
        {filteredActivities.length > 0 ? (
          <div className="activity-cards-grid">
            {filteredActivities.map((act) => (
              <div 
                key={act.id} 
                className="activity-card"
                onClick={() => setSelectedActivity(act)}
              >
                <div>
                  <div className="flex justify-between items-center mb-4">
                    <span className={`status-tag ${getStatusClass(act.status)}`}>
                      {act.status}
                    </span>
                    <span className="text-xs text-gray-400 font-mono">{act.id}</span>
                  </div>

                  <h3 className="text-xl font-bold text-white mb-3 line-clamp-2">
                    {act.name}
                  </h3>

                  <p className="text-sm text-gray-300 mb-5 line-clamp-3 leading-relaxed">
                    {act.description || 'Tidak ada deskripsi rinci untuk kegiatan ini.'}
                  </p>
                </div>

                <div className="border-t border-white/10 pt-4 mt-2 space-y-2">
                  <div className="flex items-center gap-2 text-xs text-gray-300">
                    <Calendar size={14} className="text-emerald-400" />
                    <span>Tanggal: <strong>{formatDate(act.date)}</strong></span>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-gray-300">
                    <User size={14} className="text-blue-400" />
                    <span>PIC: <strong>{act.pic}</strong></span>
                  </div>
                  <div className="flex justify-between items-center pt-2">
                    <span className="text-xs text-gray-400">Estimasi Anggaran</span>
                    <span className="text-sm font-bold text-emerald-400">{formatCurrency(act.budget)}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-16 bg-white/5 rounded-2xl border border-white/10 max-w-2xl mx-auto">
            <Info size={40} className="mx-auto text-gray-400 mb-3" />
            <p className="text-gray-300 text-lg font-medium">Tidak ada kegiatan dalam kategori ini.</p>
            <p className="text-gray-500 text-sm mt-1">Pilih kategori lain untuk melihat agenda kegiatan lainnya.</p>
          </div>
        )}
      </section>

      {/* Financial & Community Transparency Section */}
      <section className="features-section" style={{ background: 'rgba(11, 19, 26, 0.95)' }}>
        <div className="features-header">
          <h2 className="section-title">Transparansi & Akuntabilitas</h2>
          <p className="section-subtitle">Laporan publik terkini dari kas dan jemaah Masjid Al-Falah.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-5xl mx-auto">
          {/* Ringkasan Keuangan Card */}
          <div className="glass-card p-8 rounded-2xl border border-white/10 text-left">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-3 rounded-xl bg-emerald-500/10 text-emerald-400">
                <Wallet size={28} />
              </div>
              <div>
                <h3 className="text-xl font-bold text-white">Ringkasan Kas Real-Time</h3>
                <p className="text-xs text-gray-400">Integrasi data modul keuangan</p>
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex justify-between items-center p-3.5 bg-white/5 rounded-xl border border-white/5">
                <span className="text-sm text-gray-300">Total Saldo Kas Saat Ini</span>
                <span className="text-lg font-bold text-emerald-400">{formatCurrency(keuanganSummaries.saldoSaatIni)}</span>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="p-3.5 bg-emerald-500/10 rounded-xl border border-emerald-500/20">
                  <div className="text-xs text-emerald-300 font-medium">Total Pemasukan</div>
                  <div className="text-base font-bold text-emerald-400 mt-1">{formatCurrency(keuanganSummaries.totalPemasukan)}</div>
                </div>
                <div className="p-3.5 bg-rose-500/10 rounded-xl border border-rose-500/20">
                  <div className="text-xs text-rose-300 font-medium">Total Pengeluaran</div>
                  <div className="text-base font-bold text-rose-400 mt-1">{formatCurrency(keuanganSummaries.totalPengeluaran)}</div>
                </div>
              </div>
            </div>
          </div>

          {/* Ringkasan Jemaah Card */}
          <div className="glass-card p-8 rounded-2xl border border-white/10 text-left">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-3 rounded-xl bg-blue-500/10 text-blue-400">
                <Users size={28} />
              </div>
              <div>
                <h3 className="text-xl font-bold text-white">Komunitas & Data Jemaah</h3>
                <p className="text-xs text-gray-400">Integrasi data modul jemaah</p>
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex justify-between items-center p-3.5 bg-white/5 rounded-xl border border-white/5">
                <span className="text-sm text-gray-300">Total Jemaah Terdaftar</span>
                <span className="text-lg font-bold text-blue-400">{jemaahSummaries.total} Orang</span>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="p-3.5 bg-white/5 rounded-xl border border-white/10">
                  <div className="text-xs text-gray-400">Kategori Muzakki</div>
                  <div className="text-base font-bold text-white mt-1">{jemaahSummaries.Muzakki || 0} Orang</div>
                </div>
                <div className="p-3.5 bg-white/5 rounded-xl border border-white/10">
                  <div className="text-xs text-gray-400">Kategori Mustahik</div>
                  <div className="text-base font-bold text-white mt-1">{jemaahSummaries.Mustahik || 0} Orang</div>
                </div>
                <div className="p-3.5 bg-white/5 rounded-xl border border-white/10">
                  <div className="text-xs text-gray-400">Anak Yatim</div>
                  <div className="text-base font-bold text-amber-400 mt-1">{jemaahSummaries.Yatim || 0} Anak</div>
                </div>
                <div className="p-3.5 bg-white/5 rounded-xl border border-white/10">
                  <div className="text-xs text-gray-400">Lansia</div>
                  <div className="text-base font-bold text-purple-400 mt-1">{jemaahSummaries.Lansia || 0} Orang</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Overview */}
      <section className="features-section">
        <div className="features-header">
          <h2 className="section-title">Modul Fitur Utama</h2>
          <p className="section-subtitle">Layanan manajemen lengkap bagi seluruh takmir dan pengurus masjid.</p>
        </div>
        
        <div className="features-grid">
          {features.map((feature, index) => (
            <div 
              key={index} 
              className="glass-card feature-card"
              style={{ animationDelay: feature.delay }}
            >
              <div className="feature-icon-wrapper">
                {feature.icon}
              </div>
              <h3 className="feature-title">{feature.title}</h3>
              <p className="feature-desc">{feature.description}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Footer */}
      <footer className="landing-footer">
        <div className="footer-content">
          <div className="landing-brand footer-brand">
            <Moon size={20} color="#10b981" />
            <span style={{ fontWeight: 600, color: '#fff' }}>Masjid Al-Falah</span>
          </div>
          <p className="footer-text">© 2026 Dashboard Takmir Masjid Al-Falah. All rights reserved.</p>
        </div>
      </footer>

      {/* Activity Detail Modal */}
      {selectedActivity && (
        <div className="landing-modal-overlay" onClick={() => setSelectedActivity(null)}>
          <div className="landing-modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="flex justify-between items-start mb-6">
              <div>
                <span className={`status-tag ${getStatusClass(selectedActivity.status)} mb-2`}>
                  {selectedActivity.status}
                </span>
                <h2 className="text-2xl font-bold text-white mt-1">{selectedActivity.name}</h2>
              </div>
              <button 
                onClick={() => setSelectedActivity(null)}
                className="p-2 rounded-full hover:bg-white/10 text-gray-400 hover:text-white transition-colors"
              >
                <X size={20} />
              </button>
            </div>

            <div className="space-y-4 text-left">
              <div className="p-4 bg-white/5 rounded-xl border border-white/10 space-y-3">
                <div className="flex justify-between items-center text-sm">
                  <span className="text-gray-400">Kode Program:</span>
                  <span className="font-mono text-emerald-400 font-bold">{selectedActivity.id}</span>
                </div>
                <div className="flex justify-between items-center text-sm">
                  <span className="text-gray-400">Penanggung Jawab (PIC):</span>
                  <span className="text-white font-medium">{selectedActivity.pic}</span>
                </div>
                <div className="flex justify-between items-center text-sm">
                  <span className="text-gray-400">Tanggal Pelaksanaan:</span>
                  <span className="text-white font-medium">{formatDate(selectedActivity.date)}</span>
                </div>
                <div className="flex justify-between items-center text-sm">
                  <span className="text-gray-400">Estimasi Anggaran:</span>
                  <span className="text-emerald-400 font-bold">{formatCurrency(selectedActivity.budget)}</span>
                </div>
              </div>

              <div>
                <h4 className="text-sm font-semibold text-gray-300 mb-2">Deskripsi Kegiatan</h4>
                <p className="text-sm text-gray-400 leading-relaxed bg-white/5 p-4 rounded-xl border border-white/5">
                  {selectedActivity.description || 'Belum ada deskripsi tambahan.'}
                </p>
              </div>

              {selectedActivity.evaluation && (
                <div>
                  <h4 className="text-sm font-semibold text-emerald-400 mb-2 flex items-center gap-1.5">
                    <CheckCircle2 size={16} /> Catatan Evaluasi & Hasil
                  </h4>
                  <p className="text-sm text-gray-300 leading-relaxed bg-emerald-500/10 p-4 rounded-xl border border-emerald-500/20">
                    {selectedActivity.evaluation}
                  </p>
                </div>
              )}
            </div>

            <div className="mt-8 pt-4 border-t border-white/10 flex justify-end gap-3">
              <button 
                onClick={() => setSelectedActivity(null)} 
                className="btn-secondary"
                style={{ padding: '8px 20px', fontSize: '0.9rem' }}
              >
                Tutup
              </button>
              <button 
                onClick={() => {
                  setSelectedActivity(null);
                  navigate(currentUser ? '/dashboard/program-kerja' : '/login');
                }}
                className="btn-primary-large"
                style={{ padding: '8px 20px', fontSize: '0.9rem' }}
              >
                {currentUser ? 'Kelola di Dashboard' : 'Login untuk Mengelola'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default LandingPage;
