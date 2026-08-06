# Jeda Ikamah & Layar Sholat Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Menambahkan tiga fase tampilan otomatis pada TV display masjid — notifikasi azan, hitung mundur ikamah, dan layar gelap selama sholat berjamaah — dengan durasi yang dapat diatur per sholat dari panel admin.

**Architecture:** Fase diturunkan dari jam melalui fungsi murni `computePhase(now, jadwal, config)` yang dipanggil setiap detik, bukan lewat rantai `setTimeout`. Dengan begitu tampilan pulih sendiri setelah reboot atau refresh browser tanpa kode recovery, dan seluruh logikanya dapat diuji dengan menyuntikkan `now` palsu. Konfigurasi disimpan sebagai 11 key datar di tabel `settings` yang sudah ikut terkirim lewat `GET /api/dashboard`, sehingga tidak ada perubahan backend sama sekali.

**Tech Stack:** React 18 (Create React App), Moment.js, CSS murni di `global.css`, Jest via `react-scripts test`.

**Spec:** `docs/superpowers/specs/2026-08-06-jeda-ikamah-design.md`

## Global Constraints

- Tidak ada perubahan pada `backend/` maupun `api/`. `PUT /api/settings` sudah melakukan upsert untuk key baru (`backend/routes/settings.js:33-39`) dan `GET /api/dashboard` sudah mengirim seluruh isi tabel `settings` (`backend/routes/dashboard.js:28-30`).
- Hanya lima sholat fardhu yang memicu fase: Subuh, Dzuhur, Ashar, Maghrib, Isya. Imsak, Terbit, dan Dhuha diabaikan.
- Sholat Jum'at (Dzuhur di hari Jumat) selalu menghasilkan fase `normal`. Sholat lain di hari Jumat tetap berjalan.
- Fase azan berlangsung `min(120 detik, durasi ikamah)` dan berada **di dalam** durasi ikamah, bukan menambahnya.
- Kegagalan apa pun harus jatuh ke fase `normal`. Tidak boleh ada jalur kode yang menggelapkan layar karena error.
- Seluruh nilai `settings` bertipe TEXT. Default: `iqomah_enabled=true`; `ikamah_subuh/dzuhur/ashar/maghrib/isya = 15/10/10/5/10`; `sholat_* = 15` untuk kelimanya. Nilai di luar bilangan bulat 0–120 jatuh ke default. Nilai `0` berarti fase dilewati.
- Warna dan token desain memakai variabel yang sudah ada di `frontend/tv-display/src/styles/global.css:7-27` (`--bg-deep`, `--amber`, `--amber-glow`, `--text-primary`, `--text-secondary`, `--border`, `--radius`, `--ease-out`).
- Ikon memakai gaya Phosphor yang sudah ada: `strokeWidth="1.5"`, `strokeLinecap="round"`, `strokeLinejoin="round"`, tanpa emoji.
- Ukuran teks pada overlay memakai satuan `vw` agar proporsional di TV 32" maupun 55".
- Setelah semua kode selesai, `npm run build:vercel` wajib dijalankan dan hasil di `tv/` serta `admin/` ikut di-commit.

## File Structure

| Berkas | Tanggung jawab | Task |
|---|---|---|
| `frontend/tv-display/src/lib/prayerPhase.js` *(baru)* | Logika murni: `parseConfig`, `computePhase`, `prayerKey`. Tanpa React, tanpa jam sendiri. | 1 |
| `frontend/tv-display/src/lib/prayerPhase.test.js` *(baru)* | Unit test dengan `now` yang disuntik. | 1 |
| `frontend/tv-display/src/components/Icons.js` | Tambah `PhoneOffIcon`. | 2 |
| `frontend/tv-display/src/components/PrayerPhaseOverlay.js` *(baru)* | Render ketiga fase. Murni presentasional, tanpa timer dan tanpa fetch. | 2 |
| `frontend/tv-display/src/styles/global.css` | Gaya overlay, ditambahkan di akhir berkas. | 2 |
| `frontend/tv-display/src/hooks/usePrayerPhase.js` *(baru)* | Tick 1 detik, memoisasi, menjembatani logika murni ke React. | 3 |
| `frontend/tv-display/src/components/PhaseErrorBoundary.js` *(baru)* | Error boundary pelindung overlay. | 3 |
| `frontend/tv-display/src/App.js` | Pasang hook dan render overlay. | 3 |
| `frontend/admin-panel/src/pages/Settings.js` | Kartu "Jeda Ikamah" dan perbaikan merge state. | 4 |
| `supabase/seed.sql` | 11 key default untuk deployment baru. | 5 |
| `CLAUDE.md` | Dokumentasi key settings dan fitur. | 5 |

## Catatan penyimpangan dari spec

Dua hal berbeda dari mockup di spec, keduanya untuk mengikuti pola yang sudah ada di kode:

1. **Saklar global memakai `<select>` Aktif/Nonaktif, bukan checkbox.** Panel admin tidak punya satu pun checkbox maupun gaya CSS untuk checkbox; semua boolean memakai `<select>` (lihat `frontend/admin-panel/src/pages/Agenda.js:126` dan `frontend/admin-panel/src/pages/RunningText.js:115`). Fungsinya identik.
2. **`loadSettings` di `Settings.js` harus di-merge, bukan menimpa.** Baris `setSettings(res.data)` yang ada sekarang (`frontend/admin-panel/src/pages/Settings.js:44`) membuang seluruh nilai default untuk key yang belum ada di database, sehingga input durasi akan tampil kosong pada deployment lama. Ini diperbaiki di Task 4.

