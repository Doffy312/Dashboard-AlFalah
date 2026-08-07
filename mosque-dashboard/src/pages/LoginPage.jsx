import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const LoginPage = () => {
  const [role, setRole] = useState('Ketua');
  const [showPassword, setShowPassword] = useState(false);
  const [username, setUsername] = useState('admin_alfalah');
  const [password, setPassword] = useState('password123');
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleLogin = (e) => {
    e.preventDefault();
    login(role);
    navigate('/dashboard');
  };

  const togglePassword = () => {
    setShowPassword(!showPassword);
  };

  return (
    <div className="bg-surface text-on-surface min-h-screen relative overflow-hidden flex items-center justify-center p-md">
      {/* Atmospheric Background (Light mode adaptation of spiritual teal) */}
      <div className="absolute inset-0 pointer-events-none -z-10 islamic-pattern"></div>
      <div className="absolute top-[-20%] left-[-10%] w-[70vw] h-[70vw] rounded-full bg-primary/10 blur-[100px] pointer-events-none -z-10"></div>
      <div className="absolute bottom-[-20%] right-[-10%] w-[60vw] h-[60vw] rounded-full bg-secondary/10 blur-[100px] pointer-events-none -z-10"></div>
      <div className="absolute top-[30%] left-[50%] -translate-x-1/2 w-[40vw] h-[40vw] rounded-full bg-primary-fixed/20 blur-[120px] pointer-events-none -z-10"></div>

      {/* Login Container - Glassmorphism Card */}
      <main className="w-full max-w-[440px] relative z-10">
        {/* Floating decorative element */}
        <div className="absolute -top-12 left-1/2 -translate-x-1/2 w-24 h-24 bg-surface-container-lowest rounded-full shadow-sm border border-white/60 flex items-center justify-center z-20">
          <span className="material-symbols-outlined text-display-lg text-primary" style={{ fontSize: '48px' }}>mosque</span>
        </div>

        <div className="bg-white/70 backdrop-blur-xl rounded-xl shadow-[0_20px_40px_-15px_rgba(0,104,95,0.1)] border border-white/60 pt-xl pb-lg px-lg sm:px-xl relative overflow-hidden">
          {/* Inner subtle glow top edge */}
          <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-white to-transparent opacity-80"></div>

          {/* Brand Header */}
          <div className="text-center mb-lg pt-sm">
            <h1 className="font-headline-lg text-headline-lg text-primary tracking-tight">🌙 Al-Falah</h1>
            <p className="font-body-sm text-body-sm text-on-surface-variant mt-xs">Sistem Manajemen Masjid</p>
          </div>

          <form onSubmit={handleLogin} className="flex flex-col gap-md">
            {/* Role Selection */}
            <div className="flex flex-col gap-base mb-sm">
              <span className="font-label-md text-label-md text-on-surface-variant">Akses Masuk Sebagai</span>
              <div className="grid grid-cols-3 gap-xs">
                <label className="cursor-pointer relative group">
                  <input
                    type="radio"
                    name="role"
                    value="Ketua"
                    checked={role === 'Ketua'}
                    onChange={(e) => setRole(e.target.value)}
                    className="peer sr-only"
                  />
                  <div className="flex flex-col items-center justify-center p-sm rounded-lg border border-outline-variant bg-white/40 text-on-surface-variant font-body-sm text-body-sm transition-all duration-200 peer-checked:border-primary peer-checked:bg-primary-container peer-checked:text-on-primary-container peer-checked:shadow-sm group-hover:bg-white/60">
                    <span className="material-symbols-outlined mb-xs text-[20px]" style={{ fontVariationSettings: "'FILL' 1" }}>person_apron</span>
                    <span className="text-[11px] font-semibold tracking-wide">Ketua</span>
                  </div>
                </label>

                <label className="cursor-pointer relative group">
                  <input
                    type="radio"
                    name="role"
                    value="Sekretaris"
                    checked={role === 'Sekretaris'}
                    onChange={(e) => setRole(e.target.value)}
                    className="peer sr-only"
                  />
                  <div className="flex flex-col items-center justify-center p-sm rounded-lg border border-outline-variant bg-white/40 text-on-surface-variant font-body-sm text-body-sm transition-all duration-200 peer-checked:border-primary peer-checked:bg-primary-container peer-checked:text-on-primary-container peer-checked:shadow-sm group-hover:bg-white/60">
                    <span className="material-symbols-outlined mb-xs text-[20px]" style={{ fontVariationSettings: "'FILL' 1" }}>edit_document</span>
                    <span className="text-[11px] font-semibold tracking-wide">Sekretaris</span>
                  </div>
                </label>

                <label className="cursor-pointer relative group">
                  <input
                    type="radio"
                    name="role"
                    value="Bendahara"
                    checked={role === 'Bendahara'}
                    onChange={(e) => setRole(e.target.value)}
                    className="peer sr-only"
                  />
                  <div className="flex flex-col items-center justify-center p-sm rounded-lg border border-outline-variant bg-white/40 text-on-surface-variant font-body-sm text-body-sm transition-all duration-200 peer-checked:border-primary peer-checked:bg-primary-container peer-checked:text-on-primary-container peer-checked:shadow-sm group-hover:bg-white/60">
                    <span className="material-symbols-outlined mb-xs text-[20px]" style={{ fontVariationSettings: "'FILL' 1" }}>account_balance_wallet</span>
                    <span className="text-[11px] font-semibold tracking-wide">Bendahara</span>
                  </div>
                </label>
              </div>
            </div>

            {/* Username Input */}
            <div className="flex flex-col gap-base">
              <label htmlFor="username" className="font-label-md text-label-md text-on-surface-variant">Nama Pengguna</label>
              <div className="relative flex items-center">
                <span className="material-symbols-outlined absolute left-sm text-outline-variant z-10 pointer-events-none">person</span>
                <input
                  type="text"
                  id="username"
                  placeholder="Masukkan ID Anda"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="w-full pl-xl pr-sm py-sm bg-white/60 border border-outline-variant rounded-lg font-body-md text-body-md text-on-surface placeholder:text-outline-variant/60 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary focus:bg-white transition-all backdrop-blur-sm shadow-sm"
                />
              </div>
            </div>

            {/* Password Input */}
            <div className="flex flex-col gap-base">
              <div className="flex justify-between items-center">
                <label htmlFor="password" className="font-label-md text-label-md text-on-surface-variant">Kata Sandi</label>
                <a href="#" className="font-label-md text-label-md text-primary hover:underline underline-offset-2">Lupa sandi?</a>
              </div>
              <div className="relative flex items-center">
                <span className="material-symbols-outlined absolute left-sm text-outline-variant z-10 pointer-events-none">lock</span>
                <input
                  type={showPassword ? 'text' : 'password'}
                  id="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-xl pr-xl py-sm bg-white/60 border border-outline-variant rounded-lg font-body-md text-body-md text-on-surface placeholder:text-outline-variant/60 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary focus:bg-white transition-all backdrop-blur-sm shadow-sm"
                />
                <button
                  type="button"
                  onClick={togglePassword}
                  className="absolute right-sm text-outline-variant hover:text-primary transition-colors flex items-center justify-center p-xs"
                >
                  <span className="material-symbols-outlined" id="eye-icon">
                    {showPassword ? 'visibility_off' : 'visibility'}
                  </span>
                </button>
              </div>
            </div>

            {/* Submit Action */}
            <button
              type="submit"
              className="mt-sm w-full py-[14px] bg-primary text-on-primary rounded-lg font-title-md text-title-md shadow-sm hover:shadow-md hover:-translate-y-[1px] hover:bg-primary/95 active:scale-[0.98] transition-all duration-200 flex items-center justify-center gap-sm group relative overflow-hidden"
            >
              <span className="relative z-10">MASUK</span>
              <span className="material-symbols-outlined relative z-10 group-hover:translate-x-1 transition-transform duration-200" style={{ fontWeight: 600 }}>arrow_forward</span>
              {/* Button inner glow highlight */}
              <div className="absolute top-0 left-0 w-full h-1/2 bg-gradient-to-b from-white/20 to-transparent"></div>
            </button>
          </form>
        </div>

        <p className="text-center font-body-sm text-body-sm text-on-surface-variant/70 mt-lg">
          Sistem Manajemen Informasi Masjid Terpadu<br />Versi 2.0.4
        </p>
      </main>
    </div>
  );
};

export default LoginPage;
