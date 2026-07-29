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

  return (
    <div className="animate-in">
      <div className="page-header">
        <h1>Running Text</h1>
        <button onClick={() => { setShowForm(!showForm); setEditingId(null); setForm({ teks: '', jenis: 'pengumuman', is_active: 1, urutan: 0 }); }} className="btn btn-primary">
          + Tambah Teks
        </button>
      </div>

      {showForm && (
        <form onSubmit={handleSubmit} className="admin-form-card">
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
            <button type="submit" className="btn btn-amber">{editingId ? 'Update' : 'Simpan'}</button>
            <button type="button" onClick={() => { setShowForm(false); setEditingId(null); }} className="btn btn-outline">Batal</button>
          </div>
        </form>
      )}

      <div className="admin-table-wrap">
        <table className="admin-table">
          <thead>
            <tr>
              <th>Teks</th>
              <th>Jenis</th>
              <th className="text-center">Urutan</th>
              <th>Status</th>
              <th className="text-center">Aksi</th>
            </tr>
          </thead>
          <tbody>
            {texts.map(item => (
              <tr key={item.id}>
                <td style={{ maxWidth: 400, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{item.teks}</td>
                <td>
                  <span className={`badge ${item.jenis === 'infaq' ? 'badge-green' : item.jenis === 'info' ? 'badge-blue' : 'badge-orange'}`}>
                    {item.jenis}
                  </span>
                </td>
                <td className="text-center">{item.urutan}</td>
                <td>
                  <span className={`badge ${item.is_active ? 'badge-green' : 'badge-red'}`}>
                    {item.is_active ? 'Aktif' : 'Nonaktif'}
                  </span>
                </td>
                <td className="text-center">
                  <button onClick={() => handleEdit(item)} className="btn btn-blue btn-sm" style={{ marginRight: 8 }}>Edit</button>
                  <button onClick={() => handleDelete(item.id)} className="btn btn-danger btn-sm">Hapus</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default RunningText;
