import { createContext, useContext, useState, useEffect, useCallback } from 'react';

const SettingsContext = createContext();

// eslint-disable-next-line react-refresh/only-export-components
export const useSettings = () => useContext(SettingsContext);

// Keys for localStorage
const STORAGE_KEYS = {
  profile: 'settings_profile',
  finance: 'settings_finance',
  customData: 'settings_customData',
  security: 'settings_security',
};

const DEFAULT_PROFILE = {
  orgName: 'Masjid Al-Falah',
  address: 'Jl. Raya Pendidikan No. 123, Kota Bandung',
  phone: '081234567890',
  email: 'info@masjidalfalah.id',
  ig: '@masjidalfalah',
  fb: 'Masjid Al-Falah Bandung',
  yt: 'Al-Falah TV',
  description: 'Masjid Al-Falah adalah pusat ibadah dan kegiatan sosial kemasyarakatan di Bandung.',
  logo: '',
};

const DEFAULT_FINANCE = {
  categories: [
    { id: 1, name: 'Kas Umum', type: 'income' },
    { id: 2, name: 'Dana Infak', type: 'income' },
    { id: 3, name: 'Dana Zakat', type: 'income' },
    { id: 4, name: 'Operasional', type: 'expense' },
    { id: 5, name: 'Pembangunan', type: 'expense' },
  ],
  bankInfo: {
    bankName: 'BSI (Bank Syariah Indonesia)',
    accountNumber: '7123456789',
    accountHolder: 'Masjid Al-Falah',
  },
};

const DEFAULT_CUSTOM_DATA = {
  jemaahStatus: ['Tetap', 'Mustahik', 'Muzakki', 'Pindahan'],
  prokerStatus: ['Direncanakan', 'Berjalan', 'Selesai', 'Dibatalkan'],
};

const DEFAULT_SECURITY = {
  theme: 'dark',
};

function loadFromStorage(key, defaultValue) {
  try {
    const stored = localStorage.getItem(key);
    if (!stored) return defaultValue;
    const parsed = JSON.parse(stored);
    if (typeof defaultValue === 'object' && !Array.isArray(defaultValue) && defaultValue !== null) {
      return { ...defaultValue, ...parsed };
    }
    return parsed;
  } catch {
    return defaultValue;
  }
}

function saveToStorage(key, value) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (e) {
    console.error('Failed to save settings:', e);
  }
}

export const SettingsProvider = ({ children }) => {
  const [profile, setProfile] = useState(() => loadFromStorage(STORAGE_KEYS.profile, DEFAULT_PROFILE));
  const [finance, setFinance] = useState(() => loadFromStorage(STORAGE_KEYS.finance, DEFAULT_FINANCE));
  const [customData, setCustomData] = useState(() => loadFromStorage(STORAGE_KEYS.customData, DEFAULT_CUSTOM_DATA));
  const [security, setSecurity] = useState(() => loadFromStorage(STORAGE_KEYS.security, DEFAULT_SECURITY));

  // Save all settings to localStorage
  const saveAllSettings = useCallback(({ profile: p, finance: f, customData: c, security: s } = {}) => {
    if (p) { setProfile(p); saveToStorage(STORAGE_KEYS.profile, p); }
    if (f) { setFinance(f); saveToStorage(STORAGE_KEYS.finance, f); }
    if (c) { setCustomData(c); saveToStorage(STORAGE_KEYS.customData, c); }
    if (s) { setSecurity(s); saveToStorage(STORAGE_KEYS.security, s); }
  }, []);

  // Save a specific tab's settings
  const saveTabSettings = useCallback((tabId, data) => {
    switch (tabId) {
      case 'profile':
        setProfile(data);
        saveToStorage(STORAGE_KEYS.profile, data);
        break;
      case 'finance':
        setFinance(data);
        saveToStorage(STORAGE_KEYS.finance, data);
        break;
      case 'customData':
        setCustomData(data);
        saveToStorage(STORAGE_KEYS.customData, data);
        break;
      case 'security':
        setSecurity(data);
        saveToStorage(STORAGE_KEYS.security, data);
        break;
    }
  }, []);

  // Reset all settings to defaults
  const resetAllSettings = useCallback(() => {
    setProfile(DEFAULT_PROFILE);
    saveToStorage(STORAGE_KEYS.profile, DEFAULT_PROFILE);

    setFinance(DEFAULT_FINANCE);
    saveToStorage(STORAGE_KEYS.finance, DEFAULT_FINANCE);

    setCustomData(DEFAULT_CUSTOM_DATA);
    saveToStorage(STORAGE_KEYS.customData, DEFAULT_CUSTOM_DATA);

    setSecurity(DEFAULT_SECURITY);
    saveToStorage(STORAGE_KEYS.security, DEFAULT_SECURITY);
  }, []);

  // Apply theme whenever security.theme changes
  useEffect(() => {
    if (security.theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [security.theme]);

  const value = {
    profile,
    finance,
    customData,
    security,
    saveAllSettings,
    saveTabSettings,
    resetAllSettings,
    setProfile,
    setFinance,
    setCustomData,
    setSecurity,
  };

  return (
    <SettingsContext.Provider value={value}>
      {children}
    </SettingsContext.Provider>
  );
};

