-- ============================================
-- Masjid Dashboard - Seed Data
-- Run AFTER schema.sql in Supabase SQL Editor
-- Password for all users: admin123
-- ============================================

-- 1. Users (password: admin123)
INSERT INTO users (username, password, full_name, role) VALUES
  ('admin', '$2a$10$rZfjGeQqp6pP3WXtlSMrkOui/dFt//T6uExqWm/PQKTQsL3ldQpf6', 'Super Admin', 'superadmin'),
  ('bendahara', '$2a$10$rZfjGeQqp6pP3WXtlSMrkOui/dFt//T6uExqWm/PQKTQsL3ldQpf6', 'Bendahara Masjid', 'bendahara'),
  ('takmir', '$2a$10$rZfjGeQqp6pP3WXtlSMrkOui/dFt//T6uExqWm/PQKTQsL3ldQpf6', 'Takmir Masjid', 'takmir'),
  ('marbot', '$2a$10$rZfjGeQqp6pP3WXtlSMrkOui/dFt//T6uExqWm/PQKTQsL3ldQpf6', 'Marbot Masjid', 'marbot');

-- 2. Settings
INSERT INTO settings (key, value) VALUES
  ('masjid_name', 'Masjid Raudhatul Jannah'),
  ('masjid_address', 'Jl. Raya Penggilingan No.12, Jakarta Timur'),
  ('latitude', '-6.1857'),
  ('longitude', '106.9369'),
  ('timezone', 'Asia/Jakarta'),
  ('provinsi', 'DKI Jakarta'),
  ('kabkota', 'Kota Administrasi Jakarta Timur');

-- 3. Jadwal Sholat
INSERT INTO jadwal_sholat (nama_sholat, waktu, is_active) VALUES
  ('Imsak', '04:35', true),
  ('Subuh', '04:45', true),
  ('Terbit', '06:00', true),
  ('Dhuha', '06:29', true),
  ('Dzuhur', '12:02', true),
  ('Ashar', '15:23', true),
  ('Maghrib', '17:57', true),
  ('Isya', '19:09', true);

-- 4. Kajian
INSERT INTO kajian (judul, ustadz, tanggal, jam_mulai, jam_selesai, deskripsi, is_recurring, recurring_day) VALUES
  ('Tafsir Al-Misbah', 'Ustadz Ahmad Hidayat', '2026-08-04', '19:30', '21:00', 'Kajian tafsir mingguan', true, 'Senin'),
  ('Hadits Shahih', 'Ustadz Muhammad Fauzi', '2026-08-05', '09:00', '10:30', 'Pembahasan hadits shahih Bukhari-Muslim', true, 'Selasa'),
  ('Fiqh Muamalah', 'Ustadz Dr. Abdullah', '2026-08-06', '19:30', '21:00', 'Kajian fiqh ekonomi syariah', true, 'Rabu'),
  ('Al-Qur''an & Sains', 'Ustadz H. Hasan', '2026-08-07', '09:00', '10:30', 'Kajian ilmu alam dan Al-Qur''an', true, 'Kamis'),
  ('Tafsir Ayat Akhir Zaman', 'Ustadz Ahmad Hidayat', '2026-08-08', '19:30', '21:00', 'Tafsir ayat-ayat kauniyah', true, 'Jumat'),
  ('Sirah Nabawiyah', 'Ustadz Muhammad Fauzi', '2026-08-09', '07:00', '08:30', 'Kajian sejarah Rasulullah SAW', true, 'Sabtu'),
  ('Kajian Akbar Bulanan', 'Ustadz KH. Abdullah Gymnastiar', '2026-08-15', '19:00', '21:30', 'Kajian akbar bulanan bersama Aa Gym', false, NULL),
  ('Tafsir Al-Misbah', 'Ustadz Ahmad Hidayat', '2026-08-11', '19:30', '21:00', 'Kajian tafsir mingguan', true, 'Senin');

