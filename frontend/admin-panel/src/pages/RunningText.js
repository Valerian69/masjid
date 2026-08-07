import React, { useState, useEffect } from 'react';
import { runningTextAPI } from '../services/api';
import { useToast } from '../components/Toast';
import { useConfirm } from '../components/ConfirmDialog';
import Loading from '../components/Loading';
import ErrorState from '../components/ErrorState';

const emptyForm = { teks: '', jenis: 'pengumuman', is_active: 1, urutan: 0 };

const RunningText = () => {
  const toast = useToast();
  const confirm = useConfirm();
  const [texts, setTexts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [saving, setSaving] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState(emptyForm);

  useEffect(() => { loadTexts(); }, []);

  const loadTexts = async () => {
    setLoading(true);
    setError(false);
    try {
      const res = await runningTextAPI.getAll();
      setTexts(res.data);
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
        await runningTextAPI.update(editingId, form);
        toast.success('Running text berhasil diperbarui');
      } else {
        await runningTextAPI.create(form);
        toast.success('Running text berhasil ditambahkan');
      }
      setShowForm(false);
      setEditingId(null);
      setForm(emptyForm);
      loadTexts();
    } catch (err) {
      toast.error('Gagal menyimpan running text. Coba lagi.');
    } finally {
      setSaving(false);
    }
  };

  const handleEdit = (item) => {
    setForm({ teks: item.teks, jenis: item.jenis, is_active: item.is_active, urutan: item.urutan });
    setEditingId(item.id);
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    const ok = await confirm({ title: 'Hapus Running Text', message: 'Teks pengumuman ini akan dihapus permanen. Lanjutkan?' });
    if (!ok) return;
    try {
      await runningTextAPI.delete(id);
      toast.success('Running text berhasil dihapus');
      loadTexts();
    } catch (err) {
      toast.error('Gagal menghapus running text.');
    }
  };

  const activeCount = texts.filter(t => t.is_active).length;

  return (
    <div className="animate-in">
      <div className="page-header">
        <div>
          <h1>Running Text</h1>
          <p className="page-header-subtitle">Kelola pengumuman scrolling di layar TV</p>
        </div>
        <div className="page-header-actions">
          <button onClick={() => { setShowForm(!showForm); setEditingId(null); setForm(emptyForm); }} className="btn btn-primary btn-sm" data-tour="rt-add">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" width="16" height="16"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
            Tambah Teks
          </button>
        </div>
      </div>

      {showForm && (
        <form onSubmit={handleSubmit} className="card" style={{ marginBottom: 24 }} data-tour="rt-form">
          <div className="card-body">
            <div className="admin-form-grid-3">
              <div className="form-group">
                <label className="form-label">Teks</label>
                <input value={form.teks} onChange={e => setForm({...form, teks: e.target.value})} className="form-input" required placeholder="Masukkan teks pengumuman..." />
              </div>
              <div className="form-group">
                <label className="form-label">Jenis</label>
                <select value={form.jenis} onChange={e => setForm({...form, jenis: e.target.value})} className="form-input">
                  <option value="pengumuman">Pengumuman</option>
                  <option value="infaq">Infaq</option>
                  <option value="info">Info</option>
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">Urutan</label>
                <input type="number" value={form.urutan} onChange={e => setForm({...form, urutan: parseInt(e.target.value)})} className="form-input" min="0" data-tour="rt-urutan" />
              </div>
              <div className="form-group">
                <label className="form-label">Status</label>
                <select value={form.is_active} onChange={e => setForm({...form, is_active: parseInt(e.target.value)})} className="form-input">
                  <option value={1}>Aktif</option>
                  <option value={0}>Nonaktif</option>
                </select>
              </div>
            </div>
            <div className="admin-form-actions">
              <button type="submit" className="btn btn-primary btn-sm" disabled={saving}>{saving ? 'Menyimpan...' : (editingId ? 'Update' : 'Simpan')}</button>
              <button type="button" onClick={() => { setShowForm(false); setEditingId(null); }} className="btn btn-outline btn-sm">Batal</button>
            </div>
          </div>
        </form>
      )}

      {loading ? (
        <Loading text="Memuat running text..." />
      ) : error ? (
        <ErrorState onRetry={loadTexts} />
      ) : (
      <div className="card">
        <div className="card-header">
          <h2>Pengumuman Aktif</h2>
          <span className="badge badge-emerald badge-dot">{activeCount} Aktif</span>
        </div>
        <div className="table-wrapper" data-tour="rt-table">
          <table className="table">
            <thead>
              <tr>
                <th style={{ width: 50 }}>#</th>
                <th>Teks Pengumuman</th>
                <th style={{ width: 80 }}>Status</th>
                <th style={{ width: 80 }}>Urutan</th>
                <th style={{ width: 140 }}>Aksi</th>
              </tr>
            </thead>
            <tbody>
              {texts.map((item, idx) => (
                <tr key={item.id}>
                  <td className="body-sm text-muted">{idx + 1}</td>
                  <td style={{ fontWeight: 500 }}>{item.teks}</td>
                  <td>
                    <span className={`badge ${item.is_active ? 'badge-emerald badge-dot' : 'badge-slate badge-dot'}`}>
                      {item.is_active ? 'Aktif' : 'Draft'}
                    </span>
                  </td>
                  <td className="text-center">{item.urutan}</td>
                  <td>
                    <div style={{ display: 'flex', gap: 8 }}>
                      <button onClick={() => handleEdit(item)} className="btn btn-ghost btn-sm" style={{ padding: '6px 10px' }}>Edit</button>
                      <button onClick={() => handleDelete(item.id)} className="btn btn-ghost btn-sm" style={{ padding: '6px 10px', color: 'var(--red)' }}>Hapus</button>
                    </div>
                  </td>
                </tr>
              ))}
              {texts.length === 0 && (
                <tr><td colSpan={5} style={{ textAlign: 'center', padding: 40, color: 'var(--text-muted)' }}>Belum ada running text. Klik "Tambah Teks" untuk membuat pengumuman.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
      )}
    </div>
  );
};

export default RunningText;
