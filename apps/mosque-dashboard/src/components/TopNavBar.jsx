import { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useNotifications, useMarkNotificationAsRead, useMarkAllNotificationsAsRead } from '../hooks/useNotifications';
import { formatDistanceToNow } from 'date-fns';
import { id as localeId } from 'date-fns/locale';
import { useSettings } from '../contexts/SettingsContext';
import { authClient } from '../lib/auth-client';

// Map notification type to dashboard route
const NOTIFICATION_TYPE_ROUTES = {
  'Keuangan': '/dashboard/keuangan',
  'Kegiatan': '/dashboard/program-kerja',
  'Program': '/dashboard/program-kerja',
  'Inventaris': '/dashboard/inventaris',
  'Jemaah': '/dashboard/jemaah',
  'Donasi': '/dashboard/ziswaf',
};

const TopNavBar = () => {
  const { data: notifications = [] } = useNotifications();
  const markAsReadMutation = useMarkNotificationAsRead();
  const markAllMutation = useMarkAllNotificationsAsRead();
  const navigate = useNavigate();
  const { profile } = useSettings();
  const { data: session } = authClient.useSession();

  const [showDropdown, setShowDropdown] = useState(false);
  const [showMobileNotif, setShowMobileNotif] = useState(false);
  const [showProfileDropdown, setShowProfileDropdown] = useState(false);
  const [showMobileProfile, setShowMobileProfile] = useState(false);

  const dropdownRef = useRef(null);
  const mobileDropdownRef = useRef(null);
  const profileDropdownRef = useRef(null);
  const mobileProfileDropdownRef = useRef(null);

  const unreadCount = notifications.filter(n => !n.isRead).length;

  // Close dropdowns when clicking outside or pressing Escape
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setShowDropdown(false);
      }
      if (mobileDropdownRef.current && !mobileDropdownRef.current.contains(e.target)) {
        setShowMobileNotif(false);
      }
      if (profileDropdownRef.current && !profileDropdownRef.current.contains(e.target)) {
        setShowProfileDropdown(false);
      }
      if (mobileProfileDropdownRef.current && !mobileProfileDropdownRef.current.contains(e.target)) {
        setShowMobileProfile(false);
      }
    };

    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        setShowDropdown(false);
        setShowMobileNotif(false);
        setShowProfileDropdown(false);
        setShowMobileProfile(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  const handleNotificationClick = (notif) => {
    // Mark as read
    if (!notif.isRead) {
      markAsReadMutation.mutate(notif.id);
    }
    setShowDropdown(false);
    setShowMobileNotif(false);

    // Navigate to the relevant page
    const route = NOTIFICATION_TYPE_ROUTES[notif.type];
    if (route) {
      navigate(route);
    } else {
      navigate('/dashboard/notifikasi');
    }
  };

  const handleMarkAllRead = (e) => {
    e.stopPropagation();
    markAllMutation.mutate();
  };

  const recentNotifications = notifications.slice(0, 8);

  // Shared notification dropdown panel helper
  const renderNotificationPanel = (onClose) => (
    <div className="fixed left-4 right-4 top-[56px] md:absolute md:left-auto md:right-0 md:top-full md:mt-2 w-auto md:w-96 max-w-sm sm:max-w-none bg-surface border border-outline-variant rounded-xl shadow-2xl overflow-hidden z-50">
      {/* Header */}
      <div className="px-4 py-3 border-b border-outline-variant flex justify-between items-center bg-surface-variant/20">
        <h3 className="font-label-md text-on-surface text-sm flex items-center gap-2">
          <span className="material-symbols-outlined text-primary text-[18px]">notifications</span>
          Notifikasi
          {unreadCount > 0 && (
            <span className="ml-1 px-1.5 py-0.5 rounded-full bg-error text-white text-[10px] font-bold">
              {unreadCount}
            </span>
          )}
        </h3>
        {unreadCount > 0 && (
          <button 
            onClick={handleMarkAllRead}
            className="text-[11px] text-primary hover:underline font-label-sm cursor-pointer transition-colors"
          >
            Tandai semua dibaca
          </button>
        )}
      </div>

      {/* Notification List */}
      <div className="max-h-[400px] overflow-y-auto">
        {recentNotifications.length > 0 ? (
          recentNotifications.map(notif => {
            const timeAgo = formatDistanceToNow(new Date(notif.createdAt), { addSuffix: true, locale: localeId });
            return (
              <div
                key={notif.id}
                onClick={() => handleNotificationClick(notif)}
                className={`px-4 py-3 border-b border-outline-variant/30 hover:bg-surface-variant/40 cursor-pointer transition-colors ${
                  !notif.isRead ? 'bg-primary/5' : ''
                }`}
              >
                <div className="flex justify-between items-start gap-2">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-0.5">
                      {!notif.isRead && (
                        <span className="w-2 h-2 rounded-full bg-primary shrink-0"></span>
                      )}
                      <span className={`text-[13px] font-label-md truncate ${
                        !notif.isRead ? 'text-primary font-bold' : 'text-on-surface'
                      }`}>
                        {notif.title}
                      </span>
                    </div>
                    <p className="text-[12px] text-on-surface-variant line-clamp-2 m-0 pl-4">
                      {notif.description}
                    </p>
                  </div>
                  <span className="text-[10px] text-on-surface-variant/70 whitespace-nowrap shrink-0 mt-0.5">
                    {timeAgo}
                  </span>
                </div>
              </div>
            );
          })
        ) : (
          <div className="py-8 text-center text-on-surface-variant text-sm flex flex-col items-center gap-2">
            <span className="material-symbols-outlined text-[32px] opacity-30">notifications_off</span>
            Belum ada notifikasi.
          </div>
        )}
      </div>

      {/* Footer */}
      {notifications.length > 0 && (
        <div className="px-4 py-2.5 border-t border-outline-variant bg-surface-variant/10 text-center">
          <Link
            to="/dashboard/notifikasi"
            onClick={() => { setShowDropdown(false); setShowMobileNotif(false); onClose?.(); }}
            className="text-[12px] text-primary hover:underline font-label-md transition-colors"
          >
            Lihat Semua Notifikasi →
          </Link>
        </div>
      )}
    </div>
  );

  // Shared Profile Dropdown Panel helper
  const renderProfilePanel = (onClose) => {
    const user = session?.user;
    const userName = user?.name || 'Administrator';
    const userEmail = user?.email || 'admin@masjid-alfalah.or.id';
    const userRole = user?.role || 'Ketua';
    const userAvatar = user?.image;
    const initial = userName.charAt(0).toUpperCase();

    const handleLogout = async () => {
      onClose?.();
      await authClient.signOut();
      navigate('/login');
    };

    return (
      <div className="fixed left-4 right-4 top-[56px] md:absolute md:left-auto md:right-0 md:top-full md:mt-2 w-auto md:w-96 bg-surface border border-outline-variant rounded-2xl shadow-2xl overflow-hidden z-50 animate-in fade-in zoom-in-95 duration-150">
        {/* Header Avatar & Summary */}
        <div className="p-4 bg-gradient-to-b from-primary/10 via-surface-variant/30 to-transparent border-b border-outline-variant/40">
          <div className="flex items-center gap-3.5">
            <div className="relative shrink-0">
              <div className="w-14 h-14 rounded-full bg-surface border-2 border-primary/40 flex items-center justify-center overflow-hidden shadow-md shadow-primary/20">
                {userAvatar ? (
                  <img src={userAvatar} alt={userName} className="w-full h-full object-cover" />
                ) : (
                  <span className="text-xl font-bold text-primary">{initial}</span>
                )}
              </div>
              <span className="absolute bottom-0 right-0 w-3.5 h-3.5 bg-emerald-500 border-2 border-surface rounded-full" title="Status: Aktif"></span>
            </div>
            <div className="flex-1 min-w-0">
              <h4 className="font-title-md text-on-surface text-base font-bold truncate leading-tight">{userName}</h4>
              <p className="text-xs text-on-surface-variant/80 truncate mb-1.5">{userEmail}</p>
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-primary/15 text-primary border border-primary/30">
                <span className="w-1.5 h-1.5 rounded-full bg-primary mr-1.5"></span>
                {userRole}
              </span>
            </div>
          </div>
        </div>

        {/* Detailed Account Information */}
        <div className="p-4 space-y-2.5 bg-surface/20">
          <p className="text-[11px] font-bold text-on-surface-variant/60 uppercase tracking-wider mb-1">Informasi Akun</p>
          
          <div className="flex items-center justify-between py-2 px-3 rounded-xl bg-surface-variant/30 border border-outline-variant/30">
            <div className="flex items-center gap-2 text-xs text-on-surface-variant">
              <span className="material-symbols-outlined text-[16px] text-primary">person</span>
              <span>Nama Lengkap</span>
            </div>
            <span className="text-xs font-semibold text-on-surface truncate max-w-[130px]">{userName}</span>
          </div>

          <div className="flex items-center justify-between py-2 px-3 rounded-xl bg-surface-variant/30 border border-outline-variant/30">
            <div className="flex items-center gap-2 text-xs text-on-surface-variant">
              <span className="material-symbols-outlined text-[16px] text-primary">mail</span>
              <span>Email</span>
            </div>
            <span className="text-xs font-semibold text-on-surface truncate max-w-[140px]" title={userEmail}>{userEmail}</span>
          </div>

          <div className="flex items-center justify-between py-2 px-3 rounded-xl bg-surface-variant/30 border border-outline-variant/30">
            <div className="flex items-center gap-2 text-xs text-on-surface-variant">
              <span className="material-symbols-outlined text-[16px] text-primary">badge</span>
              <span>Role / Peran</span>
            </div>
            <span className="text-xs font-bold text-primary">{userRole}</span>
          </div>

          <div className="flex items-center justify-between py-2 px-3 rounded-xl bg-surface-variant/30 border border-outline-variant/30">
            <div className="flex items-center gap-2 text-xs text-on-surface-variant">
              <span className="material-symbols-outlined text-[16px] text-emerald-400">check_circle</span>
              <span>Status Akun</span>
            </div>
            <span className="text-xs font-semibold text-emerald-400 flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
              Aktif
            </span>
          </div>
        </div>

        {/* Logout Action */}
        <div className="p-2 border-t border-outline-variant/40 bg-surface-variant/10">
          <button
            onClick={handleLogout}
            className="flex items-center gap-2.5 px-3 py-2.5 text-xs text-error hover:bg-error/15 rounded-xl transition-colors w-full text-left font-semibold cursor-pointer"
          >
            <span className="material-symbols-outlined text-[18px]">logout</span>
            <span>Keluar dari Akun</span>
          </button>
        </div>
      </div>
    );
  };

  return (
    <>
      {/* ===== MOBILE HEADER (visible < md) ===== */}
      <header className="mobile-header md:hidden">
        <div className="flex items-center gap-2 min-w-0 flex-1 mr-2">
          <div className="w-8 h-8 rounded-full bg-primary/20 border border-primary/30 flex items-center justify-center shrink-0 overflow-hidden shadow-lg shadow-primary/20">
            {profile.logo ? (
              <img src={profile.logo} alt="Logo" className="w-full h-full object-cover" />
            ) : (
              <span className="material-symbols-outlined text-primary text-[16px]" style={{ fontVariationSettings: "'FILL' 1" }}>mosque</span>
            )}
          </div>
          <span className="text-sm font-bold text-primary tracking-tight truncate max-w-[200px] xs:max-w-[260px]" title={profile.orgName || 'Masjid Al-Falah'}>{profile.orgName || 'Masjid Al-Falah'}</span>
        </div>
        
        <div className="flex items-center gap-1">
          {/* Mobile Notification */}
          <div className="relative" ref={mobileDropdownRef}>
            <button
              onClick={() => {
                setShowMobileNotif(!showMobileNotif);
                setShowMobileProfile(false);
              }}
              className="w-10 h-10 rounded-full flex items-center justify-center text-on-surface-variant hover:text-white hover:bg-surface-variant cursor-pointer transition-colors relative"
            >
              <span className="material-symbols-outlined text-[20px]">notifications</span>
              {unreadCount > 0 && (
                <span className="absolute top-1 right-1 min-w-[16px] h-[16px] bg-error text-white rounded-full text-[9px] font-bold flex items-center justify-center px-1 border-2 border-background">
                  {unreadCount > 9 ? '9+' : unreadCount}
                </span>
              )}
            </button>
            {showMobileNotif && renderNotificationPanel(() => setShowMobileNotif(false))}
          </div>

          {/* Profile Mobile */}
          <div className="relative" ref={mobileProfileDropdownRef}>
            <button
              onClick={() => {
                setShowMobileProfile(!showMobileProfile);
                setShowMobileNotif(false);
              }}
              className={`w-9 h-9 rounded-full bg-surface-variant border border-outline-variant overflow-hidden flex items-center justify-center shrink-0 transition-all ${
                showMobileProfile ? 'ring-2 ring-primary' : ''
              }`}
              title="Profil Saya"
            >
              {session?.user?.image ? (
                <img src={session.user.image} alt="User Avatar" className="w-full h-full object-cover" />
              ) : session?.user?.name ? (
                <span className="font-bold text-primary text-xs">{session.user.name.charAt(0).toUpperCase()}</span>
              ) : (
                <span className="material-symbols-outlined text-primary text-[18px]">person</span>
              )}
            </button>
            {showMobileProfile && renderProfilePanel(() => setShowMobileProfile(false))}
          </div>
        </div>
      </header>

      {/* ===== DESKTOP TOP NAV BAR (visible >= md) ===== */}
      <header className="hidden md:flex justify-between items-center px-lg ml-[280px] fixed top-0 right-0 w-[calc(100%-280px)] h-20 bg-background/80 backdrop-blur-xl border-b border-outline-variant shadow-sm z-30">
        {/* Search Bar */}
        <div className="flex-1 max-w-md">
          <div className="relative flex items-center w-full h-11 rounded-xl bg-surface border border-outline-variant focus-within:border-primary focus-within:ring-1 focus-within:ring-primary transition-all">
            <span className="material-symbols-outlined text-on-surface-variant ml-sm mr-xs text-[20px]">search</span>
            <input 
              className="w-full h-full bg-transparent border-none outline-none text-body-sm font-body-sm text-on-surface placeholder-on-surface-variant focus:ring-0 px-xs" 
              placeholder="Search..." 
              type="text"
              name="search"
              id="search"
              autoComplete="off"
              data-lpignore="true"
              data-form-type="other"
            />
          </div>
        </div>
        
        {/* Actions & Profile */}
        <div className="flex items-center gap-md">
          <div className="flex items-center gap-sm">
            {/* Notification Dropdown */}
            <div className="relative" ref={dropdownRef}>
              <button
                onClick={() => {
                  setShowDropdown(!showDropdown);
                  setShowProfileDropdown(false);
                }}
                className="w-10 h-10 rounded-full flex items-center justify-center text-on-surface-variant hover:text-white hover:bg-surface-variant cursor-pointer transition-colors relative"
              >
                <span className="material-symbols-outlined text-[20px]">notifications</span>
                {unreadCount > 0 && (
                  <span className="absolute top-1 right-1 min-w-[18px] h-[18px] bg-error text-white rounded-full text-[10px] font-bold flex items-center justify-center px-1 border-2 border-background">
                    {unreadCount > 9 ? '9+' : unreadCount}
                  </span>
                )}
              </button>

              {/* Dropdown Panel */}
              {showDropdown && renderNotificationPanel(() => setShowDropdown(false))}
            </div>

            <button className="w-10 h-10 rounded-full flex items-center justify-center text-on-surface-variant hover:text-white hover:bg-surface-variant cursor-pointer transition-colors">
              <span className="material-symbols-outlined text-[20px]">help</span>
            </button>
          </div>
          
          <div className="h-8 w-px bg-outline-variant mx-1"></div>
          
          {/* Profile Dropdown Desktop */}
          <div className="relative" ref={profileDropdownRef}>
            <button
              onClick={() => {
                setShowProfileDropdown(!showProfileDropdown);
                setShowDropdown(false);
              }}
              className={`flex items-center gap-2 cursor-pointer p-1 rounded-full transition-all duration-200 ${
                showProfileDropdown ? 'ring-2 ring-primary bg-surface-variant' : 'hover:bg-surface-variant'
              }`}
              title="Profil Saya"
            >
              <div className="w-9 h-9 rounded-full bg-surface-variant border border-outline-variant overflow-hidden flex items-center justify-center shrink-0">
                {session?.user?.image ? (
                  <img src={session.user.image} alt="User Avatar" className="w-full h-full object-cover" />
                ) : session?.user?.name ? (
                  <span className="font-bold text-primary text-sm">{session.user.name.charAt(0).toUpperCase()}</span>
                ) : (
                  <span className="material-symbols-outlined text-primary text-[20px]">person</span>
                )}
              </div>
            </button>

            {showProfileDropdown && renderProfilePanel(() => setShowProfileDropdown(false))}
          </div>
        </div>
      </header>
    </>
  );
};

export default TopNavBar;



