import React, { useState, useEffect } from 'react';
import { kajianAPI } from '../services/api';

const Kajian = () => {
  const [kajianList, setKajianList] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState({ judul: '', ustadz: '', tanggal: '', jam_mulai: '', jam_selesai: '', deskripsi: '' });
  const [filter, setFilter] = useState('semua');

  useEffect(() => { loadKajian(); }, []);

  const loadKajian = async () => {
    const res = await kajianAPI.getAll();
    setKajianList(res.data);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (editingId) {
      await kajianAPI.update(editingId, form);
    } else {
      await kajianAPI.create(form);
    }
    setShowForm(false);
    setEditingId(null);
    setForm({ judul: '', ustadz: '', tanggal: '', jam_mulai: '', jam_selesai: '', deskripsi: '' });
    loadKajian();
  };

  const handleEdit = (item) => {
    setForm({ judul: item.judul, ustadz: item.ustadz, tanggal: item.tanggal, jam_mulai: item.jam_mulai, jam_selesai: item.jam_selesai || '', deskripsi: item.deskripsi || '' });
    setEditingId(item.id);
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm('Hapus kajian ini?')) {
      await kajianAPI.delete(id);
      loadKajian();
    }
  };

  const isUpcoming = (item) => {
    return item.tanggal && new Date(item.tanggal) >= new Date(new Date().toDateString());
  };

  const filteredKajian = kajianList.filter(item => {
    if (filter === 'mendatang') {
      return isUpcoming(item);
    }
    if (filter === 'berulang') {
      return item.is_recurring;
    }
    return true;
  });

  const getGradient = (item) => {
    if (item.is_recurring) return 'linear-gradient(90deg, var(--blue-500), var(--blue-600))';
    return 'linear-gradient(90deg, var(--purple-500), var(--purple-500))';
  };

  const getStatusBadge = (item) => {
    if (item.is_recurring) return { className: 'badge-emerald', label: 'Aktif' };
    return { className: 'badge-amber', label: 'Mendatang' };
  };

  const getFrequencyText = (item) => {
    if (item.is_recurring) {
      const days = { 'Senin': 'Setiap Senin', 'Selasa': 'Setiap Selasa', 'Rabu': 'Setiap Rabu', 'Kamis': 'Setiap Kamis', 'Jumat': 'Setiap Jumat', 'Sabtu': 'Setiap Sabtu', 'Minggu': 'Setiap Minggu' };
      return days[item.recurring_day] || 'Berulang';
    }
    return item.tanggal;
  };

  return (
    <div className="animate-in">
      <div className="page-header">
        <div className="page-header-left">
          <h1>Jadwal Kajian</h1>
          <p className="page-header-subtitle">Kelola jadwal kajian dan pengajian masjid</p>
        </div>
        <div className="page-header-actions">
          <button onClick={() => { setShowForm(!showForm); setEditingId(null); setForm({ judul: '', ustadz: '', tanggal: '', jam_mulai: '', jam_selesai: '', deskripsi: '' }); }} className="btn btn-primary btn-sm">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" width="16" height="16"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
            Tambah Kajian
          </button>
        </div>
      </div>

      <div className="tabs" style={{ marginBottom: 'var(--space-6)', width: 'fit-content' }}>
        <button className={`tab ${filter === 'semua' ? 'active' : ''}`} onClick={() => setFilter('semua')}>Semua Kajian</button>
        <button className={`tab ${filter === 'mendatang' ? 'active' : ''}`} onClick={() => setFilter('mendatang')}>Mendatang</button>
        <button className={`tab ${filter === 'berulang' ? 'active' : ''}`} onClick={() => setFilter('berulang')}>Berulang</button>
      </div>

      {showForm && (
        <div className="card" style={{ marginBottom: 'var(--space-6)' }}>
          <div className="card-body">
            <form onSubmit={handleSubmit}>
              <div className="admin-form-grid">
                <div className="form-group">
                  <label className="form-label">Judul</label>
                  <input value={form.judul} onChange={e => setForm({...form, judul: e.target.value})} className="form-input" required />
                </div>
                <div className="form-group">
                  <label className="form-label">Ustadz</label>
                  <input value={form.ustadz} onChange={e => setForm({...form, ustadz: e.target.value})} className="form-input" required />
                </div>
                <div className="form-group">
                  <label className="form-label">Tanggal</label>
                  <input type="date" value={form.tanggal} onChange={e => setForm({...form, tanggal: e.target.value})} className="form-input" required />
                </div>
                <div className="form-group">
                  <label className="form-label">Jam Mulai</label>
                  <input type="time" value={form.jam_mulai} onChange={e => setForm({...form, jam_mulai: e.target.value})} className="form-input" required />
                </div>
                <div className="form-group">
                  <label className="form-label">Jam Selesai</label>
                  <input type="time" value={form.jam_selesai} onChange={e => setForm({...form, jam_selesai: e.target.value})} className="form-input" />
                </div>
                <div className="form-group admin-form-full">
                  <label className="form-label">Deskripsi</label>
                  <textarea value={form.deskripsi} onChange={e => setForm({...form, deskripsi: e.target.value})} className="form-input" rows={3} />
                </div>
              </div>
              <div className="admin-form-actions">
                <button type="submit" className="btn btn-amber">{editingId ? 'Update' : 'Simpan'}</button>
                <button type="button" onClick={() => { setShowForm(false); setEditingId(null); }} className="btn btn-outline">Batal</button>
              </div>
            </form>
          </div>
        </div>
      )}

      <div className="grid grid-3">
        {filteredKajian.map(item => (
          <div key={item.id} className="card" style={{ overflow: 'hidden' }}>
            <div style={{ height: 8, background: getGradient(item) }}></div>
            <div className="card-body">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 'var(--space-4)' }}>
                <span className={`badge ${getStatusBadge(item).className} badge-dot`}>{getStatusBadge(item).label}</span>
                <div style={{ display: 'flex', gap: 'var(--space-2)' }}>
                  <button onClick={() => handleEdit(item)} className="btn btn-ghost btn-sm" style={{ padding: '4px 8px' }}>Edit</button>
                  <button onClick={() => handleDelete(item.id)} className="btn btn-ghost btn-sm" style={{ padding: '4px 8px', color: 'var(--red-600)' }}>Hapus</button>
                </div>
              </div>
              <h3 style={{ fontSize: '1.0625rem', marginBottom: 'var(--space-2)' }}>{item.judul}</h3>
              <p className="body-sm text-secondary" style={{ marginBottom: 'var(--space-4)' }}>{item.deskripsi}</p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-2)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }} className="body-sm text-secondary">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" width="14" height="14"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
                  {item.tanggal}{item.jam_mulai ? `, ${item.jam_mulai}` : ''}{item.jam_selesai ? ` - ${item.jam_selesai}` : ''}
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }} className="body-sm text-secondary">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" width="14" height="14"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
                  {item.ustadz}
                </div>
                {item.lokasi && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }} className="body-sm text-secondary">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" width="14" height="14"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>
                    {item.lokasi}
                  </div>
                )}
              </div>
              <div style={{ marginTop: 'var(--space-4)', paddingTop: 'var(--space-4)', borderTop: '1px solid var(--border-light)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
                  <span className="badge badge-slate" style={{ fontSize: '0.625rem' }}>{item.is_recurring ? 'BERULANG' : 'SATU KALI'}</span>
                  <span className="body-xs text-muted">{getFrequencyText(item)}</span>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Kajian;
