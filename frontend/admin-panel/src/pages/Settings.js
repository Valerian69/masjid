import React, { useState, useEffect } from 'react';
import { settingsAPI, jadwalSholatAPI } from '../services/api';

const SyncIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" width="16" height="16">
    <path d="M4 4v5h5M20 20v-5h-5M20.49 9A9 9 0 005.64 5.64L4 4m16 16l-1.64-1.64A9 9 0 013.51 15" />
  </svg>
);

const Settings = () => {
  const [settings, setSettings] = useState({
    masjid_name: '',
    masjid_address: '',
    latitude: '',
    longitude: '',
    timezone: 'Asia/Jakarta',
    provinsi: '',
    kabkota: '',
  });
  const [provinsiList, setProvinsiList] = useState([]);
  const [kabkotaList, setKabkotaList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [syncing, setSyncing] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    loadSettings();
    loadProvinsi();
  }, []);

  useEffect(() => {
    if (settings.provinsi) {
      loadKabkota(settings.provinsi);
    }
  }, [settings.provinsi]);

  const loadSettings = async () => {
    try {
      const res = await settingsAPI.get();
      setSettings(res.data);
    } catch (err) {
      console.error('Failed to load settings:', err);
    } finally {
      setLoading(false);
    }
  };

  const loadProvinsi = async () => {
    try {
      const res = await jadwalSholatAPI.getProvinsi();
      setProvinsiList(res.data);
    } catch (err) {
      console.error('Failed to load provinsi:', err);
    }
  };

  const loadKabkota = async (provinsi) => {
    try {
      const res = await jadwalSholatAPI.getKabkota(provinsi);
      setKabkotaList(res.data);
    } catch (err) {
      console.error('Failed to load kabkota:', err);
    }
  };

  const handleProvinsiChange = async (e) => {
    const provinsi = e.target.value;
    setSettings({ ...settings, provinsi, kabkota: '' });
    if (provinsi) {
      await loadKabkota(provinsi);
    } else {
      setKabkotaList([]);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setMessage('');
    try {
      await settingsAPI.update(settings);
      setMessage('Pengaturan berhasil disimpan!');
    } catch (err) {
      setMessage('Gagal menyimpan pengaturan');
    } finally {
      setSaving(false);
    }
  };

  const handleSync = async () => {
    if (!settings.provinsi || !settings.kabkota) {
      setMessage('Pilih provinsi dan kabupaten/kota terlebih dahulu!');
      return;
    }
    setSyncing(true);
    setMessage('');
    try {
      await settingsAPI.update(settings);
      const res = await jadwalSholatAPI.sync({
        provinsi: settings.provinsi,
        kabkota: settings.kabkota,
      });
      setMessage(`Berhasil sinkronisasi jadwal sholat untuk ${res.data.location.kabkota} (${res.data.date})`);
    } catch (err) {
      setMessage(err.response?.data?.error || 'Gagal sinkronisasi jadwal sholat');
    } finally {
      setSyncing(false);
    }
  };

  if (loading) return <div className="empty-state">Memuat...</div>;

  return (
    <div className="animate-in">
      <div className="page-header">
        <div>
          <h1>Pengaturan Masjid</h1>
          <p className="page-header-subtitle">Konfigurasi informasi dan lokasi masjid</p>
        </div>
      </div>

      {message && (
        <div className={`alert ${message.includes('Berhasil') || message.includes('berhasil') ? 'alert-success' : 'alert-error'}`}>
          {message}
        </div>
      )}

      <form onSubmit={handleSubmit}>
        <div className="admin-form-card">
          <h3 style={{ fontSize: '1rem', fontWeight: 600, marginBottom: 20, color: '#333' }}>Informasi Masjid</h3>
          <div className="form-group" style={{ marginBottom: 20 }}>
            <label className="form-label">Nama Masjid</label>
            <input value={settings.masjid_name || ''} onChange={e => setSettings({...settings, masjid_name: e.target.value})} className="form-input" style={{ padding: '12px 16px', fontSize: '0.95rem' }} placeholder="Masukkan nama masjid" required />
          </div>
          <div className="form-group" style={{ marginBottom: 20 }}>
            <label className="form-label">Alamat Masjid</label>
            <input value={settings.masjid_address || ''} onChange={e => setSettings({...settings, masjid_address: e.target.value})} className="form-input" style={{ padding: '12px 16px', fontSize: '0.95rem' }} placeholder="Masukkan alamat masjid" />
          </div>
          <div className="admin-form-grid" style={{ marginBottom: 20 }}>
            <div className="form-group">
              <label className="form-label">Latitude</label>
              <input value={settings.latitude || ''} onChange={e => setSettings({...settings, latitude: e.target.value})} className="form-input" style={{ padding: '12px 16px', fontSize: '0.95rem' }} placeholder="-6.2088" />
            </div>
            <div className="form-group">
              <label className="form-label">Longitude</label>
              <input value={settings.longitude || ''} onChange={e => setSettings({...settings, longitude: e.target.value})} className="form-input" style={{ padding: '12px 16px', fontSize: '0.95rem' }} placeholder="106.8456" />
            </div>
          </div>
          <div className="form-group">
            <label className="form-label">Timezone</label>
            <select value={settings.timezone || 'Asia/Jakarta'} onChange={e => setSettings({...settings, timezone: e.target.value})} className="form-input" style={{ padding: '12px 16px', fontSize: '0.95rem' }}>
              <option value="Asia/Jakarta">WIB (Asia/Jakarta)</option>
              <option value="Asia/Makassar">WITA (Asia/Makassar)</option>
              <option value="Asia/Jayapura">WIT (Asia/Jayapura)</option>
            </select>
          </div>
        </div>

        <div className="admin-form-card">
          <div className="page-header" style={{ marginBottom: 0 }}>
            <div>
              <h3 style={{ fontSize: '1rem', fontWeight: 600, color: '#333', margin: 0 }}>Lokasi Jadwal Sholat</h3>
            </div>
            <button type="button" onClick={handleSync} disabled={syncing || !settings.provinsi || !settings.kabkota} className="btn btn-blue btn-sm" style={{ opacity: syncing || !settings.provinsi || !settings.kabkota ? 0.6 : 1 }}>
              <SyncIcon />
              {syncing ? 'Sinkron...' : 'Sinkron Sekarang'}
            </button>
          </div>
          <p style={{ fontSize: '0.8rem', color: '#888', marginBottom: 16 }}>
            Pilih lokasi masjid untuk mengambil jadwal sholat otomatis dari EQuran.id
          </p>
          <div className="admin-form-grid">
            <div className="form-group">
              <label className="form-label">Provinsi</label>
              <select value={settings.provinsi || ''} onChange={handleProvinsiChange} className="form-input" style={{ padding: '12px 16px', fontSize: '0.95rem' }}>
                <option value="">-- Pilih Provinsi --</option>
                {provinsiList.map(p => (
                  <option key={p} value={p}>{p}</option>
                ))}
              </select>
            </div>
            <div className="form-group">
              <label className="form-label">Kabupaten / Kota</label>
              <select value={settings.kabkota || ''} onChange={e => setSettings({...settings, kabkota: e.target.value})} className="form-input" style={{ padding: '12px 16px', fontSize: '0.95rem' }} disabled={!settings.provinsi}>
                <option value="">-- Pilih Kab/Kota --</option>
                {kabkotaList.map(k => (
                  <option key={k} value={k}>{k}</option>
                ))}
              </select>
            </div>
          </div>
        </div>

        <button type="submit" disabled={saving} className="btn btn-primary" style={{ padding: '12px 32px', fontSize: '1rem', opacity: saving ? 0.7 : 1 }}>
          {saving ? 'Menyimpan...' : 'Simpan Pengaturan'}
        </button>
      </form>
    </div>
  );
};

export default Settings;
