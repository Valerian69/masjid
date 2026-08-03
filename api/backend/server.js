const express = require('express');
const cors = require('cors');
require('dotenv').config();

const { requestLogger } = require('./middleware/monitoring');
const authRoutes = require('./routes/auth');
const jadwalSholatRoutes = require('./routes/jadwalSholat');
const kajianRoutes = require('./routes/kajian');
const keuanganRoutes = require('./routes/keuangan');
const agendaRoutes = require('./routes/agenda');
const runningTextRoutes = require('./routes/runningText');
const dashboardRoutes = require('./routes/dashboard');
const settingsRoutes = require('./routes/settings');
const laporanRoutes = require('./routes/laporan');
const monitoringRoutes = require('./routes/monitoring');

const app = express();

// Middleware
const allowedOrigins = process.env.CORS_ORIGIN
  ? process.env.CORS_ORIGIN.split(',').map(o => o.trim())
  : [];
app.use(cors({
  origin: allowedOrigins.length > 0 ? allowedOrigins : true,
  credentials: true,
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(requestLogger);

// Strip error details from responses in production
if (process.env.NODE_ENV === 'production') {
  app.use((req, res, next) => {
    const originalJson = res.json.bind(res);
    res.json = (body) => {
      if (body && typeof body === 'object' && body.detail) {
        delete body.detail;
      }
      return originalJson(body);
    };
    next();
  });
}

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/jadwal-sholat', jadwalSholatRoutes);
app.use('/api/kajian', kajianRoutes);
app.use('/api/keuangan', keuanganRoutes);
app.use('/api/agenda', agendaRoutes);
app.use('/api/running-text', runningTextRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/settings', settingsRoutes);
app.use('/api/laporan', laporanRoutes);
app.use('/api/monitoring', monitoringRoutes);

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  const isProd = process.env.NODE_ENV === 'production';
  res.status(500).json({
    error: 'Something went wrong!',
    ...(isProd ? {} : { detail: err.message }),
  });
});

// For local development
if (process.env.NODE_ENV !== 'production') {
  const PORT = process.env.PORT || 5001;
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
}

module.exports = app;