---

### Task 1: Logika fase murni

**Files:**
- Create: `frontend/tv-display/src/lib/prayerPhase.js`
- Test: `frontend/tv-display/src/lib/prayerPhase.test.js`

**Interfaces:**
- Consumes: tidak ada (task pertama).
- Produces:
  - `prayerKey(nama: string) => 'subuh'|'dzuhur'|'ashar'|'maghrib'|'isya'|null`
  - `parseConfig(settings: object|null|undefined) => { enabled: boolean, ikamah: Record<key, number>, sholat: Record<key, number> }` (menit)
  - `computePhase(now: Moment, jadwal: Array|null|undefined, config: object) => { phase: 'normal' } | { phase: 'azan', prayer } | { phase: 'ikamah', prayer, sisa: number, total: number } | { phase: 'blank', prayer }`, dengan `prayer = { key, nama, waktu }` dan `sisa`/`total` dalam detik.

- [ ] **Step 1: Tulis test yang gagal**

Buat `frontend/tv-display/src/lib/prayerPhase.test.js`:

```js
import moment from 'moment';
import { computePhase, parseConfig, prayerKey } from './prayerPhase';

// 2026-08-06 adalah hari Kamis; 2026-08-07 adalah hari Jumat.
const at = (waktu, tanggal = '2026-08-06') => moment(`${tanggal} ${waktu}`, 'YYYY-MM-DD HH:mm:ss');

const JADWAL = [
  { id: '1', nama_sholat: 'Imsak', waktu: '04:35' },
  { id: '2', nama_sholat: 'Subuh', waktu: '04:45' },
  { id: '3', nama_sholat: 'Terbit', waktu: '06:00' },
  { id: '4', nama_sholat: 'Dhuha', waktu: '06:29' },
  { id: '5', nama_sholat: 'Dzuhur', waktu: '12:02' },
  { id: '6', nama_sholat: 'Ashar', waktu: '15:23' },
  { id: '7', nama_sholat: 'Maghrib', waktu: '17:57' },
  { id: '8', nama_sholat: 'Isya', waktu: '19:09' },
];

const CONFIG = parseConfig({});

describe('prayerKey', () => {
  it('mengenali nama sholat fardhu beserta variasi ejaannya', () => {
    expect(prayerKey('Subuh')).toBe('subuh');
    expect(prayerKey('shubuh')).toBe('subuh');
    expect(prayerKey(' Zuhur ')).toBe('dzuhur');
    expect(prayerKey('Dhuhur')).toBe('dzuhur');
    expect(prayerKey('Asar')).toBe('ashar');
    expect(prayerKey('Magrib')).toBe('maghrib');
    expect(prayerKey('Isha')).toBe('isya');
  });

  it('menolak entri yang bukan sholat fardhu', () => {
    expect(prayerKey('Imsak')).toBeNull();
    expect(prayerKey('Terbit')).toBeNull();
    expect(prayerKey('Dhuha')).toBeNull();
    expect(prayerKey(undefined)).toBeNull();
    expect(prayerKey(42)).toBeNull();
  });
});

describe('parseConfig', () => {
  it('memakai default ketika settings kosong', () => {
    const c = parseConfig({});
    expect(c.enabled).toBe(true);
    expect(c.ikamah).toEqual({ subuh: 15, dzuhur: 10, ashar: 10, maghrib: 5, isya: 10 });
    expect(c.sholat).toEqual({ subuh: 15, dzuhur: 15, ashar: 15, maghrib: 15, isya: 15 });
  });

  it('memakai default ketika settings null atau undefined', () => {
    expect(parseConfig(null).enabled).toBe(true);
    expect(parseConfig(undefined).ikamah.subuh).toBe(15);
  });

  it('membaca nilai string dari database', () => {
    const c = parseConfig({ ikamah_subuh: '20', sholat_isya: '8' });
    expect(c.ikamah.subuh).toBe(20);
    expect(c.sholat.isya).toBe(8);
  });

  it('menerima nol sebagai nilai sah', () => {
    expect(parseConfig({ ikamah_maghrib: '0' }).ikamah.maghrib).toBe(0);
    expect(parseConfig({ sholat_maghrib: '0' }).sholat.maghrib).toBe(0);
  });

  it('jatuh ke default untuk nilai kosong, bukan angka, negatif, atau lebih dari 120', () => {
    expect(parseConfig({ ikamah_subuh: '' }).ikamah.subuh).toBe(15);
    expect(parseConfig({ ikamah_subuh: 'abc' }).ikamah.subuh).toBe(15);
    expect(parseConfig({ ikamah_subuh: '-3' }).ikamah.subuh).toBe(15);
    expect(parseConfig({ ikamah_subuh: '121' }).ikamah.subuh).toBe(15);
  });

  it('menganggap fitur aktif ketika key iqomah_enabled belum ada', () => {
    expect(parseConfig({ masjid_name: 'X' }).enabled).toBe(true);
  });

  it('menganggap fitur nonaktif ketika iqomah_enabled bukan string "true"', () => {
    expect(parseConfig({ iqomah_enabled: 'false' }).enabled).toBe(false);
    expect(parseConfig({ iqomah_enabled: '0' }).enabled).toBe(false);
    expect(parseConfig({ iqomah_enabled: 'true' }).enabled).toBe(true);
  });
});

describe('computePhase — transisi fase Subuh (ikamah 15 menit, sholat 15 menit)', () => {
  it('normal sebelum waktu Subuh masuk', () => {
    expect(computePhase(at('04:44:59'), JADWAL, CONFIG).phase).toBe('normal');
  });

  it('azan tepat saat waktu masuk', () => {
    const r = computePhase(at('04:45:00'), JADWAL, CONFIG);
    expect(r.phase).toBe('azan');
    expect(r.prayer).toEqual({ key: 'subuh', nama: 'Subuh', waktu: '04:45' });
  });

  it('masih azan pada detik terakhir menit kedua', () => {
    expect(computePhase(at('04:46:59'), JADWAL, CONFIG).phase).toBe('azan');
  });

  it('masuk ikamah tepat pada menit kedua', () => {
    const r = computePhase(at('04:47:00'), JADWAL, CONFIG);
    expect(r.phase).toBe('ikamah');
    expect(r.sisa).toBe(13 * 60);
    expect(r.total).toBe(15 * 60);
  });

  it('sisa hitung mundur berkurang per detik', () => {
    expect(computePhase(at('04:59:59'), JADWAL, CONFIG).sisa).toBe(1);
  });

  it('masuk layar gelap tepat saat hitung mundur habis', () => {
    expect(computePhase(at('05:00:00'), JADWAL, CONFIG).phase).toBe('blank');
  });

  it('masih layar gelap pada detik terakhir', () => {
    expect(computePhase(at('05:14:59'), JADWAL, CONFIG).phase).toBe('blank');
  });

  it('kembali normal setelah durasi sholat habis', () => {
    expect(computePhase(at('05:15:00'), JADWAL, CONFIG).phase).toBe('normal');
  });
});

describe('computePhase — hari Jumat', () => {
  it('melewati sholat Jum-at sepenuhnya', () => {
    expect(computePhase(at('12:02:30', '2026-08-07'), JADWAL, CONFIG).phase).toBe('normal');
    expect(computePhase(at('12:08:00', '2026-08-07'), JADWAL, CONFIG).phase).toBe('normal');
    expect(computePhase(at('12:20:00', '2026-08-07'), JADWAL, CONFIG).phase).toBe('normal');
  });

  it('tetap menjalankan sholat lain di hari Jumat', () => {
    expect(computePhase(at('04:45:30', '2026-08-07'), JADWAL, CONFIG).phase).toBe('azan');
    expect(computePhase(at('15:24:00', '2026-08-07'), JADWAL, CONFIG).phase).toBe('azan');
    expect(computePhase(at('17:58:00', '2026-08-07'), JADWAL, CONFIG).phase).toBe('azan');
    expect(computePhase(at('19:10:00', '2026-08-07'), JADWAL, CONFIG).phase).toBe('azan');
  });

  it('menjalankan Dzuhur seperti biasa di hari selain Jumat', () => {
    expect(computePhase(at('12:02:30'), JADWAL, CONFIG).phase).toBe('azan');
  });
});

describe('computePhase — durasi nol', () => {
  it('melewati azan dan ikamah ketika ikamah nol', () => {
    const c = parseConfig({ ikamah_maghrib: '0' });
    expect(computePhase(at('17:57:00'), JADWAL, c).phase).toBe('blank');
    expect(computePhase(at('18:11:59'), JADWAL, c).phase).toBe('blank');
    expect(computePhase(at('18:12:00'), JADWAL, c).phase).toBe('normal');
  });

  it('melewati layar gelap ketika durasi sholat nol', () => {
    const c = parseConfig({ sholat_maghrib: '0' });
    expect(computePhase(at('18:01:59'), JADWAL, c).phase).toBe('ikamah');
    expect(computePhase(at('18:02:00'), JADWAL, c).phase).toBe('normal');
  });

  it('memangkas fase azan agar tidak melebihi durasi ikamah', () => {
    const c = parseConfig({ ikamah_maghrib: '1' });
    expect(computePhase(at('17:57:30'), JADWAL, c).phase).toBe('azan');
    expect(computePhase(at('17:58:00'), JADWAL, c).phase).toBe('blank');
  });
});

describe('computePhase — kasus tepi', () => {
  it('selalu normal ketika fitur dimatikan', () => {
    const c = parseConfig({ iqomah_enabled: 'false' });
    expect(computePhase(at('04:45:30'), JADWAL, c).phase).toBe('normal');
  });

  it('normal ketika jadwal kosong, null, atau bukan array', () => {
    expect(computePhase(at('04:45:30'), [], CONFIG).phase).toBe('normal');
    expect(computePhase(at('04:45:30'), null, CONFIG).phase).toBe('normal');
    expect(computePhase(at('04:45:30'), undefined, CONFIG).phase).toBe('normal');
  });

  it('normal ketika config tidak diberikan', () => {
    expect(computePhase(at('04:45:30'), JADWAL, null).phase).toBe('normal');
  });

  it('mengabaikan entri dengan format waktu rusak', () => {
    const rusak = [{ id: '1', nama_sholat: 'Subuh', waktu: 'pagi' }, { id: '2', nama_sholat: 'Dzuhur', waktu: null }];
    expect(computePhase(at('13:00:00'), rusak, CONFIG).phase).toBe('normal');
  });

  it('tidak pernah dipicu oleh Imsak, Terbit, atau Dhuha', () => {
    expect(computePhase(at('04:36:00'), JADWAL, CONFIG).phase).toBe('normal');
    expect(computePhase(at('06:01:00'), JADWAL, CONFIG).phase).toBe('normal');
    expect(computePhase(at('06:30:00'), JADWAL, CONFIG).phase).toBe('normal');
  });

  it('memenangkan sholat terbaru ketika durasi menabrak sholat berikutnya', () => {
    const c = parseConfig({ sholat_maghrib: '90' });
    expect(computePhase(at('19:08:00'), JADWAL, c).phase).toBe('blank');
    const r = computePhase(at('19:09:30'), JADWAL, c);
    expect(r.phase).toBe('azan');
    expect(r.prayer.key).toBe('isya');
  });
});
```

