const path = require('path');
const fs = require('fs');
const bcrypt = require('bcryptjs');

const dbPath = path.join(__dirname, '..', 'db.json');

const now = new Date().toISOString();
const ts = (daysAgo = 0) => {
  const d = new Date();
  d.setDate(d.getDate() - daysAgo);
  return d.toISOString();
};
const dateStr = (daysAgo = 0) => {
  const d = new Date();
  d.setDate(d.getDate() - daysAgo);
  return d.toISOString().slice(0, 10);
};

// ─── USERS ────────────────────────────────────────────
const hashedPassword = bcrypt.hashSync('admin123', 10);
const users = [
  { id: 1, username: 'admin', password: hashedPassword, full_name: 'Super Admin', role: 'superadmin', created_at: ts(90), updated_at: ts(90) },
  { id: 2, username: 'bendahara', password: hashedPassword, full_name: 'H. Muhammad Rizki', role: 'bendahara', created_at: ts(85), updated_at: ts(85) },
  { id: 3, username: 'takmir', password: hashedPassword, full_name: 'Ustadz Abdullah', role: 'takmir', created_at: ts(85), updated_at: ts(85) },
  { id: 4, username: 'marbot', password: hashedPassword, full_name: 'Pak Hasan', role: 'marbot', created_at: ts(80), updated_at: ts(80) },
];

// ─── SETTINGS ─────────────────────────────────────────
const settings = [
  { id: 1, key: 'masjid_name', value: 'Masjid Raudhatul Jannah', updated_at: ts(0) },
  { id: 2, key: 'masjid_address', value: 'Jl. Raya No. 123, Kel. Mekar Jaya, Kec. Bekasi Selatan', updated_at: ts(0) },
  { id: 3, key: 'timezone', value: 'Asia/Jakarta', updated_at: ts(0) },
  { id: 4, key: 'latitude', value: '-6.2088', updated_at: ts(0) },
  { id: 5, key: 'longitude', value: '106.8456', updated_at: ts(0) },
  { id: 6, key: 'provinsi', value: 'Jawa Barat', updated_at: ts(0) },
  { id: 7, key: 'kabkota', value: 'Kota Bekasi', updated_at: ts(0) },
];

// ─── JADWAL SHOLAT ────────────────────────────────────
const jadwal_sholat = [
  { id: 1, nama_sholat: 'Imsak', waktu: '04:35', is_active: 1, created_at: ts(0), updated_at: ts(0) },
  { id: 2, nama_sholat: 'Subuh', waktu: '04:45', is_active: 1, created_at: ts(0), updated_at: ts(0) },
  { id: 3, nama_sholat: 'Terbit', waktu: '06:00', is_active: 1, created_at: ts(0), updated_at: ts(0) },
  { id: 4, nama_sholat: 'Dhuha', waktu: '06:29', is_active: 1, created_at: ts(0), updated_at: ts(0) },
  { id: 5, nama_sholat: 'Dzuhur', waktu: '12:02', is_active: 1, created_at: ts(0), updated_at: ts(0) },
  { id: 6, nama_sholat: 'Ashar', waktu: '15:23', is_active: 1, created_at: ts(0), updated_at: ts(0) },
  { id: 7, nama_sholat: 'Maghrib', waktu: '17:57', is_active: 1, created_at: ts(0), updated_at: ts(0) },
  { id: 8, nama_sholat: 'Isya', waktu: '19:09', is_active: 1, created_at: ts(0), updated_at: ts(0) },
];