-- 5. Keuangan (50 transactions spanning 6 months)
INSERT INTO keuangan (tanggal, jenis, kategori, deskripsi, jumlah, metode_pembayaran, penerima, no_ref, catatan, status) VALUES
  -- July 2026
  ('2026-07-01', 'masuk', 'Infaq', 'Infaq harian jamaah', 2500000, 'cash', '', '', 'Infaq rutin', 'confirmed'),
  ('2026-07-02', 'masuk', 'Donasi', 'Donasi dari PT Maju Jaya', 10000000, 'transfer', '', 'TRF-001', 'Donasi pembangunan', 'confirmed'),
  ('2026-07-03', 'keluar', 'Operasional', 'Biaya listrik bulanan', 3500000, 'transfer', 'PLN', 'PLN-0726', 'Tagihan Juli', 'confirmed'),
  ('2026-07-05', 'masuk', 'Sedekah', 'Sedekah dari jamaah', 1500000, 'cash', '', '', '', 'confirmed'),
  ('2026-07-07', 'masuk', 'Kas Jumat', 'Kotak infaq Jumat', 8500000, 'cash', '', '', '', 'confirmed'),
  ('2026-07-08', 'keluar', 'Gaji/Insentif', 'Insentif marbot', 3000000, 'transfer', 'Pak Hasan', '', 'Gaji bulanan', 'confirmed'),
  ('2026-07-10', 'masuk', 'Infaq', 'Infaq harian', 1800000, 'cash', '', '', '', 'confirmed'),
  ('2026-07-12', 'keluar', 'Pemeliharaan', 'Perbaikan AC masjid', 2500000, 'transfer', 'Teknik Jaya', 'TRF-002', 'AC rusak', 'confirmed'),
  ('2026-07-14', 'masuk', 'Donasi', 'Donasi warga', 5000000, 'transfer', '', 'TRF-003', '', 'confirmed'),
  ('2026-07-15', 'masuk', 'Kas Jumat', 'Kotak infaq Jumat', 9200000, 'cash', '', '', '', 'confirmed'),
  ('2026-07-17', 'keluar', 'Beli Barang', 'Pembelian karpet baru', 15000000, 'transfer', 'Toko Karpet Indah', 'TRF-004', 'Karpet sajadah', 'confirmed'),
  ('2026-07-18', 'masuk', 'Infaq', 'Infaq harian', 2200000, 'cash', '', '', '', 'confirmed'),
  ('2026-07-19', 'keluar', 'Listrik & Air', 'Tagihan air PDAM', 800000, 'transfer', 'PDAM', 'PDAM-0726', '', 'confirmed'),
  ('2026-07-20', 'masuk', 'Sedekah', 'Sedekah dari Bapak Rahmat', 3000000, 'cash', '', '', '', 'confirmed'),
  ('2026-07-21', 'masuk', 'Kas Jumat', 'Kotak infaq Jumat', 7800000, 'cash', '', '', '', 'confirmed'),
  ('2026-07-22', 'keluar', 'Sosial', 'Bantuan warga terdampak banjir', 5000000, 'cash', 'Warga Rt 05', '', '', 'confirmed'),
  ('2026-07-24', 'masuk', 'Infaq', 'Infaq harian', 1900000, 'cash', '', '', '', 'confirmed'),
  ('2026-07-25', 'keluar', 'Operasional', 'Biaya kebersihan', 1200000, 'cash', 'Bu Siti', '', '', 'confirmed'),
  ('2026-07-26', 'masuk', 'Donasi', 'Donasi dari Bapak Ahmad', 2000000, 'e-wallet', '', 'GOPAY-001', '', 'confirmed'),
  ('2026-07-27', 'masuk', 'Kas Jumat', 'Kotak infaq Jumat', 8800000, 'cash', '', '', '', 'confirmed'),
  -- June 2026
  ('2026-06-01', 'masuk', 'Infaq', 'Infaq harian', 2100000, 'cash', '', '', '', 'confirmed'),
  ('2026-06-05', 'masuk', 'Kas Jumat', 'Kotak infaq Jumat', 7500000, 'cash', '', '', '', 'confirmed'),
  ('2026-06-07', 'keluar', 'Operasional', 'Listrik bulanan', 3200000, 'transfer', 'PLN', 'PLN-0626', '', 'confirmed'),
  ('2026-06-10', 'masuk', 'Donasi', 'Donasi dari PT Sejahtera', 8000000, 'transfer', '', 'TRF-005', '', 'confirmed'),
  ('2026-06-12', 'keluar', 'Gaji/Insentif', 'Insentif marbot', 3000000, 'transfer', 'Pak Hasan', '', '', 'confirmed'),
  ('2026-06-14', 'masuk', 'Kas Jumat', 'Kotak infaq Jumat', 8200000, 'cash', '', '', '', 'confirmed'),
  ('2026-06-18', 'masuk', 'Sedekah', 'Sedekah dari jamaah', 1800000, 'cash', '', '', '', 'confirmed'),
  ('2026-06-20', 'keluar', 'Pemeliharaan', 'Perbaikan toilet', 4500000, 'transfer', 'Tukang Budi', 'TRF-006', '', 'confirmed'),
  ('2026-06-22', 'masuk', 'Infaq', 'Infaq harian', 2300000, 'cash', '', '', '', 'confirmed'),
  ('2026-06-25', 'keluar', 'Listrik & Air', 'Tagihan air', 750000, 'transfer', 'PDAM', 'PDAM-0626', '', 'confirmed'),
  -- May 2026
  ('2026-05-02', 'masuk', 'Kas Jumat', 'Kotak infaq Jumat', 7000000, 'cash', '', '', '', 'confirmed'),
  ('2026-05-05', 'masuk', 'Infaq', 'Infaq harian', 2000000, 'cash', '', '', '', 'confirmed'),
  ('2026-05-08', 'keluar', 'Operasional', 'Listrik', 3100000, 'transfer', 'PLN', 'PLN-0526', '', 'confirmed'),
  ('2026-05-10', 'masuk', 'Donasi', 'Donasi dari Bapak Ridwan', 4000000, 'transfer', '', 'TRF-007', '', 'confirmed'),
  ('2026-05-12', 'keluar', 'Gaji/Insentif', 'Insentif marbot', 3000000, 'transfer', 'Pak Hasan', '', '', 'confirmed'),
  ('2026-05-15', 'masuk', 'Kas Jumat', 'Kotak infaq Jumat', 7800000, 'cash', '', '', '', 'confirmed'),
  ('2026-05-20', 'keluar', 'Sosial', 'Bantuan anak yatim', 3000000, 'cash', 'Panti Asuhan', '', '', 'confirmed'),
  ('2026-05-25', 'masuk', 'Sedekah', 'Sedekah dari jamaah', 1600000, 'cash', '', '', '', 'confirmed'),
  -- April 2026
  ('2026-04-03', 'masuk', 'Kas Jumat', 'Kotak infaq Jumat', 6800000, 'cash', '', '', '', 'confirmed'),
  ('2026-04-07', 'keluar', 'Operasional', 'Listrik', 3000000, 'transfer', 'PLN', 'PLN-0426', '', 'confirmed'),
  ('2026-04-10', 'masuk', 'Infaq', 'Infaq Ramadhan', 15000000, 'transfer', '', 'TRF-008', 'Infaq khusus Ramadhan', 'confirmed'),
  ('2026-04-12', 'keluar', 'Gaji/Insentif', 'Insentif marbot', 3000000, 'transfer', 'Pak Hasan', '', '', 'confirmed'),
  ('2026-04-15', 'masuk', 'Kas Jumat', 'Kotak infaq Jumat', 12000000, 'cash', '', '', 'Jumat berkah', 'confirmed'),
  ('2026-04-20', 'keluar', 'Renovasi', 'Renovasi menara masjid', 25000000, 'transfer', 'CV Bangun Jaya', 'TRF-009', '', 'confirmed'),
  -- March 2026
  ('2026-03-05', 'masuk', 'Kas Jumat', 'Kotak infaq Jumat', 6500000, 'cash', '', '', '', 'confirmed'),
  ('2026-03-10', 'keluar', 'Operasional', 'Listrik', 2900000, 'transfer', 'PLN', 'PLN-0326', '', 'confirmed'),
  ('2026-03-15', 'masuk', 'Donasi', 'Donasi dari Bapak Surya', 7000000, 'transfer', '', 'TRF-010', '', 'confirmed'),
  ('2026-03-20', 'keluar', 'Gaji/Insentif', 'Insentif marbot', 3000000, 'transfer', 'Pak Hasan', '', '', 'confirmed'),
  ('2026-03-25', 'masuk', 'Sedekah', 'Sedekah dari jamaah', 1400000, 'cash', '', '', '', 'confirmed'),
  -- August 2026 (future)
  ('2026-08-01', 'masuk', 'Infaq', 'Infaq harian', 2600000, 'cash', '', '', '', 'confirmed'),
  ('2026-08-03', 'masuk', 'Kas Jumat', 'Kotak infaq Jumat', 9000000, 'cash', '', '', '', 'confirmed');

