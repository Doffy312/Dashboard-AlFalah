import React from 'react';
import { AlertTriangle, RefreshCw } from 'lucide-react';

export class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error("Uncaught error in UI:", error, errorInfo);
  }

  handleHardReload = () => {
    try {
      sessionStorage.clear();
      localStorage.removeItem('theme_preference_temp');
    } catch {
      // ignore storage errors
    }
    // Force reload bypassing HTTP cache if possible
    window.location.reload();
  };

  render() {
    if (this.state.hasError) {
      const isChunkError =
        this.state.error?.message?.includes('dynamically imported module') ||
        this.state.error?.message?.includes('Loading chunk') ||
        this.state.error?.name === 'ChunkLoadError';

      return (
        <div className="min-h-[400px] flex items-center justify-center p-6 bg-slate-900/50 rounded-xl border border-slate-800">
          <div className="text-center max-w-md">
            <div className={`inline-flex items-center justify-center w-16 h-16 rounded-full mb-4 ${isChunkError ? 'bg-amber-500/15' : 'bg-red-500/10'}`}>
              <AlertTriangle className={`w-8 h-8 ${isChunkError ? 'text-amber-400' : 'text-red-500'}`} />
            </div>
            <h2 className="text-xl font-bold text-white mb-2">
              {isChunkError ? 'Pembaruan Aplikasi Tersedia' : 'Terjadi Kesalahan pada Tampilan'}
            </h2>
            <p className="text-slate-400 mb-6 text-sm leading-relaxed">
              {isChunkError ? (
                'Telah dirilis pembaruan sistem terbaru di server. Browser Anda masih menyimpan cache versi lama. Silakan klik tombol di bawah untuk menyinkronkan ke versi terbaru.'
              ) : (
                `Sistem tidak dapat memuat bagian ini karena ada masalah (${this.state.error?.message}). Silakan coba muat ulang halaman.`
              )}
            </p>
            <button
              onClick={this.handleHardReload}
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg font-medium transition-all shadow-lg hover:shadow-emerald-500/20 active:scale-95"
            >
              <RefreshCw className="w-4 h-4" />
              {isChunkError ? 'Sinkronkan & Muat Versi Baru' : 'Muat Ulang Halaman'}
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