- [ ] **Step 2: Jalankan test untuk memastikan gagal**

```bash
cd frontend/tv-display && CI=true npx react-scripts test --watchAll=false src/lib/prayerPhase.test.js
```

Expected: FAIL — `Cannot find module './prayerPhase' from 'src/lib/prayerPhase.test.js'`

- [ ] **Step 3: Tulis implementasinya**

Buat `frontend/tv-display/src/lib/prayerPhase.js`:

```js
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
```

- [ ] **Step 4: Jalankan test untuk memastikan lulus**

```bash
cd frontend/tv-display && CI=true npx react-scripts test --watchAll=false src/lib/prayerPhase.test.js
```

Expected: PASS — seluruh test lulus (28 test dalam 6 blok `describe`).

- [ ] **Step 5: Commit**

```bash
git add frontend/tv-display/src/lib/prayerPhase.js frontend/tv-display/src/lib/prayerPhase.test.js
git commit -m "feat(tv): add pure prayer-phase logic for azan/iqomah/blank sequence"
```

---

### Task 2: Komponen overlay dan gayanya

**Files:**
- Create: `frontend/tv-display/src/components/PrayerPhaseOverlay.js`
- Modify: `frontend/tv-display/src/components/Icons.js` (tambah di akhir berkas, setelah `ClockIcon` di baris 256-261)
- Modify: `frontend/tv-display/src/styles/global.css` (tambah di akhir berkas)

