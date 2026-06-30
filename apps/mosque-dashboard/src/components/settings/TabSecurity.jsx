import React, { useState } from 'react';

const TabSecurity = ({ setHasUnsavedChanges }) => {
  const [passwords, setPasswords] = useState({
    current: '',
    newPass: '',
    confirmPass: ''
  });
  const [theme, setTheme] = useState('dark');

  const handlePasswordChange = (e) => {
    setPasswords({ ...passwords, [e.target.name]: e.target.value });
    setHasUnsavedChanges(true);
  };

  const handleThemeChange = (newTheme) => {
    setTheme(newTheme);
    setHasUnsavedChanges(true);
    // In a real app, this would toggle classes on the HTML element
    // document.documentElement.classList.toggle('dark', newTheme === 'dark');
  };

  const handleExportData = () => {
    alert("Proses export data ke Excel/CSV sedang berjalan...");
  };

  const handleResetView = () => {
    if (window.confirm('Yakin ingin mengembalikan pengaturan tampilan ke default?')) {
      alert("Pengaturan tampilan berhasil di-reset.");
    }
  };

  return (
    <div className="flex flex-col gap-8 animate-in fade-in duration-300">
      <div className="border-b border-outline-variant pb-4 mb-2">
        <h3 className="text-title-md font-bold text-white m-0">Keamanan & Sistem</h3>
        <p className="text-body-sm text-on-surface-variant m-0 mt-1">
          Kelola kata sandi, preferensi tampilan, dan pemeliharaan data.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Change Password */}
        <div className="flex flex-col gap-4">
          <h4 className="font-label-lg font-bold text-white flex items-center gap-2">
            <span className="material-symbols-outlined text-primary">lock</span>
            Ubah Kata Sandi
          </h4>
          <div className="bg-surface-variant/30 rounded-xl p-5 border border-outline-variant flex flex-col gap-4">
            <div className="flex flex-col gap-1.5">
              <label className="font-label-md text-white">Kata Sandi Saat Ini</label>
              <input 
                type="password" 
                name="current"
                value={passwords.current}
                onChange={handlePasswordChange}
                className="glass-input w-full px-4 py-2.5 rounded-lg text-white font-body-md"
                placeholder="Masukkan kata sandi lama"
                autoComplete="current-password"
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="font-label-md text-white">Kata Sandi Baru</label>
              <input 
                type="password" 
                name="newPass"
                value={passwords.newPass}
                onChange={handlePasswordChange}
                className="glass-input w-full px-4 py-2.5 rounded-lg text-white font-body-md"
                placeholder="Minimal 8 karakter"
                autoComplete="new-password"
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="font-label-md text-white">Konfirmasi Kata Sandi Baru</label>
              <input 
                type="password" 
                name="confirmPass"
                value={passwords.confirmPass}
                onChange={handlePasswordChange}
                className="glass-input w-full px-4 py-2.5 rounded-lg text-white font-body-md"
                placeholder="Ulangi kata sandi baru"
                autoComplete="new-password"
              />
            </div>
          </div>
        </div>

        <div className="flex flex-col gap-8">
          {/* Theme Preference */}
          <div className="flex flex-col gap-4">
            <h4 className="font-label-lg font-bold text-white flex items-center gap-2">
              <span className="material-symbols-outlined text-primary">palette</span>
              Preferensi Tampilan
            </h4>
            <div className="bg-surface-variant/30 rounded-xl p-5 border border-outline-variant">
              <p className="text-sm text-white mb-4">Pilih tema antarmuka dashboard (Saat ini optimal untuk Mode Gelap)</p>
              <div className="flex gap-4">
                <button 
                  onClick={() => handleThemeChange('light')}
                  className={`flex-1 py-3 rounded-lg border-2 flex items-center justify-center gap-2 transition-all ${
                    theme === 'light' ? 'border-primary bg-primary/10 text-primary' : 'border-outline-variant text-on-surface-variant hover:border-outline'
                  }`}
                >
                  <span className="material-symbols-outlined text-[20px]">light_mode</span>
                  Terang
                </button>
                <button 
                  onClick={() => handleThemeChange('dark')}
                  className={`flex-1 py-3 rounded-lg border-2 flex items-center justify-center gap-2 transition-all ${
                    theme === 'dark' ? 'border-primary bg-primary/10 text-primary' : 'border-outline-variant text-on-surface-variant hover:border-outline'
                  }`}
                >
                  <span className="material-symbols-outlined text-[20px]">dark_mode</span>
                  Gelap
                </button>
              </div>
            </div>
          </div>

          {/* Data Maintenance */}
          <div className="flex flex-col gap-4">
            <h4 className="font-label-lg font-bold text-white flex items-center gap-2">
              <span className="material-symbols-outlined text-primary">database</span>
              Pemeliharaan Data
            </h4>
            <div className="bg-surface-variant/30 rounded-xl p-5 border border-outline-variant flex flex-col gap-3">
              <button 
                onClick={handleExportData}
                className="flex items-center justify-between w-full p-3 rounded-lg bg-surface-variant/50 hover:bg-surface-variant text-white transition-colors border border-outline-variant"
              >
                <div className="flex items-center gap-3">
                  <span className="material-symbols-outlined text-primary">download</span>
                  <span className="font-body-md text-sm">Export Data Sistem (Excel)</span>
                </div>
                <span className="material-symbols-outlined text-on-surface-variant text-[20px]">chevron_right</span>
              </button>
              
              <button 
                onClick={handleResetView}
                className="flex items-center justify-between w-full p-3 rounded-lg bg-error/10 hover:bg-error/20 text-error transition-colors border border-error/20 mt-2"
              >
                <div className="flex items-center gap-3">
                  <span className="material-symbols-outlined">restart_alt</span>
                  <span className="font-body-md text-sm font-bold">Reset Pengaturan Tampilan</span>
                </div>
              </button>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};

export default TabSecurity;
