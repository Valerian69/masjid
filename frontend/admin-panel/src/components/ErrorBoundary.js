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
        <div style={{ padding: 40, textAlign: 'center' }}>
          <div style={{
            background: '#fef2f2', border: '1px solid #fecaca', borderRadius: 12,
            padding: 32, maxWidth: 500, margin: '60px auto'
          }}>
            <div style={{ fontSize: 48, marginBottom: 16 }}>&#9888;</div>
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
                  padding: '8px 20px', background: '#0b3d2e', color: '#fff',
                  border: 'none', borderRadius: 8, fontWeight: 600, cursor: 'pointer'
                }}
              >
                Muat Ulang
              </button>
              <button
                onClick={() => { window.location.href = '/admin/'; }}
                style={{
                  padding: '8px 20px', background: '#fff', color: '#0b3d2e',
                  border: '1px solid #d1d5db', borderRadius: 8, fontWeight: 600, cursor: 'pointer'
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
