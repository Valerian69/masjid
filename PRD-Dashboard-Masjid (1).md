# Product Requirement Document (PRD)
## Dashboard Informasi Masjid

**Versi:** 1.0
**Tanggal:** 24 Juli 2026
**Status:** Draft

---

## 1. Latar Belakang

Saat ini pengelolaan informasi masjid (jadwal sholat, kajian, keuangan/kas, dan agenda kegiatan) masih dilakukan secara manual menggunakan Excel/buku catatan. Proses ini rawan human error, sulit diakses jamaah secara real-time, dan menyulitkan pengurus dalam pelaporan serta transparansi keuangan.

Dibutuhkan sebuah **Dashboard Informasi Masjid** yang terdiri dari dua komponen:
1. **Tampilan Publik (TV Display)** — ditampilkan di layar TV masjid untuk jamaah.
2. **Panel Admin (Internal)** — digunakan pengurus untuk mengelola seluruh data yang tampil di layar publik.

## 2. Tujuan

- Menyediakan informasi masjid yang akurat, real-time, dan mudah diakses jamaah.
- Meningkatkan transparansi keuangan masjid (kas masuk/keluar, donasi/infaq).
- Menggantikan pencatatan manual (Excel/buku) dengan sistem terpusat.
- Memudahkan pengurus dalam mengelola jadwal kajian dan agenda kegiatan.

## 3. Target Pengguna

| Pengguna | Kebutuhan |
|---|---|
| Jamaah (publik) | Melihat jadwal sholat, kajian, running text infaq, dan agenda kegiatan lewat layar TV |
| Pengurus/Takmir (admin) | Mengelola data jadwal, keuangan, dan agenda melalui panel admin |
| Bendahara | Input & memantau kas masuk/keluar, laporan keuangan |

## 4. Lingkup (Scope)

### 4.1 In Scope
- Tampilan publik di layar TV
- Panel admin berbasis web untuk pengurus
- Modul jadwal sholat
- Modul jadwal kajian/pengajian
- Modul running text infaq/pengumuman
- Modul keuangan (kas masuk/keluar, saldo, donasi)
- Modul agenda kegiatan masjid
- Migrasi data dari pencatatan manual (Excel/buku) yang sudah berjalan

### 4.2 Out of Scope (fase awal)
- Aplikasi mobile terpisah untuk jamaah
- Pembayaran donasi online (payment gateway)
- Integrasi dengan sistem zakat/BAZNAS
- Multi-masjid/multi-cabang

## 5. Kebutuhan Fungsional

### 5.1 Tampilan Publik (TV Display)

| ID | Fitur | Deskripsi |
|---|---|---|
| F-01 | Jadwal Sholat | Menampilkan waktu sholat 5 waktu (Subuh, Dzuhur, Ashar, Maghrib, Isya) + Jumat, berdasarkan lokasi masjid, update otomatis harian |
| F-02 | Hitung Mundur Sholat | Countdown ke waktu sholat berikutnya |
| F-03 | Jadwal Kajian | Menampilkan jadwal kajian/pengajian terdekat (nama ustadz, tema, waktu) |
| F-04 | Running Text | Teks berjalan berisi pengumuman, ajakan infaq, info penting pengurus |
| F-05 | Info Keuangan Ringkas | Menampilkan saldo kas masjid & total infaq terkini secara publik untuk transparansi jamaah |
| F-06 | Agenda Kegiatan | Menampilkan agenda kegiatan masjid mendatang (santunan, bakti sosial, dll) |
| F-07 | Kalender Hijriah | Menampilkan tanggal Masehi & Hijriah |

### 5.2 Panel Admin

| ID | Fitur | Deskripsi |
|---|---|---|
| A-01 | Login & Role | Admin login dengan role berbeda (Marbot, Takmir, Bendahara, Superadmin) — marbot sebagai pengelola harian konten sistem |
| A-02 | Manajemen Jadwal Sholat | Set lokasi/metode perhitungan, override manual jika perlu |
| A-03 | Manajemen Kajian | CRUD jadwal kajian (ustadz, tema, tanggal, jam) |
| A-04 | Manajemen Running Text | CRUD teks pengumuman yang tampil di TV |
| A-05 | Manajemen Keuangan | Input kas masuk/keluar, kategori transaksi, upload bukti, saldo otomatis |
| A-06 | Laporan Keuangan | Generate laporan bulanan/periode (untuk transparansi ke jamaah/pengurus) |
| A-07 | Manajemen Agenda | CRUD agenda kegiatan masjid |
| A-08 | Import Data Excel | Import data historis dari Excel/buku manual yang sudah ada |
| A-09 | Dashboard Ringkasan | Ringkasan kas, agenda terdekat, kajian terdekat dalam satu halaman |

## 6. Kebutuhan Non-Fungsional

- **Ketersediaan:** Kedua layar TV terhubung internet permanen dan menampilkan data 24/7 dengan auto-refresh real-time dari server.
- **Kemudahan Penggunaan:** Panel admin harus mudah dipakai oleh pengurus non-teknis.
- **Keamanan:** Data keuangan hanya bisa diubah oleh role Bendahara/Superadmin; ada log perubahan (audit trail).
- **Skalabilitas:** Mendukung penambahan modul di kemudian hari (mis. donasi online).
- **Kompatibilitas Perangkat:** Tampilan TV harus optimal untuk resolusi layar umum (Full HD/4K), browser-based agar mudah dijalankan di Smart TV/Android box/mini PC.

## 7. Migrasi Data

Karena pencatatan saat ini masih manual (Excel/buku):
- Perlu proses digitalisasi data historis kas & kajian ke sistem baru.
- Disediakan fitur import Excel (format template disiapkan tim) agar transisi tidak memulai dari nol.
- Periode transisi paralel (manual + sistem baru) direkomendasikan selama 1 bulan pertama untuk validasi data.

## 8. Metrik Keberhasilan

- Waktu pencatatan transaksi kas berkurang dibanding proses manual.
- Jamaah dapat melihat info jadwal & kajian tanpa bertanya ke pengurus.
- Laporan keuangan bulanan dapat digenerate dalam hitungan menit, bukan hari.
- Tidak ada lagi selisih pencatatan kas akibat human error.

## 9. Fase Implementasi (Usulan)

| Fase | Fokus |
|---|---|
| Fase 1 | Panel admin dasar + modul keuangan (menggantikan Excel) |
| Fase 2 | Tampilan TV publik (jadwal sholat, running text, kajian) |
| Fase 3 | Modul agenda kegiatan + laporan keuangan otomatis |
| Fase 4 (opsional) | Fitur lanjutan: donasi online, integrasi zakat, dsb |

## 10. Konfirmasi Kebutuhan

- **Jumlah & Lokasi Layar:** 2 unit TV di area masjid.
- **Saldo Kas:** Ditampilkan secara publik di layar TV (F-05 bersifat wajib, bukan opsional).
- **Role Admin:** Marbot masjid bertindak sebagai admin/pengelola konten sistem.
- **Konektivitas:** Kedua TV terhubung ke internet permanen (bukan mode offline), sehingga data dapat auto-refresh real-time dari server tanpa perlu sinkronisasi manual.