**Interfaces:**
- Consumes: bentuk hasil `computePhase` dari Task 1, diterima sebagai props.
- Produces:
  - `PhoneOffIcon({ size })` — export bernama dari `Icons.js`.
  - `PrayerPhaseOverlay({ phase, prayer, sisa, total })` — export default. Mengembalikan `null` untuk `phase === 'normal'` atau `phase` lain yang tidak dikenal. Task 3 merender komponen ini.

- [ ] **Step 1: Tambahkan ikon ponsel**

Tambahkan di akhir `frontend/tv-display/src/components/Icons.js`, setelah `ClockIcon`:

```jsx

export const PhoneOffIcon = ({ size = 24, ...props }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" {...props}>
    <rect x="6" y="2" width="12" height="20" rx="2.5" />
    <path d="M10.5 18h3" />
    <path d="M3.5 3.5l17 17" />
  </svg>
);
```

- [ ] **Step 2: Tulis komponen overlay**

Buat `frontend/tv-display/src/components/PrayerPhaseOverlay.js`:

```jsx
import React from 'react';
import { PhoneOffIcon } from './Icons';

const pad = (n) => String(n).padStart(2, '0');

const formatCountdown = (sisa) => `${pad(Math.floor(sisa / 60))}:${pad(sisa % 60)}`;

// Murni presentasional: tidak punya timer, tidak melakukan fetch, dan tidak
// menyimpan state. Seluruh keputusan fase diambil oleh computePhase.
const PrayerPhaseOverlay = ({ phase, prayer, sisa, total }) => {
  if (phase === 'azan') {
    return (
      <div className="phase-overlay phase-azan">
        <div className="phase-kicker">Telah Masuk Waktu Sholat</div>
        <div className="phase-prayer-name">{prayer.nama}</div>
        <div className="phase-prayer-time">{prayer.waktu}</div>
      </div>
    );
  }

  if (phase === 'ikamah') {
    const progress = total > 0 ? (total - sisa) / total : 0;
    return (
      // Kecerahan turun perlahan sepanjang hitung mundur agar peralihan ke
      // layar gelap terasa mulus, bukan mendadak.
      <div className="phase-overlay phase-ikamah" style={{ opacity: 1 - progress * 0.25 }}>
        <div className="phase-ikamah-prayer">{prayer.nama}</div>
        <div className="phase-kicker">Menuju Ikamah</div>
        <div className={`phase-countdown ${sisa <= 60 ? 'urgent' : ''}`}>{formatCountdown(sisa)}</div>
        <div className="phase-notice">
          {/* Ukuran diatur lewat CSS, bukan prop `size`: satuan vw tidak
              didukung andal pada atribut width/height sebuah <svg>. */}
          <PhoneOffIcon />
          Mohon Nonaktifkan Ponsel
        </div>
        <div className="phase-progress">
          <div className="phase-progress-fill" style={{ width: `${progress * 100}%` }} />
        </div>
      </div>
    );
  }

  if (phase === 'blank') {
    return (
      <div className="phase-overlay phase-blank">
        <div className="phase-blank-text">Sedang Sholat Berjamaah</div>
      </div>
    );
  }

  return null;
};

export default PrayerPhaseOverlay;
```

- [ ] **Step 3: Tambahkan gaya overlay**

