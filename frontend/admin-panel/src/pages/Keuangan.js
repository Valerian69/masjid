import React, { useState, useEffect } from 'react';
import { keuanganAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';
import moment from 'moment';

const fmt = (amount) => new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(amount || 0);

const kategoriMasuk = ['Infaq', 'Donasi', 'Sedekah', 'Kas Jumat', 'Dana Pembangunan', 'Zakat', 'Lainnya'];
const kategoriKeluar = ['Operasional', 'Gaji/Insentif', 'Pemeliharaan', 'Listrik & Air', 'Beli Barang', 'Sosial', 'Renovasi', 'Lainnya'];

const Keuangan = () => {
  const { user } = useAuth();
  const canEdit = ['superadmin', 'bendahara'].includes(user?.role);
  const [view, setView] = useState('dashboard');
  const [transaksi, setTransaksi] = useState([]);
  const [summary, setSummary] = useState({});
  const [trend, setTrend] = useState([]);
  const [catMasuk, setCatMasuk] = useState([]);
  const [catKeluar, setCatKeluar] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState({
    tanggal: moment().format('YYYY-MM-DD'), jenis: 'masuk', kategori: 'Infaq',
    deskripsi: '', jumlah: '', metode_pembayaran: 'cash', penerima: '', no_ref: '', catatan: '', status: 'confirmed'
  });
  const [filter, setFilter] = useState({ start_date: '', end_date: '', jenis: '', kategori: '', metode: '', status: '', search: '' });
  const [reportMonth, setReportMonth] = useState({ year: moment().format('YYYY'), month: moment().format('MM') });
  const [reportData, setReportData] = useState(null);

  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      try {
        setLoading(true);
        const p = {};
        Object.keys(filter).forEach(k => { if (filter[k]) p[k] = filter[k]; });
        const [tRes, sRes, mRes, cRes] = await Promise.all([
          keuanganAPI.getAll(p).catch(e => { console.error('[Keuangan] getAll failed:', e?.response?.data || e.message); return { data: [] }; }),
          keuanganAPI.getSummary().catch(e => { console.error('[Keuangan] getSummary failed:', e?.response?.data || e.message); return { data: {} }; }),
          keuanganAPI.getMonthlyTrend().catch(e => { console.error('[Keuangan] getMonthlyTrend failed:', e?.response?.data || e.message); return { data: [] }; }),
          keuanganAPI.getCategoryBreakdown().catch(e => { console.error('[Keuangan] getCategoryBreakdown failed:', e?.response?.data || e.message); return { data: { masuk: [], keluar: [] } }; }),
        ]);
        if (cancelled) return;
        console.log('[Keuangan] loaded:', { transaksi: tRes.data?.length, summary: !!sRes.data?.saldo, trend: mRes.data?.length });
        setTransaksi(Array.isArray(tRes.data) ? tRes.data : []);
        setSummary(sRes.data || {});
        setTrend(Array.isArray(mRes.data) ? mRes.data : []);
        const cd = cRes.data || {};
        setCatMasuk(Array.isArray(cd.masuk) ? cd.masuk : []);
        setCatKeluar(Array.isArray(cd.keluar) ? cd.keluar : []);
      } catch { } finally {
        if (!cancelled) setLoading(false);
      }
    };
    load();
    return () => { cancelled = true; };
  }, [filter.start_date, filter.end_date, filter.jenis, filter.kategori, filter.metode, filter.status, filter.search]);

  const resetForm = () => setForm({
    tanggal: moment().format('YYYY-MM-DD'), jenis: 'masuk', kategori: 'Infaq',
    deskripsi: '', jumlah: '', metode_pembayaran: 'cash', penerima: '', no_ref: '', catatan: '', status: 'confirmed'
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingId) await keuanganAPI.update(editingId, form);
      else await keuanganAPI.create(form);
      setShowForm(false); setEditingId(null); resetForm();
      setFilter({ ...filter });
    } catch (err) { console.error(err); }
  };

  const handleEdit = (item) => {
    setForm({
      tanggal: item.tanggal, jenis: item.jenis, kategori: item.kategori,
      deskripsi: item.deskripsi || '', jumlah: item.jumlah,
      metode_pembayaran: item.metode_pembayaran || 'cash',
      penerima: item.penerima || '', no_ref: item.no_ref || '',
      catatan: item.catatan || '', status: item.status || 'confirmed'
    });
    setEditingId(item.id); setShowForm(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm('Hapus transaksi ini?')) {
      await keuanganAPI.delete(id);
      setFilter({ ...filter });
    }
  };

  const handleExport = async () => {
    try {
      const res = await keuanganAPI.exportCSV(filter);
      const url = window.URL.createObjectURL(new Blob([res.data]));
      const a = document.createElement('a'); a.href = url;
      a.download = `keuangan-${moment().format('YYYY-MM-DD')}.csv`; a.click();
    } catch (err) { console.error(err); }
  };

  const loadReport = async () => {
    try {
      const res = await keuanganAPI.getReport(reportMonth);
      setReportData(res.data);
    } catch (err) { console.error(err); }
  };

  const handleDownloadPDF = async () => {
    try {
      const res = await keuanganAPI.getReportPDF(reportMonth);
      const url = window.URL.createObjectURL(new Blob([res.data], { type: 'application/pdf' }));
      const a = document.createElement('a'); a.href = url;
      a.download = `laporan-keuangan-${reportMonth.year}-${reportMonth.month}.pdf`;
      document.body.appendChild(a); a.click(); a.remove();
      window.URL.revokeObjectURL(url);
    } catch (err) { console.error(err); }
  };

  const changeFilter = (key, value) => setFilter(prev => ({ ...prev, [key]: value }));
  const maxTrend = Math.max(...trend.map(t => Math.max(t.masuk || 0, t.keluar || 0)), 1);
  const totalCM = catMasuk.reduce((s, c) => s + (c.jumlah || 0), 0) || 1;
  const totalCK = catKeluar.reduce((s, c) => s + (c.jumlah || 0), 0) || 1;

  if (loading) {
    return (
      <div className="animate-in">
        <div className="page-header"><div><h1>Keuangan</h1><p className="page-header-subtitle">Kelola transaksi &amp; laporan keuangan masjid</p></div></div>
        <div style={{ display: 'flex', justifyContent: 'center', padding: '80px 0', color: '#7a9a8e' }}>
          <div style={{ textAlign: 'center' }}>
            <div style={{ width: 32, height: 32, border: '3px solid #e2e8f0', borderTopColor: '#146b4a', borderRadius: '50%', animation: 'spin 0.8s linear infinite', margin: '0 auto 12px' }} />
            <p>Memuat data keuangan...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="animate-in">
      <div className="page-header">
        <div>
          <h1>Keuangan</h1>
          <p className="page-header-subtitle">Kelola transaksi &amp; laporan keuangan masjid</p>
        </div>
        <div className="page-header-actions">
          <button onClick={handleExport} className="btn btn-outline btn-sm">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ marginRight: 6 }}><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" /><polyline points="7 10 12 15 17 10" /><line x1="12" y1="15" x2="12" y2="3" /></svg>
            Export CSV
          </button>
          {canEdit && (
            <button onClick={() => { setShowForm(!showForm); setEditingId(null); resetForm(); }} className="btn btn-primary btn-sm">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ marginRight: 6 }}><line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" /></svg>
              Transaksi Baru
            </button>
          )}
        </div>
      </div>

      <div className="tabs" style={{ marginBottom: 24, width: 'fit-content' }}>
        {['dashboard', 'transaksi', 'laporan'].map(v => (
          <button key={v} onClick={() => { setView(v); if (v === 'laporan') loadReport(); }} className={`tab ${view === v ? 'active' : ''}`}>
            {v === 'dashboard' ? 'Dashboard' : v === 'transaksi' ? 'Transaksi' : 'Laporan'}
          </button>
        ))}
      </div>

      {view === 'dashboard' && (
        <>
          <div className="grid grid-4" style={{ marginBottom: 32 }}>
            {[
              { label: 'Saldo Total', value: fmt(summary.saldo), color: '#d4913d', bg: 'rgba(212,145,61,0.08)', icon: 'M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6' },
              { label: 'Bulan Ini Masuk', value: fmt(summary.bulan_ini_masuk), color: '#0b3d2e', bg: 'rgba(11,61,46,0.06)', icon: 'M12 19V5M5 12l7-7 7 7' },
              { label: 'Bulan Ini Keluar', value: fmt(summary.bulan_ini_keluar), color: '#c62828', bg: 'rgba(198,40,40,0.06)', icon: 'M12 5v14M5 12l7 7 7-7' },
              { label: 'Transaksi Bulan Ini', value: summary.jumlah_transaksi_bulan || 0, color: '#1565c0', bg: 'rgba(21,101,192,0.06)', icon: 'M9 5H7a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2h-2M9 5a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2M9 5h6', isNumber: true },
            ].map((card, i) => (
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
                        <div className="bar-chart-bar masuk" style={{ height: `${((item.masuk || 0) / maxTrend) * 130}px` }} title={`Masuk: ${fmt(item.masuk)}`} />
                        <div className="bar-chart-bar keluar" style={{ height: `${((item.keluar || 0) / maxTrend) * 130}px` }} title={`Keluar: ${fmt(item.keluar)}`} />
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
                        <div className="bar-value">{fmt(cat.jumlah)}</div>
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
                        <div className="bar-value">{fmt(cat.jumlah)}</div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="card">
            <div className="card-header">
              <h2>Transaksi Terakhir</h2>
            </div>
            {transaksi.slice(0, 8).map((item) => (
              <div key={item.id} className="transaction-row">
                <div className="transaction-left">
                  <div className={`transaction-icon ${item.jenis}`}>{item.jenis === 'masuk' ? '\u2191' : '\u2193'}</div>
                  <div>
                    <div className="transaction-info-title">{item.kategori}{item.penerima ? ` \u2014 ${item.penerima}` : ''}</div>
                    <div className="transaction-info-sub">{item.tanggal}{item.deskripsi ? ` \u00b7 ${item.deskripsi.slice(0, 40)}` : ''}</div>
                  </div>
                </div>
                <div className={`transaction-amount ${item.jenis}`}>
                  {item.jenis === 'masuk' ? '+' : '-'}{fmt(item.jumlah)}
                </div>
              </div>
            ))}
          </div>
        </>
      )}

      {view === 'transaksi' && (
        <>
          {showForm && canEdit && (
            <form onSubmit={handleSubmit} className="card">
              <div className="card-body">
              <h3 style={{ fontSize: '1rem', fontWeight: 600, color: '#333', marginBottom: 16 }}>{editingId ? 'Edit Transaksi' : 'Transaksi Baru'}</h3>
              <div className="admin-form-grid-4">
                <div className="form-group">
                  <label className="form-label">Tanggal</label>
                  <input type="date" value={form.tanggal} onChange={e => setForm({...form, tanggal: e.target.value})} className="form-input" required />
                </div>
                <div className="form-group">
                  <label className="form-label">Jenis</label>
                  <select value={form.jenis} onChange={e => setForm({...form, jenis: e.target.value, kategori: e.target.value === 'masuk' ? 'Infaq' : 'Operasional'})} className="form-input">
                    <option value="masuk">Pemasukan</option><option value="keluar">Pengeluaran</option>
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label">Kategori</label>
                  <select value={form.kategori} onChange={e => setForm({...form, kategori: e.target.value})} className="form-input">
                    {(form.jenis === 'masuk' ? kategoriMasuk : kategoriKeluar).map(k => <option key={k} value={k}>{k}</option>)}
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label">Jumlah (Rp)</label>
                  <input type="number" value={form.jumlah} onChange={e => setForm({...form, jumlah: e.target.value})} className="form-input" required min="0" placeholder="0" />
                </div>
                <div className="form-group">
                  <label className="form-label">Metode Pembayaran</label>
                  <select value={form.metode_pembayaran} onChange={e => setForm({...form, metode_pembayaran: e.target.value})} className="form-input">
                    <option value="cash">Tunai</option><option value="transfer">Transfer</option><option value="e-wallet">E-Wallet</option>
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label">{form.jenis === 'masuk' ? 'Pemberi' : 'Penerima'}</label>
                  <input value={form.penerima} onChange={e => setForm({...form, penerima: e.target.value})} className="form-input" placeholder="Nama pihak terkait" />
                </div>
                <div className="form-group">
                  <label className="form-label">No. Referensi</label>
                  <input value={form.no_ref} onChange={e => setForm({...form, no_ref: e.target.value})} className="form-input" placeholder="TRF-XXXX-XXX" />
                </div>
                <div className="form-group">
                  <label className="form-label">Status</label>
                  <select value={form.status} onChange={e => setForm({...form, status: e.target.value})} className="form-input">
                    <option value="confirmed">Dikonfirmasi</option><option value="pending">Menunggu</option><option value="cancelled">Dibatalkan</option>
                  </select>
                </div>
                <div className="form-group admin-form-full">
                  <label className="form-label">Deskripsi</label>
                  <input value={form.deskripsi} onChange={e => setForm({...form, deskripsi: e.target.value})} className="form-input" placeholder="Deskripsi singkat transaksi" />
                </div>
                <div className="form-group admin-form-full">
                  <label className="form-label">Catatan Tambahan</label>
                  <input value={form.catatan} onChange={e => setForm({...form, catatan: e.target.value})} className="form-input" placeholder="Catatan internal (opsional)" />
                </div>
              </div>
              <div className="admin-form-actions">
                <button type="submit" className="btn btn-amber">{editingId ? 'Update Transaksi' : 'Simpan Transaksi'}</button>
                <button type="button" onClick={() => { setShowForm(false); setEditingId(null); }} className="btn btn-outline">Batal</button>
              </div>
              </div>
            </form>
          )}

          <div className="filter-bar">
            <div className="filter-row">
              <div className="form-group flex-grow">
                <label className="form-label">Cari</label>
                <input value={filter.search} onChange={e => changeFilter('search', e.target.value)} className="form-input" placeholder="Deskripsi, kategori, catatan..." />
              </div>
              <div className="form-group">
                <label className="form-label">Dari</label>
                <input type="date" value={filter.start_date} onChange={e => changeFilter('start_date', e.target.value)} className="form-input" />
              </div>
              <div className="form-group">
                <label className="form-label">Sampai</label>
                <input type="date" value={filter.end_date} onChange={e => changeFilter('end_date', e.target.value)} className="form-input" />
              </div>
              <div className="form-group">
                <label className="form-label">Jenis</label>
                <select value={filter.jenis} onChange={e => changeFilter('jenis', e.target.value)} className="form-input">
                  <option value="">Semua</option><option value="masuk">Masuk</option><option value="keluar">Keluar</option>
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">Metode</label>
                <select value={filter.metode} onChange={e => changeFilter('metode', e.target.value)} className="form-input">
                  <option value="">Semua</option><option value="cash">Tunai</option><option value="transfer">Transfer</option><option value="e-wallet">E-Wallet</option>
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">Status</label>
                <select value={filter.status} onChange={e => changeFilter('status', e.target.value)} className="form-input">
                  <option value="">Semua</option><option value="confirmed">Dikonfirmasi</option><option value="pending">Menunggu</option><option value="cancelled">Dibatalkan</option>
                </select>
              </div>
            </div>
          </div>

          <div className="table-wrapper">
            <table className="table">
              <thead>
                <tr>
                  <th>Tanggal</th><th>Jenis</th><th>Kategori</th><th>Metode</th><th>Pihak Terkait</th><th>Deskripsi</th><th className="text-right">Jumlah</th><th>Status</th><th className="text-center">Aksi</th>
                </tr>
              </thead>
              <tbody>
                {transaksi.map(item => (
                  <tr key={item.id}>
                    <td>{moment(item.tanggal).format('DD MMM YYYY')}</td>
                    <td>
                      <span className={`badge ${item.jenis === 'masuk' ? 'badge-emerald' : 'badge-red'}`}>
                        {item.jenis === 'masuk' ? '\u2191 Masuk' : '\u2193 Keluar'}
                      </span>
                    </td>
                    <td style={{ fontWeight: 500 }}>{item.kategori}</td>
                    <td style={{ textTransform: 'capitalize' }}>{item.metode_pembayaran === 'cash' ? 'Tunai' : item.metode_pembayaran === 'transfer' ? 'Transfer' : 'E-Wallet'}</td>
                    <td>{item.penerima || '-'}</td>
                    <td style={{ maxWidth: 200, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{item.deskripsi || '-'}</td>
                    <td className="text-right" style={{ fontWeight: 600, color: item.jenis === 'masuk' ? '#0b3d2e' : '#c62828' }}>
                      {item.jenis === 'masuk' ? '+' : '-'}{fmt(item.jumlah)}
                    </td>
                    <td>
                      <span className={`badge ${item.status === 'confirmed' ? 'badge-emerald' : item.status === 'pending' ? 'badge-amber' : 'badge-red'}`}>
                        {item.status === 'confirmed' ? 'Dikonfirmasi' : item.status === 'pending' ? 'Menunggu' : 'Dibatalkan'}
                      </span>
                    </td>
                    <td className="text-center">
                      {canEdit && (
                        <>
                          <button onClick={() => handleEdit(item)} className="btn btn-ghost btn-sm" style={{ marginRight: 6 }}>Edit</button>
                          <button onClick={() => handleDelete(item.id)} className="btn btn-danger btn-sm">Hapus</button>
                        </>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {transaksi.length === 0 && <p className="empty-state">Tidak ada transaksi ditemukan</p>}
          </div>
        </>
      )}

      {view === 'laporan' && (
        <>
          <div className="filter-row" style={{ marginBottom: 20 }}>
            <div className="form-group">
              <label className="form-label">Bulan</label>
              <select value={reportMonth.month} onChange={e => setReportMonth({...reportMonth, month: e.target.value})} className="form-input">
                {Array.from({length:12}, (_, i) => String(i+1).padStart(2,'0')).map(m => (
                  <option key={m} value={m}>{moment(m, 'MM').format('MMMM')}</option>
                ))}
              </select>
            </div>
            <div className="form-group">
              <label className="form-label">Tahun</label>
              <select value={reportMonth.year} onChange={e => setReportMonth({...reportMonth, year: e.target.value})} className="form-input">
                {[2026, 2025].map(y => <option key={y} value={y}>{y}</option>)}
              </select>
            </div>
            <button onClick={loadReport} className="btn btn-primary">Lihat Laporan</button>
            <button onClick={handleDownloadPDF} className="btn btn-danger">Download PDF</button>
          </div>

          {reportData && reportData.summary && (
            <>
              <div className="two-col-grid">
                <div className="card">
                  <div className="card-header"><h2 style={{ color: '#0b3d2e' }}>Pemasukan per Kategori</h2></div>
                  {(reportData.summary || []).filter(s => s.masuk > 0).map((s, i) => (
                    <div key={i} className="transaction-row">
                      <span style={{ fontSize: '0.85rem' }}>{s.kategori}</span>
                      <span style={{ color: '#0b3d2e', fontWeight: 600 }}>{fmt(s.masuk)}</span>
                    </div>
                  ))}
                  <div className="transaction-row" style={{ fontWeight: 700, borderTop: '2px solid #0b3d2e', marginTop: 8 }}>
                    <span>Total Masuk</span>
                    <span style={{ color: '#0b3d2e' }}>{fmt((reportData.summary || []).reduce((s, x) => s + (x.masuk || 0), 0))}</span>
                  </div>
                </div>

                <div className="card">
                  <div className="card-header"><h2 style={{ color: '#c62828' }}>Pengeluaran per Kategori</h2></div>
                  {(reportData.summary || []).filter(s => s.keluar > 0).map((s, i) => (
                    <div key={i} className="transaction-row">
                      <span style={{ fontSize: '0.85rem' }}>{s.kategori}</span>
                      <span style={{ color: '#c62828', fontWeight: 600 }}>{fmt(s.keluar)}</span>
                    </div>
                  ))}
                  <div className="transaction-row" style={{ fontWeight: 700, borderTop: '2px solid #c62828', marginTop: 8 }}>
                    <span>Total Keluar</span>
                    <span style={{ color: '#c62828' }}>{fmt((reportData.summary || []).reduce((s, x) => s + (x.keluar || 0), 0))}</span>
                  </div>
                </div>
              </div>

              <div className="card" style={{ marginBottom: 24 }}>
                <div className="keuangan-summary-inline" style={{ display: 'flex', justifyContent: 'space-around', textAlign: 'center', gap: 16, flexWrap: 'wrap' }}>
                  <div>
                    <div style={{ fontSize: '0.75rem', color: '#7a9a8e', textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: 4 }}>Total Masuk</div>
                    <div style={{ fontSize: '1.3rem', fontWeight: 700, color: '#0b3d2e' }}>{fmt((reportData.summary || []).reduce((s, x) => s + (x.masuk || 0), 0))}</div>
                  </div>
                  <div>
                    <div style={{ fontSize: '0.75rem', color: '#7a9a8e', textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: 4 }}>Total Keluar</div>
                    <div style={{ fontSize: '1.3rem', fontWeight: 700, color: '#c62828' }}>{fmt((reportData.summary || []).reduce((s, x) => s + (x.keluar || 0), 0))}</div>
                  </div>
                  <div>
                    <div style={{ fontSize: '0.75rem', color: '#7a9a8e', textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: 4 }}>Selisih</div>
                    <div style={{ fontSize: '1.3rem', fontWeight: 700, color: '#d4913d' }}>
                      {fmt((reportData.summary || []).reduce((s, x) => s + (x.masuk || 0), 0) - (reportData.summary || []).reduce((s, x) => s + (x.keluar || 0), 0))}
                    </div>
                  </div>
                </div>
              </div>

              <div className="table-wrapper">
                <table className="table">
                  <thead>
                    <tr><th>Tanggal</th><th>Jenis</th><th>Kategori</th><th>Deskripsi</th><th className="text-right">Jumlah</th></tr>
                  </thead>
                  <tbody>
                    {(reportData.detail || []).map(item => (
                      <tr key={item.id}>
                        <td>{moment(item.tanggal).format('DD MMM YYYY')}</td>
                        <td>
                      <span className={`badge ${item.jenis === 'masuk' ? 'badge-emerald' : 'badge-red'}`}>
                            {item.jenis === 'masuk' ? '\u2191 Masuk' : '\u2193 Keluar'}
                          </span>
                        </td>
                        <td>{item.kategori}</td>
                        <td>{item.deskripsi || '-'}</td>
                        <td className="text-right" style={{ fontWeight: 600, color: item.jenis === 'masuk' ? '#0b3d2e' : '#c62828' }}>
                          {item.jenis === 'masuk' ? '+' : '-'}{fmt(item.jumlah)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </>
          )}
        </>
      )}
    </div>
  );
};

export default Keuangan;
