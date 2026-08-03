import React, { useState, useEffect } from 'react';
import { Outlet, useNavigate, NavLink, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const MosqueIcon = ({ size = 24 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M3 21h18"/>
    <path d="M5 21V7l8-4v18"/>
    <path d="M19 21V11l-6-4"/>
    <path d="M9 9v.01M9 12v.01M9 15v.01M9 18v.01"/>
  </svg>
);

const icons = {
  dashboard: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="7" height="7" rx="1.5"/><rect x="14" y="3" width="7" height="7" rx="1.5"/><rect x="3" y="14" width="7" height="7" rx="1.5"/><rect x="14" y="14" width="7" height="7" rx="1.5"/></svg>,
  clock: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>,
  book: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/></svg>,
  wallet: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>,
  calendar: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>,
  text: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="4 7 4 4 20 4 20 7"/><line x1="9" y1="20" x2="15" y2="20"/><line x1="12" y1="4" x2="12" y2="20"/></svg>,
  document: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/></svg>,
  monitor: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M12 20V10"/><path d="M18 20V4"/><path d="M6 20v-4"/></svg>,
  settings: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/></svg>,
  users: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>,
  logout: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>,
  menu: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="18" x2="21" y2="18"/></svg>,
  close: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>,
};

const mainMenu = [
  { text: 'Dashboard', icon: icons.dashboard, path: '/', section: 'Menu Utama' },
  { text: 'Jadwal Sholat', icon: icons.clock, path: '/jadwal-sholat', section: 'Menu Utama' },
  { text: 'Kajian', icon: icons.book, path: '/kajian', section: 'Menu Utama' },
  { text: 'Keuangan', icon: icons.wallet, path: '/keuangan', section: 'Menu Utama' },
  { text: 'Agenda', icon: icons.calendar, path: '/agenda', section: 'Menu Utama' },
  { text: 'Running Text', icon: icons.text, path: '/running-text', section: 'Konten' },
  { text: 'Laporan', icon: icons.document, path: '/laporan', section: 'Konten' },
  { text: 'Pengaturan', icon: icons.settings, path: '/settings', section: 'Sistem' },
  { text: 'Monitoring', icon: icons.monitor, path: '/monitoring', section: 'Sistem' },
];

const adminMenu = [
  { text: 'Users', icon: icons.users, path: '/users', section: 'Sistem', roles: ['superadmin'] },
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

  const allMenu = [...mainMenu, ...adminMenu.filter(m => !m.roles || m.roles.includes(user?.role))];
  const sections = [...new Set(allMenu.map(m => m.section))];
  const initials = user?.full_name ? user.full_name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase() : 'AD';

  return (
    <div className="admin-layout">
      <div className="mobile-topbar">
        <button className="mobile-hamburger" onClick={() => setSidebarOpen(!sidebarOpen)} aria-label={sidebarOpen ? 'Tutup menu' : 'Buka menu'} aria-expanded={sidebarOpen}>
          {sidebarOpen ? icons.close : icons.menu}
        </button>
        <div className="mobile-topbar-title">
          <MosqueIcon size={20} />
          <span>Dashboard Masjid</span>
        </div>
        <button className="mobile-topbar-logout" onClick={handleLogout} aria-label="Logout">
          {icons.logout}
        </button>
      </div>

      {sidebarOpen && <div className="mobile-overlay" onClick={() => setSidebarOpen(false)} />}

      <aside className={`sidebar ${sidebarOpen ? 'sidebar-mobile-open' : ''}`}>
        <div className="sidebar-pattern" />
        <div className="sidebar-header">
          <div className="sidebar-header-icon">
            <MosqueIcon size={22} />
          </div>
          <div>
            <h2>Dashboard Masjid</h2>
            <p>Panel Administrator</p>
          </div>
        </div>
        <nav className="sidebar-nav">
          {sections.map(section => (
            <div key={section} className="sidebar-nav-section">
              <div className="sidebar-nav-label">{section}</div>
              {allMenu.filter(m => m.section === section).map(item => (
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
            </div>
          ))}
        </nav>
        <div className="sidebar-footer">
          <div className="sidebar-user-avatar">{initials}</div>
          <div className="sidebar-user-info">
            <div className="sidebar-user-name">{user?.full_name}</div>
            <div className="sidebar-user-role">{user?.role}</div>
          </div>
          <button onClick={handleLogout} className="sidebar-logout" title="Logout" aria-label="Logout">
            {icons.logout}
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
