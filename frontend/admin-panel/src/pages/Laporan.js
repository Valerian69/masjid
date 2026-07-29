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

  const inputStyle = { width: '100%', padding: '10px 12px', border: '1px solid #ddd', borderRadius: 6, fontSize: '0.9rem', boxSizing: 'border-box' };
  const labelStyle = { display: 'block', fontSize: '0.85rem', marginBottom: 6, fontWeight: 500 };

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <h1 style={{ fontSize: '1.5rem', fontWeight: 700, color: '#1a5c2a' }}>Laporan Kegiatan</h1>
        <button onClick={() => { setShowForm(!showForm); setEditingId(null); setForm({ judul: '', tanggal: '', isi: '', kategori: 'kegiatan', is_published: 1 }); }}
          style={{ padding: '10px 20px', background: '#1a5c2a', color: 'white', border: 'none', borderRadius: 8, cursor: 'pointer', fontWeight: 500 }}>
          + Tambah Laporan
        </button>
      </div>
      {showForm && (
        <form onSubmit={handleSubmit} style={{ background: 'white', padding: 24, borderRadius: 12, marginBottom: 24, boxShadow: '0 2px 8px rgba(0,0,0,0.06)' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
            <div><label style={labelStyle}>Judul</label><input value={form.judul} onChange={e => setForm({...form, judul: e.target.value})} style={inputStyle} required /></div>
            <div><label style={labelStyle}>Tanggal</label><input type="date" value={form.tanggal} onChange={e => setForm({...form, tanggal: e.target.value})} style={inputStyle} required /></div>
            <div><label style={labelStyle}>Kategori</label>
              <select value={form.kategori} onChange={e => setForm({...form, kategori: e.target.value})} style={inputStyle}>
                <option value="kegiatan">Kegiatan</option>
                <option value="renovasi">Renovasi</option>
                <option value="sosial">Sosial</option>
                <option value="edukasi">Edukasi</option>
                <option value="umum">Umum</option>
              </select>
            </div>
            <div><label style={labelStyle}>Status</label>
              <select value={form.is_published} onChange={e => setForm({...form, is_published: parseInt(e.target.value)})} style={inputStyle}>
                <option value={1}>Publish</option><option value={0}>Draft</option>
              </select>
            </div>
            <div style={{ gridColumn: '1 / -1' }}><label style={labelStyle}>Isi Laporan</label><textarea value={form.isi} onChange={e => setForm({...form, isi: e.target.value})} style={{ ...inputStyle, height: 120 }} required /></div>
          </div>
          <div style={{ marginTop: 16, display: 'flex', gap: 8 }}>
            <button type="submit" style={{ padding: '10px 24px', background: '#c9a84c', color: 'white', border: 'none', borderRadius: 6, cursor: 'pointer', fontWeight: 500 }}>{editingId ? 'Update' : 'Simpan'}</button>
            <button type="button" onClick={() => { setShowForm(false); setEditingId(null); }} style={{ padding: '10px 24px', background: '#eee', color: '#333', border: 'none', borderRadius: 6, cursor: 'pointer' }}>Batal</button>
          </div>
        </form>
      )}
      <div style={{ background: 'white', borderRadius: 12, overflow: 'hidden', boxShadow: '0 2px 8px rgba(0,0,0,0.06)' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ background: '#f8f9fa' }}>
              <th style={{ padding: '12px 16px', textAlign: 'left', fontSize: '0.85rem', fontWeight: 600 }}>Judul</th>
              <th style={{ padding: '12px 16px', textAlign: 'left', fontSize: '0.85rem', fontWeight: 600 }}>Tanggal</th>
              <th style={{ padding: '12px 16px', textAlign: 'left', fontSize: '0.85rem', fontWeight: 600 }}>Kategori</th>
              <th style={{ padding: '12px 16px', textAlign: 'left', fontSize: '0.85rem', fontWeight: 600 }}>Status</th>
              <th style={{ padding: '12px 16px', textAlign: 'center', fontSize: '0.85rem', fontWeight: 600 }}>Aksi</th>
            </tr>
          </thead>
          <tbody>
            {laporanList.map(item => (
              <tr key={item.id} style={{ borderTop: '1px solid #f0f0f0' }}>
                <td style={{ padding: '12px 16px', fontSize: '0.9rem', fontWeight: 500 }}>{item.judul}</td>
                <td style={{ padding: '12px 16px', fontSize: '0.9rem' }}>{item.tanggal}</td>
                <td style={{ padding: '12px 16px' }}>
                  <span style={{ padding: '4px 10px', borderRadius: 12, fontSize: '0.75rem', background: '#e3f2fd', color: '#1565c0' }}>
                    {item.kategori}
                  </span>
                </td>
                <td style={{ padding: '12px 16px' }}>
                  <span style={{ padding: '4px 10px', borderRadius: 12, fontSize: '0.75rem', background: item.is_published ? '#e8f5e9' : '#fff3e0', color: item.is_published ? '#2e7d32' : '#e65100' }}>
                    {item.is_published ? 'Publish' : 'Draft'}
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

export default Laporan;