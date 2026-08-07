import { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useNotifications, useMarkNotificationAsRead, useMarkAllNotificationsAsRead } from '../hooks/useNotifications';
import { formatDistanceToNow } from 'date-fns';
import { id as localeId } from 'date-fns/locale';
import { useSettings } from '../contexts/SettingsContext';

// Map notification type to dashboard route
const NOTIFICATION_TYPE_ROUTES = {
  'Keuangan': '/dashboard/keuangan',
  'Kegiatan': '/dashboard/program-kerja',
  'Program': '/dashboard/program-kerja',
  'Inventaris': '/dashboard/inventaris',
  'Jemaah': '/dashboard/jemaah',
};

const TopNavBar = () => {
  const { data: notifications = [] } = useNotifications();
  const markAsReadMutation = useMarkNotificationAsRead();
  const markAllMutation = useMarkAllNotificationsAsRead();
  const navigate = useNavigate();
  const { profile } = useSettings();

  const [showDropdown, setShowDropdown] = useState(false);
  const [showMobileNotif, setShowMobileNotif] = useState(false);
  const dropdownRef = useRef(null);
  const mobileDropdownRef = useRef(null);

  const unreadCount = notifications.filter(n => !n.isRead).length;

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setShowDropdown(false);
      }
      if (mobileDropdownRef.current && !mobileDropdownRef.current.contains(e.target)) {
        setShowMobileNotif(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
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

  // Shared notification dropdown panel
  const NotificationPanel = ({ onClose }) => (
    <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-[#0f1923] border border-outline-variant rounded-xl shadow-2xl overflow-hidden z-50">
      {/* Header */}
      <div className="px-4 py-3 border-b border-outline-variant flex justify-between items-center bg-surface-variant/20">
        <h3 className="font-label-md text-white text-sm flex items-center gap-2">
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
                        !notif.isRead ? 'text-primary font-bold' : 'text-white'
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

  return (
    <>
      {/* ===== MOBILE HEADER (visible < md) ===== */}
      <header className="mobile-header md:hidden">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-full bg-primary/20 border border-primary/30 flex items-center justify-center shrink-0 overflow-hidden shadow-lg shadow-primary/20">
            {profile.logo ? (
              <img src={profile.logo} alt="Logo" className="w-full h-full object-cover" />
            ) : (
              <span className="material-symbols-outlined text-primary text-[16px]" style={{ fontVariationSettings: "'FILL' 1" }}>mosque</span>
            )}
          </div>
          <span className="text-sm font-bold text-primary tracking-tight truncate max-w-[150px]">{profile.orgName || 'Al-Falah'}</span>
        </div>
        
        <div className="flex items-center gap-1">
          {/* Mobile Notification */}
          <div className="relative" ref={mobileDropdownRef}>
            <button
              onClick={() => setShowMobileNotif(!showMobileNotif)}
              className="w-10 h-10 rounded-full flex items-center justify-center text-on-surface-variant hover:text-white hover:bg-surface-variant cursor-pointer transition-colors relative"
            >
              <span className="material-symbols-outlined text-[20px]">notifications</span>
              {unreadCount > 0 && (
                <span className="absolute top-1 right-1 min-w-[16px] h-[16px] bg-error text-white rounded-full text-[9px] font-bold flex items-center justify-center px-1 border-2 border-[#0b131a]">
                  {unreadCount > 9 ? '9+' : unreadCount}
                </span>
              )}
            </button>
            {showMobileNotif && <NotificationPanel onClose={() => setShowMobileNotif(false)} />}
          </div>

          {/* Profile */}
          <button className="w-9 h-9 rounded-full bg-surface-variant overflow-hidden flex items-center justify-center shrink-0">
            <span className="material-symbols-outlined text-primary text-[18px]">person</span>
          </button>
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
                onClick={() => setShowDropdown(!showDropdown)}
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
              {showDropdown && <NotificationPanel onClose={() => setShowDropdown(false)} />}
            </div>

            <button className="w-10 h-10 rounded-full flex items-center justify-center text-on-surface-variant hover:text-white hover:bg-surface-variant cursor-pointer transition-colors">
              <span className="material-symbols-outlined text-[20px]">help</span>
            </button>
          </div>
          
          <div className="h-8 w-px bg-outline-variant mx-1"></div>
          
          <button className="flex items-center gap-sm cursor-pointer p-xs rounded-full hover:bg-surface-variant transition-colors">
            <div className="w-9 h-9 rounded-full bg-surface-variant overflow-hidden flex items-center justify-center shrink-0">
              <span className="material-symbols-outlined text-primary">person</span>
            </div>
          </button>
        </div>
      </header>
    </>
  );
};

export default TopNavBar;


