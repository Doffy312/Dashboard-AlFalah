import { useState, useEffect, useRef } from 'react';
import { Navigate } from 'react-router-dom';
import { authClient } from '../lib/auth-client';
import { useSettings } from '../contexts/SettingsContext';
import TabProfile from '../components/settings/TabProfile';
import TabUsers from '../components/settings/TabUsers';
import TabFinance from '../components/settings/TabFinance';
import TabCustomData from '../components/settings/TabCustomData';
import TabSecurity from '../components/settings/TabSecurity';

const TABS = [
  { id: 'profile', label: 'Profil Organisasi', icon: 'storefront' },
  { id: 'users', label: 'Manajemen Pengguna', icon: 'manage_accounts' },
  { id: 'finance', label: 'Konfigurasi Keuangan', icon: 'account_balance' },
  { id: 'customData', label: 'Parameter Jemaah & Proker', icon: 'settings_suggest' },
  { id: 'security', label: 'Keamanan & Sistem', icon: 'security' }
];

const SettingsPage = () => {
  const [activeTab, setActiveTab] = useState('profile');
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [toast, setToast] = useState(null);
  const { saveTabSettings } = useSettings();
  
  const { data: session } = authClient.useSession();
  
  // Ref to get current data from the active tab
  const tabDataRef = useRef(null);

  // Prevent closing window if unsaved
  useEffect(() => {
    const handleBeforeUnload = (e) => {
      if (hasUnsavedChanges) {
        e.preventDefault();
        e.returnValue = '';
      }
    };
    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [hasUnsavedChanges]);

  if (session?.user?.role !== 'Ketua') {
    return <Navigate to="/dashboard" replace />;
  }

  // Handle Tab Switch with Unsaved Changes Warning
  const handleTabChange = (tabId) => {
    if (hasUnsavedChanges) {
      if (!window.confirm('Ada perubahan yang belum disimpan. Yakin ingin berpindah tab?')) {
        return;
      }
    }
    setActiveTab(tabId);
    setHasUnsavedChanges(false);
  };

  // Show Toast
  const showToast = (message, type = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  // Real Save Handler — reads current data from the active tab's ref and persists it
  const handleSave = async () => {
    if (tabDataRef.current) {
      const currentData = tabDataRef.current();
      if (currentData !== null && currentData !== undefined) {
        try {
          await saveTabSettings(activeTab, currentData);
          setHasUnsavedChanges(false);
          showToast('Pengaturan berhasil disimpan ke database!');
        } catch (error) {
          showToast(error.message || 'Gagal menyimpan pengaturan', 'error');
        }
      }
    }
  };


  const handleCancel = () => {
    if (hasUnsavedChanges) {
      if (window.confirm('Batalkan perubahan?')) {
        setHasUnsavedChanges(false);
        // Force re-render tabs so they re-read from context
        setActiveTab(prev => prev);
      }
    }
  };

  const renderActiveTab = () => {
    const commonProps = { setHasUnsavedChanges, tabDataRef };
    switch (activeTab) {
      case 'profile': return <TabProfile {...commonProps} />;
      case 'users': return <TabUsers {...commonProps} />;
      case 'finance': return <TabFinance {...commonProps} />;
      case 'customData': return <TabCustomData {...commonProps} />;
      case 'security': return <TabSecurity {...commonProps} />;
      default: return null;
    }
  };

  return (
    <div className="flex flex-col gap-6 text-on-surface">
      {/* Toast Notification */}
      {toast && (
        <div className={`fixed top-24 right-8 z-50 px-4 py-3 rounded-lg shadow-lg flex items-center gap-2 ${
          toast.type === 'success' ? 'bg-primary text-white' : 'bg-error text-white'
        } transition-all duration-300 animate-in fade-in slide-in-from-top-5`}>
          <span className="material-symbols-outlined text-[20px]">
            {toast.type === 'success' ? 'check_circle' : 'error'}
          </span>
          <span className="font-label-md text-sm">{toast.message}</span>
        </div>
      )}

      {/* Standard Header Section matching other dashboard pages */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-display-sm font-display-sm text-on-surface dark:text-white m-0">Pengaturan</h1>
          <p className="font-body-md text-on-surface-variant dark:text-white/70 m-0 mt-xs">Kelola konfigurasi sistem dan preferensi organisasi.</p>
        </div>
        <div className="flex w-full sm:w-auto gap-3">
          <button 
            onClick={handleCancel}
            disabled={!hasUnsavedChanges}
            className={`flex-1 sm:flex-none px-4 py-2 rounded-lg font-label-md transition-colors ${
              hasUnsavedChanges 
                ? 'bg-surface-variant text-white hover:bg-surface-variant/80 cursor-pointer' 
                : 'bg-surface-variant/50 text-on-surface-variant cursor-not-allowed opacity-60'
            }`}
          >
            Batal
          </button>
          <button 
            onClick={handleSave}
            disabled={!hasUnsavedChanges}
            className={`flex-1 sm:flex-none px-4 py-2 rounded-lg font-label-md flex items-center justify-center gap-2 transition-colors ${
              hasUnsavedChanges
                ? 'bg-primary text-white hover:bg-primary/90 cursor-pointer shadow-md shadow-primary/20'
                : 'bg-primary/50 text-white/70 cursor-not-allowed opacity-60'
            }`}
          >
            <span className="material-symbols-outlined text-[18px]">save</span>
            Simpan
          </button>
        </div>
      </div>

      {/* Responsive Glass Layout without scroll traps */}
      <div className="flex flex-col md:flex-row gap-6">
        {/* Navigation Tabs */}
        <div className="w-full md:w-72 shrink-0 glass-panel p-2 flex md:flex-col gap-1.5 overflow-x-auto md:sticky md:top-[100px] h-fit hide-scrollbar">
          {TABS.map(tab => (
            <button
              key={tab.id}
              onClick={() => handleTabChange(tab.id)}
              className={`flex items-center gap-3 px-3.5 py-3 rounded-lg text-left transition-all duration-200 whitespace-nowrap shrink-0 min-w-0 ${
                activeTab === tab.id 
                  ? 'bg-primary/20 text-primary font-bold shadow-[0_3px_0_0_rgba(16,185,129,1)] md:shadow-[inset_3px_0_0_0_rgba(16,185,129,1)]' 
                  : 'text-on-surface-variant hover:text-white hover:bg-surface-variant/50'
              }`}
            >
              <span className="material-symbols-outlined text-[20px] shrink-0" style={activeTab === tab.id ? { fontVariationSettings: "'FILL' 1" } : {}}>
                {tab.icon}
              </span>
              <span className="text-sm font-semibold truncate">{tab.label}</span>
            </button>
          ))}
        </div>

        {/* Active Tab Content Area */}
        <div className="flex-1 glass-panel p-6">
          {renderActiveTab()}
        </div>
      </div>
    </div>
  );
};

export default SettingsPage;

