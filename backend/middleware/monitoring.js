const os = require('os');

// ─── In-Memory Metrics Store ───────────────────────────────────────────────────
const metrics = {
  http: {
    requests: { total: 0, byMethod: {}, byStatus: {}, byRoute: {} },
    errors: { total: 0, byRoute: {} },
    duration: { buckets: [5, 10, 25, 50, 100, 250, 500, 1000, 2500, 5000], counts: {}, sum: 0 },
  },
  startTime: Date.now(),
  recentRequests: [],
  recentErrors: [],
  MAX_RECENT: 100,
};

// Ring buffer helpers
function pushRecent(arr, item, max) {
  arr.push(item);
  if (arr.length > max) arr.shift();
}

// Duration bucket index
function bucketIndex(ms, buckets) {
  for (let i = 0; i < buckets.length; i++) {
    if (ms <= buckets[i]) return i;
  }
  return buckets.length;
}

// ─── Request Logging Middleware ────────────────────────────────────────────────
function requestLogger(req, res, next) {
  const start = Date.now();
  const requestId = `req_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
  req.requestId = requestId;
  res.setHeader('X-Request-Id', requestId);

  res.on('finish', () => {
    const durationMs = Date.now() - start;
    const route = req.route?.path || req.path;
    const method = req.method;
    const status = res.statusCode;

    // Counters
    metrics.http.requests.total++;
    metrics.http.requests.byMethod[method] = (metrics.http.requests.byMethod[method] || 0) + 1;
    metrics.http.requests.byStatus[status] = (metrics.http.requests.byStatus[status] || 0) + 1;

    const routeKey = `${method} ${route}`;
    metrics.http.requests.byRoute[routeKey] = (metrics.http.requests.byRoute[routeKey] || 0) + 1;

    // Duration histogram
    metrics.http.duration.sum += durationMs;
    const bIdx = bucketIndex(durationMs, metrics.http.duration.buckets);
    const bKey = metrics.http.duration.buckets[bIdx] || 'inf';
    metrics.http.duration.counts[bKey] = (metrics.http.duration.counts[bKey] || 0) + 1;

    // Error tracking
    if (status >= 500) {
      metrics.http.errors.total++;
      metrics.http.errors.byRoute[routeKey] = (metrics.http.errors.byRoute[routeKey] || 0) + 1;

      pushRecent(metrics.recentErrors, {
        timestamp: new Date().toISOString(),
        method,
        route,
        status,
        durationMs,
        ip: req.ip,
      }, metrics.MAX_RECENT);
    }

    // Recent requests log
    pushRecent(metrics.recentRequests, {
      timestamp: new Date().toISOString(),
      method,
      route,
      status,
      durationMs,
      ip: req.ip,
      userId: req.user?.id || null,
    }, metrics.MAX_RECENT);
  });

  next();
}

// ─── Metrics Collectors ────────────────────────────────────────────────────────
function getSystemMetrics() {
  const mem = process.memoryUsage();
  return {
    uptime: process.uptime(),
    uptimeFormatted: formatUptime(process.uptime()),
    memory: {
      rss: formatBytes(mem.rss),
      heapUsed: formatBytes(mem.heapUsed),
      heapTotal: formatBytes(mem.heapTotal),
      rssBytes: mem.rss,
      heapUsedBytes: mem.heapUsed,
      heapTotalBytes: mem.heapTotal,
    },
    cpu: {
      model: os.cpus()[0]?.model || 'unknown',
      cores: os.cpus().length,
      loadAvg: os.loadavg().map(l => l.toFixed(2)),
      usagePercent: getCpuUsage(),
    },
    platform: process.platform,
    nodeVersion: process.version,
  };
}

function getCpuUsage() {
  const cpus = os.cpus();
  let totalIdle = 0, totalTick = 0;
  for (const cpu of cpus) {
    for (const type in cpu.times) {
      totalTick += cpu.times[type];
    }
    totalIdle += cpu.times.idle;
  }
  return ((1 - totalIdle / totalTick) * 100).toFixed(1);
}

function formatUptime(seconds) {
  const d = Math.floor(seconds / 86400);
  const h = Math.floor((seconds % 86400) / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = Math.floor(seconds % 60);
  const parts = [];
  if (d > 0) parts.push(`${d}d`);
  if (h > 0) parts.push(`${h}h`);
  if (m > 0) parts.push(`${m}m`);
  parts.push(`${s}s`);
  return parts.join(' ');
}

function formatBytes(bytes) {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

function getHttpRequestMetrics() {
  const avgDuration = metrics.http.requests.total > 0
    ? (metrics.http.duration.sum / metrics.http.requests.total).toFixed(2)
    : 0;

  // Calculate percentiles from buckets
  const p50 = findPercentile(50);
  const p95 = findPercentile(95);
  const p99 = findPercentile(99);

  return {
    totalRequests: metrics.http.requests.total,
    totalErrors: metrics.http.errors.total,
    errorRate: metrics.http.requests.total > 0
      ? ((metrics.http.errors.total / metrics.http.requests.total) * 100).toFixed(2)
      : '0.00',
    avgDuration: Number(avgDuration),
    p50,
    p95,
    p99,
    byMethod: metrics.http.requests.byMethod,
    byStatus: metrics.http.requests.byStatus,
    byRoute: metrics.http.requests.byRoute,
    errorsByRoute: metrics.http.errors.byRoute,
    durationBuckets: metrics.http.duration.counts,
  };
}

function findPercentile(p) {
  const total = Object.values(metrics.http.duration.counts).reduce((a, b) => a + b, 0);
  if (total === 0) return 0;
  const target = Math.ceil(total * (p / 100));
  let cumulative = 0;
  for (const bucket of metrics.http.duration.buckets) {
    cumulative += metrics.http.duration.counts[bucket] || 0;
    if (cumulative >= target) return bucket;
  }
  return metrics.http.duration.buckets[metrics.http.duration.buckets.length - 1] || 0;
}

function getRecentRequests(limit = 50) {
  return metrics.recentRequests.slice(-limit).reverse();
}

function getRecentErrors(limit = 20) {
  return metrics.recentErrors.slice(-limit).reverse();
}

function resetMetrics() {
  metrics.http.requests = { total: 0, byMethod: {}, byStatus: {}, byRoute: {} };
  metrics.http.errors = { total: 0, byRoute: {} };
  metrics.http.duration = { buckets: [5, 10, 25, 50, 100, 250, 500, 1000, 2500, 5000], counts: {}, sum: 0 };
  metrics.recentRequests = [];
  metrics.recentErrors = [];
}

module.exports = {
  requestLogger,
  getSystemMetrics,
  getHttpRequestMetrics,
  getRecentRequests,
  getRecentErrors,
  resetMetrics,
};