Tambahkan di akhir `frontend/tv-display/src/styles/global.css`:

```css

/* ── Fase sholat: azan / ikamah / layar gelap ─────────────────────── */

.phase-overlay {
  position: fixed;
  inset: 0;
  z-index: 100;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  text-align: center;
  animation: phaseFadeIn 0.8s var(--ease-out);
}

.phase-overlay > * {
  position: relative;
  z-index: 1;
}

@keyframes phaseFadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}

.phase-kicker {
  font-size: 2.2vw;
  font-weight: 500;
  letter-spacing: 0.35em;
  text-transform: uppercase;
  color: var(--amber);
}

/* Fase azan */
.phase-azan {
  background: var(--bg-deep);
}

.phase-azan::before {
  content: '';
  position: absolute;
  inset: 0;
  z-index: 0;
  background: radial-gradient(circle at 50% 45%, rgba(26, 158, 104, 0.22), transparent 62%);
  animation: phaseBreathe 4s ease-in-out infinite;
}

@keyframes phaseBreathe {
  0%, 100% { opacity: 0.6; transform: scale(1); }
  50% { opacity: 1; transform: scale(1.06); }
}

.phase-prayer-name {
  font-size: 11vw;
  font-weight: 700;
  line-height: 1;
  margin: 2vh 0;
  text-transform: uppercase;
  color: var(--text-primary);
}

.phase-prayer-time {
  font-size: 4vw;
  opacity: 0.55;
  font-variant-numeric: tabular-nums;
}

/* Fase ikamah */
.phase-ikamah {
  background: var(--bg-deep);
  transition: opacity 1s linear;
}

.phase-ikamah-prayer {
  font-size: 3vw;
  letter-spacing: 0.2em;
  text-transform: uppercase;
  opacity: 0.5;
}

.phase-countdown {
  /* Goresan tipis pada ukuran sebesar ini tetap terbaca dari jarak jauh,
     tapi memancarkan cahaya jauh lebih sedikit daripada angka tebal. */
  font-size: 26vw;
  font-weight: 300;
  line-height: 1;
  margin: 1vh 0 3vh;
  letter-spacing: 0.02em;
  font-variant-numeric: tabular-nums;
  color: var(--amber-glow);
  opacity: 0.9;
}

.phase-countdown.urgent {
  animation: phasePulse 1s ease-in-out infinite;
}

@keyframes phasePulse {
  0%, 100% { opacity: 0.9; }
  50% { opacity: 0.6; }
}

.phase-notice {
  display: flex;
  align-items: center;
  gap: 1.5vw;
  padding: 1.6vh 3vw;
  font-size: 3vw;
  letter-spacing: 0.1em;
  text-transform: uppercase;
  color: var(--text-secondary);
  border: 1px solid var(--border);
  border-radius: var(--radius);
}

.phase-notice svg {
  width: 3vw;
  height: 3vw;
  flex-shrink: 0;
}

.phase-progress {
  position: absolute;
  left: 0;
  right: 0;
  bottom: 0;
  height: 3px;
  background: rgba(255, 255, 255, 0.06);
}

.phase-progress-fill {
  height: 100%;
  background: var(--amber);
  transition: width 1s linear;
}

/* Fase layar gelap */
.phase-blank {
  background: #000;
}

.phase-blank-text {
  font-size: 2.4vw;
  font-weight: 300;
  letter-spacing: 0.4em;
  text-transform: uppercase;
  color: #fff;
  opacity: 0.1;
  /* Bergeser beberapa piksel tiap menit. Tidak terlihat mata, tapi mencegah
     burn-in pada panel yang menyala 24 jam. */
  animation: phaseDrift 300s steps(5, end) infinite;
}

@keyframes phaseDrift {
  0% { transform: translate(0, 0); }
  20% { transform: translate(7px, -5px); }
  40% { transform: translate(-6px, 6px); }
  60% { transform: translate(5px, 7px); }
  80% { transform: translate(-7px, -6px); }
  100% { transform: translate(0, 0); }
}
```

- [ ] **Step 4: Periksa ketiga fase secara visual**

Sisipkan sementara di `frontend/tv-display/src/App.js`, tepat sebelum `</div>` penutup `<div className="tv-display">` (saat ini baris 70), dan tambahkan importnya di bagian atas berkas:

```jsx
      <PrayerPhaseOverlay phase="ikamah" prayer={{ nama: 'Maghrib', waktu: '17:57' }} sisa={277} total={300} />
```

Jalankan `cd frontend/tv-display && npm start`, buka `http://localhost:3000`, lalu periksa satu per satu dengan mengganti props tersebut:

| Props | Yang harus terlihat |
|---|---|
| `phase="azan" prayer={{ nama: 'Maghrib', waktu: '17:57' }}` | Latar hijau gelap dengan glow yang bernapas, tulisan amber "TELAH MASUK WAKTU SHOLAT", nama sholat sangat besar, jam di bawahnya |
| `phase="ikamah" ... sisa={277} total={300}` | Angka `04:37` mendominasi layar, kotak "MOHON NONAKTIFKAN PONSEL" dengan ikon ponsel dicoret, garis progress tipis di tepi bawah |
| `phase="ikamah" ... sisa={45} total={300}` | Sama, tetapi angka berdenyut halus dan keseluruhan sedikit lebih redup |
| `phase="blank"` | Layar hitam dengan satu baris teks yang nyaris tidak terlihat |
| `phase="normal"` | Tidak ada overlay sama sekali |

