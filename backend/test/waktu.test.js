const test = require('node:test');
const assert = require('node:assert');

const { hariIni, bulanIni, bulanLalu, bulanMundur, capWaktu } = require('../lib/waktu');

// Vercel serverless berjalan di UTC. Seluruh test di bawah memakai instant UTC
// eksplisit supaya hasilnya tidak bergantung pada zona waktu mesin yang
// menjalankannya — persis kondisi yang membuat bug ini lolos ke produksi.

test('capWaktu memakai zona masjid, bukan zona proses', () => {
  // Kasus yang dilaporkan: 09.26 WIB tercetak 02.26 karena diformat sebagai UTC.
  const saat = new Date('2026-08-10T02:26:00Z');
  assert.strictEqual(capWaktu('Asia/Jakarta', saat), '10 Agustus 2026 pukul 09.26');
  assert.strictEqual(capWaktu('Asia/Makassar', saat), '10 Agustus 2026 pukul 10.26');
  assert.strictEqual(capWaktu('Asia/Jayapura', saat), '10 Agustus 2026 pukul 11.26');
});

test('hariIni memakai tanggal di zona masjid', () => {
  assert.strictEqual(hariIni('Asia/Jakarta', new Date('2026-08-10T02:26:00Z')), '2026-08-10');
});

test('hariIni tidak tertinggal satu hari di dini hari WIB', () => {
  // 02:00 WIB tanggal 10 masih 19:00 UTC tanggal 9. Server UTC akan menjawab
  // '2026-08-09', sehingga kajian dan agenda kemarin masih dianggap mendatang.
  const dinihari = new Date('2026-08-09T19:00:00Z');
  assert.strictEqual(hariIni('Asia/Jakarta', dinihari), '2026-08-10');
});

test('bulanIni tidak tertinggal satu bulan di dini hari tanggal 1', () => {
  // 03:00 WIB 1 Agustus masih 20:00 UTC 31 Juli.
  const awalBulan = new Date('2026-07-31T20:00:00Z');
  assert.strictEqual(bulanIni('Asia/Jakarta', awalBulan), '2026-08');
});

test('bulanLalu menyeberangi pergantian tahun', () => {
  assert.strictEqual(bulanLalu('Asia/Jakarta', new Date('2026-01-15T00:00:00Z')), '2025-12');
});

test('bulanLalu di dini hari tanggal 1 mengikuti bulan zona masjid', () => {
  assert.strictEqual(bulanLalu('Asia/Jakarta', new Date('2026-07-31T20:00:00Z')), '2026-07');
});

test('bulanMundur mengembalikan enam bulan berurutan berakhir di bulan berjalan', () => {
  const hasil = bulanMundur('Asia/Jakarta', 6, new Date('2026-08-10T02:26:00Z'));
  assert.strictEqual(hasil.length, 6);
  assert.deepStrictEqual(
    hasil.map((b) => b.prefix),
    ['2026-03', '2026-04', '2026-05', '2026-06', '2026-07', '2026-08'],
  );
  assert.strictEqual(hasil[5].label, 'Agu 26');
});

test('bulanMundur menyeberangi pergantian tahun', () => {
  const hasil = bulanMundur('Asia/Jakarta', 3, new Date('2026-01-15T00:00:00Z'));
  assert.deepStrictEqual(hasil.map((b) => b.prefix), ['2025-11', '2025-12', '2026-01']);
});

test('zona kosong jatuh ke Asia/Jakarta', () => {
  const saat = new Date('2026-08-10T02:26:00Z');
  assert.strictEqual(hariIni(undefined, saat), '2026-08-10');
  assert.strictEqual(hariIni('', saat), '2026-08-10');
  assert.strictEqual(capWaktu(null, saat), '10 Agustus 2026 pukul 09.26');
});

test('zona salah ketik jatuh ke Asia/Jakarta alih-alih melempar', () => {
  // settings.timezone bisa diisi apa saja lewat panel admin; satu salah ketik
  // tidak boleh menjatuhkan dashboard.
  const saat = new Date('2026-08-10T02:26:00Z');
  assert.strictEqual(hariIni('Asia/Jakartaa', saat), '2026-08-10');
  assert.strictEqual(bulanIni('bukan/zona', saat), '2026-08');
});
