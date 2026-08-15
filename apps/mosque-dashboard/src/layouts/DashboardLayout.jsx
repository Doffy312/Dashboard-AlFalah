import { useEffect } from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
import TopNavBar from '../components/TopNavBar';
import { useRealtimeSync } from '../hooks/useRealtimeSync';

// Lazy-load dashboard-only fonts (Material Symbols ~120KB, Playfair Display)
// These are NOT needed on the Landing Page, so we inject them here instead of index.html.
const DASHBOARD_FONTS_URL = 'https://fonts.googleapis.com/css2?family=Playfair+Display:wght@600;700&family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@24,400,0..1,0&display=swap';

const DashboardLayout = () => {
  useRealtimeSync();

  // Inject dashboard-specific fonts on mount (Material Symbols + Playfair)
  useEffect(() => {
    const id = 'dashboard-fonts';
    if (!document.getElementById(id)) {
      const link = document.createElement('link');
      link.id = id;
      link.rel = 'stylesheet';
      link.href = DASHBOARD_FONTS_URL;
      document.head.appendChild(link);
    }
  }, []);


  return (
    <>
      {/* Background Glow Spheres */}
      <div className="glow-sphere glow-sphere-1"></div>
      <div className="glow-sphere glow-sphere-2"></div>

      <Sidebar />
      <TopNavBar />

      {/* Main Content Canvas */}
      <main className="pt-[64px] md:pt-[88px] pb-[88px] md:pb-xl px-sm md:px-lg md:ml-[280px] min-h-screen relative">
        <Outlet />
        
        {/* Footer (Shared Component JSON Blueprint) */}
        <footer className="hidden md:flex justify-between items-center py-sm mt-xl w-full bg-transparent z-20">
          <p className="font-body-sm text-[12px] text-on-surface-variant/80 m-0">© {new Date().getFullYear()} Takmir Masjid Al-Falah. Sistem Manajemen Masjid.</p>
          <div className="flex gap-md">
            <a className="font-body-sm text-[12px] text-on-surface-variant/60 hover:text-primary transition-colors underline-offset-4 hover:underline" href="#">Bantuan</a>
            <a className="font-body-sm text-[12px] text-on-surface-variant/60 hover:text-primary transition-colors underline-offset-4 hover:underline" href="#">Kebijakan Privasi</a>
            <a className="font-body-sm text-[12px] text-on-surface-variant/60 hover:text-primary transition-colors underline-offset-4 hover:underline" href="#">Kontak Kami</a>
          </div>
        </footer>
      </main>
    </>
  );
};

export default DashboardLayout;
