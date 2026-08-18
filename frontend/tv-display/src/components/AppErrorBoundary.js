import React from 'react';
import { MosqueIcon } from './Icons';

// Batas waktu sebelum layar memuat ulang dirinya sendiri.
const RELOAD_AFTER_MS = 60000;

// PhaseErrorBoundary sudah menjaga overlay fase. Batas ini menjaga sisanya.
//
// Layar ini tidak ditunggui siapa pun. Tanpa batas di root, satu error render
// di Header, PrayerSchedule, atau SecondaryRotator akan membuat React melepas
// seluruh tree dan TV masjid menampilkan layar putih sampai ada yang
// mencabut listriknya. Di sini kegagalan menjelaskan dirinya, lalu memuat
// ulang sendiri — karena tidak ada yang akan menekan tombol coba lagi.
class AppErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
    this.timer = null;
  }

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error) {
    console.error('TV display failed to render:', error);
    if (this.timer) clearTimeout(this.timer);
    this.timer = setTimeout(() => window.location.reload(), RELOAD_AFTER_MS);
  }

  componentWillUnmount() {
    if (this.timer) clearTimeout(this.timer);
  }

  render() {
    if (!this.state.hasError) return this.props.children;

    return (
      <div className="tv-fallback" role="alert">
        <MosqueIcon size={80} />
        <div className="tv-fallback-title">Tampilan sedang dimuat ulang</div>
        <div className="tv-fallback-text">
          Terjadi gangguan pada tampilan. Layar akan memulihkan dirinya sendiri dalam satu menit.
        </div>
        <div className="tv-fallback-hint">Jika ini berulang, hubungi pengurus teknis masjid.</div>
      </div>
    );
  }
}

export default AppErrorBoundary;
