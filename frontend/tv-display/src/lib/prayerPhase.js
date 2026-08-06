// Logika fase sholat untuk TV display. Murni: tanpa React dan tanpa jam sendiri —
// setiap fungsi menerima `now` sehingga seluruh modul dapat diuji.

const PRAYER_KEYS = ['subuh', 'dzuhur', 'ashar', 'maghrib', 'isya'];

// Nama sholat diketik manual oleh takmir, jadi variasi ejaan yang lazim diterima.
const PRAYER_ALIASES = {
  subuh: 'subuh',
  shubuh: 'subuh',
  dzuhur: 'dzuhur',
  zuhur: 'dzuhur',
  dhuhur: 'dzuhur',
  ashar: 'ashar',
  asar: 'ashar',
  maghrib: 'maghrib',
  magrib: 'maghrib',
  isya: 'isya',
  isha: 'isya',
};

const DEFAULT_IKAMAH = { subuh: 15, dzuhur: 10, ashar: 10, maghrib: 5, isya: 10 };
const DEFAULT_SHOLAT = { subuh: 15, dzuhur: 15, ashar: 15, maghrib: 15, isya: 15 };

const AZAN_SECONDS = 120;
const MAX_MINUTES = 120;
const FRIDAY = 5;

export const prayerKey = (nama) => {
  if (typeof nama !== 'string') return null;
  return PRAYER_ALIASES[nama.trim().toLowerCase()] || null;
};

// Nilai settings selalu TEXT, dan takmir bisa mengetik apa saja.
const toMinutes = (raw, fallback) => {
  if (raw === undefined || raw === null || raw === '') return fallback;
  const n = Number(raw);
  if (!Number.isFinite(n) || n < 0 || n > MAX_MINUTES) return fallback;
  return Math.floor(n);
};

export const parseConfig = (settings) => {
  const s = settings || {};
  const config = {
    // Key yang belum ada berarti deployment lama yang belum menyimpan pengaturan:
    // fitur dianggap aktif dengan durasi default.
    enabled: s.iqomah_enabled === undefined ? true : s.iqomah_enabled === 'true' || s.iqomah_enabled === true,
    ikamah: {},
    sholat: {},
  };
  PRAYER_KEYS.forEach((key) => {
    config.ikamah[key] = toMinutes(s[`ikamah_${key}`], DEFAULT_IKAMAH[key]);
    config.sholat[key] = toMinutes(s[`sholat_${key}`], DEFAULT_SHOLAT[key]);
  });
  return config;
};

// Detik sejak tengah malam untuk string "HH:MM"; null bila tidak terbaca.
const parseWaktu = (waktu) => {
  if (typeof waktu !== 'string') return null;
  const match = waktu.trim().match(/^(\d{1,2}):(\d{2})/);
  if (!match) return null;
  const hours = Number(match[1]);
  const minutes = Number(match[2]);
  if (hours > 23 || minutes > 59) return null;
  return hours * 3600 + minutes * 60;
};

// Sholat fardhu terakhir yang waktunya sudah lewat hari ini. Mencari mundur
// seperti ini membuat sholat terbaru otomatis menang bila durasi yang
// dikonfigurasi kepanjangan sampai menabrak waktu sholat berikutnya.
const findCurrentPrayer = (nowSeconds, jadwal) => {
  if (!Array.isArray(jadwal)) return null;
  let best = null;
  for (const item of jadwal) {
    const key = prayerKey(item && item.nama_sholat);
    if (!key) continue;
    const at = parseWaktu(item && item.waktu);
    if (at === null || at > nowSeconds) continue;
    if (!best || at > best.at) best = { key, at, nama: item.nama_sholat, waktu: item.waktu };
  }
  return best;
};

export const computePhase = (now, jadwal, config) => {
  const normal = { phase: 'normal' };
  if (!config || !config.enabled) return normal;

  const nowSeconds = now.hours() * 3600 + now.minutes() * 60 + now.seconds();
  const current = findCurrentPrayer(nowSeconds, jadwal);
  if (!current) return normal;

  // Sholat Jum'at diisi khutbah, jadi seluruh urutan dilewati.
  if (now.day() === FRIDAY && current.key === 'dzuhur') return normal;

  const elapsed = nowSeconds - current.at;
  const ikamah = config.ikamah[current.key] * 60;
  const sholat = config.sholat[current.key] * 60;
  const prayer = { key: current.key, nama: current.nama, waktu: current.waktu };

  // Fase azan berada di dalam durasi ikamah, dan dipangkas agar konfigurasi
  // ekstrem seperti ikamah 1 menit tidak membuat azan lebih panjang darinya.
  if (elapsed < Math.min(AZAN_SECONDS, ikamah)) return { phase: 'azan', prayer };
  if (elapsed < ikamah) return { phase: 'ikamah', prayer, sisa: ikamah - elapsed, total: ikamah };
  if (elapsed < ikamah + sholat) return { phase: 'blank', prayer };
  return normal;
};
