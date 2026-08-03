import React, { useState, useEffect, useMemo } from 'react';
import moment from 'moment';
import { PrayerIcon } from './Icons';

const formatPrayerName = (nama) => {
  if (moment().day() === 5 && nama === 'Dzuhur') return 'Jum\'at';
  return nama;
};

const PrayerSchedule = ({ jadwal }) => {
  const [currentTime, setCurrentTime] = useState(moment());

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(moment()), 1000);
    return () => clearInterval(timer);
  }, []);

  const { nextPrayer, countdown } = useMemo(() => {
    if (!jadwal || jadwal.length === 0) return { nextPrayer: null, countdown: '' };

    const now = currentTime.clone();
    const pad = (n) => String(n).padStart(2, '0');

    // Find next prayer today
    for (const prayer of jadwal) {
      const [hours, minutes] = prayer.waktu.split(':');
      const prayerTime = now.clone().hours(parseInt(hours)).minutes(parseInt(minutes)).seconds(0);
      if (prayerTime.isAfter(now)) {
        const duration = moment.duration(prayerTime.diff(now));
        return {
          nextPrayer: formatPrayerName(prayer.nama_sholat),
          countdown: `${pad(Math.floor(duration.asHours()))}:${pad(duration.minutes())}:${pad(duration.seconds())}`
        };
      }
    }

    // After Isya — countdown to first prayer tomorrow
    const tomorrowFirstPrayer = jadwal[0];
    const [h, m] = tomorrowFirstPrayer.waktu.split(':');
    const tomorrow = now.clone().add(1, 'day').hours(parseInt(h)).minutes(parseInt(m)).seconds(0);
    const duration = moment.duration(tomorrow.diff(now));
    return {
      nextPrayer: formatPrayerName(tomorrowFirstPrayer.nama_sholat),
      countdown: `${pad(Math.floor(duration.asHours()))}:${pad(duration.minutes())}:${pad(duration.seconds())}`
    };
  }, [jadwal, currentTime]);

  const isActive = (waktu) => {
    if (!jadwal) return false;
    const [hours, minutes] = waktu.split(':');
    const now = currentTime;
    const prayerTime = moment().hours(parseInt(hours)).minutes(parseInt(minutes));
    const diff = now.diff(prayerTime, 'minutes');
    return diff >= 0 && diff < 60;
  };

  return (
    <div className="card prayer-schedule animate-in stagger-2">
      <div className="card-title">
        <PrayerIcon size={18} />
        Jadwal Sholat
      </div>
      <div className="prayer-list">
        {jadwal?.map((item, index) => (
          <div
            key={item.id}
            className={`prayer-item ${isActive(item.waktu) ? 'active' : ''}`}
            style={{ animationDelay: `${index * 50}ms` }}
          >
            <span className="name">{formatPrayerName(item.nama_sholat)}</span>
            <span className="time">{item.waktu}</span>
          </div>
        ))}
      </div>
      <div className="countdown-section">
        <div className="countdown-label">Sholat berikutnya</div>
        <div className="countdown-time">{countdown}</div>
        <div className="countdown-prayer-name">{nextPrayer}</div>
      </div>
    </div>
  );
};

export default PrayerSchedule;
