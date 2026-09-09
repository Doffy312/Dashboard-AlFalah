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
  { label: 'Transparansi', path: '/transparansi-keuangan' },
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
      {/* ===== FLOATING PILL NAVBAR ===== */}
      <nav
        className="landing-nav-pill"
        role="navigation"
        aria-label="Landing Page Navigation"
      >
        {/* Brand Logo & Name */}
        <Link 
          to="/" 
          onClick={handleLogoClick}
          className="nav-brand"
          title="Klik 3x untuk Portal Pengurus"
        >
          <div className="nav-brand-logo">
            {profile?.logo ? (
              <img src={profile.logo} alt={orgName} width="36" height="36" decoding="async" className="w-full h-full object-cover pointer-events-none" />
            ) : (
              <Moon size={18} className="text-emerald-400" />
            )}
          </div>
          <span className="nav-brand-name">{orgName}</span>
        </Link>

        {/* Center Navigation Links (Desktop) */}
        <div className="nav-links">
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
                className={active ? 'active' : ''}
              >
                {item.label}
              </Link>
            );
          })}
        </div>

        {/* Right Actions */}
        <div className="nav-actions">
          {/* Donasi Button */}
          {onOpenDonasi && (
            <button 
              onClick={onOpenDonasi}
              className="btn-donasi"
            >
              <HeartHandshake size={14} /> <span>Donasi</span>
            </button>
          )}

          {/* Mobile Hamburger */}
          <button 
            onClick={() => setIsMobileMenuOpen((prev) => !prev)}
            className="btn-mobile-menu"
            aria-label={isMobileMenuOpen ? 'Tutup Menu Navigasi' : 'Buka Menu Navigasi'}
            aria-expanded={isMobileMenuOpen}
          >
            {isMobileMenuOpen ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>
      </nav>

      {/* ===== MOBILE BACKDROP ===== */}
      <div 
        className={`istiqlal-mobile-backdrop ${isMobileMenuOpen ? 'open' : ''}`}
        onClick={closeMobileMenu}
        aria-hidden="true"
      />

      {/* ===== MOBILE DRAWER ===== */}
      <div 
        className={`istiqlal-mobile-drawer ${isMobileMenuOpen ? 'open' : ''}`}
        role="dialog"
        aria-modal="true"
        aria-label="Menu Navigasi Mobile"
      >
        <div className="drawer-content">
          {/* Nav Links */}
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
                className={`drawer-link ${active ? 'active' : ''}`}
              >
                <span>{item.label}</span>
                {active && <span className="w-2 h-2 rounded-full bg-emerald-400 shrink-0" />}
              </Link>
            );
          })}

          <div className="drawer-divider" />

          {/* Quick Actions */}
          <div className="drawer-actions">
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
    </>
  );
}
