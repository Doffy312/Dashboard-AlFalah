import { Suspense } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { authClient } from './lib/auth-client';
import { SettingsProvider } from './contexts/SettingsContext';
import { ErrorBoundary } from './components/ErrorBoundary';
import ScrollToTop from './components/ScrollToTop';
import { lazyWithRetry } from './lib/lazyWithRetry';

// Lazy-load DashboardLayout — it imports useRealtimeSync (socket.io ~50KB)
// so deferring it keeps socket.io out of the initial critical bundle.
const DashboardLayout = lazyWithRetry(() => import('./layouts/DashboardLayout'));

// --- Route-level Code Splitting ---
// Each page is lazy-loaded as a separate chunk, only fetched when the route is visited.
const Dashboard = lazyWithRetry(() => import('./pages/Dashboard'));
const LandingPage = lazyWithRetry(() => import('./pages/LandingPage'));
const ProfilPage = lazyWithRetry(() => import('./pages/ProfilPage'));
const TransparansiKeuanganPage = lazyWithRetry(() => import('./pages/TransparansiKeuanganPage'));
const BeritaKegiatanPage = lazyWithRetry(() => import('./pages/BeritaKegiatanPage'));
const LoginPage = lazyWithRetry(() => import('./pages/LoginPage'));
const VerifyEmailPage = lazyWithRetry(() => import('./pages/VerifyEmailPage'));
const KeuanganPage = lazyWithRetry(() => import('./pages/KeuanganPage'));
const ProgramKerjaPage = lazyWithRetry(() => import('./pages/ProgramKerjaPage'));
const JemaahPage = lazyWithRetry(() => import('./pages/JemaahPage'));
const LaporanPage = lazyWithRetry(() => import('./pages/LaporanPage'));
const InventarisPage = lazyWithRetry(() => import('./pages/InventarisPage'));
const NotificationPage = lazyWithRetry(() => import('./pages/NotificationPage'));
const SettingsPage = lazyWithRetry(() => import('./pages/SettingsPage'));
const ZiswafPage = lazyWithRetry(() => import('./pages/ZiswafPage'));
const QurbanPage = lazyWithRetry(() => import('./pages/QurbanPage'));
const JadwalPage = lazyWithRetry(() => import('./pages/JadwalPage'));
const BeritaPage = lazyWithRetry(() => import('./pages/BeritaPage'));
const PesanPage = lazyWithRetry(() => import('./pages/PesanPage'));

// Lightweight loading spinner that matches the app's dark theme
const PageLoadingFallback = () => (
  <div style={{
    display: 'flex',
    height: '100%',
    minHeight: '300px',
    alignItems: 'center',
    justifyContent: 'center',
    color: 'var(--primary, #10b981)',
  }}>
    <div style={{
      width: '36px',
      height: '36px',
      border: '3px solid rgba(255,255,255,0.1)',
      borderTopColor: 'var(--primary, #10b981)',
      borderRadius: '50%',
      animation: 'spin 0.8s linear infinite',
    }} />
    <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
  </div>
);

// Full-page loading fallback (for public routes outside the dashboard layout)
const FullPageLoadingFallback = () => (
  <div style={{
    display: 'flex',
    height: '100vh',
    alignItems: 'center',
    justifyContent: 'center',
    background: 'var(--bg-color, #0a1017)',
    color: 'var(--primary, #10b981)',
  }}>
    <div style={{
      width: '44px',
      height: '44px',
      border: '3px solid rgba(255,255,255,0.1)',
      borderTopColor: 'var(--primary, #10b981)',
      borderRadius: '50%',
      animation: 'spin 0.8s linear infinite',
    }} />
    <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
  </div>
);

// Protected Route Component
const ProtectedRoute = ({ children }) => {
  const { data: session, isPending } = authClient.useSession();
  
  if (isPending) {
    return <FullPageLoadingFallback />;
  }
  
  if (!session?.user) {
    return <Navigate to="/portal-dkm" replace />;
  }
  
  return children;
};

function App() {
  return (
    <SettingsProvider>
      <Router>
        <ScrollToTop />
        <ErrorBoundary>
          <Routes>
          {/* Public Routes — full-page suspense */}
          <Route path="/" element={
            <Suspense fallback={<FullPageLoadingFallback />}>
              <LandingPage />
            </Suspense>
          } />
          <Route path="/profil" element={
            <Suspense fallback={<FullPageLoadingFallback />}>
              <ProfilPage />
            </Suspense>
          } />
          <Route path="/transparansi-keuangan" element={
            <Suspense fallback={<FullPageLoadingFallback />}>
              <TransparansiKeuanganPage />
            </Suspense>
          } />
          <Route path="/berita-kegiatan" element={
            <Suspense fallback={<FullPageLoadingFallback />}>
              <BeritaKegiatanPage />
            </Suspense>
          } />
          {/* Private Login Route */}
          <Route path="/portal-dkm" element={
            <Suspense fallback={<FullPageLoadingFallback />}>
              <LoginPage />
            </Suspense>
          } />
          {/* Forward /login directly to private portal */}
          <Route path="/login" element={<Navigate to="/portal-dkm" replace />} />
          <Route path="/verify-email" element={
            <Suspense fallback={<FullPageLoadingFallback />}>
              <VerifyEmailPage />
            </Suspense>
          } />
          <Route path="/daftar" element={<Navigate to="/#daftar" replace />} />
          <Route path="/pendaftaran" element={<Navigate to="/#daftar" replace />} />
          
          {/* Protected Dashboard Application */}
          <Route path="/dashboard" element={
            <ProtectedRoute>
              <Suspense fallback={<FullPageLoadingFallback />}>
                <DashboardLayout />
              </Suspense>
            </ProtectedRoute>
          }>
            {/* Dashboard child routes — in-layout suspense */}
            <Route index element={<Suspense fallback={<PageLoadingFallback />}><Dashboard /></Suspense>} />
            <Route path="program-kerja" element={<Suspense fallback={<PageLoadingFallback />}><ProgramKerjaPage /></Suspense>} />
            <Route path="jemaah" element={<Suspense fallback={<PageLoadingFallback />}><JemaahPage /></Suspense>} />
            <Route path="keuangan" element={<Suspense fallback={<PageLoadingFallback />}><KeuanganPage /></Suspense>} />
            <Route path="inventaris" element={<Suspense fallback={<PageLoadingFallback />}><InventarisPage /></Suspense>} />
            <Route path="analisis" element={<Suspense fallback={<PageLoadingFallback />}><LaporanPage /></Suspense>} />
            <Route path="ziswaf" element={<Suspense fallback={<PageLoadingFallback />}><ZiswafPage /></Suspense>} />
            <Route path="qurban" element={<Suspense fallback={<PageLoadingFallback />}><QurbanPage /></Suspense>} />
            <Route path="jadwal" element={<Suspense fallback={<PageLoadingFallback />}><JadwalPage /></Suspense>} />
            <Route path="berita" element={<Suspense fallback={<PageLoadingFallback />}><BeritaPage /></Suspense>} />
            <Route path="pesan" element={<Suspense fallback={<PageLoadingFallback />}><PesanPage /></Suspense>} />
            <Route path="notifikasi" element={<Suspense fallback={<PageLoadingFallback />}><NotificationPage /></Suspense>} />
            <Route path="settings" element={<Suspense fallback={<PageLoadingFallback />}><SettingsPage /></Suspense>} />
          </Route>
          
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
        </ErrorBoundary>
      </Router>
    </SettingsProvider>
  );
}

export default App;


