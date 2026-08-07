import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Sidebar = () => {
  const { logout, currentUser } = useAuth();
  const navigate = useNavigate();
  
  const menuItems = [
    { name: 'Dashboard', icon: 'dashboard', path: '/dashboard', roles: ['Ketua', 'Sekretaris', 'Bendahara'] },
    { name: 'Keuangan', icon: 'payments', path: '/dashboard/keuangan', roles: ['Ketua', 'Bendahara'] },
    { name: 'Program Kerja', icon: 'view_kanban', path: '/dashboard/program-kerja', roles: ['Ketua', 'Sekretaris', 'Bendahara'] },
    { name: 'Database Jemaah', icon: 'group', path: '/dashboard/jemaah', roles: ['Ketua', 'Sekretaris', 'Bendahara'] },
    { name: 'Inventaris', icon: 'inventory_2', path: '/dashboard/inventaris', roles: ['Ketua', 'Sekretaris', 'Bendahara'] },
    { name: 'Laporan', icon: 'analytics', path: '/dashboard/analisis', roles: ['Ketua'] },
  ];

  const handleLogout = (e) => {
    e.preventDefault();
    logout();
    navigate('/');
  };
  const userRole = currentUser?.role || 'Ketua';

  return (
    <nav className="hidden md:flex flex-col p-md h-screen fixed left-0 top-0 w-[280px] bg-white/70 dark:bg-on-surface/80 backdrop-blur-xl border-r border-white/40 dark:border-white/10 shadow-sm z-40">
      {/* Brand/Header */}
      <div className="flex items-center gap-sm mb-xl px-xs">
        <div className="w-10 h-10 rounded-full bg-primary-container flex items-center justify-center shrink-0">
          <span className="material-symbols-outlined text-on-primary-container" style={{ fontVariationSettings: "'FILL' 1" }}>mosque</span>
        </div>
        <div>
          <h1 className="text-title-md font-title-md text-primary dark:text-primary-fixed m-0 leading-tight">Takmir Al-Falah</h1>
          <p className="font-body-sm text-body-sm text-on-surface-variant m-0">Masjid Management</p>
        </div>
      </div>
      
      {/* CTA */}
      <button className="mb-lg w-full py-sm px-md rounded-lg bg-primary text-on-primary font-label-md text-label-md hover:bg-primary/90 transition-all shadow-md active:scale-95 flex items-center justify-center gap-xs">
        <span className="material-symbols-outlined text-[18px]">add</span>
        Tambah Program
      </button>
      
      {/* Main Navigation Links */}
      <div className="flex-1 overflow-y-auto w-full">
        <ul className="space-y-xs w-full list-none p-0 m-0">
          {menuItems.filter(item => item.roles.includes(userRole)).map((item, index) => (
            <li key={index}>
              <NavLink 
                to={item.path}
                className={({ isActive }) => `flex items-center gap-sm px-sm py-xs font-label-md text-label-md transition-all duration-200 rounded-lg scale-[0.98] active:scale-95 ${isActive ? 'text-primary dark:text-primary-fixed font-bold bg-primary/10 dark:bg-primary-fixed/10' : 'text-on-surface-variant dark:text-outline-variant hover:text-primary dark:hover:text-primary-fixed hover:bg-white/50 dark:hover:bg-white/5'}`}
                end={item.path === '/dashboard'}
              >
                {({ isActive }) => (
                  <>
                    <span className="material-symbols-outlined" style={isActive ? { fontVariationSettings: "'FILL' 1" } : {}}>{item.icon}</span>
                    <span>{item.name}</span>
                  </>
                )}
              </NavLink>
            </li>
          ))}
        </ul>
      </div>
      
      {/* Footer Navigation Links */}
      <div className="mt-auto pt-sm border-t border-white/40 w-full">
        <ul className="space-y-xs w-full list-none p-0 m-0">
          <li>
            <a href="#" className="flex items-center gap-sm px-sm py-xs text-on-surface-variant dark:text-outline-variant hover:text-primary dark:hover:text-primary-fixed hover:bg-white/50 dark:hover:bg-white/5 transition-all duration-200 rounded-lg scale-[0.98] active:scale-95">
              <span className="material-symbols-outlined">settings</span>
              <span className="font-label-md text-label-md">Pengaturan</span>
            </a>
          </li>
          <li>
            <button onClick={handleLogout} className="flex items-center gap-sm px-sm py-xs text-on-surface-variant dark:text-outline-variant hover:text-primary dark:hover:text-primary-fixed hover:bg-white/50 dark:hover:bg-white/5 transition-all duration-200 rounded-lg scale-[0.98] active:scale-95 w-full text-left">
              <span className="material-symbols-outlined">logout</span>
              <span className="font-label-md text-label-md">Keluar</span>
            </button>
          </li>
        </ul>
      </div>
    </nav>
  );
};

export default Sidebar;