-- 6. Agenda
INSERT INTO agenda (judul, tanggal, jam_mulai, jam_selesai, deskripsi, lokasi, is_published) VALUES
  ('Kajian Akbar Bulanan', '2026-08-15', '19:00', '21:30', 'Kajian akbar bersama Ustadz KH. Abdullah Gymnastiar', 'Aula Utama', true),
  ('Bakti Sosial', '2026-08-20', '08:00', '12:00', 'Pembagian sembako untuk warga kurang mampu', 'Halaman Masjid', true),
  ('Pengajian Ibu-ibu', '2026-08-06', '09:00', '11:00', 'Pengajian rutin ibu-ibu setiap Kamis', 'Aula Masjid', true),
  ('Training Al-Qur''an', '2026-08-10', '15:00', '17:00', 'Pelatihan membaca Al-Qur''an untuk pemula', 'Ruang Kelas', true),
  ('Tausiyah Ramadhan', '2026-09-15', '16:30', '18:00', 'Tausiyah menjelang waktu berbuka', 'Aula Utama', true);

-- 7. Running Text
INSERT INTO running_text (teks, is_active, urutan) VALUES
  ('★ Selamat datang di Masjid Raudhatul Jannah. Silakan beribadah dengan khusyuk.', true, 1),
  ('★ Infaq pembangunan masjid dapat disalurkan melalui kotak infaq atau transfer ke rekening BSI 1234567890.', true, 2),
  ('★ Program Tahfiz Al-Qur''an untuk anak-anak dibuka setiap Selasa dan Kamis. Info: 0812xxxxxxx', true, 3),
  ('★ Mari jaga kebersihan masjid. Buang sampah pada tempatnya.', true, 4),
  ('★ Kajian Tafsir Al-Misbah setiap Senin setelah Sholat Isya. Mari hadir berjamaah.', true, 5);

