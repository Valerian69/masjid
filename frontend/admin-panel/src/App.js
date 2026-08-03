import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ToastProvider } from './components/Toast';
import { ConfirmProvider } from './components/ConfirmDialog';
import { OnboardingProvider } from './components/onboarding/OnboardingContext';
import ErrorBoundary from './components/ErrorBoundary';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import JadwalSholat from './pages/JadwalSholat';
import Kajian from './pages/Kajian';
import Keuangan from './pages/Keuangan';
import Agenda from './pages/Agenda';
import RunningText from './pages/RunningText';
import Users from './pages/Users';
import Settings from './pages/Settings';
import Laporan from './pages/Laporan';
import Monitoring from './pages/Monitoring';
import Panduan from './pages/Panduan';
import Layout from './components/Layout';

const ProtectedRoute = ({ children }) => {
  const { token } = useAuth();
  return token ? children : <Navigate to="/login" />;
};

function App() {
  return (
    <AuthProvider>
      <ToastProvider>
        <ConfirmProvider>
          <OnboardingProvider>
          <Router basename="/admin">
            <ErrorBoundary>
              <Routes>
                <Route path="/login" element={<Login />} />
                <Route path="/" element={<ProtectedRoute><Layout /></ProtectedRoute>}>
                  <Route index element={<Dashboard />} />
                  <Route path="jadwal-sholat" element={<JadwalSholat />} />
                  <Route path="kajian" element={<Kajian />} />
                  <Route path="keuangan" element={<Keuangan />} />
                  <Route path="agenda" element={<Agenda />} />
                  <Route path="running-text" element={<RunningText />} />
                  <Route path="laporan" element={<Laporan />} />
                  <Route path="settings" element={<Settings />} />
                  <Route path="monitoring" element={<Monitoring />} />
                  <Route path="users" element={<Users />} />
                  <Route path="panduan" element={<Panduan />} />
                </Route>
              </Routes>
            </ErrorBoundary>
          </Router>
          </OnboardingProvider>
        </ConfirmProvider>
      </ToastProvider>
    </AuthProvider>
  );
}

export default App;