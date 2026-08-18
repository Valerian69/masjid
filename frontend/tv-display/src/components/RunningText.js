import React, { useEffect, useLayoutEffect, useRef, useState } from 'react';
import usePrefersReducedMotion from '../hooks/usePrefersReducedMotion';

// Kecepatan baca, bukan durasi tetap.
//
// Sebelumnya durasinya dipaku 55 detik berapa pun panjang teksnya, jadi
// kecepatan gulir naik setiap takmir menambah pengumuman: lima pengumuman
// berjalan ~120 px/detik, sepuluh pengumuman ~240 px/detik dan tidak terbaca
// lagi. Sekarang durasi diturunkan dari lebar konten sehingga kecepatannya
// selalu sama.
const SPEED_PX_PER_SEC = 90;
const MIN_DURATION_S = 20;

// Mode gerak-dikurangi: satu pengumuman diam pada satu waktu.
const STATIC_HOLD_MS = 9000;

const StaticAnnouncements = ({ texts }) => {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    if (texts.length <= 1) return undefined;
    const t = setInterval(() => setIndex((i) => (i + 1) % texts.length), STATIC_HOLD_MS);
    return () => clearInterval(t);
  }, [texts.length]);

  const current = texts[Math.min(index, texts.length - 1)];

  return (
    <div className="running-text-static" title={current.teks}>
      {current.teks}
    </div>
  );
};

const ScrollingAnnouncements = ({ texts }) => {
  const contentRef = useRef(null);
  const [duration, setDuration] = useState(null);

  // Diukur setelah layout supaya lebar yang dibaca sudah final. Diukur ulang
  // saat jendela berubah ukuran karena jarak tempuhnya mencakup lebar layar.
  useLayoutEffect(() => {
    const measure = () => {
      const el = contentRef.current;
      if (!el) return;
      const travel = window.innerWidth + el.scrollWidth;
      setDuration(Math.max(MIN_DURATION_S, Math.round(travel / SPEED_PX_PER_SEC)));
    };

    measure();
    window.addEventListener('resize', measure);
    return () => window.removeEventListener('resize', measure);
  }, [texts]);

  return (
    <div
      ref={contentRef}
      className="running-text-content"
      style={duration ? { '--marquee-duration': `${duration}s` } : undefined}
    >
      {texts.map((t, i) => (
        <React.Fragment key={t.id ?? i}>
          <span>{t.teks}</span>
          <span className="dot" />
        </React.Fragment>
      ))}
    </div>
  );
};

const RunningText = ({ texts }) => {
  const reducedMotion = usePrefersReducedMotion();

  if (!texts || texts.length === 0) return null;

  return (
    <div className="running-text-bar animate-in stagger-8">
      {reducedMotion ? (
        <StaticAnnouncements texts={texts} />
      ) : (
        <ScrollingAnnouncements texts={texts} />
      )}
    </div>
  );
};

export default RunningText;
