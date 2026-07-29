const express = require('express');
const { dbHelpers } = require('../database');
const { auth, authorize } = require('../middleware/auth');

const router = express.Router();

router.get('/', auth, async (req, res) => {
  try {
    const all = await dbHelpers.findAll('settings');
    const settings = {};
    all.forEach(s => { settings[s.key] = s.value; });
    res.json(settings);
  } catch (err) {
    res.status(500).json({ error: 'Failed to get settings', detail: err.message });
  }
});

router.get('/public', async (req, res) => {
  try {
    const all = await dbHelpers.findAll('settings');
    const settings = {};
    all.forEach(s => { settings[s.key] = s.value; });
    res.json(settings);
  } catch (err) {
    res.status(500).json({ error: 'Failed to get public settings', detail: err.message });
  }
});

router.put('/', auth, authorize('superadmin', 'takmir'), async (req, res) => {
  try {
    const updates = req.body;
    const allSettings = await dbHelpers.findAll('settings');
    for (const [key, value] of Object.entries(updates)) {
      const existing = allSettings.find(s => s.key === key);
      if (existing) {
        await dbHelpers.update('settings', existing.id, { value });
      } else {
        await dbHelpers.insert('settings', { key, value });
      }
    }
    res.json({ message: 'Settings updated' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to update settings', detail: err.message });
  }
});

module.exports = router;
