import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const NAV_LINKS = [
  { label: 'Beranda', href: '#beranda' },
  { label: 'Profil', href: '#profil' },
  { label: 'Kegiatan', href: '#kegiatan' },
  { label: 'Program', href: '#program' },
  { label: 'Kontak', href: '#kontak' },
];

const LandingNav = ({ orgName = 'Al-Hikmah' }) => {
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleAnchorClick = (e, href) => {
    e.preventDefault();
    setMobileMenuOpen(false);
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
    <>
      <nav className="fixed top-6 left-1/2 -translate-x-1/2 w-[calc(100%-48px)] max-w-[1200px] z-50 lp-glass rounded-full px-6 sm:px-8 h-16 flex items-center justify-between lp-border shadow-2xl">
        {/* Brand */}
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-[#adc6ff]/20 rounded-lg flex items-center justify-center lp-border">
            <span className="material-symbols-outlined text-[#adc6ff] text-xl">mosque</span>
          </div>
          <span className="font-semibold tracking-tight text-[#e0e3e5] truncate max-w-[140px] sm:max-w-none">{orgName}</span>
        </div>

        {/* Center Links (Desktop) */}
        <div className="hidden md:flex gap-10 text-[13px] uppercase tracking-[0.1em] text-[#c2c6d6]">
          {NAV_LINKS.map((link) => (
            <a
              key={link.href}
              href={link.href}
              onClick={(e) => handleAnchorClick(e, link.href)}
              className="lp-nav-item hover:text-[#e0e3e5] transition-colors"
            >
              {link.label}
            </a>
          ))}
        </div>

        {/* Actions (Desktop & Mobile) */}
        <div className="flex items-center gap-3 sm:gap-6">
          <button
            onClick={() => navigate('/login')}
            className="text-[#c2c6d6] hover:text-[#adc6ff] transition-colors text-[13px] uppercase tracking-wider hidden sm:block"
          >
            Masuk
          </button>
          <button
            onClick={(e) => handleAnchorClick(e, '#donasi')}
            className="bg-[#adc6ff]/10 hover:bg-[#adc6ff]/20 text-[#adc6ff] px-4 sm:px-6 py-2 rounded-full text-xs sm:text-[13px] uppercase tracking-wider transition-all lp-border font-medium"
          >
            Donasi
          </button>

          {/* Mobile Hamburger Button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 text-[#c2c6d6] hover:text-white transition-colors"
            aria-label="Toggle Navigation Menu"
          >
            <span className="material-symbols-outlined text-2xl">
              {mobileMenuOpen ? 'close' : 'menu'}
            </span>
          </button>
        </div>
      </nav>

      {/* Mobile Drawer Overlay */}
      {mobileMenuOpen && (
        <div 
          onClick={() => setMobileMenuOpen(false)}
          className="fixed inset-0 z-40 bg-black/80 backdrop-blur-lg flex flex-col pt-28 px-8 md:hidden animate-in fade-in duration-200"
        >
          <div 
            onClick={(e) => e.stopPropagation()} 
            className="lp-glass lp-border p-6 rounded-3xl space-y-6 text-center"
          >
            <div className="flex flex-col space-y-4 text-sm uppercase tracking-widest text-[#c2c6d6]">
              {NAV_LINKS.map((link) => (
                <a
                  key={link.href}
                  href={link.href}
                  onClick={(e) => handleAnchorClick(e, link.href)}
                  className="py-2 hover:text-[#adc6ff] transition-colors border-b border-white/5 last:border-0"
                >
                  {link.label}
                </a>
              ))}
            </div>

            <div className="pt-4 border-t border-white/10 flex flex-col gap-3">
              <button
                onClick={() => { setMobileMenuOpen(false); navigate('/login'); }}
                className="w-full py-3 rounded-full bg-white/5 hover:bg-white/10 text-[#e0e3e5] uppercase text-xs tracking-widest font-semibold"
              >
                Masuk Portal
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default LandingNav;
