import React, { useRef } from 'react';
import { PhoneOffIcon } from './Icons';

const pad = (n) => String(n).padStart(2, '0');

const formatCountdown = (sisa) => `${pad(Math.floor(sisa / 60))}:${pad(sisa % 60)}`;

const VISIBLE_PHASES = ['azan', 'ikamah', 'blank'];

const renderContent = (phase, prayer, sisa, progress) => {
  if (phase === 'azan') {
    return (
      <>
        <div className="phase-kicker">Telah Masuk Waktu Sholat</div>
        <div className="phase-prayer-name">{prayer.nama}</div>
        <div className="phase-prayer-time">{prayer.waktu}</div>
      </>
    );
  }

  if (phase === 'ikamah') {
    return (
      <>
        {/* Dimming layer darkens the background toward pure black across the countdown,
            creating a smooth visual transition to the blank phase. Kept separate from
            container opacity so countdown digits stay fully bright. */}
        <div className="phase-dim" style={{ opacity: progress }} />
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
      </>
    );
  }

  // blank
  return <div className="phase-blank-text">Sedang Sholat Berjamaah</div>;
};

// Murni presentasional: tidak punya timer, tidak melakukan fetch, dan tidak
// menyimpan state React. Seluruh keputusan fase diambil oleh computePhase.
//
// Fase normal tidak melepas elemen ini dari tree — sebaliknya, container tetap
// mounted dan menahan (memegang) konten fase terakhir yang terlihat sambil
// memudar keluar lewat opacity. Ini yang membuat blank → normal terasa
// meluruh, bukan memotong dari layar hitam ke dashboard terang seketika.
// Props terakhir disimpan di ref, bukan state, karena props berubah tiap
// detik dan menyimpannya di state akan memaksa render ekstra yang percuma.
const PrayerPhaseOverlay = ({ phase, prayer, sisa, progress }) => {
  const lastVisibleRef = useRef(null);

  // prayer.nama/prayer.waktu didereferensi tanpa cek di renderContent.
  // computePhase selalu menyertakan `prayer` untuk fase selain normal, tapi
  // itu adalah kontrak yang tidak dijaga di sini — bila suatu saat dilanggar,
  // perlakukan sama seperti fase normal daripada melempar.
  const isVisible = VISIBLE_PHASES.includes(phase) && prayer != null;

  if (isVisible) {
    lastVisibleRef.current = { phase, prayer, sisa, progress };
  }

  const shown = isVisible ? { phase, prayer, sisa, progress } : lastVisibleRef.current;

  // Belum pernah ada fase yang tampil sejak mount (mis. TV baru menyala di
  // luar jam sholat) — tidak ada apa pun untuk ditahan, container kosong.
  if (!shown) return <div className="phase-overlay" />;

  return (
    <div className={`phase-overlay phase-${shown.phase} ${isVisible ? 'phase-visible' : ''}`}>
      <div key={shown.phase} className="phase-overlay-content">
        {renderContent(shown.phase, shown.prayer, shown.sisa, shown.progress)}
      </div>
    </div>
  );
};

export default PrayerPhaseOverlay;
