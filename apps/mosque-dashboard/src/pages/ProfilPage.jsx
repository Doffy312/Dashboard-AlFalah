import { useState, Suspense, lazy } from 'react';
import { 
  Sparkles, 
  CheckCircle2, 
  Check, 
  Building2, 
  ShieldCheck, 
  Heart, 
  Users,
  Award
} from 'lucide-react';
import LandingHeader from '../components/landing/LandingHeader';
import LandingFooter from '../components/landing/LandingFooter';
import LandingContactSection from '../components/landing/LandingContactSection';
import { useSettings } from '../contexts/SettingsContext';

const QRInfaqModal = lazy(() => import('../components/landing/QRInfaqModal'));

export default function ProfilPage() {
  const { profile } = useSettings();
  const orgName = profile?.orgName || 'Masjid Al-Falah';

  const [activeDonasiType, setActiveDonasiType] = useState(null);
  const [toastMessage, setToastMessage] = useState('');

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(''), 3500);
  };

  const valuesList = [
    {
      title: 'Transparansi & Akuntabilitas',
      desc: 'Setiap Rupiah amanah jemaah dicatat, diaudit, dan dilaporkan secara terbuka melalui portal sistem online real-time.',
      icon: <ShieldCheck size={24} className="text-emerald-400" />
    },
    {
      title: 'Pelayanan Ramah Jemaah',
      desc: 'Memberikan kenyamanan beribadah serta kemudahan layanan sosial, zakat, infaq, dan kegiatan keagamaan.',
      icon: <Heart size={24} className="text-amber-400" />
    },
    {
      title: 'Pemberdayaan Umat',
      desc: 'Mengembangkan potensi ekonomi dan sosial jemaah melalui bantuan dhuafa, beasiswa santri, dan bina usaha.',
      icon: <Users size={24} className="text-emerald-400" />
    },
    {
      title: 'Manajemen Profesional',
      desc: 'Pengelolaan takmir berbasis standar modern dan terstruktur untuk keberlanjutan program peradaban masjid.',
      icon: <Award size={24} className="text-amber-400" />
    }
  ];

  return (
    <div className="landing-container min-h-screen bg-[#0b131a] text-white selection:bg-emerald-500/30 selection:text-emerald-200">
      {/* Shared Header */}
      <LandingHeader 
        onOpenDonasi={() => setActiveDonasiType('Infaq')}
      />

      {/* Hero Header Profil */}
      <section className="scroll-mt-24 pt-28 sm:pt-32 pb-12 sm:pb-16 px-4 sm:px-6 lg:px-12 max-w-7xl mx-auto text-center relative overflow-hidden">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-400 text-xs font-semibold uppercase tracking-widest mb-6">
          <Building2 size={14} /> Tentang &amp; Visi Misi Masjid
        </div>

        <h1 className="text-2xl xs:text-3xl sm:text-5xl lg:text-6xl font-extrabold text-white leading-tight mb-6 break-words">
          Profil &amp; Visi Misi
          <span className="block text-emerald-400 mt-2 sm:mt-3 break-words">{orgName}</span>
        </h1>

        <p className="text-sm sm:text-lg text-slate-300 leading-relaxed max-w-2xl mx-auto mb-8 break-words px-2">
          {profile?.description || 'Pusat peradaban, ibadah, dan pembinaan keagamaan jemaah yang berlandaskan al-Qur\'an dan as-Sunnah.'}
        </p>

        {/* Glow Sphere Decorations — same as beranda */}
        <div className="hero-decoration">
          <div className="glow-sphere sphere-1 absolute -top-10 left-1/4 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none"></div>
          <div className="glow-sphere sphere-2 absolute top-20 right-1/4 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl pointer-events-none"></div>
        </div>
      </section>

      {/* Visi & Misi Cards */}
      <section className="py-8 sm:py-12 px-4 sm:px-6 lg:px-12 max-w-7xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8">
          {/* Visi Card */}
          <div className="p-5 sm:p-8 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-md hover:border-amber-500/30 transition-all">
            <div className="w-12 h-12 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center mb-6">
              <Sparkles size={24} />
            </div>
            <h3 className="text-xl font-bold text-white mb-3">Visi Masjid</h3>
            <p className="text-slate-300 text-sm leading-relaxed whitespace-pre-line break-words">
              {profile?.vision || "Menjadi pusat peradaban dan ibadah yang memakmurkan jemaah, berlandaskan al-Qur'an dan as-Sunnah serta didukung tata kelola yang profesional dan transparan."}
            </p>
          </div>

          {/* Misi Card */}
          <div className="p-5 sm:p-8 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-md hover:border-emerald-500/30 transition-all">
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
                  <span className="leading-snug break-words">{misiItem}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      {/* Nilai Utama Takmir */}
      <section className="py-16 px-6 lg:px-12 max-w-7xl mx-auto">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-white mb-3">Nilai &amp; Prinsip Tata Kelola</h2>
          <p className="text-slate-400 text-sm max-w-xl mx-auto">Prinsip dasar pengurus takmir dalam menjalankan amanah umat.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {valuesList.map((val, idx) => (
            <div key={idx} className="p-6 rounded-2xl bg-white/5 border border-white/10 hover:border-amber-500/30 transition-all">
              <div className="w-12 h-12 rounded-xl bg-amber-500/10 flex items-center justify-center mb-4">
                {val.icon}
              </div>
              <h3 className="text-lg font-bold text-white mb-2">{val.title}</h3>
              <p className="text-xs text-slate-300 leading-relaxed">{val.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Info Alamat & Kontak */}
      <LandingContactSection onShowToast={showToast} />

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
