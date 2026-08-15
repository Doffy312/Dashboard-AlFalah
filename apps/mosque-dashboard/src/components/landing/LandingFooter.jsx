import { Link, useLocation } from 'react-router-dom';
import { Moon, MapPin, Phone } from 'lucide-react';
import { useSettings } from '../../contexts/SettingsContext';

const FOOTER_NAV = [
  { label: 'Beranda', path: '/' },
  { label: 'Profil', path: '/profil' },
  { label: 'Transparansi Keuangan', path: '/transparansi-keuangan' },
  { label: 'Berita & Kegiatan', path: '/berita-kegiatan' },
  { label: 'Kontak', path: '/#kontak' },
];

const LandingFooter = ({ orgName: customOrgName, logo: customLogo }) => {
  const location = useLocation();
  const { profile } = useSettings();
  const year = new Date().getFullYear();

  const orgName = customOrgName || profile?.orgName || 'Masjid Al-Falah';
  const logo = customLogo || profile?.logo;

  return (
    <footer className="border-t border-white/10 py-12 px-6 lg:px-12 bg-slate-950/60">
      <div className="max-w-7xl mx-auto flex flex-col items-center gap-8">
        {/* Brand */}
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-amber-500/20 border border-amber-500/30 flex items-center justify-center overflow-hidden shrink-0">
            {logo ? (
              <img src={logo} alt={orgName} width="36" height="36" loading="lazy" decoding="async" className="w-full h-full object-cover" />
            ) : (
              <Moon size={22} className="text-amber-400" />
            )}
          </div>
          <span className="font-bold text-lg text-white">{orgName}</span>
        </div>

        {/* Navigation Links */}
        <div className="flex flex-wrap justify-center gap-x-6 gap-y-3 text-xs uppercase tracking-widest text-slate-400">
          {FOOTER_NAV.map((item) => (
            <Link 
              key={item.path} 
              to={item.path}
              onClick={() => {
                if (location.pathname === item.path && !item.path.includes('#')) {
                  window.scrollTo({ top: 0, left: 0, behavior: 'smooth' });
                }
              }}
              className="hover:text-amber-400 transition-colors"
            >
              {item.label}
            </Link>
          ))}
        </div>

        {/* Contact Info */}
        <div className="flex flex-wrap justify-center gap-6 text-xs text-slate-400">
          <span className="flex items-center gap-1.5">
            <MapPin size={14} className="text-amber-400" /> 
            {profile?.address || 'Jl. Raya Pendidikan No. 123, Bandung'}
          </span>
          <span className="flex items-center gap-1.5">
            <Phone size={14} className="text-amber-400" /> 
            {profile?.phone || '081234567890'}
          </span>
        </div>

        {/* Copyright */}
        <p className="text-xs text-slate-500">
          © {year} Dashboard Takmir {orgName}. All rights reserved.
        </p>
      </div>
    </footer>
  );
};

export default LandingFooter;
