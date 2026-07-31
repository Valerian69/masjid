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

const icons = {
  refresh: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" width="16" height="16"><path d="M4 4v5h5M20 20v-5h-5M20.49 9A9 9 0 005.64 5.64L4 4m16 16l-1.64-1.64A9 9 0 013.51 15" /></svg>,
  reset: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" width="16" height="16"><path d="M3 6h18M8 6V4a2 2 0 012-2h4a2 2 0 012 2v2M19 6l-1 14a2 2 0 01-2 2H8a2 2 0 01-2-2L5 6" /></svg>,
  speed: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" width="20" height="20"><path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83" /></svg>,
  check: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" width="20" height="20"><path d="M20 6L9 17l-5-5" /></svg>,
  warning: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" width="20" height="20"><path d="M12 9v4m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" /></svg>,
  error: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" width="20" height="20"><circle cx="12" cy="12" r="10"/><path d="M15 9l-6 6M9 9l6 6" /></svg>,
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
      'Ini akan menghapus:\n' +
      '- Jadwal Sholat\n' +
      '- Kajian\n' +
      '- Keuangan\n' +
      '- Agenda\n' +
      '- Running Text\n' +
      '- Laporan\n' +
      '- Audit Log\n\n' +
      'Users dan Settings TIDAK akan dihapus.\n\n' +
      'Ketik OK untuk melanjutkan.'
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
  const statusColor = Number(http.errorRate) < 1 ? '#4caf50' : Number(http.errorRate) < 5 ? '#ff9800' : '#f44336';
  const statusText = Number(http.errorRate) < 1 ? 'Healthy' : Number(http.errorRate) < 5 ? 'Degraded' : 'Unhealthy';

  const methodColors = { GET: '#4caf50', POST: '#2196f3', PUT: '#ff9800', DELETE: '#f44336', PATCH: '#9c27b0' };

  return (
    <div className="animate-in">
      <div className="page-header">
        <div>
          <h1>Monitoring</h1>
          <p className="page-header-subtitle">
            {lastRefresh && `Terakhir diperbarui: ${lastRefresh.toLocaleTimeString('id-ID')}`}
          </p>
        </div>
        <div className="page-header-actions">
          <button onClick={fetchAll} className="btn btn-primary">{icons.refresh} Refresh</button>
          {user?.role === 'superadmin' && (
            <>
              <button onClick={handleReset} className="btn btn-orange">{icons.reset} Reset</button>
              <button onClick={handleCleanData} className="btn btn-danger">{icons.reset} Clean Data</button>
            </>
          )}
        </div>
      </div>

      <div className="status-banner" style={{ background: `${statusColor}15`, border: `1px solid ${statusColor}40` }}>
        {Number(http.errorRate) < 1 ? icons.check : Number(http.errorRate) < 5 ? icons.warning : icons.error}
        <span className="status-banner-text" style={{ color: statusColor }}>Status: {statusText}</span>
        <span className="status-banner-sub">Uptime: {formatUptime(system.uptime)} | Error Rate: {http.errorRate}%</span>
      </div>

      <div className="monitoring-grid-5">
        {[
          { title: 'Total Requests', value: http.totalRequests.toLocaleString(), color: '#1a5c2a', icon: icons.speed },
          { title: 'Error Rate', value: `${http.errorRate}%`, sub: `${http.totalErrors} errors`, color: statusColor, icon: icons.error },
          { title: 'Avg Latency', value: `${http.avgDuration}ms`, sub: `p95: ${http.p95}ms`, color: '#2196f3', icon: icons.check },
          { title: 'Memory Used', value: system.memory.heapUsed, sub: `${memPercent.toFixed(1)}% of ${system.memory.heapTotal}`, color: '#ff9800', icon: icons.warning },
          { title: 'Total Records', value: database.totalRecords.toLocaleString(), sub: `${Object.keys(database.collections).length} collections`, color: '#9c27b0', icon: icons.speed },
        ].map((stat, i) => (
          <div key={i} className="monitoring-stat" style={{ borderLeftColor: stat.color }}>
            <div className="monitoring-stat-icon" style={{ background: `${stat.color}15`, color: stat.color }}>
              {stat.icon}
            </div>
            <div>
              <div className="monitoring-stat-label">{stat.title}</div>
              <div className="monitoring-stat-value" style={{ color: stat.color }}>{stat.value}</div>
              {stat.sub && <div className="monitoring-stat-sub">{stat.sub}</div>}
            </div>
          </div>
        ))}
      </div>

      <div className="two-col-grid">
        <div className="admin-card">
          <div className="admin-card-title">System Health</div>
          <div className="progress-item">
            <div className="progress-header">
              <span className="progress-label">Heap Memory</span>
              <span className="progress-value" style={{ color: memPercent > 80 ? '#f44336' : memPercent > 60 ? '#ff9800' : '#4caf50' }}>{memPercent.toFixed(1)}%</span>
            </div>
            <div className="progress-track">
              <div className="progress-fill" style={{ width: `${Math.min(memPercent, 100)}%`, background: memPercent > 80 ? '#f44336' : memPercent > 60 ? '#ff9800' : '#4caf50' }} />
            </div>
          </div>
          <table className="info-table" style={{ marginTop: 16 }}>
            <tbody>
              {[
                ['Uptime', formatUptime(system.uptime)],
                ['CPU Cores', system.cpu.cores],
                ['CPU Usage', `${system.cpu.usagePercent}%`],
                ['Load Avg', system.cpu.loadAvg.join(' / ')],
                ['Node.js', system.nodeVersion],
                ['Platform', system.platform],
              ].map(([k, v]) => (
                <tr key={k}>
                  <td>{k}</td>
                  <td>{v}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="admin-card">
          <div className="admin-card-title">Database Collections</div>
          {Object.entries(database.collections).map(([col, count]) => {
            const maxCount = Math.max(...Object.values(database.collections), 1);
            const colors = { users: '#1a5c2a', jadwal_sholat: '#4caf50', kajian: '#2196f3', keuangan: '#ff9800', agenda: '#9c27b0', running_text: '#00bcd4', settings: '#607d8b', audit_log: '#795548', laporan: '#e91e63' };
            const labels = { users: 'Users', jadwal_sholat: 'Jadwal Sholat', kajian: 'Kajian', keuangan: 'Keuangan', agenda: 'Agenda', running_text: 'Running Text', settings: 'Settings', audit_log: 'Audit Log', laporan: 'Laporan' };
            return (
              <div key={col} className="category-bar-item">
                <div className="category-bar-header">
                  <span className="category-bar-name">{labels[col] || col}</span>
                  <span className="category-bar-value" style={{ color: colors[col] || '#333' }}>{count}</span>
                </div>
                <div className="category-bar-track">
                  <div className="category-bar-fill" style={{ width: `${(count / maxCount) * 100}%`, background: colors[col] || '#999' }} />
                </div>
              </div>
            );
          })}
          <div style={{ marginTop: 16, padding: '10px 12px', background: '#f8faf9', borderRadius: 8, fontSize: '0.8rem', display: 'flex', justifyContent: 'space-between' }}>
            <span style={{ color: '#888' }}>Total Records</span>
            <span style={{ fontWeight: 700, color: '#1a5c2a' }}>{database.totalRecords.toLocaleString()}</span>
          </div>
        </div>
      </div>

      <div className="two-col-grid">
        <div className="admin-card">
          <div className="admin-card-title">Requests by Method</div>
          {Object.entries(http.byMethod).length === 0
            ? <p className="empty-state">Belum ada data</p>
            : Object.entries(http.byMethod).sort((a, b) => b[1] - a[1]).map(([method, count]) => (
              <div key={method} className="method-bar">
                <span className="method-bar-label" style={{ background: `${methodColors[method] || '#666'}15`, color: methodColors[method] || '#666' }}>{method}</span>
                <div className="method-bar-track">
                  <div className="method-bar-fill" style={{ width: `${(count / http.totalRequests) * 100}%`, background: methodColors[method] || '#666' }} />
                </div>
                <span className="method-bar-count">{count}</span>
              </div>
            ))}
        </div>

        <div className="admin-card">
          <div className="admin-card-title">Requests by Status</div>
          {Object.entries(http.byStatus).length === 0
            ? <p className="empty-state">Belum ada data</p>
            : Object.entries(http.byStatus).sort((a, b) => b[1] - a[1]).map(([status, count]) => {
              const s = Number(status);
              const color = s < 300 ? '#4caf50' : s < 400 ? '#2196f3' : s < 500 ? '#ff9800' : '#f44336';
              return (
                <div key={status} className="method-bar">
                  <span className="method-bar-label" style={{ background: `${color}15`, color, width: 40 }}>{status}</span>
                  <div className="method-bar-track">
                    <div className="method-bar-fill" style={{ width: `${(count / http.totalRequests) * 100}%`, background: color }} />
                  </div>
                  <span className="method-bar-count">{count}</span>
                </div>
              );
            })}
        </div>
      </div>

      <div className="admin-card" style={{ marginBottom: 16 }}>
        <div className="admin-card-header">
          <div className="admin-card-title">Latency Distribution</div>
          <span style={{ fontSize: '0.75rem', color: '#888' }}>
            p50: {http.p50}ms | p95: {http.p95}ms | p99: {http.p99}ms
          </span>
        </div>
        <div className="latency-chart">
          {http.durationBuckets && Object.entries(http.durationBuckets).map(([bucket, count]) => {
            const maxCount = Math.max(...Object.values(http.durationBuckets), 1);
            const height = (count / maxCount) * 100;
            return (
              <div key={bucket} className="latency-bar">
                <span className="latency-bar-value">{count}</span>
                <div className="latency-bar-fill" style={{ height: `${height}%`, background: '#1a5c2a' }} />
                <span className="latency-bar-label">{bucket}ms</span>
              </div>
            );
          })}
        </div>
      </div>

      <div className="two-col-grid" style={{ gridTemplateColumns: '2fr 1fr' }}>
        <div className="admin-card">
          <div className="admin-card-title">Recent Requests</div>
          <div className="mini-table-scroll">
            <table className="mini-table">
              <thead>
                <tr>
                  <th>Waktu</th>
                  <th>Method</th>
                  <th>Route</th>
                  <th className="text-center">Status</th>
                  <th className="text-right">Durasi</th>
                </tr>
              </thead>
              <tbody>
                {requests.length === 0 ? (
                  <tr><td colSpan={5} className="empty-state">Belum ada request</td></tr>
                ) : requests.map((r, i) => {
                  const s = r.status;
                  const sc = s < 300 ? '#4caf50' : s < 400 ? '#2196f3' : s < 500 ? '#ff9800' : '#f44336';
                  return (
                    <tr key={i}>
                      <td style={{ color: '#999', whiteSpace: 'nowrap' }}>{new Date(r.timestamp).toLocaleTimeString('id-ID')}</td>
                      <td>
                        <span className={`badge ${r.method === 'GET' ? 'badge-green' : r.method === 'POST' ? 'badge-blue' : r.method === 'PUT' ? 'badge-orange' : 'badge-red'}`}>
                          {r.method}
                        </span>
                      </td>
                      <td style={{ color: '#555', maxWidth: 200, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{r.route}</td>
                      <td className="text-center">
                        <span className="badge" style={{ background: `${sc}15`, color: sc }}>{r.status}</span>
                      </td>
                      <td className="text-right" style={{ color: r.durationMs > 500 ? '#f44336' : '#666' }}>{r.durationMs}ms</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        <div className="admin-card">
          <div className="admin-card-title">Recent Errors</div>
          <div className="mini-table-scroll">
            {errors.length === 0 ? (
              <div className="empty-state">
                <div className="empty-state-icon" style={{ color: '#4caf50', fontSize: 32 }}>{icons.check}</div>
                <p style={{ color: '#4caf50', fontSize: '0.85rem', margin: 0 }}>Tidak ada error</p>
              </div>
            ) : errors.map((e, i) => (
              <div key={i} className="error-item">
                <div className="error-item-header">
                  <span className="badge badge-red">{e.status}</span>
                  <span style={{ fontSize: '0.7rem', color: '#999' }}>{new Date(e.timestamp).toLocaleTimeString('id-ID')}</span>
                </div>
                <div className="error-item-route">{e.method} {e.route}</div>
                <div className="error-item-meta">{e.durationMs}ms | {e.ip}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Monitoring;
