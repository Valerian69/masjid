import React, { useMemo } from 'react';
import { useClock } from '../hooks/useClock';

const pad = (n) => String(n).padStart(2, '0');

// Imsak, Terbit, dan Dhuha ada di jadwal tapi bukan sholat wajib, jadi
// label "Menuju Sholat Berikutnya" salah ketika salah satunya yang berikutnya.
const SHOLAT = new Set(['Subuh', 'Dzuhur', "Jum'at", 'Ashar', 'Maghrib', 'Isya']);

const formatPrayerName = (nama, clock) =>
  (clock.day() === 5 && nama === 'Dzuhur' ? "Jum'at" : nama);

// Panel hero "waktu berikutnya": elemen paling menonjol di layar TV.
const NextPrayer = ({ jadwal }) => {
  const now = useClock();

  const { name, countdown, target } = useMemo(() => {
    if (!jadwal || jadwal.length === 0) return { name: null, countdown: '--:--:--', target: null };

    const build = (prayer, diffMs) => {
      const totalSeconds = Math.max(0, Math.floor(diffMs / 1000));
      return {
        name: formatPrayerName(prayer.nama_sholat, now),
        countdown: `${pad(Math.floor(totalSeconds / 3600))}:${pad(Math.floor((totalSeconds % 3600) / 60))}:${pad(totalSeconds % 60)}`,
        target: prayer.waktu,
      };
    };

    for (const prayer of jadwal) {
      const [h, m] = prayer.waktu.split(':').map(Number);
      const t = now.clone().hours(h).minutes(m).seconds(0).milliseconds(0);
      if (t.isAfter(now)) return build(prayer, t.diff(now));
    }

    // Semua waktu hari ini sudah lewat — hitung mundur ke yang pertama besok.
    const first = jadwal[0];
    const [h, m] = first.waktu.split(':').map(Number);
    const t = now.clone().add(1, 'day').hours(h).minutes(m).seconds(0).milliseconds(0);
    return build(first, t.diff(now));
  }, [jadwal, now]);

  const label = name && SHOLAT.has(name) ? 'Menuju Sholat Berikutnya' : 'Menuju Waktu Berikutnya';

  return (
    <div className="next-prayer">
      <div className="next-prayer-label">{label}</div>
      <div className="next-prayer-name">
        {name || '—'}
        {target ? <span className="next-prayer-at"> · {target}</span> : null}
      </div>
      <div className="next-prayer-countdown">{countdown}</div>
    </div>
  );
};

export default NextPrayer;