Hapus kembali baris sementara tersebut beserta importnya setelah selesai. Task 3 yang memasangnya secara permanen.

- [ ] **Step 5: Commit**

```bash
git add frontend/tv-display/src/components/PrayerPhaseOverlay.js frontend/tv-display/src/components/Icons.js frontend/tv-display/src/styles/global.css
git commit -m "feat(tv): add prayer phase overlay component and styles"
```

Sebelum commit, pastikan `git diff --cached frontend/tv-display/src/App.js` kosong — baris pemeriksaan sementara di Step 4 tidak boleh ikut.

---

### Task 3: Hook, error boundary, dan pemasangan di App

**Files:**
- Create: `frontend/tv-display/src/hooks/usePrayerPhase.js`
- Create: `frontend/tv-display/src/components/PhaseErrorBoundary.js`
- Modify: `frontend/tv-display/src/App.js`

**Interfaces:**
- Consumes: `computePhase` dan `parseConfig` dari Task 1; `PrayerPhaseOverlay` dari Task 2.
- Produces: `usePrayerPhase(jadwal, settings)` — export default, mengembalikan objek hasil `computePhase` yang diperbarui tiap detik.

- [ ] **Step 1: Tulis hook**

Buat `frontend/tv-display/src/hooks/usePrayerPhase.js`:

```js
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
```

- [ ] **Step 2: Tulis error boundary**

Buat `frontend/tv-display/src/components/PhaseErrorBoundary.js`:

```jsx
import React from 'react';

// Tanpa ini, satu error saat merender overlay akan membuat React melepas
// seluruh root sehingga TV menampilkan layar putih kosong sampai ada yang
// me-reboot box — dan tidak ada yang menyadarinya sampai waktu sholat
// berikutnya. Kegagalan di sini cukup menjatuhkan tampilan ke keadaan normal.
class PhaseErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { failed: false };
  }

  static getDerivedStateFromError() {
    return { failed: true };
  }

  componentDidCatch(error) {
    console.error('Prayer phase overlay failed:', error);
  }

  render() {
    if (this.state.failed) return null;
    return this.props.children;
  }
}

export default PhaseErrorBoundary;
```

- [ ] **Step 3: Pasang di App.js**

Tambahkan import di `frontend/tv-display/src/App.js` setelah baris 7 (`import { MosqueIcon } from './components/Icons';`):

```jsx
import PrayerPhaseOverlay from './components/PrayerPhaseOverlay';
import PhaseErrorBoundary from './components/PhaseErrorBoundary';
import usePrayerPhase from './hooks/usePrayerPhase';
```

Tambahkan pemanggilan hook tepat setelah `useEffect` pengambil data yang berakhir di baris 31, sebelum `if (loading)`. Hook harus dipanggil tanpa syarat, di atas early return:

```jsx
  const phaseState = usePrayerPhase(data?.jadwal_sholat, data?.settings);
```

Lalu sisipkan overlay sebagai elemen terakhir di dalam `<div className="tv-display">`, tepat setelah `<RunningText ... />`:

```jsx
        <PhaseErrorBoundary>
          <PrayerPhaseOverlay {...phaseState} />
        </PhaseErrorBoundary>
```

- [ ] **Step 4: Pastikan test dan build tetap lulus**

```bash
cd frontend/tv-display && CI=true npx react-scripts test --watchAll=false
```

Expected: PASS — test dari Task 1 tetap lulus.

```bash
cd frontend/tv-display && REACT_APP_API_URL=/api npm run build
```

Expected: `Compiled successfully` tanpa peringatan baru.

- [ ] **Step 5: Verifikasi end-to-end dengan jadwal sementara**

Jalankan backend dan TV display (`npm run dev:backend`, lalu `npm run dev:tv`), buka panel admin, dan:

1. Di menu Jadwal Sholat, ubah jam **Maghrib** menjadi 2 menit dari sekarang. Catat nilai aslinya.
2. Buka `http://localhost:3000` dan tunggu.
3. Amati urutannya: tampilan normal → notifikasi azan → hitung mundur → layar gelap → kembali normal. Dengan durasi default Maghrib (ikamah 5 menit, sholat 15 menit), fase azan muncul 2 menit dan hitung mundur mulai dari `03:00`.
4. Refresh browser di tengah fase layar gelap. Halaman harus kembali ke fase layar gelap, bukan ke tampilan normal.
5. Kembalikan jam Maghrib ke nilai aslinya, atau tekan "Sinkron Sekarang" di menu Pengaturan.

Bila ingin siklusnya lebih singkat, jalankan langkah ini setelah Task 4 selesai sehingga durasi dapat diisi 1 menit dari panel admin.

- [ ] **Step 6: Commit**

```bash
git add frontend/tv-display/src/hooks/usePrayerPhase.js frontend/tv-display/src/components/PhaseErrorBoundary.js frontend/tv-display/src/App.js
git commit -m "feat(tv): drive azan/iqomah/blank phases from the clock"
```

---

### Task 4: Kartu pengaturan di panel admin

**Files:**
- Modify: `frontend/admin-panel/src/pages/Settings.js`

**Interfaces:**
- Consumes: 11 key settings yang dibaca `parseConfig` dari Task 1 — `iqomah_enabled`, `ikamah_<key>`, `sholat_<key>` untuk `subuh`, `dzuhur`, `ashar`, `maghrib`, `isya`.
- Produces: tidak ada API baru. Nilai disimpan lewat `settingsAPI.update(settings)` yang sudah ada.

