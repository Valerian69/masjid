import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const MosqueIcon = () => (
  <svg viewBox="0 0 24 24" fill="currentColor">
    <path d="M12 2C11.172 2 10.5 2.672 10.5 3.5V5H9V3.5C9 2.672 8.328 2 7.5 2S6 2.672 6 3.5V5H5C3.897 5 3 5.897 3 7V11C3 11.414 3.313 11.771 3.707 11.914C3.891 12.625 4.293 13.253 4.844 13.707C4.308 14.266 4 15 4 15.828V17H3V19H4V22H6V19H8V22H10V19H14V22H16V19H17V17H16V15.828C16 15 15.692 14.266 15.156 13.707C15.707 13.253 16.109 12.625 16.293 11.914C16.687 11.771 17 11.414 17 11V7C17 5.897 16.103 5 15 5H14V3.5C14 2.672 13.328 2 12.5 2H12ZM7 7H10V11H7V7ZM14 7H17V11H14V7ZM5 13H7V15H5V13ZM17 13H19V15H17V13ZM8 14H10V16H8V14ZM14 14H16V16H14V14ZM9 17H15V19H9V17Z" />
  </svg>
);

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
      <div className="login-glow" />
      <div className="login-card animate-in">
        <div className="login-header">
          <div className="login-icon">
            <MosqueIcon />
          </div>
          <h1>Dashboard Masjid</h1>
          <p>Panel Administrator</p>
        </div>

        {error && (
          <div className="alert alert-error">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="login-form">
          <div className="form-group">
            <label className="form-label">Username</label>
            <input
              type="text"
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
  );
};

export default Login;
