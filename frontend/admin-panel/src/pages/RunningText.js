import React, { useState, useEffect } from 'react';
import { runningTextAPI } from '../services/api';

const RunningText = () => {
  const [texts, setTexts] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState({ teks: '', jenis: 'pengumuman', is_active: 1, urutan: 0 });

  useEffect(() => { loadTexts(); }, []);

  const loadTexts = async () => {
    const res = await runningTextAPI.getAll();
    setTexts(res.data);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (editingId) {
      await runningTextAPI.update(editingId, form);
    } else {
      await runningTextAPI.create(form);
    }
    setShowForm(false);
    setEditingId(null);
    setForm({ teks: '', jenis: 'pengumuman', is_active: 1, urutan: 0 });
    loadTexts();
  };

  const handleEdit = (item) => {
    setForm({ teks: item.teks, jenis: item.jenis, is_active: item.is_active, urutan: item.urutan });
    setEditingId(item.id);
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm('Hapus running text ini?')) {
      await runningTextAPI.delete(id);
      loadTexts();
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
          <button onClick={() => { setShowForm(!showForm); setEditingId(null); setForm({ teks: '', jenis: 'pengumuman', is_active: 1, urutan: 0 }); }} className="btn btn-primary btn-sm">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" width="16" height="16"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
            Tambah Teks
          </button>
        </div>
      </div>

      {showForm && (
        <form onSubmit={handleSubmit} className="card" style={{ marginBottom: 24 }}>
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
                <input type="number" value={form.urutan} onChange={e => setForm({...form, urutan: parseInt(e.target.value)})} className="form-input" min="0" />
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
              <button type="submit" className="btn btn-primary btn-sm">{editingId ? 'Update' : 'Simpan'}</button>
              <button type="button" onClick={() => { setShowForm(false); setEditingId(null); }} className="btn btn-outline btn-sm">Batal</button>
            </div>
          </div>
        </form>
      )}

      <div className="card">
        <div className="card-header">
          <h2>Pengumuman Aktif</h2>
          <span className="badge badge-emerald badge-dot">{activeCount} Aktif</span>
        </div>
        <div className="table-wrapper">
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
                <tr><td colSpan={5} style={{ textAlign: 'center', padding: 40, color: 'var(--text-muted)' }}>Belum ada running text</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default RunningText;
