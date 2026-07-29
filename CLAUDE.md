# CLAUDE.md

## Project Overview
Dashboard Informasi Masjid — Aplikasi web untuk menampilkan informasi masjid (jadwal sholat, kajian, keuangan, agenda) di layar TV publik dan panel admin internal.

## Tech Stack
- **Backend:** Node.js + Express + LowDB (JSON file database) + PDFKit (PDF generation)
- **Frontend TV:** React.js 18 + Moment.js + moment-hijri
- **Frontend Admin:** React.js 18 + Material UI + React Router v6

## Design System
- **Primary:** Deep teal-emerald `#0b3d2e` / `#146b4a` / `#1a9e68`
- **Accent:** Warm honey-amber `#d4913d` / `#f0c66e`
- **Background TV:** Near-black with green undertone `#061a14` (glassmorphism cards)
- **Background Admin:** Warm off-white `#f0f2f1` with emerald sidebar
- **Typography:** Outfit (body/UI) + Amiri (mosque name/hijriah date only)
- **Animations:** Crossfade page transitions (0.8s), breathing countdown, radial ambient glow

## Project Structure
```
masjid/
├── backend/
│   ├── server.js              # Express server entry point (port 5001)
│   ├── database.js            # LowDB helpers (CRUD operations)
│   ├── scripts/
│   │   └── seed.js            # Database seed script (npm run seed)
│   ├── middleware/
│   │   ├── auth.js            # JWT auth + role-based authorization
│   │   └── monitoring.js      # Request logging + in-memory metrics collector
│   ├── routes/
│   │   ├── auth.js            # Login, user CRUD
│   │   ├── jadwalSholat.js    # Prayer schedule CRUD + EQuran.id sync
│   │   ├── kajian.js          # Study session CRUD
│   │   ├── keuangan.js        # Finance CRUD + reports + PDF + CSV export + audit trail
│   │   ├── agenda.js          # Agenda CRUD
│   │   ├── runningText.js     # Running text CRUD
│   │   ├── dashboard.js       # Dashboard data (public + admin)
│   │   ├── settings.js        # Mosque settings CRUD
│   │   ├── laporan.js         # Laporan kegiatan CRUD
│   │   └── monitoring.js      # System/HTTP/business metrics API
│   └── db.json                # LowDB data file (auto-created, seed with npm run seed)
├── frontend/tv-display/       # TV Display (port 3000)
│   └── src/
│       ├── App.js             # Main TV layout + crossfade page rotation
│       ├── components/
│       │   ├── Header.js      # Mosque name + Hijri date + live clock
│       │   ├── PrayerSchedule.js  # Prayer times + breathing countdown
│       │   ├── KajianFinance.js   # Combined Kajian + Finance card
│       │   ├── Agenda.js      # Upcoming events
│       │   ├── Laporan.js     # Activity reports display
│       │   └── RunningText.js # Scrolling announcement text (55s cycle)
│       └── styles/global.css  # TV display styles (design system)
└── frontend/admin-panel/      # Admin Panel (port 3001)
    └── src/
        ├── App.js             # Router setup
        ├── context/AuthContext.js  # Auth state management
        ├── services/api.js    # Axios API client (all endpoints)
        ├── components/Layout.js    # Sidebar + layout (emerald theme)
        └── pages/
            ├── Login.js       # Login page (ambient glow design)
            ├── Dashboard.js   # Admin dashboard (stats + kajian + agenda)
            ├── JadwalSholat.js
            ├── Kajian.js
            ├── Keuangan.js    # Advanced finance: dashboard + CRUD + laporan + PDF
            ├── Agenda.js
            ├── RunningText.js
            ├── Laporan.js
            ├── Users.js       # User management (superadmin)
            ├── Settings.js    # Mosque settings
            └── Monitoring.js  # System monitoring dashboard
```

## Port Configuration
- Backend API: `http://localhost:5001`
- TV Display: `http://localhost:3000`
- Admin Panel: `http://localhost:3001`

## Default Credentials
- **Username:** `admin`
- **Password:** `admin123`

