const express = require('express');
const { dbHelpers } = require('../database');
const { auth } = require('../middleware/auth');

const router = express.Router();

router.get('/', async (req, res) => {
  try {
    const allJadwal = await dbHelpers.findAll('jadwal_sholat');
    const jadwalSholat = allJadwal.filter(j => j.is_active === 1 || j.is_active === true).sort((a, b) => a.waktu.localeCompare(b.waktu));

    const today = new Date().toISOString().split('T')[0];
    const allKajian = await dbHelpers.findAll('kajian');
    const kajian = allKajian.filter(k => k.tanggal >= today).sort((a, b) => a.tanggal.localeCompare(b.tanggal) || a.jam_mulai.localeCompare(b.jam_mulai)).slice(0, 3);

    const allAgenda = await dbHelpers.findAll('agenda');
    const agenda = allAgenda.filter(a => a.tanggal >= today && (a.is_published === 1 || a.is_published === true)).sort((a, b) => a.tanggal.localeCompare(b.tanggal)).slice(0, 3);

    const allRunningText = await dbHelpers.findAll('running_text');
    const runningText = allRunningText.filter(t => t.is_active === 1 || t.is_active === true).sort((a, b) => a.urutan - b.urutan);

    const allKeuangan = await dbHelpers.findAll('keuangan');
    const saldo = allKeuangan.reduce((sum, d) => sum + (d.jenis === 'masuk' ? d.jumlah : -d.jumlah), 0);
    const now = new Date();
    const thisMonth = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
    const totalInfaq = allKeuangan.filter(d => d.jenis === 'masuk' && d.kategori === 'Infaq' && d.tanggal.startsWith(thisMonth)).reduce((sum, d) => sum + d.jumlah, 0);

    const allSettings = await dbHelpers.findAll('settings');
    const settingsObj = {};
    allSettings.forEach(s => { settingsObj[s.key] = s.value; });

    res.json({
      jadwal_sholat: jadwalSholat,
      kajian_terdekat: kajian,
      agenda_terdekat: agenda,
      running_text: runningText,
      keuangan: { saldo, total_infaq_bulan: totalInfaq },
      settings: settingsObj
    });
  } catch (err) {
    res.status(500).json({ error: 'Failed to get dashboard', detail: err.message });
  }
});

router.get('/admin', auth, async (req, res) => {
  try {
    const totalUsers = await dbHelpers.count('users');
    const totalKajian = await dbHelpers.count('kajian');
    const totalAgenda = await dbHelpers.count('agenda');
    const totalTransaksi = await dbHelpers.count('keuangan');

    const allKeuangan = await dbHelpers.findAll('keuangan');
    const saldo = allKeuangan.reduce((sum, d) => sum + (d.jenis === 'masuk' ? d.jumlah : -d.jumlah), 0);

    const today = new Date().toISOString().split('T')[0];
    const allKajian = await dbHelpers.findAll('kajian');
    const kajianTerdekat = allKajian.filter(k => k.tanggal >= today).sort((a, b) => a.tanggal.localeCompare(b.tanggal)).slice(0, 3);

    const allAgenda = await dbHelpers.findAll('agenda');
    const agendaTerdekat = allAgenda.filter(a => a.tanggal >= today).sort((a, b) => a.tanggal.localeCompare(b.tanggal)).slice(0, 3);

    res.json({ total_users: totalUsers, total_kajian: totalKajian, total_agenda: totalAgenda, total_transaksi: totalTransaksi, saldo, kajian_terdekat: kajianTerdekat, agenda_terdekat: agendaTerdekat });
  } catch (err) {
    res.status(500).json({ error: 'Failed to get admin dashboard', detail: err.message });
  }
});

module.exports = router;
