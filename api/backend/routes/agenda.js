const express = require('express');
const { dbHelpers } = require('../database');
const { auth, authorize } = require('../middleware/auth');

const router = express.Router();

router.get('/', async (req, res) => {
  try {
    const { upcoming } = req.query;
    let agenda = await dbHelpers.findAll('agenda');
    if (upcoming === 'true') {
      const today = new Date().toISOString().split('T')[0];
      agenda = agenda.filter(a => a.tanggal >= today && (a.is_published === 1 || a.is_published === true))
        .sort((a, b) => a.tanggal.localeCompare(b.tanggal)).slice(0, 5);
    } else {
      agenda.sort((a, b) => b.tanggal.localeCompare(a.tanggal));
    }
    res.json(agenda);
  } catch (err) {
    res.status(500).json({ error: 'Failed to get agenda', detail: err.message });
  }
});

router.get('/:id', async (req, res) => {
  try {
    const item = await dbHelpers.findById('agenda', req.params.id);
    if (!item) return res.status(404).json({ error: 'Agenda not found' });
    res.json(item);
  } catch (err) {
    res.status(500).json({ error: 'Failed to get agenda', detail: err.message });
  }
});

router.post('/', auth, authorize('superadmin', 'takmir', 'marbot'), async (req, res) => {
  try {
    const { judul, tanggal, jam_mulai, jam_selesai, deskripsi, lokasi, is_published } = req.body;
    const agenda = await dbHelpers.insert('agenda', { judul, tanggal, jam_mulai, jam_selesai, deskripsi, lokasi, is_published: is_published !== undefined ? is_published : true });
    res.json(agenda);
  } catch (err) {
    res.status(500).json({ error: 'Failed to add agenda', detail: err.message });
  }
});

router.put('/:id', auth, authorize('superadmin', 'takmir', 'marbot'), async (req, res) => {
  try {
    const { judul, tanggal, jam_mulai, jam_selesai, deskripsi, lokasi, is_published } = req.body;
    await dbHelpers.update('agenda', req.params.id, { judul, tanggal, jam_mulai, jam_selesai, deskripsi, lokasi, is_published });
    res.json({ message: 'Agenda updated' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to update agenda', detail: err.message });
  }
});

router.delete('/:id', auth, authorize('superadmin', 'takmir'), async (req, res) => {
  try {
    await dbHelpers.remove('agenda', req.params.id);
    res.json({ message: 'Agenda deleted' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to delete agenda', detail: err.message });
  }
});

module.exports = router;