## Role Hierarchy
| Role | Permissions |
|------|-------------|
| `superadmin` | Full access, manage users |
| `takmir` | Manage jadwal, kajian, agenda, running text, settings, laporan |
| `bendahara` | Manage keuangan (finance) only |
| `marbot` | Manage jadwal, kajian, agenda, running text, laporan |

## API Endpoints

### Auth
- `POST /api/auth/login` — Login (returns JWT)
- `GET /api/auth/me` — Get current user
- `GET /api/auth/users` — List all users
- `POST /api/auth/users` — Create user
- `PUT /api/auth/users/:id` — Update user
- `DELETE /api/auth/users/:id` — Delete user

### Jadwal Sholat
- `GET /api/jadwal-sholat` — All prayer times
- `GET /api/jadwal-sholat/active` — Active prayer times
- `POST /api/jadwal-sholat` — Add prayer time
- `PUT /api/jadwal-sholat/:id` — Update prayer time
- `DELETE /api/jadwal-sholat/:id` — Delete prayer time
- `GET /api/jadwal-sholat/provinsi` — List all provinces from EQuran.id (auth required)
- `POST /api/jadwal-sholat/kabkota` — List kabupaten/kota by province (auth required)
- `POST /api/jadwal-sholat/sync` — Sync daily prayer times from EQuran.id API (auth required)

### Kajian
- `GET /api/kajian` — All study sessions (add `?upcoming=true`)
- `POST /api/kajian` — Add study session
- `PUT /api/kajian/:id` — Update
- `DELETE /api/kajian/:id` — Delete

### Keuangan (Advanced)
- `GET /api/keuangan` — All transactions (filter: `start_date`, `end_date`, `jenis`, `kategori`, `metode`, `status`, `search`)
- `GET /api/keuangan/public` — Public saldo + infaq (no auth)
- `GET /api/keuangan/summary` — Financial summary with month-over-month comparison
- `GET /api/keuangan/monthly-trend` — Monthly income vs expense (last 6 months)
- `GET /api/keuangan/category-breakdown` — Category breakdown for current month
- `GET /api/keuangan/report?year=&month=` — Monthly report (JSON)
- `GET /api/keuangan/report/pdf?year=&month=` — Monthly report as PDF (superadmin/bendahara)
- `GET /api/keuangan/export` — Export transactions as CSV (filter: `start_date`, `end_date`, `jenis`)
- `POST /api/keuangan` — Add transaction (with file upload)
- `PUT /api/keuangan/:id` — Update transaction
- `DELETE /api/keuangan/:id` — Delete transaction

**Transaction fields:** `tanggal`, `jenis` (masuk/keluar), `kategori`, `deskripsi`, `jumlah`, `metode_pembayaran` (cash/transfer/e-wallet), `penerima`, `no_ref`, `catatan`, `status` (confirmed/pending/cancelled), `bukti_path`

### Agenda
- `GET /api/agenda` — All agendas (add `?upcoming=true`)
- `POST /api/agenda` — Add agenda
- `PUT /api/agenda/:id` — Update
- `DELETE /api/agenda/:id` — Delete

### Running Text
- `GET /api/running-text` — Active texts (no auth)
- `GET /api/running-text/all` — All texts (auth required)
- `POST /api/running-text` — Add text
- `PUT /api/running-text/:id` — Update
- `DELETE /api/running-text/:id` — Delete

### Settings
- `GET /api/settings` — All settings (auth required)
- `GET /api/settings/public` — Public settings (no auth)
- `PUT /api/settings` — Update settings (superadmin/takmir only)

### Dashboard
- `GET /api/dashboard` — TV display data (no auth): jadwal_sholat, kajian_terdekat, agenda_terdekat, running_text, keuangan, settings
- `GET /api/dashboard/admin` — Admin dashboard data: total_users, total_kajian, total_agenda, total_transaksi, saldo, kajian_terdekat, agenda_terdekat

