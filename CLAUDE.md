# CLAUDE.md

## Project Overview
Dashboard Informasi Masjid — Aplikasi web untuk menampilkan informasi masjid (jadwal sholat, kajian, keuangan, agenda) di layar TV publik dan panel admin internal.

Open source, deploy gratis ke Vercel + Supabase. Lihat [README.md](README.md) untuk deploy button dan [SETUP.md](SETUP.md) untuk panduan lengkap.

## Tech Stack
- **Backend:** Node.js + Express + Supabase (PostgreSQL) + PDFKit (PDF generation)
- **Frontend TV:** React.js 18 + Moment.js + moment-hijri
- **Frontend Admin:** React.js 18 + Material UI + React Router v6 (with `basename="/admin"`)
- **Database:** Supabase (PostgreSQL cloud) — schema in `supabase/schema.sql`, seed in `supabase/seed.sql`
- **Hosting:** Vercel (serverless backend + static frontend)

## Design System
- **Primary:** Deep teal-emerald `#0b3d2e` / `#146b4a` / `#1a9e68`
- **Accent:** Warm honey-amber `#d4913d` / `#f0c66e`
- **Background TV:** Near-black with green undertone `#061a14` (glassmorphism cards)
- **Background Admin:** Warm off-white `#f0f2f1` with emerald sidebar
- **Typography:** Outfit (body/UI) + Amiri (mosque name/hijriah date only)
- **Animations:** Crossfade page transitions (0.8s), breathing countdown, radial ambient glow
- **Icons:** Phosphor-style stroke-based SVG components (`Icons.js` in each frontend)
  - Consistent: `strokeWidth="1.5"`, `strokeLinecap="round"`, `strokeLinejoin="round"`
  - No emoji — all visual indicators use SVG icons

## Project Structure
```
masjid/
├── api/                        # Vercel serverless entry point
│   ├── index.js                # Express handler (module.exports = (req, res) => app(req, res))
│   ├── package.json            # API dependencies (@supabase/supabase-js, express, etc.)
│   └── backend/                # Self-contained backend copy for Vercel
│       ├── server.js           # Express app (no listen in production)
│       ├── database.js         # Supabase client (all CRUD methods are async)
│       ├── routes/             # 10 route files (all async/await)
│       └── middleware/         # auth.js + monitoring.js
├── backend/                    # Backend source (local development)
│   ├── server.js              # Express server entry point (port 5001)
│   ├── database.js            # Supabase client helpers (CRUD operations)
│   ├── scripts/
│   │   ├── seed.js            # Seed via Supabase API (npm run seed)
│   │   └── seed-supabase.js   # Alternative seed script
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
│   └── .env                   # Environment variables (not in git)
├── frontend/tv-display/       # TV Display (port 3000)
│   └── src/
│       ├── App.js             # Main TV layout + crossfade page rotation (API_URL = /api)
│       ├── components/
│       │   ├── Icons.js       # Shared Phosphor-style SVG icon components
│       │   ├── Header.js      # Mosque name + Hijri date + live clock
│       │   ├── PrayerSchedule.js  # Prayer times + breathing countdown
│       │   ├── KajianFinance.js   # Combined Kajian + Finance card
│       │   ├── Agenda.js      # Upcoming events
│       │   ├── Laporan.js     # Activity reports display (full content, no truncation)
│       │   └── RunningText.js # Scrolling announcement text (55s cycle)
│       └── styles/global.css  # TV display styles (design system)
├── frontend/admin-panel/      # Admin Panel (port 3001)
│   └── src/
│       ├── App.js             # Router with basename="/admin"
│       ├── context/AuthContext.js  # Auth state management
│       ├── services/api.js    # Axios API client (API_URL = /api)
│       ├── components/Layout.js    # Sidebar + layout (emerald theme)
│       └── pages/
│           ├── Login.js       # Login page (ambient glow design)
│           ├── Dashboard.js   # Admin dashboard (stats + kajian + agenda)
│           ├── JadwalSholat.js
│           ├── Kajian.js
│           ├── Keuangan.js    # Advanced finance: dashboard + CRUD + laporan + PDF
│           ├── Agenda.js
│           ├── RunningText.js
│           ├── Laporan.js
│           ├── Users.js       # User management (superadmin)
│           ├── Settings.js    # Mosque settings
│           └── Monitoring.js  # System monitoring dashboard
├── supabase/
│   ├── schema.sql             # Full database schema (9 tables + indexes + RLS)
│   └── seed.sql               # Seed data in pure SQL (50 keuangan, 8 kajian, etc.)
├── tv/                        # Built TV files (served by Vercel at /tv/)
├── admin/                     # Built admin files (served by Vercel at /admin/)
├── vercel.json                # Vercel config (builds + routes)
├── .env.example               # Env var template
├── LICENSE                    # MIT
├── README.md                  # Deploy button + features
├── SETUP.md                   # Step-by-step deploy guide
└── CLAUDE.md                  # This file
```

