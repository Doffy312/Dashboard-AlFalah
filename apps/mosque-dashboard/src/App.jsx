import { Suspense, lazy } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { authClient } from './lib/auth-client';
import { SettingsProvider } from './contexts/SettingsContext';
import { ErrorBoundary } from './components/ErrorBoundary';
import ScrollToTop from './components/ScrollToTop';

// Lazy-load DashboardLayout — it imports useRealtimeSync (socket.io ~50KB)
// so deferring it keeps socket.io out of the initial critical bundle.
const DashboardLayout = lazy(() => import('./layouts/DashboardLayout'));

// --- Route-level Code Splitting ---
// Each page is lazy-loaded as a separate chunk, only fetched when the route is visited.
const Dashboard = lazy(() => import('./pages/Dashboard'));
const LandingPage = lazy(() => import('./pages/LandingPage'));
const ProfilPage = lazy(() => import('./pages/ProfilPage'));
const TransparansiKeuanganPage = lazy(() => import('./pages/TransparansiKeuanganPage'));
const BeritaKegiatanPage = lazy(() => import('./pages/BeritaKegiatanPage'));
const LoginPage = lazy(() => import('./pages/LoginPage'));
const VerifyEmailPage = lazy(() => import('./pages/VerifyEmailPage'));
const KeuanganPage = lazy(() => import('./pages/KeuanganPage'));
const ProgramKerjaPage = lazy(() => import('./pages/ProgramKerjaPage'));
const JemaahPage = lazy(() => import('./pages/JemaahPage'));
const LaporanPage = lazy(() => import('./pages/LaporanPage'));
const InventarisPage = lazy(() => import('./pages/InventarisPage'));
const NotificationPage = lazy(() => import('./pages/NotificationPage'));
const SettingsPage = lazy(() => import('./pages/SettingsPage'));
const ZiswafPage = lazy(() => import('./pages/ZiswafPage'));
const QurbanPage = lazy(() => import('./pages/QurbanPage'));
const JadwalPage = lazy(() => import('./pages/JadwalPage'));
const BeritaPage = lazy(() => import('./pages/BeritaPage'));
const PesanPage = lazy(() => import('./pages/PesanPage'));

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
          {/* Obscure default /login route by redirecting to home */}
          <Route path="/login" element={<Navigate to="/" replace />} />
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


