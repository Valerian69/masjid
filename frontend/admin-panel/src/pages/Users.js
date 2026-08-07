import React, { useState, useEffect } from 'react';
import { authAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../components/Toast';
import { useConfirm } from '../components/ConfirmDialog';
import Loading from '../components/Loading';
import ErrorState from '../components/ErrorState';

const emptyForm = { username: '', password: '', full_name: '', role: 'marbot' };

const CheckIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="var(--emerald-500)" strokeWidth="2" width="14" height="14"><polyline points="20 6 9 17 4 12"/></svg>
);

const CrossIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="var(--red-500)" strokeWidth="2" width="14" height="14"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
);

const Users = () => {
  const { user: currentUser } = useAuth();
  const toast = useToast();
  const confirm = useConfirm();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [saving, setSaving] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState(emptyForm);

  useEffect(() => { loadUsers(); }, []);

  const loadUsers = async () => {
    setLoading(true);
    setError(false);
    try {
      const res = await authAPI.getUsers();
      setUsers(res.data);
    } catch (err) {
      setError(true);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      if (editingId) {
        await authAPI.updateUser(editingId, form);
        toast.success('User berhasil diperbarui');
      } else {
        await authAPI.createUser(form);
        toast.success('User berhasil ditambahkan');
      }
      setShowForm(false);
      setEditingId(null);
      setForm(emptyForm);
      loadUsers();
    } catch (err) {
      toast.error(err.response?.data?.error === 'Username already exists' ? 'Username sudah digunakan.' : 'Gagal menyimpan user. Coba lagi.');
    } finally {
      setSaving(false);
    }
  };

  const handleEdit = (item) => {
    setForm({ username: item.username, password: '', full_name: item.full_name, role: item.role });
    setEditingId(item.id);
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    if (id === currentUser?.id) {
      toast.error('Tidak bisa menghapus akun sendiri.');
      return;
    }
    const ok = await confirm({ title: 'Hapus User', message: 'Akun pengguna ini akan dihapus permanen. Lanjutkan?' });
    if (!ok) return;
    try {
      await authAPI.deleteUser(id);
      toast.success('User berhasil dihapus');
      loadUsers();
    } catch (err) {
      toast.error('Gagal menghapus user.');
    }
  };

  const roleBadge = (role) => {
    const map = { superadmin: 'badge-purple', takmir: 'badge-blue', bendahara: 'badge-amber', marbot: 'badge-emerald' };
    return map[role] || 'badge-blue';
  };

  const avatarColor = (role) => {
    const map = { superadmin: { bg: 'var(--emerald-100)', color: 'var(--emerald-700)' }, takmir: { bg: 'var(--blue-100)', color: 'var(--blue-600)' }, bendahara: { bg: 'var(--amber-100)', color: 'var(--amber-600)' }, marbot: { bg: 'var(--emerald-100)', color: 'var(--emerald-700)' } };
    return map[role] || { bg: 'var(--emerald-100)', color: 'var(--emerald-700)' };
  };

  const getInitials = (name) => {
    if (!name) return '??';
    return name.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2);
  };

  return (
    <div className="animate-in">
      <div className="tabs animate-in" style={{ marginBottom: 32, width: 'fit-content' }} data-tour="users-tabs">
        <button className="tab" onClick={() => window.location.href = '/admin/settings'}>Pengaturan</button>
        <button className="tab active">Users</button>
      </div>

      <div className="page-header animate-in animate-delay-1">
        <div className="page-header-left">
          <h1>Kelola Users</h1>
          <p>Manajemen akun pengguna panel admin</p>
        </div>
        {currentUser?.role === 'superadmin' && (
          <div className="page-header-actions">
            <button onClick={() => { setShowForm(!showForm); setEditingId(null); setForm(emptyForm); }} className="btn btn-primary btn-sm" data-tour="users-add">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" width="16" height="16"><path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="8.5" cy="7" r="4"/><line x1="20" y1="8" x2="20" y2="14"/><line x1="23" y1="11" x2="17" y2="11"/></svg>
              Tambah User
            </button>
          </div>
        )}
      </div>

      {showForm && (
        <form onSubmit={handleSubmit} className="card animate-in animate-delay-2" data-tour="users-form">
          <div className="card-body">
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
              <button type="submit" className="btn btn-amber" disabled={saving}>{saving ? 'Menyimpan...' : (editingId ? 'Update' : 'Simpan')}</button>
              <button type="button" onClick={() => { setShowForm(false); setEditingId(null); }} className="btn btn-outline">Batal</button>
            </div>
          </div>
        </form>
      )}

      {loading ? (
        <Loading text="Memuat data pengguna..." />
      ) : error ? (
        <ErrorState onRetry={loadUsers} />
      ) : (
      <div className="card animate-in animate-delay-3">
        <div className="table-wrapper" data-tour="users-table">
          <table className="table">
            <thead>
              <tr>
                <th>User</th>
                <th>Username</th>
                <th>Role</th>
                <th style={{ width: 140 }}>Aksi</th>
              </tr>
            </thead>
            <tbody>
              {users.map(item => {
                const ac = avatarColor(item.role);
                return (
                  <tr key={item.id}>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)' }}>
                        <div style={{ width: 36, height: 36, borderRadius: 'var(--radius-full)', background: ac.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 600, fontSize: '0.8125rem', color: ac.color }}>
                          {getInitials(item.full_name)}
                        </div>
                        <div style={{ fontWeight: 600 }}>{item.full_name}</div>
                      </div>
                    </td>
                    <td className="body-sm">{item.username}</td>
                    <td>
                      <span className={`badge ${roleBadge(item.role)}`} style={{ textTransform: 'capitalize' }}>
                        {item.role}
                      </span>
                    </td>
                    <td>
                      <div style={{ display: 'flex', gap: 'var(--space-2)' }}>
                        {currentUser?.role === 'superadmin' && (
                          <>
                            <button onClick={() => handleEdit(item)} className="btn btn-ghost btn-sm" style={{ padding: '6px 10px' }}>Edit</button>
                            <button onClick={() => handleDelete(item.id)} className="btn btn-ghost btn-sm" style={{ padding: '6px 10px', color: 'var(--red-600)' }}>Hapus</button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
              {users.length === 0 && (
                <tr><td colSpan={4} style={{ textAlign: 'center', padding: 40, color: 'var(--text-muted)' }}>Belum ada pengguna.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
      )}

      <div className="card animate-in animate-delay-4" style={{ marginTop: 'var(--space-6)' }}>
        <div className="card-header"><h2>Hak Akses Role</h2></div>
        <div className="card-body">
          <div className="grid grid-2" style={{ gap: 'var(--space-6)' }}>
            <div>
              <h4 className="h4" style={{ marginBottom: 'var(--space-3)', display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
                <span className="badge badge-purple">superadmin</span>
              </h4>
              <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: 'var(--space-2)' }}>
                <li className="body-sm text-secondary" style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
                  <CheckIcon /> Akses penuh ke semua modul
                </li>
                <li className="body-sm text-secondary" style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
                  <CheckIcon /> Kelola users & monitoring
                </li>
                <li className="body-sm text-secondary" style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
                  <CheckIcon /> Reset metrics & clean data
                </li>
              </ul>
            </div>
            <div>
              <h4 className="h4" style={{ marginBottom: 'var(--space-3)', display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
                <span className="badge badge-amber">bendahara</span>
              </h4>
              <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: 'var(--space-2)' }}>
                <li className="body-sm text-secondary" style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
                  <CheckIcon /> Kelola keuangan (CRUD)
                </li>
                <li className="body-sm text-secondary" style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
                  <CheckIcon /> Export PDF & CSV
                </li>
                <li className="body-sm text-secondary" style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
                  <CrossIcon /> Tidak bisa akses modul lain
                </li>
              </ul>
            </div>
            <div>
              <h4 className="h4" style={{ marginBottom: 'var(--space-3)', display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
                <span className="badge badge-blue">takmir</span>
              </h4>
              <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: 'var(--space-2)' }}>
                <li className="body-sm text-secondary" style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
                  <CheckIcon /> Kelola jadwal, kajian, agenda
                </li>
                <li className="body-sm text-secondary" style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
                  <CheckIcon /> Kelola running text & laporan
                </li>
                <li className="body-sm text-secondary" style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
                  <CheckIcon /> Ubah pengaturan masjid
                </li>
              </ul>
            </div>
            <div>
              <h4 className="h4" style={{ marginBottom: 'var(--space-3)', display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
                <span className="badge badge-emerald">marbot</span>
              </h4>
              <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: 'var(--space-2)' }}>
                <li className="body-sm text-secondary" style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
                  <CheckIcon /> Kelola jadwal & kajian
                </li>
                <li className="body-sm text-secondary" style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
                  <CheckIcon /> Kelola agenda & running text
                </li>
                <li className="body-sm text-secondary" style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
                  <CrossIcon /> Tidak bisa akses keuangan
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Users;
