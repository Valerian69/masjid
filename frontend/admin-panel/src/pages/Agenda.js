import React, { useState, useEffect } from 'react';
import { agendaAPI } from '../services/api';

const Agenda = () => {
  const [agendaList, setAgendaList] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState({ judul: '', tanggal: '', jam_mulai: '', jam_selesai: '', deskripsi: '', lokasi: '', is_published: 1 });

  useEffect(() => { loadAgenda(); }, []);

  const loadAgenda = async () => {
    const res = await agendaAPI.getAll();
    setAgendaList(res.data);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (editingId) {
      await agendaAPI.update(editingId, form);
    } else {
      await agendaAPI.create(form);
    }
    setShowForm(false);
    setEditingId(null);
    setForm({ judul: '', tanggal: '', jam_mulai: '', jam_selesai: '', deskripsi: '', lokasi: '', is_published: 1 });
    loadAgenda();
  };

  const handleEdit = (item) => {
    setForm({ judul: item.judul, tanggal: item.tanggal, jam_mulai: item.jam_mulai || '', jam_selesai: item.jam_selesai || '', deskripsi: item.deskripsi || '', lokasi: item.lokasi || '', is_published: item.is_published });
    setEditingId(item.id);
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm('Hapus agenda ini?')) {
      await agendaAPI.delete(id);
      loadAgenda();
    }
  };

  return (
    <div className="animate-in">
      <div className="page-header">
        <h1>Agenda Kegiatan</h1>
        <button onClick={() => { setShowForm(!showForm); setEditingId(null); setForm({ judul: '', tanggal: '', jam_mulai: '', jam_selesai: '', deskripsi: '', lokasi: '', is_published: 1 }); }} className="btn btn-primary">
          + Tambah Agenda
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
              <label className="form-label">Jam Mulai</label>
              <input type="time" value={form.jam_mulai} onChange={e => setForm({...form, jam_mulai: e.target.value})} className="form-input" />
            </div>
            <div className="form-group">
              <label className="form-label">Jam Selesai</label>
              <input type="time" value={form.jam_selesai} onChange={e => setForm({...form, jam_selesai: e.target.value})} className="form-input" />
            </div>
            <div className="form-group">
              <label className="form-label">Lokasi</label>
              <input value={form.lokasi} onChange={e => setForm({...form, lokasi: e.target.value})} className="form-input" />
            </div>
            <div className="form-group">
              <label className="form-label">Status</label>
              <select value={form.is_published} onChange={e => setForm({...form, is_published: parseInt(e.target.value)})} className="form-input">
                <option value={1}>Publish</option>
                <option value={0}>Draft</option>
              </select>
            </div>
            <div className="form-group admin-form-full">
              <label className="form-label">Deskripsi</label>
              <textarea value={form.deskripsi} onChange={e => setForm({...form, deskripsi: e.target.value})} className="form-input" style={{ height: 80 }} />
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
              <th>Waktu</th>
              <th>Lokasi</th>
              <th>Status</th>
              <th className="text-center">Aksi</th>
            </tr>
          </thead>
          <tbody>
            {agendaList.map(item => (
              <tr key={item.id}>
                <td style={{ fontWeight: 500 }}>{item.judul}</td>
                <td>{item.tanggal}</td>
                <td>{item.jam_mulai || '-'}{item.jam_selesai ? ` - ${item.jam_selesai}` : ''}</td>
                <td>{item.lokasi || '-'}</td>
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

export default Agenda;