// ─── KAJIAN ───────────────────────────────────────────
const kajian = [
  { id: 1, judul: 'Tafsir Al-Misbah Juz 1-5', ustadz: 'Ustadz Dr. Ahmad Husein', tanggal: dateStr(-2), jam_mulai: '19:30', jam_selesai: '21:00', deskripsi: 'Kajian tafsir mingguan membahas surat Al-Baqarah', is_recurring: 1, recurring_day: 'Senin', created_at: ts(30), updated_at: ts(30) },
  { id: 2, judul: "Hafalan Al-Qur'an Juz 30", ustadz: 'Ustadzah Fatimah Azzahra', tanggal: dateStr(1), jam_mulai: '16:00', jam_selesai: '17:30', deskripsi: 'Program tahfiz untuk remaja masjid', is_recurring: 1, recurring_day: 'Selasa', created_at: ts(28), updated_at: ts(28) },
  { id: 3, judul: 'Fiqih Sholat', ustadz: 'Ustadz Abdullah Said', tanggal: dateStr(2), jam_mulai: '20:00', jam_selesai: '21:30', deskripsi: 'Pembahasan hukum dan tata cara sholat', is_recurring: 1, recurring_day: 'Rabu', created_at: ts(25), updated_at: ts(25) },
  { id: 4, judul: 'Kajian Akidah Akhlak', ustadz: 'Ustadz Dr. H. Muhammad Thalib', tanggal: dateStr(3), jam_mulai: '19:30', jam_selesai: '21:00', deskripsi: 'Pembinaan akhlak mulia dalam kehidupan sehari-hari', is_recurring: 1, recurring_day: 'Kamis', created_at: ts(20), updated_at: ts(20) },
  { id: 5, judul: 'Tafsir Al-Misbah Juz 6-10', ustadz: 'Ustadz Dr. Ahmad Husein', tanggal: dateStr(5), jam_mulai: '19:30', jam_selesai: '21:30', deskripsi: 'Kajian tafsir Jumat malam', is_recurring: 1, recurring_day: 'Jumat', created_at: ts(15), updated_at: ts(15) },
  { id: 6, judul: 'Islamic Parenting', ustadz: 'Ustadzah Nurul Hidayah', tanggal: dateStr(6), jam_mulai: '09:00', jam_selesai: '11:00', deskripsi: 'Parenting Islami untuk ibu-ibu pengajian', is_recurring: 0, recurring_day: '', created_at: ts(10), updated_at: ts(10) },
  { id: 7, judul: 'Bedah Buku "Sejarah Nabi"', ustadz: 'Dr. H. Imam Supriyadi, M.Ag', tanggal: dateStr(-1), jam_mulai: '14:00', jam_selesai: '16:00', deskripsi: 'Diskusi buku tentang sejarah Nabi Muhammad SAW', is_recurring: 0, recurring_day: '', created_at: ts(5), updated_at: ts(5) },
  { id: 8, judul: 'Kajian Ramadan: Patience & Gratitude', ustadz: 'Ustadz Dr. Ahmad Husein', tanggal: dateStr(8), jam_mulai: '10:00', jam_selesai: '11:30', deskripsi: 'Kajian khusus bulan Ramadan', is_recurring: 0, recurring_day: '', created_at: ts(3), updated_at: ts(3) },
];

