import React, { useState, useEffect } from 'react';
import { jadwalSholatAPI } from '../services/api';
import moment from 'moment';

const SyncIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" width="16" height="16">
    <path d="M4 4v5h5M20 20v-5h-5M20.49 9A9 9 0 005.64 5.64L4 4m16 16l-1.64-1.64A9 9 0 013.51 15" />
  </svg>
);

const formatPrayerName = (nama) => {
  if (moment().day() === 5 && nama === 'Dzuhur') return 'Jum\'at';
  return nama;
};

const JadwalSholat = () => {
  const [jadwal, setJadwal] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState({ nama_sholat: '', waktu: '05:00', is_active: 1 });
  const [syncing, setSyncing] = useState(false);
  const [syncMsg, setSyncMsg] = useState('');

  useEffect(() => { loadJadwal(); }, []);

  const loadJadwal = async () => {
    const res = await jadwalSholatAPI.getAll();
    setJadwal(res.data);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (editingId) {
      await jadwalSholatAPI.update(editingId, form);
    } else {
      await jadwalSholatAPI.create(form);
    }
    setShowForm(false);
    setEditingId(null);
    setForm({ nama_sholat: '', waktu: '05:00', is_active: 1 });
    loadJadwal();
  };

  const handleEdit = (item) => {
    setForm({ nama_sholat: item.nama_sholat, waktu: item.waktu, is_active: item.is_active });
    setEditingId(item.id);
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm('Hapus jadwal ini?')) {
      await jadwalSholatAPI.delete(id);
      loadJadwal();
    }
  };

  const handleSync = async () => {
    setSyncing(true);
    setSyncMsg('');
    try {
      const res = await jadwalSholatAPI.sync({});
      setSyncMsg(`Berhasil sinkron: ${res.data.location.kabkota} (${res.data.date})`);
      loadJadwal();
    } catch (err) {
      setSyncMsg(err.response?.data?.error || 'Gagal sinkronisasi. Atur lokasi di halaman Pengaturan.');
    } finally {
      setSyncing(false);
    }
  };

  return (
    <div className="animate-in">
      <div className="page-header">
        <h1>Jadwal Sholat</h1>
        <div className="page-header-actions">
          <button onClick={handleSync} disabled={syncing} className="btn btn-blue">
            <SyncIcon />
            {syncing ? 'Sinkron...' : 'Sinkron dari API'}
          </button>
          <button onClick={() => { setShowForm(!showForm); setEditingId(null); setForm({ nama_sholat: '', waktu: '05:00', is_active: 1 }); }} className="btn btn-primary">
            + Tambah Jadwal
          </button>
        </div>
      </div>

      {syncMsg && (
        <div className={`alert ${syncMsg.includes('Berhasil') ? 'alert-success' : 'alert-error'}`}>
          {syncMsg}
        </div>
      )}

      {showForm && (
        <form onSubmit={handleSubmit} className="admin-form-card">
          <div className="admin-form-grid-3">
            <div className="form-group">
              <label className="form-label">Nama Sholat</label>
              <input value={form.nama_sholat} onChange={e => setForm({...form, nama_sholat: e.target.value})} className="form-input" required />
            </div>
            <div className="form-group">
              <label className="form-label">Waktu</label>
              <input type="time" value={form.waktu} onChange={e => setForm({...form, waktu: e.target.value})} className="form-input" required />
            </div>
            <div className="form-group">
              <label className="form-label">Status</label>
              <select value={form.is_active} onChange={e => setForm({...form, is_active: parseInt(e.target.value)})} className="form-input">
                <option value={1}>Aktif</option>
                <option value={0}>Nonaktif</option>
              </select>
            </div>
            <div className="form-group">
              <button type="submit" className="btn btn-amber">{editingId ? 'Update' : 'Simpan'}</button>
            </div>
          </div>
        </form>
      )}

      <div className="admin-table-wrap">
        <table className="admin-table">
          <thead>
            <tr>
              <th>Nama Sholat</th>
              <th>Waktu</th>
              <th>Status</th>
              <th className="text-center">Aksi</th>
            </tr>
          </thead>
          <tbody>
            {jadwal.map(item => (
              <tr key={item.id}>
                <td>{formatPrayerName(item.nama_sholat)}</td>
                <td style={{ fontWeight: 600, color: '#0b3d2e' }}>{item.waktu}</td>
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

export default JadwalSholat;
