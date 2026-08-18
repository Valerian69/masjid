import React from 'react';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('ErrorBoundary caught:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{ padding: 40, textAlign: 'center' }} role="alert">
          <div style={{
            background: '#fef2f2', border: '1px solid #fecaca', borderRadius: 12,
            padding: 32, maxWidth: 500, margin: '60px auto'
          }}>
            {/* SVG, bukan glif Unicode: panel ini punya sistem ikon sendiri,
                dan gaya gambar ⚠ berbeda-beda di tiap platform. */}
            <svg
              width="44" height="44" viewBox="0 0 24 24" fill="none" stroke="#991b1b"
              strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"
              style={{ marginBottom: 16 }} aria-hidden="true" focusable="false"
            >
              <path d="M10.29 3.86 1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
              <line x1="12" y1="9" x2="12" y2="13" />
              <line x1="12" y1="17" x2="12.01" y2="17" />
            </svg>
            <h2 style={{ fontSize: '1.1rem', fontWeight: 600, color: '#991b1b', marginBottom: 8 }}>
              Terjadi Kesalahan
            </h2>
            <p style={{ fontSize: '0.85rem', color: '#991b1b', marginBottom: 20 }}>
              Halaman ini mengalami error. Silakan muat ulang atau kembali ke dashboard.
            </p>
            <p style={{ fontSize: '0.75rem', color: '#b91c1c', marginBottom: 20, fontFamily: 'monospace' }}>
              {this.state.error?.message || 'Unknown error'}
            </p>
            <div style={{ display: 'flex', gap: 12, justifyContent: 'center' }}>
              <button
                onClick={() => window.location.reload()}
                style={{
                  minHeight: 44, padding: '10px 20px', background: '#0b3d2e', color: '#fff',
                  border: 'none', borderRadius: 8, fontWeight: 600, cursor: 'pointer'
                }}
              >
                Muat Ulang
              </button>
              <button
                onClick={() => { window.location.href = '/admin/'; }}
                style={{
                  minHeight: 44, padding: '10px 20px', background: '#fff', color: '#0b3d2e',
                  border: '1px solid #9ca3af', borderRadius: 8, fontWeight: 600, cursor: 'pointer'
                }}
              >
                Dashboard
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