// ─── KEUANGAN (45 transactions) ───────────────────────
const keuangan = [
  // Juli 2026 (bulan ini)
  { id: 1, tanggal: dateStr(0), jenis: 'masuk', kategori: 'Infaq', deskripsi: 'Infaq harian dari jamaah Subuh', jumlah: 450000, metode_pembayaran: 'cash', penerima: '', no_ref: '', catatan: '', status: 'confirmed', bukti_path: null, created_by: 2, created_at: ts(0), updated_at: ts(0) },
  { id: 2, tanggal: dateStr(1), jenis: 'masuk', kategori: 'Kas Jumat', deskripsi: 'Infaq jamaah Jumat minggu terakhir Juli', jumlah: 3250000, metode_pembayaran: 'cash', penerima: '', no_ref: '', catatan: 'Ramai', status: 'confirmed', bukti_path: null, created_by: 2, created_at: ts(1), updated_at: ts(1) },
  { id: 3, tanggal: dateStr(3), jenis: 'keluar', kategori: 'Listrik & Air', deskripsi: 'Pembayaran listrik bulan Juli', jumlah: 1850000, metode_pembayaran: 'transfer', penerima: 'PLN', no_ref: 'TRF-20260725-001', catatan: 'Tagihan bulanan', status: 'confirmed', bukti_path: null, created_by: 2, created_at: ts(3), updated_at: ts(3) },
  { id: 4, tanggal: dateStr(5), jenis: 'masuk', kategori: 'Donasi', deskripsi: 'Donasi dari Bapak H. Ahmad untuk renovasi', jumlah: 5000000, metode_pembayaran: 'transfer', penerima: 'H. Ahmad', no_ref: 'TRF-20260723-003', catatan: 'Donatur rutin', status: 'confirmed', bukti_path: null, created_by: 2, created_at: ts(5), updated_at: ts(5) },
  { id: 5, tanggal: dateStr(7), jenis: 'keluar', kategori: 'Pemeliharaan', deskripsi: 'Servis AC indoor unit Masjid', jumlah: 750000, metode_pembayaran: 'cash', penerima: 'Pak Budi Teknisi', no_ref: '', catatan: 'AC ruang utama', status: 'confirmed', bukti_path: null, created_by: 2, created_at: ts(7), updated_at: ts(7) },
  { id: 6, tanggal: dateStr(7), jenis: 'masuk', kategori: 'Sedekah', deskripsi: 'Sedekah dari Ibu Hajah Fatimah', jumlah: 2000000, metode_pembayaran: 'cash', penerima: '', no_ref: '', catatan: 'Sedekah pembangunan', status: 'confirmed', bukti_path: null, created_by: 2, created_at: ts(7), updated_at: ts(7) },
  { id: 7, tanggal: dateStr(8), jenis: 'keluar', kategori: 'Operasional', deskripsi: 'Pembelian alat kebersihan', jumlah: 320000, metode_pembayaran: 'cash', penerima: 'Toko Bangunan Jaya', no_ref: '', catatan: 'Sapu, pel, karpet', status: 'confirmed', bukti_path: null, created_by: 2, created_at: ts(8), updated_at: ts(8) },
  { id: 8, tanggal: dateStr(10), jenis: 'masuk', kategori: 'Infaq', deskripsi: 'Infaq jamaah sholat Dzuhur', jumlah: 380000, metode_pembayaran: 'cash', penerima: '', no_ref: '', catatan: '', status: 'confirmed', bukti_path: null, created_by: 2, created_at: ts(10), updated_at: ts(10) },
  { id: 9, tanggal: dateStr(11), jenis: 'masuk', kategori: 'Kas Jumat', deskripsi: 'Kotak infaq Jumat minggu ketiga', jumlah: 2800000, metode_pembayaran: 'cash', penerima: '', no_ref: '', catatan: '', status: 'confirmed', bukti_path: null, created_by: 2, created_at: ts(11), updated_at: ts(11) },
  { id: 10, tanggal: dateStr(13), jenis: 'keluar', kategori: 'Gaji/Insentif', deskripsi: 'Insentif marbot bulan Juli', jumlah: 1500000, metode_pembayaran: 'transfer', penerima: 'Pak Hasan', no_ref: 'TRF-20260715-001', catatan: 'Marbot tetap', status: 'confirmed', bukti_path: null, created_by: 2, created_at: ts(13), updated_at: ts(13) },
  { id: 11, tanggal: dateStr(15), jenis: 'keluar', kategori: 'Beli Barang', deskripsi: 'Pembelian karpet masjid baru', jumlah: 8500000, metode_pembayaran: 'transfer', penerima: 'Toko Karpet Sultan', no_ref: 'TRF-20260713-002', catatan: 'Karpet Turki 50 meter', status: 'confirmed', bukti_path: null, created_by: 2, created_at: ts(15), updated_at: ts(15) },
  { id: 12, tanggal: dateStr(17), jenis: 'masuk', kategori: 'Donasi', deskripsi: 'Donasi renovasi dari PT. Berkah Jaya', jumlah: 10000000, metode_pembayaran: 'transfer', penerima: 'PT. Berkah Jaya', no_ref: 'TRF-20260711-001', catatan: 'Donasi corporate', status: 'confirmed', bukti_path: null, created_by: 2, created_at: ts(17), updated_at: ts(17) },
  { id: 13, tanggal: dateStr(18), jenis: 'masuk', kategori: 'Kas Jumat', deskripsi: 'Infaq Jumat minggu kedua', jumlah: 2950000, metode_pembayaran: 'cash', penerima: '', no_ref: '', catatan: '', status: 'confirmed', bukti_path: null, created_by: 2, created_at: ts(18), updated_at: ts(18) },
  { id: 14, tanggal: dateStr(20), jenis: 'keluar', kategori: 'Sosial', deskripsi: 'Bantuan paket sembako untuk warga kurang mampu', jumlah: 2500000, metode_pembayaran: 'cash', penerima: 'RT 03/RW 05', no_ref: '', catatan: '10 paket sembako', status: 'confirmed', bukti_path: null, created_by: 2, created_at: ts(20), updated_at: ts(20) },
  { id: 15, tanggal: dateStr(22), jenis: 'masuk', kategori: 'Infaq', deskripsi: 'Infaq dari jamaah tarawih', jumlah: 1200000, metode_pembayaran: 'cash', penerima: '', no_ref: '', catatan: 'Masih ada tarawih qadha', status: 'confirmed', bukti_path: null, created_by: 2, created_at: ts(22), updated_at: ts(22) },

  // Juni 2026
  { id: 16, tanggal: '2026-06-28', jenis: 'masuk', kategori: 'Kas Jumat', deskripsi: 'Infaq Jumat minggu terakhir Juni', jumlah: 3100000, metode_pembayaran: 'cash', penerima: '', no_ref: '', catatan: '', status: 'confirmed', bukti_path: null, created_by: 2, created_at: '2026-06-28T13:00:00.000Z', updated_at: '2026-06-28T13:00:00.000Z' },
  { id: 17, tanggal: '2026-06-25', jenis: 'keluar', kategori: 'Operasional', deskripsi: 'Pembelian tisu dan hand sanitizer', jumlah: 180000, metode_pembayaran: 'cash', penerima: 'Indomaret', no_ref: '', catatan: '', status: 'confirmed', bukti_path: null, created_by: 2, created_at: '2026-06-25T16:00:00.000Z', updated_at: '2026-06-25T16:00:00.000Z' },
  { id: 18, tanggal: '2026-06-22', jenis: 'masuk', kategori: 'Dana Pembangunan', deskripsi: 'Setoran dana pembangunan dari donatur kelompok', jumlah: 7500000, metode_pembayaran: 'transfer', penerima: 'Kelompok Takmir', no_ref: 'TRF-20260622-001', catatan: 'Dana tahap 2', status: 'confirmed', bukti_path: null, created_by: 2, created_at: '2026-06-22T10:00:00.000Z', updated_at: '2026-06-22T10:00:00.000Z' },
  { id: 19, tanggal: '2026-06-20', jenis: 'keluar', kategori: 'Pemeliharaan', deskripsi: 'Perbaikan keran air wudhu', jumlah: 450000, metode_pembayaran: 'cash', penerima: 'Pak Tukang', no_ref: '', catatan: '3 keran rusak', status: 'confirmed', bukti_path: null, created_by: 2, created_at: '2026-06-20T08:00:00.000Z', updated_at: '2026-06-20T08:00:00.000Z' },
  { id: 20, tanggal: '2026-06-18', jenis: 'keluar', kategori: 'Listrik & Air', deskripsi: 'Tagihan air PDAM Juni', jumlah: 650000, metode_pembayaran: 'transfer', penerima: 'PDAM', no_ref: 'TRF-20260618-001', catatan: '', status: 'confirmed', bukti_path: null, created_by: 2, created_at: '2026-06-18T10:00:00.000Z', updated_at: '2026-06-18T10:00:00.000Z' },
  { id: 21, tanggal: '2026-06-15', jenis: 'masuk', kategori: 'Kas Jumat', deskripsi: 'Kotak infaq Jumat minggu ketiga Juni', jumlah: 2700000, metode_pembayaran: 'cash', penerima: '', no_ref: '', catatan: '', status: 'confirmed', bukti_path: null, created_by: 2, created_at: '2026-06-15T13:00:00.000Z', updated_at: '2026-06-15T13:00:00.000Z' },
  { id: 22, tanggal: '2026-06-12', jenis: 'masuk', kategori: 'Infaq', deskripsi: 'Infaq dari jamaah Subuh selama seminggu', jumlah: 850000, metode_pembayaran: 'cash', penerima: '', no_ref: '', catatan: '', status: 'confirmed', bukti_path: null, created_by: 2, created_at: '2026-06-12T06:30:00.000Z', updated_at: '2026-06-12T06:30:00.000Z' },
  { id: 23, tanggal: '2026-06-10', jenis: 'keluar', kategori: 'Gaji/Insentif', deskripsi: 'Insentif marbot bulan Juni', jumlah: 1500000, metode_pembayaran: 'transfer', penerima: 'Pak Hasan', no_ref: 'TRF-20260610-001', catatan: '', status: 'confirmed', bukti_path: null, created_by: 2, created_at: '2026-06-10T10:00:00.000Z', updated_at: '2026-06-10T10:00:00.000Z' },
  { id: 24, tanggal: '2026-06-08', jenis: 'keluar', kategori: 'Operasional', deskripsi: 'Pembelian sound system baru', jumlah: 3500000, metode_pembayaran: 'transfer', penerima: 'Toko Elektronik Audio Pro', no_ref: 'TRF-20260608-001', catatan: 'Speaker aktif 15 inch', status: 'confirmed', bukti_path: null, created_by: 2, created_at: '2026-06-08T14:00:00.000Z', updated_at: '2026-06-08T14:00:00.000Z' },
  { id: 25, tanggal: '2026-06-05', jenis: 'masuk', kategori: 'Donasi', deskripsi: 'Donasi dari Hj. Siti Aminah', jumlah: 3000000, metode_pembayaran: 'e-wallet', penerima: 'Hj. Siti Aminah', no_ref: 'GOPAY-20260605-001', catatan: 'Donasi rutin bulanan', status: 'confirmed', bukti_path: null, created_by: 2, created_at: '2026-06-05T15:00:00.000Z', updated_at: '2026-06-05T15:00:00.000Z' },
  { id: 26, tanggal: '2026-06-01', jenis: 'masuk', kategori: 'Kas Jumat', deskripsi: 'Infaq Jumat minggu pertama Juni', jumlah: 2600000, metode_pembayaran: 'cash', penerima: '', no_ref: '', catatan: '', status: 'confirmed', bukti_path: null, created_by: 2, created_at: '2026-06-01T13:00:00.000Z', updated_at: '2026-06-01T13:00:00.000Z' },

  // Mei 2026
  { id: 27, tanggal: '2026-05-28', jenis: 'keluar', kategori: 'Listrik & Air', deskripsi: 'Tagihan listrik Mei', jumlah: 1720000, metode_pembayaran: 'transfer', penerima: 'PLN', no_ref: 'TRF-20260528-001', catatan: '', status: 'confirmed', bukti_path: null, created_by: 2, created_at: '2026-05-28T10:00:00.000Z', updated_at: '2026-05-28T10:00:00.000Z' },
  { id: 28, tanggal: '2026-05-25', jenis: 'masuk', kategori: 'Infaq', deskripsi: 'Infaq jamaah Dzuhur minggu keempat', jumlah: 420000, metode_pembayaran: 'cash', penerima: '', no_ref: '', catatan: '', status: 'confirmed', bukti_path: null, created_by: 2, created_at: '2026-05-25T12:30:00.000Z', updated_at: '2026-05-25T12:30:00.000Z' },
  { id: 29, tanggal: '2026-05-22', jenis: 'keluar', kategori: 'Pemeliharaan', deskripsi: 'Pengecatan ulang pagar masjid', jumlah: 1200000, metode_pembayaran: 'cash', penerima: 'Pak Cat', no_ref: '', catatan: '3 galon cat + jasa', status: 'confirmed', bukti_path: null, created_by: 2, created_at: '2026-05-22T09:00:00.000Z', updated_at: '2026-05-22T09:00:00.000Z' },
  { id: 30, tanggal: '2026-05-20', jenis: 'masuk', kategori: 'Kas Jumat', deskripsi: 'Infaq Jumat minggu ketiga Mei', jumlah: 2900000, metode_pembayaran: 'cash', penerima: '', no_ref: '', catatan: '', status: 'confirmed', bukti_path: null, created_by: 2, created_at: '2026-05-20T13:00:00.000Z', updated_at: '2026-05-20T13:00:00.000Z' },
  { id: 31, tanggal: '2026-05-18', jenis: 'keluar', kategori: 'Sosial', deskripsi: 'Bantuan biaya pengobatan warga', jumlah: 1000000, metode_pembayaran: 'transfer', penerima: 'Ibu Rahma', no_ref: 'TRF-20260518-001', catatan: 'Sakit stroke', status: 'confirmed', bukti_path: null, created_by: 2, created_at: '2026-05-18T11:00:00.000Z', updated_at: '2026-05-18T11:00:00.000Z' },
  { id: 32, tanggal: '2026-05-15', jenis: 'masuk', kategori: 'Sedekah', deskripsi: 'Sedekah dari keluarga besar H. Mahmud', jumlah: 4000000, metode_pembayaran: 'transfer', penerima: 'Keluarga H. Mahmud', no_ref: 'TRF-20260515-001', catatan: 'Almarhum H. Mahmud', status: 'confirmed', bukti_path: null, created_by: 2, created_at: '2026-05-15T14:00:00.000Z', updated_at: '2026-05-15T14:00:00.000Z' },
  { id: 33, tanggal: '2026-05-10', jenis: 'keluar', kategori: 'Gaji/Insentif', deskripsi: 'Insentif marbot bulan Mei', jumlah: 1500000, metode_pembayaran: 'transfer', penerima: 'Pak Hasan', no_ref: 'TRF-20260510-001', catatan: '', status: 'confirmed', bukti_path: null, created_by: 2, created_at: '2026-05-10T10:00:00.000Z', updated_at: '2026-05-10T10:00:00.000Z' },
  { id: 34, tanggal: '2026-05-05', jenis: 'masuk', kategori: 'Dana Pembangunan', deskripsi: 'Donasi pembangunan dari komunitas', jumlah: 5000000, metode_pembayaran: 'e-wallet', penerima: 'Komunitas Muslim', no_ref: 'OVO-20260505-001', catatan: 'Dana tahap 1', status: 'confirmed', bukti_path: null, created_by: 2, created_at: '2026-05-05T16:00:00.000Z', updated_at: '2026-05-05T16:00:00.000Z' },
  { id: 35, tanggal: '2026-05-01', jenis: 'masuk', kategori: 'Kas Jumat', deskripsi: 'Infaq Jumat minggu pertama Mei', jumlah: 2500000, metode_pembayaran: 'cash', penerima: '', no_ref: '', catatan: '', status: 'confirmed', bukti_path: null, created_by: 2, created_at: '2026-05-01T13:00:00.000Z', updated_at: '2026-05-01T13:00:00.000Z' },

  // April 2026
  { id: 36, tanggal: '2026-04-28', jenis: 'keluar', kategori: 'Operasional', deskripsi: 'Pembersihan sumur bor masjid', jumlah: 800000, metode_pembayaran: 'cash', penerima: 'Pak Service Sumur', no_ref: '', catatan: 'Sumur tersumbat', status: 'confirmed', bukti_path: null, created_by: 2, created_at: '2026-04-28T08:00:00.000Z', updated_at: '2026-04-28T08:00:00.000Z' },
  { id: 37, tanggal: '2026-04-25', jenis: 'masuk', kategori: 'Infaq', deskripsi: 'Infaq jamaah Subuh minggu keempat', jumlah: 380000, metode_pembayaran: 'cash', penerima: '', no_ref: '', catatan: '', status: 'confirmed', bukti_path: null, created_by: 2, created_at: '2026-04-25T06:30:00.000Z', updated_at: '2026-04-25T06:30:00.000Z' },
  { id: 38, tanggal: '2026-04-22', jenis: 'keluar', kategori: 'Listrik & Air', deskripsi: 'Tagihan listrik April', jumlah: 1650000, metode_pembayaran: 'transfer', penerima: 'PLN', no_ref: 'TRF-20260422-001', catatan: '', status: 'confirmed', bukti_path: null, created_by: 2, created_at: '2026-04-22T10:00:00.000Z', updated_at: '2026-04-22T10:00:00.000Z' },
  { id: 39, tanggal: '2026-04-20', jenis: 'masuk', kategori: 'Kas Jumat', deskripsi: 'Infaq Jumat minggu ketiga April', jumlah: 2750000, metode_pembayaran: 'cash', penerima: '', no_ref: '', catatan: '', status: 'confirmed', bukti_path: null, created_by: 2, created_at: '2026-04-20T13:00:00.000Z', updated_at: '2026-04-20T13:00:00.000Z' },
  { id: 40, tanggal: '2026-04-15', jenis: 'keluar', kategori: 'Beli Barang', deskripsi: 'Pembelian mic wireless baru', jumlah: 1800000, metode_pembayaran: 'transfer', penerima: 'Toko Audio Jaya', no_ref: 'TRF-20260415-001', catatan: '2 unit mic', status: 'confirmed', bukti_path: null, created_by: 2, created_at: '2026-04-15T14:00:00.000Z', updated_at: '2026-04-15T14:00:00.000Z' },
  { id: 41, tanggal: '2026-04-12', jenis: 'masuk', kategori: 'Donasi', deskripsi: 'Donasi dari donatur anonim', jumlah: 1500000, metode_pembayaran: 'e-wallet', penerima: '', no_ref: 'DANA-20260412-001', catatan: 'Transfer diam-diam', status: 'confirmed', bukti_path: null, created_by: 2, created_at: '2026-04-12T20:00:00.000Z', updated_at: '2026-04-12T20:00:00.000Z' },
  { id: 42, tanggal: '2026-04-08', jenis: 'keluar', kategori: 'Gaji/Insentif', deskripsi: 'Insentif marbot bulan April', jumlah: 1500000, metode_pembayaran: 'transfer', penerima: 'Pak Hasan', no_ref: 'TRF-20260408-001', catatan: '', status: 'confirmed', bukti_path: null, created_by: 2, created_at: '2026-04-08T10:00:00.000Z', updated_at: '2026-04-08T10:00:00.000Z' },
  { id: 43, tanggal: '2026-04-05', jenis: 'masuk', kategori: 'Kas Jumat', deskripsi: 'Infaq Jumat minggu pertama April', jumlah: 2400000, metode_pembayaran: 'cash', penerima: '', no_ref: '', catatan: 'Sebelum Ramadan', status: 'confirmed', bukti_path: null, created_by: 2, created_at: '2026-04-05T13:00:00.000Z', updated_at: '2026-04-05T13:00:00.000Z' },
  { id: 44, tanggal: '2026-04-01', jenis: 'keluar', kategori: 'Operasional', deskripsi: 'Pembelian mukena dan sajadah baru', jumlah: 2200000, metode_pembayaran: 'cash', penerima: 'Toko Aksara Islam', no_ref: '', catatan: '20 mukena, 10 sajadah', status: 'confirmed', bukti_path: null, created_by: 2, created_at: '2026-04-01T09:00:00.000Z', updated_at: '2026-04-01T09:00:00.000Z' },

  // Maret 2026
  { id: 45, tanggal: '2026-03-28', jenis: 'masuk', kategori: 'Sedekah', deskripsi: 'Sedekah Ramadan dari jamaah', jumlah: 8000000, metode_pembayaran: 'cash', penerima: '', no_ref: '', catatan: 'Akhir Ramadan', status: 'confirmed', bukti_path: null, created_by: 2, created_at: '2026-03-28T21:30:00.000Z', updated_at: '2026-03-28T21:30:00.000Z' },
  { id: 46, tanggal: '2026-03-25', jenis: 'keluar', kategori: 'Renovasi', deskripsi: 'Pembelian semen dan besi untuk renovasi', jumlah: 4500000, metode_pembayaran: 'transfer', penerima: 'Toko Bangunan Jaya', no_ref: 'TRF-20260325-001', catatan: '20 sak semen, 50 batang besi', status: 'confirmed', bukti_path: null, created_by: 2, created_at: '2026-03-25T10:00:00.000Z', updated_at: '2026-03-25T10:00:00.000Z' },
  { id: 47, tanggal: '2026-03-22', jenis: 'masuk', kategori: 'Kas Jumat', deskripsi: 'Infaq Jumat minggu ketiga Maret', jumlah: 2650000, metode_pembayaran: 'cash', penerima: '', no_ref: '', catatan: '', status: 'confirmed', bukti_path: null, created_by: 2, created_at: '2026-03-22T13:00:00.000Z', updated_at: '2026-03-22T13:00:00.000Z' },
  { id: 48, tanggal: '2026-03-18', jenis: 'keluar', kategori: 'Listrik & Air', deskripsi: 'Tagihan listrik Maret', jumlah: 1580000, metode_pembayaran: 'transfer', penerima: 'PLN', no_ref: 'TRF-20260318-001', catatan: '', status: 'confirmed', bukti_path: null, created_by: 2, created_at: '2026-03-18T10:00:00.000Z', updated_at: '2026-03-18T10:00:00.000Z' },
  { id: 49, tanggal: '2026-03-15', jenis: 'masuk', kategori: 'Zakat', deskripsi: 'Zakat mal dari beberapa jamaah', jumlah: 12000000, metode_pembayaran: 'transfer', penerima: '4 orang zakat mal', no_ref: 'TRF-20260315-001', catatan: 'Distribusi ke 8 mustahik', status: 'confirmed', bukti_path: null, created_by: 2, created_at: '2026-03-15T14:00:00.000Z', updated_at: '2026-03-15T14:00:00.000Z' },
  { id: 50, tanggal: '2026-03-10', jenis: 'keluar', kategori: 'Gaji/Insentif', deskripsi: 'Insentif marbot bulan Maret', jumlah: 1500000, metode_pembayaran: 'transfer', penerima: 'Pak Hasan', no_ref: 'TRF-20260310-001', catatan: '', status: 'confirmed', bukti_path: null, created_by: 2, created_at: '2026-03-10T10:00:00.000Z', updated_at: '2026-03-10T10:00:00.000Z' },
];

