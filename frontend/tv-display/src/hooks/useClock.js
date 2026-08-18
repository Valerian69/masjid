import React, { createContext, useContext, useEffect, useState } from 'react';
import moment from 'moment';

const ClockContext = createContext(null);

// Satu detak untuk seluruh layar.
//
// Sebelumnya Header, PrayerSchedule, NextPrayer, dan usePrayerPhase
// masing-masing memegang setInterval 1 detik sendiri. Empat timer independen
// berarti empat render tiap detik yang tidak pernah sinkron — dan proses ini
// tidak pernah restart, jadi biayanya berjalan terus selama TV menyala.
// Satu provider membuat keempatnya bergerak pada detak yang sama.
export const ClockProvider = ({ children }) => {
  const [now, setNow] = useState(() => moment());

  useEffect(() => {
    // Disinkronkan ke batas detik supaya jam tidak "melompat" dua kali dalam
    // satu detik dinding ketika interval mulai di tengah detik.
    let interval;
    const align = setTimeout(() => {
      setNow(moment());
      interval = setInterval(() => setNow(moment()), 1000);
    }, 1000 - (Date.now() % 1000));

    return () => {
      clearTimeout(align);
      if (interval) clearInterval(interval);
    };
  }, []);

  return <ClockContext.Provider value={now}>{children}</ClockContext.Provider>;
};

// Mengembalikan moment yang sama untuk setiap pemanggil dalam satu detak.
// Bila dipakai di luar provider, jatuh kembali ke timer lokal supaya komponen
// tetap bisa dipakai sendiri (mis. di test).
export const useClock = () => {
  const ctx = useContext(ClockContext);
  const [local, setLocal] = useState(() => moment());
  const hasProvider = ctx != null;

  useEffect(() => {
    if (hasProvider) return undefined;
    const t = setInterval(() => setLocal(moment()), 1000);
    return () => clearInterval(t);
  }, [hasProvider]);

  return hasProvider ? ctx : local;
};

// Kunci tanggal kalender: berubah sekali sehari, bukan tiap detik. Dipakai
// sebagai dependency untuk nilai mahal seperti tanggal Hijriah, yang
// sebelumnya dihitung ulang 86.400 kali sehari untuk string yang berubah
// satu kali.
export const useCalendarDay = () => useClock().format('YYYY-MM-DD');

export default useClock;
