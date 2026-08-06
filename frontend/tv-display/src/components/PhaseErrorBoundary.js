import React from 'react';

// Tanpa ini, satu error saat merender overlay akan membuat React melepas
// seluruh root sehingga TV menampilkan layar putih kosong sampai ada yang
// me-reboot box — dan tidak ada yang menyadarinya sampai waktu sholat
// berikutnya. Kegagalan di sini cukup menjatuhkan tampilan ke keadaan normal.
class PhaseErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { failed: false };
  }

  static getDerivedStateFromError() {
    return { failed: true };
  }

  componentDidCatch(error) {
    console.error('Prayer phase overlay failed:', error);
  }

  render() {
    if (this.state.failed) return null;
    return this.props.children;
  }
}

export default PhaseErrorBoundary;