## Port Configuration
- **GitHub:** `https://github.com/Valerian69/masjid.git` (account: Valerian69 / itBiensi)
- **Vercel Production:** `https://masjid-umber.vercel.app`
  - TV Display: `/tv/`
  - Admin Panel: `/admin/`
  - API: `/api/`
- **Local Development:**
  - Backend API: `http://localhost:5001`
  - TV Display: `http://localhost:3000`
  - Admin Panel: `http://localhost:3001`

## Environment Variables
| Variable | Description | Where to get |
|----------|-------------|--------------|
| `SUPABASE_URL` | Supabase project URL | Supabase Dashboard → Settings → API |
| `SUPABASE_ANON_KEY` | Supabase anonymous key (public, safe for frontend) | Supabase Dashboard → Settings → API |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase service role key (secret, backend only) | Supabase Dashboard → Settings → API |
| `JWT_SECRET` | Secret for JWT tokens | Generate random string |
| `REACT_APP_API_URL` | API URL (local dev only, Vercel uses `/api` relative) | `http://localhost:5001/api` |

## Default Credentials
- **Username:** `admin`
- **Password:** `admin123`

> **WARNING:** Ganti password setelah deploy! Hash password: `node -e "console.log(require('bcryptjs').hashSync('password_baru', 10))"`

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
- `POST /api/keuangan` — Add transaction
- `PUT /api/keuangan/:id` — Update transaction
- `DELETE /api/keuangan/:id` — Delete transaction

**Transaction fields:** `tanggal`, `jenis` (masuk/keluar), `kategori`, `deskripsi`, `jumlah`, `metode_pembayaran` (cash/transfer/e-wallet), `penerima`, `no_ref`, `catatan`, `status` (confirmed/pending/cancelled)

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

## Database (Supabase PostgreSQL)

### Schema
All data stored in Supabase (PostgreSQL). Schema defined in `supabase/schema.sql`:
- `users` — User accounts (id UUID, username, password, full_name, role, created_at, updated_at)
- `jadwal_sholat` — Prayer times (id, nama_sholat, waktu, is_active)
- `kajian` — Study sessions (id, judul, ustadz, tanggal, jam_mulai, jam_selesai, deskripsi, is_recurring, recurring_day)
- `keuangan` — Financial transactions (id, tanggal, jenis, kategori, deskripsi, jumlah, metode_pembayaran, penerima, no_ref, catatan, status, created_by)
- `agenda` — Events/agenda (id, judul, tanggal, jam_mulai, jam_selesai, deskripsi, lokasi, is_published)
- `running_text` — Scrolling text announcements (id, teks, is_active, urutan)
- `settings` — Mosque settings (id, key, value)
- `audit_log` — Finance change audit trail (id, user_id, action, table_name, record_id, old_value, new_value)
- `laporan` — Activity reports (id, judul, tanggal, isi, kategori, is_published)

### Seed Data
- `supabase/seed.sql` — Pure SQL seed data (run in Supabase SQL Editor)
  - 4 users (admin, bendahara, takmir, marbot) — password: `admin123`
  - 7 settings (masjid name, address, coordinates, timezone)
  - 8 prayer times (Imsak–Isya)
  - 8 kajian sessions
  - 50 keuangan transactions (6 months realistic data)
  - 5 agenda items
  - 5 running text
  - 6 laporan

