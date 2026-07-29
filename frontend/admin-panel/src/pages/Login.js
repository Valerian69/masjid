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
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: 'linear-gradient(135deg, #061a14 0%, #0b3d2e 50%, #081f18 100%)',
      fontFamily: 'Outfit, sans-serif',
      position: 'relative',
      overflow: 'hidden',
    }}>
      {/* Ambient glow */}
      <div style={{
        position: 'absolute',
        top: '50%',
        left: '50%',
        width: '80vmax',
        height: '80vmax',
        transform: 'translate(-50%, -50%)',
        background: 'radial-gradient(ellipse at center, rgba(20, 107, 74, 0.15) 0%, transparent 60%)',
        pointerEvents: 'none',
      }} />

      <div style={{
        background: 'rgba(255, 255, 255, 0.95)',
        borderRadius: 20,
        padding: '44px 40px',
        width: 400,
        boxShadow: '0 24px 80px rgba(0,0,0,0.35), 0 0 0 1px rgba(255,255,255,0.1)',
        position: 'relative',
        zIndex: 1,
      }}>
        <div style={{ textAlign: 'center', marginBottom: 36 }}>
          <div style={{ fontSize: '2.2rem', marginBottom: 8 }}>🕌</div>
          <h1 style={{
            fontSize: '1.4rem',
            color: '#0b3d2e',
            fontWeight: 700,
            fontFamily: 'Amiri, serif',
            letterSpacing: '0.02em',
          }}>Dashboard Masjid</h1>
          <p style={{
            color: '#7a9a8e',
            fontSize: '0.82rem',
            marginTop: 6,
            letterSpacing: '0.06em',
            textTransform: 'uppercase',
            fontWeight: 400,
          }}>Panel Administrator</p>
        </div>

        {error && (
          <div style={{
            padding: '12px 16px',
            background: '#fef2f2',
            color: '#b91c1c',
            borderRadius: 10,
            marginBottom: 20,
            fontSize: '0.85rem',
            border: '1px solid rgba(185, 28, 28, 0.1)',
          }}>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: 18 }}>
            <label style={{
              display: 'block',
              fontSize: '0.8rem',
              color: '#4a6a5e',
              marginBottom: 7,
              fontWeight: 500,
              letterSpacing: '0.02em',
            }}>Username</label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              style={{
                width: '100%',
                padding: '12px 16px',
                border: '1.5px solid #d4ddd8',
                borderRadius: 10,
                fontSize: '0.92rem',
                outline: 'none',
                boxSizing: 'border-box',
                fontFamily: 'Outfit, sans-serif',
                transition: 'border-color 0.2s ease',
              }}
              required
            />
          </div>
          <div style={{ marginBottom: 28 }}>
            <label style={{
              display: 'block',
              fontSize: '0.8rem',
              color: '#4a6a5e',
              marginBottom: 7,
              fontWeight: 500,
              letterSpacing: '0.02em',
            }}>Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              style={{
                width: '100%',
                padding: '12px 16px',
                border: '1.5px solid #d4ddd8',
                borderRadius: 10,
                fontSize: '0.92rem',
                outline: 'none',
                boxSizing: 'border-box',
                fontFamily: 'Outfit, sans-serif',
                transition: 'border-color 0.2s ease',
              }}
              required
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            style={{
              width: '100%',
              padding: '13px',
              background: loading ? '#7a9a8e' : '#0b3d2e',
              color: 'white',
              border: 'none',
              borderRadius: 10,
              fontSize: '0.95rem',
              fontWeight: 600,
              cursor: loading ? 'not-allowed' : 'pointer',
              fontFamily: 'Outfit, sans-serif',
              letterSpacing: '0.02em',
              transition: 'background 0.2s ease',
            }}
          >
            {loading ? 'Masuk...' : 'Masuk'}
          </button>
        </form>

        <p style={{
          textAlign: 'center',
          marginTop: 22,
          fontSize: '0.72rem',
          color: '#a0b0a8',
          letterSpacing: '0.02em',
        }}>
          Default: admin / admin123
        </p>
      </div>
    </div>
  );
};

export default Login;
