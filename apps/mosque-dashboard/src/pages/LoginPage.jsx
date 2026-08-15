import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { authClient } from '../lib/auth-client';
import { useSettings } from '../contexts/SettingsContext';

const LoginPage = () => {
  const { profile } = useSettings();
  const orgName = profile?.orgName || 'Masjid Al-Falah';

  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    if (isLoading) return;

    setError('');
    setIsLoading(true);
    
    try {
      const { error: loginError } = await authClient.signIn.email({
        email,
        password,
      });

      if (loginError) {
        setError(loginError.message || 'Gagal masuk. Periksa kembali email dan kata sandi Anda.');
        setIsLoading(false);
      } else {
        // Ensure session cache is updated before redirecting to prevent ProtectedRoute from bouncing back to /login
        await authClient.getSession();
        navigate('/dashboard', { replace: true });
      }
    } catch (err) {
      setError(err?.message || 'Terjadi kesalahan sistem. Silakan coba beberapa saat lagi.');
      setIsLoading(false);
    }
  };

  const togglePassword = () => {
    setShowPassword(!showPassword);
  };

  return (
    <div className="text-on-surface min-h-screen relative overflow-hidden flex items-center justify-center p-md">
      {/* Atmospheric Background (Light mode adaptation of spiritual teal) */}
      <div className="absolute top-[-20%] left-[-10%] w-[70vw] h-[70vw] rounded-full bg-primary/10 blur-[100px] pointer-events-none -z-10"></div>
      <div className="absolute bottom-[-20%] right-[-10%] w-[60vw] h-[60vw] rounded-full bg-secondary/10 blur-[100px] pointer-events-none -z-10"></div>
      <div className="absolute top-[30%] left-[50%] -translate-x-1/2 w-[40vw] h-[40vw] rounded-full bg-primary-fixed/20 blur-[120px] pointer-events-none -z-10"></div>

      {/* Login Container - Glassmorphism Card */}
      <main className="w-full max-w-[440px] relative z-10">
        {/* Floating decorative element */}
        <div className="absolute -top-12 left-1/2 -translate-x-1/2 w-24 h-24 bg-primary rounded-2xl shadow-lg shadow-primary/20 border-4 border-background flex items-center justify-center z-20 rotate-3 overflow-hidden">
          {profile?.logo ? (
            <img src={profile.logo} alt={orgName} className="w-full h-full object-cover" />
          ) : (
            <span className="material-symbols-outlined text-on-primary" style={{ fontSize: '48px' }}>mosque</span>
          )}
        </div>

        <div className="bg-surface border border-outline-variant pt-xl pb-lg px-lg sm:px-xl relative overflow-hidden rounded-xl">
          {/* Inner subtle glow top edge */}
          <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-white to-transparent opacity-80"></div>

          {/* Brand Header */}
          <div className="text-center mb-lg pt-sm">
            <h1 className="font-headline-lg text-headline-lg text-primary tracking-tight">{orgName}</h1>
            <p className="font-body-sm text-body-sm text-on-surface-variant mt-xs">Sistem Manajemen Masjid</p>
          </div>

          <form onSubmit={handleLogin} className="flex flex-col gap-md">
            {error && (
              <div className="bg-error/10 text-error p-3 rounded-lg text-sm text-center font-medium">
                {error}
              </div>
            )}

            {/* Email Input */}
            <div className="flex flex-col gap-base">
              <label htmlFor="email" className="font-label-md text-label-md text-on-surface-variant">Email</label>
              <div className="relative flex items-center">
                <span className="material-symbols-outlined absolute left-sm text-outline-variant z-10 pointer-events-none">email</span>
                <input
                  type="email"
                  id="email"
                  required
                  disabled={isLoading}
                  placeholder="Masukkan Email Anda"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-xl pr-sm py-sm bg-surface-variant border border-outline-variant rounded-lg font-body-md text-body-md text-on-surface placeholder:text-outline-variant/60 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary focus:bg-surface transition-all backdrop-blur-sm shadow-sm disabled:opacity-60 disabled:cursor-not-allowed"
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
                  required
                  disabled={isLoading}
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-xl pr-xl py-sm bg-surface-variant border border-outline-variant rounded-lg font-body-md text-body-md text-on-surface placeholder:text-outline-variant/60 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary focus:bg-surface transition-all backdrop-blur-sm shadow-sm disabled:opacity-60 disabled:cursor-not-allowed"
                />
                <button
                  type="button"
                  onClick={togglePassword}
                  disabled={isLoading}
                  className="absolute right-sm text-outline-variant hover:text-primary transition-colors flex items-center justify-center p-xs disabled:opacity-50"
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
              disabled={isLoading}
              className="mt-sm w-full py-[14px] bg-primary text-on-primary rounded-lg font-title-md text-title-md shadow-sm hover:shadow-md hover:-translate-y-[1px] hover:bg-primary/95 active:scale-[0.98] transition-all duration-200 flex items-center justify-center gap-sm group relative overflow-hidden disabled:opacity-70 disabled:cursor-not-allowed disabled:transform-none disabled:shadow-none"
            >
              {isLoading ? (
                <>
                  <div className="w-5 h-5 border-2 border-on-primary/30 border-t-on-primary rounded-full animate-spin"></div>
                  <span className="relative z-10 font-semibold tracking-wide">MEMPROSES...</span>
                </>
              ) : (
                <>
                  <span className="relative z-10">MASUK</span>
                  <span className="material-symbols-outlined relative z-10 group-hover:translate-x-1 transition-transform duration-200" style={{ fontWeight: 600 }}>arrow_forward</span>
                </>
              )}
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
