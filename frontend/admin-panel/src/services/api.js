import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5001/api';

const api = axios.create({ baseURL: API_URL });

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

export const authAPI = {
  login: (data) => api.post('/auth/login', data),
  getMe: () => api.get('/auth/me'),
  getUsers: () => api.get('/auth/users'),
  createUser: (data) => api.post('/auth/users', data),
  updateUser: (id, data) => api.put(`/auth/users/${id}`, data),
  deleteUser: (id) => api.delete(`/auth/users/${id}`),
};

export const jadwalSholatAPI = {
  getAll: () => api.get('/jadwal-sholat'),
  getActive: () => api.get('/jadwal-sholat/active'),
  create: (data) => api.post('/jadwal-sholat', data),
  update: (id, data) => api.put(`/jadwal-sholat/${id}`, data),
  delete: (id) => api.delete(`/jadwal-sholat/${id}`),
  getProvinsi: () => api.get('/jadwal-sholat/provinsi'),
  getKabkota: (provinsi) => api.post('/jadwal-sholat/kabkota', { provinsi }),
  sync: (data) => api.post('/jadwal-sholat/sync', data),
};

export const kajianAPI = {
  getAll: (upcoming) => api.get('/kajian', { params: { upcoming } }),
  getOne: (id) => api.get(`/kajian/${id}`),
  create: (data) => api.post('/kajian', data),
  update: (id, data) => api.put(`/kajian/${id}`, data),
  delete: (id) => api.delete(`/kajian/${id}`),
};

export const keuanganAPI = {
  getAll: (params) => api.get('/keuangan', { params }),
  getSummary: () => api.get('/keuangan/summary'),
  getMonthlyTrend: () => api.get('/keuangan/monthly-trend'),
  getCategoryBreakdown: () => api.get('/keuangan/category-breakdown'),
  getReport: (params) => api.get('/keuangan/report', { params }),
  getReportPDF: (params) => api.get('/keuangan/report/pdf', { params, responseType: 'blob' }),
  exportCSV: (params) => api.get('/keuangan/export', { params, responseType: 'blob' }),
  create: (data) => api.post('/keuangan', data),
  update: (id, data) => api.put(`/keuangan/${id}`, data),
  delete: (id) => api.delete(`/keuangan/${id}`),
};

export const agendaAPI = {
  getAll: (upcoming) => api.get('/agenda', { params: { upcoming } }),
  getOne: (id) => api.get(`/agenda/${id}`),
  create: (data) => api.post('/agenda', data),
  update: (id, data) => api.put(`/agenda/${id}`, data),
  delete: (id) => api.delete(`/agenda/${id}`),
};

export const runningTextAPI = {
  getActive: () => api.get('/running-text'),
  getAll: () => api.get('/running-text/all'),
  create: (data) => api.post('/running-text', data),
  update: (id, data) => api.put(`/running-text/${id}`, data),
  delete: (id) => api.delete(`/running-text/${id}`),
};

export const dashboardAPI = {
  getAdmin: () => api.get('/dashboard/admin'),
};

export const settingsAPI = {
  get: () => api.get('/settings'),
  update: (data) => api.put('/settings', data),
};

export const laporanAPI = {
  getAll: () => api.get('/laporan'),
  getLatest: () => api.get('/laporan/latest'),
  getOne: (id) => api.get(`/laporan/${id}`),
  create: (data) => api.post('/laporan', data),
  update: (id, data) => api.put(`/laporan/${id}`, data),
  delete: (id) => api.delete(`/laporan/${id}`),
};

export const monitoringAPI = {
  getOverview: () => api.get('/monitoring/overview'),
  getSystem: () => api.get('/monitoring/system'),
  getHttp: () => api.get('/monitoring/http'),
  getRequests: (limit) => api.get('/monitoring/requests', { params: { limit } }),
  getErrors: (limit) => api.get('/monitoring/errors', { params: { limit } }),
  reset: () => api.post('/monitoring/reset'),
  cleanData: () => api.post('/monitoring/clean-data'),
};

export default api;