- [ ] **Step 1: Tambahkan konstanta daftar sholat**

Di `frontend/admin-panel/src/pages/Settings.js`, tambahkan setelah komponen `SyncIcon` (berakhir di baris 10):

```jsx
const PRAYERS = [
  { key: 'subuh', label: 'Subuh' },
  { key: 'dzuhur', label: 'Dzuhur' },
  { key: 'ashar', label: 'Ashar' },
  { key: 'maghrib', label: 'Maghrib' },
  { key: 'isya', label: 'Isya' },
];
```

- [ ] **Step 2: Tambahkan 11 key ke state awal**

Di dalam `useState` pada baris 14-22, tambahkan setelah `kabkota: '',`:

```jsx
    iqomah_enabled: 'true',
    ikamah_subuh: '15',
    ikamah_dzuhur: '10',
    ikamah_ashar: '10',
    ikamah_maghrib: '5',
    ikamah_isya: '10',
    sholat_subuh: '15',
    sholat_dzuhur: '15',
    sholat_ashar: '15',
    sholat_maghrib: '15',
    sholat_isya: '15',
```

- [ ] **Step 3: Ubah loadSettings agar menggabungkan, bukan menimpa**

Ganti baris 44 di `loadSettings`:

```jsx
      setSettings(res.data);
```

menjadi:

```jsx
      // Merge, bukan timpa: deployment lama belum punya key jeda ikamah, dan
      // menimpa akan membuang seluruh nilai default sehingga input tampil kosong.
      setSettings((prev) => ({ ...prev, ...res.data }));
```

- [ ] **Step 4: Tambahkan kartu Jeda Ikamah**

Sisipkan di dalam `<form>`, setelah kartu "Lokasi Jadwal Sholat" yang ditutup pada baris 242, tepat sebelum `</form>`:

```jsx
        <div className="card animate-in animate-delay-2" style={{ marginTop: 24 }}>
          <div className="card-header">
            <h3 style={{ fontSize: '1rem', fontWeight: 600, margin: 0 }}>Jeda Ikamah</h3>
          </div>
          <div className="card-body">
            <p style={{ fontSize: '0.8rem', color: '#888', marginBottom: 16 }}>
              Setelah waktu sholat masuk, TV menampilkan notifikasi azan, lalu hitung mundur menuju ikamah, lalu layar gelap selama sholat berjamaah.
            </p>
            <div className="form-group">
              <label className="form-label">Aktifkan Jeda Ikamah &amp; Layar Sholat</label>
              <select value={settings.iqomah_enabled || 'true'} onChange={e => setSettings({...settings, iqomah_enabled: e.target.value})} className="form-select">
                <option value="true">Aktif</option>
                <option value="false">Nonaktif</option>
              </select>
            </div>
            {PRAYERS.map(p => (
              <div key={p.key} className="form-row">
                <div className="form-group">
                  <label className="form-label">Jeda Ikamah {p.label} (menit)</label>
                  <input type="number" min="0" max="120" step="1" className="form-input"
                    value={settings[`ikamah_${p.key}`] ?? ''}
                    onChange={e => setSettings({...settings, [`ikamah_${p.key}`]: e.target.value})} />
                </div>
                <div className="form-group">
                  <label className="form-label">Layar Gelap {p.label} (menit)</label>
                  <input type="number" min="0" max="120" step="1" className="form-input"
                    value={settings[`sholat_${p.key}`] ?? ''}
                    onChange={e => setSettings({...settings, [`sholat_${p.key}`]: e.target.value})} />
                </div>
              </div>
            ))}
            <p style={{ fontSize: '0.8rem', color: '#888', marginTop: 8 }}>
              Sholat Jum'at dilewati — saat waktu Jum'at TV tetap menampilkan tampilan normal. Sholat lain di hari Jumat tetap berjalan seperti biasa. Isi 0 untuk melewati salah satu fase.
            </p>
          </div>
        </div>
```

- [ ] **Step 5: Verifikasi di panel admin**

Jalankan `npm run dev:backend` dan `npm run dev:admin`, buka `http://localhost:3001/admin/settings`, login sebagai `admin` / `admin123`, lalu:

1. Kartu "Jeda Ikamah" tampil dengan saklar Aktif dan sepuluh input durasi berisi nilai default (15/15, 10/15, 10/15, 5/15, 10/15).
2. Ubah "Jeda Ikamah Maghrib" menjadi 1 dan "Layar Gelap Maghrib" menjadi 1, tekan "Simpan Pengaturan", dan pastikan muncul toast "Pengaturan berhasil disimpan".
3. Refresh halaman — nilai yang baru harus tetap 1 dan 1, sementara nama masjid serta lokasi tidak berubah.
4. Buka `http://localhost:5001/api/dashboard` di browser dan pastikan objek `settings` berisi `ikamah_maghrib: "1"` dan `sholat_maghrib: "1"`.
5. Kembalikan nilainya ke 5 dan 15, lalu simpan lagi.

- [ ] **Step 6: Commit**

```bash
git add frontend/admin-panel/src/pages/Settings.js
git commit -m "feat(admin): add iqomah interval settings card"
```

---

### Task 5: Seed, dokumentasi, dan build Vercel

**Files:**
- Modify: `supabase/seed.sql:15-22`
- Modify: `CLAUDE.md`
- Modify: `tv/` dan `admin/` (hasil build)

