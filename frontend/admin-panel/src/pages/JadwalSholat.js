import React, { useState, useEffect } from 'react';
import { jadwalSholatAPI } from '../services/api';
import moment from 'moment';

const SyncIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" width="16" height="16">
    <path d="M4 4v5h5M20 20v-5h-5M20.49 9A9 9 0 005.64 5.64L4 4m16 16l-1.64-1.64A9 9 0 013.51 15" />
  </svg>
);

const PlusIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" width="16" height="16">
    <line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" />
  </svg>
);

const PrayerIcon = ({ nama }) => {
  const icons = {
    Imsak: { bg: 'var(--amber-100)', stroke: 'var(--amber-500)', svg: <><circle cx="12" cy="12" r="5" /><line x1="12" y1="1" x2="12" y2="3" /><line x1="12" y1="21" x2="12" y2="23" /><line x1="4.22" y1="4.22" x2="5.64" y2="5.64" /><line x1="18.36" y1="18.36" x2="19.78" y2="19.78" /><line x1="1" y1="12" x2="3" y2="12" /><line x1="21" y1="12" x2="23" y2="12" /><line x1="4.22" y1="19.78" x2="5.64" y2="18.36" /><line x1="18.36" y1="5.64" x2="19.78" y2="4.22" /></> },
    Subuh: { bg: 'var(--blue-100)', stroke: 'var(--blue-600)', svg: <><path d="M17 18a5 5 0 0 0-10 0" /><line x1="12" y1="9" x2="12" y2="2" /><line x1="4.22" y1="10.22" x2="5.64" y2="11.64" /><line x1="1" y1="18" x2="3" y2="18" /><line x1="21" y1="18" x2="23" y2="18" /><line x1="18.36" y1="11.64" x2="19.78" y2="10.22" /><line x1="23" y1="22" x2="1" y2="22" /><line x1="16" y1="5" x2="19" y2="2" /><line x1="8" y1="5" x2="5" y2="2" /></> },
    Dzuhur: { bg: 'var(--emerald-50)', stroke: 'var(--emerald-600)', svg: <><circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" /></> },
    Ashar: { bg: 'var(--orange-100)', stroke: 'var(--orange-600)', svg: <><path d="M17 18a5 5 0 0 0-10 0" /><line x1="12" y1="9" x2="12" y2="2" /><line x1="4.22" y1="10.22" x2="5.64" y2="11.64" /><line x1="1" y1="18" x2="3" y2="18" /><line x1="21" y1="18" x2="23" y2="18" /><line x1="18.36" y1="11.64" x2="19.78" y2="10.22" /><line x1="23" y1="22" x2="1" y2="22" /><line x1="16" y1="5" x2="19" y2="2" /><line x1="8" y1="5" x2="5" y2="2" /></> },
    Maghrib: { bg: 'var(--purple-100)', stroke: 'var(--purple-500)', svg: <><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" /></> },
    Isya: { bg: 'var(--blue-100)', stroke: 'var(--blue-600)', svg: <><path d="M17 18a5 5 0 0 0-10 0" /><line x1="12" y1="9" x2="12" y2="2" /><line x1="4.22" y1="10.22" x2="5.64" y2="11.64" /><line x1="1" y1="18" x2="3" y2="18" /><line x1="21" y1="18" x2="23" y2="18" /><line x1="18.36" y1="11.64" x2="19.78" y2="10.22" /><line x1="23" y1="22" x2="1" y2="22" /><line x1="16" y1="5" x2="19" y2="2" /><line x1="8" y1="5" x2="5" y2="2" /></> },
  };
  const config = icons[nama] || icons.Subuh;
  return (
    <div style={{ width: 36, height: 36, borderRadius: 'var(--radius-sm)', background: config.bg, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <svg viewBox="0 0 24 24" fill="none" stroke={config.stroke} strokeWidth="1.5" width="18" height="18">{config.svg}</svg>
    </div>
  );
};

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
        <div className="page-header-left">
          <h1>Jadwal Sholat</h1>
          <p className="page-header-subtitle">Kelola waktu sholat harian masjid</p>
        </div>
        <div className="page-header-actions">
          <button onClick={handleSync} disabled={syncing} className="btn btn-outline btn-sm">
            <SyncIcon />
            {syncing ? 'Sinkron...' : 'Sync dari EQuran.id'}
          </button>
          <button onClick={() => { setShowForm(!showForm); setEditingId(null); setForm({ nama_sholat: '', waktu: '05:00', is_active: 1 }); }} className="btn btn-primary btn-sm">
            <PlusIcon />
            Tambah Jadwal
          </button>
        </div>
      </div>

      {syncMsg && (
        <div className={`card alert ${syncMsg.includes('Berhasil') ? 'alert-success' : 'alert-error'}`} style={{ marginBottom: 'var(--space-6)' }}>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" width="20" height="20">
            <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" /><polyline points="22 4 12 14.01 9 11.01" />
          </svg>
          <div>
            {syncMsg}
          </div>
        </div>
      )}

      {showForm && (
        <form onSubmit={handleSubmit} className="card">
          <div className="card-body">
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
          </div>
        </form>
      )}

      <div className="card">
        <div className="card-header">
          <h2>Jadwal Aktif</h2>
          <span className="badge badge-emerald badge-dot">{jadwal.filter(j => j.is_active).length} Jadwal Aktif</span>
        </div>
        <div className="table-wrapper">
          <table className="table">
            <thead>
              <tr>
                <th style={{ width: 50 }}>#</th>
                <th>Nama Sholat</th>
                <th>Waktu</th>
                <th>Status</th>
                <th style={{ width: 140 }}>Aksi</th>
              </tr>
            </thead>
            <tbody>
              {jadwal.map((item, index) => (
                <tr key={item.id}>
                  <td className="body-sm text-muted">{index + 1}</td>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)' }}>
                      <PrayerIcon nama={item.nama_sholat} />
                      <div>
                        <div style={{ fontWeight: 600 }}>{formatPrayerName(item.nama_sholat)}</div>
                        <div className="body-xs text-muted">Fardhu</div>
                      </div>
                    </div>
                  </td>
                  <td><span style={{ fontSize: '1.125rem', fontWeight: 600, fontVariantNumeric: 'tabular-nums' }}>{item.waktu}</span></td>
                  <td>
                    <span className={`badge ${item.is_active ? 'badge-emerald badge-dot' : 'badge-red'}`}>
                      {item.is_active ? 'Aktif' : 'Nonaktif'}
                    </span>
                  </td>
                  <td>
                    <div style={{ display: 'flex', gap: 'var(--space-2)' }}>
                      <button onClick={() => handleEdit(item)} className="btn btn-ghost btn-sm" style={{ padding: '6px 10px' }}>Edit</button>
                      <button onClick={() => handleDelete(item.id)} className="btn btn-ghost btn-sm" style={{ padding: '6px 10px', color: 'var(--red-600)' }}>Hapus</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="card" style={{ marginTop: 'var(--space-6)' }}>
        <div className="card-header">
          <h2>Konfigurasi Lokasi</h2>
        </div>
        <div className="card-body">
          <div className="form-row">
            <div className="form-group">
              <label className="form-label">Provinsi</label>
              <select className="form-select">
                <option>Pilih Provinsi</option>
              </select>
            </div>
            <div className="form-group">
              <label className="form-label">Kabupaten / Kota</label>
              <select className="form-select">
                <option>Pilih Kabupaten/Kota</option>
              </select>
            </div>
            <div className="form-group" style={{ justifyContent: 'flex-end' }}>
              <button className="btn btn-primary">Simpan Konfigurasi</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default JadwalSholat;