// ─── AGENDA ───────────────────────────────────────────
const agenda = [
  { id: 1, judul: 'Kajian Akbar Ramadan', tanggal: dateStr(-5), jam_mulai: '20:00', jam_selesai: '22:00', deskripsi: 'Kajian akbar bulan Ramadan bersama Ustadz Adi Hidayat', lokasi: 'Aula Utama Masjid', is_published: 1, created_at: ts(15), updated_at: ts(15) },
  { id: 2, judul: 'Bakti Sosial Ramadan', tanggal: dateStr(-10), jam_mulai: '08:00', jam_selesai: '12:00', deskripsi: 'Pembagian sembako untuk warga kurang mampu', lokasi: 'Halaman Masjid', is_published: 1, created_at: ts(20), updated_at: ts(20) },
  { id: 3, judul: 'Tadarus Al-Qur\'an', tanggal: dateStr(1), jam_mulai: '21:00', jam_selesai: '22:30', deskripsi: 'Tadarus rutin setiap malam', lokasi: 'Ruang Utama', is_published: 1, created_at: ts(10), updated_at: ts(10) },
  { id: 4, judul: 'Peringatan Isra Mi\'raj', tanggal: dateStr(5), jam_mulai: '19:00', jam_selesai: '21:30', deskripsi: 'Peringatan Isra Mi\'raj Nabi Muhammad SAW', lokasi: 'Aula Utama', is_published: 1, created_at: ts(8), updated_at: ts(8) },
  { id: 5, judul: 'Meeting Takmir', tanggal: dateStr(3), jam_mulai: '14:00', jam_selesai: '16:00', deskripsi: 'Rapat rutin pengurus takmir bulanan', lokasi: 'Ruang Rapat', is_published: 1, created_at: ts(7), updated_at: ts(7) },
];

