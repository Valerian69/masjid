import React, { useMemo } from 'react';
import 'moment/locale/id';
import { MosqueIcon } from './Icons';
import { useClock } from '../hooks/useClock';

const hijriMonths = [
  'Muharram', 'Shafar', 'Rabiul Awal', 'Rabiul Akhir',
  'Jumadil Awal', 'Jumadil Akhir', 'Rajab', 'Sya\'ban',
  'Ramadhan', 'Syawal', 'Dzulqa\'dah', 'Dzulhijjah'
];

// Dibangun sekali, bukan tiap render. Intl.DateTimeFormat termasuk objek Intl
// yang paling mahal untuk dikonstruksi, dan sebelumnya dibuat ulang setiap
// detik untuk string yang berubah sekali sehari.
const hijriFormatter = (() => {
  try {
    return new Intl.DateTimeFormat('en-SA-u-ca-islamic-umalqura', {
      day: 'numeric',
      month: 'numeric',
      year: 'numeric'
    });
  } catch {
    return null;
  }
})();

const formatHijri = (date) => {
  if (!hijriFormatter) return '';
  try {
    const parts = hijriFormatter.formatToParts(date);
    const day = parts.find((p) => p.type === 'day')?.value;
    const monthNum = parseInt(parts.find((p) => p.type === 'month')?.value || '1', 10);
    const year = parts.find((p) => p.type === 'year')?.value;
    const monthName = hijriMonths[monthNum - 1] || '';
    return `${day} ${monthName} ${year} H`;
  } catch {
    return '';
  }
};

const Header = ({ settings, dataAge }) => {
  const currentTime = useClock();
  const dayKey = currentTime.format('YYYY-MM-DD');

  // Hanya dihitung ulang saat tanggal berganti.
  const hijriDate = useMemo(() => formatHijri(new Date(`${dayKey}T12:00:00`)), [dayKey]);

  return (
    <div className="header animate-in stagger-1">
      <div className="header-left">
        <div className="header-icon">
          <MosqueIcon size={22} />
        </div>
        {/* Tanpa nama cadangan yang mengarang: menampilkan nama masjid lain
            selama data belum termuat lebih buruk daripada tidak menampilkan
            apa pun. */}
        <div className="masjid-name">{settings?.masjid_name || ''}</div>
      </div>
      <div className="date-hijriah">{hijriDate}</div>
      <div className="date-time">
        <div className="time">{currentTime.format('HH:mm:ss')}</div>
        <div className="date">{currentTime.format('dddd, DD MMMM YYYY')}</div>
        {dataAge ? (
          <div className={`data-age ${dataAge.stale ? 'is-stale' : ''}`}>{dataAge.label}</div>
        ) : null}
      </div>
    </div>
  );
};

export default Header;