-- 8. Laporan
INSERT INTO laporan (judul, tanggal, isi, kategori, is_published) VALUES
  ('Renovasi Aula Utama', '2026-07-20', 'Pekerjaan renovasi aula utama telah selesai 80%. Pemasangan keramik lantai dan pengecatan dinding sedang berlangsung. Diperkirakan akan selesai pada akhir bulan Juli 2026. Terima kasih atas donasi dari para jamaah yang telah mendukung program renovasi ini.', 'renovasi', true),
  ('Bakti Sosial Penggilingan Beras', '2026-07-18', 'Masjid telah menyalurkan 500 kg beras kepada warga kurang mampu di sekitar masjid. Bantuan ini bersumber dari dana sosial masjid dan donasi dari para jamaah. Semoga bermanfaat bagi yang membutuhkan.', 'sosial', true),
  ('Kajian Tafsir Mingguan', '2026-07-15', 'Kajian tafsir Al-Qur''an mingguan telah berjalan lancar dengan dihadiri 50 jamaah. Kajian dipimpin oleh Ustadz Ahmad Hidayat membahas Surah Al-Kahfi ayat 1-10. Mari hadir setiap Senin malam.', 'edukasi', true),
  ('Perawatan Gedung', '2026-07-10', 'Pemeliharaan rutin gedung masjid termasuk perbaikan lampu dan AC. Telah diganti 5 lampu LED dan 2 unit AC yang rusak. Biaya perawatan bulanan mencakup kebersihan dan utilitas.', 'umum', true),
  ('Pembangunan Menara', '2026-06-28', 'Pembangunan menara masjid telah memasuki tahap penyelesaian struktur beton. Tahap selanjutnya adalah pemasangan kubah dan finishing. Total biaya pembangunan menara sebesar Rp 250.000.000.', 'renovasi', true),
  ('Program Tahfiz', '2026-06-20', 'Program Tahfiz Al-Qur''an untuk anak-anak telah dimulai dengan 15 peserta. Pembelajaran dilaksanakan setiap Selasa dan Kamis sore. Para ustadz/ustadzah yang mengajar adalah relawan dari komunitas Tahfiz setempat.', 'edukasi', true);