// ─── RUNNING TEXT ─────────────────────────────────────
const running_text = [
  { id: 1, teks: 'Selamat datang di Masjid Raudhatul Jannah. Silakan beribadah dengan khusyuk.', is_active: 1, urutan: 1, created_at: ts(90), updated_at: ts(0) },
  { id: 2, teks: 'Jadwal kajian mingguan: Setiap Jumat setelah Sholat Isya.', is_active: 1, urutan: 2, created_at: ts(90), updated_at: ts(90) },
  { id: 3, teks: 'Infaq pembangunan masjid dapat disalurkan melalui kotak infaq atau transfer ke rekening BSI 1234567890 a.n. Masjid Raudhatul Jannah.', is_active: 1, urutan: 3, created_at: ts(30), updated_at: ts(30) },
  { id: 4, teks: 'Program Tahfiz Al-Qur\'an untuk anak-anak usia 7-15 tahun dibuka setiap Selasa dan Kamis pukul 16.00 WIB.', is_active: 1, urutan: 4, created_at: ts(15), updated_at: ts(15) },
  { id: 5, teks: 'Marhaban ya Ramadan! Masjid Raudhatul Jannah mengadakan kajian akbar setiap malam selama Ramadan.', is_active: 1, urutan: 5, created_at: ts(5), updated_at: ts(5) },
];