### Key Notes
- All tables have `created_at` and `updated_at` (TIMESTAMPTZ)
- RLS enabled on all tables with public read policies
- Backend uses `SUPABASE_SERVICE_ROLE_KEY` to bypass RLS
- `database.js` exports `dbHelpers` with async CRUD methods (findAll, findById, findWhere, findOneWhere, insert, update, remove, count)

## Conventions
- API responses use JSON
- Auth: JWT token in `Authorization: Bearer <token>` header
- Finance operations (bendahara/superadmin only) create audit log entries
- Frontend auto-refreshes TV data every 30 seconds
- Running text scrolls in 55-second cycle
- Hijriah date calculated using `Intl.DateTimeFormat` with `islamic-umalqura` calendar
- Prayer times synced from EQuran.id API (free, no API key needed) — settings `provinsi` and `kabkota` control location
- PDF reports generated server-side with PDFKit (professional layout with header, summary, tables)
- TV pages crossfade (0.8s transition) instead of hard-cutting

## Running the App (Local Development)

```bash
# 1. Clone & install
git clone https://github.com/Valerian69/masjid.git
cd masjid
npm run install:all

# 2. Setup backend env
cp .env.example backend/.env
# Edit backend/.env with your Supabase credentials

# 3. Seed database (first time only)
cd backend && npm run seed

# 4. Run in 3 separate terminals:
cd backend && npm run dev           # Terminal 1: API on port 5001
cd frontend/tv-display && npm start # Terminal 2: TV on port 3000
cd frontend/admin-panel && PORT=3001 npm start # Terminal 3: Admin on port 3001
```

## Vercel Deployment

### vercel.json Config
```json
{
  "builds": [
    { "src": "api/index.js", "use": "@vercel/node" },
    { "src": "tv/**", "use": "@vercel/static" },
    { "src": "admin/**", "use": "@vercel/static" }
  ],
  "routes": [
    { "src": "/api/(.*)", "dest": "/api/index.js" },
    { "handle": "filesystem" },
    { "src": "/admin/(.*)", "dest": "/admin/index.html" },
    { "src": "/tv/(.*)", "dest": "/tv/index.html" },
    { "src": "/(.*)", "dest": "/tv/$1" }
  ]
}
```

### Build Commands
```bash
# TV Display (with PUBLIC_URL=/tv for correct asset paths)
cd frontend/tv-display && REACT_APP_API_URL=/api npm run build

# Admin Panel (with PUBLIC_URL=/admin and basename="/admin")
cd frontend/admin-panel && PUBLIC_URL=/admin REACT_APP_API_URL=/api npm run build

# Copy build output to root
rm -rf tv && cp -r frontend/tv-display/build tv
rm -rf admin && cp -r frontend/admin-panel/build admin
```

### Key Notes
- `api/` directory is self-contained with its own `package.json` for Vercel's `@vercel/node` builder
- Frontends use relative `/api` URL (not absolute) — no hardcoded domain
- Admin Panel uses `basename="/admin"` in React Router
- `PUBLIC_URL=/admin` ensures HTML references `/admin/static/js/...` instead of `/static/js/...`

## Key Features
- **TV Display:** Live prayer countdown (breathing animation), running text scroll (55s), crossfade page rotation (10s), ambient radial glow, glassmorphism cards, full laporan content, skeleton loading states
- **Admin Panel:** CRUD for all modules, role-based access, audit trail, laporan management, emerald sidebar with geometric pattern, premium design system (800+ lines CSS)
- **Finance Dashboard:** Summary cards, 6-month trend chart, category breakdown, recent transactions, 3-tab view (Dashboard/Transaksi/Laporan)
- **Finance Reports:** Monthly report with category breakdown, PDF download (professional layout), CSV export
- **Monitoring:** System health, HTTP metrics (RED method), request/error logs, DB collection stats, auto-refresh 10s
- **Hijriah Date:** Uses browser's built-in `Intl.DateTimeFormat` (Umm al-Qura calendar)
- **Premium Design:** Grain texture overlay, inner-border glassmorphism, custom scrollbar, smooth page transitions
