import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import Header from './components/Header';
import PrayerSchedule from './components/PrayerSchedule';
import NextPrayer from './components/NextPrayer';
import SecondaryRotator from './components/SecondaryRotator';
import RunningText from './components/RunningText';
import { MosqueIcon } from './components/Icons';
import PrayerPhaseOverlay from './components/PrayerPhaseOverlay';
import PhaseErrorBoundary from './components/PhaseErrorBoundary';
import usePrayerPhase from './hooks/usePrayerPhase';
import { useClock } from './hooks/useClock';
import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5001/api';

const POLL_MS = 30000;
// Data dianggap basi setelah lima kali gagal berturut-turut. Di bawah itu,
// gangguan jaringan sesaat tidak perlu memunculkan peringatan di layar umum.
const STALE_AFTER_MS = 5 * POLL_MS;

const formatAge = (ms) => {
  const minutes = Math.floor(ms / 60000);
  if (minutes < 60) return `${minutes} menit`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours} jam`;
  return `${Math.floor(hours / 24)} hari`;
};

function App() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [lastSuccessAt, setLastSuccessAt] = useState(null);
  const [failedBeforeFirstLoad, setFailedBeforeFirstLoad] = useState(false);
  const clock = useClock();
  const mounted = useRef(true);
  // Ref, bukan state: dibaca dari dalam closure interval yang hanya dipasang
  // sekali, jadi membacanya dari state akan selalu mendapat nilai saat mount.
  const hasLoadedRef = useRef(false);

  const fetchData = useCallback(async () => {
    try {
      const res = await axios.get(`${API_URL}/dashboard`, { timeout: 15000 });
      if (!mounted.current) return;
      hasLoadedRef.current = true;
      setData(res.data);
      setLastSuccessAt(Date.now());
      setFailedBeforeFirstLoad(false);
    } catch (err) {
      // Data lama sengaja dipertahankan: jadwal kemarin masih lebih berguna
      // daripada layar kosong. Yang berubah hanya umurnya, dan itu ditampilkan.
      console.error('Gagal memuat data dashboard:', err);
      if (mounted.current && !hasLoadedRef.current) setFailedBeforeFirstLoad(true);
    } finally {
      if (mounted.current) setLoading(false);
    }
  }, []);

  useEffect(() => {
    mounted.current = true;
    return () => {
      mounted.current = false;
    };
  }, []);

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, POLL_MS);
    return () => clearInterval(interval);
  }, [fetchData]);

  const phaseState = usePrayerPhase(data?.jadwal_sholat, data?.settings);

  // Umur data, dihitung ulang tiap detak tapi hanya berubah setiap menit.
  const dataAge = useMemo(() => {
    if (!lastSuccessAt) return null;
    const age = clock.valueOf() - lastSuccessAt;
    if (age < STALE_AFTER_MS) return null;
    return { stale: true, label: `Data terakhir ${formatAge(age)} lalu` };
  }, [lastSuccessAt, clock]);

  if (loading) {
    return (
      <div className="loading-screen">
        <div className="loading-icon"><MosqueIcon size={80} /></div>
        <div className="skeleton-header" />
        <div className="skeleton-body">
          <div className="skeleton-card skeleton-card-left">
            <div className="skeleton-title" />
            {[...Array(6)].map((_, i) => (
              <div key={i} className="skeleton-row" style={{ animationDelay: `${i * 80}ms` }} />
            ))}
          </div>
          <div className="skeleton-right">
            <div className="skeleton-card" style={{ flex: 2, animationDelay: '100ms' }} />
            <div className="skeleton-card" style={{ flex: 1, animationDelay: '200ms' }} />
          </div>
        </div>
        <div className="skeleton-footer" />
      </div>
    );
  }

  // Belum pernah ada data sama sekali. Merender kerangka kosong di sini akan
  // menampilkan layar yang tampak normal tapi tanpa satu pun jadwal — mode
  // gagal terburuk untuk papan informasi yang tidak ditunggui.
  if (!data && failedBeforeFirstLoad) {
    return (
      <div className="tv-fallback" role="alert">
        <MosqueIcon size={80} />
        <div className="tv-fallback-title">Tidak dapat terhubung ke server</div>
        <div className="tv-fallback-text">
          Jadwal sholat belum bisa dimuat. Periksa koneksi internet masjid — layar akan mencoba
          lagi otomatis setiap 30 detik.
        </div>
        <div className="tv-fallback-hint">{clock.format('HH:mm:ss')}</div>
      </div>
    );
  }

  return (
    <div className="tv-display">
      <Header settings={data?.settings} dataAge={dataAge} />
      <div className="tv-main">
        <PrayerSchedule jadwal={data?.jadwal_sholat} />
        <div className="tv-right">
          <NextPrayer jadwal={data?.jadwal_sholat} />
          <SecondaryRotator
            kajian={data?.kajian_terdekat}
            agenda={data?.agenda_terdekat}
            keuangan={data?.keuangan}
          />
        </div>
      </div>
      <RunningText texts={data?.running_text} />
      <PhaseErrorBoundary phase={phaseState.phase}>
        <PrayerPhaseOverlay {...phaseState} />
      </PhaseErrorBoundary>
    </div>
  );
}

export default App;