// ─── LAPORAN ──────────────────────────────────────────
const laporan = [
  { id: 1, judul: 'Renovasi Aula Utama', tanggal: dateStr(5), isi: 'Pekerjaan renovasi aula utama telah selesai 80%. Pemasangan keramik lantai dan pengecatan dinding sedang berlangsung. estimasi penyelesaian akhir bulan ini.', kategori: 'renovasi', is_published: 1, created_at: ts(5), updated_at: ts(5) },
  { id: 2, judul: 'Bakti Sosial Penggilingan Beras', tanggal: dateStr(7), isi: 'Masjid telah menyalurkan 500 kg beras kepada warga kurang mampu di sekitar masjid. Terima kasih atas donasi dari para jamaah.', kategori: 'sosial', is_published: 1, created_at: ts(7), updated_at: ts(7) },
  { id: 3, judul: 'Kajian Tafsir Mingguan', tanggal: dateStr(10), isi: "Kajian tafsir Al-Qur'an mingguan telah berjalan lancar dengan dihadiri 50 jamaah. Tema minggu ini adalah surat Al-Kahfi ayat 60-82.", kategori: 'edukasi', is_published: 1, created_at: ts(10), updated_at: ts(10) },
  { id: 4, judul: 'Perawatan Gedung', tanggal: dateStr(15), isi: 'Pemeliharaan rutin gedung masjid termasuk perbaikan lampu, AC, dan keran air wudhu. Total biaya perawatan bulan ini Rp 1.200.000.', kategori: 'umum', is_published: 1, created_at: ts(15), updated_at: ts(15) },
  { id: 5, judul: 'Program Tahfiz Al-Qur\'an', tanggal: dateStr(20), isi: 'Program Tahfiz untuk anak-anak telah memasuki minggu ke-8. 15 peserta aktif menghafal Juz 30. Prestasi terbaik diraih oleh Muhammad Fauzi (hafal 5 surat).', kategori: 'edukasi', is_published: 1, created_at: ts(20), updated_at: ts(20) },
  { id: 6, judul: 'Pembangunan Tempat Wudhu', tanggal: dateStr(25), isi: 'Pembangunan tempat wudhu baru telah dimulai. Kontraktor yang ditunjuk adalah PT. Konstruksi Jaya. Estimasi biaya Rp 25.000.000 dan selesai dalam 2 bulan.', kategori: 'renovasi', is_published: 1, created_at: ts(25), updated_at: ts(25) },
];

