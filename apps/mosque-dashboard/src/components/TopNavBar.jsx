import React from 'react';
import { Link } from 'react-router-dom';
import { authClient } from '../lib/auth-client';
import { useNotifications } from '../hooks/useNotifications';

const TopNavBar = () => {
  const { data: session } = authClient.useSession();
  const { data: notifications = [] } = useNotifications();
  const unreadCount = notifications.filter(n => !n.isRead).length;
  
  return (
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
          <Link to="/dashboard/notifikasi" className="w-10 h-10 rounded-full flex items-center justify-center text-on-surface-variant hover:text-white hover:bg-surface-variant cursor-pointer transition-colors relative">
            <span className="material-symbols-outlined text-[20px]">notifications</span>
            {unreadCount > 0 && (
              <span className="absolute top-2 right-2 w-2 h-2 bg-error rounded-full border-2 border-background"></span>
            )}
          </Link>
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
  );
};

export default TopNavBar;
