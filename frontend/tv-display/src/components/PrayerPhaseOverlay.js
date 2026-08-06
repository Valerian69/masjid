import React from 'react';
import { PhoneOffIcon } from './Icons';

const pad = (n) => String(n).padStart(2, '0');

const formatCountdown = (sisa) => `${pad(Math.floor(sisa / 60))}:${pad(sisa % 60)}`;

// Murni presentasional: tidak punya timer, tidak melakukan fetch, dan tidak
// menyimpan state. Seluruh keputusan fase diambil oleh computePhase.
const PrayerPhaseOverlay = ({ phase, prayer, sisa, total }) => {
  if (phase === 'azan') {
    return (
      <div className="phase-overlay phase-azan">
        <div className="phase-kicker">Telah Masuk Waktu Sholat</div>
        <div className="phase-prayer-name">{prayer.nama}</div>
        <div className="phase-prayer-time">{prayer.waktu}</div>
      </div>
    );
  }

  if (phase === 'ikamah') {
    const progress = total > 0 ? (total - sisa) / total : 0;
    return (
      // Kecerahan turun perlahan sepanjang hitung mundur agar peralihan ke
      // layar gelap terasa mulus, bukan mendadak.
      <div className="phase-overlay phase-ikamah" style={{ opacity: 1 - progress * 0.25 }}>
        <div className="phase-ikamah-prayer">{prayer.nama}</div>
        <div className="phase-kicker">Menuju Ikamah</div>
        <div className={`phase-countdown ${sisa <= 60 ? 'urgent' : ''}`}>{formatCountdown(sisa)}</div>
        <div className="phase-notice">
          {/* Ukuran diatur lewat CSS, bukan prop `size`: satuan vw tidak
              didukung andal pada atribut width/height sebuah <svg>. */}
          <PhoneOffIcon />
          Mohon Nonaktifkan Ponsel
        </div>
        <div className="phase-progress">
          <div className="phase-progress-fill" style={{ width: `${progress * 100}%` }} />
        </div>
      </div>
    );
  }

  if (phase === 'blank') {
    return (
      <div className="phase-overlay phase-blank">
        <div className="phase-blank-text">Sedang Sholat Berjamaah</div>
      </div>
    );
  }

  return null;
};

export default PrayerPhaseOverlay;
