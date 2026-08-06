import { useState, useEffect, useMemo } from 'react';
import moment from 'moment';
import { computePhase, parseConfig } from '../lib/prayerPhase';

// Satu-satunya bagian fitur ini yang menyentuh jam. Fasenya diturunkan ulang
// tiap detik, jadi refresh atau reboot browser memulihkan tampilan di posisi
// yang sama tanpa kode recovery.
const usePrayerPhase = (jadwal, settings) => {
  const [now, setNow] = useState(() => moment());

  useEffect(() => {
    const timer = setInterval(() => setNow(moment()), 1000);
    return () => clearInterval(timer);
  }, []);

  const config = useMemo(() => parseConfig(settings), [settings]);

  return useMemo(() => computePhase(now, jadwal, config), [now, jadwal, config]);
};

export default usePrayerPhase;
