const express = require('express');
const { dbHelpers } = require('../database');
const { auth, authorize } = require('../middleware/auth');

const router = express.Router();

router.get('/', async (req, res) => {
  try {
    const laporan = await dbHelpers.findAll('laporan');
    laporan.sort((a, b) => b.tanggal.localeCompare(a.tanggal));
    res.json(laporan);
  } catch (err) {
    res.status(500).json({ error: 'Failed to get laporan', detail: err.message });
  }
});

router.get('/latest', async (req, res) => {
  try {
    const all = await dbHelpers.findAll('laporan');
    const laporan = all.filter(l => l.is_published === 1 || l.is_published === true)
      .sort((a, b) => b.tanggal.localeCompare(a.tanggal))
      .slice(0, 5);
    res.json(laporan);
  } catch (err) {
    res.status(500).json({ error: 'Failed to get latest laporan', detail: err.message });
  }
});

router.get('/:id', async (req, res) => {
  try {
    const item = await dbHelpers.findById('laporan', req.params.id);
    if (!item) return res.status(404).json({ error: 'Laporan not found' });
    res.json(item);
  } catch (err) {
    res.status(500).json({ error: 'Failed to get laporan', detail: err.message });
  }
});

router.post('/', auth, authorize('superadmin', 'takmir', 'marbot'), async (req, res) => {
  try {
    const { judul, tanggal, isi, kategori, is_published } = req.body;
    const laporan = await dbHelpers.insert('laporan', {
      judul,
      tanggal,
      isi,
      kategori: kategori || 'umum',
      is_published: is_published !== undefined ? is_published : true
    });
    res.json(laporan);
  } catch (err) {
    res.status(500).json({ error: 'Failed to add laporan', detail: err.message });
  }
});

router.put('/:id', auth, authorize('superadmin', 'takmir', 'marbot'), async (req, res) => {
  try {
    const { judul, tanggal, isi, kategori, is_published } = req.body;
    await dbHelpers.update('laporan', req.params.id, {
      judul, tanggal, isi, kategori, is_published
    });
    res.json({ message: 'Laporan updated' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to update laporan', detail: err.message });
  }
});

router.delete('/:id', auth, authorize('superadmin', 'takmir'), async (req, res) => {
  try {
    await dbHelpers.remove('laporan', req.params.id);
    res.json({ message: 'Laporan deleted' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to delete laporan', detail: err.message });
  }
});

module.exports = router;
