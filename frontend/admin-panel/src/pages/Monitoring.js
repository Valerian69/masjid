import React, { useState, useEffect, useCallback } from 'react';
import { monitoringAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';

const formatUptime = (seconds) => {
  if (!seconds) return '0s';
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
};

const Monitoring = () => {
  const { user } = useAuth();
  const [data, setData] = useState(null);
  const [requests, setRequests] = useState([]);
  const [errors, setErrors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [lastRefresh, setLastRefresh] = useState(null);

  const fetchAll = useCallback(async () => {
    try {
      const [overviewRes, requestsRes, errorsRes] = await Promise.all([
        monitoringAPI.getOverview(),
        monitoringAPI.getRequests(30),
        monitoringAPI.getErrors(15),
      ]);
      setData(overviewRes.data);
      setRequests(requestsRes.data);
      setErrors(errorsRes.data);
      setLastRefresh(new Date());
    } catch (err) {
      console.error('Failed to fetch monitoring data:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchAll(); }, [fetchAll]);
  useEffect(() => {
    const interval = setInterval(fetchAll, 10000);
    return () => clearInterval(interval);
  }, [fetchAll]);

  const handleReset = async () => {
    if (!window.confirm('Reset semua metrik monitoring?')) return;
    try {
      await monitoringAPI.reset();
      fetchAll();
    } catch (err) {
      alert('Gagal reset metrik');
    }
  };

  const handleCleanData = async () => {
    const confirm1 = window.confirm(
      'HAPUS SEMUA DATA?\n\n' +
      'Ini akan menghapus:\n- Jadwal Sholat\n- Kajian\n- Keuangan\n- Agenda\n- Running Text\n- Laporan\n- Audit Log\n\n' +
      'Users dan Settings TIDAK akan dihapus.\n\nKetik OK untuk melanjutkan.'
    );
    if (!confirm1) return;
    const confirm2 = window.confirm('PERINGATAN: Tindakan ini tidak dapat dibatalkan. Yakin ingin melanjutkan?');
    if (!confirm2) return;
    try {
      await monitoringAPI.cleanData();
      alert('Semua data berhasil dihapus. Mulai dari awal!');
      fetchAll();
    } catch (err) {
      alert('Gagal menghapus data: ' + (err.response?.data?.error || err.message));
    }
  };

  if (loading) return <div className="empty-state">Memuat data monitoring...</div>;
  if (!data) return <div className="empty-state" style={{ color: '#c00' }}>Gagal memuat data monitoring</div>;

  const { system, http, database, business } = data;
  const memPercent = system.memory.heapUsedBytes / system.memory.heapTotalBytes * 100;
  const errorRate = Number(http.errorRate);
  const statusClass = errorRate < 1 ? 'healthy' : errorRate < 5 ? 'degraded' : 'unhealthy';
  const statusText = errorRate < 1 ? 'System Healthy' : errorRate < 5 ? 'System Degraded' : 'System Unhealthy';

  const methodColors = { GET: 'var(--emerald-500)', POST: 'var(--blue-500)', PUT: 'var(--amber-500)', DELETE: 'var(--red)', PATCH: 'var(--purple)' };
  const methodBadge = { GET: 'badge-emerald', POST: 'badge-blue', PUT: 'badge-amber', DELETE: 'badge-red' };

  return (
    <div className="animate-in">
      <div className="page-header">
        <div>
          <h1>Monitoring</h1>
          <p className="page-header-subtitle">System health & performance metrics</p>
        </div>
        <div className="page-header-actions">
          <button onClick={fetchAll} className="btn btn-outline btn-sm">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" width="16" height="16"><path d="M4 4v5h5M20 20v-5h-5M20.49 9A9 9 0 005.64 5.64L4 4m16 16l-1.64-1.64A9 9 0 013.51 15" /></svg>
            Refresh
          </button>
          {user?.role === 'superadmin' && (
            <>
              <button onClick={handleReset} className="btn btn-danger btn-sm">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" width="16" height="16"><path d="M3 6h18M8 6V4a2 2 0 012-2h4a2 2 0 012 2v2M19 6l-1 14a2 2 0 01-2 2H8a2 2 0 01-2-2L5 6" /></svg>
                Reset Metrics
              </button>
              <button onClick={handleCleanData} className="btn btn-danger btn-sm">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" width="16" height="16"><path d="M3 6h18M8 6V4a2 2 0 012-2h4a2 2 0 012 2v2M19 6l-1 14a2 2 0 01-2 2H8a2 2 0 01-2-2L5 6" /></svg>
                Clean Data
              </button>
            </>
          )}
        </div>
      </div>

      <div className={`status-banner ${statusClass}`} style={{ marginBottom: 24 }}>
        <div className="status-dot"></div>
        <div style={{ flex: 1 }}>
          <strong>{statusText}</strong>
          <span style={{ marginLeft: 12, opacity: 0.7 }}>Uptime: {formatUptime(system.uptime)} &bull; Error Rate: {http.errorRate}%</span>
        </div>
        <span className="badge badge-emerald">Auto-refresh: 10s</span>
      </div>

      <div className="grid grid-5" style={{ marginBottom: 24 }}>
        {[
          { label: 'Total Requests', value: http.totalRequests.toLocaleString(), color: 'var(--emerald-600)', bg: 'var(--green-light)', icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" width="20" height="20"><path d="M22 12h-4l-3 9L9 3l-3 9H2"/></svg> },
          { label: 'Error Rate', value: `${http.errorRate}%`, color: errorRate < 1 ? 'var(--emerald-500)' : errorRate < 5 ? 'var(--amber)' : 'var(--red)', bg: errorRate < 1 ? 'var(--green-light)' : errorRate < 5 ? 'rgba(212,145,61,0.08)' : 'var(--red-light)', icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" width="20" height="20"><path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg> },
          { label: 'Avg Latency (p95)', value: `${http.p95}ms`, color: 'var(--blue)', bg: 'rgba(21,101,192,0.08)', icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" width="20" height="20"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg> },
          { label: 'Memory Used', value: `${memPercent.toFixed(0)}%`, color: 'var(--orange)', bg: 'rgba(230,81,0,0.08)', icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" width="20" height="20"><path d="M18 20V10"/><path d="M12 20V4"/><path d="M6 20v-6"/></svg> },
          { label: 'Total Records', value: database.totalRecords.toLocaleString(), color: 'var(--purple)', bg: 'rgba(127,31,162,0.08)', icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" width="20" height="20"><ellipse cx="12" cy="5" rx="9" ry="3"/><path d="M21 12c0 1.66-4 3-9 3s-9-1.34-9-3"/><path d="M3 5v14c0 1.66 4 3 9 3s9-1.34 9-3V5"/></svg> },
        ].map((stat, i) => (
          <div key={i} className="stat-card" style={{ '--stat-color': stat.color, '--stat-bg': stat.bg }}>
            <div className="stat-icon" style={{ background: stat.bg, color: stat.color }}>{stat.icon}</div>
            <div className="stat-value">{stat.value}</div>
            <div className="stat-label">{stat.label}</div>
          </div>
        ))}
      </div>

      <div className="grid grid-2" style={{ marginBottom: 24 }}>
        <div className="card">
          <div className="card-header"><h2>System Health</h2></div>
          <div className="card-body">
            <div style={{ marginBottom: 20 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                <span className="body-sm text-secondary">Heap Memory</span>
                <span className="body-sm" style={{ fontWeight: 600 }}>{memPercent.toFixed(1)}% ({system.memory.heapUsed} / {system.memory.heapTotal})</span>
              </div>
              <div className="progress-bar">
                <div className="progress-fill" style={{ width: `${Math.min(memPercent, 100)}%`, background: memPercent > 80 ? 'var(--red)' : memPercent > 60 ? 'var(--amber)' : 'var(--emerald-mid)' }} />
              </div>
            </div>
            <table className="info-table">
              <tbody>
                <tr><td>Uptime</td><td>{formatUptime(system.uptime)}</td></tr>
                <tr><td>CPU Cores</td><td>{system.cpu.cores}</td></tr>
                <tr><td>CPU Usage</td><td>{system.cpu.usagePercent}%</td></tr>
                <tr><td>Load Average</td><td>{system.cpu.loadAvg.join(', ')}</td></tr>
                <tr><td>Node.js</td><td>{system.nodeVersion}</td></tr>
                <tr><td>Platform</td><td>{system.platform}</td></tr>
              </tbody>
            </table>
          </div>
        </div>

        <div className="card">
          <div className="card-header"><h2>Database Collections</h2></div>
          <div className="card-body" style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {Object.entries(database.collections).map(([col, count]) => {
              const maxCount = Math.max(...Object.values(database.collections), 1);
              const colors = { users: 'var(--emerald-500)', jadwal_sholat: 'var(--blue-500)', kajian: 'var(--purple)', keuangan: 'var(--amber)', agenda: 'var(--orange)', running_text: 'var(--emerald-mid)', settings: 'var(--emerald-mid)', audit_log: 'var(--emerald-mid)', laporan: 'var(--red)' };
              return (
                <div key={col} className="category-bar">
                  <span className="bar-name" style={{ width: 120 }}>{col}</span>
                  <div className="bar-track"><div className="bar-fill" style={{ width: `${(count / maxCount) * 100}%`, background: colors[col] || 'var(--emerald-mid)' }} /></div>
                  <span className="bar-value">{count}</span>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      <div className="grid grid-3" style={{ marginBottom: 24 }}>
        <div className="card">
          <div className="card-header"><h2>By Method</h2></div>
          <div className="card-body" style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {Object.entries(http.byMethod).length === 0
              ? <p style={{ textAlign: 'center', color: 'var(--text-muted)', padding: 20 }}>Belum ada data</p>
              : Object.entries(http.byMethod).sort((a, b) => b[1] - a[1]).map(([method, count]) => (
                <div key={method} className="category-bar">
                  <span className="bar-name" style={{ width: 60 }}><span className={`badge ${methodBadge[method] || 'badge-slate'}`} style={{ fontSize: '0.6875rem' }}>{method}</span></span>
                  <div className="bar-track"><div className="bar-fill" style={{ width: `${(count / http.totalRequests) * 100}%`, background: methodColors[method] || 'var(--emerald-mid)' }} /></div>
                  <span className="bar-value">{count.toLocaleString()}</span>
                </div>
              ))
            }
          </div>
        </div>

        <div className="card">
          <div className="card-header"><h2>By Status</h2></div>
          <div className="card-body" style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {Object.entries(http.byStatus).length === 0
              ? <p style={{ textAlign: 'center', color: 'var(--text-muted)', padding: 20 }}>Belum ada data</p>
              : Object.entries(http.byStatus).sort((a, b) => b[1] - a[1]).map(([status, count]) => {
                const s = Number(status);
                const color = s < 300 ? 'badge-emerald' : s < 400 ? 'badge-blue' : s < 500 ? 'badge-amber' : 'badge-red';
                const fillColor = s < 300 ? 'var(--emerald-500)' : s < 400 ? 'var(--blue-500)' : s < 500 ? 'var(--amber)' : 'var(--red)';
                return (
                  <div key={status} className="category-bar">
                    <span className="bar-name" style={{ width: 60 }}><span className={`badge ${color}`} style={{ fontSize: '0.6875rem' }}>{status}</span></span>
                    <div className="bar-track"><div className="bar-fill" style={{ width: `${(count / http.totalRequests) * 100}%`, background: fillColor }} /></div>
                    <span className="bar-value">{count.toLocaleString()}</span>
                  </div>
                );
              })
            }
          </div>
        </div>

        <div className="card">
          <div className="card-header"><h2>Latency Distribution</h2></div>
          <div className="card-body" style={{ display: 'flex', alignItems: 'flex-end', gap: 16, height: 160, paddingBottom: 32, position: 'relative' }}>
            {http.p50 != null && (
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4, flex: 1 }}>
                <div style={{ width: '100%', height: 60, background: 'linear-gradient(180deg, var(--emerald-mid), var(--emerald-deep))', borderRadius: '6px 6px 0 0' }} />
                <span className="body-xs text-muted">p50</span>
                <span className="body-xs" style={{ fontWeight: 600 }}>{http.p50}ms</span>
              </div>
            )}
            {http.p95 != null && (
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4, flex: 1 }}>
                <div style={{ width: '100%', height: 85, background: 'linear-gradient(180deg, var(--amber-glow), var(--amber))', borderRadius: '6px 6px 0 0' }} />
                <span className="body-xs text-muted">p95</span>
                <span className="body-xs" style={{ fontWeight: 600 }}>{http.p95}ms</span>
              </div>
            )}
            {http.p99 != null && (
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4, flex: 1 }}>
                <div style={{ width: '100%', height: 110, background: 'linear-gradient(180deg, #f87171, var(--red))', borderRadius: '6px 6px 0 0' }} />
                <span className="body-xs text-muted">p99</span>
                <span className="body-xs" style={{ fontWeight: 600 }}>{http.p99}ms</span>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="grid grid-sidebar">
        <div className="card">
          <div className="card-header"><h2>Recent Requests</h2></div>
          <div className="card-body" style={{ padding: 0, maxHeight: 300, overflowY: 'auto' }}>
            <table className="table">
              <thead><tr><th>Time</th><th>Method</th><th>Route</th><th>Status</th><th>Duration</th></tr></thead>
              <tbody>
                {requests.length === 0 ? (
                  <tr><td colSpan={5} style={{ textAlign: 'center', padding: 20, color: 'var(--text-muted)' }}>Belum ada request</td></tr>
                ) : requests.map((r, i) => {
                  const s = r.status;
                  const sc = s < 300 ? 'badge-emerald' : s < 400 ? 'badge-blue' : s < 500 ? 'badge-amber' : 'badge-red';
                  return (
                    <tr key={i}>
                      <td className="body-xs text-muted">{new Date(r.timestamp).toLocaleTimeString('id-ID')}</td>
                      <td><span className={`badge ${methodBadge[r.method] || 'badge-slate'}`} style={{ fontSize: '0.625rem' }}>{r.method}</span></td>
                      <td className="body-sm" style={{ maxWidth: 200, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{r.route}</td>
                      <td><span className={`badge ${sc}`} style={{ fontSize: '0.625rem' }}>{r.status}</span></td>
                      <td className="body-xs">{r.durationMs}ms</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        <div className="card">
          <div className="card-header"><h2>Recent Errors</h2></div>
          <div className="card-body" style={{ padding: 0, maxHeight: 300, overflowY: 'auto' }}>
            {errors.length === 0 ? (
              <div style={{ textAlign: 'center', padding: 32, color: 'var(--emerald-mid)' }}>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" width="32" height="32" style={{ marginBottom: 8 }}><path d="M20 6L9 17l-5-5" /></svg>
                <p style={{ margin: 0 }}>Tidak ada error</p>
              </div>
            ) : errors.map((e, i) => (
              <div key={i} style={{ padding: '16px 20px', borderBottom: i < errors.length - 1 ? '1px solid var(--border-light)' : 'none', borderLeft: '3px solid var(--red)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                  <span className="badge badge-red" style={{ fontSize: '0.625rem' }}>{e.status}</span>
                  <span className="body-xs text-muted">{new Date(e.timestamp).toLocaleTimeString('id-ID')}</span>
                </div>
                <div className="body-sm" style={{ fontWeight: 500 }}>{e.method} {e.route}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Monitoring;
