import React, { useState, useEffect } from 'react';
import moment from 'moment';
import 'moment/locale/id';
import { MosqueIcon } from './Icons';

const hijriMonths = [
  'Muharram', 'Shafar', 'Rabiul Awal', 'Rabiul Akhir',
  'Jumadil Awal', 'Jumadil Akhir', 'Rajab', 'Sya\'ban',
  'Ramadhan', 'Syawal', 'Dzulqa\'dah', 'Dzulhijjah'
];

const Header = ({ settings }) => {
  const [currentTime, setCurrentTime] = useState(moment());

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(moment()), 1000);
    return () => clearInterval(timer);
  }, []);

  const getHijriDate = () => {
    try {
      const date = currentTime.toDate();
      const parts = new Intl.DateTimeFormat('en-SA-u-ca-islamic-umalqura', {
        day: 'numeric',
        month: 'numeric',
        year: 'numeric'
      }).formatToParts(date);

      const day = parts.find(p => p.type === 'day')?.value;
      const monthNum = parseInt(parts.find(p => p.type === 'month')?.value || '1');
      const year = parts.find(p => p.type === 'year')?.value;
      const monthName = hijriMonths[monthNum - 1] || '';

      return `${day} ${monthName} ${year} H`;
    } catch {
      return '';
    }
  };

  return (
    <div className="header animate-in stagger-1">
      <div className="header-left">
        <div className="header-icon">
          <MosqueIcon size={22} />
        </div>
        <div className="masjid-name">{settings?.masjid_name || 'Masjid Al-Hikmah'}</div>
      </div>
      <div className="date-hijriah">{getHijriDate()}</div>
      <div className="date-time">
        <div className="time">{currentTime.format('HH:mm:ss')}</div>
        <div className="date">{currentTime.format('dddd, DD MMMM YYYY')}</div>
      </div>
    </div>
  );
};

export default Header;
