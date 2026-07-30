import React, { Suspense } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { authClient } from './lib/auth-client';
import { SettingsProvider } from './contexts/SettingsContext';

// Lazy-load DashboardLayout — it imports useRealtimeSync (socket.io ~50KB)
// so deferring it keeps socket.io out of the initial critical bundle.
const DashboardLayout = React.lazy(() => import('./layouts/DashboardLayout'));

// --- Route-level Code Splitting ---
// Each page is lazy-loaded as a separate chunk, only fetched when the route is visited.
const Dashboard = React.lazy(() => import('./pages/Dashboard'));
const LandingPage = React.lazy(() => import('./pages/LandingPage'));
const LoginPage = React.lazy(() => import('./pages/LoginPage'));
const KeuanganPage = React.lazy(() => import('./pages/KeuanganPage'));
const ProgramKerjaPage = React.lazy(() => import('./pages/ProgramKerjaPage'));
const JemaahPage = React.lazy(() => import('./pages/JemaahPage'));
const LaporanPage = React.lazy(() => import('./pages/LaporanPage'));
const InventarisPage = React.lazy(() => import('./pages/InventarisPage'));
const NotificationPage = React.lazy(() => import('./pages/NotificationPage'));
const SettingsPage = React.lazy(() => import('./pages/SettingsPage'));

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
    return <div style={{ display: 'flex', height: '100vh', alignItems: 'center', justifyContent: 'center', background: 'var(--bg-color)', color: '#fff' }}>Loading...</div>;
  }
  
  if (!session?.user) {
    return <Navigate to="/login" replace />;
  }
  
  return children;
};

function App() {
  return (
    <SettingsProvider>
      <Router>
        <Routes>
          {/* Public Routes — full-page suspense */}
          <Route path="/" element={
            <Suspense fallback={<FullPageLoadingFallback />}>
              <LandingPage />
            </Suspense>
          } />
          <Route path="/login" element={
            <Suspense fallback={<FullPageLoadingFallback />}>
              <LoginPage />
            </Suspense>
          } />
          
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
            <Route path="notifikasi" element={<Suspense fallback={<PageLoadingFallback />}><NotificationPage /></Suspense>} />
            <Route path="settings" element={<Suspense fallback={<PageLoadingFallback />}><SettingsPage /></Suspense>} />
          </Route>
          
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Router>
    </SettingsProvider>
  );
}

export default App;


