import React, { useState, useEffect } from 'react';
import moment from 'moment';
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

  const getDateInfo = (tanggal) => {
    const m = moment(tanggal);
    const dayOfWeek = m.day();
    let color = 'var(--blue-600)';
    let badgeClass = 'badge-blue';
    let dayLabel = 'MING';
    if (dayOfWeek === 5) { color = 'var(--emerald-600)'; badgeClass = 'badge-emerald'; dayLabel = 'JUM'; }
    else if (dayOfWeek === 6) { color = 'var(--amber-500)'; badgeClass = 'badge-amber'; dayLabel = 'SAB'; }
    return { day: m.format('D'), month: m.format('MMM'), dayLabel, color, badgeClass };
  };

  return (
    <div className="animate-in">
      <div className="page-header">
        <h1>Agenda Kegiatan</h1>
        <p className="page-header-subtitle">Kelola kegiatan dan acara masjid</p>
        <button onClick={() => { setShowForm(!showForm); setEditingId(null); setForm({ judul: '', tanggal: '', jam_mulai: '', jam_selesai: '', deskripsi: '', lokasi: '', is_published: 1 }); }} className="btn btn-primary btn-sm">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" width="16" height="16"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
          Tambah Agenda
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
          </div>
        </form>
      )}

      <div className="grid grid-2">
        {agendaList.map(item => {
          const { day, month, dayLabel, color, badgeClass } = getDateInfo(item.tanggal);
          return (
            <div className="card" key={item.id}>
              <div className="card-body">
                <div style={{ display: 'flex', gap: 'var(--space-4)' }}>
                  <div style={{ minWidth: 60, textAlign: 'center' }}>
                    <div style={{ fontSize: '1.75rem', fontWeight: 700, color, lineHeight: 1 }}>{day}</div>
                    <div className="label-sm" style={{ color }}>{month}</div>
                    <div className={`badge ${badgeClass}`} style={{ marginTop: 'var(--space-2)', fontSize: '0.625rem' }}>{dayLabel}</div>
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                      <div>
                        <h3 style={{ fontSize: '1rem', marginBottom: 'var(--space-1)' }}>{item.judul}</h3>
                        <div className="body-sm text-secondary">{item.jam_mulai || '-'}{item.jam_selesai ? ` - ${item.jam_selesai}` : ''} &bull; {item.lokasi || '-'}</div>
                      </div>
                      <div style={{ display: 'flex', gap: 'var(--space-2)' }}>
                        <button onClick={() => handleEdit(item)} className="btn btn-ghost btn-sm" style={{ padding: '4px 8px' }}>Edit</button>
                        <button onClick={() => handleDelete(item.id)} className="btn btn-ghost btn-sm" style={{ padding: '4px 8px', color: 'var(--red-600)' }}>Hapus</button>
                      </div>
                    </div>
                    {item.deskripsi && <p className="body-sm text-secondary" style={{ marginTop: 'var(--space-3)' }}>{item.deskripsi}</p>}
                    <div style={{ marginTop: 'var(--space-3)', display: 'flex', gap: 'var(--space-2)' }}>
                      <span className={`badge ${item.is_published ? 'badge-emerald badge-dot' : 'badge-amber'}`}>
                        {item.is_published ? 'Published' : 'Draft'}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default Agenda;
