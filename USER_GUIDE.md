# Panduan Pengguna — Dashboard Masjid Raudhatul Jannah

Panduan ini ditujukan untuk jamaah dan pengunjung masjid yang melihat informasi di layar TV.

---

## 1. Tentang Dashboard

Dashboard ini menampilkan informasi penting masjid secara otomatis di layar TV yang dipasang di area masjid. Informasi diperbarui setiap 30 detik secara otomatis.

---

## 2. Tata Letak Layar

```
┌─────────────────────────────────────────────────────────────┐
│  🕌 Masjid Raudhatul Jannah    1 Muharram 1447 H    14:30  │
│                                     Selasa, 28 Juli 2026   │
├──────────────────────────────────┬──────────────────────────┤
│                                  │                          │
│   JADWAL SHOLAT                  │   JADWAL KAJIAN          │
│   ┌──────────────────────────┐   │   ┌──────────────────┐   │
│   │ Imsak        04:35       │   │   │ Tafsir Al-Misbah │   │
│   │ Subuh        04:45       │   │   │ Ustadz Ahmad     │   │
│   │ Terbit       06:00       │   │   │ Senin, 19:30     │   │
│   │ Dhuha        06:29       │   │   └──────────────────┘   │
│   │ Dzuhur       12:02       │   │                          │
│   │ Ashar        15:23       │   │   ─────────────────      │
│   │ Maghrib      17:57       │   │                          │
│   │ Isya         19:09       │   │   KEUANGAN MASJID        │
│   └──────────────────────────┘   │   ┌──────┬──────────┐    │
│                                  │   │Saldo │Infaq Bulan│    │
│   ┌──────────────────────────┐   │   │Rp49Jt│Rp 2.03Jt │    │
│   │ ⏱ SHOLAT BERIKUTNYA      │   │   └──────┴──────────┘    │
│   │      02:30:15             │   │                          │
│   │      Dzuhur               │   │   AGENDA KEGIATAN        │
│   └──────────────────────────┘   │   ┌──────────────────┐   │
│                                  │   │ Kajian Akbar      │   │
│                                  │   │ 2 Ags, Aula Utama │   │
│                                  │   └──────────────────┘   │
├──────────────────────────────────┴──────────────────────────┤
│  ★ Selamat datang di Masjid Raudhatul Jannah. Silakan...   │
└─────────────────────────────────────────────────────────────┘
```

---

## 3. Cara Membaca Informasi

### 3.1 Header (Bagian Atas)
| Informasi | Penjelasan |
|-----------|------------|
| **Nama Masjid** | Nama resmi masjid (huruf emas) |
| **Tanggal Hijriah** | Tanggal kalender Hijriah (contoh: 1 Muharram 1447 H) |
| **Jam** | Jam digital real-time (HH:MM:SS) |
| **Tanggal Masehi** | Hari, tanggal, bulan, tahun Masehi |

### 3.2 Jadwal Sholat (Kiri Atas)
- Menampilkan 8 waktu sholat: Imsak, Subuh, Terbit, Dhuha, Dzuhur, Ashar, Maghrib, Isya
- **Sholat yang sedang aktif** ditandai dengan latar belakang emas dan border emas
- Waktu sholat diperbarui dari sistem Kementerian Agama

### 3.3 Hitung Mundur Sholat (Kiri Bawah)
- Menampilkan waktu tersisa menuju sholat berikutnya
- Format: `JJ:MM:DD` (Jam:Menit:Detik)
- Animasi berdenyut lembut (breathing animation)
- Nama sholat berikutnya ditampilkan di bawah timer

### 3.4 Jadwal Kajian (Kanan Atas)
- Daftar kajian/ultadzah yang akan datang
- Menampilkan: judul, nama ustadz, hari & waktu
- Diperbarui otomatis

### 3.5 Keuangan Masjid (Kanan Tengah)
- **Saldo Kas**: Total seluruh dana masjid
- **Infaq Bulan Ini**: Total infaq yang diterima bulan berjalan
- Nomor dalam format Rupiah (Rp)

### 3.6 Agenda Kegiatan (Kanan Bawah)
- Daftar kegiatan/acroa masjid yang akan datang
- Menampilkan: judul kegiatan, tanggal, dan lokasi

### 3.7 Running Text (Bagian Paling Bawah)
- Teks berjalan dari kanan ke kiri
- Berisi pengumuman penting masjid
- Siklus scrolling: 55 detik per putaran
- Dipisahkan dengan simbol `•••••`

---

## 4. Fitur Otomatis

| Fitur | Keterangan |
|-------|------------|
| **Rotasi Halaman** | Layar berganti antara halaman utama dan halaman laporan setiap 10 detik dengan transisi fade |
| **Update Data** | Data diperbarui otomatis setiap 30 detik |
| **Jam Real-Time** | Jam berjalan terus, diperbarui setiap detik |
| **Hitung Mundur** | Timer sholat berikutnya dihitung real-time |

---

## 5. Halaman yang Ditampilkan

### Halaman Utama (Default)
Menampilkan jadwal sholat, kajian, keuangan, dan agenda secara bersamaan.

### Halaman Laporan
Menampilkan laporan kegiatan terbaru masjid dalam format kartu 2 kolom. Halaman ini muncul otomatis setiap 10 detik.

---

## 6. Pertanyaan Umum

**Q: Mengapa waktu sholat berbeda dengan yang saya tahu?**
> Jadwal sholat disesuaikan berdasarkan lokasi masjid (provinsi/kabupaten) dan disinkronkan dari Kementerian Agama. Hubungi pengurus masjid jika ada ketidaksesuaian.

**Q: Bagaimana cara melihat laporan kegiatan?**
> Laporan kegiatan ditampilkan secara otomatis bergantian dengan halaman utama. Tunggu 10 detik hingga halaman berganti.

**Q: Apakah data infaq saya ditampilkan?**
> Tidak. Yang ditampilkan hanya total saldo dan total infaq bulan ini. Data perorangan tidak ditampilkan di layar publik.

**Q: Bag cara melaporkan kesalahan data?**
> Hubungi pengurus masjid atau marbot yang bertugas.

---

## 7. Kontak Pengurus

Untuk informasi lebih lanjut atau melaporkan masalah, hubungi:
- **Admin Masjid**: Melalui pengurus yang bertugas
- **Marbot**: Pak Hasan
