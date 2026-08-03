// Shared formatting helpers for the admin panel.

export const formatIDR = (amount) =>
  new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(amount || 0);

export const metodeLabel = (m) =>
  m === 'cash' ? 'Tunai' : m === 'transfer' ? 'Transfer' : 'E-Wallet';

export const statusLabel = (s) =>
  s === 'confirmed' ? 'Dikonfirmasi' : s === 'pending' ? 'Menunggu' : 'Dibatalkan';

export const statusBadge = (s) =>
  s === 'confirmed' ? 'badge-emerald' : s === 'pending' ? 'badge-amber' : 'badge-red';

export const jenisLabel = (j) => (j === 'masuk' ? '↑ Masuk' : '↓ Keluar');
