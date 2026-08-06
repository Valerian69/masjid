import React, { useState, useEffect } from 'react';
import { settingsAPI, jadwalSholatAPI } from '../services/api';
import { useToast } from '../components/Toast';
import Loading from '../components/Loading';

const SyncIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" width="16" height="16">
    <path d="M4 4v5h5M20 20v-5h-5M20.49 9A9 9 0 005.64 5.64L4 4m16 16l-1.64-1.64A9 9 0 013.51 15" />
  </svg>
);

const PRAYERS = [
  { key: 'subuh', label: 'Subuh' },
  { key: 'dzuhur', label: 'Dzuhur' },
  { key: 'ashar', label: 'Ashar' },
  { key: 'maghrib', label: 'Maghrib' },
  { key: 'isya', label: 'Isya' },
];

const Settings = () => {
  const toast = useToast();
  const [settings, setSettings] = useState({
    masjid_name: '',
    masjid_address: '',
    latitude: '',
    longitude: '',
    timezone: 'Asia/Jakarta',
    provinsi: '',
    kabkota: '',
    iqomah_enabled: 'true',
    ikamah_subuh: '15',
    ikamah_dzuhur: '10',
    ikamah_ashar: '10',
    ikamah_maghrib: '5',
    ikamah_isya: '10',
    sholat_subuh: '15',
    sholat_dzuhur: '15',
    sholat_ashar: '15',
    sholat_maghrib: '15',
    sholat_isya: '15',
  });
  const [provinsiList, setProvinsiList] = useState([]);
  const [kabkotaList, setKabkotaList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [syncing, setSyncing] = useState(false);

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
      // Merge, bukan timpa: deployment lama belum punya key jeda ikamah, dan
      // menimpa akan membuang seluruh nilai default sehingga input tampil kosong.
      setSettings((prev) => ({ ...prev, ...res.data }));
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
    try {
      await settingsAPI.update(settings);
      toast.success('Pengaturan berhasil disimpan');
    } catch (err) {
      toast.error('Gagal menyimpan pengaturan.');
    } finally {
      setSaving(false);
    }
  };

  const handleSync = async () => {
    if (!settings.provinsi || !settings.kabkota) {
      toast.error('Pilih provinsi dan kabupaten/kota terlebih dahulu.');
      return;
    }
    setSyncing(true);
    try {
      await settingsAPI.update(settings);
      const res = await jadwalSholatAPI.sync({
        provinsi: settings.provinsi,
        kabkota: settings.kabkota,
      });
      toast.success(`Berhasil sinkron jadwal sholat: ${res.data.location.kabkota} (${res.data.date})`);
    } catch (err) {
      toast.error(err.response?.data?.error || 'Gagal sinkronisasi jadwal sholat.');
    } finally {
      setSyncing(false);
    }
  };

  if (loading) return <Loading text="Memuat pengaturan..." />;

  return (
    <div className="animate-in">
      <div className="tabs animate-in" style={{ marginBottom: 32, width: 'fit-content' }}>
        <button className="tab active">Pengaturan</button>
        <button className="tab" onClick={() => window.location.href = '/admin/users'}>Users</button>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="grid grid-sidebar animate-in animate-delay-1">
          <div className="card">
            <div className="card-header">
              <h2>Informasi Masjid</h2>
              <span className="badge badge-emerald badge-dot">Tersimpan</span>
            </div>
            <div className="card-body">
              <div className="form-group">
                <label className="form-label">Nama Masjid</label>
                <input value={settings.masjid_name || ''} onChange={e => setSettings({...settings, masjid_name: e.target.value})} className="form-input" placeholder="Masukkan nama masjid" required />
              </div>
              <div className="form-group">
                <label className="form-label">Alamat Masjid</label>
                <textarea value={settings.masjid_address || ''} onChange={e => setSettings({...settings, masjid_address: e.target.value})} className="form-textarea" rows="2" placeholder="Masukkan alamat masjid" />
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">Latitude</label>
                  <input value={settings.latitude || ''} onChange={e => setSettings({...settings, latitude: e.target.value})} className="form-input" placeholder="-6.2088" />
                </div>
                <div className="form-group">
                  <label className="form-label">Longitude</label>
                  <input value={settings.longitude || ''} onChange={e => setSettings({...settings, longitude: e.target.value})} className="form-input" placeholder="106.8456" />
                </div>
              </div>
              <div className="form-group">
                <label className="form-label">Timezone</label>
                <select value={settings.timezone || 'Asia/Jakarta'} onChange={e => setSettings({...settings, timezone: e.target.value})} className="form-select">
                  <option value="Asia/Jakarta">WIB (Asia/Jakarta)</option>
                  <option value="Asia/Makassar">WITA (Asia/Makassar)</option>
                  <option value="Asia/Jayapura">WIT (Asia/Jayapura)</option>
                </select>
              </div>
              <div style={{ display: 'flex', justifyContent: 'flex-end', paddingTop: 16, borderTop: '1px solid var(--border-light)' }}>
                <button type="submit" disabled={saving} className="btn btn-primary" style={{ opacity: saving ? 0.7 : 1 }}>
                  {saving ? 'Menyimpan...' : 'Simpan Pengaturan'}
                </button>
              </div>
            </div>
          </div>

          <div className="card">
            <div className="card-header"><h2>Preview TV Display</h2></div>
            <div className="card-body">
              <div style={{ background: 'linear-gradient(135deg, #061a14, #0b3d2e)', borderRadius: 'var(--radius)', padding: 'var(--space-6)', color: 'white', minHeight: 300 }}>
                <div style={{ textAlign: 'center', marginBottom: 'var(--space-6)' }}>
                  <div style={{ fontFamily: 'var(--font-display)', fontSize: '1.5rem', fontWeight: 700 }}>{settings.masjid_name || 'Masjid Al-Hikmah'}</div>
                  <div className="body-xs" style={{ opacity: 0.5, marginTop: 4 }}>17 Jumadil Akhir 1448 H</div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 'var(--space-3)' }}>
                  <div style={{ background: 'rgba(255,255,255,0.05)', borderRadius: 'var(--radius-sm)', padding: 'var(--space-3)', border: '1px solid rgba(255,255,255,0.06)' }}>
                    <div className="body-xs" style={{ opacity: 0.5 }}>Subuh</div>
                    <div style={{ fontWeight: 600, fontSize: '1.125rem' }}>04:30</div>
                  </div>
                  <div style={{ background: 'rgba(255,255,255,0.05)', borderRadius: 'var(--radius-sm)', padding: 'var(--space-3)', border: '1px solid rgba(255,255,255,0.06)' }}>
                    <div className="body-xs" style={{ opacity: 0.5 }}>Dzuhur</div>
                    <div style={{ fontWeight: 600, fontSize: '1.125rem' }}>11:30</div>
                  </div>
                  <div style={{ background: 'rgba(255,255,255,0.05)', borderRadius: 'var(--radius-sm)', padding: 'var(--space-3)', border: '1px solid rgba(255,255,255,0.06)' }}>
                    <div className="body-xs" style={{ opacity: 0.5 }}>Ashar</div>
                    <div style={{ fontWeight: 600, fontSize: '1.125rem' }}>15:00</div>
                  </div>
                  <div style={{ background: 'rgba(255,255,255,0.05)', borderRadius: 'var(--radius-sm)', padding: 'var(--space-3)', border: '1px solid rgba(255,255,255,0.06)' }}>
                    <div className="body-xs" style={{ opacity: 0.5 }}>Maghrib</div>
                    <div style={{ fontWeight: 600, fontSize: '1.125rem' }}>17:45</div>
                  </div>
                </div>

                <div style={{ marginTop: 'var(--space-4)', background: 'rgba(212,145,61,0.08)', border: '1px solid rgba(212,145,61,0.15)', borderRadius: 'var(--radius-sm)', padding: 'var(--space-3)' }}>
                  <div className="body-xs" style={{ color: '#f0c66e' }}>Kajian Terdekat</div>
                  <div style={{ fontWeight: 500, fontSize: '0.875rem', marginTop: 2 }}>Tafsir Al-Mishbah — Jumat, 19:00</div>
                </div>

                <div style={{ marginTop: 'var(--space-3)', overflow: 'hidden', background: 'rgba(255,255,255,0.03)', borderRadius: 'var(--radius-sm)', padding: 'var(--space-2) var(--space-3)' }}>
                  <div className="body-xs" style={{ opacity: 0.4, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                    Selamat datang di {settings.masjid_name || 'Masjid Al-Hikmah'} — Jadwal kajian minggu ini: Tafsir Al-Mishbah, Jumat 19:00 WIB —
                  </div>
                </div>
              </div>
              <div style={{ marginTop: 'var(--space-4)', textAlign: 'center' }}>
                <a href="/tv" target="_blank" rel="noopener noreferrer" className="btn btn-outline btn-sm">Buka TV Display</a>
              </div>
            </div>
          </div>
        </div>

        <div className="card animate-in animate-delay-2" style={{ marginTop: 24 }}>
          <div className="card-header">
            <h3 style={{ fontSize: '1rem', fontWeight: 600, margin: 0 }}>Lokasi Jadwal Sholat</h3>
            <button type="button" onClick={handleSync} disabled={syncing || !settings.provinsi || !settings.kabkota} className="btn btn-blue btn-sm" style={{ opacity: syncing || !settings.provinsi || !settings.kabkota ? 0.6 : 1 }}>
              <SyncIcon />
              {syncing ? 'Sinkron...' : 'Sinkron Sekarang'}
            </button>
          </div>
          <div className="card-body">
            <p style={{ fontSize: '0.8rem', color: '#888', marginBottom: 16 }}>
              Pilih lokasi masjid untuk mengambil jadwal sholat otomatis dari EQuran.id
            </p>
            <div className="form-row">
              <div className="form-group">
                <label className="form-label">Provinsi</label>
                <select value={settings.provinsi || ''} onChange={handleProvinsiChange} className="form-select">
                  <option value="">-- Pilih Provinsi --</option>
                  {provinsiList.map(p => (
                    <option key={p} value={p}>{p}</option>
                  ))}
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">Kabupaten / Kota</label>
                <select value={settings.kabkota || ''} onChange={e => setSettings({...settings, kabkota: e.target.value})} className="form-select" disabled={!settings.provinsi}>
                  <option value="">-- Pilih Kab/Kota --</option>
                  {kabkotaList.map(k => (
                    <option key={k} value={k}>{k}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>
        </div>

        <div className="card animate-in animate-delay-2" style={{ marginTop: 24 }}>
          <div className="card-header">
            <h3 style={{ fontSize: '1rem', fontWeight: 600, margin: 0 }}>Jeda Ikamah</h3>
          </div>
          <div className="card-body">
            <p style={{ fontSize: '0.8rem', color: '#888', marginBottom: 16 }}>
              Setelah waktu sholat masuk, TV menampilkan notifikasi azan, lalu hitung mundur menuju ikamah, lalu layar gelap selama sholat berjamaah.
            </p>
            <div className="form-group">
              <label className="form-label">Aktifkan Jeda Ikamah &amp; Layar Sholat</label>
              <select value={settings.iqomah_enabled || 'true'} onChange={e => setSettings({...settings, iqomah_enabled: e.target.value})} className="form-select">
                <option value="true">Aktif</option>
                <option value="false">Nonaktif</option>
              </select>
            </div>
            {PRAYERS.map(p => (
              <div key={p.key} className="form-row">
                <div className="form-group">
                  <label className="form-label">Jeda Ikamah {p.label} (menit)</label>
                  <input type="number" min="0" max="120" step="1" className="form-input"
                    value={settings[`ikamah_${p.key}`] ?? ''}
                    onChange={e => setSettings({...settings, [`ikamah_${p.key}`]: e.target.value})} />
                </div>
                <div className="form-group">
                  <label className="form-label">Layar Gelap {p.label} (menit)</label>
                  <input type="number" min="0" max="120" step="1" className="form-input"
                    value={settings[`sholat_${p.key}`] ?? ''}
                    onChange={e => setSettings({...settings, [`sholat_${p.key}`]: e.target.value})} />
                </div>
              </div>
            ))}
            <p style={{ fontSize: '0.8rem', color: '#888', marginTop: 8 }}>
              Sholat Jum'at dilewati — saat waktu Jum'at TV tetap menampilkan tampilan normal. Sholat lain di hari Jumat tetap berjalan seperti biasa. Isi 0 untuk melewati salah satu fase.
            </p>
          </div>
        </div>
      </form>
    </div>
  );
};

export default Settings;
