# 📋 Panduan Setup Lengkap

Panduan step-by-step untuk mendeploy Dashboard Masjid dengan **Vercel** + **Supabase**.

---

## Yang Kamu Butuhkan

- Akun [GitHub](https://github.com) (gratis)
- Akun [Vercel](https://vercel.com) (gratis, login dengan GitHub)
- Akun [Supabase](https://supabase.com) (gratis)

**Estimasi waktu: 15-20 menit**

---

## STEP 1: Buat Supabase Project

Supabase adalah database PostgreSQL gratis di cloud.

### 1.1 Buat Akun & Project

1. Buka **[supabase.com](https://supabase.com)**
2. Klik **"Sign up"** → daftar dengan GitHub (paling mudah)
3. Setelah login, klik tombol **"New project"**
4. Isi form:
   - **Organization**: pilih atau buat baru
   - **Project name**: `masjid-dashboard` (atau nama bebas)
   - **Database Password**: buat password simpan di tempat aman
   - **Region**: pilih terdekat (Singapore `Southeast Asia` recommended)
5. Klik **"Create new project"**
6. Tunggu ~2 menit hingga project selesai dibuat

### 1.2 Jalankan Schema Database

1. Di Supabase Dashboard, klik tab **"SQL Editor"** di sidebar kiri
2. Klik tombol **"New query"**
3. Buka file **[`supabase/schema.sql`](supabase/schema.sql)** di repo ini
4. **Copy seluruh isi file** → paste ke SQL Editor
5. Klik tombol **"Run"** (atau tekan `Ctrl+Enter`)
6. Tunggu hingga muncul pesan sukses

> **Yang dilakukan:** Membuat 9 tabel (users, jadwal_sholat, kajian, keuangan, agenda, running_text, settings, audit_log, laporan) + index + Row Level Security policies.

### 1.3 Jalankan Seed Data (Data Contoh)

1. Klik **"New query"** lagi
2. Buka file **[`supabase/seed.sql`](supabase/seed.sql)**
3. **Copy seluruh isi file** → paste ke SQL Editor
4. Klik **"Run"**

> **Yang dilakukan:** Mengisi database dengan data contoh:
> - 4 user admin (password: `admin123`)
> - 7 pengaturan masjid
> - 8 jadwal sholat
> - 8 jadwal kajian
> - 50 transaksi keuangan (6 bulan)
> - 5 agenda
> - 5 running text
> - 6 laporan kegiatan

### 1.4 Ambil API Keys

1. Di Supabase Dashboard, klik tab **"Settings"** (ikon gear) di sidebar
2. Klik **"API"** di submenu
3. Kamu akan melihat:

| Field | Nama | Contoh |
|-------|------|--------|
| **Project URL** | `SUPABASE_URL` | `https://xxxxxxxx.supabase.co` |
| **anon public** | `SUPABASE_ANON_KEY` | `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...` |
| **service_role** | `SUPABASE_SERVICE_ROLE_KEY` | `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...` |

4. **Simpan ketiga nilai ini** — kamu akan membutuhkannya di Step 3

> **Penting:** 
> - `SUPABASE_ANON_KEY` aman untuk frontend (public)
> - `SUPABASE_SERVICE_ROLE_KEY` hanya untuk backend (secret, jangan share!)

### 1.5 Generate JWT Secret

JWT Secret adalah string random untuk keamanan login.

**Cara cepat:** Buka browser, kunjungi:
```
https://generate-secret.vercel.app/32
```
Copy hasilnya — itu adalah `JWT_SECRET` kamu.

---

## STEP 2: Fork Repository

1. Buka **[github.com/Valerian69/masjid](https://github.com/Valerian69/masjid)**
2. Klik tombol **"Fork"** di pojok kanan atas
3. Klik **"Create fork"**
4. Tunggu hingga proses fork selesai → kamu akan diarahkan ke repo fork kamu

---

## STEP 3: Deploy ke Vercel

### 3.1 Import Project

1. Buka **[vercel.com/new](https://vercel.com/new)**
2. Login dengan GitHub (jika belum)
3. Di bagian **"Import Git Repository"**, cari repo fork kamu (`masjid`)
4. Klik **"Import"**

### 3.2 Konfigurasi Project

Vercel akan menampilkan form konfigurasi. Isi如下:

| Field | Nilai |
|-------|-------|
| **Project Name** | `masjid` (atau nama bebas) |
| **Framework Preset** | `Other` |
| **Root Directory** | `./` (default) |
| **Build Command** | *(kosongkan, biarkan default)* |
| **Output Directory** | *(kosongkan, biarkan default)* |

### 3.3 Tambah Environment Variables

Klik tab **"Environment Variables"** dan tambahkan satu per satu:

| Name | Value | Environment |
|------|-------|-------------|
| `SUPABASE_URL` | `https://xxxxx.supabase.co` | Production |
| `SUPABASE_ANON_KEY` | `eyJhbGci...` (dari Step 1.4) | Production |
| `SUPABASE_SERVICE_ROLE_KEY` | `eyJhbGci...` (dari Step 1.4) | Production |
| `JWT_SECRET` | string random (dari Step 1.5) | Production |

> **Cara menambah:** Klik **"Add"** untuk setiap variable, lalu klik **"Add"** lagi untuk yang berikutnya.

### 3.4 Deploy

1. Setelah semua env vars ditambah, klik tombol **"Deploy"**
2. Tunggu proses build & deploy (~2-3 menit)
3. Jika sukses, Vercel akan menampilkan URL deployment

### 3.5 Hasil

Setelah deploy selesai, kamu akan mendapat 3 URL:

| URL | Keterangan |
|-----|-----------|
| `https://masjid-xxx.vercel.app/tv/` | **TV Display** — tampilan untuk layar masjid |
| `https://masjid-xxx.vercel.app/admin/` | **Admin Panel** — panel administrasi |
| `https://masjid-xxx.vercel.app/api/health` | **API Health Check** |

---

## STEP 4: Verifikasi

### 4.1 Cek TV Display

1. Buka `https://masjid-xxx.vercel.app/tv/`
2. Harusnya muncul:
   - Nama masjid
   - Jadwal sholat dengan countdown
   - Running text scrolling
   - Info keuangan

### 4.2 Cek Admin Panel

1. Buka `https://masjid-xxx.vercel.app/admin/`
2. Login dengan:
   - **Username:** `admin`
   - **Password:** `admin123`
3. Harusnya muncul dashboard admin

### 4.3 Cek API

Buka `https://masjid-xxx.vercel.app/api/health`
Harusnya muncul: `{"status":"OK","timestamp":"..."}`

---

## STEP 5: Personalisasi

### 5.1 Ganti Nama Masjid

1. Login ke Admin Panel
2. Buka menu **"Pengaturan"** (Settings)
3. Ganti **Nama Masjid** dan **Alamat**
4. Simpan

Atau langsung via Supabase:
```sql
UPDATE settings SET value = 'Nama Masjid Kamu' WHERE key = 'masjid_name';
UPDATE settings SET value = 'Alamat Masjid Kamu' WHERE key = 'masjid_address';
```

### 5.2 Ganti Jadwal Sholat

1. Login ke Admin Panel → menu **"Jadwal Sholat"**
2. Edit waktu sholat sesuai lokasi kamu
3. Atau update langsung:
```sql
UPDATE jadwal_sholat SET waktu = '04:30' WHERE nama_sholat = 'Subuh';
UPDATE jadwal_sholat SET waktu = '12:00' WHERE nama_sholat = 'Dzuhur';
-- dst.
```

### 5.3 Ganti Password Admin

**Penting!** Ganti password default setelah deploy.

1. Login ke Supabase Dashboard
2. Buka tab **"Table Editor"** → tabel `users`
3. Cari user `admin`
4. Klik untuk edit → ganti field `password` dengan hash baru

Untuk generate hash baru:
```bash
# Jalankan di terminal
node -e "console.log(require('bcryptjs').hashSync('password_baru_anda', 10))"
```
Copy hasilnya → paste ke kolom `password` di Supabase.

---

## Troubleshooting

### TV Display kosong / putih
- Buka Console browser (`F12`) → lihat error
- Pastikan URL `/api/dashboard` bisa diakses
- Cek env vars di Vercel Dashboard → Settings → Environment Variables

### Admin Panel kosong / putih
- Pastikan URL `/api/auth/login` bisa diakses
- Cek apakah `REACT_APP_API_URL` tidak diset (harusnya `/api` relative)

### API error 500
- Cek Vercel Functions logs: Vercel Dashboard → your project → Logs → Functions
- Pastikan env vars `SUPABASE_URL`, `SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY` terisi benar
- Pastikan schema.sql dan seed.sql sudah dijalankan di Supabase

### Login gagal
- Pastikan `JWT_SECRET` terisi di env vars
- Pastikan user sudah dibuat (jalankan seed.sql)

### Deploy gagal (build error)
- Pastikan semua file sudah di-push ke GitHub
- Cek Vercel build logs untuk detail error

---

## Deploy Ulang

Setelah perubahan code:

```bash
git add .
git commit -m "Update fitur"
git push
```

Vercel akan otomatis rebuild & deploy.

Atau manual deploy via CLI:
```bash
npm i -g vercel
vercel login
cd masjid
vercel --prod
```

---

## Biaya

| Service | Free Tier | Cukup untuk |
|---------|-----------|-------------|
| **Vercel** | 100GB bandwidth/bulan | ~1000 pengunjung/hari |
| **Supabase** | 500MB database, 1GB storage | Data masjid bertahun-tahun |
| **Total** | **$0/bulan** | Masjid kecil-menengah |

---

## Fitur Lanjutan

### Custom Domain

1. Beli domain (contoh: `masjidkamu.com`)
2. Di Vercel Dashboard → Project → Settings → Domains
3. Tambah domain → ikuti instruksi DNS

### Backup Database

Di Supabase Dashboard → Database → Backups → jalankan manual backup.

### Monitoring

Admin Panel punya halaman **Monitoring** untuk melihat:
- System uptime
- Memory & CPU usage
- Request metrics
- Error logs

---

## FAQ

**Q: Apakah ini benar-benar gratis?**
A: Ya! Vercel free tier + Supabase free tier cukup untuk masjid kecil-menengah.

**Q: Bisa dijalankan tanpa Vercel (self-hosted)?**
A: Bisa. Jalankan backend (`npm run dev`) dan frontend secara terpisah. Lihat `CLAUDE.md` untuk detail.

**Q: Bagaimana cara update?**
A: `git pull` dari repo, atau jika pakai fork, sync fork dari GitHub upstream.

**Q: Apakah data aman?**
A: Backend menggunakan JWT auth + Supabase RLS policies. Pastikan ganti password default dan gunakan HTTPS (otomatis di Vercel).
