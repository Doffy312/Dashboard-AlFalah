import { useState } from 'react';
import { NavLink, useNavigate, useLocation } from 'react-router-dom';
import { authClient } from '../lib/auth-client';
import { useSettings } from '../contexts/SettingsContext';

const Sidebar = () => {
  const { data: session } = authClient.useSession();
  const navigate = useNavigate();
  const location = useLocation();
  const { profile } = useSettings();
  const [showMore, setShowMore] = useState(false);
  
  const menuItems = [
    { name: 'Dashboard', icon: 'dashboard', path: '/dashboard', roles: ['Ketua', 'Sekretaris', 'Bendahara', 'Pengurus'] },
    { name: 'Keuangan', icon: 'payments', path: '/dashboard/keuangan', roles: ['Ketua', 'Sekretaris', 'Bendahara', 'Pengurus'] },
    { name: 'Program Kerja', icon: 'view_kanban', path: '/dashboard/program-kerja', roles: ['Ketua', 'Sekretaris', 'Bendahara', 'Pengurus'] },
    { name: 'Database Jemaah', icon: 'group', path: '/dashboard/jemaah', roles: ['Ketua', 'Sekretaris', 'Bendahara', 'Pengurus'] },
    { name: 'Inventaris', icon: 'inventory_2', path: '/dashboard/inventaris', roles: ['Ketua', 'Sekretaris', 'Bendahara', 'Pengurus'] },
    { name: 'ZISWAF', icon: 'volunteer_activism', path: '/dashboard/ziswaf', roles: ['Ketua', 'Bendahara', 'Pengurus'] },
    { name: 'Qurban', icon: 'cruelty_free', path: '/dashboard/qurban', roles: ['Ketua', 'Sekretaris', 'Bendahara', 'Pengurus'] },
    { name: 'Jadwal Petugas', icon: 'event_note', path: '/dashboard/jadwal', roles: ['Ketua', 'Sekretaris', 'Pengurus'] },
    { name: 'Laporan', icon: 'analytics', path: '/dashboard/analisis', roles: ['Ketua', 'Sekretaris', 'Bendahara', 'Pengurus'] },
  ];

  const handleLogout = async (e) => {
    e.preventDefault();
    await authClient.signOut();
    navigate('/');
  };
  const userRole = session?.user?.role || 'Ketua';
  const filteredMenuItems = menuItems.filter(item => item.roles.includes(userRole));

  // Mobile bottom nav: first 4 items + "More"
  const mobileMainItems = filteredMenuItems.slice(0, 4);
  const mobileMoreItems = filteredMenuItems.slice(4);

  // Check if current path matches for mobile nav active state
  const isPathActive = (path) => {
    if (path === '/dashboard') return location.pathname === '/dashboard';
    return location.pathname.startsWith(path);
  };

  // Check if any "more" item is active
  const isMoreActive = mobileMoreItems.some(item => isPathActive(item.path)) ||
    ['/dashboard/notifikasi', '/dashboard/settings'].some(p => location.pathname.startsWith(p));

  return (
    <>
      {/* ===== DESKTOP SIDEBAR (hidden on mobile, visible md+) ===== */}
      <nav className="hidden md:flex flex-col p-md h-screen fixed left-0 top-0 w-[280px] bg-[#0b131a] border-r border-outline-variant shadow-sm z-40">
        {/* Brand/Header */}
        <div className="flex items-center gap-sm mb-xl px-xs">
          <div className="w-10 h-10 rounded-full bg-primary/20 border border-primary/30 flex items-center justify-center shrink-0 overflow-hidden shadow-lg shadow-primary/20">
            {profile.logo ? (
              <img src={profile.logo} alt="Logo" className="w-full h-full object-cover" />
            ) : (
              <span className="material-symbols-outlined text-primary" style={{ fontVariationSettings: "'FILL' 1" }}>mosque</span>
            )}
          </div>
          <div className="overflow-hidden">
            <h1 className="text-title-md font-title-md text-primary m-0 leading-tight tracking-tight truncate">{profile.orgName || 'Al-Falah'}</h1>
            <p className="font-body-sm text-[11px] text-on-surface-variant m-0">Mosque Management</p>
          </div>
        </div>
        
        {/* Main Navigation Links */}
        <div className="flex-1 overflow-y-auto w-full mt-sm">
          <ul className="space-y-xs w-full list-none p-0 m-0">
            {filteredMenuItems.map((item, index) => (
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
            {userRole === 'Ketua' && (
              <li>
                <NavLink 
                  to="/dashboard/settings" 
                  className={({ isActive }) => `flex items-center gap-sm px-sm py-3 transition-all duration-200 rounded-lg ${isActive ? 'text-primary font-bold bg-primary/10 shadow-[inset_3px_0_0_0_rgba(16,185,129,1)]' : 'text-on-surface-variant hover:text-white hover:bg-surface-variant'}`}
                >
                  <span className="material-symbols-outlined">settings</span>
                  <span className="font-label-md text-label-md">Settings</span>
                </NavLink>
              </li>
            )}
            <li>
              <button onClick={handleLogout} className="flex items-center gap-sm px-sm py-3 text-error hover:text-white hover:bg-error/20 transition-all duration-200 rounded-lg w-full text-left">
                <span className="material-symbols-outlined">logout</span>
                <span className="font-label-md text-label-md">Keluar</span>
              </button>
            </li>
          </ul>
        </div>
      </nav>

      {/* ===== MOBILE BOTTOM NAVIGATION (visible < md) ===== */}
      <nav className="mobile-bottom-nav md:hidden">
        <div className="mobile-bottom-nav-inner">
          {mobileMainItems.map((item) => {
            const active = isPathActive(item.path);
            return (
              <NavLink
                key={item.path}
                to={item.path}
                end={item.path === '/dashboard'}
                className={`mobile-nav-item ${active ? 'active' : ''}`}
              >
                <span 
                  className="material-symbols-outlined nav-icon" 
                  style={active ? { fontVariationSettings: "'FILL' 1" } : {}}
                >
                  {item.icon}
                </span>
                <span className="nav-label">{item.name === 'Database Jemaah' ? 'Jemaah' : item.name.split(' ')[0]}</span>
              </NavLink>
            );
          })}
          
          {/* More Button */}
          <button
            onClick={() => setShowMore(true)}
            className={`mobile-nav-item ${isMoreActive ? 'active' : ''}`}
          >
            <span className="material-symbols-outlined nav-icon">more_horiz</span>
            <span className="nav-label">Lainnya</span>
          </button>
        </div>
      </nav>

      {/* ===== MOBILE "MORE" BOTTOM SHEET ===== */}
      <div 
        className={`more-menu-overlay md:hidden ${showMore ? 'open' : ''}`}
        onClick={() => setShowMore(false)}
      >
        <div className="more-menu-sheet" onClick={(e) => e.stopPropagation()}>
          <div className="more-menu-handle"></div>
          
          {mobileMoreItems.map((item) => {
            const active = isPathActive(item.path);
            return (
              <NavLink
                key={item.path}
                to={item.path}
                onClick={() => setShowMore(false)}
                className={`more-menu-item ${active ? 'active' : ''}`}
              >
                <span 
                  className="material-symbols-outlined" 
                  style={active ? { fontVariationSettings: "'FILL' 1" } : {}}
                >
                  {item.icon}
                </span>
                {item.name}
              </NavLink>
            );
          })}

          {/* Additional mobile-only links */}
          <NavLink
            to="/dashboard/notifikasi"
            onClick={() => setShowMore(false)}
            className={`more-menu-item ${isPathActive('/dashboard/notifikasi') ? 'active' : ''}`}
          >
            <span 
              className="material-symbols-outlined" 
              style={isPathActive('/dashboard/notifikasi') ? { fontVariationSettings: "'FILL' 1" } : {}}
            >
              notifications
            </span>
            Notifikasi
          </NavLink>

          {userRole === 'Ketua' && (
            <NavLink
              to="/dashboard/settings"
              onClick={() => setShowMore(false)}
              className={`more-menu-item ${isPathActive('/dashboard/settings') ? 'active' : ''}`}
            >
              <span 
                className="material-symbols-outlined" 
                style={isPathActive('/dashboard/settings') ? { fontVariationSettings: "'FILL' 1" } : {}}
              >
                settings
              </span>
              Settings
            </NavLink>
          )}

          <div className="border-t border-outline-variant/30 my-1"></div>

          <button
            onClick={(e) => { setShowMore(false); handleLogout(e); }}
            className="more-menu-item danger"
          >
            <span className="material-symbols-outlined">logout</span>
            Keluar
          </button>
        </div>
      </div>
    </>
  );
};

export default Sidebar;
