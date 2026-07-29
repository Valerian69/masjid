import React, { useState, useEffect } from 'react';
import { settingsAPI, jadwalSholatAPI } from '../services/api';
import { CloudSync as SyncIcon } from '@mui/icons-material';

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
      // Save settings first
      await settingsAPI.update(settings);
      // Then sync
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

  const inputStyle = { width: '100%', padding: '12px 16px', border: '1px solid #ddd', borderRadius: 8, fontSize: '0.95rem', boxSizing: 'border-box' };
  const labelStyle = { display: 'block', fontSize: '0.9rem', marginBottom: 8, fontWeight: 500, color: '#333' };

  if (loading) return <p>Memuat...</p>;

  return (
    <div>
      <h1 style={{ fontSize: '1.5rem', fontWeight: 700, color: '#1a5c2a', marginBottom: 24 }}>Pengaturan Masjid</h1>

      {message && (
        <div style={{
          padding: '12px 16px', borderRadius: 8, marginBottom: 20, fontSize: '0.9rem',
          background: message.includes('Berhasil') || message.includes('berhasil') ? '#e8f5e9' : '#ffebee',
          color: message.includes('Berhasil') || message.includes('berhasil') ? '#2e7d32' : '#c62828'
        }}>
          {message}
        </div>
      )}

      <form onSubmit={handleSubmit}>
        {/* Masjid Info */}
        <div style={{ background: 'white', padding: 32, borderRadius: 12, boxShadow: '0 2px 8px rgba(0,0,0,0.06)', marginBottom: 16 }}>
          <h3 style={{ fontSize: '1rem', fontWeight: 600, marginBottom: 20, color: '#333' }}>Informasi Masjid</h3>
          <div style={{ marginBottom: 20 }}>
            <label style={labelStyle}>Nama Masjid</label>
            <input
              value={settings.masjid_name || ''}
              onChange={e => setSettings({...settings, masjid_name: e.target.value})}
              style={inputStyle}
              placeholder="Masukkan nama masjid"
              required
            />
          </div>
          <div style={{ marginBottom: 20 }}>
            <label style={labelStyle}>Alamat Masjid</label>
            <input
              value={settings.masjid_address || ''}
              onChange={e => setSettings({...settings, masjid_address: e.target.value})}
              style={inputStyle}
              placeholder="Masukkan alamat masjid"
            />
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 20 }}>
            <div>
              <label style={labelStyle}>Latitude</label>
              <input
                value={settings.latitude || ''}
                onChange={e => setSettings({...settings, latitude: e.target.value})}
                style={inputStyle}
                placeholder="-6.2088"
              />
            </div>
            <div>
              <label style={labelStyle}>Longitude</label>
              <input
                value={settings.longitude || ''}
                onChange={e => setSettings({...settings, longitude: e.target.value})}
                style={inputStyle}
                placeholder="106.8456"
              />
            </div>
          </div>
          <div style={{ marginBottom: 0 }}>
            <label style={labelStyle}>Timezone</label>
            <select
              value={settings.timezone || 'Asia/Jakarta'}
              onChange={e => setSettings({...settings, timezone: e.target.value})}
              style={inputStyle}
            >
              <option value="Asia/Jakarta">WIB (Asia/Jakarta)</option>
              <option value="Asia/Makassar">WITA (Asia/Makassar)</option>
              <option value="Asia/Jayapura">WIT (Asia/Jayapura)</option>
            </select>
          </div>
        </div>

        {/* Location for Prayer Times */}
        <div style={{ background: 'white', padding: 32, borderRadius: 12, boxShadow: '0 2px 8px rgba(0,0,0,0.06)', marginBottom: 16 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
            <h3 style={{ fontSize: '1rem', fontWeight: 600, color: '#333', margin: 0 }}>Lokasi Jadwal Sholat</h3>
            <button
              type="button"
              onClick={handleSync}
              disabled={syncing || !settings.provinsi || !settings.kabkota}
              style={{
                display: 'flex', alignItems: 'center', gap: 6, padding: '8px 16px',
                background: '#2196f3', color: 'white', border: 'none', borderRadius: 8,
                cursor: syncing ? 'not-allowed' : 'pointer', fontSize: '0.85rem',
                opacity: syncing || !settings.provinsi || !settings.kabkota ? 0.6 : 1,
              }}
            >
              <SyncIcon fontSize="small" />
              {syncing ? 'Sinkronisasi...' : 'Sinkron Sekarang'}
            </button>
          </div>
          <p style={{ fontSize: '0.8rem', color: '#888', marginBottom: 16 }}>
            Pilih lokasi masjid untuk mengambil jadwal sholat otomatis dari EQuran.id
          </p>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
            <div>
              <label style={labelStyle}>Provinsi</label>
              <select
                value={settings.provinsi || ''}
                onChange={handleProvinsiChange}
                style={inputStyle}
              >
                <option value="">-- Pilih Provinsi --</option>
                {provinsiList.map(p => (
                  <option key={p} value={p}>{p}</option>
                ))}
              </select>
            </div>
            <div>
              <label style={labelStyle}>Kabupaten / Kota</label>
              <select
                value={settings.kabkota || ''}
                onChange={e => setSettings({...settings, kabkota: e.target.value})}
                style={inputStyle}
                disabled={!settings.provinsi}
              >
                <option value="">-- Pilih Kab/Kota --</option>
                {kabkotaList.map(k => (
                  <option key={k} value={k}>{k}</option>
                ))}
              </select>
            </div>
          </div>
        </div>

        <button
          type="submit"
          disabled={saving}
          style={{
            padding: '12px 32px', background: '#1a5c2a', color: 'white', border: 'none',
            borderRadius: 8, fontSize: '1rem', fontWeight: 600, cursor: saving ? 'not-allowed' : 'pointer',
            opacity: saving ? 0.7 : 1
          }}
        >
          {saving ? 'Menyimpan...' : 'Simpan Pengaturan'}
        </button>
      </form>
    </div>
  );
};

export default Settings;
