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

  const inputStyle = { width: '100%', padding: '10px 12px', border: '1px solid #ddd', borderRadius: 6, fontSize: '0.9rem', boxSizing: 'border-box' };
  const labelStyle = { display: 'block', fontSize: '0.85rem', marginBottom: 6, fontWeight: 500 };

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <h1 style={{ fontSize: '1.5rem', fontWeight: 700, color: '#1a5c2a' }}>Running Text</h1>
        <button onClick={() => { setShowForm(!showForm); setEditingId(null); setForm({ teks: '', jenis: 'pengumuman', is_active: 1, urutan: 0 }); }}
          style={{ padding: '10px 20px', background: '#1a5c2a', color: 'white', border: 'none', borderRadius: 8, cursor: 'pointer', fontWeight: 500 }}>
          + Tambah Teks
        </button>
      </div>
      {showForm && (
        <form onSubmit={handleSubmit} style={{ background: 'white', padding: 24, borderRadius: 12, marginBottom: 24, boxShadow: '0 2px 8px rgba(0,0,0,0.06)' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr 1fr', gap: 16, alignItems: 'end' }}>
            <div><label style={labelStyle}>Teks</label><input value={form.teks} onChange={e => setForm({...form, teks: e.target.value})} style={inputStyle} required placeholder="Masukkan teks pengumuman..." /></div>
            <div><label style={labelStyle}>Jenis</label>
              <select value={form.jenis} onChange={e => setForm({...form, jenis: e.target.value})} style={inputStyle}>
                <option value="pengumuman">Pengumuman</option><option value="infaq">Infaq</option><option value="info">Info</option>
              </select>
            </div>
            <div><label style={labelStyle}>Urutan</label><input type="number" value={form.urutan} onChange={e => setForm({...form, urutan: parseInt(e.target.value)})} style={inputStyle} min="0" /></div>
            <div><label style={labelStyle}>Status</label>
              <select value={form.is_active} onChange={e => setForm({...form, is_active: parseInt(e.target.value)})} style={inputStyle}>
                <option value={1}>Aktif</option><option value={0}>Nonaktif</option>
              </select>
            </div>
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
              <th style={{ padding: '12px 16px', textAlign: 'left', fontSize: '0.85rem', fontWeight: 600 }}>Teks</th>
              <th style={{ padding: '12px 16px', textAlign: 'left', fontSize: '0.85rem', fontWeight: 600 }}>Jenis</th>
              <th style={{ padding: '12px 16px', textAlign: 'center', fontSize: '0.85rem', fontWeight: 600 }}>Urutan</th>
              <th style={{ padding: '12px 16px', textAlign: 'left', fontSize: '0.85rem', fontWeight: 600 }}>Status</th>
              <th style={{ padding: '12px 16px', textAlign: 'center', fontSize: '0.85rem', fontWeight: 600 }}>Aksi</th>
            </tr>
          </thead>
          <tbody>
            {texts.map(item => (
              <tr key={item.id} style={{ borderTop: '1px solid #f0f0f0' }}>
                <td style={{ padding: '12px 16px', fontSize: '0.9rem', maxWidth: 400, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{item.teks}</td>
                <td style={{ padding: '12px 16px' }}>
                  <span style={{ padding: '4px 10px', borderRadius: 12, fontSize: '0.75rem',
                    background: item.jenis === 'infaq' ? '#e8f5e9' : item.jenis === 'info' ? '#e3f2fd' : '#fff3e0',
                    color: item.jenis === 'infaq' ? '#2e7d32' : item.jenis === 'info' ? '#1565c0' : '#e65100' }}>
                    {item.jenis}
                  </span>
                </td>
                <td style={{ padding: '12px 16px', textAlign: 'center', fontSize: '0.9rem' }}>{item.urutan}</td>
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

export default RunningText;