### Laporan
- `GET /api/laporan` — All laporan (auth required)
- `GET /api/laporan/latest` — Latest published laporan (no auth)
- `GET /api/laporan/:id` — Get laporan by ID
- `POST /api/laporan` — Add laporan (superadmin/takmir/marbot)
- `PUT /api/laporan/:id` — Update laporan (superadmin/takmir/marbot)
- `DELETE /api/laporan/:id` — Delete laporan (superadmin/takmir)

### Monitoring
- `GET /api/monitoring/overview` — Combined system + HTTP + DB + business metrics (auth required)
- `GET /api/monitoring/system` — System metrics: uptime, memory, CPU, platform (auth required)
- `GET /api/monitoring/http` — HTTP metrics: request rate, errors, latency percentiles (auth required)
- `GET /api/monitoring/requests?limit=50` — Recent request log (auth required)
- `GET /api/monitoring/errors?limit=20` — Recent error log (auth required)
- `POST /api/monitoring/reset` — Reset all metrics (superadmin only)

## Database (LowDB)
All data stored in `backend/db.json`. Collections:
- `users` — User accounts (id, username, password, full_name, role)
- `jadwal_sholat` — Prayer times (id, nama_sholat, waktu, is_active)
- `kajian` — Study sessions (id, judul, ustadz, tanggal, jam_mulai, jam_selesai, deskripsi, is_recurring, recurring_day)
- `keuangan` — Financial transactions (id, tanggal, jenis, kategori, deskripsi, jumlah, metode_pembayaran, penerima, no_ref, catatan, status, bukti_path, created_by)
- `agenda` — Events/agenda (id, judul, tanggal, jam_mulai, jam_selesai, deskripsi, lokasi, is_published)
- `running_text` — Scrolling text announcements (id, teks, is_active, urutan)
- `settings` — Mosque settings (id, key, value)
- `audit_log` — Finance change audit trail (id, user_id, action, table_name, record_id, old_value, new_value)
- `laporan` — Activity reports (id, judul, tanggal, isi, kategori, is_published)

## Seed Script
```bash
cd backend && npm run seed
```
Populates db.json with sample data:
- 4 users (admin, bendahara, takmir, marbot)
- 8 prayer times (Imsak–Isya)
- 8 kajian sessions
- 50 keuangan transactions (6 months realistic data)
- 5 agenda items
- 5 running text
- 6 laporan

## Conventions
- API responses use JSON
- Auth: JWT token in `Authorization: Bearer <token>` header
- Finance operations (bendahara/superadmin only) create audit log entries
- File uploads stored in `backend/uploads/`
- Frontend auto-refreshes TV data every 30 seconds
- Running text scrolls in 55-second cycle
- Hijriah date calculated using `Intl.DateTimeFormat` with `islamic-umalqura` calendar
- Prayer times synced from EQuran.id API (free, no API key needed) — settings `provinsi` and `kabkota` control location
- PDF reports generated server-side with PDFKit (professional layout with header, summary, tables)
- TV pages crossfade (0.8s transition) instead of hard-cutting

## Running the App
```bash
# Terminal 1: Backend
cd backend && npm run dev

# Terminal 2: TV Display
cd frontend/tv-display && npm start

# Terminal 3: Admin Panel
cd frontend/admin-panel && PORT=3001 npm start
```

## Key Features
- **TV Display:** Live prayer countdown (breathing animation), running text scroll (55s), crossfade page rotation (10s), ambient radial glow, glassmorphism cards
- **Admin Panel:** CRUD for all modules, role-based access, audit trail, laporan management, emerald sidebar with geometric pattern
- **Finance Dashboard:** Summary cards, 6-month trend chart, category breakdown, recent transactions, 3-tab view (Dashboard/Transaksi/Laporan)
- **Finance Reports:** Monthly report with category breakdown, PDF download (professional layout), CSV export
- **Finance Fields:** Extended transaction model with metode_pembayaran, penerima, no_ref, catatan, status
- **Monitoring:** System health, HTTP metrics (RED method), request/error logs, DB collection stats, auto-refresh 10s
- **Hijriah Date:** Uses browser's built-in `Intl.DateTimeFormat` (Umm al-Qura calendar)
