import { useState, useEffect, useCallback, useRef } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { 
  Moon, 
  HeartHandshake, 
  Menu,
  X,
  UserPlus
} from 'lucide-react';
import { useSettings } from '../../contexts/SettingsContext';
import { authClient } from '../../lib/auth-client';

const NAV_ITEMS = [
  { label: 'Beranda', path: '/' },
  { label: 'Profil', path: '/profil' },
  { label: 'Transparansi Keuangan', path: '/transparansi-keuangan' },
  { label: 'Berita & Kegiatan', path: '/berita-kegiatan' },
  { label: 'Kontak', path: '/#kontak' },
];

export default function LandingHeader({ onOpenDonasi, onOpenRegistration }) {
  const location = useLocation();
  const navigate = useNavigate();
  const { profile } = useSettings();
  const { data: session } = authClient.useSession();
  const currentUser = session?.user;
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Triple Click Logo Gesture Tracker
  const logoClicksRef = useRef(0);
  const logoTimerRef = useRef(null);

  const orgName = profile?.orgName || 'Masjid Al-Falah';

  const isActive = (path) => {
    if (path === '/') return location.pathname === '/' && !location.hash;
    if (path === '/#kontak') return location.hash === '#kontak';
    return location.pathname.startsWith(path);
  };

  // Triple click logo handler: 3 taps within 1.2s will navigate to private login (/portal-dkm)
  const handleLogoClick = useCallback((e) => {
    logoClicksRef.current += 1;

    if (logoTimerRef.current) {
      clearTimeout(logoTimerRef.current);
    }

    if (logoClicksRef.current >= 3) {
      e.preventDefault();
      logoClicksRef.current = 0;
      navigate(currentUser ? '/dashboard' : '/portal-dkm');
      return;
    }

    logoTimerRef.current = setTimeout(() => {
      logoClicksRef.current = 0;
    }, 1200);

    if (location.pathname === '/') {
      window.scrollTo({ top: 0, left: 0, behavior: 'smooth' });
    }
  }, [currentUser, navigate, location.pathname]);

  // Keyboard shortcut listener (Ctrl+Shift+L or Alt+A) for admin quick access
  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.ctrlKey && e.shiftKey && e.key?.toLowerCase() === 'l') || (e.altKey && e.key?.toLowerCase() === 'a')) {
        e.preventDefault();
        navigate(currentUser ? '/dashboard' : '/portal-dkm');
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [currentUser, navigate]);

  // Close mobile menu on route change
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- Sync UI with route change
    setIsMobileMenuOpen(false);
  }, [location.pathname]);

  // Lock body scroll when mobile menu is open
  useEffect(() => {
    if (isMobileMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => { document.body.style.overflow = ''; };
  }, [isMobileMenuOpen]);

  const closeMobileMenu = useCallback(() => setIsMobileMenuOpen(false), []);

  const handleRegisterClick = useCallback(() => {
    closeMobileMenu();
    if (onOpenRegistration) {
      onOpenRegistration();
    } else {
      navigate('/#daftar');
    }
  }, [closeMobileMenu, onOpenRegistration, navigate]);

  return (
    <>
      {/* ===== TOP NAVBAR ===== */}
      <nav
        className="landing-header-nav fixed top-0 left-0 right-0 z-50 bg-[#0b131a]/85 backdrop-blur-md border-b border-white/10 transition-all"
        role="navigation"
        aria-label="Landing Page Navigation"
      >
        <div className="flex justify-between items-center px-4 sm:px-6 lg:px-12 py-3 sm:py-3.5">
          {/* Brand Logo & Name with Triple-Click Emergency Admin Access */}
          <Link 
            to="/" 
            onClick={handleLogoClick}
            className="flex items-center gap-2.5 sm:gap-3 group min-w-0 shrink cursor-pointer select-none"
            title="Klik 3x untuk Portal Pengurus"
          >
            <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-amber-500/20 border border-amber-500/30 flex items-center justify-center overflow-hidden shrink-0 group-hover:scale-105 transition-transform active:scale-95">
              {profile?.logo ? (
                <img src={profile.logo} alt={orgName} width="40" height="40" decoding="async" className="w-full h-full object-cover pointer-events-none" />
              ) : (
                <Moon size={20} className="text-amber-400 sm:w-[22px] sm:h-[22px]" />
              )}
            </div>
            <span className="text-base sm:text-lg md:text-xl font-bold text-white tracking-tight group-hover:text-amber-300 transition-colors truncate max-w-[180px] xs:max-w-[240px] sm:max-w-[320px] md:max-w-none">
              {orgName}
            </span>
          </Link>

          {/* Desktop Navigation Links */}
          <div className="hidden md:flex items-center gap-5 lg:gap-8 text-sm font-medium">
            {NAV_ITEMS.map((item) => {
              const active = isActive(item.path);
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  onClick={() => {
                    if (location.pathname === item.path && !item.path.includes('#')) {
                      window.scrollTo({ top: 0, left: 0, behavior: 'smooth' });
                    }
                  }}
                  className={`transition-colors py-1 relative whitespace-nowrap ${
                    active 
                      ? 'text-amber-400 font-semibold' 
                      : 'text-slate-300 hover:text-amber-300'
                  }`}
                >
                  {item.label}
                  {active && (
                    <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-amber-400 rounded-full" />
                  )}
                </Link>
              );
            })}
          </div>

          {/* Action Buttons (Public Only) */}
          <div className="flex items-center gap-2 sm:gap-2.5 shrink-0">
            {/* Desktop: Form Pendaftaran Jemaah */}
            <button 
              onClick={handleRegisterClick}
              className="hidden sm:flex px-3.5 py-2 rounded-lg bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-xs font-semibold uppercase tracking-wider transition-all items-center gap-1.5"
            >
              <UserPlus size={16} /> Daftar Jemaah
            </button>

            {/* Donasi Infaq Button (Desktop & Mobile) */}
            {onOpenDonasi && (
              <button 
                onClick={onOpenDonasi}
                className="flex px-3 sm:px-3.5 py-2 rounded-lg bg-amber-500/10 hover:bg-amber-500/20 text-amber-400 border border-amber-500/30 text-xs font-semibold uppercase tracking-wider transition-all items-center gap-1.5"
              >
                <HeartHandshake size={16} /> <span className="hidden xs:inline">Donasi Infaq</span><span className="xs:hidden">Donasi</span>
              </button>
            )}

            {/* Mobile Hamburger Button */}
            <button 
              onClick={() => setIsMobileMenuOpen((prev) => !prev)}
              className="md:hidden p-2 rounded-lg bg-white/5 border border-white/10 text-slate-300 hover:text-white hover:bg-white/10 transition-colors active:scale-95"
              aria-label={isMobileMenuOpen ? 'Tutup Menu Navigasi' : 'Buka Menu Navigasi'}
              aria-expanded={isMobileMenuOpen}
            >
              {isMobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
          </div>
        </div>
      </nav>

      {/* ===== MOBILE DRAWER BACKDROP ===== */}
      <div 
        className={`fixed inset-0 z-40 bg-black/60 backdrop-blur-sm md:hidden transition-opacity duration-300 ${
          isMobileMenuOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
        }`}
        onClick={closeMobileMenu}
        aria-hidden="true"
      />

      {/* ===== MOBILE DRAWER PANEL ===== */}
      <div 
        className={`fixed inset-x-0 top-0 z-45 md:hidden transition-transform duration-300 ease-[cubic-bezier(0.32,0.72,0,1)] ${
          isMobileMenuOpen ? 'translate-y-0' : '-translate-y-full'
        }`}
        role="dialog"
        aria-modal="true"
        aria-label="Menu Navigasi Mobile"
      >
        {/* Spacer to push content below the navbar */}
        <div className="h-[57px] sm:h-[65px]" />

        <div className="bg-[#0b131a]/98 backdrop-blur-xl border-b border-white/10 max-h-[calc(100dvh-57px)] sm:max-h-[calc(100dvh-65px)] overflow-y-auto overscroll-contain">
          <div className="px-5 py-5 flex flex-col gap-1">
            {/* Navigation Links */}
            {NAV_ITEMS.map((item) => {
              const active = isActive(item.path);
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  onClick={() => {
                    closeMobileMenu();
                    if (location.pathname === item.path && !item.path.includes('#')) {
                      window.scrollTo({ top: 0, left: 0, behavior: 'smooth' });
                    }
                  }}
                  className={`py-3 px-3 rounded-xl flex items-center justify-between transition-colors ${
                    active 
                      ? 'text-amber-400 font-bold bg-amber-500/10' 
                      : 'text-slate-200 hover:text-amber-300 hover:bg-white/5'
                  }`}
                >
                  <span className="text-sm">{item.label}</span>
                  {active && <span className="w-2 h-2 rounded-full bg-amber-400 shrink-0" />}
                </Link>
              );
            })}

            {/* Divider */}
            <div className="h-px bg-white/10 my-3" />

            {/* Mobile Quick Actions */}
            <div className="flex flex-col gap-2.5">
              <button 
                onClick={handleRegisterClick}
                className="w-full py-3 rounded-xl bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 border border-emerald-500/40 text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-2 transition-colors active:scale-[0.98]"
              >
                <UserPlus size={16} /> Formulir Pendaftaran Jemaah
              </button>

              {onOpenDonasi && (
                <button 
                  onClick={() => { closeMobileMenu(); onOpenDonasi(); }}
                  className="w-full py-3 rounded-xl bg-amber-500/15 hover:bg-amber-500/25 text-amber-300 border border-amber-500/30 text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-2 transition-colors active:scale-[0.98]"
                >
                  <HeartHandshake size={16} /> Donasi Infaq
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
