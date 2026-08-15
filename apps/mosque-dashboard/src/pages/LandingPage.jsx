import { useState, useEffect } from 'react';
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
  X,
  MapPin,
  Phone,
  Check,
  Share2,
  CheckCircle2,
  HeartHandshake,
  Copy,
  Sparkles,
  QrCode
} from 'lucide-react';

import { useSettings } from '../contexts/SettingsContext';
import { useDashboardSummary } from '../hooks/useDashboard';
import { useTransactionSummary } from '../hooks/useTransactions';
import { useJemaahSummary } from '../hooks/useJemaah';
import { useArticles } from '../hooks/useArticles';
import { formatCurrency } from '../lib/utils';
import { authClient } from '../lib/auth-client';
import { MOCK_NEWS_ARTICLES } from '../lib/mockArticles';
import LandingDistributionMap from '../components/landing/LandingDistributionMap';
import QRScannerModal from '../components/landing/QRScannerModal';
import JemaahRegistrationModal from '../components/landing/JemaahRegistrationModal';
import QRInfaqModal from '../components/landing/QRInfaqModal';

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

  // Settings & Context Data
  const { profile, finance } = useSettings();
  const { data: session } = authClient.useSession();
  const currentUser = session?.user;

  // Efficient non-blocking API fetching for public landing page
  const queryOptions = { staleTime: 60000, gcTime: 300000, refetchOnWindowFocus: false };
  
  const { data: summary } = useDashboardSummary(queryOptions);
  const { data: kasSummary } = useTransactionSummary(queryOptions);
  const { data: jemaahSummary } = useJemaahSummary(queryOptions);
  const { data: articlesFromApi } = useArticles(queryOptions);
  const articlesList = (articlesFromApi && articlesFromApi.length > 0) ? articlesFromApi : MOCK_NEWS_ARTICLES;

  const orgName = profile?.orgName || 'Masjid Al-Falah';
  const bankInfo = finance?.bankInfo || {
    bankName: 'BSI (Bank Syariah Indonesia)',
    accountNumber: '7123456789',
    accountHolder: profile?.orgName || 'Masjid Al-Falah'
  };

  // State Modals & Toast Notifications
  const [selectedNews, setSelectedNews] = useState(null);
  const [activeDonasiType, setActiveDonasiType] = useState(null);
  const [toastMessage, setToastMessage] = useState('');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // QR & Registration Modal States
  const [isQRScannerOpen, setIsQRScannerOpen] = useState(false);
  const [isRegistrationOpen, setIsRegistrationOpen] = useState(false);

  // Lock body scroll when a modal is open & handle ESC key
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        setSelectedNews(null);
        setActiveDonasiType(null);
        setIsQRScannerOpen(false);
        setIsRegistrationOpen(false);
      }
    };

    if (selectedNews || activeDonasiType || isQRScannerOpen || isRegistrationOpen) {
      document.body.style.overflow = 'hidden';
      window.addEventListener('keydown', handleKeyDown);
    } else {
      document.body.style.overflow = '';
    }

    return () => {
      document.body.style.overflow = '';
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [selectedNews, activeDonasiType, isQRScannerOpen, isRegistrationOpen]);

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(''), 3500);
  };

  const handleCopyRekening = () => {
    navigator.clipboard.writeText(bankInfo.accountNumber);
    showToast('Nomor rekening berhasil disalin!');
  };

  // 1. Keuangan Real-Time Computation
  const rawKas = kasSummary?.data || kasSummary || summary?.finance || summary?.keuangan || {};
  const totalPemasukan = Number(rawKas?.totalPemasukan || 0);
  const totalPengeluaran = Number(rawKas?.totalPengeluaran || 0);
  const saldoKas = Number(rawKas?.saldoSaatIni !== undefined && rawKas?.saldoSaatIni !== null ? rawKas.saldoSaatIni : (totalPemasukan - totalPengeluaran));

  // 2. Jemaah Real-Time Computation
  const rawJemaah = jemaahSummary?.data || jemaahSummary || summary?.jemaah || {};
  const totalJemaah = Number(rawJemaah?.total || 0);
  const muzakkiCount = Number(rawJemaah?.Muzakki || rawJemaah?.muzakki || 0);
  const mustahikCount = Number(rawJemaah?.Mustahik || rawJemaah?.mustahik || 0);
  const yatimCount = Number(rawJemaah?.Yatim || rawJemaah?.yatim || 0);
  const lansiaCount = Number(rawJemaah?.Lansia || rawJemaah?.lansia || 0);

  // Modul Fitur Sistem
  const features = [
    {
      title: 'Dashboard Interaktif',
      description: 'Ringkasan informasi terkini, saldo kas, total jemaah, dan program kerja dalam widget card dinamis real-time.',
      icon: <LayoutDashboard size={28} className="text-amber-400" />
    },
    {
      title: 'Program Kerja & Kegiatan',
      description: 'Manajemen agenda kegiatan dari perencanaan hingga evaluasi. Terintegrasi langsung dengan arus kas otomatis.',
      icon: <CalendarDays size={28} className="text-amber-400" />
    },
    {
      title: 'Database Jemaah',
      description: 'Pengelolaan profil jemaah dengan pengelompokan Muzakki, Mustahik, Yatim, dan Lansia untuk transparansi sosial.',
      icon: <Users size={28} className="text-amber-400" />
    },
    {
      title: 'Arus Kas Transparan',
      description: 'Pencatatan pemasukan dan pengeluaran harian yang dapat dipantau langsung oleh jemaah dan pengurus.',
      icon: <Wallet size={28} className="text-amber-400" />
    },
    {
      title: 'Inventaris Masjid',
      description: 'Pencatatan aset barang beserta lokasi penyimpanan, kondisi barang, dan riwayat pemeliharaan.',
      icon: <Box size={28} className="text-amber-400" />
    },
    {
      title: 'Analisis & Laporan',
      description: 'Visualisasi grafik statistik keuangan, alokasi anggaran, dan laporan periodik yang siap diunduh.',
      icon: <BarChart3 size={28} className="text-amber-400" />
    }
  ];

  const handleAnchorClick = (e, href) => {
    e.preventDefault();
    setIsMobileMenuOpen(false);
    if (!href || !href.startsWith('#')) return;
    try {
      const target = document.querySelector(href);
      if (target) {
        target.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    } catch {
      // Fallback
    }
  };

  return (
    <div className="landing-container min-h-screen bg-[#0b131a] text-white selection:bg-emerald-500/30 selection:text-emerald-200">
      
      {/* ===== NAVBAR ===== */}
      <nav className="landing-nav fixed top-0 left-0 right-0 z-50 bg-[#0b131a]/85 backdrop-blur-md border-b border-white/10 px-6 lg:px-12 py-4 flex justify-between items-center">
        <div className="landing-brand flex items-center gap-3">
          <div className="brand-icon-landing w-10 h-10 rounded-xl bg-amber-500/20 border border-amber-500/30 flex items-center justify-center overflow-hidden shrink-0">
            {profile?.logo ? (
              <img src={profile.logo} alt={orgName} className="w-full h-full object-cover" />
            ) : (
              <Moon size={22} className="text-amber-400" />
            )}
          </div>
          <span className="brand-text text-xl font-bold text-white tracking-tight">{orgName}</span>
        </div>

        {/* Desktop Nav Links */}
        <div className="hidden md:flex items-center gap-8 text-sm font-medium text-slate-300">
          <a href="#beranda" onClick={(e) => handleAnchorClick(e, '#beranda')} className="hover:text-amber-400 transition-colors">Beranda</a>
          <a href="#profil" onClick={(e) => handleAnchorClick(e, '#profil')} className="hover:text-amber-400 transition-colors">Profil</a>
          <a href="#transparansi" onClick={(e) => handleAnchorClick(e, '#transparansi')} className="hover:text-amber-400 transition-colors">Transparansi</a>
          <a href="#berita" onClick={(e) => handleAnchorClick(e, '#berita')} className="hover:text-amber-400 transition-colors">Berita &amp; Kegiatan</a>
          <a href="#fitur" onClick={(e) => handleAnchorClick(e, '#fitur')} className="hover:text-amber-400 transition-colors">Fitur</a>
        </div>

        <div className="flex items-center gap-3">
          <button 
            onClick={() => setIsQRScannerOpen(true)}
            className="hidden sm:flex px-3.5 py-2 rounded-lg bg-amber-500/10 hover:bg-amber-500/20 text-amber-400 border border-amber-500/30 text-xs font-semibold uppercase tracking-wider transition-all items-center gap-1.5"
          >
            <QrCode size={16} /> Scan QR Jemaah
          </button>

          <button 
            onClick={() => setActiveDonasiType('Infaq')}
            className="hidden sm:flex px-4 py-2 rounded-lg bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-xs font-semibold uppercase tracking-wider transition-all items-center gap-1.5"
          >
            <HeartHandshake size={16} /> Donasi Infaq
          </button>
          
          <button 
            onClick={() => navigate(currentUser ? '/dashboard' : '/login')}
            className="btn-primary-small flex items-center gap-2 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold px-4 py-2 rounded-lg text-sm transition-all"
          >
            {currentUser ? 'Masuk Dasbor' : 'Login Portal'} <ArrowRight size={16} />
          </button>

          {/* Mobile Hamburger Toggle */}
          <button 
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="md:hidden p-2 rounded-lg bg-white/5 border border-white/10 text-slate-300 hover:text-white transition-colors"
            aria-label="Toggle Mobile Navigation"
          >
            <span className="material-symbols-outlined text-xl">
              {isMobileMenuOpen ? 'close' : 'menu'}
            </span>
          </button>
        </div>
      </nav>

      {/* ===== MOBILE MENU DRAWER ===== */}
      {isMobileMenuOpen && (
        <div className="fixed inset-x-0 top-[72px] z-40 bg-[#0b131a]/95 backdrop-blur-xl border-b border-white/10 p-6 md:hidden animate-in fade-in slide-in-from-top-2 duration-200">
          <div className="flex flex-col gap-4 text-sm font-medium text-slate-200">
            <a href="#beranda" onClick={(e) => handleAnchorClick(e, '#beranda')} className="py-2 border-b border-white/5 hover:text-amber-400 transition-colors">Beranda</a>
            <a href="#profil" onClick={(e) => handleAnchorClick(e, '#profil')} className="py-2 border-b border-white/5 hover:text-amber-400 transition-colors">Profil</a>
            <a href="#transparansi" onClick={(e) => handleAnchorClick(e, '#transparansi')} className="py-2 border-b border-white/5 hover:text-amber-400 transition-colors">Transparansi Keuangan</a>
            <a href="#berita" onClick={(e) => handleAnchorClick(e, '#berita')} className="py-2 border-b border-white/5 hover:text-amber-400 transition-colors">Berita &amp; Kegiatan</a>
            <a href="#fitur" onClick={(e) => handleAnchorClick(e, '#fitur')} className="py-2 hover:text-amber-400 transition-colors">Fitur Utama</a>
            <button 
              onClick={() => { setIsMobileMenuOpen(false); setIsQRScannerOpen(true); }}
              className="mt-2 w-full py-2.5 rounded-lg bg-amber-500/15 text-amber-300 border border-amber-500/30 text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-2"
            >
              <QrCode size={16} /> Scan QR / Daftar Jemaah
            </button>
            <button 
              onClick={() => { setIsMobileMenuOpen(false); setActiveDonasiType('Infaq'); }}
              className="w-full py-2.5 rounded-lg bg-emerald-500/15 text-emerald-300 border border-emerald-500/30 text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-2"
            >
              <HeartHandshake size={16} /> Donasi Infaq
            </button>
          </div>
        </div>
      )}

      {/* ===== HERO SECTION ===== */}
      <main id="beranda" className="hero-section scroll-mt-24 pt-32 pb-16 px-6 lg:px-12 max-w-7xl mx-auto text-center relative overflow-hidden">
        <div className="hero-content relative z-10 max-w-4xl mx-auto">
          <div className="hero-badge inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-400 text-xs font-semibold uppercase tracking-widest mb-6">
            <Sparkles size={14} /> Portal Informasi &amp; Transparansi Masjid
          </div>
          
          <h1 className="hero-title text-4xl sm:text-5xl lg:text-6xl font-extrabold text-white leading-tight mb-6">
            Manajemen Masjid yang <span className="text-emerald-400">Modern</span>, Transparan &amp; Akuntabel
          </h1>

          <p className="hero-subtitle text-base sm:text-lg text-slate-300 leading-relaxed max-w-2xl mx-auto mb-8">
            Sentralisasi data keuangan, program kerja, dan keanggotaan jemaah {orgName} yang dapat diakses secara terbuka demi menjaga amanah umat.
          </p>

          <div className="hero-cta-group flex flex-wrap justify-center gap-4">
            <button 
              onClick={() => setIsQRScannerOpen(true)}
              className="btn-primary-large bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 font-extrabold px-8 py-3.5 rounded-xl text-base transition-all flex items-center gap-2 shadow-lg shadow-emerald-500/25"
            >
              <QrCode size={20} /> Scan QR / Daftar Jemaah
            </button>
            <button 
              onClick={() => navigate(currentUser ? '/dashboard' : '/login')}
              className="btn-primary-large bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold px-8 py-3.5 rounded-xl text-base transition-all flex items-center gap-2 shadow-lg shadow-amber-500/20"
            >
              {currentUser ? 'Ke Dashboard Pengurus' : 'Masuk Portal Pengurus'} <ArrowRight size={20} />
            </button>
            <a 
              href="#transparansi" 
              onClick={(e) => handleAnchorClick(e, '#transparansi')}
              className="btn-secondary-large bg-white/5 hover:bg-white/10 text-white border border-white/10 px-8 py-3.5 rounded-xl text-base font-semibold transition-all flex items-center gap-2"
            >
              Lihat Kas Real-Time
            </a>
          </div>
        </div>

        {/* Glow Sphere Decorations */}
        <div className="hero-decoration">
          <div className="glow-sphere sphere-1 absolute -top-10 left-1/4 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none"></div>
          <div className="glow-sphere sphere-2 absolute top-20 right-1/4 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl pointer-events-none"></div>
        </div>
      </main>

      {/* ===== PROFIL MASJID ===== */}
      <section id="profil" className="scroll-mt-24 py-16 px-6 lg:px-12 max-w-7xl mx-auto">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-white mb-3">Profil {orgName}</h2>
          <p className="text-slate-400 text-sm max-w-xl mx-auto">{profile?.description || 'Pusat ibadah dan pembinaan kegiatan keagamaan jemaah.'}</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="p-8 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-md">
            <div className="w-12 h-12 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center mb-6">
              <Sparkles size={24} />
            </div>
            <h3 className="text-xl font-bold text-white mb-3">Visi Masjid</h3>
            <p className="text-slate-300 text-sm leading-relaxed whitespace-pre-line">
              {profile?.vision || "Menjadi pusat peradaban dan ibadah yang memakmurkan jemaah, berlandaskan al-Qur'an dan as-Sunnah serta didukung tata kelola yang profesional dan transparan."}
            </p>
          </div>

          <div className="p-8 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-md">
            <div className="w-12 h-12 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center mb-6">
              <CheckCircle2 size={24} />
            </div>
            <h3 className="text-xl font-bold text-white mb-3">Misi Pelayanan</h3>
            <ul className="space-y-2.5 text-slate-300 text-sm">
              {(Array.isArray(profile?.mission) && profile.mission.length > 0
                ? profile.mission
                : [
                    "Menyelenggarakan ibadah dan kajian keagamaan yang berkualitas.",
                    "Mengelola dana infaq, sedekah, dan zakat secara transparan.",
                    "Mengembangkan pemberdayaan jemaah, anak yatim, dan dhuafa."
                  ]
              ).map((misiItem, idx) => (
                <li key={idx} className="flex items-start gap-2.5">
                  <Check size={16} className="text-emerald-400 mt-0.5 shrink-0" />
                  <span className="leading-snug">{misiItem}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      {/* ===== TRANSPARANSI KEUANGAN & JEMAAH ===== */}
      <section id="transparansi" className="scroll-mt-24 py-16 px-6 lg:px-12 max-w-7xl mx-auto">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-white mb-3">Laporan Transparansi Real-Time</h2>
          <p className="text-slate-400 text-sm max-w-xl mx-auto">Data keuangan dan statistik jemaah yang ter-update secara otomatis dari database sistem.</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Ringkasan Kas Card */}
          <div className="p-8 rounded-2xl border border-emerald-500/20 bg-white/5 text-left backdrop-blur-md flex flex-col justify-between">
            <div>
              <div className="flex items-center gap-3 mb-6">
                <div className="p-3 rounded-xl bg-emerald-500/15 text-emerald-400">
                  <Wallet size={28} />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-white">Kas &amp; Keuangan Masjid</h3>
                  <p className="text-xs text-slate-400">Terbuka untuk seluruh jemaah</p>
                </div>
              </div>

              <div className="space-y-4">
                <div className="p-4 sm:p-5 bg-emerald-500/10 rounded-xl border border-emerald-500/20 flex flex-col sm:flex-row sm:items-center justify-between gap-2 sm:gap-4">
                  <span className="text-xs sm:text-sm font-semibold text-emerald-200/90 uppercase tracking-wider">Total Saldo Kas Terkini</span>
                  <span className="text-xl sm:text-2xl lg:text-3xl font-extrabold text-emerald-400 tracking-tight">{formatCurrency(saldoKas)}</span>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="p-3.5 bg-emerald-500/10 rounded-xl border border-emerald-500/20">
                    <div className="text-xs text-emerald-300 font-medium">Total Pemasukan</div>
                    <div className="text-base font-bold text-emerald-400 mt-1">{formatCurrency(totalPemasukan)}</div>
                  </div>
                  <div className="p-3.5 bg-rose-500/10 rounded-xl border border-rose-500/20">
                    <div className="text-xs text-rose-300 font-medium">Total Pengeluaran</div>
                    <div className="text-base font-bold text-rose-400 mt-1">{formatCurrency(totalPengeluaran)}</div>
                  </div>
                </div>
              </div>
            </div>

            <button 
              onClick={() => setActiveDonasiType('Infaq')}
              className="mt-6 w-full py-3.5 px-6 rounded-xl bg-gradient-to-r from-emerald-400 via-emerald-500 to-teal-400 hover:from-emerald-300 hover:via-emerald-400 hover:to-teal-300 text-slate-950 font-extrabold text-base tracking-wide flex items-center justify-center gap-2.5 shadow-lg shadow-emerald-500/25 hover:shadow-emerald-500/40 hover:scale-[1.01] active:scale-[0.99] transition-all border border-emerald-300/40"
            >
              <HeartHandshake size={22} className="text-slate-950" />
              <span>Infaq Sekarang</span>
              <ArrowRight size={18} className="text-slate-950" />
            </button>
          </div>

          {/* Ringkasan Jemaah Card */}
          <div className="p-8 rounded-2xl border border-amber-500/20 bg-white/5 text-left backdrop-blur-md">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-3 rounded-xl bg-emerald-500/15 text-emerald-400">
                <Users size={28} />
              </div>
              <div>
                <h3 className="text-xl font-bold text-white">Komunitas &amp; Data Jemaah</h3>
                <p className="text-xs text-slate-400">Integrasi data terdaftar modul jemaah web app</p>
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex justify-between items-center p-4 bg-white/5 rounded-xl border border-white/5">
                <span className="text-sm text-slate-300">Total Jemaah Terdaftar</span>
                <span className="text-xl font-bold text-emerald-400">{totalJemaah} Orang</span>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="p-3.5 bg-white/5 rounded-xl border border-white/10">
                  <div className="text-xs text-slate-400">Muzakki (Donatur)</div>
                  <div className="text-base font-bold text-white mt-1">{muzakkiCount} Orang</div>
                </div>
                <div className="p-3.5 bg-white/5 rounded-xl border border-white/10">
                  <div className="text-xs text-slate-400">Mustahik</div>
                  <div className="text-base font-bold text-white mt-1">{mustahikCount} Orang</div>
                </div>
                <div className="p-3.5 bg-white/5 rounded-xl border border-white/10">
                  <div className="text-xs text-slate-400">Anak Yatim</div>
                  <div className="text-base font-bold text-amber-300 mt-1">{yatimCount} Anak</div>
                </div>
                <div className="p-3.5 bg-white/5 rounded-xl border border-white/10">
                  <div className="text-xs text-slate-400">Lansia</div>
                  <div className="text-base font-bold text-emerald-300 mt-1">{lansiaCount} Orang</div>
                </div>
              </div>

              <button 
                onClick={() => setIsQRScannerOpen(true)}
                className="w-full py-3.5 px-6 rounded-xl bg-gradient-to-r from-amber-500 to-amber-400 hover:from-amber-400 hover:to-amber-300 text-slate-950 font-extrabold text-sm flex items-center justify-center gap-2 shadow-lg shadow-amber-500/20 hover:scale-[1.01] active:scale-[0.99] transition-all"
              >
                <QrCode size={20} className="text-slate-950" />
                <span>Scan QR / Daftar Jemaah Masjid</span>
                <ArrowRight size={18} className="text-slate-950" />
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* ===== PETA SEBARAN JEMAAH ===== */}
      <LandingDistributionMap />

      {/* ===== BERITA & KEGIATAN ===== */}
      <section id="berita" className="scroll-mt-24 py-16 px-6 lg:px-12 max-w-7xl mx-auto">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-white mb-3">Berita &amp; Dokumentasi Kegiatan</h2>
          <p className="text-slate-400 text-sm max-w-xl mx-auto">Laporan pelaksanaan agenda dan informasi edukasi bagi jemaah.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {articlesList.map((article) => (
            <div 
              key={article.id}
              onClick={() => setSelectedNews(article)}
              className="group bg-white/5 border border-white/10 hover:border-amber-500/40 rounded-2xl overflow-hidden cursor-pointer transition-all hover:-translate-y-1 flex flex-col justify-between"
            >
              <div>
                <div className="h-44 overflow-hidden relative bg-slate-900">
                  <img 
                    src={article.image} 
                    alt={article.title} 
                    width="400"
                    height="250"
                    loading="lazy"
                    decoding="async"
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    onError={(e) => {
                      e.target.onerror = null;
                      e.target.src = '/images/berita_kajian_akbar.webp';
                    }}
                  />
                  <span className="absolute top-3 left-3 px-2.5 py-1 bg-slate-950/80 backdrop-blur-md text-amber-300 text-[10px] font-bold rounded-md border border-amber-500/20">
                    {article.category}
                  </span>
                </div>

                <div className="p-5">
                  <div className="text-xs text-slate-400 mb-2">
                    <span>{formatDate(article.date)}</span>
                  </div>
                  <h3 className="font-bold text-white text-sm line-clamp-2 mb-2 group-hover:text-amber-400 transition-colors">
                    {article.title}
                  </h3>
                  <p className="text-slate-400 text-xs line-clamp-3 leading-relaxed">
                    {article.summary}
                  </p>
                </div>
              </div>

              <div className="px-5 pb-5 pt-2">
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    setSelectedNews(article);
                  }}
                  className="text-xs font-bold text-emerald-400 hover:text-emerald-300 group-hover:underline flex items-center gap-1.5 transition-colors"
                >
                  <span>Baca Selengkapnya</span>
                  <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ===== MODUL FITUR SEKSI ===== */}
      <section id="fitur" className="scroll-mt-24 py-16 px-6 lg:px-12 max-w-7xl mx-auto">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-white mb-3">Modul Fitur Utama Sistem</h2>
          <p className="section-subtitle text-slate-400 text-sm max-w-xl mx-auto">Solusi manajemen lengkap bagi seluruh takmir dan pengurus masjid.</p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feature, index) => (
            <div key={index} className="p-6 rounded-2xl bg-white/5 border border-white/10 hover:border-amber-500/30 transition-all">
              <div className="w-12 h-12 rounded-xl bg-amber-500/10 flex items-center justify-center mb-4">
                {feature.icon}
              </div>
              <h3 className="text-lg font-bold text-white mb-2">{feature.title}</h3>
              <p className="text-xs text-slate-300 leading-relaxed">{feature.description}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ===== FOOTER ===== */}
      <footer className="border-t border-white/10 py-12 px-6 lg:px-12 bg-slate-950/60">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-amber-500/20 border border-amber-500/30 flex items-center justify-center overflow-hidden shrink-0">
              {profile?.logo ? (
                <img src={profile.logo} alt={orgName} className="w-full h-full object-cover" />
              ) : (
                <Moon size={22} className="text-amber-400" />
              )}
            </div>
            <span className="font-bold text-lg text-white">{orgName}</span>
          </div>

          <div className="flex flex-wrap justify-center gap-6 text-xs text-slate-400">
            <span className="flex items-center gap-1.5"><MapPin size={14} className="text-amber-400" /> {profile?.address || 'Jl. Raya Pendidikan No. 123, Bandung'}</span>
            <span className="flex items-center gap-1.5"><Phone size={14} className="text-amber-400" /> {profile?.phone || '081234567890'}</span>
          </div>

          <p className="text-xs text-slate-400">© 2026 Dashboard Takmir {orgName}. All rights reserved.</p>
        </div>
      </footer>

      {/* ===== TOAST NOTIFICATION ===== */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-emerald-500 text-slate-950 px-5 py-3 rounded-xl font-bold text-sm shadow-2xl flex items-center gap-2 animate-bounce">
          <Check size={18} /> {toastMessage}
        </div>
      )}

      {/* ===== NEWS ARTICLE DETAIL MODAL ===== */}
      {selectedNews && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-sm p-4 sm:p-6 overflow-y-auto" 
          onClick={() => setSelectedNews(null)}
        >
          <div 
            className="bg-[#0b131a] border border-white/15 p-6 sm:p-8 rounded-3xl max-w-2xl w-full relative space-y-6 shadow-2xl my-auto" 
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-between items-start pt-1 pb-3 border-b border-white/10">
              <div className="pr-4">
                <span className="px-3 py-1 bg-amber-500/20 text-amber-300 border border-amber-500/30 font-bold text-xs rounded-full">
                  {selectedNews.category}
                </span>
                <h2 className="text-xl sm:text-2xl font-bold text-white mt-3 leading-snug">{selectedNews.title}</h2>
              </div>
              <button 
                onClick={() => setSelectedNews(null)}
                className="p-2 rounded-full bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white transition-colors shrink-0"
                aria-label="Tutup Detail Berita"
              >
                <X size={20} />
              </button>
            </div>

            <div className="flex flex-wrap items-center gap-3 text-xs text-slate-400 pb-2">
              <span>Penulis: <strong className="text-white">{selectedNews.author}</strong></span>
              <span>•</span>
              <span>{formatDate(selectedNews.date)}</span>
            </div>

            <div className="space-y-4 text-left">
              <div className="rounded-2xl overflow-hidden border border-white/10 bg-slate-950/60 flex justify-center items-center p-1 max-h-[420px] w-full">
                <img 
                  src={selectedNews.image} 
                  alt={selectedNews.title}
                  loading="lazy"
                  className="w-full h-auto max-h-[400px] object-contain rounded-xl"
                  onError={(e) => {
                    e.target.onerror = null;
                    e.target.src = 'https://images.unsplash.com/photo-1542810634-71277d95dcbb?q=80&w=800&auto=format&fit=crop';
                  }}
                />
              </div>

              <div className="text-sm text-slate-200 leading-relaxed whitespace-pre-line bg-white/5 p-5 sm:p-6 rounded-2xl border border-white/5 space-y-3">
                {selectedNews.content}
              </div>
            </div>

            <div className="pt-4 pb-1 border-t border-white/10 flex justify-between items-center gap-3">
              <button 
                onClick={() => showToast('Link artikel berhasil disalin!')}
                className="px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-slate-300 text-xs font-semibold flex items-center gap-2 border border-white/10 transition-colors"
              >
                <Share2 size={16} /> Bagikan Artikel
              </button>
              <button 
                onClick={() => setSelectedNews(null)}
                className="px-5 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-bold transition-colors"
              >
                Tutup
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ===== DONASI SCAN QR INFAQ MODAL ===== */}
      <QRInfaqModal
        isOpen={!!activeDonasiType}
        onClose={() => setActiveDonasiType(null)}
        defaultType={activeDonasiType || 'Infaq'}
        onSuccessCallback={(msg) => showToast(msg)}
      />

      {/* ===== QR SCANNER MODAL ===== */}
      <QRScannerModal
        isOpen={isQRScannerOpen}
        onClose={() => setIsQRScannerOpen(false)}
        onOpenRegistration={() => setIsRegistrationOpen(true)}
      />

      {/* ===== JEMAAH REGISTRATION POP-UP MODAL ===== */}
      <JemaahRegistrationModal
        isOpen={isRegistrationOpen}
        onClose={() => setIsRegistrationOpen(false)}
        onSuccess={(msg) => showToast(msg)}
      />
    </div>
  );
};

export default LandingPage;
