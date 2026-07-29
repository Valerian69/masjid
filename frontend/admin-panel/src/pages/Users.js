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

  const roleBadge = (role) => {
    const map = { superadmin: 'badge-purple', takmir: 'badge-green', bendahara: 'badge-amber', marbot: 'badge-blue' };
    return map[role] || 'badge-blue';
  };

  return (
    <div className="animate-in">
      <div className="page-header">
        <h1>Manajemen Users</h1>
        {currentUser?.role === 'superadmin' && (
          <button onClick={() => { setShowForm(!showForm); setEditingId(null); setForm({ username: '', password: '', full_name: '', role: 'marbot' }); }} className="btn btn-primary">
            + Tambah User
          </button>
        )}
      </div>

      {showForm && (
        <form onSubmit={handleSubmit} className="admin-form-card">
          <div className="admin-form-grid">
            <div className="form-group">
              <label className="form-label">Username</label>
              <input value={form.username} onChange={e => setForm({...form, username: e.target.value})} className="form-input" required disabled={!!editingId} />
            </div>
            <div className="form-group">
              <label className="form-label">{editingId ? 'Password (kosongkan jika tidak diubah)' : 'Password'}</label>
              <input type="password" value={form.password} onChange={e => setForm({...form, password: e.target.value})} className="form-input" required={!editingId} />
            </div>
            <div className="form-group">
              <label className="form-label">Nama Lengkap</label>
              <input value={form.full_name} onChange={e => setForm({...form, full_name: e.target.value})} className="form-input" required />
            </div>
            <div className="form-group">
              <label className="form-label">Role</label>
              <select value={form.role} onChange={e => setForm({...form, role: e.target.value})} className="form-input">
                <option value="superadmin">Superadmin</option>
                <option value="takmir">Takmir</option>
                <option value="bendahara">Bendahara</option>
                <option value="marbot">Marbot</option>
              </select>
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
              <th>Username</th>
              <th>Nama</th>
              <th>Role</th>
              <th className="text-center">Aksi</th>
            </tr>
          </thead>
          <tbody>
            {users.map(item => (
              <tr key={item.id}>
                <td>{item.username}</td>
                <td>{item.full_name}</td>
                <td>
                  <span className={`badge ${roleBadge(item.role)}`} style={{ textTransform: 'capitalize' }}>
                    {item.role}
                  </span>
                </td>
                <td className="text-center">
                  {currentUser?.role === 'superadmin' && (
                    <>
                      <button onClick={() => handleEdit(item)} className="btn btn-blue btn-sm" style={{ marginRight: 8 }}>Edit</button>
                      <button onClick={() => handleDelete(item.id)} className="btn btn-danger btn-sm">Hapus</button>
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
