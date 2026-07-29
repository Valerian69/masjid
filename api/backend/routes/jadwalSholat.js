const express = require('express');
const { dbHelpers } = require('../database');
const { auth, authorize } = require('../middleware/auth');

const router = express.Router();

const EQURAN_API = 'https://equran.id/api/v2';

router.get('/', async (req, res) => {
  try {
    const jadwal = await dbHelpers.findAll('jadwal_sholat');
    jadwal.sort((a, b) => a.waktu.localeCompare(b.waktu));
    res.json(jadwal);
  } catch (err) {
    res.status(500).json({ error: 'Failed to get jadwal', detail: err.message });
  }
});

router.get('/active', async (req, res) => {
  try {
    const all = await dbHelpers.findAll('jadwal_sholat');
    const jadwal = all.filter(j => j.is_active === 1 || j.is_active === true).sort((a, b) => a.waktu.localeCompare(b.waktu));
    res.json(jadwal);
  } catch (err) {
    res.status(500).json({ error: 'Failed to get active jadwal', detail: err.message });
  }
});

router.post('/', auth, authorize('superadmin', 'takmir', 'marbot'), async (req, res) => {
  try {
    const { nama_sholat, waktu, is_active } = req.body;
    const jadwal = await dbHelpers.insert('jadwal_sholat', { nama_sholat, waktu, is_active: is_active !== undefined ? is_active : true });
    res.json(jadwal);
  } catch (err) {
    res.status(500).json({ error: 'Failed to add jadwal', detail: err.message });
  }
});

router.put('/:id', auth, authorize('superadmin', 'takmir', 'marbot'), async (req, res) => {
  try {
    const { nama_sholat, waktu, is_active } = req.body;
    await dbHelpers.update('jadwal_sholat', req.params.id, { nama_sholat, waktu, is_active });
    res.json({ message: 'Jadwal sholat updated' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to update jadwal', detail: err.message });
  }
});

router.delete('/:id', auth, authorize('superadmin', 'takmir'), async (req, res) => {
  try {
    await dbHelpers.remove('jadwal_sholat', req.params.id);
    res.json({ message: 'Jadwal sholat deleted' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to delete jadwal', detail: err.message });
  }
});

router.get('/provinsi', auth, async (req, res) => {
  try {
    const response = await fetch(`${EQURAN_API}/shalat/provinsi`);
    const data = await response.json();
    if (data.code === 200) {
      res.json(data.data);
    } else {
      res.status(502).json({ error: 'Gagal mengambil data provinsi' });
    }
  } catch (err) {
    res.status(500).json({ error: 'Gagal menghubungi API EQuran.id', detail: err.message });
  }
});

router.post('/kabkota', auth, async (req, res) => {
  try {
    const { provinsi } = req.body;
    if (!provinsi) return res.status(400).json({ error: 'provinsi wajib diisi' });
    const response = await fetch(`${EQURAN_API}/shalat/kabkota`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ provinsi }),
    });
    const data = await response.json();
    if (data.code === 200) {
      res.json(data.data);
    } else {
      res.status(502).json({ error: 'Gagal mengambil data kabupaten/kota' });
    }
  } catch (err) {
    res.status(500).json({ error: 'Gagal menghubungi API EQuran.id', detail: err.message });
  }
});

router.post('/sync', auth, authorize('superadmin', 'takmir', 'marbot'), async (req, res) => {
  try {
    const allSettings = await dbHelpers.findAll('settings');
    const settings = {};
    allSettings.forEach(s => { settings[s.key] = s.value; });

    const provinsi = req.body.provinsi || settings.provinsi;
    const kabkota = req.body.kabkota || settings.kabkota;

    if (!provinsi || !kabkota) {
      return res.status(400).json({ error: 'Provinsi dan kabupaten/kota harus diatur di Pengaturan atau dikirim dalam request' });
    }

    const now = new Date();
    const bulan = req.body.bulan || now.getMonth() + 1;
    const tahun = req.body.tahun || now.getFullYear();

    const response = await fetch(`${EQURAN_API}/shalat`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ provinsi, kabkota, bulan, tahun }),
    });
    const data = await response.json();

    if (data.code !== 200) {
      return res.status(502).json({ error: 'Gagal mengambil jadwal sholat dari API', detail: data.message });
    }

    const jadwalHariIni = data.data.jadwal.find(j => {
      const tgl = `${tahun}-${String(bulan).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
      return j.tanggal_lengkap === tgl;
    });

    if (!jadwalHariIni) {
      return res.status(404).json({ error: 'Jadwal untuk hari ini tidak ditemukan' });
    }

    const mapping = [
      { nama_sholat: 'Imsak', waktu: jadwalHariIni.imsak },
      { nama_sholat: 'Subuh', waktu: jadwalHariIni.subuh },
      { nama_sholat: 'Terbit', waktu: jadwalHariIni.terbit },
      { nama_sholat: 'Dhuha', waktu: jadwalHariIni.dhuha },
      { nama_sholat: 'Dzuhur', waktu: jadwalHariIni.dzuhur },
      { nama_sholat: 'Ashar', waktu: jadwalHariIni.ashar },
      { nama_sholat: 'Maghrib', waktu: jadwalHariIni.maghrib },
      { nama_sholat: 'Isya', waktu: jadwalHariIni.isya },
    ];

    const existing = await dbHelpers.findAll('jadwal_sholat');
    const activeMap = {};
    existing.forEach(j => { activeMap[j.nama_sholat] = j.is_active; });

    for (const j of existing) {
      await dbHelpers.remove('jadwal_sholat', j.id);
    }

    const inserted = [];
    for (const j of mapping) {
      const is_active = activeMap[j.nama_sholat] !== undefined ? activeMap[j.nama_sholat] : true;
      const result = await dbHelpers.insert('jadwal_sholat', {
        nama_sholat: j.nama_sholat,
        waktu: j.waktu,
        is_active,
      });
      inserted.push(result);
    }

    if (req.body.provinsi) {
      const settingsAll = await dbHelpers.findAll('settings');
      const existingProv = settingsAll.find(s => s.key === 'provinsi');
      if (existingProv) await dbHelpers.update('settings', existingProv.id, { value: req.body.provinsi });
      else await dbHelpers.insert('settings', { key: 'provinsi', value: req.body.provinsi });
    }
    if (req.body.kabkota) {
      const settingsAll = await dbHelpers.findAll('settings');
      const existingKab = settingsAll.find(s => s.key === 'kabkota');
      if (existingKab) await dbHelpers.update('settings', existingKab.id, { value: req.body.kabkota });
      else await dbHelpers.insert('settings', { key: 'kabkota', value: req.body.kabkota });
    }

    res.json({
      message: `Jadwal sholat berhasil disinkronisasi untuk ${kabkota}, ${provinsi}`,
      date: jadwalHariIni.tanggal_lengkap,
      location: { provinsi, kabkota },
      jadwal: inserted,
    });
  } catch (err) {
    res.status(500).json({ error: 'Gagal sinkronisasi jadwal sholat', detail: err.message });
  }
});

module.exports = router;
