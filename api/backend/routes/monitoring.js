const express = require('express');
const router = express.Router();
const { auth, authorize } = require('../middleware/auth');
const { dbHelpers } = require('../database');
const {
  getSystemMetrics,
  getHttpRequestMetrics,
  getRecentRequests,
  getRecentErrors,
  resetMetrics,
} = require('../middleware/monitoring');

router.get('/overview', auth, async (req, res) => {
  try {
    const system = getSystemMetrics();
    const http = getHttpRequestMetrics();

    const collections = [
      'users', 'jadwal_sholat', 'kajian', 'keuangan',
      'agenda', 'running_text', 'settings', 'audit_log', 'laporan',
    ];
    const collectionCounts = {};
    let totalRecords = 0;
    for (const col of collections) {
      const count = await dbHelpers.count(col);
      collectionCounts[col] = count;
      totalRecords += count;
    }

    const recentKeuangan = (await dbHelpers.findAll('keuangan')).slice(-5).reverse();
    const allKeuangan = await dbHelpers.findAll('keuangan');
    const totalSaldo = allKeuangan
      .filter(k => k.jenis === 'masuk')
      .reduce((sum, k) => sum + (k.jumlah || 0), 0)
      - allKeuangan.filter(k => k.jenis === 'keluar')
        .reduce((sum, k) => sum + (k.jumlah || 0), 0);

    const activeUsers = await dbHelpers.count('users');

    res.json({
      timestamp: new Date().toISOString(),
      system,
      http,
      database: {
        collections: collectionCounts,
        totalRecords,
      },
      business: {
        totalUsers: activeUsers,
        totalSaldo,
        recentTransactions: recentKeuangan.length,
      },
    });
  } catch (err) {
    res.status(500).json({ error: 'Failed to collect metrics', detail: err.message });
  }
});

router.get('/system', auth, (req, res) => {
  res.json(getSystemMetrics());
});

router.get('/http', auth, (req, res) => {
  res.json(getHttpRequestMetrics());
});

router.get('/requests', auth, (req, res) => {
  const limit = Math.min(parseInt(req.query.limit) || 50, 100);
  res.json(getRecentRequests(limit));
});

router.get('/errors', auth, (req, res) => {
  const limit = Math.min(parseInt(req.query.limit) || 20, 100);
  res.json(getRecentErrors(limit));
});

router.post('/reset', auth, authorize('superadmin'), (req, res) => {
  resetMetrics();
  res.json({ message: 'Metrics reset successfully' });
});

router.post('/clean-data', auth, authorize('superadmin'), async (req, res) => {
  try {
    const tables = ['jadwal_sholat', 'kajian', 'keuangan', 'agenda', 'running_text', 'laporan', 'audit_log'];
    const deleted = {};

    for (const table of tables) {
      await dbHelpers.removeAll(table);
      deleted[table] = true;
    }

    resetMetrics();

    res.json({
      message: 'All data cleaned successfully. Users and settings preserved.',
      deleted,
    });
  } catch (err) {
    res.status(500).json({ error: 'Failed to clean data', detail: err.message });
  }
});

module.exports = router;
