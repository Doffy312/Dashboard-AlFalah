import React from 'react';
import { useAuth } from '../context/AuthContext';

const TopNavBar = () => {
  const { currentUser } = useAuth();
  
  return (
    <header className="hidden md:flex justify-between items-center px-lg ml-[280px] fixed top-0 right-0 w-[calc(100%-280px)] h-16 bg-white/70 dark:bg-on-surface/80 backdrop-blur-xl border-b border-white/40 dark:border-white/10 shadow-sm z-30">
      {/* Search Bar (on_left) */}
      <div className="flex-1 max-w-md">
        <div className="relative flex items-center w-full h-10 rounded-full bg-white/50 border border-white/40 focus-within:border-primary focus-within:shadow-[0_0_0_2px_rgba(0,104,95,0.2)] transition-all">
          <span className="material-symbols-outlined text-on-surface-variant ml-sm mr-xs">search</span>
          <input className="w-full h-full bg-transparent border-none outline-none text-body-sm font-body-sm text-on-surface placeholder-on-surface-variant/70 focus:ring-0 rounded-r-full px-xs" placeholder="Cari data, program, atau jemaah..." type="text"/>
        </div>
      </div>
      
      {/* Trailing Actions & Profile */}
      <div className="flex items-center gap-md">
        <div className="flex items-center gap-xs">
          <button className="w-10 h-10 rounded-full flex items-center justify-center text-on-surface-variant dark:text-outline-variant hover:bg-white/50 dark:hover:bg-white/5 cursor-pointer active:opacity-80 transition-opacity">
            <span className="material-symbols-outlined">notifications</span>
          </button>
          <button className="w-10 h-10 rounded-full flex items-center justify-center text-on-surface-variant dark:text-outline-variant hover:bg-white/50 dark:hover:bg-white/5 cursor-pointer active:opacity-80 transition-opacity">
            <span className="material-symbols-outlined">calendar_month</span>
          </button>
        </div>
        
        <div className="h-8 w-px bg-white/40"></div>
        
        <button className="flex items-center gap-sm cursor-pointer active:opacity-80 transition-opacity p-xs rounded-full hover:bg-white/50">
          <div className="text-right hidden lg:block">
            <p className="font-label-md text-label-md text-on-surface m-0 leading-tight">{currentUser?.name || 'Ahmad Bendahara'}</p>
            <p className="font-body-sm text-[11px] text-on-surface-variant m-0">{currentUser?.role || 'Admin Keuangan'}</p>
          </div>
          <div className="w-9 h-9 rounded-full bg-surface-variant overflow-hidden border border-white/40 flex items-center justify-center shrink-0">
            <span className="material-symbols-outlined text-primary">person</span>
          </div>
        </button>
      </div>
    </header>
  );
};

export default TopNavBar;
