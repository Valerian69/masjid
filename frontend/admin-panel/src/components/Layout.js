import React from 'react';
import { Outlet, useNavigate, NavLink } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  Dashboard as DashboardIcon,
  AccessTime,
  MenuBook,
  AccountBalance,
  Event,
  Textsms,
  Description,
  People,
  Settings as SettingsIcon,
  MonitorHeart as MonitorIcon,
  Logout
} from '@mui/icons-material';

const menuItems = [
  { text: 'Dashboard', icon: <DashboardIcon />, path: '/' },
  { text: 'Jadwal Sholat', icon: <AccessTime />, path: '/jadwal-sholat' },
  { text: 'Kajian', icon: <MenuBook />, path: '/kajian' },
  { text: 'Keuangan', icon: <AccountBalance />, path: '/keuangan' },
  { text: 'Agenda', icon: <Event />, path: '/agenda' },
  { text: 'Running Text', icon: <Textsms />, path: '/running-text' },
  { text: 'Laporan', icon: <Description />, path: '/laporan' },
  { text: 'Monitoring', icon: <MonitorIcon />, path: '/monitoring' },
  { text: 'Pengaturan', icon: <SettingsIcon />, path: '/settings' },
];

const adminMenu = [
  { text: 'Users', icon: <People />, path: '/users', roles: ['superadmin'] },
];

const sidebarStyle = {
  width: 260,
  background: 'linear-gradient(180deg, #0b3d2e 0%, #081f18 100%)',
  color: 'white',
  display: 'flex',
  flexDirection: 'column',
  padding: 0,
  position: 'relative',
  overflow: 'hidden',
};

const sidebarPatternStyle = {
  position: 'absolute',
  top: 0,
  left: 0,
  right: 0,
  bottom: 0,
  opacity: 0.04,
  backgroundImage: `repeating-linear-gradient(
    45deg,
    transparent,
    transparent 20px,
    rgba(255,255,255,0.5) 20px,
    rgba(255,255,255,0.5) 21px
  )`,
  pointerEvents: 'none',
};

const sidebarHeaderStyle = {
  padding: '24px 20px 28px',
  textAlign: 'center',
  borderBottom: '1px solid rgba(255,255,255,0.08)',
  position: 'relative',
  zIndex: 1,
};

const navLinkStyle = (isActive) => ({
  display: 'flex',
  alignItems: 'center',
  gap: 12,
  padding: '11px 20px',
  textDecoration: 'none',
  color: isActive ? '#f0c66e' : 'rgba(255,255,255,0.7)',
  background: isActive ? 'rgba(212, 145, 61, 0.12)' : 'transparent',
  borderLeft: isActive ? '3px solid #d4913d' : '3px solid transparent',
  fontSize: '0.88rem',
  fontWeight: isActive ? 500 : 400,
  transition: 'all 0.2s ease',
  letterSpacing: '0.01em',
});

const footerStyle = {
  padding: '16px 20px',
  borderTop: '1px solid rgba(255,255,255,0.08)',
  position: 'relative',
  zIndex: 1,
};

const logoutBtnStyle = {
  display: 'flex',
  alignItems: 'center',
  gap: 8,
  width: '100%',
  padding: '9px 14px',
  background: 'rgba(220, 80, 60, 0.12)',
  border: '1px solid rgba(220, 80, 60, 0.2)',
  color: '#e8837c',
  borderRadius: 8,
  cursor: 'pointer',
  fontSize: '0.85rem',
  fontFamily: 'Outfit, sans-serif',
  transition: 'all 0.2s ease',
};

const Layout = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const allMenu = [...menuItems, ...adminMenu.filter(m => m.roles.includes(user?.role))];

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: '#f0f2f1', fontFamily: 'Outfit, sans-serif' }}>
      <aside style={sidebarStyle}>
        <div style={sidebarPatternStyle} />
        <div style={sidebarHeaderStyle}>
          <div style={{ fontSize: '1.6rem', marginBottom: 6 }}>🕌</div>
          <h2 style={{ fontSize: '1.05rem', fontWeight: 600, letterSpacing: '0.02em' }}>Dashboard Masjid</h2>
          <p style={{ fontSize: '0.7rem', opacity: 0.5, marginTop: 4, letterSpacing: '0.06em', textTransform: 'uppercase' }}>Panel Administrator</p>
        </div>
        <nav style={{ flex: 1, padding: '10px 0', position: 'relative', zIndex: 1 }}>
          {allMenu.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              end={item.path === '/'}
              style={({ isActive }) => navLinkStyle(isActive)}
            >
              {item.icon}
              {item.text}
            </NavLink>
          ))}
        </nav>
        <div style={footerStyle}>
          <div style={{ fontSize: '0.82rem', marginBottom: 4, fontWeight: 500 }}>{user?.full_name}</div>
          <div style={{ fontSize: '0.68rem', opacity: 0.45, marginBottom: 12, textTransform: 'capitalize', letterSpacing: '0.06em' }}>{user?.role}</div>
          <button onClick={handleLogout} style={logoutBtnStyle}>
            <Logout fontSize="small" /> Logout
          </button>
        </div>
      </aside>
      <main style={{ flex: 1, padding: 28, overflow: 'auto', fontFamily: 'Outfit, sans-serif' }}>
        <Outlet />
      </main>
    </div>
  );
};

export default Layout;
