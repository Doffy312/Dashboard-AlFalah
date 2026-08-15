import { useState, Suspense, lazy } from 'react';
import { 
  Wallet, 
  TrendingUp, 
  HeartHandshake, 
  ArrowRight, 
  Check, 
  Building
} from 'lucide-react';
import LandingHeader from '../components/landing/LandingHeader';
import LandingFooter from '../components/landing/LandingFooter';
import IncomeCategoryGrowthChart from '../components/landing/IncomeCategoryGrowthChart';
import { useSettings } from '../contexts/SettingsContext';
import { useDashboardSummary } from '../hooks/useDashboard';
import { useTransactionSummary } from '../hooks/useTransactions';
import { formatCurrency } from '../lib/utils';

const QRInfaqModal = lazy(() => import('../components/landing/QRInfaqModal'));

const LANDING_QUERY_OPTIONS = { staleTime: 60000, gcTime: 300000, refetchOnWindowFocus: false };

export default function TransparansiKeuanganPage() {
  const { profile, finance } = useSettings();
  const orgName = profile?.orgName || 'Masjid Al-Falah';

  // Fetch real-time financial data
  const { data: summary } = useDashboardSummary(LANDING_QUERY_OPTIONS);
  const { data: kasSummary } = useTransactionSummary(LANDING_QUERY_OPTIONS);

  const [activeDonasiType, setActiveDonasiType] = useState(null);
  const [toastMessage, setToastMessage] = useState('');

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(''), 3500);
  };

  // Real-Time Computations
  const rawKas = kasSummary?.data || kasSummary || summary?.finance || summary?.keuangan || {};
  const totalPemasukan = Number(rawKas?.totalPemasukan || 0);
  const totalPengeluaran = Number(rawKas?.totalPengeluaran || 0);
  const saldoKas = Number(rawKas?.saldoSaatIni !== undefined && rawKas?.saldoSaatIni !== null ? rawKas.saldoSaatIni : (totalPemasukan - totalPengeluaran));

  return (
    <div className="landing-container min-h-screen bg-[#0b131a] text-white selection:bg-emerald-500/30 selection:text-emerald-200">
      {/* Header */}
      <LandingHeader 
        onOpenDonasi={() => setActiveDonasiType('Infaq')}
      />

      {/* Hero Header */}
      <section className="scroll-mt-24 pt-24 sm:pt-32 pb-6 sm:pb-12 px-4 sm:px-6 lg:px-12 max-w-7xl mx-auto text-center relative overflow-hidden">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-400 text-xs font-semibold uppercase tracking-widest mb-4 sm:mb-6">
          <Wallet size={14} /> Laporan Transparansi Keuangan Real-Time
        </div>

        <h1 className="text-2xl xs:text-3xl sm:text-5xl lg:text-6xl font-extrabold text-white leading-tight mb-4 sm:mb-6 break-words">
          Transparansi Keuangan
          <span className="block text-emerald-400 mt-2 sm:mt-3 break-words">{orgName}</span>
        </h1>

        <p className="text-sm sm:text-lg text-slate-300 leading-relaxed max-w-2xl mx-auto mb-6 sm:mb-8 px-2 break-words">
          Pencatatan kas, arus dana infaq, dan pertumbuhan pemasukan masjid yang dilaporkan secara otomatis demi menjaga amanah jemaah.
        </p>

        {/* Glow Sphere Decorations — same as beranda */}
        <div className="hero-decoration">
          <div className="glow-sphere sphere-1 absolute -top-10 left-1/4 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none"></div>
          <div className="glow-sphere sphere-2 absolute top-20 right-1/4 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl pointer-events-none"></div>
        </div>
      </section>

      {/* Real-time Kas Summary Cards */}
      <section className="py-6 sm:py-8 px-4 sm:px-6 lg:px-12 max-w-7xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-8">
          {/* Ringkasan Kas Card — matching beranda style */}
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

            <button 
              onClick={() => setActiveDonasiType('Infaq')}
              className="mt-6 w-full py-3.5 px-6 rounded-xl bg-gradient-to-r from-emerald-400 via-emerald-500 to-teal-400 hover:from-emerald-300 hover:via-emerald-400 hover:to-teal-300 text-slate-950 font-extrabold text-base tracking-wide flex items-center justify-center gap-2.5 shadow-lg shadow-emerald-500/25 hover:shadow-emerald-500/40 hover:scale-[1.01] active:scale-[0.99] transition-all border border-emerald-300/40"
            >
              <HeartHandshake size={22} className="text-slate-950" />
              <span>Infaq Sekarang</span>
              <ArrowRight size={18} className="text-slate-950" />
            </button>
          </div>

          {/* Rekening Infaq & Transfer Bank Info */}
          <div className="p-5 sm:p-8 rounded-2xl border border-amber-500/20 bg-white/5 text-left backdrop-blur-md flex flex-col justify-between">
            <div>
              <div className="flex items-center gap-3 mb-6">
                <div className="p-3 rounded-xl bg-amber-500/15 text-amber-400">
                  <Building size={28} />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-white">Rekening Official Masjid</h3>
                  <p className="text-xs text-slate-400">Salurkan infaq &amp; sedekah Anda</p>
                </div>
              </div>

              <div className="space-y-4">
                <div className="p-4 sm:p-5 bg-white/5 rounded-xl border border-white/10">
                  <div className="text-xs text-slate-400 uppercase tracking-wider mb-2">Bank Transfer Infaq</div>
                  <div className="font-extrabold text-lg text-emerald-400">
                    {finance?.bankInfo?.bankName || 'BSI (Bank Syariah Indonesia)'}
                  </div>
                  <div className="text-2xl font-mono font-extrabold text-white tracking-widest select-all mt-2">
                    {finance?.bankInfo?.accountNumber || '7123456789'}
                  </div>
                  <div className="text-xs text-slate-300 mt-2">
                    a.n. <strong className="text-amber-300">{finance?.bankInfo?.accountHolder || orgName}</strong>
                  </div>
                </div>

                <div className="text-[11px] text-slate-400 flex items-center gap-1.5 border-t border-white/5 pt-3">
                  <TrendingUp size={14} className="text-emerald-400 shrink-0" />
                  <span>Seluruh transaksi masuk tercatat otomatis pada laporan kas transparansi real-time.</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Section: Grafik Pertumbuhan Pemasukan per Kategori (Menyembunyikan Nominal) */}
      <section className="py-8 sm:py-16 px-4 sm:px-6 lg:px-12 max-w-7xl mx-auto">
        <div className="text-center mb-8 sm:mb-12">
          <h2 className="text-2xl sm:text-3xl font-bold text-white mb-3">Grafik Pertumbuhan Pemasukan per Kategori</h2>
          <p className="text-slate-400 text-xs sm:text-sm max-w-xl mx-auto">Grafik analisis kontribusi kategori pemasukan tanpa mempublikasikan rincian nominal rupiah secara terbuka.</p>
        </div>

        {/* Income Growth Chart Component */}
        <IncomeCategoryGrowthChart />
      </section>

      {/* Footer */}
      <LandingFooter />

      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-emerald-500 text-slate-950 px-5 py-3 rounded-xl font-bold text-sm shadow-2xl flex items-center gap-2 animate-bounce">
          <Check size={18} /> {toastMessage}
        </div>
      )}

      {/* Modals */}
      <Suspense fallback={null}>
        <QRInfaqModal
          isOpen={!!activeDonasiType}
          onClose={() => setActiveDonasiType(null)}
          defaultType={activeDonasiType || 'Infaq'}
          onSuccessCallback={(msg) => showToast(msg)}
        />
      </Suspense>
    </div>
  );
}
