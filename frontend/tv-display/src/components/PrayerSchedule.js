import React, { useState, useEffect, useMemo } from 'react';
import moment from 'moment';
import { PrayerIcon } from './Icons';

const formatPrayerName = (nama) => (moment().day() === 5 && nama === 'Dzuhur' ? "Jum'at" : nama);

const PrayerSchedule = ({ jadwal }) => {
  const [currentTime, setCurrentTime] = useState(moment());

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(moment()), 1000);
    return () => clearInterval(timer);
  }, []);

  // Index of the next upcoming prayer (or first-of-tomorrow when all have passed)
  const nextIndex = useMemo(() => {
    if (!jadwal || jadwal.length === 0) return -1;
    const now = currentTime.clone();
    for (let i = 0; i < jadwal.length; i++) {
      const [h, m] = jadwal[i].waktu.split(':');
      const t = now.clone().hours(parseInt(h)).minutes(parseInt(m)).seconds(0);
      if (t.isAfter(now)) return i;
    }
    return 0;
  }, [jadwal, currentTime]);

  return (
    <div className="card prayer-schedule animate-in stagger-2">
      <div className="card-title">
        <PrayerIcon size={22} />
        Jadwal Sholat Hari Ini
      </div>
      <div className="prayer-list">
        {jadwal?.map((item, index) => (
          <div key={item.id} className={`prayer-item ${index === nextIndex ? 'next' : ''}`}>
            <span className="name">{formatPrayerName(item.nama_sholat)}</span>
            <span className="time">{item.waktu}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default PrayerSchedule;
