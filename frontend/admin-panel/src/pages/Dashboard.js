import React, { useState, useEffect } from 'react';
import { dashboardAPI, keuanganAPI } from '../services/api';

const formatCurrency = (amount) => {
  return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(amount || 0);
};

const statIcons = {
  transaksi: (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/>
    </svg>
  ),
  kajian: (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/>
    </svg>
  ),
  agenda: (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/>
    </svg>
  ),
  saldo: (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/>
    </svg>
  ),
};

const Dashboard = () => {
  const [data, setData] = useState(null);
  const [finance, setFinance] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      dashboardAPI.getAdmin(),
      keuanganAPI.getSummary()
    ]).then(([dashRes, finRes]) => {
      setData(dashRes.data);
      setFinance(finRes.data);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, []);

  if (loading) return <div className="loading-state">Memuat data...</div>;

  const stats = [
    { title: 'Total Transaksi', value: data?.total_transaksi || 0, icon: statIcons.transaksi, color: 'var(--emerald-600)', bg: 'rgba(11,61,46,0.04)' },
    { title: 'Total Kajian', value: data?.total_kajian || 0, icon: statIcons.kajian, color: '#1565c0', bg: 'rgba(21,101,192,0.04)' },
    { title: 'Total Agenda', value: data?.total_agenda || 0, icon: statIcons.agenda, color: 'var(--amber)', bg: 'rgba(212,145,61,0.04)' },
    { title: 'Saldo Kas Masjid', value: formatCurrency(finance?.saldo || data?.saldo), icon: statIcons.saldo, color: 'var(--warm)', bg: 'rgba(212,145,61,0.04)' },
  ];

  return (
    <div className="animate-in">
      <div className="page-header">
        <div>
          <h1>Dashboard</h1>
          <p className="page-header-subtitle">Ringkasan aktivitas & keuangan masjid</p>
        </div>
      </div>

      <div className="stat-grid">
        {stats.map((card, i) => (
          <div key={i} className="stat-card" style={{ borderLeftColor: card.color, background: card.bg, animationDelay: `${i * 60}ms` }}>
            <div className="stat-card-header">
              <div className="stat-card-icon" style={{ color: card.color, background: card.bg }}>
                {card.icon}
              </div>
            </div>
            <div className="stat-card-label">{card.title}</div>
            <div className="stat-card-value" style={{ color: card.color }}>{card.value}</div>
          </div>
        ))}
      </div>

      <div className="two-col-grid">
        <div className="admin-card">
          <div className="admin-card-title">Kajian Terdekat</div>
          {data?.kajian_terdekat?.length > 0 ? data.kajian_terdekat.map(k => (
            <div key={k.id} className="list-item">
              <div className="list-item-title">{k.judul}</div>
              <div className="list-item-sub">{k.ustadz} • {k.tanggal} {k.jam_mulai}</div>
            </div>
          )) : <p className="empty-state">Belum ada kajian terdekat</p>}
        </div>

        <div className="admin-card">
          <div className="admin-card-title">Agenda Terdekat</div>
          {data?.agenda_terdekat?.length > 0 ? data.agenda_terdekat.map(a => (
            <div key={a.id} className="list-item">
              <div className="list-item-title">{a.judul}</div>
              <div className="list-item-sub">{a.tanggal}{a.lokasi ? ` • ${a.lokasi}` : ''}</div>
            </div>
          )) : <p className="empty-state">Belum ada agenda terdekat</p>}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
