import React, { Suspense, lazy } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ToastProvider } from './components/Toast';
import { ConfirmProvider } from './components/ConfirmDialog';
import { OnboardingProvider } from './components/onboarding/OnboardingContext';
import ErrorBoundary from './components/ErrorBoundary';
import Loading from './components/Loading';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Layout from './components/Layout';

// Login dan Dashboard ikut bundel utama — keduanya selalu jadi layar pertama.
// Sisanya dipecah per rute: sebelumnya seluruh panel (Monitoring, dasbor
// keuangan, 37 langkah tur) harus diurai peramban sebelum formulir login
// sempat tampil.
const JadwalSholat = lazy(() => import('./pages/JadwalSholat'));
const Kajian = lazy(() => import('./pages/Kajian'));
const Keuangan = lazy(() => import('./pages/Keuangan'));
const Agenda = lazy(() => import('./pages/Agenda'));
const RunningText = lazy(() => import('./pages/RunningText'));
const Users = lazy(() => import('./pages/Users'));
const Settings = lazy(() => import('./pages/Settings'));
const Laporan = lazy(() => import('./pages/Laporan'));
const Monitoring = lazy(() => import('./pages/Monitoring'));
const Panduan = lazy(() => import('./pages/Panduan'));

const ProtectedRoute = ({ children }) => {
  const { token } = useAuth();
  return token ? children : <Navigate to="/login" />;
};

// Alamat yang tidak dikenali sebelumnya merender halaman kosong tanpa
// penjelasan. Diarahkan ke dashboard: di panel sekecil ini, halaman 404
// tersendiri hanya menambah satu layar buntu.
const NotFound = () => <Navigate to="/" replace />;

function App() {
  return (
    <AuthProvider>
      <ToastProvider>
        <ConfirmProvider>
          <Router basename="/admin">
            <OnboardingProvider>
              <ErrorBoundary>
                <Suspense fallback={<Loading text="Memuat halaman..." />}>
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
                      <Route path="*" element={<NotFound />} />
                    </Route>
                    <Route path="*" element={<NotFound />} />
                  </Routes>
                </Suspense>
              </ErrorBoundary>
            </OnboardingProvider>
          </Router>
        </ConfirmProvider>
      </ToastProvider>
    </AuthProvider>
  );
}

export default App;
