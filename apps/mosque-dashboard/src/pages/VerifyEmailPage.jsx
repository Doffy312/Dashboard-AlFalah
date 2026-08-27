import { useState } from 'react';
import { useSearchParams, useNavigate, Link } from 'react-router-dom';
import { useVerifyAndSetPassword } from '../hooks/useUsers';

const VerifyEmailPage = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const token = searchParams.get('token') || '';
  const email = searchParams.get('email') || '';

  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [isSuccess, setIsSuccess] = useState(false);

  const verifyMutation = useVerifyAndSetPassword();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage('');

    if (!token) {
      setErrorMessage('Token verifikasi tidak ditemukan dalam tautan ini.');
      return;
    }

    if (password.length < 8) {
      setErrorMessage('Kata sandi minimal 8 karakter.');
      return;
    }

    if (password !== confirmPassword) {
      setErrorMessage('Konfirmasi kata sandi tidak cocok.');
      return;
    }

    try {
      await verifyMutation.mutateAsync({ token, password });
      setIsSuccess(true);
    } catch (err) {
      setErrorMessage(err.message || 'Gagal memverifikasi email dan memperbarui kata sandi.');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#0a1017] p-4 text-on-surface relative overflow-hidden">
      {/* Background Decorative Elements */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

      <div className="w-full max-w-md glass-panel p-8 rounded-2xl shadow-2xl border border-outline/30 relative z-10 animate-in fade-in zoom-in-95 duration-300">
        
        {/* Header */}
        <div className="text-center mb-6">
          <div className="w-14 h-14 bg-primary/20 text-primary border border-primary/30 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg shadow-primary/20">
            <span className="material-symbols-outlined text-[32px]">mark_email_read</span>
          </div>
          <h2 className="text-title-lg font-bold text-white m-0">Verifikasi Email Pengurus</h2>
          <p className="text-body-sm text-on-surface-variant mt-2 m-0">
            {email ? (
              <span>Verifikasi akun untuk <strong className="text-primary">{email}</strong></span>
            ) : (
              'Atur kata sandi baru untuk mengaktifkan akun pengurus Anda.'
            )}
          </p>
        </div>

        {/* Error Alert */}
        {errorMessage && (
          <div className="mb-6 p-4 rounded-xl bg-error/15 border border-error/30 text-error text-sm flex items-start gap-3 animate-in fade-in">
            <span className="material-symbols-outlined text-[20px] shrink-0 mt-0.5">error</span>
            <div>{errorMessage}</div>
          </div>
        )}

        {/* Success State */}
        {isSuccess ? (
          <div className="text-center py-4 space-y-4 animate-in fade-in">
            <div className="w-12 h-12 bg-primary/20 text-primary rounded-full flex items-center justify-center mx-auto border border-primary/30">
              <span className="material-symbols-outlined text-[28px]">check</span>
            </div>
            <h3 className="text-title-md font-bold text-white m-0">Akun Berhasil Diverifikasi!</h3>
            <p className="text-body-sm text-on-surface-variant m-0">
              Email Anda telah terverifikasi dan kata sandi baru Anda telah aktif. Silakan masuk ke Dashboard.
            </p>
            <div className="pt-4">
              <button
                onClick={() => navigate('/portal-dkm')}
                className="w-full py-3 px-4 rounded-xl bg-primary hover:bg-primary/90 text-white font-label-md font-bold transition-colors flex items-center justify-center gap-2 shadow-lg shadow-primary/25"
              >
                <span className="material-symbols-outlined text-[20px]">login</span>
                Lanjut ke Halaman Login
              </button>
            </div>
          </div>
        ) : (
          /* Form State */
          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <div className="flex flex-col gap-1.5">
              <label className="font-label-md text-white font-semibold">
                Kata Sandi Baru <span className="text-error">*</span>
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="glass-input w-full px-4 py-3 rounded-xl text-white font-body-md pr-12 focus:border-primary transition-all"
                  placeholder="Minimal 8 karakter"
                  required
                  minLength={8}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-on-surface-variant hover:text-white transition-colors"
                >
                  <span className="material-symbols-outlined text-[20px]">
                    {showPassword ? 'visibility_off' : 'visibility'}
                  </span>
                </button>
              </div>
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="font-label-md text-white font-semibold">
                Konfirmasi Kata Sandi <span className="text-error">*</span>
              </label>
              <input
                type={showPassword ? 'text' : 'password'}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="glass-input w-full px-4 py-3 rounded-xl text-white font-body-md focus:border-primary transition-all"
                placeholder="Ulangi kata sandi baru"
                required
                minLength={8}
              />
            </div>

            <button
              type="submit"
              disabled={verifyMutation.isPending}
              className="w-full mt-4 py-3 px-4 rounded-xl bg-primary hover:bg-primary/90 text-white font-label-md font-bold transition-all flex items-center justify-center gap-2 shadow-lg shadow-primary/25 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {verifyMutation.isPending ? (
                <>
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  <span>Memverifikasi...</span>
                </>
              ) : (
                <>
                  <span className="material-symbols-outlined text-[20px]">verified_user</span>
                  <span>Verifikasi & Simpan Kata Sandi</span>
                </>
              )}
            </button>

            <div className="text-center mt-4">
              <Link to="/portal-dkm" className="text-sm text-on-surface-variant hover:text-primary transition-colors">
                Kembali ke Login
              </Link>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};

export default VerifyEmailPage;
