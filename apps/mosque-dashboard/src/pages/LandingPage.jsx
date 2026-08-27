import { useState, useEffect, lazy, Suspense } from 'react';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import { 
  Users, 
  Wallet, 
  ArrowRight,
  MapPin,
  Check,
  HeartHandshake,
  Sparkles,
  Newspaper,
  ShieldCheck,
  UserPlus
} from 'lucide-react';

import LandingHeader from '../components/landing/LandingHeader';
import LandingFooter from '../components/landing/LandingFooter';

// Lazy-load below-fold sections for faster initial render
const LandingPrayerBar = lazy(() => import('../components/landing/LandingPrayerBar'));
const LandingContactSection = lazy(() => import('../components/landing/LandingContactSection'));
import { useSettings } from '../contexts/SettingsContext';
import { useDashboardSummary } from '../hooks/useDashboard';
import { useTransactionSummary } from '../hooks/useTransactions';
import { useJemaahSummary } from '../hooks/useJemaah';
import { useArticles } from '../hooks/useArticles';
import { formatCurrency } from '../lib/utils';
import { authClient } from '../lib/auth-client';
import { MOCK_NEWS_ARTICLES } from '../lib/mockArticles';

// Lazy-load heavy components (Map & Modals) for fast page load
const LandingDistributionMap = lazy(() => import('../components/landing/LandingDistributionMap'));
const JemaahRegistrationModal = lazy(() => import('../components/landing/JemaahRegistrationModal'));
const QRInfaqModal = lazy(() => import('../components/landing/QRInfaqModal'));

const LANDING_QUERY_OPTIONS = { staleTime: 60000, gcTime: 300000, refetchOnWindowFocus: false };

