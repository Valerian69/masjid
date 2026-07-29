const bcrypt = require('bcryptjs');
require('dotenv').config({ path: require('path').join(__dirname, '..', '.env') });
const { dbHelpers } = require('../database');

async function seed() {
  console.log('🌱 Seeding database via Supabase...\n');

  try {
    // Check if data already exists
    const existingUsers = await dbHelpers.findAll('users');
    if (existingUsers.length > 0) {
      console.log('⚠️  Database already has data. Skipping seed.');
      console.log('   To re-seed, first clear all tables in Supabase SQL Editor.');
      process.exit(0);
    }

    // 1. Users
    console.log('👤 Creating users...');
    const hashedPassword = bcrypt.hashSync('admin123', 10);
    await dbHelpers.insert('users', { username: 'admin', password: hashedPassword, full_name: 'Super Admin', role: 'superadmin' });
    await dbHelpers.insert('users', { username: 'bendahara', password: hashedPassword, full_name: 'Bendahara Masjid', role: 'bendahara' });
    await dbHelpers.insert('users', { username: 'takmir', password: hashedPassword, full_name: 'Takmir Masjid', role: 'takmir' });
    await dbHelpers.insert('users', { username: 'marbot', password: hashedPassword, full_name: 'Marbot Masjid', role: 'marbot' });
    console.log('   ✅ 4 users created');

    // 2. Settings
    console.log('⚙️  Creating settings...');
    const settings = [
      { key: 'masjid_name', value: 'Masjid Raudhatul Jannah' },
      { key: 'masjid_address', value: 'Jl. Raya Penggilingan No.12, Jakarta Timur' },
      { key: 'latitude', value: '-6.1857' },
      { key: 'longitude', value: '106.9369' },
      { key: 'timezone', value: 'Asia/Jakarta' },
      { key: 'provinsi', value: 'DKI Jakarta' },
      { key: 'kabkota', value: 'Kota Administrasi Jakarta Timur' },
    ];
    for (const s of settings) {
      await dbHelpers.insert('settings', s);
    }
    console.log('   ✅ 7 settings created');

    // 3. Jadwal Sholat
    console.log('🕌 Creating jadwal sholat...');
    const jadwal = [
      { nama_sholat: 'Imsak', waktu: '04:35', is_active: true },
      { nama_sholat: 'Subuh', waktu: '04:45', is_active: true },
      { nama_sholat: 'Terbit', waktu: '06:00', is_active: true },
      { nama_sholat: 'Dhuha', waktu: '06:29', is_active: true },
      { nama_sholat: 'Dzuhur', waktu: '12:02', is_active: true },
      { nama_sholat: 'Ashar', waktu: '15:23', is_active: true },
      { nama_sholat: 'Maghrib', waktu: '17:57', is_active: true },
      { nama_sholat: 'Isya', waktu: '19:09', is_active: true },
    ];
    for (const j of jadwal) {
      await dbHelpers.insert('jadwal_sholat', j);
    }
    console.log('   ✅ 8 jadwal sholat created');

    // 4. Kajian
    console.log('📚 Creating kajian...');
    const kajian = [
      { judul: 'Tafsir Al-Misbah', ustadz: 'Ustadz Ahmad Hidayat', tanggal: '2026-08-04', jam_mulai: '19:30', jam_selesai: '21:00', deskripsi: 'Kajian tafsir mingguan', is_recurring: true, recurring_day: 'Senin' },
      { judul: 'Hadits Shahih', ustadz: 'Ustadz Muhammad Fauzi', tanggal: '2026-08-05', jam_mulai: '09:00', jam_selesai: '10:30', deskripsi: 'Pembahasan hadits shahih Bukhari-Muslim', is_recurring: true, recurring_day: 'Selasa' },
      { judul: 'Fiqh Muamalah', ustadz: 'Ustadz Dr. Abdullah', tanggal: '2026-08-06', jam_mulai: '19:30', jam_selesai: '21:00', deskripsi: 'Kajian fiqh ekonomi syariah', is_recurring: true, recurring_day: 'Rabu' },
      { judul: 'Al-Qur\'an & Sains', ustadz: 'Ustadz H. Hasan', tanggal: '2026-08-07', jam_mulai: '09:00', jam_selesai: '10:30', deskripsi: 'Kajian ilmu alam dan Al-Qur\'an', is_recurring: true, recurring_day: 'Kamis' },
      { judul: 'Tafsir Ayat Akhir Zaman', ustadz: 'Ustadz Ahmad Hidayat', tanggal: '2026-08-08', jam_mulai: '19:30', jam_selesai: '21:00', deskripsi: 'Tafsir ayat-ayat kauniyah', is_recurring: true, recurring_day: 'Jumat' },
      { judul: 'Sirah Nabawiyah', ustadz: 'Ustadz Muhammad Fauzi', tanggal: '2026-08-09', jam_mulai: '07:00', jam_selesai: '08:30', deskripsi: 'Kajian sejarah Rasulullah SAW', is_recurring: true, recurring_day: 'Sabtu' },
      { judul: 'Kajian Akbar Bulanan', ustadz: 'Ustadz KH. Abdullah Gymnastiar', tanggal: '2026-08-15', jam_mulai: '19:00', jam_selesai: '21:30', deskripsi: 'Kajian akbar bulanan bersama Aa Gym', is_recurring: false, recurring_day: null },
      { judul: 'Tafsir Al-Misbah', ustadz: 'Ustadz Ahmad Hidayat', tanggal: '2026-08-11', jam_mulai: '19:30', jam_selesai: '21:00', deskripsi: 'Kajian tafsir mingguan', is_recurring: true, recurring_day: 'Senin' },
    ];
    for (const k of kajian) {
      await dbHelpers.insert('kajian', k);
    }
    console.log('   ✅ 8 kajian created');

    // 5. Keuangan (50 transactions spanning 6 months)
    console.log('💰 Creating keuangan (50 transactions)...');
    const keuanganData = [
      // July 2026
      { tanggal: '2026-07-01', jenis: 'masuk', kategori: 'Infaq', deskripsi: 'Infaq harian jamaah', jumlah: 2500000, metode_pembayaran: 'cash', penerima: '', no_ref: '', catatan: 'Infaq rutin', status: 'confirmed' },
      { tanggal: '2026-07-02', jenis: 'masuk', kategori: 'Donasi', deskripsi: 'Donasi dari PT Maju Jaya', jumlah: 10000000, metode_pembayaran: 'transfer', penerima: '', no_ref: 'TRF-001', catatan: 'Donasi pembangunan', status: 'confirmed' },
      { tanggal: '2026-07-03', jenis: 'keluar', kategori: 'Operasional', deskripsi: 'Biaya listrik bulanan', jumlah: 3500000, metode_pembayaran: 'transfer', penerima: 'PLN', no_ref: 'PLN-0726', catatan: 'Tagihan Juli', status: 'confirmed' },
      { tanggal: '2026-07-05', jenis: 'masuk', kategori: 'Sedekah', deskripsi: 'Sedekah dari jamaah', jumlah: 1500000, metode_pembayaran: 'cash', penerima: '', no_ref: '', catatan: '', status: 'confirmed' },
      { tanggal: '2026-07-07', jenis: 'masuk', kategori: 'Kas Jumat', deskripsi: 'Kotak infaq Jumat', jumlah: 8500000, metode_pembayaran: 'cash', penerima: '', no_ref: '', catatan: '', status: 'confirmed' },
      { tanggal: '2026-07-08', jenis: 'keluar', kategori: 'Gaji/Insentif', deskripsi: 'Insentif marbot', jumlah: 3000000, metode_pembayaran: 'transfer', penerima: 'Pak Hasan', no_ref: '', catatan: 'Gaji bulanan', status: 'confirmed' },
      { tanggal: '2026-07-10', jenis: 'masuk', kategori: 'Infaq', deskripsi: 'Infaq harian', jumlah: 1800000, metode_pembayaran: 'cash', penerima: '', no_ref: '', catatan: '', status: 'confirmed' },
      { tanggal: '2026-07-12', jenis: 'keluar', kategori: 'Pemeliharaan', deskripsi: 'Perbaikan AC masjid', jumlah: 2500000, metode_pembayaran: 'transfer', penerima: 'Teknik Jaya', no_ref: 'TRF-002', catatan: 'AC rusak', status: 'confirmed' },
      { tanggal: '2026-07-14', jenis: 'masuk', kategori: 'Donasi', deskripsi: 'Donasi warga', jumlah: 5000000, metode_pembayaran: 'transfer', penerima: '', no_ref: 'TRF-003', catatan: '', status: 'confirmed' },
      { tanggal: '2026-07-15', jenis: 'masuk', kategori: 'Kas Jumat', deskripsi: 'Kotak infaq Jumat', jumlah: 9200000, metode_pembayaran: 'cash', penerima: '', no_ref: '', catatan: '', status: 'confirmed' },
      { tanggal: '2026-07-17', jenis: 'keluar', kategori: 'Beli Barang', deskripsi: 'Pembelian karpet baru', jumlah: 15000000, metode_pembayaran: 'transfer', penerima: 'Toko Karpet Indah', no_ref: 'TRF-004', catatan: 'Karpet sajadah', status: 'confirmed' },
      { tanggal: '2026-07-18', jenis: 'masuk', kategori: 'Infaq', deskripsi: 'Infaq harian', jumlah: 2200000, metode_pembayaran: 'cash', penerima: '', no_ref: '', catatan: '', status: 'confirmed' },
      { tanggal: '2026-07-19', jenis: 'keluar', kategori: 'Listrik & Air', deskripsi: 'Tagihan air PDAM', jumlah: 800000, metode_pembayaran: 'transfer', penerima: 'PDAM', no_ref: 'PDAM-0726', catatan: '', status: 'confirmed' },
      { tanggal: '2026-07-20', jenis: 'masuk', kategori: 'Sedekah', deskripsi: 'Sedekah dari Bapak rahmat', jumlah: 3000000, metode_pembayaran: 'cash', penerima: '', no_ref: '', catatan: '', status: 'confirmed' },
      { tanggal: '2026-07-21', jenis: 'masuk', kategori: 'Kas Jumat', deskripsi: 'Kotak infaq Jumat', jumlah: 7800000, metode_pembayaran: 'cash', penerima: '', no_ref: '', catatan: '', status: 'confirmed' },
      { tanggal: '2026-07-22', jenis: 'keluar', kategori: 'Sosial', deskripsi: 'Bantuan warga terdampak banjir', jumlah: 5000000, metode_pembayaran: 'cash', penerima: 'Warga Rt 05', no_ref: '', catatan: '', status: 'confirmed' },
      { tanggal: '2026-07-24', jenis: 'masuk', kategori: 'Infaq', deskripsi: 'Infaq harian', jumlah: 1900000, metode_pembayaran: 'cash', penerima: '', no_ref: '', catatan: '', status: 'confirmed' },
      { tanggal: '2026-07-25', jenis: 'keluar', kategori: 'Operasional', deskripsi: 'Biaya kebersihan', jumlah: 1200000, metode_pembayaran: 'cash', penerima: 'Bu Siti', no_ref: '', catatan: '', status: 'confirmed' },
      { tanggal: '2026-07-26', jenis: 'masuk', kategori: 'Donasi', deskripsi: 'Donasi dari Bapak Ahmad', jumlah: 2000000, metode_pembayaran: 'e-wallet', penerima: '', no_ref: 'GOPAY-001', catatan: '', status: 'confirmed' },
      { tanggal: '2026-07-27', jenis: 'masuk', kategori: 'Kas Jumat', deskripsi: 'Kotak infaq Jumat', jumlah: 8800000, metode_pembayaran: 'cash', penerima: '', no_ref: '', catatan: '', status: 'confirmed' },
      // June 2026
      { tanggal: '2026-06-01', jenis: 'masuk', kategori: 'Infaq', deskripsi: 'Infaq harian', jumlah: 2100000, metode_pembayaran: 'cash', penerima: '', no_ref: '', catatan: '', status: 'confirmed' },
      { tanggal: '2026-06-05', jenis: 'masuk', kategori: 'Kas Jumat', deskripsi: 'Kotak infaq Jumat', jumlah: 7500000, metode_pembayaran: 'cash', penerima: '', no_ref: '', catatan: '', status: 'confirmed' },
      { tanggal: '2026-06-07', jenis: 'keluar', kategori: 'Operasional', deskripsi: 'Listrik bulanan', jumlah: 3200000, metode_pembayaran: 'transfer', penerima: 'PLN', no_ref: 'PLN-0626', catatan: '', status: 'confirmed' },
      { tanggal: '2026-06-10', jenis: 'masuk', kategori: 'Donasi', deskripsi: 'Donasi dari PT Sejahtera', jumlah: 8000000, metode_pembayaran: 'transfer', penerima: '', no_ref: 'TRF-005', catatan: '', status: 'confirmed' },
      { tanggal: '2026-06-12', jenis: 'keluar', kategori: 'Gaji/Insentif', deskripsi: 'Insentif marbot', jumlah: 3000000, metode_pembayaran: 'transfer', penerima: 'Pak Hasan', no_ref: '', catatan: '', status: 'confirmed' },
      { tanggal: '2026-06-14', jenis: 'masuk', kategori: 'Kas Jumat', deskripsi: 'Kotak infaq Jumat', jumlah: 8200000, metode_pembayaran: 'cash', penerima: '', no_ref: '', catatan: '', status: 'confirmed' },
      { tanggal: '2026-06-18', jenis: 'masuk', kategori: 'Sedekah', deskripsi: 'Sedekah dari jamaah', jumlah: 1800000, metode_pembayaran: 'cash', penerima: '', no_ref: '', catatan: '', status: 'confirmed' },
      { tanggal: '2026-06-20', jenis: 'keluar', kategori: 'Pemeliharaan', deskripsi: 'Perbaikan toilet', jumlah: 4500000, metode_pembayaran: 'transfer', penerima: 'Tukang Budi', no_ref: 'TRF-006', catatan: '', status: 'confirmed' },
      { tanggal: '2026-06-22', jenis: 'masuk', kategori: 'Infaq', deskripsi: 'Infaq harian', jumlah: 2300000, metode_pembayaran: 'cash', penerima: '', no_ref: '', catatan: '', status: 'confirmed' },
      { tanggal: '2026-06-25', jenis: 'keluar', kategori: 'Listrik & Air', deskripsi: 'Tagihan air', jumlah: 750000, metode_pembayaran: 'transfer', penerima: 'PDAM', no_ref: 'PDAM-0626', catatan: '', status: 'confirmed' },
      // May 2026
      { tanggal: '2026-05-02', jenis: 'masuk', kategori: 'Kas Jumat', deskripsi: 'Kotak infaq Jumat', jumlah: 7000000, metode_pembayaran: 'cash', penerima: '', no_ref: '', catatan: '', status: 'confirmed' },
      { tanggal: '2026-05-05', jenis: 'masuk', kategori: 'Infaq', deskripsi: 'Infaq harian', jumlah: 2000000, metode_pembayaran: 'cash', penerima: '', no_ref: '', catatan: '', status: 'confirmed' },
      { tanggal: '2026-05-08', jenis: 'keluar', kategori: 'Operasional', deskripsi: 'Listrik', jumlah: 3100000, metode_pembayaran: 'transfer', penerima: 'PLN', no_ref: 'PLN-0526', catatan: '', status: 'confirmed' },
      { tanggal: '2026-05-10', jenis: 'masuk', kategori: 'Donasi', deskripsi: 'Donasi dari Bapak Ridwan', jumlah: 4000000, metode_pembayaran: 'transfer', penerima: '', no_ref: 'TRF-007', catatan: '', status: 'confirmed' },
      { tanggal: '2026-05-12', jenis: 'keluar', kategori: 'Gaji/Insentif', deskripsi: 'Insentif marbot', jumlah: 3000000, metode_pembayaran: 'transfer', penerima: 'Pak Hasan', no_ref: '', catatan: '', status: 'confirmed' },
      { tanggal: '2026-05-15', jenis: 'masuk', kategori: 'Kas Jumat', deskripsi: 'Kotak infaq Jumat', jumlah: 7800000, metode_pembayaran: 'cash', penerima: '', no_ref: '', catatan: '', status: 'confirmed' },
      { tanggal: '2026-05-20', jenis: 'keluar', kategori: 'Sosial', deskripsi: 'Bantuan anak yatim', jumlah: 3000000, metode_pembayaran: 'cash', penerima: 'Panti Asuhan', no_ref: '', catatan: '', status: 'confirmed' },
      { tanggal: '2026-05-25', jenis: 'masuk', kategori: 'Sedekah', deskripsi: 'Sedekah dari jamaah', jumlah: 1600000, metode_pembayaran: 'cash', penerima: '', no_ref: '', catatan: '', status: 'confirmed' },
      // April 2026
      { tanggal: '2026-04-03', jenis: 'masuk', kategori: 'Kas Jumat', deskripsi: 'Kotak infaq Jumat', jumlah: 6800000, metode_pembayaran: 'cash', penerima: '', no_ref: '', catatan: '', status: 'confirmed' },
      { tanggal: '2026-04-07', jenis: 'keluar', kategori: 'Operasional', deskripsi: 'Listrik', jumlah: 3000000, metode_pembayaran: 'transfer', penerima: 'PLN', no_ref: 'PLN-0426', catatan: '', status: 'confirmed' },
      { tanggal: '2026-04-10', jenis: 'masuk', kategori: 'Infaq', deskripsi: 'Infaq Ramadhan', jumlah: 15000000, metode_pembayaran: 'transfer', penerima: '', no_ref: 'TRF-008', catatan: 'Infaq khusus Ramadhan', status: 'confirmed' },
      { tanggal: '2026-04-12', jenis: 'keluar', kategori: 'Gaji/Insentif', deskripsi: 'Insentif marbot', jumlah: 3000000, metode_pembayaran: 'transfer', penerima: 'Pak Hasan', no_ref: '', catatan: '', status: 'confirmed' },
      { tanggal: '2026-04-15', jenis: 'masuk', kategori: 'Kas Jumat', deskripsi: 'Kotak infaq Jumat', jumlah: 12000000, metode_pembayaran: 'cash', penerima: '', no_ref: '', catatan: 'Jumat berkah', status: 'confirmed' },
      { tanggal: '2026-04-20', jenis: 'keluar', kategori: 'Renovasi', deskripsi: 'Renovasi menara masjid', jumlah: 25000000, metode_pembayaran: 'transfer', penerima: 'CV Bangun Jaya', no_ref: 'TRF-009', catatan: '', status: 'confirmed' },
      // March 2026
      { tanggal: '2026-03-05', jenis: 'masuk', kategori: 'Kas Jumat', deskripsi: 'Kotak infaq Jumat', jumlah: 6500000, metode_pembayaran: 'cash', penerima: '', no_ref: '', catatan: '', status: 'confirmed' },
      { tanggal: '2026-03-10', jenis: 'keluar', kategori: 'Operasional', deskripsi: 'Listrik', jumlah: 2900000, metode_pembayaran: 'transfer', penerima: 'PLN', no_ref: 'PLN-0326', catatan: '', status: 'confirmed' },
      { tanggal: '2026-03-15', jenis: 'masuk', kategori: 'Donasi', deskripsi: 'Donasi dari Bapak Surya', jumlah: 7000000, metode_pembayaran: 'transfer', penerima: '', no_ref: 'TRF-010', catatan: '', status: 'confirmed' },
      { tanggal: '2026-03-20', jenis: 'keluar', kategori: 'Gaji/Insentif', deskripsi: 'Insentif marbot', jumlah: 3000000, metode_pembayaran: 'transfer', penerima: 'Pak Hasan', no_ref: '', catatan: '', status: 'confirmed' },
      { tanggal: '2026-03-25', jenis: 'masuk', kategori: 'Sedekah', deskripsi: 'Sedekah dari jamaah', jumlah: 1400000, metode_pembayaran: 'cash', penerima: '', no_ref: '', catatan: '', status: 'confirmed' },
      // August 2026 (future)
      { tanggal: '2026-08-01', jenis: 'masuk', kategori: 'Infaq', deskripsi: 'Infaq harian', jumlah: 2600000, metode_pembayaran: 'cash', penerima: '', no_ref: '', catatan: '', status: 'confirmed' },
      { tanggal: '2026-08-03', jenis: 'masuk', kategori: 'Kas Jumat', deskripsi: 'Kotak infaq Jumat', jumlah: 9000000, metode_pembayaran: 'cash', penerima: '', no_ref: '', catatan: '', status: 'confirmed' },
    ];
    for (const k of keuanganData) {
      await dbHelpers.insert('keuangan', k);
    }
    console.log('   ✅ 50 keuangan transactions created');

    // 6. Agenda
    console.log('📅 Creating agenda...');
    const agenda = [
      { judul: 'Kajian Akbar Bulanan', tanggal: '2026-08-15', jam_mulai: '19:00', jam_selesai: '21:30', deskripsi: 'Kajian akbar bersama Ustadz KH. Abdullah Gymnastiar', lokasi: 'Aula Utama', is_published: true },
      { judul: 'Bakti Sosial', tanggal: '2026-08-20', jam_mulai: '08:00', jam_selesai: '12:00', deskripsi: 'Pembagian sembako untuk warga kurang mampu', lokasi: 'Halaman Masjid', is_published: true },
      { judul: 'Pengajian Ibu-ibu', tanggal: '2026-08-06', jam_mulai: '09:00', jam_selesai: '11:00', deskripsi: 'Pengajian rutin ibu-ibu setiap Kamis', lokasi: 'Aula Masjid', is_published: true },
      { judul: 'Training Al-Qur\'an', tanggal: '2026-08-10', jam_mulai: '15:00', jam_selesai: '17:00', deskripsi: 'Pelatihan membaca Al-Qur\'an untuk pemula', lokasi: 'Ruang Kelas', is_published: true },
      { judul: 'Tausiyah Ramadhan', tanggal: '2026-09-15', jam_mulai: '16:30', jam_selesai: '18:00', deskripsi: 'Tausiyah menjelang waktu berbuka', lokasi: 'Aula Utama', is_published: true },
    ];
    for (const a of agenda) {
      await dbHelpers.insert('agenda', a);
    }
    console.log('   ✅ 5 agenda created');

    // 7. Running Text
    console.log('📜 Creating running text...');
    const runningText = [
      { teks: '★ Selamat datang di Masjid Raudhatul Jannah. Silakan beribadah dengan khusyuk.', is_active: true, urutan: 1 },
      { teks: '★ Infaq pembangunan masjid dapat disalurkan melalui kotak infaq atau transfer ke rekening BSI 1234567890.', is_active: true, urutan: 2 },
      { teks: '★ Program Tahfiz Al-Qur\'an untuk anak-anak dibuka setiap Selasa dan Kamis. Info: 0812xxxxxxx', is_active: true, urutan: 3 },
      { teks: '★ Mari jaga kebersihan masjid. Buang sampah pada tempatnya.', is_active: true, urutan: 4 },
      { teks: '★ Kajian Tafsir Al-Misbah setiap Senin setelah Sholat Isya. Mari hadir berjamaah.', is_active: true, urutan: 5 },
    ];
    for (const rt of runningText) {
      await dbHelpers.insert('running_text', rt);
    }
    console.log('   ✅ 5 running text created');

    // 8. Laporan
    console.log('📋 Creating laporan...');
    const laporan = [
      { judul: 'Renovasi Aula Utama', tanggal: '2026-07-20', isi: 'Pekerjaan renovasi aula utama telah selesai 80%. Pemasangan keramik lantai dan pengecatan dinding sedang berlangsung. Diperkirakan akan selesai pada akhir bulan Juli 2026. Terima kasih atas donasi dari para jamaah yang telah mendukung program renovasi ini.', kategori: 'renovasi', is_published: true },
      { judul: 'Bakti Sosial Penggilingan Beras', tanggal: '2026-07-18', isi: 'Masjid telah menyalurkan 500 kg beras kepada warga kurang mampu di sekitar masjid. Bantuan ini bersumber dari dana sosial masjid dan donasi dari para jamaah. Semoga bermanfaat bagi yang membutuhkan.', kategori: 'sosial', is_published: true },
      { judul: 'Kajian Tafsir Mingguan', tanggal: '2026-07-15', isi: "Kajian tafsir Al-Qur'an mingguan telah berjalan lancar dengan dihadiri 50 jamaah. Kajian dipimpin oleh Ustadz Ahmad Hidayat membahas Surah Al-Kahfi ayat 1-10. Mari hadir setiap Senin malam.", kategori: 'edukasi', is_published: true },
      { judul: 'Perawatan Gedung', tanggal: '2026-07-10', isi: 'Pemeliharaan rutin gedung masjid termasuk perbaikan lampu dan AC. Telah diganti 5 lampu LED dan 2 unit AC yang rusak. Biaya perawatan bulanan mencakup kebersihan dan utilitas.', kategori: 'umum', is_published: true },
      { judul: 'Pembangunan Menara', tanggal: '2026-06-28', isi: 'Pembangunan menara masjid telah memasuki tahap penyelesaian struktur beton. Tahap selanjutnya adalah pemasangan kubah dan finishing. Total biaya pembangunan menara sebesar Rp 250.000.000.', kategori: 'renovasi', is_published: true },
      { judul: 'Program Tahfiz', tanggal: '2026-06-20', isi: 'Program Tahfiz Al-Qur\'an untuk anak-anak telah dimulai dengan 15 peserta. Pembelajaran dilaksanakan setiap Selasa dan Kamis sore. Para ustadz/ustadzah yang mengajar adalah relawan dari komunitas Tahfiz setempat.', kategori: 'edukasi', is_published: true },
    ];
    for (const l of laporan) {
      await dbHelpers.insert('laporan', l);
    }
    console.log('   ✅ 6 laporan created');

    // 9. Audit Log
    console.log('📝 Creating audit log...');
    await dbHelpers.insert('audit_log', { user_id: null, action: 'SEED', table_name: 'system', record_id: null, old_value: null, new_value: JSON.stringify({ message: 'Database seeded via Supabase' }) });
    console.log('   ✅ 1 audit log created');

    console.log('\n✅ Seed completed successfully!');
    console.log('   Total: 4 users, 7 settings, 8 jadwal, 8 kajian, 50 keuangan, 5 agenda, 5 running text, 6 laporan\n');
    process.exit(0);
  } catch (err) {
    console.error('❌ Seed failed:', err.message);
    console.error(err);
    process.exit(1);
  }
}

seed();
