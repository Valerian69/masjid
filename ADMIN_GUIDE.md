# Panduan Admin — Dashboard Masjid Raudhatul Jannah

Panduan lengkap untuk administrator mengelola seluruh sistem Dashboard Masjid.

---

## Daftar Isi

1. [Login & Autentikasi](#1-login--autentikasi)
2. [Dashboard Admin](#2-dashboard-admin)
3. [Mengelola Jadwal Sholat](#3-mengelola-jadwal-sholat)
4. [Mengelola Kajian](#4-mengelola-kajian)
5. [Mengelola Keuangan](#5-mengelola-keuangan)
6. [Mengelola Agenda](#6-mengelola-agenda)
7. [Mengelola Running Text](#7-mengelola-running-text)
8. [Mengelola Laporan](#8-mengelola-laporan)
9. [Pengaturan Masjid](#9-pengaturan-masjid)
10. [Manajemen Pengguna](#10-manajemen-pengguna)
11. [Monitoring Sistem](#11-monitoring-sistem)
12. [Backup & Restore](#12-backup--restore)
13. [Troubleshooting](#13-troubleshooting)

---

## 1. Login & Autentikasi

### Cara Login
1. Buka browser, akses `http://localhost:3001`
2. Masukkan **Username** dan **Password**
3. Klik **Masuk**

### Default Credentials
| Username | Password | Role |
|----------|----------|------|
| `admin` | `admin123` | Super Admin |
| `bendahara` | `admin123` | Bendahara |
| `takmir` | `admin123` | Takmir |
| `marbot` | `admin123` | Marbot |

> **Penting:** Segera ubah password default setelah login pertama kali!

### Hak Akses per Role

| Menu | Super Admin | Takmir | Bendahara | Marbot |
|------|:-----------:|:------:|:---------:|:------:|
| Dashboard | ✅ | ✅ | ✅ | ✅ |
| Jadwal Sholat | ✅ | ✅ | ❌ | ✅ |
| Kajian | ✅ | ✅ | ❌ | ✅ |
| Keuangan | ✅ | ❌ | ✅ | ❌ |
| Agenda | ✅ | ✅ | ❌ | ✅ |
| Running Text | ✅ | ✅ | ❌ | ✅ |
| Laporan | ✅ | ✅ | ❌ | ✅ |
| Pengaturan | ✅ | ✅ | ❌ | ❌ |
| Monitoring | ✅ | ✅ | ✅ | ✅ |
| Users | ✅ | ❌ | ❌ | ❌ |

---

## 2. Dashboard Admin

Dashboard menampilkan ringkasan singkat kondisi masjid.

### Komponen Dashboard
| Komponen | Keterangan |
|----------|------------|
| **Total Transaksi** | Jumlah seluruh transaksi keuangan |
| **Total Kajian** | Jumlah jadwal kajian yang terdaftar |
| **Total Agenda** | Jumlah agenda/kegiatan yang terdaftar |
| **Saldo Kas** | Total saldo keuangan masjid |
| **Kajian Terdekat** | 3 jadwal kajian berikutnya |
| **Agenda Terdekat** | 3 agenda/kegiatan berikutnya |

---

## 3. Mengelola Jadwal Sholat

### Melihat Jadwal
1. Klik menu **Jadwal Sholat** di sidebar
2. Tabel jadwal sholat ditampilkan lengkap

### Menambah Jadwal
1. Klik **+ Tambah Jadwal**
2. Isi form:
   - **Nama Sholat**: Nama waktu sholat (contoh: Subuh)
   - **Waktu**: Waktu sholat (format 24 jam, contoh: 04:30)
   - **Status**: Aktif atau Nonaktif
3. Klik **Simpan**

### Mengubah Jadwal
1. Klik tombol **Edit** pada jadwal yang ingin diubah
2. Ubah data yang diperlukan
3. Klik **Update**

### Menghapus Jadwal
1. Klik tombol **Hapus** pada jadwal yang ingin dihapus
2. Konfirmasi dengan klik **OK**

### Sinkronisasi dari API
1. Klik tombol **Sinkron dari API**
2. Pilih **Provinsi** dan **Kabupaten/Kota**
3. Klik **Sinkron Sekarang**
4. Jadwal sholat akan otomatis diperbarui dari data Kementerian Agama

---

## 4. Mengelola Kajian

### Menambah Kajian
1. Klik menu **Kajian** → **+ Tambah Kajian**
2. Isi form:
   - **Judul**: Nama kajian (wajib)
   - **Ustadz**: Nama pemateri (wajib)
   - **Tanggal**: Tanggal pelaksanaan
   - **Jam Mulai**: Waktu mulai
   - **Jam Selesai**: Waktu selesai (opsional)
   - **Deskripsi**: Penjelasan singkat (opsional)
   - **Berulang**: Centang jika kajian berulang setiap minggu
   - **Hari**: Pilih hari untuk kajian berulang
3. Klik **Simpan**

### Mengubah/Menghapus Kajian
- Klik **Edit** untuk mengubah atau **Hapus** untuk menghapus

---

## 5. Mengelola Keuangan

Modul keuangan memiliki 3 tampilan: **Dashboard**, **Transaksi**, dan **Laporan**.

### 5.1 Dashboard Keuangan

Menampilkan ringkasan keuangan secara visual:

| Komponen | Keterangan |
|----------|------------|
| **Saldo Total** | Selisih total pemasukan dan pengeluaran |
| **Bulan Ini Masuk** | Total pemasukan bulan berjalan |
| **Bulan Ini Keluar** | Total pengeluaran bulan berjalan |
| **Transaksi Bulan Ini** | Jumlah transaksi bulan berjalan |
| **Tren 6 Bulan** | Grafik batang pemasukan vs pengeluaran |
| **Kategori Bulan Ini** | Breakdown per kategori pemasukan & pengeluaran |
| **Transaksi Terakhir** | 8 transaksi terbaru |

### 5.2 Mencatat Transaksi Baru

1. Klik tab **Transaksi**
2. Klik **+ Transaksi Baru**
3. Isi form:
   - **Tanggal**: Tanggal transaksi
   - **Jenis**: Pemasukan atau Pengeluaran
   - **Kategori**: Pilih kategori yang sesuai
   - **Jumlah**: Nominal dalam Rupiah
   - **Metode Pembayaran**: Tunai / Transfer / E-Wallet
   - **Penerima/Pengirim**: Nama pihak terkait
   - **No. Referensi**: Nomor referensi transfer (jika ada)
   - **Status**: Dikonfirmasi / Menunggu / Dibatalkan
   - **Deskripsi**: Keterangan singkat
   - **Catatan Tambahan**: Catatan internal (opsional)
4. Klik **Simpan Transaksi**

### Kategori yang Tersedia

**Pemasukan:**
| Kategori | Keterangan |
|----------|------------|
| Infaq | Infaq harian dari jamaah |
| Donasi | Donasi dari perorangan/korporasi |
| Sedekah | Sedekah dari jamaah |
| Kas Jumat | Kotak infaq hari Jumat |
| Dana Pembangunan | Dana untuk pembangunan masjid |
| Zakat | Zakat mal/fithrah yang dikelola |
| Lainnya | Pemasukan lain |

**Pengeluaran:**
| Kategori | Keterangan |
|----------|------------|
| Operasional | Biaya operasional harian |
| Gaji/Insentif | Insentif marbot dan petugas |
| Pemeliharaan | Perawatan gedung dan fasilitas |
| Listrik & Air | Tagihan listrik dan air |
| Beli Barang | Pembelian barang keperluan masjid |
| Sosial | Bantuan sosial untuk warga |
| Renovasi | Biaya renovasi bangunan |
| Lainnya | Pengeluaran lain |

### 5.3 Filter & Pencarian

Gunakan filter untuk menemukan transaksi:
- **Cari**: Berdasarkan deskripsi, kategori, atau catatan
- **Dari/Sampai**: Rentang tanggal
- **Jenis**: Masuk atau Keluar
- **Metode**: Tunai, Transfer, atau E-Wallet
- **Status**: Dikonfirmasi, Menunggu, atau Dibatalkan

### 5.4 Export & Download

- **Export CSV**: Klik tombol **Export CSV** di halaman transaksi untuk mengunduh data dalam format spreadsheet
- **Download PDF**: Klik tombol **Download PDF** di tab Laporan untuk mengunduh laporan bulanan dalam format PDF profesional

### 5.5 Laporan Keuangan

1. Klik tab **Laporan**
2. Pilih **Bulan** dan **Tahun**
3. Klik **Lihat Laporan** untuk melihat di layar
4. Klik **Download PDF** untuk mengunduh file PDF

Laporan PDF berisi:
- Header dengan nama masjid
- Ringkasan (Total Masuk, Total Keluar, Saldo)
- Rekap per kategori dengan selisih
- Detail seluruh transaksi

---

## 6. Mengelola Agenda

### Menambah Agenda
1. Klik menu **Agenda** → **+ Tambah Agenda**
2. Isi form:
   - **Judul**: Nama kegiatan (wajib)
   - **Tanggal**: Tanggal pelaksanaan
   - **Jam Mulai/Selesai**: Waktu pelaksanaan
   - **Lokasi**: Tempat kegiatan
   - **Status**: Publish (tampil di TV) atau Draft (sembunyi)
   - **Deskripsi**: Penjelasan kegiatan
3. Klik **Simpan**

> **Catatan:** Hanya agenda dengan status **Publish** yang tampil di layar TV.

---

## 7. Mengelola Running Text

Running text ditampilkan di bagian bawah layar TV sebagai teks berjalan.

### Menambah Running Text
1. Klik menu **Running Text** → **+ Tambah Teks**
2. Isi form:
   - **Teks**: Pesan yang akan ditampilkan (wajib)
   - **Jenis**: Pengumuman / Infaq / Info
   - **Urutan**: Posisi tampilan (angka kecil = tampil duluan)
   - **Status**: Aktif atau Nonaktif
3. Klik **Simpan**

### Tips Menulis Running Text
- Gunakan bahasa yang jelas dan singkat
- Maksimal 150 karakter agar mudah dibaca
- Gunakan `★` di awal teks untuk penanda
- Pisahkan item dengan `•••••`

**Contoh:**
```
★ Selamat datang di Masjid Raudhatul Jannah. Silakan beribadah dengan khusyuk.
★ Infaq pembangunan masjid dapat disalurkan melalui kotak infaq atau transfer ke rekening BSI 1234567890.
★ Program Tahfiz Al-Qur'an untuk anak-anak dibuka setiap Selasa dan Kamis.
```

---

## 8. Mengelola Laporan

Laporan kegiatan ditampilkan di halaman kedua layar TV (bergantian otomatis).

### Menambah Laporan
1. Klik menu **Laporan** → **+ Tambah Laporan**
2. Isi form:
   - **Judul**: Judul laporan (wajib)
   - **Tanggal**: Tanggal publikasi
   - **Kategori**: renovasi / sosial / edukasi / umum
   - **Status**: Publish atau Draft
   - **Isi Laporan**: Isi laporan (wajib)
3. Klik **Simpan**

### Kategori Laporan
| Kategori | Keterangan |
|----------|------------|
| Renovasi | Laporan perbaikan/pembangunan |
| Sosial | Kegiatan sosial kemasyarakatan |
| Edukasi | Kegiatan pendidikan/kajian |
| Umum | Laporan umum lainnya |

---

## 9. Pengaturan Masjid

### Mengubah Informasi Masjid
1. Klik menu **Pengaturan**
2. Ubah informasi:
   - **Nama Masjid**: Nama yang ditampilkan di TV
   - **Alamat Masjid**: Alamat lengkap
   - **Latitude/Longitude**: Koordinat lokasi
   - **Timezone**: Zona waktu (WIB/WITA/WIT)
3. Klik **Simpan**

### Mengatur Lokasi Jadwal Sholat
1. Pilih **Provinsi** dari dropdown
2. Pilih **Kabupaten/Kota**
3. Klik **Sinkron Sekarang** untuk memperbarui jadwal sholat

---

## 10. Manajemen Pengguna

> **Hanya Super Admin** yang dapat mengakses menu ini.

### Menambah Pengguna
1. Klik menu **Users** → **+ Tambah User**
2. Isi form:
   - **Username**:Nama pengguna unik
   - **Password**: Kata sandi
   - **Nama Lengkap**: Nama tampilan
   - **Role**: superadmin / takmir / bendahara / marbot
3. Klik **Simpan**

### Mengubah Pengguna
1. Klik **Edit** pada pengguna yang ingin diubah
2. Ubah data (kosongkan password jika tidak diubah)
3. Klik **Update**

### Menghapus Pengguna
1. Klik **Hapus** pada pengguna yang ingin dihapus
2. Konfirmasi dengan klik **OK**

> **Peringatan:** Anda tidak dapat menghapus akun Anda sendiri!

---

## 11. Monitoring Sistem

Menu monitoring menampilkan kesehatan sistem secara real-time.

### Informasi yang Ditampilkan
| Komponen | Keterangan |
|----------|------------|
| **Status Kesehatan** | Healthy / Degraded / Unhealthy |
| **Uptime** | Waktu server berjalan |
| **Total Requests** | Jumlah request yang diterima |
| **Error Rate** | Persentase error |
| **Avg Latency** | Waktu respons rata-rata |
| **Memory Usage** | Penggunaan memori server |
| **Database Stats** | Jumlah record per koleksi |
| **Recent Requests** | Log request terakhir |
| **Recent Errors** | Log error terakhir |

### Auto-Refresh
Monitoring otomatis diperbarui setiap 10 detik.

### Reset Metrics
Klik **Reset Metrics** (hanya Super Admin) untuk mengatur ulang semua metrik.

---

## 12. Backup & Restore

### Backup Manual
```bash
# Backup database
cp backend/db.json backend/db.json.backup-$(date +%Y%m%d)
```

### Restore
```bash
# Restore database
cp backend/db.json.backup-20260728 backend/db.json
# Restart server
```

### Seed Ulang (Reset ke Data Sample)
```bash
cd backend
npm run seed
```

> **Peringatan:** Seed akan mengganti seluruh data di db.json dengan data sample!

---

## 13. Troubleshooting

### Masalah Umum

| Masalah | Solusi |
|---------|--------|
| TV tidak menampilkan data | Pastikan backend server berjalan (`npm run dev`) |
| Data tidak update | Refresh halaman TV (F5) atau tunggu 30 detik |
| Login gagal | Periksa username/password, atau reset dengan seed |
| Tidak bisa akses keuangan | Pastikan login dengan role `bendahara` atau `superadmin` |
| Jadwal sholat salah | Sinkron ulang dari API di menu Jadwal Sholat |
| Running text tidak muncul | Pastikan status teks = Aktif |
| Laporan tidak tampil di TV | Pastikan status laporan = Publish |

### Restart Server
```bash
# Hentikan server (tekan Ctrl+C di terminal backend)
#jalankan ulang
cd backend && npm run dev
```

### Cek Log Server
```bash
# Server log biasanya ditampilkan di terminal
# Untuk monitoring lebih detail, akses menu Monitoring di admin panel
```

---

## Kontak Support

Untuk bantuan teknis, hubungi:
- **Developer**: Tim IT Masjid
- **Email**: admin@masjid.example.com
