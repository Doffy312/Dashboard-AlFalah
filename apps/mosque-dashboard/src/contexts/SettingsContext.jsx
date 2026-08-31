import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { settingsApi } from '../lib/api';

const SettingsContext = createContext();

// eslint-disable-next-line react-refresh/only-export-components
export const useSettings = () => {
  const context = useContext(SettingsContext);
  if (context === undefined) {
    throw new Error('useSettings must be used within a <SettingsProvider>');
  }
  return context;
};

// Keys for localStorage fallback
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
  vision: "Menjadi pusat peradaban dan ibadah yang memakmurkan jemaah, berlandaskan al-Qur'an dan as-Sunnah serta didukung tata kelola yang profesional dan transparan.",
  mission: [
    "Menyelenggarakan ibadah dan kajian keagamaan yang berkualitas.",
    "Mengelola dana infaq, sedekah, dan zakat secara transparan.",
    "Mengembangkan pemberdayaan jemaah, anak yatim, dan dhuafa."
  ],
  logo: '',
  lat: -6.91746,
  lng: 107.61912,
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
  prokerStatus: ['Direncanakan', 'Sedang Berjalan', 'Selesai', 'Dibatalkan'],
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
  const [isLoading, setIsLoading] = useState(true);

  // Fetch initial settings from MySQL backend
  useEffect(() => {
    let isMounted = true;
    async function fetchBackendSettings() {
      try {
        const res = await settingsApi.getAll();
        if (isMounted && res) {
          if (res.profile) {
            setProfile(res.profile);
            saveToStorage(STORAGE_KEYS.profile, res.profile);
          }
          if (res.finance) {
            setFinance(res.finance);
            saveToStorage(STORAGE_KEYS.finance, res.finance);
          }
          if (res.customData) {
            setCustomData(res.customData);
            saveToStorage(STORAGE_KEYS.customData, res.customData);
          }
          if (res.security) {
            setSecurity(res.security);
            saveToStorage(STORAGE_KEYS.security, res.security);
          }
        }
      } catch (err) {
        console.warn('Backend settings fetch failed, using local settings fallback:', err);
      } finally {
        if (isMounted) setIsLoading(false);
      }
    }
    fetchBackendSettings();
    return () => { isMounted = false; };
  }, []);

  // Save all settings to MySQL & localStorage
  const saveAllSettings = useCallback(async ({ profile: p, finance: f, customData: c, security: s } = {}) => {
    if (p) {
      setProfile(p);
      saveToStorage(STORAGE_KEYS.profile, p);
      await settingsApi.update('profile', p).catch(console.error);
    }
    if (f) {
      setFinance(f);
      saveToStorage(STORAGE_KEYS.finance, f);
      await settingsApi.update('finance', f).catch(console.error);
    }
    if (c) {
      setCustomData(c);
      saveToStorage(STORAGE_KEYS.customData, c);
      await settingsApi.update('customData', c).catch(console.error);
    }
    if (s) {
      setSecurity(s);
      saveToStorage(STORAGE_KEYS.security, s);
      await settingsApi.update('security', s).catch(console.error);
    }
  }, []);

  // Save a specific tab's settings to MySQL & localStorage
  const saveTabSettings = useCallback(async (tabId, data) => {
    switch (tabId) {
      case 'profile':
        setProfile(data);
        saveToStorage(STORAGE_KEYS.profile, data);
        await settingsApi.update('profile', data).catch(err => {
          console.error('Failed to save profile to MySQL backend:', err);
          throw err;
        });
        break;
      case 'finance':
        setFinance(data);
        saveToStorage(STORAGE_KEYS.finance, data);
        await settingsApi.update('finance', data).catch(err => {
          console.error('Failed to save finance settings to MySQL backend:', err);
          throw err;
        });
        break;
      case 'customData':
        setCustomData(data);
        saveToStorage(STORAGE_KEYS.customData, data);
        await settingsApi.update('customData', data).catch(err => {
          console.error('Failed to save customData settings to MySQL backend:', err);
          throw err;
        });
        break;
      case 'security': {
        setSecurity(data);
        saveToStorage(STORAGE_KEYS.security, data);
        await settingsApi.update('security', data).catch(err => {
          console.error('Failed to save security settings to MySQL backend:', err);
          throw err;
        });
        break;
      }
    }
  }, []);



  // Apply theme whenever security.theme changes
  useEffect(() => {
    if (security.theme === 'light') {
      document.documentElement.classList.remove('dark');
    } else {
      document.documentElement.classList.add('dark');
    }
  }, [security.theme]);

  const value = {
    profile,
    finance,
    customData,
    security,
    isLoading,
    saveAllSettings,
    saveTabSettings,
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
