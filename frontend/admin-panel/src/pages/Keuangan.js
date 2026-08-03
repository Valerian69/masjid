import React, { useState, useEffect } from 'react';
import { keuanganAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../components/Toast';
import { useConfirm } from '../components/ConfirmDialog';
import Loading from '../components/Loading';
import moment from 'moment';
import { emptyTransaksiForm } from './keuangan/constants';
import KeuanganDashboard from './keuangan/KeuanganDashboard';
import KeuanganTransaksi from './keuangan/KeuanganTransaksi';
import KeuanganLaporan from './keuangan/KeuanganLaporan';

const Keuangan = () => {
  const { user } = useAuth();
  const toast = useToast();
  const confirm = useConfirm();
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
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState(emptyTransaksiForm());
  const [filter, setFilter] = useState({ start_date: '', end_date: '', jenis: '', kategori: '', metode: '', status: '', search: '' });
  const [reportMonth, setReportMonth] = useState({ year: moment().format('YYYY'), month: moment().format('MM') });
  const [reportData, setReportData] = useState(null);

  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      try {
        setLoading(true);
        const p = {};
        Object.keys(filter).forEach((k) => { if (filter[k]) p[k] = filter[k]; });
        const [tRes, sRes, mRes, cRes] = await Promise.all([
          keuanganAPI.getAll(p).catch(() => ({ data: [] })),
          keuanganAPI.getSummary().catch(() => ({ data: {} })),
          keuanganAPI.getMonthlyTrend().catch(() => ({ data: [] })),
          keuanganAPI.getCategoryBreakdown().catch(() => ({ data: { masuk: [], keluar: [] } })),
        ]);
        if (cancelled) return;
        setTransaksi(Array.isArray(tRes.data) ? tRes.data : []);
        setSummary(sRes.data || {});
        setTrend(Array.isArray(mRes.data) ? mRes.data : []);
        const cd = cRes.data || {};
        setCatMasuk(Array.isArray(cd.masuk) ? cd.masuk : []);
        setCatKeluar(Array.isArray(cd.keluar) ? cd.keluar : []);
      } catch { /* individual calls already fall back */ } finally {
        if (!cancelled) setLoading(false);
      }
    };
    load();
    return () => { cancelled = true; };
  }, [filter.start_date, filter.end_date, filter.jenis, filter.kategori, filter.metode, filter.status, filter.search]);

  const refresh = () => setFilter((f) => ({ ...f }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      if (editingId) {
        await keuanganAPI.update(editingId, form);
        toast.success('Transaksi berhasil diperbarui');
      } else {
        await keuanganAPI.create(form);
        toast.success('Transaksi berhasil ditambahkan');
      }
      setShowForm(false); setEditingId(null); setForm(emptyTransaksiForm());
      refresh();
    } catch (err) {
      toast.error(err.response?.data?.error || 'Gagal menyimpan transaksi. Periksa jumlah lalu coba lagi.');
    } finally {
      setSaving(false);
    }
  };

  const handleEdit = (item) => {
    setForm({
      tanggal: item.tanggal, jenis: item.jenis, kategori: item.kategori,
      deskripsi: item.deskripsi || '', jumlah: item.jumlah,
      metode_pembayaran: item.metode_pembayaran || 'cash',
      penerima: item.penerima || '', no_ref: item.no_ref || '',
      catatan: item.catatan || '', status: item.status || 'confirmed',
    });
    setEditingId(item.id); setShowForm(true);
  };

  const handleDelete = async (id) => {
    const ok = await confirm({ title: 'Hapus Transaksi', message: 'Transaksi ini akan dihapus permanen dan tercatat di audit trail. Lanjutkan?' });
    if (!ok) return;
    try {
      await keuanganAPI.delete(id);
      toast.success('Transaksi berhasil dihapus');
      refresh();
    } catch (err) {
      toast.error('Gagal menghapus transaksi.');
    }
  };

  const handleExport = async () => {
    try {
      const res = await keuanganAPI.exportCSV(filter);
      const url = window.URL.createObjectURL(new Blob([res.data]));
      const a = document.createElement('a'); a.href = url;
      a.download = `keuangan-${moment().format('YYYY-MM-DD')}.csv`; a.click();
      toast.success('Export CSV berhasil diunduh');
    } catch (err) {
      toast.error('Gagal mengekspor CSV.');
    }
  };

  const loadReport = async () => {
    try {
      const res = await keuanganAPI.getReport(reportMonth);
      setReportData(res.data);
      if (!res.data?.detail?.length) toast.info('Tidak ada data untuk periode ini');
    } catch (err) {
      toast.error('Gagal memuat laporan.');
    }
  };

  const handleDownloadPDF = async () => {
    try {
      const res = await keuanganAPI.getReportPDF(reportMonth);
      const url = window.URL.createObjectURL(new Blob([res.data], { type: 'application/pdf' }));
      const a = document.createElement('a'); a.href = url;
      a.download = `laporan-keuangan-${reportMonth.year}-${reportMonth.month}.pdf`;
      document.body.appendChild(a); a.click(); a.remove();
      window.URL.revokeObjectURL(url);
      toast.success('Laporan PDF berhasil diunduh');
    } catch (err) {
      toast.error('Gagal mengunduh PDF.');
    }
  };

  const changeFilter = (key, value) => setFilter((prev) => ({ ...prev, [key]: value }));

  if (loading) {
    return (
      <div className="animate-in">
        <div className="page-header"><div><h1>Keuangan</h1><p className="page-header-subtitle">Kelola transaksi &amp; laporan keuangan masjid</p></div></div>
        <Loading text="Memuat data keuangan..." />
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
            <button onClick={() => { setShowForm(!showForm); setEditingId(null); setForm(emptyTransaksiForm()); }} className="btn btn-primary btn-sm">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ marginRight: 6 }}><line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" /></svg>
              Transaksi Baru
            </button>
          )}
        </div>
      </div>

      <div className="tabs" style={{ marginBottom: 24, width: 'fit-content' }}>
        {['dashboard', 'transaksi', 'laporan'].map((v) => (
          <button key={v} onClick={() => { setView(v); if (v === 'laporan') loadReport(); }} className={`tab ${view === v ? 'active' : ''}`}>
            {v === 'dashboard' ? 'Dashboard' : v === 'transaksi' ? 'Transaksi' : 'Laporan'}
          </button>
        ))}
      </div>

      {view === 'dashboard' && (
        <KeuanganDashboard summary={summary} trend={trend} catMasuk={catMasuk} catKeluar={catKeluar} transaksi={transaksi} />
      )}

      {view === 'transaksi' && (
        <KeuanganTransaksi
          transaksi={transaksi}
          filter={filter}
          changeFilter={changeFilter}
          canEdit={canEdit}
          showForm={showForm}
          form={form}
          setForm={setForm}
          editingId={editingId}
          saving={saving}
          onSubmit={handleSubmit}
          onCancelForm={() => { setShowForm(false); setEditingId(null); }}
          onEdit={handleEdit}
          onDelete={handleDelete}
        />
      )}

      {view === 'laporan' && (
        <KeuanganLaporan
          reportMonth={reportMonth}
          setReportMonth={setReportMonth}
          reportData={reportData}
          onView={loadReport}
          onDownloadPDF={handleDownloadPDF}
        />
      )}
    </div>
  );
};

export default Keuangan;
