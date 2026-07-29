const express = require('express');
const { dbHelpers } = require('../database');
const { auth, authorize } = require('../middleware/auth');

const router = express.Router();

router.get('/', async (req, res) => {
  try {
    const { upcoming } = req.query;
    let kajian = await dbHelpers.findAll('kajian');
    if (upcoming === 'true') {
      const today = new Date().toISOString().split('T')[0];
      kajian = kajian.filter(k => k.tanggal >= today).sort((a, b) => a.tanggal.localeCompare(b.tanggal) || a.jam_mulai.localeCompare(b.jam_mulai)).slice(0, 5);
    } else {
      kajian.sort((a, b) => b.tanggal.localeCompare(a.tanggal) || b.jam_mulai.localeCompare(a.jam_mulai));
    }
    res.json(kajian);
  } catch (err) {
    res.status(500).json({ error: 'Failed to get kajian', detail: err.message });
  }
});

router.get('/:id', async (req, res) => {
  try {
    const kajian = await dbHelpers.findById('kajian', req.params.id);
    if (!kajian) return res.status(404).json({ error: 'Kajian not found' });
    res.json(kajian);
  } catch (err) {
    res.status(500).json({ error: 'Failed to get kajian', detail: err.message });
  }
});

router.post('/', auth, authorize('superadmin', 'takmir', 'marbot'), async (req, res) => {
  try {
    const { judul, ustadz, tanggal, jam_mulai, jam_selesai, deskripsi, is_recurring, recurring_day } = req.body;
    const kajian = await dbHelpers.insert('kajian', { judul, ustadz, tanggal, jam_mulai, jam_selesai, deskripsi, is_recurring: is_recurring || false, recurring_day });
    res.json(kajian);
  } catch (err) {
    res.status(500).json({ error: 'Failed to add kajian', detail: err.message });
  }
});

router.put('/:id', auth, authorize('superadmin', 'takmir', 'marbot'), async (req, res) => {
  try {
    const { judul, ustadz, tanggal, jam_mulai, jam_selesai, deskripsi, is_recurring, recurring_day } = req.body;
    await dbHelpers.update('kajian', req.params.id, { judul, ustadz, tanggal, jam_mulai, jam_selesai, deskripsi, is_recurring: is_recurring || false, recurring_day });
    res.json({ message: 'Kajian updated' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to update kajian', detail: err.message });
  }
});

router.delete('/:id', auth, authorize('superadmin', 'takmir'), async (req, res) => {
  try {
    await dbHelpers.remove('kajian', req.params.id);
    res.json({ message: 'Kajian deleted' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to delete kajian', detail: err.message });
  }
});

module.exports = router;
