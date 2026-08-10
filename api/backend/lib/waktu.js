// Perhitungan tanggal di zona waktu masjid.
//
// Vercel serverless berjalan di UTC, sementara masjid berada di WIB/WITA/WIT.
// `new Date().getMonth()` dan `toLocaleDateString()` tanpa opsi `timeZone`
// keduanya memakai zona proses, sehingga server menjawab dengan tanggal UTC:
// cap waktu PDF tercetak tujuh jam lebih awal, dan sebelum pukul 07.00 WIB
// server masih menganggap hari ini adalah kemarin.
//
// Seluruh fungsi di sini murni dan menerima `saat` supaya bisa diuji tanpa
// bergantung pada jam mesin yang menjalankannya.

const ZONA_DEFAULT = 'Asia/Jakarta';

// settings.timezone bisa diisi apa saja lewat panel admin. Zona yang tidak
// dikenal membuat Intl melempar RangeError, dan satu salah ketik tidak boleh
// menjatuhkan dashboard — jadi jatuh ke default.
const resolveZona = (zona) => {
  if (!zona) return ZONA_DEFAULT;
  try {
    new Intl.DateTimeFormat('en', { timeZone: zona });
    return zona;
  } catch {
    return ZONA_DEFAULT;
  }
};

const bagianTanggal = (zona, saat) => {
  const bagian = new Intl.DateTimeFormat('en-US', {
    timeZone: resolveZona(zona),
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).formatToParts(saat);
  const ambil = (jenis) => bagian.find((b) => b.type === jenis).value;
  return { tahun: ambil('year'), bulan: ambil('month'), hari: ambil('day') };
};

// 'YYYY-MM-DD' di zona masjid — formatnya sama dengan kolom `tanggal` di database.
const hariIni = (zona, saat = new Date()) => {
  const { tahun, bulan, hari } = bagianTanggal(zona, saat);
  return `${tahun}-${bulan}-${hari}`;
};

// 'YYYY-MM' di zona masjid, dipakai sebagai awalan pencocokan kolom `tanggal`.
const bulanIni = (zona, saat = new Date()) => {
  const { tahun, bulan } = bagianTanggal(zona, saat);
  return `${tahun}-${bulan}`;
};

// Aritmetika bulan dilakukan pada angka, bukan pada objek Date, supaya
// pergantian tahun dan zona tidak saling mengganggu.
const geserBulan = (tahun, bulan, mundur) => {
  const total = tahun * 12 + (bulan - 1) - mundur;
  return { tahun: Math.floor(total / 12), bulan: (total % 12) + 1 };
};

const prefiks = ({ tahun, bulan }) => `${tahun}-${String(bulan).padStart(2, '0')}`;

const bulanLalu = (zona, saat = new Date()) => {
  const { tahun, bulan } = bagianTanggal(zona, saat);
  return prefiks(geserBulan(Number(tahun), Number(bulan), 1));
};

// Label bulan diformat dari tanggal UTC yang dibuat sendiri, bukan dari `saat`,
// supaya hasilnya tidak ikut bergeser oleh zona mana pun.
const labelBulan = ({ tahun, bulan }) =>
  new Intl.DateTimeFormat('id-ID', { timeZone: 'UTC', month: 'short', year: '2-digit' })
    .format(new Date(Date.UTC(tahun, bulan - 1, 15)));

// `jumlah` bulan terakhir, terurut dari yang paling lama ke bulan berjalan.
const bulanMundur = (zona, jumlah, saat = new Date()) => {
  const { tahun, bulan } = bagianTanggal(zona, saat);
  const daftar = [];
  for (let i = jumlah - 1; i >= 0; i -= 1) {
    const titik = geserBulan(Number(tahun), Number(bulan), i);
    daftar.push({ prefix: prefiks(titik), label: labelBulan(titik) });
  }
  return daftar;
};

// Cap waktu yang terbaca manusia, mis. '10 Agustus 2026 pukul 09.26'.
const capWaktu = (zona, saat = new Date()) =>
  new Intl.DateTimeFormat('id-ID', {
    timeZone: resolveZona(zona),
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(saat);

module.exports = { ZONA_DEFAULT, hariIni, bulanIni, bulanLalu, bulanMundur, capWaktu };
