import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { authClient } from './lib/auth-client';
import DashboardLayout from './layouts/DashboardLayout';
import Dashboard from './pages/Dashboard';
import LandingPage from './pages/LandingPage';
import LoginPage from './pages/LoginPage';
import KeuanganPage from './pages/KeuanganPage';
import ProgramKerjaPage from './pages/ProgramKerjaPage';
import JemaahPage from './pages/JemaahPage';
import LaporanPage from './pages/LaporanPage';
import InventarisPage from './pages/InventarisPage';
import NotificationPage from './pages/NotificationPage';
import SettingsPage from './pages/SettingsPage';

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
    <Router>
      <Routes>
        {/* Public Routes */}
        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={<LoginPage />} />
        
        {/* Protected Dashboard Application */}
        <Route path="/dashboard" element={
          <ProtectedRoute>
            <DashboardLayout />
          </ProtectedRoute>
        }>
          <Route index element={<Dashboard />} />
          <Route path="program-kerja" element={<ProgramKerjaPage />} />
          <Route path="jemaah" element={<JemaahPage />} />
          <Route path="keuangan" element={<KeuanganPage />} />
          <Route path="inventaris" element={<InventarisPage />} />
          <Route path="analisis" element={<LaporanPage />} />
          <Route path="notifikasi" element={<NotificationPage />} />
          <Route path="settings" element={<SettingsPage />} />
        </Route>
        
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  );
}

export default App;
