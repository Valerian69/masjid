import React, { useState, useEffect } from 'react';
import { laporanAPI } from '../services/api';

const Laporan = () => {
  const [laporanList, setLaporanList] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState({ judul: '', tanggal: '', isi: '', kategori: 'kegiatan', is_published: 1 });

  useEffect(() => { loadLaporan(); }, []);

  const loadLaporan = async () => {
    const res = await laporanAPI.getAll();
    setLaporanList(res.data);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (editingId) {
      await laporanAPI.update(editingId, form);
    } else {
      await laporanAPI.create(form);
    }
    setShowForm(false);
    setEditingId(null);
    setForm({ judul: '', tanggal: '', isi: '', kategori: 'kegiatan', is_published: 1 });
    loadLaporan();
  };

  const handleEdit = (item) => {
    setForm({ judul: item.judul, tanggal: item.tanggal, isi: item.isi, kategori: item.kategori || 'kegiatan', is_published: item.is_published });
    setEditingId(item.id);
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm('Hapus laporan ini?')) {
      await laporanAPI.delete(id);
      loadLaporan();
    }
  };

  return (
    <div className="animate-in">
      <div className="page-header">
        <h1>Laporan Kegiatan</h1>
        <button onClick={() => { setShowForm(!showForm); setEditingId(null); setForm({ judul: '', tanggal: '', isi: '', kategori: 'kegiatan', is_published: 1 }); }} className="btn btn-primary">
          + Tambah Laporan
        </button>
      </div>

      {showForm && (
        <form onSubmit={handleSubmit} className="admin-form-card">
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
            <button type="submit" className="btn btn-amber">{editingId ? 'Update' : 'Simpan'}</button>
            <button type="button" onClick={() => { setShowForm(false); setEditingId(null); }} className="btn btn-outline">Batal</button>
          </div>
        </form>
      )}

      <div className="admin-table-wrap">
        <table className="admin-table">
          <thead>
            <tr>
              <th>Judul</th>
              <th>Tanggal</th>
              <th>Kategori</th>
              <th>Status</th>
              <th className="text-center">Aksi</th>
            </tr>
          </thead>
          <tbody>
            {laporanList.map(item => (
              <tr key={item.id}>
                <td style={{ fontWeight: 500 }}>{item.judul}</td>
                <td>{item.tanggal}</td>
                <td>
                  <span className="badge badge-blue">{item.kategori}</span>
                </td>
                <td>
                  <span className={`badge ${item.is_published ? 'badge-green' : 'badge-orange'}`}>
                    {item.is_published ? 'Publish' : 'Draft'}
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

export default Laporan;
