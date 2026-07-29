import React, { useState, useEffect } from 'react';
import { dashboardAPI, keuanganAPI } from '../services/api';

const formatCurrency = (amount) => {
  return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(amount || 0);
};

const StatCard = ({ title, value, color, bg }) => (
  <div style={{
    background: bg || 'white', borderRadius: 12, padding: 20,
    boxShadow: '0 1px 4px rgba(0,0,0,0.06)', borderLeft: `4px solid ${color}`
  }}>
    <div style={{ fontSize: '0.75rem', color: '#7a9a8e', marginBottom: 8, fontWeight: 500, textTransform: 'uppercase', letterSpacing: '0.04em' }}>{title}</div>
    <div style={{ fontSize: '1.4rem', fontWeight: 700, color, fontVariantNumeric: 'tabular-nums' }}>{value}</div>
  </div>
);

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

  if (loading) return <p style={{ color: '#7a9a8e' }}>Memuat...</p>;

  return (
    <div style={{ fontFamily: 'Outfit, sans-serif' }}>
      <h1 style={{ fontSize: '1.5rem', fontWeight: 700, marginBottom: 24, color: '#0b3d2e' }}>Dashboard</h1>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16, marginBottom: 24 }}>
        <StatCard title="Total Transaksi" value={data?.total_transaksi || 0} color="#0b3d2e" bg="rgba(11,61,46,0.04)" />
        <StatCard title="Total Kajian" value={data?.total_kajian || 0} color="#1565c0" bg="rgba(21,101,192,0.04)" />
        <StatCard title="Total Agenda" value={data?.total_agenda || 0} color="#e65100" bg="rgba(230,81,0,0.04)" />
        <StatCard title="Saldo Kas" value={formatCurrency(finance?.saldo || data?.saldo)} color="#d4913d" bg="rgba(212,145,61,0.04)" />
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
        <div style={{ background: 'white', borderRadius: 12, padding: 20, boxShadow: '0 1px 4px rgba(0,0,0,0.06)' }}>
          <h3 style={{ fontSize: '0.9rem', fontWeight: 600, marginBottom: 16, color: '#333' }}>Kajian Terdekat</h3>
          {data?.kajian_terdekat?.length > 0 ? data.kajian_terdekat.map(k => (
            <div key={k.id} style={{ padding: '10px 0', borderBottom: '1px solid #f5f5f5' }}>
              <div style={{ fontWeight: 500, fontSize: '0.88rem', color: '#333' }}>{k.judul}</div>
              <div style={{ fontSize: '0.78rem', color: '#999', marginTop: 2 }}>{k.ustadz} • {k.tanggal} {k.jam_mulai}</div>
            </div>
          )) : <p style={{ color: '#999', fontSize: '0.85rem' }}>Belum ada kajian terdekat</p>}
        </div>

        <div style={{ background: 'white', borderRadius: 12, padding: 20, boxShadow: '0 1px 4px rgba(0,0,0,0.06)' }}>
          <h3 style={{ fontSize: '0.9rem', fontWeight: 600, marginBottom: 16, color: '#333' }}>Agenda Terdekat</h3>
          {data?.agenda_terdekat?.length > 0 ? data.agenda_terdekat.map(a => (
            <div key={a.id} style={{ padding: '10px 0', borderBottom: '1px solid #f5f5f5' }}>
              <div style={{ fontWeight: 500, fontSize: '0.88rem', color: '#333' }}>{a.judul}</div>
              <div style={{ fontSize: '0.78rem', color: '#999', marginTop: 2 }}>{a.tanggal}{a.lokasi ? ` • ${a.lokasi}` : ''}</div>
            </div>
          )) : <p style={{ color: '#999', fontSize: '0.85rem' }}>Belum ada agenda terdekat</p>}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
