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
    expect(r.progress).toBe(0);
  });

  it('sisa hitung mundur berkurang per detik', () => {
    expect(computePhase(at('04:59:59'), JADWAL, CONFIG).sisa).toBe(1);
  });

  it('dimming ramp dimulai dari nol saat countdown pertama kali terlihat', () => {
    const r = computePhase(at('04:47:00'), JADWAL, CONFIG);
    expect(r.phase).toBe('ikamah');
    expect(r.progress).toBe(0);
  });

  it('dimming ramp mencapai tengah perjalanan di tengah-tengah countdown', () => {
    const r = computePhase(at('04:53:30'), JADWAL, CONFIG);
    expect(r.phase).toBe('ikamah');
    expect(r.progress).toBeCloseTo(0.5, 5);
  });

  it('dimming ramp mendekati satu sebelum sholat berjamaah', () => {
    const r = computePhase(at('04:59:59'), JADWAL, CONFIG);
    expect(r.phase).toBe('ikamah');
    expect(r.progress).toBeGreaterThan(0.99);
    expect(r.progress).toBeLessThanOrEqual(1);
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

describe('computePhase — transisi fase Maghrib (ikamah 5 menit, sholat 15 menit)', () => {
  it('dimming ramp mulai dari nol pada saat countdown pertama kali terlihat', () => {
    const r = computePhase(at('17:59:00'), JADWAL, CONFIG);
    expect(r.phase).toBe('ikamah');
    expect(r.prayer.key).toBe('maghrib');
    expect(r.progress).toBe(0);
  });

  it('dimming ramp mencapai tengah perjalanan di tengah-tengah countdown', () => {
    const r = computePhase(at('18:00:30'), JADWAL, CONFIG);
    expect(r.phase).toBe('ikamah');
    expect(r.prayer.key).toBe('maghrib');
    expect(r.progress).toBeCloseTo(0.5, 5);
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
