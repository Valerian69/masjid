import { useMemo } from 'react';
import { computePhase, parseConfig } from '../lib/prayerPhase';
import { useClock } from './useClock';

// Fasenya diturunkan ulang tiap detak, jadi refresh atau reboot browser
// memulihkan tampilan di posisi yang sama tanpa kode recovery. Detaknya
// sendiri kini datang dari ClockProvider, satu timer untuk seluruh layar.
const usePrayerPhase = (jadwal, settings) => {
  const now = useClock();
  const config = useMemo(() => parseConfig(settings), [settings]);

  return useMemo(() => computePhase(now, jadwal, config), [now, jadwal, config]);
};

export default usePrayerPhase;
