import React, { useState, useEffect } from 'react';
import { jadwalSholatAPI } from '../services/api';
import { CloudSync as SyncIcon } from '@mui/icons-material';

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
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <h1 style={{ fontSize: '1.5rem', fontWeight: 700, color: '#1a5c2a' }}>Jadwal Sholat</h1>
        <div style={{ display: 'flex', gap: 8 }}>
          <button
            onClick={handleSync}
            disabled={syncing}
            style={{
              display: 'flex', alignItems: 'center', gap: 6, padding: '10px 16px',
              background: '#2196f3', color: 'white', border: 'none', borderRadius: 8,
              cursor: syncing ? 'not-allowed' : 'pointer', fontWeight: 500,
              opacity: syncing ? 0.7 : 1,
            }}
          >
            <SyncIcon fontSize="small" />
            {syncing ? 'Sinkron...' : 'Sinkron dari API'}
          </button>
          <button onClick={() => { setShowForm(!showForm); setEditingId(null); setForm({ nama_sholat: '', waktu: '05:00', is_active: 1 }); }}
            style={{ padding: '10px 20px', background: '#1a5c2a', color: 'white', border: 'none', borderRadius: 8, cursor: 'pointer', fontWeight: 500 }}>
            + Tambah Jadwal
          </button>
        </div>
      </div>

      {syncMsg && (
        <div style={{
          padding: '10px 16px', borderRadius: 8, marginBottom: 16, fontSize: '0.85rem',
          background: syncMsg.includes('Berhasil') ? '#e8f5e9' : '#ffebee',
          color: syncMsg.includes('Berhasil') ? '#2e7d32' : '#c62828'
        }}>
          {syncMsg}
        </div>
      )}

      {showForm && (
        <form onSubmit={handleSubmit} style={{ background: 'white', padding: 24, borderRadius: 12, marginBottom: 24, boxShadow: '0 2px 8px rgba(0,0,0,0.06)' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr auto', gap: 16, alignItems: 'end' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.85rem', marginBottom: 6, fontWeight: 500 }}>Nama Sholat</label>
              <input value={form.nama_sholat} onChange={e => setForm({...form, nama_sholat: e.target.value})}
                style={{ width: '100%', padding: '10px 12px', border: '1px solid #ddd', borderRadius: 6, fontSize: '0.9rem' }} required />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '0.85rem', marginBottom: 6, fontWeight: 500 }}>Waktu</label>
              <input type="time" value={form.waktu} onChange={e => setForm({...form, waktu: e.target.value})}
                style={{ width: '100%', padding: '10px 12px', border: '1px solid #ddd', borderRadius: 6, fontSize: '0.9rem' }} required />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '0.85rem', marginBottom: 6, fontWeight: 500 }}>Status</label>
              <select value={form.is_active} onChange={e => setForm({...form, is_active: parseInt(e.target.value)})}
                style={{ width: '100%', padding: '10px 12px', border: '1px solid #ddd', borderRadius: 6, fontSize: '0.9rem' }}>
                <option value={1}>Aktif</option>
                <option value={0}>Nonaktif</option>
              </select>
            </div>
            <button type="submit" style={{ padding: '10px 20px', background: '#c9a84c', color: 'white', border: 'none', borderRadius: 6, cursor: 'pointer', fontWeight: 500 }}>
              {editingId ? 'Update' : 'Simpan'}
            </button>
          </div>
        </form>
      )}
      <div style={{ background: 'white', borderRadius: 12, overflow: 'hidden', boxShadow: '0 2px 8px rgba(0,0,0,0.06)' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ background: '#f8f9fa' }}>
              <th style={{ padding: '12px 16px', textAlign: 'left', fontSize: '0.85rem', fontWeight: 600 }}>Nama Sholat</th>
              <th style={{ padding: '12px 16px', textAlign: 'left', fontSize: '0.85rem', fontWeight: 600 }}>Waktu</th>
              <th style={{ padding: '12px 16px', textAlign: 'left', fontSize: '0.85rem', fontWeight: 600 }}>Status</th>
              <th style={{ padding: '12px 16px', textAlign: 'center', fontSize: '0.85rem', fontWeight: 600 }}>Aksi</th>
            </tr>
          </thead>
          <tbody>
            {jadwal.map(item => (
              <tr key={item.id} style={{ borderTop: '1px solid #f0f0f0' }}>
                <td style={{ padding: '12px 16px', fontSize: '0.9rem' }}>{item.nama_sholat}</td>
                <td style={{ padding: '12px 16px', fontSize: '0.9rem', fontWeight: 600, color: '#1a5c2a' }}>{item.waktu}</td>
                <td style={{ padding: '12px 16px' }}>
                  <span style={{ padding: '4px 10px', borderRadius: 12, fontSize: '0.75rem', background: item.is_active ? '#e8f5e9' : '#ffebee', color: item.is_active ? '#2e7d32' : '#c62828' }}>
                    {item.is_active ? 'Aktif' : 'Nonaktif'}
                  </span>
                </td>
                <td style={{ padding: '12px 16px', textAlign: 'center' }}>
                  <button onClick={() => handleEdit(item)} style={{ padding: '6px 12px', background: '#2196f3', color: 'white', border: 'none', borderRadius: 4, cursor: 'pointer', marginRight: 8, fontSize: '0.8rem' }}>Edit</button>
                  <button onClick={() => handleDelete(item.id)} style={{ padding: '6px 12px', background: '#f44336', color: 'white', border: 'none', borderRadius: 4, cursor: 'pointer', fontSize: '0.8rem' }}>Hapus</button>
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
