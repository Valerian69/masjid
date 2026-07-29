import React, { useState, useEffect, useCallback } from 'react';
import { monitoringAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';
import {
  Refresh as RefreshIcon,
  MonitorHeart as MonitorIcon,
  Memory as MemoryIcon,
  Speed as SpeedIcon,
  Storage as StorageIcon,
  BugReport as BugIcon,
  AccessTime as ClockIcon,
  Warning as WarningIcon,
  CheckCircle as CheckIcon,
  Error as ErrorIcon,
  DeleteSweep as ResetIcon,
} from '@mui/icons-material';

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

const StatBox = ({ title, value, subtitle, color, icon }) => (
  <div style={{
    background: 'white', borderRadius: 12, padding: 16,
    boxShadow: '0 2px 8px rgba(0,0,0,0.06)', borderLeft: `4px solid ${color}`,
    display: 'flex', alignItems: 'center', gap: 12,
  }}>
    <div style={{
      width: 40, height: 40, borderRadius: 8, background: `${color}15`,
      display: 'flex', alignItems: 'center', justifyContent: 'center', color,
    }}>
      {icon}
    </div>
    <div>
      <div style={{ fontSize: '0.75rem', color: '#888' }}>{title}</div>
      <div style={{ fontSize: '1.3rem', fontWeight: 700, color }}>{value}</div>
      {subtitle && <div style={{ fontSize: '0.7rem', color: '#aaa' }}>{subtitle}</div>}
    </div>
  </div>
);

const Card = ({ title, icon, children, action }) => (
  <div style={{
    background: 'white', borderRadius: 12, padding: 20,
    boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
  }}>
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        <span style={{ color: '#1a5c2a' }}>{icon}</span>
        <h3 style={{ fontSize: '0.95rem', fontWeight: 600, color: '#333', margin: 0 }}>{title}</h3>
      </div>
      {action}
    </div>
    {children}
  </div>
);

const ProgressBar = ({ value, max, color, label }) => (
  <div style={{ marginBottom: 8 }}>
    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', marginBottom: 4 }}>
      <span style={{ color: '#666' }}>{label}</span>
      <span style={{ color, fontWeight: 600 }}>{value}%</span>
    </div>
    <div style={{ height: 6, background: '#f0f0f0', borderRadius: 3, overflow: 'hidden' }}>
      <div style={{
        height: '100%', width: `${Math.min(value, 100)}%`,
        background: color, borderRadius: 3, transition: 'width 0.5s ease',
      }} />
    </div>
  </div>
);

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

  // Auto-refresh every 10 seconds
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

  if (loading) return <p style={{ padding: 24 }}>Memuat data monitoring...</p>;
  if (!data) return <p style={{ padding: 24, color: '#c00' }}>Gagal memuat data monitoring</p>;

  const { system, http, database, business } = data;
  const memPercent = system.memory.heapUsedBytes / system.memory.heapTotalBytes * 100;

  const statusColor = Number(http.errorRate) < 1 ? '#4caf50' : Number(http.errorRate) < 5 ? '#ff9800' : '#f44336';
  const statusText = Number(http.errorRate) < 1 ? 'Healthy' : Number(http.errorRate) < 5 ? 'Degraded' : 'Unhealthy';

  return (
    <div>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <div>
          <h1 style={{ fontSize: '1.5rem', fontWeight: 700, color: '#1a5c2a', margin: 0 }}>
            <MonitorIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
            Monitoring
          </h1>
          <p style={{ fontSize: '0.8rem', color: '#888', margin: '4px 0 0' }}>
            {lastRefresh && `Terakhir diperbarui: ${lastRefresh.toLocaleTimeString('id-ID')}`}
          </p>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <button
            onClick={fetchAll}
            style={{
              display: 'flex', alignItems: 'center', gap: 6, padding: '8px 16px',
              background: '#1a5c2a', color: 'white', border: 'none', borderRadius: 8,
              cursor: 'pointer', fontSize: '0.85rem',
            }}
          >
            <RefreshIcon fontSize="small" /> Refresh
          </button>
          {user?.role === 'superadmin' && (
            <button
              onClick={handleReset}
              style={{
                display: 'flex', alignItems: 'center', gap: 6, padding: '8px 16px',
                background: '#fff3e0', color: '#e65100', border: '1px solid #ffcc02',
                borderRadius: 8, cursor: 'pointer', fontSize: '0.85rem',
              }}
            >
              <ResetIcon fontSize="small" /> Reset
            </button>
          )}
        </div>
      </div>

      {/* Status Banner */}
      <div style={{
        background: `${statusColor}15`, border: `1px solid ${statusColor}40`,
        borderRadius: 12, padding: '12px 20px', marginBottom: 20,
        display: 'flex', alignItems: 'center', gap: 10,
      }}>
        {Number(http.errorRate) < 1
          ? <CheckIcon style={{ color: statusColor }} />
          : Number(http.errorRate) < 5
            ? <WarningIcon style={{ color: statusColor }} />
            : <ErrorIcon style={{ color: statusColor }} />
        }
        <span style={{ fontSize: '0.9rem', fontWeight: 600, color: statusColor }}>
          Status: {statusText}
        </span>
        <span style={{ fontSize: '0.8rem', color: '#888', marginLeft: 8 }}>
          Uptime: {formatUptime(system.uptime)} | Error Rate: {http.errorRate}%
        </span>
      </div>

      {/* Top Stats Row */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: 16, marginBottom: 20 }}>
        <StatBox
          title="Total Requests"
          value={http.totalRequests.toLocaleString()}
          color="#1a5c2a"
          icon={<SpeedIcon />}
        />
        <StatBox
          title="Error Rate"
          value={`${http.errorRate}%`}
          subtitle={`${http.totalErrors} errors`}
          color={statusColor}
          icon={<BugIcon />}
        />
        <StatBox
          title="Avg Latency"
          value={`${http.avgDuration}ms`}
          subtitle={`p95: ${http.p95}ms`}
          color="#2196f3"
          icon={<ClockIcon />}
        />
        <StatBox
          title="Memory Used"
          value={system.memory.heapUsed}
          subtitle={`${memPercent.toFixed(1)}% of ${system.memory.heapTotal}`}
          color="#ff9800"
          icon={<MemoryIcon />}
        />
        <StatBox
          title="Total Records"
          value={database.totalRecords.toLocaleString()}
          subtitle={`${Object.keys(database.collections).length} collections`}
          color="#9c27b0"
          icon={<StorageIcon />}
        />
      </div>

      {/* Main Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 16 }}>

        {/* System Health */}
        <Card title="System Health" icon={<MemoryIcon />}>
          <ProgressBar
            label="Heap Memory"
            value={memPercent.toFixed(1)}
            color={memPercent > 80 ? '#f44336' : memPercent > 60 ? '#ff9800' : '#4caf50'}
          />
          <ProgressBar
            label="RSS Memory"
            value={((system.memory.rssBytes / (1024 * 1024 * 1024)) * 100).toFixed(1)}
            color="#2196f3"
          />
          <div style={{ marginTop: 16 }}>
            <table style={{ width: '100%', fontSize: '0.8rem', borderCollapse: 'collapse' }}>
              <tbody>
                {[
                  ['Uptime', formatUptime(system.uptime)],
                  ['CPU Cores', system.cpu.cores],
                  ['CPU Usage', `${system.cpu.usagePercent}%`],
                  ['Load Avg', system.cpu.loadAvg.join(' / ')],
                  ['Node.js', system.nodeVersion],
                  ['Platform', system.platform],
                ].map(([k, v]) => (
                  <tr key={k} style={{ borderBottom: '1px solid #f5f5f5' }}>
                    <td style={{ padding: '6px 0', color: '#888' }}>{k}</td>
                    <td style={{ padding: '6px 0', textAlign: 'right', fontWeight: 500 }}>{v}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>

        {/* Database Collections */}
        <Card title="Database Collections" icon={<StorageIcon />}>
          {Object.entries(database.collections).map(([col, count]) => {
            const maxCount = Math.max(...Object.values(database.collections), 1);
            const colors = {
              users: '#1a5c2a', jadwal_sholat: '#4caf50', kajian: '#2196f3',
              keuangan: '#ff9800', agenda: '#9c27b0', running_text: '#00bcd4',
              settings: '#607d8b', audit_log: '#795548', laporan: '#e91e63',
            };
            const labels = {
              users: 'Users', jadwal_sholat: 'Jadwal Sholat', kajian: 'Kajian',
              keuangan: 'Keuangan', agenda: 'Agenda', running_text: 'Running Text',
              settings: 'Settings', audit_log: 'Audit Log', laporan: 'Laporan',
            };
            return (
              <div key={col} style={{ marginBottom: 10 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', marginBottom: 3 }}>
                  <span style={{ color: '#555' }}>{labels[col] || col}</span>
                  <span style={{ fontWeight: 600, color: colors[col] || '#333' }}>{count}</span>
                </div>
                <div style={{ height: 5, background: '#f0f0f0', borderRadius: 3, overflow: 'hidden' }}>
                  <div style={{
                    height: '100%', width: `${(count / maxCount) * 100}%`,
                    background: colors[col] || '#999', borderRadius: 3,
                  }} />
                </div>
              </div>
            );
          })}
          <div style={{
            marginTop: 16, padding: '10px 12px', background: '#f8f9fa', borderRadius: 8,
            fontSize: '0.8rem', display: 'flex', justifyContent: 'space-between',
          }}>
            <span style={{ color: '#888' }}>Total Records</span>
            <span style={{ fontWeight: 700, color: '#1a5c2a' }}>{database.totalRecords.toLocaleString()}</span>
          </div>
        </Card>
      </div>

      {/* Requests by Method + Status */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 16 }}>
        <Card title="Requests by Method" icon={<SpeedIcon />}>
          {Object.entries(http.byMethod).length === 0
            ? <p style={{ color: '#aaa', fontSize: '0.85rem' }}>Belum ada data</p>
            : Object.entries(http.byMethod).sort((a, b) => b[1] - a[1]).map(([method, count]) => {
              const colors = { GET: '#4caf50', POST: '#2196f3', PUT: '#ff9800', DELETE: '#f44336', PATCH: '#9c27b0' };
              return (
                <div key={method} style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
                  <span style={{
                    display: 'inline-block', width: 56, padding: '2px 8px', borderRadius: 4,
                    background: `${colors[method] || '#666'}15`, color: colors[method] || '#666',
                    fontSize: '0.75rem', fontWeight: 600, textAlign: 'center',
                  }}>
                    {method}
                  </span>
                  <div style={{ flex: 1, height: 6, background: '#f0f0f0', borderRadius: 3, overflow: 'hidden' }}>
                    <div style={{
                      height: '100%',
                      width: `${(count / http.totalRequests) * 100}%`,
                      background: colors[method] || '#666', borderRadius: 3,
                    }} />
                  </div>
                  <span style={{ fontSize: '0.8rem', fontWeight: 500, minWidth: 40, textAlign: 'right' }}>{count}</span>
                </div>
              );
            })}
        </Card>

        <Card title="Requests by Status" icon={<CheckIcon />}>
          {Object.entries(http.byStatus).length === 0
            ? <p style={{ color: '#aaa', fontSize: '0.85rem' }}>Belum ada data</p>
            : Object.entries(http.byStatus).sort((a, b) => b[1] - a[1]).map(([status, count]) => {
              const s = Number(status);
              const color = s < 300 ? '#4caf50' : s < 400 ? '#2196f3' : s < 500 ? '#ff9800' : '#f44336';
              return (
                <div key={status} style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
                  <span style={{
                    display: 'inline-block', width: 40, padding: '2px 8px', borderRadius: 4,
                    background: `${color}15`, color,
                    fontSize: '0.75rem', fontWeight: 600, textAlign: 'center',
                  }}>
                    {status}
                  </span>
                  <div style={{ flex: 1, height: 6, background: '#f0f0f0', borderRadius: 3, overflow: 'hidden' }}>
                    <div style={{
                      height: '100%',
                      width: `${(count / http.totalRequests) * 100}%`,
                      background: color, borderRadius: 3,
                    }} />
                  </div>
                  <span style={{ fontSize: '0.8rem', fontWeight: 500, minWidth: 40, textAlign: 'right' }}>{count}</span>
                </div>
              );
            })}
        </Card>
      </div>

      {/* Latency Distribution */}
      <Card title="Latency Distribution" icon={<ClockIcon />} action={
        <span style={{ fontSize: '0.75rem', color: '#888' }}>
          p50: {http.p50}ms | p95: {http.p95}ms | p99: {http.p99}ms
        </span>
      }>
        <div style={{ display: 'flex', alignItems: 'flex-end', gap: 4, height: 120, padding: '0 4px' }}>
          {http.durationBuckets && Object.entries(http.durationBuckets).map(([bucket, count]) => {
            const maxCount = Math.max(...Object.values(http.durationBuckets), 1);
            const height = (count / maxCount) * 100;
            return (
              <div key={bucket} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
                <span style={{ fontSize: '0.65rem', color: '#888' }}>{count}</span>
                <div style={{
                  width: '100%', height: `${height}%`, background: '#1a5c2a',
                  borderRadius: '4px 4px 0 0', minHeight: 2,
                }} />
                <span style={{ fontSize: '0.6rem', color: '#aaa' }}>{bucket}ms</span>
              </div>
            );
          })}
        </div>
      </Card>

      {/* Recent Requests + Errors */}
      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 16, marginTop: 16 }}>
        {/* Recent Requests */}
        <Card title="Recent Requests" icon={<SpeedIcon />}>
          <div style={{ maxHeight: 360, overflow: 'auto' }}>
            <table style={{ width: '100%', fontSize: '0.78rem', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ borderBottom: '2px solid #eee' }}>
                  <th style={{ padding: '8px 6px', textAlign: 'left', color: '#888', fontWeight: 600 }}>Waktu</th>
                  <th style={{ padding: '8px 6px', textAlign: 'left', color: '#888', fontWeight: 600 }}>Method</th>
                  <th style={{ padding: '8px 6px', textAlign: 'left', color: '#888', fontWeight: 600 }}>Route</th>
                  <th style={{ padding: '8px 6px', textAlign: 'center', color: '#888', fontWeight: 600 }}>Status</th>
                  <th style={{ padding: '8px 6px', textAlign: 'right', color: '#888', fontWeight: 600 }}>Durasi</th>
                </tr>
              </thead>
              <tbody>
                {requests.length === 0 ? (
                  <tr><td colSpan={5} style={{ padding: 16, textAlign: 'center', color: '#aaa' }}>Belum ada request</td></tr>
                ) : requests.map((r, i) => {
                  const s = r.status;
                  const statusColor = s < 300 ? '#4caf50' : s < 400 ? '#2196f3' : s < 500 ? '#ff9800' : '#f44336';
                  return (
                    <tr key={i} style={{ borderBottom: '1px solid #f8f8f8' }}>
                      <td style={{ padding: '6px', color: '#999', whiteSpace: 'nowrap' }}>
                        {new Date(r.timestamp).toLocaleTimeString('id-ID')}
                      </td>
                      <td style={{ padding: '6px' }}>
                        <span style={{
                          padding: '1px 6px', borderRadius: 3, fontSize: '0.7rem', fontWeight: 600,
                          background: r.method === 'GET' ? '#e8f5e9' : r.method === 'POST' ? '#e3f2fd' : r.method === 'PUT' ? '#fff3e0' : '#fce4ec',
                          color: r.method === 'GET' ? '#2e7d32' : r.method === 'POST' ? '#1565c0' : r.method === 'PUT' ? '#e65100' : '#c62828',
                        }}>
                          {r.method}
                        </span>
                      </td>
                      <td style={{ padding: '6px', color: '#555', maxWidth: 200, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {r.route}
                      </td>
                      <td style={{ padding: '6px', textAlign: 'center' }}>
                        <span style={{
                          padding: '1px 8px', borderRadius: 10, fontSize: '0.7rem', fontWeight: 600,
                          background: `${statusColor}15`, color: statusColor,
                        }}>
                          {r.status}
                        </span>
                      </td>
                      <td style={{ padding: '6px', textAlign: 'right', color: r.durationMs > 500 ? '#f44336' : '#666' }}>
                        {r.durationMs}ms
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </Card>

        {/* Recent Errors */}
        <Card title="Recent Errors" icon={<BugIcon />}>
          <div style={{ maxHeight: 360, overflow: 'auto' }}>
            {errors.length === 0 ? (
              <div style={{ padding: 20, textAlign: 'center' }}>
                <CheckIcon style={{ color: '#4caf50', fontSize: 32, marginBottom: 8 }} />
                <p style={{ color: '#4caf50', fontSize: '0.85rem', margin: 0 }}>Tidak ada error</p>
              </div>
            ) : errors.map((e, i) => (
              <div key={i} style={{
                padding: '10px 12px', marginBottom: 8, background: '#fff5f5',
                borderRadius: 8, borderLeft: '3px solid #f44336',
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
                  <span style={{
                    padding: '1px 6px', borderRadius: 3, fontSize: '0.7rem', fontWeight: 600,
                    background: '#fce4ec', color: '#c62828',
                  }}>
                    {e.status}
                  </span>
                  <span style={{ fontSize: '0.7rem', color: '#999' }}>
                    {new Date(e.timestamp).toLocaleTimeString('id-ID')}
                  </span>
                </div>
                <div style={{ fontSize: '0.78rem', color: '#333' }}>
                  {e.method} {e.route}
                </div>
                <div style={{ fontSize: '0.7rem', color: '#999', marginTop: 2 }}>
                  {e.durationMs}ms | {e.ip}
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
};

export default Monitoring;
