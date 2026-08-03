import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Login = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      await login(username, password);
      navigate('/');
    } catch (err) {
      setError('Username atau password salah');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-page">
      {/* Left: Brand Panel */}
      <div className="login-left animate-in">
        <div className="login-brand-tag">Panel Admin</div>
        <h1 className="login-brand-headline">
          Dashboard <span>Masjid</span>
        </h1>
        <p className="login-brand-sub">
          Kelola jadwal sholat, kajian, keuangan, dan seluruh informasi masjid dalam satu panel terintegrasi.
        </p>
        <div className="login-brand-features">
          <div className="login-brand-feature">
            <div className="login-brand-feature-icon">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>
              </svg>
            </div>
            <div>
              <h4>Jadwal Sholat Otomatis</h4>
              <p>Sinkronisasi dari EQuran.id</p>
            </div>
          </div>
          <div className="login-brand-feature">
            <div className="login-brand-feature-icon">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/>
              </svg>
            </div>
            <div>
              <h4>Manajemen Keuangan</h4>
              <p>Laporan & export PDF</p>
            </div>
          </div>
          <div className="login-brand-feature">
            <div className="login-brand-feature-icon">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/>
              </svg>
            </div>
            <div>
              <h4>Akses Multi-Role</h4>
              <p>Superadmin, Takmir, Bendahara, Marbot</p>
            </div>
          </div>
        </div>
      </div>

      {/* Right: Login Form */}
      <div className="login-right animate-in" style={{ animationDelay: '100ms' }}>
        <div className="login-card">
          <div className="login-card-logo">
            <div className="login-card-logo-icon">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M3 21h18"/><path d="M5 21V7l8-4v18"/><path d="M19 21V11l-6-4"/><path d="M9 9v.01"/><path d="M9 12v.01"/><path d="M9 15v.01"/><path d="M9 18v.01"/>
              </svg>
            </div>
            <div>
              <h2>Masjid Admin</h2>
              <p>Panel Administrator</p>
            </div>
          </div>

          <h3 className="login-title">Masuk ke Akun</h3>
          <p className="login-subtitle">Gunakan kredensial yang diberikan admin</p>

          {error && (
            <div className="alert alert-error" style={{ marginBottom: 16 }}>
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="login-form">
            <div className="form-group">
              <label className="form-label">Username</label>
              <input
                type="text"
                placeholder="Masukkan username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="form-input"
                required
              />
            </div>
            <div className="form-group">
              <label className="form-label">Password</label>
              <input
                type="password"
                placeholder="Masukkan password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="form-input"
                required
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="login-submit"
            >
              {loading ? 'Masuk...' : 'Masuk'}
            </button>
          </form>

          <p className="login-footer">
            Hubungi admin untuk mendapatkan akun
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;
