import { useState, useEffect } from 'react';
import { useSettings } from '../../contexts/SettingsContext';

const TabSecurity = ({ setHasUnsavedChanges, tabDataRef }) => {
  const { security, profile, finance, customData } = useSettings();

  const [passwords, setPasswords] = useState({
    current: '',
    newPass: '',
    confirmPass: ''
  });
  const [theme, setTheme] = useState(security.theme || 'dark');

  // Sync from context when it changes
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setTheme(security.theme || 'dark');
  }, [security]);

  // Expose current data to parent via ref
  useEffect(() => {
    if (tabDataRef) {
      tabDataRef.current = () => {
        if (passwords.newPass || passwords.confirmPass || passwords.current) {
          if (passwords.newPass.length < 8) {
            alert('Kata sandi baru minimal 8 karakter.');
            return null;
          }
          if (passwords.newPass !== passwords.confirmPass) {
            alert('Konfirmasi kata sandi baru tidak cocok.');
            return null;
          }
        }
        return { theme };
      };
    }
  }, [theme, passwords, tabDataRef]);

  const handlePasswordChange = (e) => {
    setPasswords({ ...passwords, [e.target.name]: e.target.value });
    setHasUnsavedChanges(true);
  };

  const handleThemeChange = (newTheme) => {
    setTheme(newTheme);
    setHasUnsavedChanges(true);
    if (newTheme === 'light') {
      document.documentElement.classList.remove('dark');
    } else {
      document.documentElement.classList.add('dark');
    }
  };

  const handleExportData = () => {
    try {
      const exportPayload = {
        exportedAt: new Date().toISOString(),
        profile,
        finance,
        customData,
        security: { theme }
      };

      const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(exportPayload, null, 2));
      const downloadAnchor = document.createElement('a');
      downloadAnchor.setAttribute("href", dataStr);
      downloadAnchor.setAttribute("download", `mosque_settings_backup_${new Date().toISOString().slice(0, 10)}.json`);
      document.body.appendChild(downloadAnchor);
      downloadAnchor.click();
      downloadAnchor.remove();
    } catch (err) {
      console.error('Export failed:', err);
      alert('Gagal mengeksport data pengaturan.');
    }
  };


  return (
    <div className="flex flex-col gap-8 animate-in fade-in duration-300">
      <div className="border-b border-outline-variant pb-4 mb-2">
        <h3 className="text-title-md font-bold text-on-surface m-0">Keamanan & Sistem</h3>
        <p className="text-body-sm text-on-surface-variant m-0 mt-1">
          Kelola kata sandi, preferensi tampilan, dan pemeliharaan data.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Change Password */}
        <div className="flex flex-col gap-4">
          <h4 className="font-label-lg font-bold text-on-surface flex items-center gap-2">
            <span className="material-symbols-outlined text-primary">lock</span>
            Ubah Kata Sandi
          </h4>
          <div className="bg-surface-variant/30 rounded-xl p-5 border border-outline-variant flex flex-col gap-4">
            <div className="flex flex-col gap-1.5">
              <label className="font-label-md text-on-surface">Kata Sandi Saat Ini</label>
              <input 
                type="password" 
                name="current"
                value={passwords.current}
                onChange={handlePasswordChange}
                className="glass-input w-full px-4 py-2.5 rounded-lg text-on-surface font-body-md"
                placeholder="Masukkan kata sandi lama"
                autoComplete="current-password"
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="font-label-md text-on-surface">Kata Sandi Baru</label>
              <input 
                type="password" 
                name="newPass"
                value={passwords.newPass}
                onChange={handlePasswordChange}
                className="glass-input w-full px-4 py-2.5 rounded-lg text-on-surface font-body-md"
                placeholder="Minimal 8 karakter"
                autoComplete="new-password"
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="font-label-md text-on-surface">Konfirmasi Kata Sandi Baru</label>
              <input 
                type="password" 
                name="confirmPass"
                value={passwords.confirmPass}
                onChange={handlePasswordChange}
                className="glass-input w-full px-4 py-2.5 rounded-lg text-on-surface font-body-md"
                placeholder="Ulangi kata sandi baru"
                autoComplete="new-password"
              />
            </div>
          </div>
        </div>

        <div className="flex flex-col gap-8">
          {/* Theme Preference */}
          <div className="flex flex-col gap-4">
            <h4 className="font-label-lg font-bold text-on-surface flex items-center gap-2">
              <span className="material-symbols-outlined text-primary">palette</span>
              Preferensi Tampilan
            </h4>
            <div className="bg-surface-variant/30 rounded-xl p-5 border border-outline-variant">
              <p className="text-sm text-on-surface mb-4">Pilih tema antarmuka dashboard</p>
              <div className="flex gap-4">
                <button 
                  type="button"
                  onClick={() => handleThemeChange('dark')}
                  className={`flex-1 py-3 rounded-lg border-2 flex items-center justify-center gap-2 transition-all font-medium ${
                    theme === 'dark'
                      ? 'border-primary bg-primary/10 text-primary'
                      : 'border-outline-variant bg-surface-variant/20 text-on-surface-variant hover:border-outline'
                  }`}
                >
                  <span className="material-symbols-outlined text-[20px]">dark_mode</span>
                  Gelap
                </button>
                <button 
                  type="button"
                  onClick={() => handleThemeChange('light')}
                  className={`flex-1 py-3 rounded-lg border-2 flex items-center justify-center gap-2 transition-all font-medium ${
                    theme === 'light'
                      ? 'border-primary bg-primary/10 text-primary'
                      : 'border-outline-variant bg-surface-variant/20 text-on-surface-variant hover:border-outline'
                  }`}
                >
                  <span className="material-symbols-outlined text-[20px]">light_mode</span>
                  <span>Terang</span>
                  <span className="text-[10px] bg-primary/15 text-primary px-1.5 py-0.5 rounded border border-primary/30 font-semibold uppercase tracking-wider ml-1">
                    Baru
                  </span>
                </button>
              </div>
              <p className="text-xs text-on-surface-variant/70 mt-3.5 flex items-center gap-1.5">
                <span className="material-symbols-outlined text-[16px] text-primary">info</span>
                Tema Terang menggunakan nuansa kertas tua (parchment) dengan tekstur klasik.
              </p>
            </div>
          </div>

          {/* Data Maintenance */}
          <div className="flex flex-col gap-4">
            <h4 className="font-label-lg font-bold text-on-surface flex items-center gap-2">
              <span className="material-symbols-outlined text-primary">database</span>
              Pemeliharaan Data
            </h4>
            <div className="bg-surface-variant/30 rounded-xl p-5 border border-outline-variant flex flex-col gap-3">
              <button 
                onClick={handleExportData}
                className="flex items-center justify-between w-full p-3 rounded-lg bg-surface-variant/50 hover:bg-surface-variant text-on-surface transition-colors border border-outline-variant"
              >
                <div className="flex items-center gap-3">
                  <span className="material-symbols-outlined text-primary">download</span>
                  <span className="font-body-md text-sm">Export Data Konfigurasi Sistem (JSON)</span>
                </div>
                <span className="material-symbols-outlined text-on-surface-variant text-[20px]">chevron_right</span>
              </button>
              
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};

export default TabSecurity;

