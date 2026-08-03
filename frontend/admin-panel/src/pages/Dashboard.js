import React, { useState, useEffect } from 'react';
import { dashboardAPI, keuanganAPI } from '../services/api';

const formatCurrency = (amount) => {
  return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(amount || 0);
};

const bookIcon = (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" width="20" height="20">
    <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/>
    <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/>
  </svg>
);

const kajianIconColors = [
  { color: 'var(--blue-600)', bg: 'var(--blue-100)' },
  { color: 'var(--emerald-600)', bg: 'var(--emerald-50)' },
  { color: 'var(--purple-500)', bg: 'var(--purple-100)' },
  { color: 'var(--amber-500)', bg: 'var(--amber-100)' },
];

const getDayBadge = (tanggal) => {
  if (!tanggal) return { label: '', colorClass: '' };
  try {
    const d = new Date(tanggal + 'T00:00:00');
    const day = d.toLocaleDateString('id-ID', { weekday: 'long' });
    const isJumat = day === 'Jumat';
    const isSabtu = day === 'Sabtu';
    const colorClass = isJumat ? 'badge-emerald' : isSabtu ? 'badge-amber' : 'badge-blue';
    return { label: day, colorClass };
  } catch {
    return { label: '', colorClass: '' };
  }
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
    { title: 'Total Transaksi', value: data?.total_transaksi || 0, icon: 'transaksi', color: 'var(--emerald-600)', bg: 'var(--emerald-50)', change: '+12.5%' },
    { title: 'Total Kajian', value: data?.total_kajian || 0, icon: 'kajian', color: 'var(--blue-600)', bg: 'var(--blue-100)', change: '+3 bulan ini' },
    { title: 'Total Agenda', value: data?.total_agenda || 0, icon: 'agenda', color: 'var(--orange-600)', bg: 'var(--orange-100)', change: '+5 minggu ini' },
    { title: 'Saldo Kas Masjid', value: formatCurrency(finance?.saldo || data?.saldo), icon: 'saldo', color: 'var(--amber-500)', bg: 'var(--amber-100)', change: '+8.3%' },
  ];

  const statIconSvgs = {
    transaksi: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/>
      </svg>
    ),
    kajian: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/>
      </svg>
    ),
    agenda: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/>
      </svg>
    ),
    saldo: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M21 12V7H5a2 2 0 0 1 0-4h14v4"/><path d="M3 5v14a2 2 0 0 0 2 2h16v-5"/><path d="M18 12a2 2 0 0 0 0 4h4v-4z"/>
      </svg>
    ),
  };

  const arrowUp = (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="12" height="12">
      <polyline points="23 6 13.5 15.5 8.5 10.5 1 18"/>
    </svg>
  );

  return (
    <div className="animate-in">
      <div className="page-header">
        <div>
          <h1>Dashboard</h1>
          <p className="page-header-subtitle">Ringkasan aktivitas & keuangan masjid</p>
        </div>
        <div className="page-header-actions">
          <button className="btn btn-outline btn-sm">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" width="16" height="16"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
            Export
          </button>
          <button className="btn btn-primary btn-sm">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" width="16" height="16"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
            Tambah Data
          </button>
        </div>
      </div>

      <div className="grid grid-4" style={{ marginBottom: 32 }}>
        {stats.map((card, i) => (
          <div key={i} className={`stat-card animate-in animate-delay-${i + 1}`} style={{ '--stat-color': card.color, '--stat-bg': card.bg }}>
            <div className="stat-icon">
              {statIconSvgs[card.icon]}
            </div>
            <div className="stat-value">{card.value}</div>
            <div className="stat-label">{card.title}</div>
            <div className="stat-change up">
              {arrowUp}
              {card.change}
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-sidebar">
        <div className="card">
          <div className="card-header">
            <h2>Kajian Terdekat</h2>
          </div>
          <div className="card-body" style={{ padding: 0 }}>
            {data?.kajian_terdekat?.length > 0 ? data.kajian_terdekat.map((k, idx) => {
              const ic = kajianIconColors[idx % kajianIconColors.length];
              const isLast = idx === data.kajian_terdekat.length - 1;
              const timingLabel = k.timing || '';
              return (
                <div key={k.id} style={{ padding: '16px 24px', borderBottom: isLast ? 'none' : '1px solid var(--border-light)', display: 'flex', alignItems: 'center', gap: 16 }}>
                  <div style={{ width: 44, height: 44, borderRadius: 'var(--radius)', background: ic.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, color: ic.color }}>
                    {bookIcon}
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontWeight: 600, fontSize: '0.9375rem' }}>{k.judul}</div>
                    <div style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)' }}>{k.ustadz} &bull; {k.tanggal} {k.jam_mulai}</div>
                  </div>
                  {timingLabel && <span className="badge badge-emerald badge-dot">{timingLabel}</span>}
                </div>
              );
            }) : <p className="empty-state">Belum ada kajian terdekat</p>}
          </div>
        </div>

        <div className="card">
          <div className="card-header">
            <h2>Agenda Terdekat</h2>
          </div>
          <div className="card-body" style={{ padding: 0 }}>
            {data?.agenda_terdekat?.length > 0 ? data.agenda_terdekat.map(a => {
              const dayBadge = getDayBadge(a.tanggal);
              const isLast = data.agenda_terdekat.indexOf(a) === data.agenda_terdekat.length - 1;
              return (
                <div key={a.id} style={{ padding: '16px 24px', borderBottom: isLast ? 'none' : '1px solid var(--border-light)' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 8 }}>
                    {dayBadge.label && <span className={`badge ${dayBadge.colorClass}`}>{dayBadge.label}</span>}
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{a.tanggal}</span>
                  </div>
                  <div style={{ fontWeight: 600, fontSize: '0.9375rem' }}>{a.judul}</div>
                  <div style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)', marginTop: 2 }}>
                    {a.jam_mulai}{a.jam_selesai ? ` - ${a.jam_selesai}` : ''}{a.lokasi ? ` \u2022 ${a.lokasi}` : ''}
                  </div>
                </div>
              );
            }) : <p className="empty-state">Belum ada agenda terdekat</p>}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
