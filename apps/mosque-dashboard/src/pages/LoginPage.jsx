import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { authClient } from '../lib/auth-client';
import { API_BASE } from '../lib/api';
import { useSettings } from '../contexts/SettingsContext';

const APP_VERSION = typeof __APP_VERSION__ !== 'undefined' ? __APP_VERSION__ : '2.0.4';

const LoginPage = () => {
  const { profile } = useSettings();
  const orgName = profile?.orgName || 'Masjid Al-Falah';

  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [backendStatus, setBackendStatus] = useState('checking'); // 'checking' | 'connected' | 'missing_env' | 'error'
  const [backendUrl, setBackendUrl] = useState('');
  const [backendErrorDetails, setBackendErrorDetails] = useState('');
  const navigate = useNavigate();

  const { data: session, isPending: isSessionPending } = authClient.useSession();

  // Test backend connectivity on mount
  const checkBackend = async () => {
    setBackendStatus('checking');
    setBackendErrorDetails('');
    const rawApi = import.meta.env.VITE_API_URL;
    const isVercelHost = typeof window !== 'undefined' && window.location.hostname.endsWith('.vercel.app');

    if (!rawApi && isVercelHost) {
      setBackendStatus('missing_env');
      setBackendUrl(window.location.origin);
      setBackendErrorDetails('Variabel VITE_API_URL belum diset pada Project Settings -> Environment Variables di Vercel.');
      return;
    }

    const rootUrl = API_BASE.replace(/\/api$/, '');
    setBackendUrl(rootUrl || (typeof window !== 'undefined' ? window.location.origin : ''));

    try {
      const healthEndpoint = `${rootUrl || ''}/api/health`;
      const res = await fetch(healthEndpoint, { method: 'GET', credentials: 'omit' });
      const contentType = res.headers.get('content-type') || '';

      if (res.ok && contentType.includes('application/json')) {
        const data = await res.json().catch(() => ({}));
        if (data.status === 'ok') {
          setBackendStatus('connected');
          return;
        }
      }

      if (contentType.includes('text/html')) {
        setBackendStatus('missing_env');
        setBackendErrorDetails('Endpoint mengembalikan file HTML (bukan JSON API). VITE_API_URL di Vercel belum mengarah ke backend Railway.');
      } else {
        setBackendStatus('error');
        setBackendErrorDetails(`Server Railway mengembalikan status HTTP ${res.status}`);
      }
    } catch (err) {
      setBackendStatus('error');
      setBackendErrorDetails(err?.message || 'Gagal terhubung ke backend (CORS atau Server Railway Offline)');
    }
  };

  useEffect(() => {
    checkBackend();
  }, []);

  // Automatically redirect if already authenticated or session turns valid
  useEffect(() => {
    if (!isSessionPending && session?.user) {
      navigate('/dashboard', { replace: true });
    }
  }, [session, isSessionPending, navigate]);

  const isMissingApiUrl = typeof window !== 'undefined' &&
    window.location.hostname !== 'localhost' &&
    window.location.hostname !== '127.0.0.1' &&
    !import.meta.env.VITE_API_URL;

  const handleLogin = async (e) => {
    e.preventDefault();
    if (isLoading) return;

    setError('');
    setIsLoading(true);
    
    try {
      const { data, error: loginError } = await authClient.signIn.email({
        email: email.trim(),
        password,
      });

      if (loginError) {
        let msg = loginError.message || 'Gagal masuk. Periksa kembali email dan kata sandi Anda.';
        if (msg.toLowerCase().includes('invalid email or password')) {
          msg = 'Email atau kata sandi salah. Silakan periksa kembali.';
        }
        setError(msg);
        setIsLoading(false);
      } else {
        // Fetch session to populate authClient store, then navigate
        const sessionRes = await authClient.getSession();
        if (!sessionRes?.data?.user && !data?.user) {
          setError('Browser tidak dapat menyimpan sesi login. Pastikan browser mengizinkan cookie cross-site atau periksa variabel FRONTEND_URL di backend.');
          setIsLoading(false);
          return;
        }
        navigate('/dashboard', { replace: true });
      }
    } catch (err) {
      const msg = err?.message || '';
      if (msg.includes('Failed to fetch') || msg.includes('NetworkError') || msg.includes('Network Error')) {
        setError('Gagal menghubungi server backend (Network Error / CORS). Pastikan backend Railway aktif dan VITE_API_URL di Vercel sudah benar.');
      } else {
        setError(msg || 'Terjadi kesalahan sistem. Silakan coba beberapa saat lagi.');
      }
      setIsLoading(false);
    }
  };

  const togglePassword = () => {
    setShowPassword(!showPassword);
  };

  return (
    <div className="bg-background text-on-surface min-h-screen relative overflow-hidden flex items-center justify-center p-md">
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
          <div className="text-center mb-md pt-sm flex flex-col items-center">
            <h1 className="font-headline-lg text-headline-lg text-primary tracking-tight">{orgName}</h1>
            <p className="font-body-sm text-body-sm text-on-surface-variant mt-xs">Sistem Manajemen Masjid</p>

            {/* Backend Connectivity Status Badge */}
            <div className="mt-sm">
              {backendStatus === 'connected' && (
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-medium bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                  Server API Terhubung
                </span>
              )}
              {backendStatus === 'checking' && (
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-medium bg-slate-500/10 text-slate-500 dark:text-slate-400">
                  <span className="w-2 h-2 rounded-full bg-slate-400 animate-pulse"></span>
                  Memeriksa koneksi API...
                </span>
              )}
              {backendStatus === 'error' && (
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-medium bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/20" title={`Target API: ${backendUrl}`}>
                  <span className="w-2 h-2 rounded-full bg-rose-500"></span>
                  Backend Belum Terhubung
                </span>
              )}
            </div>
          </div>

          <form onSubmit={handleLogin} className="flex flex-col gap-md">
            {isMissingApiUrl && (
              <div className="bg-amber-500/10 border border-amber-500/30 text-amber-600 dark:text-amber-400 p-3 rounded-lg text-xs leading-relaxed text-center font-medium">
                ⚠️ <strong>Variabel VITE_API_URL belum terdeteksi:</strong> Request API saat ini mengarah ke domain statis Vercel. Pastikan Anda telah menambahkan <code>VITE_API_URL</code> ke domain backend Railway di Environment Variables Vercel lalu Redeploy.
              </div>
            )}

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
                  aria-label={showPassword ? 'Sembunyikan kata sandi' : 'Tampilkan kata sandi'}
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
          Sistem Manajemen Informasi Masjid Terpadu<br />v{APP_VERSION}
        </p>
      </main>
    </div>
  );
};

export default LoginPage;
