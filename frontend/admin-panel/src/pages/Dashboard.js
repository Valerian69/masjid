import React, { useState, useEffect } from 'react';
import { dashboardAPI, keuanganAPI } from '../services/api';

const formatCurrency = (amount) => {
  return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(amount || 0);
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

  if (loading) return <div className="empty-state">Memuat...</div>;

  return (
    <div className="animate-in">
      <div className="page-header">
        <div>
          <h1>Dashboard</h1>
          <p className="page-header-subtitle">Ringkasan aktivitas & keuangan masjid</p>
        </div>
      </div>

      <div className="stat-grid">
        {[
          { title: 'Total Transaksi', value: data?.total_transaksi || 0, color: '#0b3d2e', bg: 'rgba(11,61,46,0.04)' },
          { title: 'Total Kajian', value: data?.total_kajian || 0, color: '#1565c0', bg: 'rgba(21,101,192,0.04)' },
          { title: 'Total Agenda', value: data?.total_agenda || 0, color: '#e65100', bg: 'rgba(230,81,0,0.04)' },
          { title: 'Saldo Kas', value: formatCurrency(finance?.saldo || data?.saldo), color: '#d4913d', bg: 'rgba(212,145,61,0.04)' },
        ].map((card, i) => (
          <div key={i} className="stat-card" style={{ borderLeftColor: card.color, background: card.bg, animationDelay: `${i * 60}ms` }}>
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
