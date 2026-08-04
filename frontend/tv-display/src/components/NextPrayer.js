import React, { useState, useEffect, useMemo } from 'react';
import moment from 'moment';

const formatPrayerName = (nama) => (moment().day() === 5 && nama === 'Dzuhur' ? "Jum'at" : nama);
const pad = (n) => String(n).padStart(2, '0');

// Hero "next prayer" panel: the single most prominent element on the TV.
const NextPrayer = ({ jadwal }) => {
  const [now, setNow] = useState(moment());

  useEffect(() => {
    const t = setInterval(() => setNow(moment()), 1000);
    return () => clearInterval(t);
  }, []);

  const { name, countdown, target } = useMemo(() => {
    if (!jadwal || jadwal.length === 0) return { name: null, countdown: '--:--:--', target: null };
    const clock = now.clone();

    for (const prayer of jadwal) {
      const [h, m] = prayer.waktu.split(':');
      const t = clock.clone().hours(parseInt(h)).minutes(parseInt(m)).seconds(0);
      if (t.isAfter(clock)) {
        const d = moment.duration(t.diff(clock));
        return {
          name: formatPrayerName(prayer.nama_sholat),
          countdown: `${pad(Math.floor(d.asHours()))}:${pad(d.minutes())}:${pad(d.seconds())}`,
          target: prayer.waktu,
        };
      }
    }

    // After the last prayer — count down to the first prayer tomorrow
    const first = jadwal[0];
    const [h, m] = first.waktu.split(':');
    const t = clock.clone().add(1, 'day').hours(parseInt(h)).minutes(parseInt(m)).seconds(0);
    const d = moment.duration(t.diff(clock));
    return {
      name: formatPrayerName(first.nama_sholat),
      countdown: `${pad(Math.floor(d.asHours()))}:${pad(d.minutes())}:${pad(d.seconds())}`,
      target: first.waktu,
    };
  }, [jadwal, now]);

  return (
    <div className="next-prayer">
      <div className="next-prayer-label">Menuju Sholat Berikutnya</div>
      <div className="next-prayer-name">{name || '—'}{target ? <span className="next-prayer-at"> · {target}</span> : null}</div>
      <div className="next-prayer-countdown">{countdown}</div>
    </div>
  );
};

export default NextPrayer;
