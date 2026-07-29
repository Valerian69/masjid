import React, { useState, useEffect, useCallback } from 'react';
import { keuanganAPI } from '../services/api';
import moment from 'moment';

const formatCurrency = (amount) => new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(amount || 0);

const kategoriMasuk = ['Infaq', 'Donasi', 'Sedekah', 'Kas Jumat', 'Dana Pembangunan', 'Zakat', 'Lainnya'];
const kategoriKeluar = ['Operasional', 'Gaji/Insentif', 'Pemeliharaan', 'Listrik & Air', 'Beli Barang', 'Sosial', 'Renovasi', 'Lainnya'];
const metodeOptions = ['cash', 'transfer', 'e-wallet'];
const statusOptions = ['confirmed', 'pending', 'cancelled'];

const COLORS = ['#0b3d2e', '#146b4a', '#1a9e68', '#d4913d', '#f0c66e', '#2196f3', '#9c27b0', '#e91e63'];

const Keuangan = () => {
  const [view, setView] = useState('dashboard');
  const [transaksi, setTransaksi] = useState([]);
  const [summary, setSummary] = useState({});
  const [trend, setTrend] = useState([]);
  const [categoryBreakdown, setCategoryBreakdown] = useState({ masuk: [], keluar: [] });
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState({
    tanggal: moment().format('YYYY-MM-DD'), jenis: 'masuk', kategori: 'Infaq',
    deskripsi: '', jumlah: '', metode_pembayaran: 'cash', penerima: '', no_ref: '', catatan: '', status: 'confirmed'
  });
  const [filter, setFilter] = useState({ start_date: '', end_date: '', jenis: '', kategori: '', metode: '', status: '', search: '' });
  const [reportMonth, setReportMonth] = useState({ year: moment().format('YYYY'), month: moment().format('MM') });
  const [reportData, setReportData] = useState(null);

  const loadData = useCallback(async () => {
    try {
      const [transRes, summaryRes, trendRes, catRes] = await Promise.all([
        keuanganAPI.getAll(filter),
        keuanganAPI.getSummary(),
        keuanganAPI.getMonthlyTrend(),
        keuanganAPI.getCategoryBreakdown()
      ]);
      setTransaksi(transRes.data);
      setSummary(summaryRes.data);
      setTrend(trendRes.data);
      setCategoryBreakdown(catRes.data);
    } catch (err) {
      console.error('Failed to load finance data:', err);
    }
  }, [filter]);

  useEffect(() => { loadData(); }, [loadData]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingId) {
        await keuanganAPI.update(editingId, form);
      } else {
        await keuanganAPI.create(form);
      }
      setShowForm(false);
      setEditingId(null);
      resetForm();
      loadData();
    } catch (err) {
      console.error('Failed to save transaction:', err);
    }
  };

  const handleEdit = (item) => {
    setForm({
      tanggal: item.tanggal, jenis: item.jenis, kategori: item.kategori,
      deskripsi: item.deskripsi || '', jumlah: item.jumlah,
      metode_pembayaran: item.metode_pembayaran || 'cash',
      penerima: item.penerima || '', no_ref: item.no_ref || '',
      catatan: item.catatan || '', status: item.status || 'confirmed'
    });
    setEditingId(item.id);
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm('Hapus transaksi ini? Tindakan ini tidak dapat dibatalkan.')) {
      await keuanganAPI.delete(id);
      loadData();
    }
  };

  const resetForm = () => {
    setForm({
      tanggal: moment().format('YYYY-MM-DD'), jenis: 'masuk', kategori: 'Infaq',
      deskripsi: '', jumlah: '', metode_pembayaran: 'cash', penerima: '', no_ref: '', catatan: '', status: 'confirmed'
    });
  };

  const handleExport = async () => {
    try {
      const res = await keuanganAPI.exportCSV(filter);
      const url = window.URL.createObjectURL(new Blob([res.data]));
      const a = document.createElement('a');
      a.href = url;
      a.download = `keuangan-${moment().format('YYYY-MM-DD')}.csv`;
      a.click();
    } catch (err) {
      console.error('Export failed:', err);
    }
  };

  const loadReport = async () => {
    try {
      const res = await keuanganAPI.getReport(reportMonth);
      setReportData(res.data);
    } catch (err) {
      console.error('Failed to load report:', err);
    }
  };

  const handleDownloadPDF = async () => {
    try {
      const res = await keuanganAPI.getReportPDF(reportMonth);
      const url = window.URL.createObjectURL(new Blob([res.data], { type: 'application/pdf' }));
      const a = document.createElement('a');
      a.href = url;
      a.download = `laporan-keuangan-${reportMonth.year}-${reportMonth.month}.pdf`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      console.error('Failed to download PDF:', err);
    }
  };

  const changeFilter = (key, value) => {
    setFilter(prev => ({ ...prev, [key]: value }));
  };

  const inputStyle = { width: '100%', padding: '10px 12px', border: '1.5px solid #d4ddd8', borderRadius: 8, fontSize: '0.88rem', boxSizing: 'border-box', fontFamily: 'Outfit, sans-serif', outline: 'none' };
  const labelStyle = { display: 'block', fontSize: '0.78rem', marginBottom: 6, fontWeight: 500, color: '#4a6a5e', letterSpacing: '0.02em' };

  const maxTrend = Math.max(...trend.map(t => Math.max(t.masuk, t.keluar)), 1);

  const totalCategoryMasuk = categoryBreakdown.masuk.reduce((s, c) => s + c.jumlah, 0) || 1;
  const totalCategoryKeluar = categoryBreakdown.keluar.reduce((s, c) => s + c.jumlah, 0) || 1;

  return (
    <div style={{ fontFamily: 'Outfit, sans-serif' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <div>
          <h1 style={{ fontSize: '1.5rem', fontWeight: 700, color: '#0b3d2e', margin: 0 }}>Keuangan Masjid</h1>
          <p style={{ fontSize: '0.82rem', color: '#7a9a8e', marginTop: 4 }}>Kelola pemasukan dan pengeluaran secara detail</p>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <button onClick={handleExport} style={{ padding: '10px 18px', background: 'white', color: '#0b3d2e', border: '1.5px solid #d4ddd8', borderRadius: 8, cursor: 'pointer', fontWeight: 500, fontSize: '0.85rem', fontFamily: 'Outfit, sans-serif' }}>
            Export CSV
          </button>
          <button onClick={() => { setShowForm(!showForm); setEditingId(null); resetForm(); }}
            style={{ padding: '10px 20px', background: '#0b3d2e', color: 'white', border: 'none', borderRadius: 8, cursor: 'pointer', fontWeight: 500, fontSize: '0.85rem', fontFamily: 'Outfit, sans-serif' }}>
            + Transaksi Baru
          </button>
        </div>
      </div>

      {/* View Tabs */}
      <div style={{ display: 'flex', gap: 4, marginBottom: 24, background: 'white', borderRadius: 10, padding: 4, width: 'fit-content', boxShadow: '0 1px 3px rgba(0,0,0,0.06)' }}>
        {['dashboard', 'transaksi', 'laporan'].map(v => (
          <button key={v} onClick={() => { setView(v); if (v === 'laporan') loadReport(); }}
            style={{
              padding: '8px 20px', border: 'none', borderRadius: 8, cursor: 'pointer', fontSize: '0.85rem', fontWeight: view === v ? 600 : 400,
              background: view === v ? '#0b3d2e' : 'transparent', color: view === v ? 'white' : '#7a9a8e',
              fontFamily: 'Outfit, sans-serif', transition: 'all 0.2s'
            }}>
            {v === 'dashboard' ? 'Dashboard' : v === 'transaksi' ? 'Transaksi' : 'Laporan'}
          </button>
        ))}
      </div>

      {/* ═══════ DASHBOARD VIEW ═══════ */}
      {view === 'dashboard' && (
        <>
          {/* Summary Cards */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16, marginBottom: 24 }}>
            {[
              { label: 'Saldo Total', value: formatCurrency(summary.saldo), color: '#d4913d', bg: 'rgba(212,145,61,0.08)', border: 'rgba(212,145,61,0.3)' },
              { label: 'Bulan Ini Masuk', value: formatCurrency(summary.bulan_ini_masuk), color: '#0b3d2e', bg: 'rgba(11,61,46,0.06)', border: 'rgba(11,61,46,0.2)' },
              { label: 'Bulan Ini Keluar', value: formatCurrency(summary.bulan_ini_keluar), color: '#c62828', bg: 'rgba(198,40,40,0.06)', border: 'rgba(198,40,40,0.2)' },
              { label: 'Transaksi Bulan Ini', value: summary.jumlah_transaksi_bulan || 0, color: '#1565c0', bg: 'rgba(21,101,192,0.06)', border: 'rgba(21,101,192,0.2)', isNumber: true },
            ].map((card, i) => (
              <div key={i} style={{ background: card.bg, border: `1px solid ${card.border}`, borderRadius: 12, padding: '18px 20px' }}>
                <div style={{ fontSize: '0.75rem', color: '#7a9a8e', marginBottom: 6, fontWeight: 500, textTransform: 'uppercase', letterSpacing: '0.04em' }}>{card.label}</div>
                <div style={{ fontSize: card.isNumber ? '1.8rem' : '1.3rem', fontWeight: 700, color: card.color, fontVariantNumeric: 'tabular-nums' }}>{card.value}</div>
              </div>
            ))}
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '3fr 2fr', gap: 16, marginBottom: 24 }}>
            {/* Monthly Trend Chart */}
            <div style={{ background: 'white', borderRadius: 12, padding: 20, boxShadow: '0 1px 4px rgba(0,0,0,0.06)' }}>
              <h3 style={{ fontSize: '0.9rem', fontWeight: 600, color: '#333', marginBottom: 16 }}>Tren 6 Bulan Terakhir</h3>
              <div style={{ display: 'flex', alignItems: 'flex-end', gap: 12, height: 180, paddingTop: 10 }}>
                {trend.map((item, i) => (
                  <div key={i} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
                    <div style={{ display: 'flex', gap: 3, alignItems: 'flex-end', height: 150, width: '100%', justifyContent: 'center' }}>
                      <div style={{
                        width: '35%', height: `${(item.masuk / maxTrend) * 130}px`, background: 'linear-gradient(180deg, #146b4a, #0b3d2e)',
                        borderRadius: '4px 4px 0 0', transition: 'height 0.5s ease', minHeight: 2
                      }} title={`Masuk: ${formatCurrency(item.masuk)}`} />
                      <div style={{
                        width: '35%', height: `${(item.keluar / maxTrend) * 130}px`, background: 'linear-gradient(180deg, #e57373, #c62828)',
                        borderRadius: '4px 4px 0 0', transition: 'height 0.5s ease', minHeight: 2
                      }} title={`Keluar: ${formatCurrency(item.keluar)}`} />
                    </div>
                    <div style={{ fontSize: '0.7rem', color: '#999', fontWeight: 500 }}>{item.label}</div>
                  </div>
                ))}
              </div>
              <div style={{ display: 'flex', gap: 16, justifyContent: 'center', marginTop: 12 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: '0.75rem', color: '#666' }}>
                  <div style={{ width: 12, height: 12, borderRadius: 3, background: '#0b3d2e' }} /> Masuk
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: '0.75rem', color: '#666' }}>
                  <div style={{ width: 12, height: 12, borderRadius: 3, background: '#c62828' }} /> Keluar
                </div>
              </div>
            </div>

            {/* Category Breakdown */}
            <div style={{ background: 'white', borderRadius: 12, padding: 20, boxShadow: '0 1px 4px rgba(0,0,0,0.06)' }}>
              <h3 style={{ fontSize: '0.9rem', fontWeight: 600, color: '#333', marginBottom: 16 }}>Kategori Bulan Ini</h3>
              {categoryBreakdown.masuk.length > 0 && (
                <div style={{ marginBottom: 16 }}>
                  <div style={{ fontSize: '0.75rem', fontWeight: 600, color: '#0b3d2e', marginBottom: 8, textTransform: 'uppercase', letterSpacing: '0.04em' }}>Pemasukan</div>
                  {categoryBreakdown.masuk.slice(0, 4).map((cat, i) => (
                    <div key={i} style={{ marginBottom: 8 }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.78rem', marginBottom: 3 }}>
                        <span style={{ color: '#333' }}>{cat.kategori}</span>
                        <span style={{ color: '#666', fontWeight: 500 }}>{formatCurrency(cat.jumlah)}</span>
                      </div>
                      <div style={{ height: 6, background: '#f0f0f0', borderRadius: 3, overflow: 'hidden' }}>
                        <div style={{ height: '100%', width: `${(cat.jumlah / totalCategoryMasuk) * 100}%`, background: 'linear-gradient(90deg, #0b3d2e, #146b4a)', borderRadius: 3, transition: 'width 0.5s ease' }} />
                      </div>
                    </div>
                  ))}
                </div>
              )}
              {categoryBreakdown.keluar.length > 0 && (
                <div>
                  <div style={{ fontSize: '0.75rem', fontWeight: 600, color: '#c62828', marginBottom: 8, textTransform: 'uppercase', letterSpacing: '0.04em' }}>Pengeluaran</div>
                  {categoryBreakdown.keluar.slice(0, 4).map((cat, i) => (
                    <div key={i} style={{ marginBottom: 8 }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.78rem', marginBottom: 3 }}>
                        <span style={{ color: '#333' }}>{cat.kategori}</span>
                        <span style={{ color: '#666', fontWeight: 500 }}>{formatCurrency(cat.jumlah)}</span>
                      </div>
                      <div style={{ height: 6, background: '#f0f0f0', borderRadius: 3, overflow: 'hidden' }}>
                        <div style={{ height: '100%', width: `${(cat.jumlah / totalCategoryKeluar) * 100}%`, background: 'linear-gradient(90deg, #e57373, #c62828)', borderRadius: 3, transition: 'width 0.5s ease' }} />
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Recent Transactions */}
          <div style={{ background: 'white', borderRadius: 12, padding: 20, boxShadow: '0 1px 4px rgba(0,0,0,0.06)' }}>
            <h3 style={{ fontSize: '0.9rem', fontWeight: 600, color: '#333', marginBottom: 14 }}>Transaksi Terakhir</h3>
            {transaksi.slice(0, 8).map((item, i) => (
              <div key={item.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 0', borderBottom: i < 7 ? '1px solid #f5f5f5' : 'none' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <div style={{
                    width: 36, height: 36, borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.9rem',
                    background: item.jenis === 'masuk' ? 'rgba(11,61,46,0.08)' : 'rgba(198,40,40,0.08)',
                    color: item.jenis === 'masuk' ? '#0b3d2e' : '#c62828'
                  }}>
                    {item.jenis === 'masuk' ? '↑' : '↓'}
                  </div>
                  <div>
                    <div style={{ fontSize: '0.85rem', fontWeight: 500, color: '#333' }}>{item.kategori}{item.penerima ? ` — ${item.penerima}` : ''}</div>
                    <div style={{ fontSize: '0.75rem', color: '#999' }}>{item.tanggal}{item.deskripsi ? ` · ${item.deskripsi.slice(0, 40)}` : ''}</div>
                  </div>
                </div>
                <div style={{ fontSize: '0.9rem', fontWeight: 600, color: item.jenis === 'masuk' ? '#0b3d2e' : '#c62828', fontVariantNumeric: 'tabular-nums' }}>
                  {item.jenis === 'masuk' ? '+' : '-'}{formatCurrency(item.jumlah)}
                </div>
              </div>
            ))}
          </div>
        </>
      )}

      {/* ═══════ TRANSAKSI VIEW ═══════ */}
      {view === 'transaksi' && (
        <>
          {/* Form */}
          {showForm && (
            <form onSubmit={handleSubmit} style={{ background: 'white', padding: 24, borderRadius: 12, marginBottom: 20, boxShadow: '0 1px 4px rgba(0,0,0,0.06)' }}>
              <h3 style={{ fontSize: '1rem', fontWeight: 600, color: '#333', marginBottom: 16 }}>{editingId ? 'Edit Transaksi' : 'Transaksi Baru'}</h3>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr', gap: 14 }}>
                <div>
                  <label style={labelStyle}>Tanggal</label>
                  <input type="date" value={form.tanggal} onChange={e => setForm({...form, tanggal: e.target.value})} style={inputStyle} required />
                </div>
                <div>
                  <label style={labelStyle}>Jenis</label>
                  <select value={form.jenis} onChange={e => setForm({...form, jenis: e.target.value, kategori: e.target.value === 'masuk' ? 'Infaq' : 'Operasional'})} style={inputStyle}>
                    <option value="masuk">Pemasukan</option><option value="keluar">Pengeluaran</option>
                  </select>
                </div>
                <div>
                  <label style={labelStyle}>Kategori</label>
                  <select value={form.kategori} onChange={e => setForm({...form, kategori: e.target.value})} style={inputStyle}>
                    {(form.jenis === 'masuk' ? kategoriMasuk : kategoriKeluar).map(k => <option key={k} value={k}>{k}</option>)}
                  </select>
                </div>
                <div>
                  <label style={labelStyle}>Jumlah (Rp)</label>
                  <input type="number" value={form.jumlah} onChange={e => setForm({...form, jumlah: e.target.value})} style={inputStyle} required min="0" placeholder="0" />
                </div>
                <div>
                  <label style={labelStyle}>Metode Pembayaran</label>
                  <select value={form.metode_pembayaran} onChange={e => setForm({...form, metode_pembayaran: e.target.value})} style={inputStyle}>
                    {metodeOptions.map(m => <option key={m} value={m}>{m === 'cash' ? 'Tunai' : m === 'transfer' ? 'Transfer' : 'E-Wallet'}</option>)}
                  </select>
                </div>
                <div>
                  <label style={labelStyle}>{form.jenis === 'masuk' ? 'Pemberi' : 'Penerima'}</label>
                  <input value={form.penerima} onChange={e => setForm({...form, penerima: e.target.value})} style={inputStyle} placeholder="Nama pihak terkait" />
                </div>
                <div>
                  <label style={labelStyle}>No. Referensi</label>
                  <input value={form.no_ref} onChange={e => setForm({...form, no_ref: e.target.value})} style={inputStyle} placeholder="TRF-XXXX-XXX" />
                </div>
                <div>
                  <label style={labelStyle}>Status</label>
                  <select value={form.status} onChange={e => setForm({...form, status: e.target.value})} style={inputStyle}>
                    {statusOptions.map(s => <option key={s} value={s}>{s === 'confirmed' ? 'Dikonfirmasi' : s === 'pending' ? 'Menunggu' : 'Dibatalkan'}</option>)}
                  </select>
                </div>
                <div style={{ gridColumn: '1 / -1' }}>
                  <label style={labelStyle}>Deskripsi</label>
                  <input value={form.deskripsi} onChange={e => setForm({...form, deskripsi: e.target.value})} style={inputStyle} placeholder="Deskripsi singkat transaksi" />
                </div>
                <div style={{ gridColumn: '1 / -1' }}>
                  <label style={labelStyle}>Catatan Tambahan</label>
                  <input value={form.catatan} onChange={e => setForm({...form, catatan: e.target.value})} style={inputStyle} placeholder="Catatan internal (opsional)" />
                </div>
              </div>
              <div style={{ marginTop: 16, display: 'flex', gap: 8 }}>
                <button type="submit" style={{ padding: '10px 28px', background: '#d4913d', color: 'white', border: 'none', borderRadius: 8, cursor: 'pointer', fontWeight: 600, fontSize: '0.88rem', fontFamily: 'Outfit, sans-serif' }}>
                  {editingId ? 'Update Transaksi' : 'Simpan Transaksi'}
                </button>
                <button type="button" onClick={() => { setShowForm(false); setEditingId(null); }} style={{ padding: '10px 24px', background: '#f5f5f5', color: '#666', border: 'none', borderRadius: 8, cursor: 'pointer', fontSize: '0.88rem', fontFamily: 'Outfit, sans-serif' }}>
                  Batal
                </button>
              </div>
            </form>
          )}

          {/* Filters */}
          <div style={{ background: 'white', borderRadius: 12, padding: 16, marginBottom: 16, boxShadow: '0 1px 4px rgba(0,0,0,0.06)' }}>
            <div style={{ display: 'flex', gap: 10, alignItems: 'flex-end', flexWrap: 'wrap' }}>
              <div style={{ flex: '0 0 200px' }}>
                <label style={labelStyle}>Cari</label>
                <input value={filter.search} onChange={e => changeFilter('search', e.target.value)} style={inputStyle} placeholder="Deskripsi, kategori, catatan..." />
              </div>
              <div>
                <label style={labelStyle}>Dari</label>
                <input type="date" value={filter.start_date} onChange={e => changeFilter('start_date', e.target.value)} style={inputStyle} />
              </div>
              <div>
                <label style={labelStyle}>Sampai</label>
                <input type="date" value={filter.end_date} onChange={e => changeFilter('end_date', e.target.value)} style={inputStyle} />
              </div>
              <div>
                <label style={labelStyle}>Jenis</label>
                <select value={filter.jenis} onChange={e => changeFilter('jenis', e.target.value)} style={inputStyle}>
                  <option value="">Semua</option><option value="masuk">Masuk</option><option value="keluar">Keluar</option>
                </select>
              </div>
              <div>
                <label style={labelStyle}>Metode</label>
                <select value={filter.metode} onChange={e => changeFilter('metode', e.target.value)} style={inputStyle}>
                  <option value="">Semua</option><option value="cash">Tunai</option><option value="transfer">Transfer</option><option value="e-wallet">E-Wallet</option>
                </select>
              </div>
              <div>
                <label style={labelStyle}>Status</label>
                <select value={filter.status} onChange={e => changeFilter('status', e.target.value)} style={inputStyle}>
                  <option value="">Semua</option><option value="confirmed">Dikonfirmasi</option><option value="pending">Menunggu</option><option value="cancelled">Dibatalkan</option>
                </select>
              </div>
            </div>
          </div>

          {/* Table */}
          <div style={{ background: 'white', borderRadius: 12, overflow: 'hidden', boxShadow: '0 1px 4px rgba(0,0,0,0.06)' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ background: '#f8f9fa' }}>
                  {['Tanggal', 'Jenis', 'Kategori', 'Metode', 'Pihak Terkait', 'Deskripsi', 'Jumlah', 'Status', 'Aksi'].map(h => (
                    <th key={h} style={{ padding: '12px 14px', textAlign: h === 'Jumlah' ? 'right' : h === 'Aksi' ? 'center' : 'left', fontSize: '0.78rem', fontWeight: 600, color: '#7a9a8e', textTransform: 'uppercase', letterSpacing: '0.04em' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {transaksi.map(item => (
                  <tr key={item.id} style={{ borderTop: '1px solid #f5f5f5' }}>
                    <td style={{ padding: '11px 14px', fontSize: '0.85rem' }}>{moment(item.tanggal).format('DD MMM YYYY')}</td>
                    <td style={{ padding: '11px 14px' }}>
                      <span style={{ padding: '3px 10px', borderRadius: 6, fontSize: '0.72rem', fontWeight: 500, background: item.jenis === 'masuk' ? 'rgba(11,61,46,0.08)' : 'rgba(198,40,40,0.08)', color: item.jenis === 'masuk' ? '#0b3d2e' : '#c62828' }}>
                        {item.jenis === 'masuk' ? '↑ Masuk' : '↓ Keluar'}
                      </span>
                    </td>
                    <td style={{ padding: '11px 14px', fontSize: '0.85rem', fontWeight: 500 }}>{item.kategori}</td>
                    <td style={{ padding: '11px 14px', fontSize: '0.82rem', color: '#666', textTransform: 'capitalize' }}>{item.metode_pembayaran === 'cash' ? 'Tunai' : item.metode_pembayaran === 'transfer' ? 'Transfer' : 'E-Wallet'}</td>
                    <td style={{ padding: '11px 14px', fontSize: '0.82rem', color: '#666' }}>{item.penerima || '-'}</td>
                    <td style={{ padding: '11px 14px', fontSize: '0.82rem', color: '#666', maxWidth: 200, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{item.deskripsi || '-'}</td>
                    <td style={{ padding: '11px 14px', fontSize: '0.88rem', fontWeight: 600, textAlign: 'right', color: item.jenis === 'masuk' ? '#0b3d2e' : '#c62828', fontVariantNumeric: 'tabular-nums' }}>
                      {item.jenis === 'masuk' ? '+' : '-'}{formatCurrency(item.jumlah)}
                    </td>
                    <td style={{ padding: '11px 14px' }}>
                      <span style={{
                        padding: '3px 10px', borderRadius: 6, fontSize: '0.72rem', fontWeight: 500,
                        background: item.status === 'confirmed' ? 'rgba(11,61,46,0.08)' : item.status === 'pending' ? 'rgba(212,145,61,0.1)' : 'rgba(198,40,40,0.08)',
                        color: item.status === 'confirmed' ? '#0b3d2e' : item.status === 'pending' ? '#d4913d' : '#c62828'
                      }}>
                        {item.status === 'confirmed' ? 'Dikonfirmasi' : item.status === 'pending' ? 'Menunggu' : 'Dibatalkan'}
                      </span>
                    </td>
                    <td style={{ padding: '11px 14px', textAlign: 'center' }}>
                      <button onClick={() => handleEdit(item)} style={{ padding: '5px 12px', background: '#2196f3', color: 'white', border: 'none', borderRadius: 5, cursor: 'pointer', marginRight: 6, fontSize: '0.78rem', fontFamily: 'Outfit, sans-serif' }}>Edit</button>
                      <button onClick={() => handleDelete(item.id)} style={{ padding: '5px 12px', background: '#ef5350', color: 'white', border: 'none', borderRadius: 5, cursor: 'pointer', fontSize: '0.78rem', fontFamily: 'Outfit, sans-serif' }}>Hapus</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {transaksi.length === 0 && <p style={{ padding: 24, textAlign: 'center', color: '#999', fontSize: '0.85rem' }}>Tidak ada transaksi ditemukan</p>}
          </div>
        </>
      )}

      {/* ═══════ LAPORAN VIEW ═══════ */}
      {view === 'laporan' && (
        <>
          <div style={{ display: 'flex', gap: 10, alignItems: 'flex-end', marginBottom: 20 }}>
            <div>
              <label style={labelStyle}>Bulan</label>
              <select value={reportMonth.month} onChange={e => setReportMonth({...reportMonth, month: e.target.value})} style={inputStyle}>
                {Array.from({length:12}, (_, i) => String(i+1).padStart(2,'0')).map(m => (
                  <option key={m} value={m}>{moment(m, 'MM').format('MMMM')}</option>
                ))}
              </select>
            </div>
            <div>
              <label style={labelStyle}>Tahun</label>
              <select value={reportMonth.year} onChange={e => setReportMonth({...reportMonth, year: e.target.value})} style={inputStyle}>
                {[2026, 2025].map(y => <option key={y} value={y}>{y}</option>)}
              </select>
            </div>
            <button onClick={loadReport} style={{ padding: '10px 20px', background: '#0b3d2e', color: 'white', border: 'none', borderRadius: 8, cursor: 'pointer', fontWeight: 500, fontSize: '0.85rem', fontFamily: 'Outfit, sans-serif' }}>
              Lihat Laporan
            </button>
            <button onClick={handleDownloadPDF} style={{ padding: '10px 20px', background: '#c62828', color: 'white', border: 'none', borderRadius: 8, cursor: 'pointer', fontWeight: 500, fontSize: '0.85rem', fontFamily: 'Outfit, sans-serif' }}>
              Download PDF
            </button>
          </div>

          {reportData && (
            <>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 24 }}>
                {/* Income Summary */}
                <div style={{ background: 'white', borderRadius: 12, padding: 20, boxShadow: '0 1px 4px rgba(0,0,0,0.06)' }}>
                  <h3 style={{ fontSize: '0.9rem', fontWeight: 600, color: '#0b3d2e', marginBottom: 14 }}>Pemasukan per Kategori</h3>
                  {reportData.summary.filter(s => s.masuk > 0).map((s, i) => (
                    <div key={i} style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid #f5f5f5', fontSize: '0.85rem' }}>
                      <span style={{ color: '#333' }}>{s.kategori}</span>
                      <span style={{ color: '#0b3d2e', fontWeight: 600, fontVariantNumeric: 'tabular-nums' }}>{formatCurrency(s.masuk)}</span>
                    </div>
                  ))}
                  <div style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 0', fontWeight: 700, fontSize: '0.9rem', borderTop: '2px solid #0b3d2e', marginTop: 8 }}>
                    <span>Total Masuk</span>
                    <span style={{ color: '#0b3d2e', fontVariantNumeric: 'tabular-nums' }}>{formatCurrency(reportData.summary.reduce((s, x) => s + x.masuk, 0))}</span>
                  </div>
                </div>

                {/* Expense Summary */}
                <div style={{ background: 'white', borderRadius: 12, padding: 20, boxShadow: '0 1px 4px rgba(0,0,0,0.06)' }}>
                  <h3 style={{ fontSize: '0.9rem', fontWeight: 600, color: '#c62828', marginBottom: 14 }}>Pengeluaran per Kategori</h3>
                  {reportData.summary.filter(s => s.keluar > 0).map((s, i) => (
                    <div key={i} style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid #f5f5f5', fontSize: '0.85rem' }}>
                      <span style={{ color: '#333' }}>{s.kategori}</span>
                      <span style={{ color: '#c62828', fontWeight: 600, fontVariantNumeric: 'tabular-nums' }}>{formatCurrency(s.keluar)}</span>
                    </div>
                  ))}
                  <div style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 0', fontWeight: 700, fontSize: '0.9rem', borderTop: '2px solid #c62828', marginTop: 8 }}>
                    <span>Total Keluar</span>
                    <span style={{ color: '#c62828', fontVariantNumeric: 'tabular-nums' }}>{formatCurrency(reportData.summary.reduce((s, x) => s + x.keluar, 0))}</span>
                  </div>
                </div>
              </div>

              {/* Net Summary */}
              <div style={{ background: 'white', borderRadius: 12, padding: 20, boxShadow: '0 1px 4px rgba(0,0,0,0.06)', marginBottom: 24 }}>
                <div style={{ display: 'flex', justifyContent: 'space-around', textAlign: 'center' }}>
                  <div>
                    <div style={{ fontSize: '0.75rem', color: '#7a9a8e', textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: 4 }}>Total Masuk</div>
                    <div style={{ fontSize: '1.3rem', fontWeight: 700, color: '#0b3d2e' }}>{formatCurrency(reportData.summary.reduce((s, x) => s + x.masuk, 0))}</div>
                  </div>
                  <div>
                    <div style={{ fontSize: '0.75rem', color: '#7a9a8e', textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: 4 }}>Total Keluar</div>
                    <div style={{ fontSize: '1.3rem', fontWeight: 700, color: '#c62828' }}>{formatCurrency(reportData.summary.reduce((s, x) => s + x.keluar, 0))}</div>
                  </div>
                  <div>
                    <div style={{ fontSize: '0.75rem', color: '#7a9a8e', textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: 4 }}>Selisih</div>
                    <div style={{ fontSize: '1.3rem', fontWeight: 700, color: '#d4913d' }}>
                      {formatCurrency(reportData.summary.reduce((s, x) => s + x.masuk, 0) - reportData.summary.reduce((s, x) => s + x.keluar, 0))}
                    </div>
                  </div>
                </div>
              </div>

              {/* Detail Table */}
              <div style={{ background: 'white', borderRadius: 12, overflow: 'hidden', boxShadow: '0 1px 4px rgba(0,0,0,0.06)' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                  <thead>
                    <tr style={{ background: '#f8f9fa' }}>
                      {['Tanggal', 'Jenis', 'Kategori', 'Deskripsi', 'Jumlah'].map(h => (
                        <th key={h} style={{ padding: '12px 14px', textAlign: h === 'Jumlah' ? 'right' : 'left', fontSize: '0.78rem', fontWeight: 600, color: '#7a9a8e', textTransform: 'uppercase', letterSpacing: '0.04em' }}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {reportData.detail.map(item => (
                      <tr key={item.id} style={{ borderTop: '1px solid #f5f5f5' }}>
                        <td style={{ padding: '11px 14px', fontSize: '0.85rem' }}>{moment(item.tanggal).format('DD MMM YYYY')}</td>
                        <td style={{ padding: '11px 14px' }}>
                          <span style={{ padding: '3px 10px', borderRadius: 6, fontSize: '0.72rem', fontWeight: 500, background: item.jenis === 'masuk' ? 'rgba(11,61,46,0.08)' : 'rgba(198,40,40,0.08)', color: item.jenis === 'masuk' ? '#0b3d2e' : '#c62828' }}>
                            {item.jenis === 'masuk' ? '↑ Masuk' : '↓ Keluar'}
                          </span>
                        </td>
                        <td style={{ padding: '11px 14px', fontSize: '0.85rem' }}>{item.kategori}</td>
                        <td style={{ padding: '11px 14px', fontSize: '0.82rem', color: '#666' }}>{item.deskripsi || '-'}</td>
                        <td style={{ padding: '11px 14px', fontSize: '0.88rem', fontWeight: 600, textAlign: 'right', color: item.jenis === 'masuk' ? '#0b3d2e' : '#c62828' }}>
                          {item.jenis === 'masuk' ? '+' : '-'}{formatCurrency(item.jumlah)}
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
