import React, { useState, useEffect } from 'react';
import { kajianAPI } from '../services/api';

const Kajian = () => {
  const [kajianList, setKajianList] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState({ judul: '', ustadz: '', tanggal: '', jam_mulai: '', jam_selesai: '', deskripsi: '' });

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

  const inputStyle = { width: '100%', padding: '10px 12px', border: '1px solid #ddd', borderRadius: 6, fontSize: '0.9rem', boxSizing: 'border-box' };
  const labelStyle = { display: 'block', fontSize: '0.85rem', marginBottom: 6, fontWeight: 500 };

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <h1 style={{ fontSize: '1.5rem', fontWeight: 700, color: '#1a5c2a' }}>Jadwal Kajian</h1>
        <button onClick={() => { setShowForm(!showForm); setEditingId(null); setForm({ judul: '', ustadz: '', tanggal: '', jam_mulai: '', jam_selesai: '', deskripsi: '' }); }}
          style={{ padding: '10px 20px', background: '#1a5c2a', color: 'white', border: 'none', borderRadius: 8, cursor: 'pointer', fontWeight: 500 }}>
          + Tambah Kajian
        </button>
      </div>
      {showForm && (
        <form onSubmit={handleSubmit} style={{ background: 'white', padding: 24, borderRadius: 12, marginBottom: 24, boxShadow: '0 2px 8px rgba(0,0,0,0.06)' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
            <div><label style={labelStyle}>Judul</label><input value={form.judul} onChange={e => setForm({...form, judul: e.target.value})} style={inputStyle} required /></div>
            <div><label style={labelStyle}>Ustadz</label><input value={form.ustadz} onChange={e => setForm({...form, ustadz: e.target.value})} style={inputStyle} required /></div>
            <div><label style={labelStyle}>Tanggal</label><input type="date" value={form.tanggal} onChange={e => setForm({...form, tanggal: e.target.value})} style={inputStyle} required /></div>
            <div><label style={labelStyle}>Jam Mulai</label><input type="time" value={form.jam_mulai} onChange={e => setForm({...form, jam_mulai: e.target.value})} style={inputStyle} required /></div>
            <div><label style={labelStyle}>Jam Selesai</label><input type="time" value={form.jam_selesai} onChange={e => setForm({...form, jam_selesai: e.target.value})} style={inputStyle} /></div>
            <div style={{ gridColumn: '1 / -1' }}><label style={labelStyle}>Deskripsi</label><textarea value={form.deskripsi} onChange={e => setForm({...form, deskripsi: e.target.value})} style={{ ...inputStyle, height: 80 }} /></div>
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
              <th style={{ padding: '12px 16px', textAlign: 'left', fontSize: '0.85rem', fontWeight: 600 }}>Ustadz</th>
              <th style={{ padding: '12px 16px', textAlign: 'left', fontSize: '0.85rem', fontWeight: 600 }}>Tanggal</th>
              <th style={{ padding: '12px 16px', textAlign: 'left', fontSize: '0.85rem', fontWeight: 600 }}>Waktu</th>
              <th style={{ padding: '12px 16px', textAlign: 'center', fontSize: '0.85rem', fontWeight: 600 }}>Aksi</th>
            </tr>
          </thead>
          <tbody>
            {kajianList.map(item => (
              <tr key={item.id} style={{ borderTop: '1px solid #f0f0f0' }}>
                <td style={{ padding: '12px 16px', fontSize: '0.9rem', fontWeight: 500 }}>{item.judul}</td>
                <td style={{ padding: '12px 16px', fontSize: '0.9rem' }}>{item.ustadz}</td>
                <td style={{ padding: '12px 16px', fontSize: '0.9rem' }}>{item.tanggal}</td>
                <td style={{ padding: '12px 16px', fontSize: '0.9rem' }}>{item.jam_mulai}{item.jam_selesai ? ` - ${item.jam_selesai}` : ''}</td>
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

export default Kajian;