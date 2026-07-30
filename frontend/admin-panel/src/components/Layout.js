import React, { useState, useEffect } from 'react';
import { Outlet, useNavigate, NavLink, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const MosqueIcon = ({ size = 24 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 3c-1.1 0-2 .9-2 2v1H8V5c0-1.1-.9-2-2-2s-2 .9-2 2v1H3c-.6 0-1 .4-1 1v5c0 2.8 2.2 5 5 5 1.4 0 2.7-.6 3.6-1.5.9.9 2.2 1.5 3.6 1.5 2.8 0 5-2.2 5-5V6c0-.6-.4-1-1-1h-1V5c0-1.1-.9-2-2-2s-2 .9-2 2v1h-2V5c0-1.1-.9-2-2-2z" />
    <path d="M5 14v2M19 14v2" />
    <path d="M9 16h6" />
  </svg>
);

const icons = {
  dashboard: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="7" height="7" rx="1.5" /><rect x="14" y="3" width="7" height="7" rx="1.5" /><rect x="3" y="14" width="7" height="7" rx="1.5" /><rect x="14" y="14" width="7" height="7" rx="1.5" /></svg>,
  clock: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="9" /><polyline points="12 6 12 12 16 14" /></svg>,
  book: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M4 19V5a2 2 0 012-2h8l6 6v10a2 2 0 01-2 2H6a2 2 0 01-2-2z" /><path d="M14 3v6h6" /><path d="M8 13h8M8 17h5" /></svg>,
  wallet: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="6" width="20" height="14" rx="2" /><path d="M2 10h20" /><circle cx="17" cy="14" r="1" fill="currentColor" stroke="none" /></svg>,
  calendar: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" /><path d="M16 2v4M8 2v4M3 10h18" /><rect x="7" y="14" width="2" height="2" rx="0.5" fill="currentColor" stroke="none" /><rect x="11" y="14" width="2" height="2" rx="0.5" fill="currentColor" stroke="none" /><rect x="15" y="14" width="2" height="2" rx="0.5" fill="currentColor" stroke="none" /></svg>,
  text: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M4 7V4h16v3M9 20h6M12 4v16" /></svg>,
  document: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8l-6-6z" /><path d="M14 2v6h6M8 13h8M8 17h8" /></svg>,
  monitor: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="3" width="20" height="14" rx="2" /><path d="M8 21h8M12 17v4" /></svg>,
  settings: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="3" /><path d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 010 2.83 2 2 0 01-2.83 0l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-4 0v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83 0 2 2 0 010-2.83l.06-.06A1.65 1.65 0 004.68 15a1.65 1.65 0 00-1.51-1H3a2 2 0 010-4h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 012.83-2.83l.06.06A1.65 1.65 0 009 4.68a1.65 1.65 0 001-1.51V3a2 2 0 014 0v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 2.83l-.06.06A1.65 1.65 0 0019.4 9a1.65 1.65 0 001.51 1H21a2 2 0 010 4h-.09a1.65 1.65 0 00-1.51 1z" /></svg>,
  users: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="9" cy="7" r="4" /><path d="M3 21v-2a4 4 0 014-4h4a4 4 0 014 4v2" /><circle cx="17" cy="7" r="3" /><path d="M21 21v-2a3 3 0 00-2-2.83" /></svg>,
  logout: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4" /><polyline points="16 17 21 12 16 7" /><line x1="21" y1="12" x2="9" y2="12" /></svg>,
  menu: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><line x1="3" y1="6" x2="21" y2="6" /><line x1="3" y1="12" x2="21" y2="12" /><line x1="3" y1="18" x2="21" y2="18" /></svg>,
  close: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></svg>,
};

const menuItems = [
  { text: 'Dashboard', icon: icons.dashboard, path: '/' },
  { text: 'Jadwal Sholat', icon: icons.clock, path: '/jadwal-sholat' },
  { text: 'Kajian', icon: icons.book, path: '/kajian' },
  { text: 'Keuangan', icon: icons.wallet, path: '/keuangan' },
  { text: 'Agenda', icon: icons.calendar, path: '/agenda' },
  { text: 'Running Text', icon: icons.text, path: '/running-text' },
  { text: 'Laporan', icon: icons.document, path: '/laporan' },
  { text: 'Monitoring', icon: icons.monitor, path: '/monitoring' },
  { text: 'Pengaturan', icon: icons.settings, path: '/settings' },
];

const adminMenu = [
  { text: 'Users', icon: icons.users, path: '/users', roles: ['superadmin'] },
];

const Layout = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    setSidebarOpen(false);
  }, [location.pathname]);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const allMenu = [...menuItems, ...adminMenu.filter(m => m.roles.includes(user?.role))];

  return (
    <div className="admin-layout">
      <div className="mobile-topbar">
        <button className="mobile-hamburger" onClick={() => setSidebarOpen(!sidebarOpen)}>
          {sidebarOpen ? icons.close : icons.menu}
        </button>
        <div className="mobile-topbar-title">
          <MosqueIcon size={20} />
          <span>Dashboard Masjid</span>
        </div>
        <button className="mobile-topbar-logout" onClick={handleLogout}>
          {icons.logout}
        </button>
      </div>

      {sidebarOpen && <div className="mobile-overlay" onClick={() => setSidebarOpen(false)} />}

      <aside className={`sidebar ${sidebarOpen ? 'sidebar-mobile-open' : ''}`}>
        <div className="sidebar-pattern" />
        <div className="sidebar-header">
          <div className="sidebar-header-icon">
            <MosqueIcon size={24} />
          </div>
          <h2>Dashboard Masjid</h2>
          <p>Panel Administrator</p>
        </div>
        <nav className="sidebar-nav">
          {allMenu.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              end={item.path === '/'}
              className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}
            >
              {item.icon}
              {item.text}
            </NavLink>
          ))}
        </nav>
        <div className="sidebar-footer">
          <div className="sidebar-user-name">{user?.full_name}</div>
          <div className="sidebar-user-role">{user?.role}</div>
          <button onClick={handleLogout} className="sidebar-logout">
            {icons.logout}
            Logout
          </button>
        </div>
      </aside>
      <main className="admin-main">
        <Outlet />
      </main>
    </div>
  );
};

export default Layout;
