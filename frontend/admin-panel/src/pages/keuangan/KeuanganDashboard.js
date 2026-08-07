import React from 'react';
import { formatIDR } from '../../utils/format';

const KeuanganDashboard = ({ summary, trend, catMasuk, catKeluar, transaksi }) => {
  const maxTrend = Math.max(...trend.map((t) => Math.max(t.masuk || 0, t.keluar || 0)), 1);
  const totalCM = catMasuk.reduce((s, c) => s + (c.jumlah || 0), 0) || 1;
  const totalCK = catKeluar.reduce((s, c) => s + (c.jumlah || 0), 0) || 1;

  const cards = [
    { label: 'Saldo Total', value: formatIDR(summary.saldo), color: '#d4913d', bg: 'rgba(212,145,61,0.08)', icon: 'M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6' },
    { label: 'Bulan Ini Masuk', value: formatIDR(summary.bulan_ini_masuk), color: '#0b3d2e', bg: 'rgba(11,61,46,0.06)', icon: 'M12 19V5M5 12l7-7 7 7' },
    { label: 'Bulan Ini Keluar', value: formatIDR(summary.bulan_ini_keluar), color: '#c62828', bg: 'rgba(198,40,40,0.06)', icon: 'M12 5v14M5 12l7 7 7-7' },
    { label: 'Transaksi Bulan Ini', value: summary.jumlah_transaksi_bulan || 0, color: '#1565c0', bg: 'rgba(21,101,192,0.06)', icon: 'M9 5H7a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2h-2M9 5a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2M9 5h6', isNumber: true },
  ];

  return (
    <>
      <div className="grid grid-4" style={{ marginBottom: 32 }} data-tour="keu-summary">
        {cards.map((card, i) => (
          <div key={i} className="stat-card" style={{ '--stat-color': card.color, '--stat-bg': card.bg }}>
            <div className="stat-icon" style={{ background: card.bg, color: card.color }}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d={card.icon} /></svg>
            </div>
            <div>
              <div className="stat-value" style={{ color: card.color, fontSize: card.isNumber ? '1.5rem' : '1.25rem' }}>{card.value}</div>
              <div className="stat-label">{card.label}</div>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-sidebar">
        <div className="card">
          <div className="card-header"><h2>Tren 6 Bulan Terakhir</h2></div>
          <div className="card-body">
            <div className="bar-chart">
              {(trend || []).map((item, i) => (
                <div key={i} className="bar-chart-col">
                  <div className="bar-chart-bars">
                    <div className="bar-chart-bar masuk" style={{ height: `${((item.masuk || 0) / maxTrend) * 130}px` }} title={`Masuk: ${formatIDR(item.masuk)}`} />
                    <div className="bar-chart-bar keluar" style={{ height: `${((item.keluar || 0) / maxTrend) * 130}px` }} title={`Keluar: ${formatIDR(item.keluar)}`} />
                  </div>
                  <div className="bar-chart-label">{item.label}</div>
                </div>
              ))}
            </div>
            <div className="bar-chart-legend">
              <div className="bar-chart-legend-item"><div className="bar-chart-legend-dot" style={{ background: '#0b3d2e' }} /> Masuk</div>
              <div className="bar-chart-legend-item"><div className="bar-chart-legend-dot" style={{ background: '#c62828' }} /> Keluar</div>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="card-header"><h2>Kategori Bulan Ini</h2></div>
          <div className="card-body">
            {catMasuk.length > 0 && (
              <div style={{ marginBottom: 16 }}>
                <div className="category-section-title" style={{ color: '#0b3d2e' }}>Pemasukan</div>
                {catMasuk.slice(0, 4).map((cat, i) => (
                  <div key={i} className="category-bar">
                    <div className="bar-name">{cat.kategori}</div>
                    <div className="bar-track">
                      <div className="bar-fill green" style={{ width: `${((cat.jumlah || 0) / totalCM) * 100}%` }} />
                    </div>
                    <div className="bar-value">{formatIDR(cat.jumlah)}</div>
                  </div>
                ))}
              </div>
            )}
            {catKeluar.length > 0 && (
              <div>
                <div className="category-section-title" style={{ color: '#c62828' }}>Pengeluaran</div>
                {catKeluar.slice(0, 4).map((cat, i) => (
                  <div key={i} className="category-bar">
                    <div className="bar-name">{cat.kategori}</div>
                    <div className="bar-track">
                      <div className="bar-fill red" style={{ width: `${((cat.jumlah || 0) / totalCK) * 100}%` }} />
                    </div>
                    <div className="bar-value">{formatIDR(cat.jumlah)}</div>
                  </div>
                ))}
              </div>
            )}
            {catMasuk.length === 0 && catKeluar.length === 0 && (
              <p style={{ padding: '24px 0', textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.875rem', margin: 0 }}>Belum ada data kategori bulan ini</p>
            )}
          </div>
        </div>
      </div>

      <div className="card">
        <div className="card-header"><h2>Transaksi Terakhir</h2></div>
        {transaksi.slice(0, 8).map((item) => (
          <div key={item.id} className="transaction-row">
            <div className="transaction-left">
              <div className={`transaction-icon ${item.jenis}`}>{item.jenis === 'masuk' ? '↑' : '↓'}</div>
              <div>
                <div className="transaction-info-title">{item.kategori}{item.penerima ? ` — ${item.penerima}` : ''}</div>
                <div className="transaction-info-sub">{item.tanggal}{item.deskripsi ? ` · ${item.deskripsi.slice(0, 40)}` : ''}</div>
              </div>
            </div>
            <div className={`transaction-amount ${item.jenis}`}>
              {item.jenis === 'masuk' ? '+' : '-'}{formatIDR(item.jumlah)}
            </div>
          </div>
        ))}
        {transaksi.length === 0 && (
          <p style={{ padding: '24px', textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.875rem', margin: 0 }}>Belum ada transaksi</p>
        )}
      </div>
    </>
  );
};

export default KeuanganDashboard;
