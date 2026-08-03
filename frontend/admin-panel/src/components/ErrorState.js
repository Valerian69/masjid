import React from 'react';

const errorIcon = (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" width="40" height="40">
    <path d="M10.29 3.86 1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/>
    <line x1="12" y1="9" x2="12" y2="13"/>
    <line x1="12" y1="17" x2="12.01" y2="17"/>
  </svg>
);

const ErrorState = ({ title = 'Gagal memuat data', message = 'Terjadi kesalahan saat mengambil data. Periksa koneksi lalu coba lagi.', onRetry }) => (
  <div className="empty-state">
    <div className="empty-state-icon empty-state-icon-danger">{errorIcon}</div>
    <h3 className="empty-state-title">{title}</h3>
    <p className="empty-state-message">{message}</p>
    {onRetry && (
      <div className="empty-state-action">
        <button className="btn btn-primary btn-sm" onClick={onRetry}>Coba lagi</button>
      </div>
    )}
  </div>
);

export default ErrorState;