// ─── AUDIT LOG ────────────────────────────────────────
const audit_log = [
  { id: 1, user_id: 2, action: 'CREATE', table_name: 'keuangan', record_id: 1, new_value: '{"keterangan":"Infaq harian Subuh"}', created_at: ts(0), updated_at: ts(0) },
  { id: 2, user_id: 2, action: 'CREATE', table_name: 'keuangan', record_id: 2, new_value: '{"keterangan":"Kas Jumat Juli"}', created_at: ts(1), updated_at: ts(1) },
  { id: 3, user_id: 2, action: 'UPDATE', table_name: 'keuangan', record_id: 3, old_value: '{"status":"pending"}', new_value: '{"status":"confirmed"}', created_at: ts(2), updated_at: ts(2) },
];

// ─── ASSEMBLE DATABASE ────────────────────────────────
const db = {
  users,
  settings,
  jadwal_sholat,
  kajian,
  keuangan,
  agenda,
  running_text,
  laporan,
  audit_log,
};

fs.writeFileSync(dbPath, JSON.stringify(db, null, 2));
console.log(`\n✓ Database seeded successfully!`);
console.log(`  → ${users.length} users`);
console.log(`  → ${settings.length} settings`);
console.log(`  → ${jadwal_sholat.length} jadwal sholat`);
console.log(`  → ${kajian.length} kajian`);
console.log(`  → ${keuangan.length} transaksi keuangan`);
console.log(`  → ${agenda.length} agenda`);
console.log(`  → ${running_text.length} running text`);
console.log(`  → ${laporan.length} laporan`);
console.log(`  → ${audit_log.length} audit log entries`);
console.log(`\n  File: ${dbPath}\n`);
