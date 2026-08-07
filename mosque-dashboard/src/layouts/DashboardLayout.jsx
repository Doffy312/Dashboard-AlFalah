import React from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
import TopNavBar from '../components/TopNavBar';

const DashboardLayout = () => {
  return (
    <>
      {/* Background Glow Spheres */}
      <div className="glow-sphere glow-sphere-1"></div>
      <div className="glow-sphere glow-sphere-2"></div>

      <Sidebar />
      <TopNavBar />

      {/* Main Content Canvas */}
      <main className="pt-[88px] pb-xl px-sm md:px-lg md:ml-[280px] min-h-screen relative">
        <Outlet />
        
        {/* Footer (Shared Component JSON Blueprint) */}
        <footer className="hidden md:flex justify-between items-center py-sm mt-xl w-full bg-transparent z-20">
          <p className="font-body-sm text-[12px] text-on-surface-variant/80 m-0">© 2024 Takmir Al-Falah Masjid Management. Serenity in Service.</p>
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