const MapSkeleton = () => (
  <section id="sebaran-jemaah" className="scroll-mt-24 py-10 sm:py-16 px-4 sm:px-6 lg:px-12 max-w-7xl mx-auto text-white relative overflow-hidden">
    <div className="bg-[#060b10] rounded-2xl sm:rounded-3xl border border-white/10 p-6 sm:p-8 min-h-[320px] sm:min-h-[400px] lg:min-h-[540px] flex flex-col justify-center items-center text-center space-y-3 sm:space-y-4 animate-pulse">
      <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-emerald-500/20 flex items-center justify-center text-emerald-400 mb-2">
        <MapPin size={24} className="sm:w-7 sm:h-7 animate-bounce" />
      </div>
      <div className="h-5 sm:h-6 w-48 sm:w-64 bg-white/10 rounded-lg"></div>
      <div className="h-3 sm:h-4 w-72 sm:w-96 max-w-full bg-white/5 rounded-lg"></div>
      <div className="text-[10px] sm:text-xs text-slate-500 font-mono mt-2">Memuat Peta Sebaran Jemaah...</div>
    </div>
  </section>
);

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
  const location = useLocation();

  // Handle hash scrolling (e.g. /#kontak) & direct modal trigger (e.g. /#daftar)
  useEffect(() => {
    if (location.hash) {
      const targetId = location.hash.replace('#', '').toLowerCase();
      if (['daftar', 'pendaftaran', 'register'].includes(targetId)) {
        setIsRegistrationOpen(true);
        return;
      }
      const element = document.getElementById(targetId);
      if (element) {
        setTimeout(() => {
          element.scrollIntoView({ behavior: 'smooth' });
        }, 150);
      }
    } else if (location.search.includes('daftar=true') || location.search.includes('register=true')) {
      setIsRegistrationOpen(true);
    }
  }, [location.hash, location.search]);

  // Context & Real-Time Hooks
  const { profile } = useSettings();
  const { data: session } = authClient.useSession();
  const currentUser = session?.user;

  const { data: summary } = useDashboardSummary(LANDING_QUERY_OPTIONS);
  const { data: kasSummary } = useTransactionSummary(LANDING_QUERY_OPTIONS);
  const { data: jemaahSummary } = useJemaahSummary(LANDING_QUERY_OPTIONS);
  const { data: articlesFromApi } = useArticles(LANDING_QUERY_OPTIONS);
  const articlesList = (articlesFromApi && articlesFromApi.length > 0) ? articlesFromApi : MOCK_NEWS_ARTICLES;

  const orgName = profile?.orgName || 'Masjid Al-Falah';

  // State Modals & Toast
  const [activeDonasiType, setActiveDonasiType] = useState(null);
  const [toastMessage, setToastMessage] = useState('');
  const [isRegistrationOpen, setIsRegistrationOpen] = useState(false);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        setActiveDonasiType(null);
        setIsRegistrationOpen(false);
      }
    };

    if (activeDonasiType || isRegistrationOpen) {
      document.body.style.overflow = 'hidden';
      window.addEventListener('keydown', handleKeyDown);
    } else {
      document.body.style.overflow = '';
    }

    return () => {
      document.body.style.overflow = '';
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [activeDonasiType, isRegistrationOpen]);

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(''), 3500);
  };

  // Real-Time Keuangan Computation
  const rawKas = kasSummary?.data || kasSummary || summary?.finance || summary?.keuangan || {};
  const totalPemasukan = Number(rawKas?.totalPemasukan || 0);
  const totalPengeluaran = Number(rawKas?.totalPengeluaran || 0);
  const saldoKas = Number(rawKas?.saldoSaatIni !== undefined && rawKas?.saldoSaatIni !== null ? rawKas.saldoSaatIni : (totalPemasukan - totalPengeluaran));

  // Real-Time Jemaah Computation
  const rawJemaah = jemaahSummary?.data || jemaahSummary || summary?.jemaah || {};
  const totalJemaah = Number(rawJemaah?.total || 0);
  const muzakkiCount = Number(rawJemaah?.Muzakki || rawJemaah?.muzakki || 0);
  const mustahikCount = Number(rawJemaah?.Mustahik || rawJemaah?.mustahik || 0);
  const yatimCount = Number(rawJemaah?.Yatim || rawJemaah?.yatim || 0);
  const lansiaCount = Number(rawJemaah?.Lansia || rawJemaah?.lansia || 0);

  return (
    <div className="landing-container min-h-screen bg-[#0b131a] text-white selection:bg-emerald-500/30 selection:text-emerald-200">
      
      {/* ===== HEADER NAVBAR ===== */}
      <LandingHeader 
        onOpenDonasi={() => setActiveDonasiType('Infaq')}
        onOpenRegistration={() => setIsRegistrationOpen(true)}
      />

      {/* ===== HERO SECTION ===== */}
      <main id="beranda" className="hero-section scroll-mt-24 pt-24 sm:pt-32 pb-8 sm:pb-16 px-4 sm:px-6 lg:px-12 max-w-7xl mx-auto text-center relative overflow-hidden">
        <div className="hero-content relative z-10 max-w-4xl mx-auto">
          <div className="hero-badge inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-400 text-xs font-semibold uppercase tracking-widest mb-4 sm:mb-6">
            <Sparkles size={14} /> Portal Informasi &amp; Transparansi Masjid
          </div>
          
          <h1 className="hero-title text-2xl xs:text-3xl sm:text-5xl lg:text-6xl font-extrabold text-white leading-tight mb-4 sm:mb-6 break-words">
            Manajemen Masjid yang <span className="text-emerald-400">Modern</span>, Transparan &amp; Akuntabel
          </h1>

          <p className="hero-subtitle text-sm sm:text-lg text-slate-300 leading-relaxed max-w-2xl mx-auto mb-6 sm:mb-8 px-2 break-words">
            Sentralisasi data keuangan, program kerja, dan keanggotaan jemaah {orgName} yang dapat diakses secara terbuka demi menjaga amanah umat.
          </p>

          <div className="hero-cta-group flex flex-wrap justify-center gap-2.5 sm:gap-4">
            <button 
              onClick={() => setIsRegistrationOpen(true)}
              className="btn-primary-large bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 font-extrabold px-5 sm:px-8 py-3 rounded-xl text-xs sm:text-base transition-all flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/25 active:scale-95 w-full xs:w-auto"
            >
              <UserPlus size={18} className="sm:w-5 sm:h-5" /> Form Pendaftaran Jemaah
            </button>
            <button 
              onClick={() => setActiveDonasiType('Infaq')}
              className="btn-primary-large bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold px-5 sm:px-8 py-3 rounded-xl text-xs sm:text-base transition-all flex items-center justify-center gap-2 shadow-lg shadow-amber-500/20 active:scale-95 w-full xs:w-auto"
            >
              <HeartHandshake size={18} className="sm:w-5 sm:h-5" /> Donasi Infaq
            </button>
            <Link 
              to="/transparansi-keuangan" 
              className="btn-secondary-large bg-white/5 hover:bg-white/10 text-white border border-white/10 px-5 sm:px-8 py-3 rounded-xl text-xs sm:text-base font-semibold transition-all flex items-center justify-center gap-2 active:scale-95 w-full xs:w-auto"
            >
              Transparansi Kas
            </Link>
          </div>
        </div>

        {/* Glow Spheres */}
        <div className="hero-decoration">
          <div className="glow-sphere sphere-1 absolute -top-10 left-1/4 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none"></div>
          <div className="glow-sphere sphere-2 absolute top-20 right-1/4 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl pointer-events-none"></div>
        </div>
      </main>

      {/* ===== JADWAL SHALAT SECTION ===== */}
      <Suspense fallback={<div className="py-10 px-4 max-w-7xl mx-auto text-center text-slate-500 text-sm">Memuat Jadwal Shalat...</div>}>
        <LandingPrayerBar />
      </Suspense>

      {/* ===== PROFIL SHORT PREVIEW ===== */}
      <section className="py-8 sm:py-12 px-4 sm:px-6 lg:px-12 max-w-7xl mx-auto">
        <div className="p-5 sm:p-8 rounded-3xl bg-white/5 border border-white/10 backdrop-blur-md flex flex-col md:flex-row items-center justify-between gap-6 sm:gap-8">
          <div className="space-y-3 text-center md:text-left">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 text-amber-400 text-xs font-bold uppercase tracking-wider">
              <ShieldCheck size={14} /> Profil &amp; Identitas Masjid
            </div>
            <h2 className="text-xl sm:text-3xl font-extrabold text-white">Visi &amp; Misi Pelayanan {orgName}</h2>
            <p className="text-slate-300 text-xs sm:text-sm max-w-xl leading-relaxed">
              {profile?.description || 'Pusat ibadah dan pembinaan kegiatan keagamaan jemaah secara transparan, profesional, dan akuntabel.'}
            </p>
          </div>

          <Link
            to="/profil"
            className="px-5 py-3 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs sm:text-sm tracking-wide transition-all shadow-lg shadow-amber-500/20 shrink-0 flex items-center justify-center gap-2 w-full md:w-auto"
          >
            <span>Selengkapnya di Profil</span>
            <ArrowRight size={16} />
          </Link>
        </div>
      </section>

      {/* ===== TRANSPARANSI KEUANGAN & JEMAAH HIGHLIGHT ===== */}
      <section className="py-8 sm:py-12 px-4 sm:px-6 lg:px-12 max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-6 sm:mb-8 gap-4">
          <div>
            <h2 className="text-2xl sm:text-3xl font-bold text-white mb-2">Transparansi Real-Time</h2>
            <p className="text-slate-400 text-xs sm:text-sm max-w-xl">Ringkasan kas masjid dan statistik jemaah terdaftar.</p>
          </div>
          <Link
            to="/transparansi-keuangan"
            className="text-xs font-bold text-emerald-400 hover:text-emerald-300 flex items-center gap-1.5 hover:underline"
          >
            <span>Buka Laporan Transparansi Keuangan</span>
            <ArrowRight size={14} />
          </Link>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-8">
          {/* Ringkasan Kas Card */}
          <div className="p-5 sm:p-8 rounded-2xl border border-emerald-500/20 bg-white/5 text-left backdrop-blur-md flex flex-col justify-between">
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

            <div className="flex flex-col sm:flex-row gap-3 mt-6">
              <button 
                onClick={() => setActiveDonasiType('Infaq')}
                className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-emerald-400 to-teal-400 hover:from-emerald-300 hover:to-teal-300 text-slate-950 font-extrabold text-xs tracking-wide flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/25 transition-all"
              >
                <HeartHandshake size={18} />
                <span>Infaq Sekarang</span>
              </button>
              <Link 
                to="/transparansi-keuangan"
                className="w-full py-3 px-4 rounded-xl bg-white/5 hover:bg-white/10 text-white font-bold text-xs flex items-center justify-center gap-2 border border-white/10 transition-all text-center"
              >
                <span>Grafik Kategori</span>
                <ArrowRight size={14} />
              </Link>
            </div>
          </div>

          {/* Ringkasan Jemaah Card */}
          <div className="p-8 rounded-2xl border border-amber-500/20 bg-white/5 text-left backdrop-blur-md flex flex-col justify-between">
            <div>
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
              </div>
            </div>

            <button 
              onClick={() => setIsRegistrationOpen(true)}
              className="mt-6 w-full py-3.5 px-6 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 font-extrabold text-xs flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/20 transition-all"
            >
              <UserPlus size={18} />
              <span>Form Pendaftaran Jemaah Masjid</span>
              <ArrowRight size={16} />
            </button>
          </div>
        </div>
      </section>

      {/* ===== PETA SEBARAN JEMAAH ===== */}
      <Suspense fallback={<MapSkeleton />}>
        <LandingDistributionMap />
      </Suspense>

      {/* ===== BERITA & KEGIATAN PREVIEW ===== */}
      <section className="py-16 px-6 lg:px-12 max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-8 gap-4">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 text-amber-400 text-xs font-bold uppercase tracking-wider mb-2">
              <Newspaper size={14} /> Berita Terkini
            </div>
            <h2 className="text-3xl font-bold text-white">Berita &amp; Dokumentasi Kegiatan</h2>
            <p className="text-slate-400 text-sm mt-1">Laporan pelaksanaan agenda dan informasi edukasi jemaah.</p>
          </div>

          <Link
            to="/berita-kegiatan"
            className="px-5 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-white font-bold text-xs border border-white/10 flex items-center gap-2 transition-all shrink-0 self-start md:self-auto"
          >
            <span>Lihat Semua Berita</span>
            <ArrowRight size={16} />
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {articlesList.slice(0, 4).map((article) => (
            <Link 
              key={article.id}
              to="/berita-kegiatan"
              className="group bg-white/5 border border-white/10 hover:border-amber-500/40 rounded-2xl overflow-hidden transition-all hover:-translate-y-1 flex flex-col justify-between"
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
                      e.target.src = 'https://images.unsplash.com/photo-1542810634-71277d95dcbb?q=80&w=800&auto=format&fit=crop';
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

              <div className="px-5 pb-5 pt-2 border-t border-white/5 mt-2">
                <span className="text-xs font-bold text-emerald-400 group-hover:underline flex items-center gap-1.5">
                  <span>Baca Selengkapnya</span>
                  <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
                </span>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* ===== HUBUNGI PENGURUS SECTION ===== */}
      <Suspense fallback={null}>
        <LandingContactSection onShowToast={showToast} />
      </Suspense>

      {/* ===== FOOTER ===== */}
      <LandingFooter />

      {/* ===== TOAST NOTIFICATION ===== */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-emerald-500 text-slate-950 px-5 py-3 rounded-xl font-bold text-sm shadow-2xl flex items-center gap-2 animate-bounce">
          <Check size={18} /> {toastMessage}
        </div>
      )}

      {/* ===== LAZY MODALS ===== */}
      <Suspense fallback={null}>
        <QRInfaqModal
          isOpen={!!activeDonasiType}
          onClose={() => setActiveDonasiType(null)}
          defaultType={activeDonasiType || 'Infaq'}
          onSuccessCallback={(msg) => showToast(msg)}
        />
        <JemaahRegistrationModal
          isOpen={isRegistrationOpen}
          onClose={() => setIsRegistrationOpen(false)}
          onSuccess={(msg) => showToast(msg)}
        />
      </Suspense>
    </div>
  );
};

export default LandingPage;
