import React, { useMemo } from 'react';
import { PrayerIcon } from './Icons';
import { useClock } from '../hooks/useClock';

const formatPrayerName = (nama, clock) =>
  (clock.day() === 5 && nama === 'Dzuhur' ? "Jum'at" : nama);

const PrayerSchedule = ({ jadwal }) => {
  const currentTime = useClock();

  // Indeks sholat berikutnya hanya berubah delapan kali sehari, bukan tiap
  // detik. Dependency-nya menit berjalan, bukan objek waktu penuh, supaya
  // memo ini tidak dihitung ulang 86.400 kali sehari.
  const minuteKey = currentTime.format('YYYY-MM-DD HH:mm');
  const nextIndex = useMemo(() => {
    if (!jadwal || jadwal.length === 0) return -1;
    const [hh, mm] = minuteKey.slice(11).split(':').map(Number);
    const nowMinutes = hh * 60 + mm;
    for (let i = 0; i < jadwal.length; i++) {
      const [h, m] = jadwal[i].waktu.split(':').map(Number);
      if (h * 60 + m > nowMinutes) return i;
    }
    return 0;
  }, [jadwal, minuteKey]);

  return (
    <div className="card prayer-schedule animate-in stagger-2">
      <div className="card-title">
        <PrayerIcon size={22} />
        Jadwal Sholat Hari Ini
      </div>
      <div className="prayer-list">
        {jadwal?.map((item, index) => (
          <div key={item.id} className={`prayer-item ${index === nextIndex ? 'next' : ''}`}>
            <span className="name">{formatPrayerName(item.nama_sholat, currentTime)}</span>
            <span className="time">{item.waktu}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default PrayerSchedule;
