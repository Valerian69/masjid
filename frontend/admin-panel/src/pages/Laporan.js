import React, { useState, useEffect } from 'react';
import { laporanAPI } from '../services/api';
import { useToast } from '../components/Toast';
import { useConfirm } from '../components/ConfirmDialog';
import Loading from '../components/Loading';
import EmptyState from '../components/EmptyState';
import ErrorState from '../components/ErrorState';

const emptyForm = { judul: '', tanggal: '', isi: '', kategori: 'kegiatan', is_published: 1 };

const Laporan = () => {
  const toast = useToast();
  const confirm = useConfirm();
  const [laporanList, setLaporanList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [saving, setSaving] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState(emptyForm);

  useEffect(() => { loadLaporan(); }, []);

  const loadLaporan = async () => {
    setLoading(true);
    setError(false);
    try {
      const res = await laporanAPI.getAll();
      setLaporanList(res.data);
    } catch (err) {
      setError(true);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      if (editingId) {
        await laporanAPI.update(editingId, form);
        toast.success('Laporan berhasil diperbarui');
      } else {
        await laporanAPI.create(form);
        toast.success('Laporan berhasil ditambahkan');
      }
      setShowForm(false);
      setEditingId(null);
      setForm(emptyForm);
      loadLaporan();
    } catch (err) {
      toast.error('Gagal menyimpan laporan. Coba lagi.');
    } finally {
      setSaving(false);
    }
  };

  const handleEdit = (item) => {
    setForm({ judul: item.judul, tanggal: item.tanggal, isi: item.isi, kategori: item.kategori || 'kegiatan', is_published: item.is_published });
    setEditingId(item.id);
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    const ok = await confirm({ title: 'Hapus Laporan', message: 'Laporan ini akan dihapus permanen. Lanjutkan?' });
    if (!ok) return;
    try {
      await laporanAPI.delete(id);
      toast.success('Laporan berhasil dihapus');
      loadLaporan();
    } catch (err) {
      toast.error('Gagal menghapus laporan.');
    }
  };

  return (
    <div className="animate-in">
      <div className="page-header">
        <div className="page-header-left">
          <h1>Laporan Kegiatan</h1>
          <p className="page-header-subtitle">Kelola laporan kegiatan masjid</p>
        </div>
        <button onClick={() => { setShowForm(!showForm); setEditingId(null); setForm(emptyForm); }} className="btn btn-primary btn-sm">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" width="16" height="16"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
          Tambah Laporan
        </button>
      </div>

      {showForm && (
        <form onSubmit={handleSubmit} className="card">
          <div className="card-body">
            <div className="admin-form-grid">
              <div className="form-group">
                <label className="form-label">Judul</label>
                <input value={form.judul} onChange={e => setForm({...form, judul: e.target.value})} className="form-input" required />
              </div>
              <div className="form-group">
                <label className="form-label">Tanggal</label>
                <input type="date" value={form.tanggal} onChange={e => setForm({...form, tanggal: e.target.value})} className="form-input" required />
              </div>
              <div className="form-group">
                <label className="form-label">Kategori</label>
                <select value={form.kategori} onChange={e => setForm({...form, kategori: e.target.value})} className="form-input">
                  <option value="kegiatan">Kegiatan</option>
                  <option value="renovasi">Renovasi</option>
                  <option value="sosial">Sosial</option>
                  <option value="edukasi">Edukasi</option>
                  <option value="umum">Umum</option>
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">Status</label>
                <select value={form.is_published} onChange={e => setForm({...form, is_published: parseInt(e.target.value)})} className="form-input">
                  <option value={1}>Publish</option>
                  <option value={0}>Draft</option>
                </select>
              </div>
              <div className="form-group admin-form-full">
                <label className="form-label">Isi Laporan</label>
                <textarea value={form.isi} onChange={e => setForm({...form, isi: e.target.value})} className="form-input" style={{ height: 120 }} required />
              </div>
            </div>
            <div className="admin-form-actions">
              <button type="submit" className="btn btn-amber" disabled={saving}>{saving ? 'Menyimpan...' : (editingId ? 'Update' : 'Simpan')}</button>
              <button type="button" onClick={() => { setShowForm(false); setEditingId(null); }} className="btn btn-outline">Batal</button>
            </div>
          </div>
        </form>
      )}

      {loading ? (
        <Loading text="Memuat laporan..." />
      ) : error ? (
        <ErrorState onRetry={loadLaporan} />
      ) : laporanList.length === 0 ? (
        <EmptyState
          title="Belum ada laporan"
          message="Buat laporan kegiatan pertama untuk dipublikasikan."
          action={<button onClick={() => { setShowForm(true); setEditingId(null); setForm(emptyForm); }} className="btn btn-primary btn-sm">Tambah Laporan</button>}
        />
      ) : (
      <div className="grid grid-3">
        {laporanList.map(item => (
          <div key={item.id} className="card" style={{ overflow: 'hidden' }}>
            <div style={{ height: '6px', background: item.is_published ? 'linear-gradient(90deg, var(--emerald-500), var(--emerald-400))' : 'linear-gradient(90deg, var(--amber-500), var(--amber-400))' }}></div>
            <div className="card-body">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 'var(--space-3)' }}>
                <span className={`badge ${item.is_published ? 'badge-emerald badge-dot' : 'badge-amber badge-dot'}`}>
                  {item.is_published ? 'Published' : 'Draft'}
                </span>
                <span className="body-xs text-muted">{item.tanggal}</span>
              </div>
              <h3 style={{ fontSize: '1rem', marginBottom: 'var(--space-2)' }}>{item.judul}</h3>
              <p className="body-sm text-secondary" style={{ marginBottom: 'var(--space-4)', display: '-webkit-box', WebkitLineClamp: 3, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                {item.isi}
              </p>
              <div style={{ display: 'flex', gap: 'var(--space-2)', marginBottom: 'var(--space-4)' }}>
                <span className="badge badge-slate">{item.kategori}</span>
              </div>
              <div style={{ display: 'flex', gap: 'var(--space-2)' }}>
                <button onClick={() => handleEdit(item)} className="btn btn-outline btn-sm" style={{ flex: 1 }}>Edit</button>
                <button onClick={() => handleDelete(item.id)} className="btn btn-ghost btn-sm" style={{ color: 'var(--red-600)' }}>Hapus</button>
              </div>
            </div>
          </div>
        ))}
      </div>
      )}
    </div>
  );
};

export default Laporan;
