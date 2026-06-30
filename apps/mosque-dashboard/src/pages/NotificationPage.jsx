import React, { useState } from 'react';
import { Bell, Wallet, Calendar, Package, Check, CheckCheck } from 'lucide-react';

import { formatDistanceToNow } from 'date-fns';
import { id as localeId } from 'date-fns/locale';
import { useNotifications, useMarkNotificationAsRead, useMarkAllNotificationsAsRead } from '../hooks/useNotifications';

const NotificationPage = () => {
  const { data: notifications = [] } = useNotifications();
  const markAsReadMutation = useMarkNotificationAsRead();
  const markAllAsReadMutation = useMarkAllNotificationsAsRead();
  
  const [activeTab, setActiveTab] = useState('Semua');

  const tabs = ['Semua', 'Keuangan', 'Kegiatan', 'Inventaris'];

  const filteredNotifications = notifications.filter(n => {
    if (activeTab === 'Semua') return true;
    return n.type === activeTab;
  });

  const markAsRead = (id) => {
    markAsReadMutation.mutate(id);
  };

  const markAllAsRead = () => {
    markAllAsReadMutation.mutate();
  };

  const getIconAndColor = (type) => {
    if (type === 'Keuangan') return { icon: Wallet, colorClass: 'text-emerald-500 bg-emerald-500/10' };
    if (type === 'Kegiatan') return { icon: Calendar, colorClass: 'text-blue-500 bg-blue-500/10' };
    if (type === 'Inventaris') return { icon: Package, colorClass: 'text-amber-500 bg-amber-500/10' };
    return { icon: Bell, colorClass: 'text-gray-500 bg-gray-500/10' };
  };

  const unreadCount = notifications.filter(n => !n.isRead).length;

  return (
    <div className="flex flex-col gap-xl">
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-display-sm font-display-sm text-on-surface dark:text-white m-0 flex items-center gap-3">
            <Bell size={36} className="text-primary" />
            Pusat Notifikasi
          </h1>
          <p className="font-body-md text-on-surface-variant dark:text-white/70 m-0 mt-xs">
            Kelola pemberitahuan dan aktivitas terbaru masjid.
          </p>
        </div>
        {unreadCount > 0 && (
          <button 
            onClick={markAllAsRead}
            className="hidden sm:flex py-2 px-4 rounded-full bg-surface-variant text-on-surface hover:bg-surface-variant/80 transition-all items-center gap-2 border border-outline/30 cursor-pointer"
          >
            <CheckCheck size={18} />
            <span className="font-label-md">Tandai Semua Dibaca</span>
          </button>
        )}
      </div>

      <div className="flex gap-2 mb-2 border-b border-outline-variant/30 pb-2 overflow-x-auto hide-scrollbar">
        {tabs.map(tab => (
          <button 
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-6 py-2 rounded-t-lg border-b-2 font-label-md text-[14px] font-semibold leading-[20px] transition-all whitespace-nowrap cursor-pointer ${
              activeTab === tab 
                ? 'border-primary text-primary bg-surface-variant backdrop-blur-sm' 
                : 'border-transparent text-on-surface-variant hover:text-primary hover:bg-surface-variant'
            }`}
          >
            {tab}
            {tab === 'Semua' && unreadCount > 0 && (
              <span className="ml-2 inline-flex items-center justify-center px-2 py-0.5 rounded-full bg-error text-white text-[10px]">
                {unreadCount}
              </span>
            )}
          </button>
        ))}
      </div>

      <div className="flex flex-col gap-3">
        {filteredNotifications.length === 0 ? (
          <div className="py-12 text-center text-on-surface-variant flex flex-col items-center gap-3">
            <Bell size={48} className="opacity-20" />
            <p>Tidak ada notifikasi untuk kategori ini.</p>
          </div>
        ) : (
          filteredNotifications.map(notification => {
            const { icon: Icon, colorClass } = getIconAndColor(notification.type);
            const timeAgo = formatDistanceToNow(new Date(notification.createdAt), { addSuffix: true, locale: localeId });
            return (
              <div 
                key={notification.id} 
                className={`p-4 rounded-xl border flex gap-4 transition-all ${
                  notification.isRead 
                    ? 'bg-surface-variant/40 border-outline/20' 
                    : 'bg-primary/5 border-primary/30 shadow-sm'
                }`}
              >
                <div className={`w-12 h-12 rounded-full flex items-center justify-center shrink-0 ${colorClass}`}>
                  <Icon size={24} />
                </div>
                
                <div className="flex-1 flex flex-col justify-center">
                  <div className="flex justify-between items-start mb-1">
                    <h3 className={`font-title-md text-[16px] m-0 ${notification.isRead ? 'text-on-surface/80' : 'text-on-surface font-bold'}`}>
                      {notification.title}
                    </h3>
                    <span className="font-label-sm text-[12px] text-outline whitespace-nowrap ml-4">
                      {timeAgo}
                    </span>
                  </div>
                  <p className={`font-body-sm text-[14px] m-0 ${notification.isRead ? 'text-on-surface-variant/70' : 'text-on-surface-variant'}`}>
                    {notification.description}
                  </p>
                </div>

                {!notification.isRead && (
                  <div className="flex items-center">
                    <button 
                      onClick={() => markAsRead(notification.id)}
                      title="Tandai Sudah Dibaca"
                      className="p-2 rounded-full text-primary hover:bg-primary/10 transition-colors cursor-pointer"
                    >
                      <Check size={20} />
                    </button>
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};

export default NotificationPage;
