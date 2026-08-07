import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { KeuanganProvider } from './context/KeuanganContext';
import { ProgramProvider } from './context/ProgramContext';
import { JemaahProvider } from './context/JemaahContext';
import { InventarisProvider } from './context/InventarisContext';
import DashboardLayout from './layouts/DashboardLayout';
import Dashboard from './pages/Dashboard';
import LandingPage from './pages/LandingPage';
import LoginPage from './pages/LoginPage';
import KeuanganPage from './pages/KeuanganPage';
import ProgramKerjaPage from './pages/ProgramKerjaPage';
import JemaahPage from './pages/JemaahPage';
import LaporanPage from './pages/LaporanPage';

// Protected Route Component
const ProtectedRoute = ({ children }) => {
  const { currentUser, loading } = useAuth();
  
  if (loading) {
    return <div style={{ display: 'flex', height: '100vh', alignItems: 'center', justifyContent: 'center', background: 'var(--bg-color)', color: '#fff' }}>Loading...</div>;
  }
  
  if (!currentUser) {
    return <Navigate to="/login" replace />;
  }
  
  return children;
};

function App() {
  return (
    <AuthProvider>
      <ProgramProvider>
        <JemaahProvider>
          <KeuanganProvider>
            <InventarisProvider>
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
                    <Route path="inventaris" element={<div className="page-content"><h1>Inventaris Masjid</h1></div>} />
                    <Route path="analisis" element={<LaporanPage />} />
                  </Route>
                  
                  <Route path="*" element={<Navigate to="/" replace />} />
                </Routes>
              </Router>
            </InventarisProvider>
          </KeuanganProvider>
        </JemaahProvider>
      </ProgramProvider>
    </AuthProvider>
  );
}

export default App;
