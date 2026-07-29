# Dashboard Informasi Masjid

Aplikasi Dashboard Informasi Masjid yang terdiri dari:
1. **TV Display** — Tampilan publik untuk layar TV masjid
2. **Admin Panel** — Panel administrasi untuk pengurus masjid

## Tech Stack
- **Backend:** Node.js + Express + LowDB (JSON file database)
- **Frontend TV:** React.js
- **Frontend Admin:** React.js + Material UI

## Cara Install & Jalankan

### 1. Backend
```bash
cd backend
npm install
npm run dev       # Jalankan server di port 5000
```

### 2. TV Display
```bash
cd frontend/tv-display
npm install
npm start         # Jalankan di port 3000
```

### 3. Admin Panel
```bash
cd frontend/admin-panel
npm install
npm start         # Jalankan di port 3000 (atau port lain)
```

## Default Login
- **Username:** admin
- **Password:** admin123

## Fitur

### TV Display (Publik)
- Jadwal Sholat dengan countdown ke sholat berikutnya
- Jadwal Kajian terdekat
- Running Text pengumuman
- Info keuangan ringkas (saldo & infaq bulanan)
- Agenda kegiatan mendatang
- Tanggal Hijriah

### Admin Panel
- Dashboard ringkasan (total transaksi, kajian, agenda, saldo)
- Manajemen Jadwal Sholat (CRUD + status aktif/nonaktif)
- Manajemen Kajian (CRUD + jadwal)
- Manajemen Keuangan (CRUD + filter + laporan)
- Manajemen Agenda (CRUD + publish/draft)
- Manajemen Running Text (CRUD + urutan)
- Manajemen Users (role-based: Superadmin, Takmir, Bendahara, Marbot)
- Audit trail perubahan data keuangan

## Role & Permissions

| Role | Akses |
|------|-------|
| Superadmin | Full akses semua fitur |
| Takmir | Kelola jadwal, kajian, agenda, running text |
| Bendahara | Kelola keuangan (masuk/keluar) |
| Marbot | Kelola konten TV display |

## Struktur Database
- `users` — Data user admin
- `jadwal_sholat` — Jadwal sholat 5 waktu
- `kajian` — Jadwal kajian/pengajian
- `keuangan` — Transaksi keuangan (masuk/keluar)
- `agenda` — Agenda kegiatan masjid
- `running_text` — Teks pengumuman/pemberitahuan
- `settings` — Pengaturan masjid
- `audit_log` — Log perubahan data

## Endpoint API

### Auth
- `POST /api/auth/login` — Login
- `GET /api/auth/me` — Profil user
- `GET /api/auth/users` — List users

### Jadwal Sholat
- `GET /api/jadwal-sholat` — Semua jadwal
- `POST /api/jadwal-sholat` — Tambah jadwal
- `PUT /api/jadwal-sholat/:id` — Update jadwal
- `DELETE /api/jadwal-sholat/:id` — Hapus jadwal

### Kajian
- `GET /api/kajian` — Semua kajian
- `POST /api/kajian` — Tambah kajian
- `PUT /api/kajian/:id` — Update kajian
- `DELETE /api/kajian/:id` — Hapus kajian

### Keuangan
- `GET /api/keuangan` — Semua transaksi
- `GET /api/keuangan/summary` — Ringkasan keuangan
- `POST /api/keuangan` — Tambah transaksi
- `PUT /api/keuangan/:id` — Update transaksi
- `DELETE /api/keuangan/:id` — Hapus transaksi

### Agenda
- `GET /api/agenda` — Semua agenda
- `POST /api/agenda` — Tambah agenda
- `PUT /api/agenda/:id` — Update agenda
- `DELETE /api/agenda/:id` — Hapus agenda

### Running Text
- `GET /api/running-text` — Teks aktif
- `POST /api/running-text` — Tambah teks
- `PUT /api/running-text/:id` — Update teks
- `DELETE /api/running-text/:id` — Hapus teks

### Dashboard
- `GET /api/dashboard` — Data TV display
- `GET /api/dashboard/admin` — Data admin dashboard