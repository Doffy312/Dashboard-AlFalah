import { useState, useEffect } from 'react';
import { useSettings } from '../../contexts/SettingsContext';
import { authClient } from '../../lib/auth-client';

const TabSecurity = ({ setHasUnsavedChanges, tabDataRef }) => {
  const { profile, finance, customData, theme, setTheme } = useSettings();

  const [passwords, setPasswords] = useState({
    current: '',
    newPass: '',
    confirmPass: ''
  });
  const [passwordStatus, setPasswordStatus] = useState(null); // { type: 'success' | 'error', text: string }
  const [isChangingPassword, setIsChangingPassword] = useState(false);

  // Expose current data to parent via ref (if needed)
  useEffect(() => {
    if (tabDataRef) {
      tabDataRef.current = () => ({});
    }
  }, [tabDataRef]);

  const handleSelectTheme = (newTheme) => {
    if (newTheme === theme) return;
    setTheme(newTheme);
  };

  // Password change is handled separately — do NOT trigger hasUnsavedChanges
  const handlePasswordChange = (e) => {
    setPasswords({ ...passwords, [e.target.name]: e.target.value });
    // Clear any previous status message when user starts typing
    if (passwordStatus) setPasswordStatus(null);
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();

    // Client-side validation
    if (!passwords.current) {
      setPasswordStatus({ type: 'error', text: 'Kata sandi saat ini harus diisi.' });
      return;
    }
    if (passwords.newPass.length < 8) {
      setPasswordStatus({ type: 'error', text: 'Kata sandi baru minimal 8 karakter.' });
      return;
    }
    if (passwords.newPass !== passwords.confirmPass) {
      setPasswordStatus({ type: 'error', text: 'Konfirmasi kata sandi baru tidak cocok.' });
      return;
    }

    setIsChangingPassword(true);
    setPasswordStatus(null);

    try {
      const result = await authClient.changePassword({
        currentPassword: passwords.current,
        newPassword: passwords.newPass,
      });

      if (result.error) {
        setPasswordStatus({ type: 'error', text: result.error.message || 'Gagal mengubah kata sandi.' });
      } else {
        setPasswordStatus({ type: 'success', text: 'Kata sandi berhasil diubah!' });
        setPasswords({ current: '', newPass: '', confirmPass: '' });
      }
    } catch (err) {
      setPasswordStatus({ type: 'error', text: err.message || 'Terjadi kesalahan saat mengubah kata sandi.' });
    } finally {
      setIsChangingPassword(false);
    }
  };

  const handleExportData = () => {
    try {
      const exportPayload = {
        exportedAt: new Date().toISOString(),
        profile,
        finance,
        customData,
        security: { theme: 'dark' }
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

  const isPasswordFormDirty = passwords.current || passwords.newPass || passwords.confirmPass;

  return (
    <div className="flex flex-col gap-8 animate-in fade-in duration-300">
      <div className="border-b border-outline-variant pb-4 mb-2">
        <h3 className="text-title-md font-bold text-on-surface m-0">Keamanan & Sistem</h3>
        <p className="text-body-sm text-on-surface-variant m-0 mt-1">
          Kelola kata sandi, keamanan akun pengurus, dan pemeliharaan data sistem.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Change Password Form — handled independently from global save */}
        <div className="flex flex-col gap-4">
          <h4 className="font-label-lg font-bold text-on-surface flex items-center gap-2">
            <span className="material-symbols-outlined text-primary">lock</span>
            Ubah Kata Sandi
          </h4>
          <form 
            onSubmit={handleChangePassword}
            autoComplete="off"
            className="bg-surface-variant/30 rounded-xl p-5 border border-outline-variant flex flex-col gap-4"
          >
            {/* Hidden dummy username field to prevent browser autofill from targeting outer search inputs */}
            <input 
              type="text" 
              name="username" 
              autoComplete="username" 
              tabIndex={-1} 
              aria-hidden="true" 
              className="sr-only" 
              style={{ position: 'absolute', opacity: 0, height: 0, width: 0, pointerEvents: 'none' }}
            />

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

            {/* Password status feedback */}
            {passwordStatus && (
              <div className={`p-3 rounded-lg flex items-center gap-2 text-xs font-medium ${
                passwordStatus.type === 'success' 
                  ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30' 
                  : 'bg-error/15 text-error border border-error/30'
              }`}>
                <span className="material-symbols-outlined text-[18px] shrink-0">
                  {passwordStatus.type === 'success' ? 'check_circle' : 'error'}
                </span>
                <span>{passwordStatus.text}</span>
              </div>
            )}

            {/* Dedicated password change button */}
            <button
              type="submit"
              disabled={!isPasswordFormDirty || isChangingPassword}
              className={`mt-1 w-full py-2.5 rounded-lg font-label-md flex items-center justify-center gap-2 transition-colors ${
                isPasswordFormDirty && !isChangingPassword
                  ? 'bg-primary text-white hover:bg-primary/90 cursor-pointer shadow-md shadow-primary/20'
                  : 'bg-primary/50 text-white/70 cursor-not-allowed opacity-60'
              }`}
            >
              <span className="material-symbols-outlined text-[18px]">
                {isChangingPassword ? 'progress_activity' : 'lock_reset'}
              </span>
              {isChangingPassword ? 'Mengubah Kata Sandi...' : 'Ubah Kata Sandi'}
            </button>
          </form>
        </div>

        <div className="flex flex-col gap-8">
          {/* Theme Preference Settings */}
          <div className="flex flex-col gap-4">
            <div className="flex items-center justify-between">
              <h4 className="font-label-lg font-bold text-on-surface flex items-center gap-2">
                <span className="material-symbols-outlined text-primary">palette</span>
                Tema Antarmuka Sistem
              </h4>
              <span className="text-[11px] bg-primary/15 text-primary border border-primary/30 px-2 py-0.5 rounded-full font-medium flex items-center gap-1">
                <span className="material-symbols-outlined text-[13px]">devices</span>
                Tersimpan di Perangkat Ini
              </span>
            </div>
            <div className="bg-surface-variant/30 rounded-xl p-5 border border-outline-variant flex flex-col gap-4">
              <p className="text-xs text-on-surface-variant m-0 leading-relaxed">
                Pilih tampilan antarmuka sistem sesuai kenyamanan visual Anda. Preferensi tema ini disimpan khusus pada perangkat/browser ini (Laptop dan Ponsel dapat menggunakan tema yang berbeda secara independen).
              </p>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {/* Dark Theme Option */}
                <button
                  type="button"
                  onClick={() => handleSelectTheme('dark')}
                  className={`p-3.5 rounded-xl border text-left flex flex-col justify-between gap-3 transition-all cursor-pointer ${
                    theme === 'dark'
                      ? 'bg-primary/10 border-primary shadow-sm ring-1 ring-primary'
                      : 'bg-surface-variant/40 border-outline-variant/60 hover:bg-surface-variant/70 hover:border-outline-variant'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-lg bg-slate-900 border border-slate-700 flex items-center justify-center text-primary">
                        <span className="material-symbols-outlined text-[18px]">dark_mode</span>
                      </div>
                      <div>
                        <div className="text-xs font-bold text-on-surface">Tema Gelap</div>
                        <div className="text-[11px] text-on-surface-variant">Dark Mode</div>
                      </div>
                    </div>
                    {theme === 'dark' ? (
                      <span className="material-symbols-outlined text-primary text-[20px]">check_circle</span>
                    ) : (
                      <span className="w-4 h-4 rounded-full border border-outline-variant"></span>
                    )}
                  </div>
                  {/* Visual Preview Bar */}
                  <div className="w-full h-7 rounded-lg bg-[#0b131a] border border-[#1a2432] p-1.5 flex items-center gap-1.5">
                    <div className="w-3.5 h-full rounded bg-[#10b981]"></div>
                    <div className="flex-1 h-1.5 rounded-full bg-[#1a2432]"></div>
                    <div className="w-5 h-1.5 rounded-full bg-[#374151]"></div>
                  </div>
                </button>

                {/* Light Theme Option */}
                <button
                  type="button"
                  onClick={() => handleSelectTheme('light')}
                  className={`p-3.5 rounded-xl border text-left flex flex-col justify-between gap-3 transition-all cursor-pointer ${
                    theme === 'light'
                      ? 'bg-primary/10 border-primary shadow-sm ring-1 ring-primary'
                      : 'bg-surface-variant/40 border-outline-variant/60 hover:bg-surface-variant/70 hover:border-outline-variant'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-lg bg-slate-100 border border-slate-300 flex items-center justify-center text-emerald-600">
                        <span className="material-symbols-outlined text-[18px]">light_mode</span>
                      </div>
                      <div>
                        <div className="text-xs font-bold text-on-surface">Tema Terang</div>
                        <div className="text-[11px] text-on-surface-variant">Light Mode</div>
                      </div>
                    </div>
                    {theme === 'light' ? (
                      <span className="material-symbols-outlined text-primary text-[20px]">check_circle</span>
                    ) : (
                      <span className="w-4 h-4 rounded-full border border-outline-variant"></span>
                    )}
                  </div>
                  {/* Visual Preview Bar */}
                  <div className="w-full h-7 rounded-lg bg-[#f8fafc] border border-[#cbd5e1] p-1.5 flex items-center gap-1.5">
                    <div className="w-3.5 h-full rounded bg-[#10b981]"></div>
                    <div className="flex-1 h-1.5 rounded-full bg-[#e2e8f0]"></div>
                    <div className="w-5 h-1.5 rounded-full bg-[#cbd5e1]"></div>
                  </div>
                </button>
              </div>
            </div>
          </div>

          {/* Security & System Status Information */}
          <div className="flex flex-col gap-4">
            <h4 className="font-label-lg font-bold text-on-surface flex items-center gap-2">
              <span className="material-symbols-outlined text-primary">security</span>
              Status Keamanan Sistem
            </h4>
            <div className="bg-surface-variant/30 rounded-xl p-5 border border-outline-variant flex flex-col gap-3">
              <div className="flex items-center justify-between p-3 rounded-lg bg-surface-variant/40 border border-outline-variant/30">
                <div className="flex items-center gap-2.5">
                  <span className="material-symbols-outlined text-emerald-400 text-[20px]">verified_user</span>
                  <div>
                    <div className="text-xs font-bold text-on-surface">Enkripsi &amp; Proteksi Akun</div>
                    <div className="text-[11px] text-on-surface-variant">Sesi terproteksi autentikasi aman</div>
                  </div>
                </div>
                <span className="text-[10px] bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 px-2 py-0.5 rounded-full font-bold uppercase tracking-wider">
                  Aktif
                </span>
              </div>
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
                className="flex items-center justify-between w-full p-3 rounded-lg bg-surface-variant/50 hover:bg-surface-variant text-on-surface transition-colors border border-outline-variant cursor-pointer"
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
