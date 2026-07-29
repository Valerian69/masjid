import React, { useState, useEffect } from 'react';
import { authAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';

const Users = () => {
  const { user: currentUser } = useAuth();
  const [users, setUsers] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState({ username: '', password: '', full_name: '', role: 'marbot' });

  useEffect(() => { loadUsers(); }, []);

  const loadUsers = async () => {
    const res = await authAPI.getUsers();
    setUsers(res.data);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (editingId) {
      await authAPI.updateUser(editingId, form);
    } else {
      await authAPI.createUser(form);
    }
    setShowForm(false);
    setEditingId(null);
    setForm({ username: '', password: '', full_name: '', role: 'marbot' });
    loadUsers();
  };

  const handleEdit = (item) => {
    setForm({ username: item.username, password: '', full_name: item.full_name, role: item.role });
    setEditingId(item.id);
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    if (id === currentUser?.id) return alert('Tidak bisa menghapus akun sendiri');
    if (window.confirm('Hapus user ini?')) {
      await authAPI.deleteUser(id);
      loadUsers();
    }
  };

  const inputStyle = { width: '100%', padding: '10px 12px', border: '1px solid #ddd', borderRadius: 6, fontSize: '0.9rem', boxSizing: 'border-box' };
  const labelStyle = { display: 'block', fontSize: '0.85rem', marginBottom: 6, fontWeight: 500 };

  const roleColors = { superadmin: '#9c27b0', takmir: '#1a5c2a', bendahara: '#c9a84c', marbot: '#2196f3' };

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <h1 style={{ fontSize: '1.5rem', fontWeight: 700, color: '#1a5c2a' }}>Manajemen Users</h1>
        {currentUser?.role === 'superadmin' && (
          <button onClick={() => { setShowForm(!showForm); setEditingId(null); setForm({ username: '', password: '', full_name: '', role: 'marbot' }); }}
            style={{ padding: '10px 20px', background: '#1a5c2a', color: 'white', border: 'none', borderRadius: 8, cursor: 'pointer', fontWeight: 500 }}>
            + Tambah User
          </button>
        )}
      </div>
      {showForm && (
        <form onSubmit={handleSubmit} style={{ background: 'white', padding: 24, borderRadius: 12, marginBottom: 24, boxShadow: '0 2px 8px rgba(0,0,0,0.06)' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
            <div><label style={labelStyle}>Username</label><input value={form.username} onChange={e => setForm({...form, username: e.target.value})} style={inputStyle} required disabled={!!editingId} /></div>
            <div><label style={labelStyle}>{editingId ? 'Password (kosongkan jika tidak diubah)' : 'Password'}</label><input type="password" value={form.password} onChange={e => setForm({...form, password: e.target.value})} style={inputStyle} required={!editingId} /></div>
            <div><label style={labelStyle}>Nama Lengkap</label><input value={form.full_name} onChange={e => setForm({...form, full_name: e.target.value})} style={inputStyle} required /></div>
            <div><label style={labelStyle}>Role</label>
              <select value={form.role} onChange={e => setForm({...form, role: e.target.value})} style={inputStyle}>
                <option value="superadmin">Superadmin</option><option value="takmir">Takmir</option><option value="bendahara">Bendahara</option><option value="marbot">Marbot</option>
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
              <th style={{ padding: '12px 16px', textAlign: 'left', fontSize: '0.85rem', fontWeight: 600 }}>Username</th>
              <th style={{ padding: '12px 16px', textAlign: 'left', fontSize: '0.85rem', fontWeight: 600 }}>Nama</th>
              <th style={{ padding: '12px 16px', textAlign: 'left', fontSize: '0.85rem', fontWeight: 600 }}>Role</th>
              <th style={{ padding: '12px 16px', textAlign: 'center', fontSize: '0.85rem', fontWeight: 600 }}>Aksi</th>
            </tr>
          </thead>
          <tbody>
            {users.map(item => (
              <tr key={item.id} style={{ borderTop: '1px solid #f0f0f0' }}>
                <td style={{ padding: '12px 16px', fontSize: '0.9rem' }}>{item.username}</td>
                <td style={{ padding: '12px 16px', fontSize: '0.9rem' }}>{item.full_name}</td>
                <td style={{ padding: '12px 16px' }}>
                  <span style={{ padding: '4px 10px', borderRadius: 12, fontSize: '0.75rem', background: `${roleColors[item.role]}20`, color: roleColors[item.role], textTransform: 'capitalize' }}>
                    {item.role}
                  </span>
                </td>
                <td style={{ padding: '12px 16px', textAlign: 'center' }}>
                  {currentUser?.role === 'superadmin' && (
                    <>
                      <button onClick={() => handleEdit(item)} style={{ padding: '6px 12px', background: '#2196f3', color: 'white', border: 'none', borderRadius: 4, cursor: 'pointer', marginRight: 8, fontSize: '0.8rem' }}>Edit</button>
                      <button onClick={() => handleDelete(item.id)} style={{ padding: '6px 12px', background: '#f44336', color: 'white', border: 'none', borderRadius: 4, cursor: 'pointer', fontSize: '0.8rem' }}>Hapus</button>
                    </>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Users;