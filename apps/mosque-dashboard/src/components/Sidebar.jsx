import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { authClient } from '../lib/auth-client';
import { useSettings } from '../contexts/SettingsContext';

const Sidebar = () => {
  const { data: session } = authClient.useSession();
  const navigate = useNavigate();
  const { profile } = useSettings();
  
  const menuItems = [
    { name: 'Dashboard', icon: 'dashboard', path: '/dashboard', roles: ['Ketua', 'Sekretaris', 'Bendahara'] },
    { name: 'Keuangan', icon: 'payments', path: '/dashboard/keuangan', roles: ['Ketua', 'Bendahara'] },
    { name: 'Program Kerja', icon: 'view_kanban', path: '/dashboard/program-kerja', roles: ['Ketua', 'Sekretaris', 'Bendahara'] },
    { name: 'Database Jemaah', icon: 'group', path: '/dashboard/jemaah', roles: ['Ketua', 'Sekretaris', 'Bendahara'] },
    { name: 'Inventaris', icon: 'inventory_2', path: '/dashboard/inventaris', roles: ['Ketua', 'Sekretaris', 'Bendahara'] },
    { name: 'Laporan', icon: 'analytics', path: '/dashboard/analisis', roles: ['Ketua'] },
  ];

  const handleLogout = async (e) => {
    e.preventDefault();
    await authClient.signOut();
    navigate('/');
  };
  const userRole = session?.user?.role || 'Ketua';

  return (
    <nav className="hidden md:flex flex-col p-md h-screen fixed left-0 top-0 w-[280px] bg-[#0b131a] border-r border-outline-variant shadow-sm z-40">
      {/* Brand/Header */}
      <div className="flex items-center gap-sm mb-xl px-xs">
        <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center shrink-0 shadow-lg shadow-primary/20">
          <span className="material-symbols-outlined text-white" style={{ fontVariationSettings: "'FILL' 1" }}>mosque</span>
        </div>
        <div>
          <h1 className="text-title-md font-title-md text-primary m-0 leading-tight tracking-tight">{profile.orgName || 'Al-Falah'}</h1>
          <p className="font-body-sm text-[11px] text-on-surface-variant m-0">Mosque Management</p>
        </div>
      </div>
      
      {/* Main Navigation Links */}
      <div className="flex-1 overflow-y-auto w-full mt-sm">
        <ul className="space-y-xs w-full list-none p-0 m-0">
          {menuItems.filter(item => item.roles.includes(userRole)).map((item, index) => (
            <li key={index}>
              <NavLink 
                to={item.path}
                className={({ isActive }) => `flex items-center gap-sm px-sm py-3 font-label-md text-label-md transition-all duration-200 rounded-lg ${isActive ? 'text-primary font-bold bg-primary/10 shadow-[inset_3px_0_0_0_rgba(16,185,129,1)]' : 'text-on-surface-variant hover:text-white hover:bg-surface-variant'}`}
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
      <div className="mt-auto pt-sm border-t border-outline-variant w-full">
        <ul className="space-y-xs w-full list-none p-0 m-0">
          <li>
            <NavLink 
              to="/dashboard/settings" 
              className={({ isActive }) => `flex items-center gap-sm px-sm py-3 transition-all duration-200 rounded-lg ${isActive ? 'text-primary font-bold bg-primary/10 shadow-[inset_3px_0_0_0_rgba(16,185,129,1)]' : 'text-on-surface-variant hover:text-white hover:bg-surface-variant'}`}
            >
              <span className="material-symbols-outlined">settings</span>
              <span className="font-label-md text-label-md">Settings</span>
            </NavLink>
          </li>
          <li>
            <button onClick={handleLogout} className="flex items-center gap-sm px-sm py-3 text-error hover:text-white hover:bg-error/20 transition-all duration-200 rounded-lg w-full text-left">
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