**Interfaces:**
- Consumes: seluruh key dari Task 4 dan perilaku dari Task 1-3.
- Produces: tidak ada antarmuka kode.

- [ ] **Step 1: Tambahkan default ke seed**

Di `supabase/seed.sql`, ubah blok `INSERT INTO settings` (baris 15-22) sehingga baris `kabkota` tidak lagi menutup pernyataan dan 11 key baru menyusul:

```sql
-- 2. Settings
INSERT INTO settings (key, value) VALUES
  ('masjid_name', 'Masjid Raudhatul Jannah'),
  ('masjid_address', 'Jl. Raya Penggilingan No.12, Jakarta Timur'),
  ('latitude', '-6.1857'),
  ('longitude', '106.9369'),
  ('timezone', 'Asia/Jakarta'),
  ('provinsi', 'DKI Jakarta'),
  ('kabkota', 'Kota Administrasi Jakarta Timur'),
  ('iqomah_enabled', 'true'),
  ('ikamah_subuh', '15'),
  ('ikamah_dzuhur', '10'),
  ('ikamah_ashar', '10'),
  ('ikamah_maghrib', '5'),
  ('ikamah_isya', '10'),
  ('sholat_subuh', '15'),
  ('sholat_dzuhur', '15'),
  ('sholat_ashar', '15'),
  ('sholat_maghrib', '15'),
  ('sholat_isya', '15');
```

- [ ] **Step 2: Perbarui CLAUDE.md**

Di bagian **Database (Supabase PostgreSQL) → Seed Data**, ubah baris `- 7 settings (masjid name, address, coordinates, timezone)` menjadi:

```markdown
  - 18 settings (masjid name, address, coordinates, timezone, iqomah durations)
```

Di bagian **Conventions**, tambahkan setelah baris tentang Jum'at:

```markdown
- Iqomah phases (azan → countdown → blank screen) are derived from the browser clock by `computePhase()` in `frontend/tv-display/src/lib/prayerPhase.js` — no timers, so the display recovers its phase after a reload
- Durations live in `settings` as flat keys: `iqomah_enabled`, `ikamah_<sholat>`, `sholat_<sholat>` for subuh/dzuhur/ashar/maghrib/isya (minutes, 0 skips the phase, invalid values fall back to defaults)
- The azan notice runs inside the iqomah duration, not in addition to it; Jum'at (Dzuhur on Fridays) skips the sequence entirely
```

Di bagian **Key Features → TV Display**, tambahkan di akhir kalimatnya:

```markdown
, iqomah sequence (azan notice → full-screen countdown with "Mohon Nonaktifkan Ponsel" → dark blank screen during prayer)
```

Di bagian **Project Structure**, tambahkan di bawah daftar `frontend/tv-display/src/`:

```
│       ├── lib/prayerPhase.js     # Pure azan/iqomah/blank phase logic (+ tests)
│       ├── hooks/usePrayerPhase.js # 1-second tick wrapper around computePhase
│       ├── components/PrayerPhaseOverlay.js  # Azan / iqomah countdown / blank screen
│       ├── components/PhaseErrorBoundary.js  # Keeps overlay bugs from blanking the TV
```

- [ ] **Step 3: Jalankan seluruh test sekali lagi**

```bash
cd frontend/tv-display && CI=true npx react-scripts test --watchAll=false
```

Expected: PASS.

- [ ] **Step 4: Build untuk Vercel**

```bash
npm run build:vercel
```

Expected: berakhir dengan `🎉 All done! Ready to commit and push to Vercel.` Periksa `git status` — `tv/` dan `admin/` harus berubah, sedangkan `api/backend/` tidak boleh berubah sama sekali karena backend tidak disentuh.

- [ ] **Step 5: Commit**

```bash
git add supabase/seed.sql CLAUDE.md tv/ admin/
git commit -m "feat: ship iqomah countdown and prayer blank screen to Vercel build"
```

---

## Self-Review

**Cakupan spec:**

| Bagian spec | Task |
|---|---|
| §3 Arsitektur, daftar berkas | 1, 2, 3 |
| §4 Kontrak konfigurasi, 11 key dan default | 1 (`parseConfig`), 4 (form), 5 (seed) |
| §5 Logika fase, alias nama, seluruh kasus tepi | 1 |
| §6 Desain visual ketiga fase, dimming, denyut, anti burn-in | 2 |
| §7 Panel admin | 4 |
| §8 Penanganan error empat lapis | 1 (`parseConfig`, `computePhase`), 3 (`App.js`, `PhaseErrorBoundary`) |
| §9 Unit test dan verifikasi manual | 1 (test), 3 Step 5 dan 4 Step 5 (manual) |
| §10 Deployment | 5 |

Catatan operasional tentang screensaver Android TV box (§6) tidak menghasilkan task karena spec menyatakannya sebagai konfigurasi perangkat, bukan kode.

**Konsistensi antarmuka:** `computePhase` mengembalikan `{ phase, prayer, sisa, total }`; `usePrayerPhase` meneruskannya apa adanya lewat `{...phaseState}`; `PrayerPhaseOverlay` menerima keempat nama yang sama. Key sholat internal (`subuh`, `dzuhur`, `ashar`, `maghrib`, `isya`) identik di `PRAYER_KEYS` pada Task 1, `PRAYERS` pada Task 4, dan nama key di seed pada Task 5.
