const express = require('express');
const { dbHelpers } = require('../database');
const { auth, authorize } = require('../middleware/auth');

const router = express.Router();

router.get('/', async (req, res) => {
  try {
    const all = await dbHelpers.findAll('running_text');
    const texts = all.filter(t => t.is_active === 1 || t.is_active === true).sort((a, b) => a.urutan - b.urutan);
    res.json(texts);
  } catch (err) {
    res.status(500).json({ error: 'Failed to get running text', detail: err.message });
  }
});

router.get('/all', auth, async (req, res) => {
  try {
    const texts = await dbHelpers.findAll('running_text');
    texts.sort((a, b) => a.urutan - b.urutan);
    res.json(texts);
  } catch (err) {
    res.status(500).json({ error: 'Failed to get running text', detail: err.message });
  }
});

router.post('/', auth, authorize('superadmin', 'takmir', 'marbot'), async (req, res) => {
  try {
    const { teks, jenis, is_active, urutan } = req.body;
    const text = await dbHelpers.insert('running_text', { teks, jenis, is_active: is_active !== undefined ? is_active : true, urutan: urutan || 0 });
    res.json(text);
  } catch (err) {
    res.status(500).json({ error: 'Failed to add running text', detail: err.message });
  }
});

router.put('/:id', auth, authorize('superadmin', 'takmir', 'marbot'), async (req, res) => {
  try {
    const { teks, jenis, is_active, urutan } = req.body;
    await dbHelpers.update('running_text', req.params.id, { teks, jenis, is_active, urutan });
    res.json({ message: 'Running text updated' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to update running text', detail: err.message });
  }
});

router.delete('/:id', auth, authorize('superadmin', 'takmir', 'marbot'), async (req, res) => {
  try {
    await dbHelpers.remove('running_text', req.params.id);
    res.json({ message: 'Running text deleted' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to delete running text', detail: err.message });
  }
});

module.exports = router;
