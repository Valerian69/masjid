# Tur Interaktif Bertingkat Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Menambahkan tur per halaman (38 langkah di 10 halaman) di atas tur peta menu yang sudah ada, dijalankan dari satu tombol mengambang, dengan tur yang menyetir tampilan halaman agar target tiap langkah benar-benar terlihat.

**Architecture:** Langkah tur adalah data murni berisi selector `target` dan selector `openWith` opsional. Satu hook, `useTourTarget`, adalah satu-satunya bagian yang menyentuh DOM halaman: ia mengklik `openWith` berurutan, menunggu render, lalu mengukur `target`. Sepuluh halaman hanya ditempeli atribut `data-tour` — tanpa import, tanpa state, tanpa tahu-menahu soal tur.

**Tech Stack:** React 18 (Create React App), React Router v6, CSS murni di `admin.css`, Jest bawaan CRA (tanpa dependensi baru).

**Spec:** `docs/superpowers/specs/2026-08-07-tur-interaktif-design.md`

## Global Constraints

- Tidak ada dependensi baru. `@testing-library/react` tidak boleh ditambahkan; pengujian hanya berupa test statis yang membaca berkas sumber.
- Tidak ada perubahan pada `backend/`, `api/`, atau `frontend/tv-display/`.
- Sepuluh berkas halaman dan tiga sub-komponen `pages/keuangan/` **hanya boleh menerima atribut `data-tour`** — tanpa import baru, tanpa state baru, tanpa perubahan perilaku.
- `openWith` menerima satu selector atau larik selector yang diklik berurutan, dengan jeda satu frame di antaranya.
- Bila `target` tidak ditemukan setelah 10 frame (±160 ms), tooltip tampil di tengah layar tanpa sorotan. Langkah tidak pernah dilewati diam-diam.
- Ambang layar HP adalah **lebar ≤ 768 px**, sama persis dengan media query tempat sidebar jadi off-canvas (`styles/admin.css:2169`).
- Tur berhenti sendiri bila rute berubah.
- Progress tur tidak disimpan; keluar di tengah lalu membuka lagi selalu mulai dari langkah pertama.
- Tombol mengambang menghilang selama tur berjalan.
- Kedua tombol "?" lama (`Layout.js:81` di topbar HP dan `Layout.js:127` di sidebar) dihapus, digantikan tombol mengambang.
- `openHelp` di `OnboardingContext.js:55` adalah kode mati dan dihapus.
- Setelah semua kode selesai, `npm run build:vercel` wajib dijalankan dan hasil di `admin/` ikut di-commit.

## File Structure

| Berkas | Tanggung jawab | Task |
|---|---|---|
| 10 berkas `pages/*.js` + 3 berkas `pages/keuangan/*.js` | Atribut `data-tour` saja | 1 |
| `components/onboarding/pageTours.js` *(baru)* | Data 38 langkah, dikunci per rute | 2 |
| `components/onboarding/pageTours.test.js` *(baru)* | Dua test statis: selector cocok markup, tidak ada halaman terlewat | 2 |
| `components/onboarding/useTourTarget.js` *(baru)* | Menyetir dan mengukur satu langkah; satu-satunya penyentuh DOM | 3 |
| `components/onboarding/OnboardingContext.js` | Dua mode tur, sadar rute, `openHelp` dihapus | 4 |
| `components/onboarding/GuidedTour.js` | Penggambar spotlight untuk kedua jenis tur | 4 |
| `components/onboarding/HelpButton.js` *(baru)* | Tombol mengambang dan menunya | 5 |
| `components/Layout.js` | Dua tombol "?" dihapus, `HelpButton` dipasang | 5 |
| `components/onboarding/MenuTourCards.js` *(baru)* | Varian kartu geser untuk tur peta menu di HP | 6 |
| `styles/admin.css` | Gaya tombol mengambang dan kartu geser | 5, 6 |
| `CLAUDE.md` | Dokumentasi onboarding diperbarui | 7 |

## Koreksi terhadap spec

Spec §5 mencantumkan langkah Kajian "Form dengan pilihan hari berulang". **Field itu tidak ada.** `Kajian.js:9` mendefinisikan `emptyForm = { judul, ustadz, tanggal, jam_mulai, jam_selesai, deskripsi }` — tanpa `is_recurring` maupun `recurring_day`, dan `handleSubmit` mengirim objek itu apa adanya. Tab "Berulang" hanya menyaring data yang sudah ada di database. Backend menerima `is_recurring`, tetapi panel admin tidak pernah mengirimnya.

Langkah tersebut diganti menjadi penjelasan tab Berulang sebagai penyaring. Jumlah langkah Kajian tetap empat. Ketidakmampuan form membuat kajian berulang adalah celah produk yang nyata, tetapi memperbaikinya di luar cakupan rencana ini.

---

### Task 1: Atribut `data-tour` di semua halaman

**Files:**
- Modify: `frontend/admin-panel/src/pages/Dashboard.js`, `JadwalSholat.js`, `Kajian.js`, `Keuangan.js`, `Agenda.js`, `RunningText.js`, `Laporan.js`, `Settings.js`, `Monitoring.js`, `Users.js`
- Modify: `frontend/admin-panel/src/pages/keuangan/KeuanganDashboard.js`, `KeuanganTransaksi.js`, `KeuanganLaporan.js`

**Interfaces:**
- Consumes: tidak ada.
- Produces: 38 nilai `data-tour` unik yang dirujuk Task 2. Konvensi nama: `<prefiks-halaman>-<elemen>`, huruf kecil, dipisah tanda hubung.

Semua perubahan di task ini adalah **penambahan satu atribut pada elemen yang sudah ada**. Jangan menambah pembungkus `<div>`, jangan mengubah className, jangan menyentuh logika.

- [ ] **Step 1: Dashboard.js**

Tambahkan `data-tour="dash-stats"` pada `<div className="grid grid-4" ...>` di baris 101 (pembungkus empat kartu statistik).
Tambahkan `data-tour="dash-kajian"` pada `<div className="card">` di baris 114 (kartu Kajian Terdekat).
Tambahkan `data-tour="dash-agenda"` pada `<div className="card">` di baris 139 (kartu Agenda Terdekat).

- [ ] **Step 2: JadwalSholat.js**

Tambahkan `data-tour="jadwal-sync"` pada tombol Sync di baris 133.
Tambahkan `data-tour="jadwal-add"` pada tombol Tambah Jadwal di baris 137.
Tambahkan `data-tour="jadwal-form"` pada `<form onSubmit={handleSubmit} className="card">` di baris 145.
Tambahkan `data-tour="jadwal-status"` pada `<select value={form.is_active} ...>` di dalam form itu (field berlabel "Status").
Tambahkan `data-tour="jadwal-table"` pada `<div className="table-wrapper">` di baris 181.

- [ ] **Step 3: Kajian.js**

Tambahkan `data-tour="kajian-add"` pada tombol Tambah Kajian di baris 118.
Tambahkan `data-tour="kajian-tabs"` pada `<div className="tabs" ...>` di baris 125.
Tambahkan `data-tour="kajian-tab-semua"` pada tombol tab "Semua Kajian" dan `data-tour="kajian-tab-berulang"` pada tombol tab "Berulang" di dalam blok itu.
Tambahkan `data-tour="kajian-form"` pada `<form onSubmit={handleSubmit}>` di baris 134.
Tambahkan `data-tour="kajian-list"` pada pembungkus grid daftar kartu kajian (elemen induk dari `<div key={item.id} className="card" ...>` di baris 185).

- [ ] **Step 4: Keuangan.js dan sub-komponennya**

Di `Keuangan.js`:
- `data-tour="keu-export"` pada tombol Export CSV di baris 162.
- `data-tour="keu-add"` pada tombol Transaksi Baru di baris 167.
- `data-tour="keu-tabs"` pada `<div className="tabs" ...>` di baris 175.
- Di dalam `.map` tab pada baris 176-179, tambahkan atribut per tab: `data-tour={`keu-tab-${v}`}` sehingga menghasilkan `keu-tab-dashboard`, `keu-tab-transaksi`, dan `keu-tab-laporan`.

Di `pages/keuangan/KeuanganDashboard.js`:
- `data-tour="keu-summary"` pada `<div className="grid grid-4" ...>` di baris 18.

Di `pages/keuangan/KeuanganTransaksi.js`:
- `data-tour="keu-filter"` pada `<div className="filter-bar">` di baris 16.
- `data-tour="keu-form"` pada elemen `<form>` transaksi di berkas itu.

Di `pages/keuangan/KeuanganLaporan.js`:
- `data-tour="keu-pdf"` pada tombol Download PDF di baris 32.

- [ ] **Step 5: Agenda.js, RunningText.js, Laporan.js**

`Agenda.js`:
- `data-tour="agenda-add"` pada tombol Tambah Agenda di baris 94.
- `data-tour="agenda-form"` pada `<form onSubmit={handleSubmit} className="card">` di baris 101.
- `data-tour="agenda-status"` pada `<select>` berlabel "Status" di dalam form itu.
- `data-tour="agenda-list"` pada pembungkus daftar kartu agenda (induk dari `<div className="card" key={item.id}>` di baris 159).

`RunningText.js`:
- `data-tour="rt-add"` pada tombol tambah di baris 86.
- `data-tour="rt-form"` pada `<form ...>` di baris 94.
- `data-tour="rt-urutan"` pada `<input>` berlabel "Urutan" di dalam form itu.
- `data-tour="rt-table"` pada `<div className="table-wrapper">` di baris 139.

`Laporan.js`:
- `data-tour="lap-add"` pada tombol Tambah Laporan di baris 84.
- `data-tour="lap-form"` pada `<form onSubmit={handleSubmit} className="card">` di baris 91.
- `data-tour="lap-kategori"` pada `<select>` berlabel "Kategori" di dalam form itu.
- `data-tour="lap-status"` pada `<select>` berlabel "Status" di dalam form itu.

- [ ] **Step 6: Settings.js, Monitoring.js, Users.js**

`Settings.js`:
- `data-tour="set-info"` pada `<div className="card">` di baris 144 (Informasi Masjid).
- `data-tour="set-preview"` pada `<div className="card">` di baris 184 (Preview TV Display).
- `data-tour="set-lokasi"` pada kartu Lokasi Jadwal Sholat (elemen `<div className="card ...">` induk dari `card-header` di baris 231).
- `data-tour="set-ikamah-toggle"` pada `<select>` "Aktifkan Jeda Ikamah & Layar Sholat" di sekitar baris 275.
- `data-tour="set-ikamah-durasi"` pada elemen pembungkus sepuluh input durasi per sholat di kartu Jeda Ikamah.

`Monitoring.js`:
- `data-tour="mon-danger"` pada `<div className="page-header-actions">` di baris 110.
- `data-tour="mon-health"` pada `<div className="card">` di baris 156 (System Health).
- `data-tour="mon-db"` pada `<div className="card">` di baris 181 (Database Collections).
- `data-tour="mon-latency"` pada `<div className="card">` di baris 237 (Latency Distribution).

`Users.js`:
- `data-tour="users-tabs"` pada `<div className="tabs animate-in" ...>` di baris 107.
- `data-tour="users-add"` pada tombol tambah di baris 119.
- `data-tour="users-form"` pada `<form onSubmit={handleSubmit} className="card ...">` di baris 128.
- `data-tour="users-table"` pada `<div className="table-wrapper">` di baris 167.

- [ ] **Step 7: Verifikasi seluruh atribut terpasang**

```bash
cd /Users/mac158/Documents/masjid/frontend/admin-panel/src/pages
grep -rho 'data-tour="[^"]*"' . | sort -u
```

Expected: 46 baris unik. (Tiga nilai lagi — `keu-tab-dashboard`, `keu-tab-transaksi`, dan `keu-tab-laporan` — dihasilkan lewat template literal sehingga tidak muncul di grep ini.) Periksa daftarnya memuat setiap nama yang disebut di Step 1-6, dan tidak ada nama ganda yang tak disengaja.

Lalu pastikan tidak ada yang rusak:

```bash
cd /Users/mac158/Documents/masjid/frontend/admin-panel && PUBLIC_URL=/admin REACT_APP_API_URL=/api npx react-scripts build
```

Expected: `Compiled successfully` tanpa peringatan baru.

- [ ] **Step 8: Commit**

```bash
git add frontend/admin-panel/src/pages
git commit -m "chore(admin): add data-tour anchors for the per-page tour"
```

---

### Task 2: Data langkah dan test statis

**Files:**
- Create: `frontend/admin-panel/src/components/onboarding/pageTours.js`
- Create: `frontend/admin-panel/src/components/onboarding/pageTours.test.js`

**Interfaces:**
- Consumes: nilai `data-tour` dari Task 1.
- Produces:
  - `pageTours` — objek dikunci path rute, tiap nilai adalah larik langkah `{ target, openWith?, title, body }`.
  - `getPageTour(pathname)` → larik langkah atau `[]`.
  - `pageTourLabel(pathname)` → nama halaman untuk ditampilkan di menu tombol bantuan, atau `null`.

- [ ] **Step 1: Tulis test yang gagal**

Buat `frontend/admin-panel/src/components/onboarding/pageTours.test.js`:

```js
const fs = require('fs');
const path = require('path');
const { pageTours, getPageTour, pageTourLabel } = require('./pageTours');

const PAGES_DIR = path.join(__dirname, '..', '..', 'pages');

// Seluruh sumber halaman digabung jadi satu string; cukup untuk memastikan
// sebuah data-tour benar-benar ada di markup.
const readAllPageSources = () => {
  const files = [];
  const walk = (dir) => {
    for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
      const full = path.join(dir, entry.name);
      if (entry.isDirectory()) walk(full);
      else if (entry.name.endsWith('.js')) files.push(full);
    }
  };
  walk(PAGES_DIR);
  return files.map((f) => fs.readFileSync(f, 'utf8')).join('\n');
};

const selectorsOf = (step) => {
  const list = [step.target];
  if (step.openWith) list.push(...(Array.isArray(step.openWith) ? step.openWith : [step.openWith]));
  return list;
};

// '[data-tour="keu-export"]' -> 'keu-export'
const keyOf = (selector) => selector.replace(/^\[data-tour="/, '').replace(/"\]$/, '');

describe('pageTours — bentuk data', () => {
  it('setiap langkah punya target, judul, dan isi', () => {
    Object.values(pageTours).forEach((steps) => {
      expect(Array.isArray(steps)).toBe(true);
      expect(steps.length).toBeGreaterThan(0);
      steps.forEach((step) => {
        expect(typeof step.target).toBe('string');
        expect(step.target).toMatch(/^\[data-tour="[a-z0-9-]+"\]$/);
        expect(step.title.length).toBeGreaterThan(0);
        expect(step.body.length).toBeGreaterThan(0);
      });
    });
  });

  it('total langkah halaman berjumlah 38', () => {
    const total = Object.values(pageTours).reduce((n, steps) => n + steps.length, 0);
    expect(total).toBe(38);
  });
});

describe('pageTours — selector cocok dengan markup', () => {
  it('setiap data-tour yang dirujuk benar-benar ada di berkas halaman', () => {
    const source = readAllPageSources();
    const missing = [];
    Object.entries(pageTours).forEach(([route, steps]) => {
      steps.forEach((step) => {
        selectorsOf(step).forEach((sel) => {
          const key = keyOf(sel);
          // Cocokkan atribut literal maupun yang dihasilkan template literal
          // (mis. data-tour={`keu-tab-${v}`} untuk keu-tab-transaksi).
          const literal = `data-tour="${key}"`;
          const templatePrefix = key.replace(/-[a-z0-9]+$/, '');
          const template = `data-tour={\`${templatePrefix}-\${`;
          if (!source.includes(literal) && !source.includes(template)) {
            missing.push(`${route}: ${key}`);
          }
        });
      });
    });
    expect(missing).toEqual([]);
  });
});

describe('pageTours — cakupan rute', () => {
  const SIDEBAR_ROUTES = [
    '/', '/jadwal-sholat', '/kajian', '/keuangan', '/agenda',
    '/running-text', '/laporan', '/settings', '/monitoring', '/users',
  ];

  it('setiap rute bermenu punya tur halaman', () => {
    SIDEBAR_ROUTES.forEach((route) => {
      expect(getPageTour(route).length).toBeGreaterThan(0);
    });
  });

  it('rute tanpa tur mengembalikan larik kosong dan label null', () => {
    expect(getPageTour('/panduan')).toEqual([]);
    expect(pageTourLabel('/panduan')).toBeNull();
  });

  it('label halaman tersedia untuk tiap rute bermenu', () => {
    SIDEBAR_ROUTES.forEach((route) => {
      expect(typeof pageTourLabel(route)).toBe('string');
    });
  });
});
```

- [ ] **Step 2: Jalankan test untuk memastikan gagal**

```bash
cd /Users/mac158/Documents/masjid/frontend/admin-panel && CI=true npx react-scripts test --watchAll=false src/components/onboarding/pageTours.test.js
```

Expected: FAIL — `Cannot find module './pageTours'`.

- [ ] **Step 3: Tulis data langkah**

Buat `frontend/admin-panel/src/components/onboarding/pageTours.js`:

```js
// Isi tur per halaman. Murni data: tidak ada React di sini, dan halaman yang
// disorot tidak tahu-menahu soal berkas ini — keterkaitannya hanya lewat
// atribut data-tour.
//
// target   : elemen yang disorot (wajib)
// openWith : selector, atau larik selector, yang diklik berurutan lebih dulu
//            agar target muncul (opsional)
//
// Prinsip pemilihan langkah: jelaskan yang TIDAK terbaca dari layarnya sendiri.
// Tombol "Hapus" tidak perlu dijelaskan; keterkaitan antar menu, syarat yang
// harus dipenuhi lebih dulu, dan konsekuensi yang tak terlihat justru perlu.

export const pageTours = {
  '/': [
    {
      target: '[data-tour="dash-stats"]',
      title: 'Empat angka kunci',
      body: 'Total transaksi, kajian, agenda, dan saldo kas terkini. Angka ini ikut berubah begitu Anda menambah data lewat menu lain.',
    },
    {
      target: '[data-tour="dash-kajian"]',
      title: 'Kajian terdekat',
      body: 'Diambil dari menu Kajian. Daftar yang sama ini juga bergantian tampil di layar TV masjid.',
    },
    {
      target: '[data-tour="dash-agenda"]',
      title: 'Agenda terdekat',
      body: 'Diambil dari menu Agenda. Hanya agenda berstatus Published yang muncul di sini maupun di TV.',
    },
  ],

  '/jadwal-sholat': [
    {
      target: '[data-tour="jadwal-table"]',
      title: 'Inilah yang dilihat jamaah',
      body: 'Setiap baris di tabel ini tampil langsung di layar TV masjid. Mengubah jam di sini berarti mengubah yang terbaca dari ruang sholat.',
    },
    {
      target: '[data-tour="jadwal-sync"]',
      title: 'Ambil jadwal otomatis',
      body: 'Menarik jadwal hari ini dari EQuran.id sesuai lokasi masjid. Lokasinya diatur lebih dulu di menu Pengaturan — tanpa itu tombol ini akan menolak.',
    },
    {
      target: '[data-tour="jadwal-form"]',
      openWith: '[data-tour="jadwal-add"]',
      title: 'Koreksi manual',
      body: 'Bila jadwal hasil sinkron perlu digeser sedikit menyesuaikan kebiasaan masjid, ubah atau tambahkan waktunya di sini.',
    },
    {
      target: '[data-tour="jadwal-status"]',
      title: 'Menyembunyikan satu waktu',
      body: 'Status nonaktif membuat baris itu hilang dari layar TV tanpa perlu dihapus — berguna untuk Imsak, Terbit, atau Dhuha bila tak ingin ditampilkan.',
    },
  ],

  '/kajian': [
    {
      target: '[data-tour="kajian-tabs"]',
      title: 'Tiga penyaring',
      body: 'Semua Kajian menampilkan seluruh data, Mendatang hanya yang belum lewat, Berulang hanya kajian rutin.',
    },
    {
      target: '[data-tour="kajian-list"]',
      openWith: '[data-tour="kajian-tab-berulang"]',
      title: 'Kajian rutin',
      body: 'Kajian bertanda BERULANG punya jadwal mingguan tetap sehingga tidak perlu dibuat ulang tiap pekan. Penandaannya saat ini diatur dari basis data, belum dari form di halaman ini.',
    },
    {
      target: '[data-tour="kajian-form"]',
      openWith: '[data-tour="kajian-add"]',
      title: 'Menambah kajian',
      body: 'Isi judul, ustadz, tanggal, dan jam. Kajian yang dibuat dari form ini berlaku sekali jalan.',
    },
    {
      target: '[data-tour="kajian-list"]',
      openWith: '[data-tour="kajian-tab-semua"]',
      title: 'Sampai ke jamaah',
      body: 'Tiga kajian terdekat otomatis muncul di layar TV dan di Dashboard, tanpa perlu dipublikasikan secara terpisah.',
    },
  ],

  '/keuangan': [
    {
      target: '[data-tour="keu-tabs"]',
      title: 'Tiga tampilan berbeda',
      body: 'Dashboard untuk melihat kondisi kas sekilas, Transaksi untuk mencatat dan menelusuri, Laporan untuk rekap bulanan yang bisa diunduh.',
    },
    {
      target: '[data-tour="keu-summary"]',
      openWith: '[data-tour="keu-tab-dashboard"]',
      title: 'Ringkasan kas',
      body: 'Saldo, pemasukan, dan pengeluaran bulan berjalan, lengkap dengan perbandingan terhadap bulan lalu. Saldo yang sama juga tampil di layar TV.',
    },
    {
      target: '[data-tour="keu-filter"]',
      openWith: '[data-tour="keu-tab-transaksi"]',
      title: 'Menelusuri transaksi',
      body: 'Saring berdasarkan rentang tanggal, jenis, kategori, metode pembayaran, atau kata kunci. Filter ini juga menentukan isi Export CSV.',
    },
    {
      target: '[data-tour="keu-form"]',
      openWith: ['[data-tour="keu-tab-transaksi"]', '[data-tour="keu-add"]'],
      title: 'Mencatat transaksi',
      body: 'Selain nominal dan kategori, isi juga metode pembayaran dan nomor referensi bila ada — keduanya yang membuat rekonsiliasi bulanan jadi mudah. Setiap perubahan tercatat di audit trail.',
    },
    {
      target: '[data-tour="keu-pdf"]',
      openWith: '[data-tour="keu-tab-laporan"]',
      title: 'Laporan bulanan siap cetak',
      body: 'Pilih bulan, tekan Lihat Laporan untuk memeriksanya, lalu Download PDF untuk berkas rapi bertanda kop masjid yang bisa langsung ditempel di papan pengumuman.',
    },
    {
      target: '[data-tour="keu-export"]',
      title: 'Export CSV mengikuti filter',
      body: 'Yang terunduh adalah transaksi sesuai filter yang sedang aktif, bukan seluruh data. Kosongkan filter lebih dulu bila ingin semuanya.',
    },
  ],

  '/agenda': [
    {
      target: '[data-tour="agenda-form"]',
      openWith: '[data-tour="agenda-add"]',
      title: 'Menambah agenda',
      body: 'Isi judul, tanggal, jam, dan lokasi. Agenda dipakai untuk kegiatan masjid di luar kajian rutin.',
    },
    {
      target: '[data-tour="agenda-status"]',
      title: 'Draft tidak tampil di TV',
      body: 'Hanya agenda berstatus Published yang muncul di layar TV dan Dashboard. Simpan sebagai Draft dulu bila tanggalnya belum pasti.',
    },
    {
      target: '[data-tour="agenda-list"]',
      title: 'Urutan tampil',
      body: 'Agenda tersusun menurut tanggal, dan tiga yang terdekat yang akan bergantian muncul di TV.',
    },
  ],

  '/running-text': [
    {
      target: '[data-tour="rt-form"]',
      openWith: '[data-tour="rt-add"]',
      title: 'Teks berjalan di TV',
      body: 'Teks yang ditulis di sini bergulir di bagian bawah layar TV. Pilih jenisnya — pengumuman, infaq, atau info — sebagai penanda isi.',
    },
    {
      target: '[data-tour="rt-urutan"]',
      title: 'Menentukan giliran',
      body: 'Angka urutan menentukan giliran bergulir di TV, dari kecil ke besar. Pengumuman penting beri angka terkecil.',
    },
    {
      target: '[data-tour="rt-table"]',
      title: 'Menonaktifkan tanpa menghapus',
      body: 'Teks berstatus nonaktif berhenti tampil di TV tapi tetap tersimpan, jadi pengumuman musiman bisa dipakai lagi tahun depan.',
    },
  ],

  '/laporan': [
    {
      target: '[data-tour="lap-form"]',
      openWith: '[data-tour="lap-add"]',
      title: 'Laporan kegiatan',
      body: 'Catat hasil kegiatan masjid — renovasi, bakti sosial, kegiatan edukasi — beserta tanggal dan uraiannya.',
    },
    {
      target: '[data-tour="lap-kategori"]',
      title: 'Kategori laporan',
      body: 'Kategori memudahkan jamaah dan pengurus menelusuri laporan lama, dan ikut tampil sebagai label saat laporan muncul di TV.',
    },
    {
      target: '[data-tour="lap-status"]',
      title: 'Publikasi ke jamaah',
      body: 'Laporan berstatus Published masuk ke panel rotasi layar TV lengkap dengan isinya. Draft hanya terlihat oleh pengurus.',
    },
  ],

  '/settings': [
    {
      target: '[data-tour="set-info"]',
      title: 'Identitas masjid',
      body: 'Nama dan alamat yang diisi di sini tampil di bagian header layar TV, jadi tulis sesuai yang ingin dibaca jamaah.',
    },
    {
      target: '[data-tour="set-preview"]',
      title: 'Pratinjau sebelum menyimpan',
      body: 'Gambaran kasar tampilan TV dengan pengaturan saat ini. Untuk melihat aslinya, buka tautan TV Display di bawah kotak ini.',
    },
    {
      target: '[data-tour="set-lokasi"]',
      title: 'Sumber jadwal otomatis',
      body: 'Provinsi dan kabupaten/kota di sini yang dipakai tombol Sync di menu Jadwal Sholat. Isi lebih dulu sebelum mencoba sinkronisasi.',
    },
    {
      target: '[data-tour="set-ikamah-toggle"]',
      title: 'Jeda Ikamah',
      body: 'Saat aktif, TV otomatis menampilkan notifikasi azan, hitung mundur ikamah, lalu layar gelap selama sholat berjamaah. Matikan di sini bila belum ingin dipakai.',
    },
    {
      target: '[data-tour="set-ikamah-durasi"]',
      title: 'Durasi per sholat',
      body: 'Tiap sholat bisa berbeda — misalnya ikamah Subuh 15 menit tapi Maghrib cukup 5 menit. Isi 0 untuk melewati salah satu fase. Sholat Jum’at otomatis dilewati karena diisi khutbah.',
    },
  ],

  '/monitoring': [
    {
      target: '[data-tour="mon-health"]',
      title: 'Kesehatan sistem',
      body: 'Uptime, memori, dan CPU server. Berguna saat panel terasa lambat dan Anda perlu tahu apakah masalahnya di server atau di jaringan masjid.',
    },
    {
      target: '[data-tour="mon-db"]',
      title: 'Isi basis data',
      body: 'Jumlah baris per tabel. Angka yang tak wajar di sini biasanya pertanda data ganda akibat impor berulang.',
    },
    {
      target: '[data-tour="mon-latency"]',
      title: 'Kecepatan respons',
      body: 'Sebaran waktu tanggap permintaan. Selama nilai p95 masih di bawah satu detik, panel berada dalam kondisi sehat.',
    },
    {
      target: '[data-tour="mon-danger"]',
      title: 'Dua tombol yang tidak bisa dibatalkan',
      body: 'Reset Metrics menghapus seluruh riwayat metrik. Clean Data menghapus seluruh konten masjid — kajian, agenda, keuangan, laporan — dan hanya menyisakan akun serta pengaturan. Keduanya permanen.',
    },
  ],

  '/users': [
    {
      target: '[data-tour="users-tabs"]',
      title: 'Dua halaman bersebelahan',
      body: 'Pengaturan dan Users berbagi tab yang sama, jadi berpindah antar keduanya tidak perlu lewat sidebar.',
    },
    {
      target: '[data-tour="users-form"]',
      openWith: '[data-tour="users-add"]',
      title: 'Menambah pengguna',
      body: 'Peran menentukan menu apa saja yang terlihat: takmir mengelola konten, bendahara hanya keuangan, marbot konten tanpa pengaturan, superadmin semuanya.',
    },
    {
      target: '[data-tour="users-table"]',
      title: 'Menjaga akses',
      body: 'Hapus akun yang sudah tidak dipakai, dan ganti password bawaan setiap akun baru sebelum diserahkan ke pemiliknya.',
    },
  ],
};

const PAGE_LABELS = {
  '/': 'Dashboard',
  '/jadwal-sholat': 'Jadwal Sholat',
  '/kajian': 'Kajian',
  '/keuangan': 'Keuangan',
  '/agenda': 'Agenda',
  '/running-text': 'Running Text',
  '/laporan': 'Laporan',
  '/settings': 'Pengaturan',
  '/monitoring': 'Monitoring',
  '/users': 'Users',
};

export const getPageTour = (pathname) => pageTours[pathname] || [];

export const pageTourLabel = (pathname) => PAGE_LABELS[pathname] || null;
```

- [ ] **Step 4: Jalankan test untuk memastikan lulus**

```bash
cd /Users/mac158/Documents/masjid/frontend/admin-panel && CI=true npx react-scripts test --watchAll=false src/components/onboarding/pageTours.test.js
```

Expected: PASS — 7 test lulus.

Bila test "selector cocok dengan markup" gagal, keluarannya menyebut rute dan nama `data-tour` yang hilang. Perbaiki dengan menambahkan atribut yang kurang di berkas halaman terkait (Task 1), bukan dengan melonggarkan test.

- [ ] **Step 5: Commit**

```bash
git add frontend/admin-panel/src/components/onboarding/pageTours.js frontend/admin-panel/src/components/onboarding/pageTours.test.js
git commit -m "feat(admin): add per-page tour content with static selector checks"
```

---

### Task 3: Hook penyetir dan pengukur

**Files:**
- Create: `frontend/admin-panel/src/components/onboarding/useTourTarget.js`

**Interfaces:**
- Consumes: bentuk langkah dari Task 2 (`{ target, openWith?, title, body }`).
- Produces: `useTourTarget(step, active)` — export default. Mengembalikan `rect` berbentuk `{ top, left, width, height, right, bottom }`, atau `null` bila target tidak ditemukan. Task 4 merender dari nilai ini.

- [ ] **Step 1: Tulis hook**

Buat `frontend/admin-panel/src/components/onboarding/useTourTarget.js`:

```js
import { useCallback, useEffect, useLayoutEffect, useState } from 'react';

// Berapa frame menunggu target muncul sebelum menyerah. Form yang baru dibuka
// butuh satu tick untuk terpasang; 10 frame (±160 ms) cukup longgar tanpa
// terasa menggantung.
const MAX_FRAMES = 10;

const nextFrame = () => new Promise((resolve) => requestAnimationFrame(() => resolve()));

const toArray = (v) => (v == null ? [] : Array.isArray(v) ? v : [v]);

// Satu-satunya bagian fitur ini yang menyentuh DOM halaman. Menyetir tampilan
// lebih dulu bila langkahnya meminta, lalu mengukur targetnya.
const useTourTarget = (step, active) => {
  const [rect, setRect] = useState(null);

  const measureOnly = useCallback(() => {
    if (!step) return;
    const el = document.querySelector(step.target);
    if (!el) return;
    const r = el.getBoundingClientRect();
    setRect({ top: r.top, left: r.left, width: r.width, height: r.height, right: r.right, bottom: r.bottom });
  }, [step]);

  useLayoutEffect(() => {
    if (!active || !step) {
      setRect(null);
      return undefined;
    }

    let cancelled = false;

    const run = async () => {
      // Buka jalan menuju target: klik tiap selector berurutan, beri satu frame
      // di antaranya supaya React sempat merender hasilnya.
      for (const selector of toArray(step.openWith)) {
        if (cancelled) return;
        const opener = document.querySelector(selector);
        if (opener) opener.click();
        await nextFrame();
      }

      for (let i = 0; i < MAX_FRAMES; i += 1) {
        if (cancelled) return;
        const el = document.querySelector(step.target);
        if (el) {
          el.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
          await nextFrame();
          if (cancelled) return;
          const r = el.getBoundingClientRect();
          setRect({ top: r.top, left: r.left, width: r.width, height: r.height, right: r.right, bottom: r.bottom });
          return;
        }
        await nextFrame();
      }

      // Menyerah: null berarti tooltip tampil di tengah tanpa sorotan, bukan
      // langkah yang hilang diam-diam.
      if (!cancelled) setRect(null);
    };

    setRect(null);
    run();

    return () => { cancelled = true; };
  }, [active, step]);

  // Sorotan harus ikut bergerak saat halaman digulir atau jendela diubah.
  useEffect(() => {
    if (!active) return undefined;
    const onChange = () => measureOnly();
    window.addEventListener('resize', onChange);
    window.addEventListener('scroll', onChange, true);
    return () => {
      window.removeEventListener('resize', onChange);
      window.removeEventListener('scroll', onChange, true);
    };
  }, [active, measureOnly]);

  return rect;
};

export default useTourTarget;
```

- [ ] **Step 2: Pastikan test dan build tetap lulus**

```bash
cd /Users/mac158/Documents/masjid/frontend/admin-panel && CI=true npx react-scripts test --watchAll=false
```

Expected: PASS — 7 test dari Task 2 tetap lulus.

```bash
cd /Users/mac158/Documents/masjid/frontend/admin-panel && PUBLIC_URL=/admin REACT_APP_API_URL=/api npx react-scripts build
```

Expected: `Compiled successfully`. Berkas ini belum dipakai siapa pun, jadi peringatan modul tak terpakai tidak muncul di CRA — tetapi kesalahan sintaksis akan.

- [ ] **Step 3: Commit**

```bash
git add frontend/admin-panel/src/components/onboarding/useTourTarget.js
git commit -m "feat(admin): add the tour hook that drives and measures one step"
```

---

### Task 4: Dua mode tur di context dan spotlight

**Files:**
- Modify: `frontend/admin-panel/src/components/onboarding/OnboardingContext.js`
- Modify: `frontend/admin-panel/src/components/onboarding/GuidedTour.js`

**Interfaces:**
- Consumes: `getPageTour(pathname)` dari Task 2; `useTourTarget(step, active)` dari Task 3; `visibleFeatures(role)` dari `content.js` yang sudah ada.
- Produces: context bernilai `{ welcomeOpen, mode, tourActive, stepIndex, steps, startMenuTour, startPageTour, stopTour, nextStep, prevStep, closeWelcome }`. `mode` bernilai `'menu'`, `'page'`, atau `null`. Task 5 dan 6 memakai nilai-nilai ini.

- [ ] **Step 1: Tulis ulang OnboardingContext.js**

Ganti seluruh isi `frontend/admin-panel/src/components/onboarding/OnboardingContext.js`:

```js
import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { visibleFeatures } from './content';
import { getPageTour } from './pageTours';

const OnboardingContext = createContext(null);

const flagKey = (userId) => `masjid_onboarding_seen_v1_${userId || 'anon'}`;

export const OnboardingProvider = ({ children }) => {
  const { user } = useAuth();
  const location = useLocation();
  const [welcomeOpen, setWelcomeOpen] = useState(false);
  const [mode, setMode] = useState(null); // 'menu' | 'page' | null
  const [pageSteps, setPageSteps] = useState([]);
  const [stepIndex, setStepIndex] = useState(0);

  const menuSteps = useMemo(() => visibleFeatures(user?.role), [user?.role]);

  const steps = mode === 'page' ? pageSteps : mode === 'menu' ? menuSteps : [];

  // Auto-show the welcome modal once per user on first login.
  useEffect(() => {
    if (!user?.id) return;
    let seen = false;
    try { seen = !!localStorage.getItem(flagKey(user.id)); } catch { /* ignore */ }
    if (!seen) setWelcomeOpen(true);
  }, [user?.id]);

  const markSeen = useCallback(() => {
    try { if (user?.id) localStorage.setItem(flagKey(user.id), '1'); } catch { /* ignore */ }
  }, [user?.id]);

  const closeWelcome = useCallback(() => {
    setWelcomeOpen(false);
    markSeen();
  }, [markSeen]);

  const stopTour = useCallback(() => {
    setMode(null);
    setPageSteps([]);
    markSeen();
  }, [markSeen]);

  const startMenuTour = useCallback(() => {
    setWelcomeOpen(false);
    setStepIndex(0);
    setPageSteps([]);
    setMode('menu');
  }, []);

  const startPageTour = useCallback((pathname) => {
    const found = getPageTour(pathname);
    if (found.length === 0) return;
    setWelcomeOpen(false);
    setStepIndex(0);
    setPageSteps(found);
    setMode('page');
  }, []);

  // Berhenti bila rute berubah: tur Keuangan tidak boleh terus berjalan di
  // atas halaman Agenda.
  useEffect(() => {
    setMode(null);
    setPageSteps([]);
  }, [location.pathname]);

  const nextStep = useCallback(() => {
    setStepIndex((i) => {
      if (i >= steps.length - 1) { stopTour(); return i; }
      return i + 1;
    });
  }, [steps.length, stopTour]);

  const prevStep = useCallback(() => setStepIndex((i) => Math.max(0, i - 1)), []);

  const value = {
    welcomeOpen, mode, tourActive: mode !== null, stepIndex, steps,
    startMenuTour, startPageTour, stopTour, nextStep, prevStep, closeWelcome,
  };

  return <OnboardingContext.Provider value={value}>{children}</OnboardingContext.Provider>;
};

export const useOnboarding = () => {
  const ctx = useContext(OnboardingContext);
  if (!ctx) throw new Error('useOnboarding must be used within an OnboardingProvider');
  return ctx;
};
```

Perhatikan: `openHelp` hilang (kode mati), dan `startTour` berganti nama jadi `startMenuTour`. Pemanggil lama akan rusak — diperbaiki di Step 3 dan Task 5.

- [ ] **Step 2: Sesuaikan GuidedTour.js**

Ganti seluruh isi `frontend/admin-panel/src/components/onboarding/GuidedTour.js`:

```jsx
import React, { useEffect } from 'react';
import { useOnboarding } from './OnboardingContext';
import useTourTarget from './useTourTarget';

const TOOLTIP_W = 320;

// Langkah tur menu memakai bentuk `features` (label/detail); langkah tur
// halaman memakai bentuk pageTours (title/body). Satu penerjemah kecil supaya
// penggambarnya tidak perlu tahu bedanya.
const readStep = (step, mode) =>
  mode === 'menu'
    ? { selector: `[data-tour="${step.key}"]`, title: step.label, body: step.detail }
    : { selector: step.target, title: step.title, body: step.body };

const GuidedTour = () => {
  const { tourActive, mode, stepIndex, steps, nextStep, prevStep, stopTour } = useOnboarding();

  const step = steps[stepIndex];
  const view = step ? readStep(step, mode) : null;

  // useTourTarget menerima bentuk seragam: target + openWith.
  const normalized = step
    ? (mode === 'menu' ? { target: view.selector } : step)
    : null;

  const rect = useTourTarget(normalized, tourActive);

  useEffect(() => {
    if (!tourActive) return undefined;
    const onKey = (e) => {
      if (e.key === 'Escape') stopTour();
      else if (e.key === 'ArrowRight') nextStep();
      else if (e.key === 'ArrowLeft') prevStep();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [tourActive, stopTour, nextStep, prevStep]);

  if (!tourActive || !step) return null;

  const isLast = stepIndex >= steps.length - 1;
  const pad = 6;

  // Tooltip di sebelah kanan sorotan bila muat, kalau tidak di kirinya.
  let tipStyle;
  if (rect) {
    let left = rect.right + 16;
    if (left + TOOLTIP_W > window.innerWidth - 12) left = Math.max(12, rect.left - TOOLTIP_W - 16);
    let top = rect.top - 6;
    top = Math.min(top, window.innerHeight - 240);
    top = Math.max(12, top);
    tipStyle = { left, top };
  } else {
    tipStyle = { left: '50%', top: '50%', transform: 'translate(-50%, -50%)' };
  }

  return (
    <div className="tour-root" aria-live="polite">
      <div className="tour-backdrop" onClick={(e) => e.stopPropagation()} />
      {rect && (
        <div
          className="tour-spotlight"
          style={{
            top: rect.top - pad,
            left: rect.left - pad,
            width: rect.width + pad * 2,
            height: rect.height + pad * 2,
          }}
        />
      )}
      <div className="tour-tooltip" style={tipStyle} role="dialog" aria-modal="true" aria-label={`Panduan: ${view.title}`}>
        <div className="tour-tooltip-head">
          <span className="tour-step-count">{stepIndex + 1} / {steps.length}</span>
          <button className="tour-close" onClick={stopTour} aria-label="Tutup tur">
            <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></svg>
          </button>
        </div>
        <h3 className="tour-tooltip-title">{view.title}</h3>
        <p className="tour-tooltip-body">{view.body}</p>
        <div className="tour-tooltip-actions">
          <button className="btn btn-ghost btn-sm tour-skip" onClick={stopTour}>Lewati</button>
          <div className="tour-nav">
            {stepIndex > 0 && <button className="btn btn-outline btn-sm" onClick={prevStep}>Sebelumnya</button>}
            <button className="btn btn-primary btn-sm" onClick={nextStep}>{isLast ? 'Selesai' : 'Berikutnya'}</button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default GuidedTour;
```

- [ ] **Step 3: Perbaiki pemanggil `startTour` yang lama**

Tiga tempat masih memanggil `startTour`, yang kini bernama `startMenuTour`:

- `frontend/admin-panel/src/pages/Panduan.js:10` dan `:20` — ganti `startTour` menjadi `startMenuTour` pada destructuring dan pada `onClick`.
- `frontend/admin-panel/src/components/onboarding/WelcomeModal.js` — ganti `startTour` menjadi `startMenuTour`.
- `frontend/admin-panel/src/components/Layout.js:53`, `:81`, `:127` — dibereskan di Task 5 saat tombolnya dihapus. Untuk sementara ganti namanya saja agar build tidak gagal.

Pastikan tidak ada sisa:

```bash
cd /Users/mac158/Documents/masjid/frontend/admin-panel/src && grep -rn "startTour\|openHelp" .
```

Expected: hanya baris yang memuat `startMenuTour` dan `startPageTour`.

- [ ] **Step 4: Verifikasi**

```bash
cd /Users/mac158/Documents/masjid/frontend/admin-panel && CI=true npx react-scripts test --watchAll=false
cd /Users/mac158/Documents/masjid/frontend/admin-panel && PUBLIC_URL=/admin REACT_APP_API_URL=/api npx react-scripts build
```

Expected: 7 test lulus; `Compiled successfully` tanpa peringatan baru.

- [ ] **Step 5: Commit**

```bash
git add frontend/admin-panel/src/components/onboarding frontend/admin-panel/src/pages/Panduan.js frontend/admin-panel/src/components/Layout.js
git commit -m "feat(admin): teach the tour engine two modes, menu and page"
```

---

### Task 5: Tombol mengambang menggantikan tombol "?"

**Files:**
- Create: `frontend/admin-panel/src/components/onboarding/HelpButton.js`
- Modify: `frontend/admin-panel/src/components/Layout.js`
- Modify: `frontend/admin-panel/src/styles/admin.css`

**Interfaces:**
- Consumes: `startMenuTour`, `startPageTour`, `tourActive` dari context Task 4; `getPageTour` dan `pageTourLabel` dari Task 2.
- Produces: `HelpButton` — export default, tanpa props. Dipasang sekali di `Layout`.

- [ ] **Step 1: Tulis HelpButton.js**

Buat `frontend/admin-panel/src/components/onboarding/HelpButton.js`:

```jsx
import React, { useEffect, useRef, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useOnboarding } from './OnboardingContext';
import { getPageTour, pageTourLabel } from './pageTours';

const HelpIcon = () => (
  <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10" />
    <path d="M9.1 9a3 3 0 0 1 5.8 1c0 2-3 3-3 3" />
    <line x1="12" y1="17" x2="12.01" y2="17" />
  </svg>
);

const HelpButton = () => {
  const { startMenuTour, startPageTour, tourActive } = useOnboarding();
  const location = useLocation();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const rootRef = useRef(null);

  const pageSteps = getPageTour(location.pathname);
  const label = pageTourLabel(location.pathname);

  useEffect(() => setOpen(false), [location.pathname]);

  useEffect(() => {
    if (!open) return undefined;
    const onDown = (e) => {
      if (rootRef.current && !rootRef.current.contains(e.target)) setOpen(false);
    };
    const onKey = (e) => { if (e.key === 'Escape') setOpen(false); };
    document.addEventListener('mousedown', onDown);
    window.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('mousedown', onDown);
      window.removeEventListener('keydown', onKey);
    };
  }, [open]);

  // Menyingkir selama tur berjalan supaya tidak menutupi sorotan atau tooltip.
  if (tourActive) return null;

  const run = (fn) => { setOpen(false); fn(); };

  return (
    <div className="help-fab-root" ref={rootRef}>
      {open && (
        <div className="help-fab-menu" role="menu" aria-label="Bantuan">
          <button
            type="button"
            role="menuitem"
            className="help-fab-item"
            disabled={pageSteps.length === 0}
            onClick={() => run(() => startPageTour(location.pathname))}
          >
            <span className="help-fab-item-title">Pandu halaman ini</span>
            <span className="help-fab-item-sub">
              {pageSteps.length > 0 ? `${label} · ${pageSteps.length} langkah` : 'Belum tersedia untuk halaman ini'}
            </span>
          </button>
          <button type="button" role="menuitem" className="help-fab-item" onClick={() => run(startMenuTour)}>
            <span className="help-fab-item-title">Tur peta menu</span>
            <span className="help-fab-item-sub">Kenali seluruh menu panel</span>
          </button>
          <button type="button" role="menuitem" className="help-fab-item" onClick={() => run(() => navigate('/panduan'))}>
            <span className="help-fab-item-title">Buka halaman Panduan</span>
            <span className="help-fab-item-sub">Ringkasan fitur & tabel peran</span>
          </button>
        </div>
      )}
      <button
        type="button"
        className="help-fab"
        onClick={() => setOpen((v) => !v)}
        aria-haspopup="menu"
        aria-expanded={open}
        aria-label="Bantuan dan panduan"
      >
        <HelpIcon />
      </button>
    </div>
  );
};

export default HelpButton;
```

- [ ] **Step 2: Pasang di Layout.js dan hapus dua tombol "?"**

Di `frontend/admin-panel/src/components/Layout.js`:

1. Hapus import `useOnboarding` di baris 4 dan pemakaian `const { startMenuTour } = useOnboarding();` di baris 53 — `Layout` tidak lagi memerlukannya.
2. Tambahkan `import HelpButton from './onboarding/HelpButton';` di antara import lain.
3. Hapus tombol "?" di topbar HP (baris 81-83, tombol dengan `aria-label="Mulai tur panduan"`).
4. Hapus tombol "?" di sidebar footer (baris 127, tombol dengan `className="sidebar-logout sidebar-help"`).
5. Render `<HelpButton />` sebagai elemen terakhir di dalam `<div className="admin-layout">`, sejajar dengan `<aside>` dan konten utama.

- [ ] **Step 3: Tambahkan gaya**

Tambahkan di akhir `frontend/admin-panel/src/styles/admin.css`:

```css

/* ── Tombol bantuan mengambang ────────────────────────────────────── */

.help-fab-root {
  position: fixed;
  right: 24px;
  bottom: 24px;
  z-index: 900; /* di bawah .tour-backdrop, tombol memang menyingkir saat tur */
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 10px;
}

.help-fab {
  width: 48px;
  height: 48px;
  border-radius: 50%;
  border: none;
  background: var(--emerald-600);
  color: #fff;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  box-shadow: 0 6px 20px rgba(11, 61, 46, 0.28);
  transition: transform 0.2s var(--ease-out), background 0.2s;
}

.help-fab:hover { transform: translateY(-2px); background: var(--emerald-700); }
.help-fab:focus-visible { outline: 2px solid var(--amber-500); outline-offset: 2px; }

.help-fab-menu {
  min-width: 260px;
  background: var(--bg-elevated);
  border: 1px solid var(--border-light);
  border-radius: var(--radius);
  box-shadow: 0 12px 32px rgba(0, 0, 0, 0.16);
  overflow: hidden;
}

.help-fab-item {
  display: flex;
  flex-direction: column;
  gap: 2px;
  width: 100%;
  padding: 12px 16px;
  border: none;
  background: none;
  text-align: left;
  cursor: pointer;
  transition: background 0.15s;
}

.help-fab-item + .help-fab-item { border-top: 1px solid var(--border-light); }
.help-fab-item:hover:not(:disabled) { background: var(--bg-page); }
.help-fab-item:disabled { cursor: not-allowed; opacity: 0.55; }

.help-fab-item-title { font-size: 0.875rem; font-weight: 600; color: var(--text-primary); }
.help-fab-item-sub { font-size: 0.75rem; color: var(--text-muted); }

@media (max-width: 768px) {
  .help-fab-root { right: 16px; bottom: 16px; }
  .help-fab { width: 44px; height: 44px; }
  .help-fab-menu { min-width: 220px; }
}
```

Seluruh variabel di atas sudah diperiksa terdaftar di blok `:root` `admin.css`: `--emerald-600`, `--emerald-700`, `--amber-500`, `--bg-elevated`, `--bg-page`, `--border-light`, `--text-primary`, `--text-muted`, `--radius`, `--ease-out`. Jangan menambah variabel baru — nama yang tidak terdaftar tidak memunculkan error, hanya warna kosong.

- [ ] **Step 4: Verifikasi**

```bash
cd /Users/mac158/Documents/masjid/frontend/admin-panel && CI=true npx react-scripts test --watchAll=false
cd /Users/mac158/Documents/masjid/frontend/admin-panel && PUBLIC_URL=/admin REACT_APP_API_URL=/api npx react-scripts build
```

Expected: 7 test lulus; `Compiled successfully` tanpa peringatan baru. Peringatan variabel tak terpakai di `Layout.js` berarti ada sisa dari Step 2 yang belum dibersihkan.

- [ ] **Step 5: Commit**

```bash
git add frontend/admin-panel/src/components frontend/admin-panel/src/styles/admin.css
git commit -m "feat(admin): replace the two help buttons with one floating help menu"
```

---

### Task 6: Varian kartu geser untuk tur menu di HP

**Files:**
- Create: `frontend/admin-panel/src/components/onboarding/MenuTourCards.js`
- Modify: `frontend/admin-panel/src/components/onboarding/GuidedTour.js`
- Modify: `frontend/admin-panel/src/styles/admin.css`

**Interfaces:**
- Consumes: context Task 4; `features` dari `content.js`.
- Produces: `MenuTourCards` — export default, tanpa props.

- [ ] **Step 1: Tulis MenuTourCards.js**

Buat `frontend/admin-panel/src/components/onboarding/MenuTourCards.js`:

```jsx
import React, { useEffect } from 'react';
import { useOnboarding } from './OnboardingContext';

// Di layar HP sidebar berada di luar layar (translateX(-100%)), jadi menyorotnya
// berarti menunjuk ke ketiadaan. Tur peta menu di sini berganti bentuk jadi
// kartu layar penuh; tur halaman tetap memakai spotlight karena isinya memang
// terlihat.
const MenuTourCards = () => {
  const { stepIndex, steps, nextStep, prevStep, stopTour } = useOnboarding();

  useEffect(() => {
    const onKey = (e) => {
      if (e.key === 'Escape') stopTour();
      else if (e.key === 'ArrowRight') nextStep();
      else if (e.key === 'ArrowLeft') prevStep();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [stopTour, nextStep, prevStep]);

  const step = steps[stepIndex];
  if (!step) return null;

  const isLast = stepIndex >= steps.length - 1;

  return (
    <div className="menu-cards-root" role="dialog" aria-modal="true" aria-label={`Panduan: ${step.label}`}>
      <div className="menu-cards-card">
        <div className="menu-cards-head">
          <span className="tour-step-count">{stepIndex + 1} / {steps.length}</span>
          <button className="tour-close" onClick={stopTour} aria-label="Tutup tur">
            <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></svg>
          </button>
        </div>
        <h3 className="menu-cards-title">{step.label}</h3>
        <p className="menu-cards-body">{step.detail}</p>
        <div className="menu-cards-dots" aria-hidden="true">
          {steps.map((s, i) => (
            <span key={s.key} className={`menu-cards-dot ${i === stepIndex ? 'on' : ''}`} />
          ))}
        </div>
        <div className="menu-cards-actions">
          <button className="btn btn-ghost btn-sm" onClick={stopTour}>Lewati</button>
          <div className="tour-nav">
            {stepIndex > 0 && <button className="btn btn-outline btn-sm" onClick={prevStep}>Sebelumnya</button>}
            <button className="btn btn-primary btn-sm" onClick={nextStep}>{isLast ? 'Selesai' : 'Berikutnya'}</button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MenuTourCards;
```

- [ ] **Step 2: Alihkan GuidedTour ke varian kartu di HP**

Di `frontend/admin-panel/src/components/onboarding/GuidedTour.js`, tambahkan import dan pengalihan. Tambahkan di antara import:

```jsx
import MenuTourCards from './MenuTourCards';
```

Tambahkan hook lebar layar tepat setelah pemanggilan `useOnboarding()` — harus dipanggil tanpa syarat, di atas early return mana pun:

```jsx
  // 768 px adalah ambang yang sama dengan media query tempat sidebar jadi
  // off-canvas (admin.css). Menyamakannya mencegah JS dan CSS berselisih.
  const [isPhone, setIsPhone] = useState(() => window.matchMedia('(max-width: 768px)').matches);

  useEffect(() => {
    const mq = window.matchMedia('(max-width: 768px)');
    const onChange = (e) => setIsPhone(e.matches);
    mq.addEventListener('change', onChange);
    return () => mq.removeEventListener('change', onChange);
  }, []);
```

Tambahkan `useState` ke import React di baris pertama.

Lalu tepat sebelum `if (!tourActive || !step) return null;`, sisipkan pengalihan:

```jsx
  if (tourActive && mode === 'menu' && isPhone) return <MenuTourCards />;
```

- [ ] **Step 3: Tambahkan gaya kartu**

Tambahkan di akhir `frontend/admin-panel/src/styles/admin.css`:

```css

/* ── Tur peta menu di HP: kartu layar penuh ───────────────────────── */

.menu-cards-root {
  position: fixed;
  inset: 0;
  z-index: 1100;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 20px;
  background: rgba(6, 26, 20, 0.72);
}

.menu-cards-card {
  width: 100%;
  max-width: 420px;
  background: var(--bg-elevated);
  border-radius: var(--radius);
  padding: 20px;
  box-shadow: 0 16px 40px rgba(0, 0, 0, 0.24);
}

.menu-cards-head { display: flex; align-items: center; justify-content: space-between; margin-bottom: 12px; }
.menu-cards-title { font-size: 1.25rem; margin: 0 0 8px; color: var(--text-primary); }
.menu-cards-body { font-size: 0.9rem; line-height: 1.6; color: var(--text-secondary); margin: 0 0 20px; }

.menu-cards-dots { display: flex; gap: 6px; justify-content: center; margin-bottom: 20px; }
.menu-cards-dot { width: 6px; height: 6px; border-radius: 50%; background: var(--border-light); transition: background 0.2s, width 0.2s; }
.menu-cards-dot.on { width: 18px; border-radius: 3px; background: var(--emerald-600); }

.menu-cards-actions { display: flex; align-items: center; justify-content: space-between; gap: 8px; }
```

Variabel yang dipakai di sini (`--bg-elevated`, `--border-light`, `--emerald-600`, `--text-primary`, `--text-secondary`, `--radius`) sudah diperiksa terdaftar di `:root` `admin.css`.

- [ ] **Step 4: Verifikasi**

```bash
cd /Users/mac158/Documents/masjid/frontend/admin-panel && CI=true npx react-scripts test --watchAll=false
cd /Users/mac158/Documents/masjid/frontend/admin-panel && PUBLIC_URL=/admin REACT_APP_API_URL=/api npx react-scripts build
```

Expected: 7 test lulus; `Compiled successfully` tanpa peringatan baru.

- [ ] **Step 5: Commit**

```bash
git add frontend/admin-panel/src/components/onboarding frontend/admin-panel/src/styles/admin.css
git commit -m "feat(admin): swap the menu tour for swipe cards on phones"
```

---

### Task 7: Dokumentasi dan build Vercel

**Files:**
- Modify: `CLAUDE.md`
- Modify: `admin/` (hasil build)

**Interfaces:**
- Consumes: seluruh perilaku dari Task 1-6.
- Produces: tidak ada antarmuka kode.

- [ ] **Step 1: Perbarui CLAUDE.md**

Di bagian **Project Structure**, di bawah daftar `components/onboarding/`, tambahkan empat berkas baru:

```
│           ├── pageTours.js         # Per-page tour content (38 steps, keyed by route)
│           ├── useTourTarget.js     # Drives openWith clicks, measures the target
│           ├── HelpButton.js        # Floating help menu (replaces the old "?" buttons)
│           └── MenuTourCards.js     # Phone variant of the menu tour
```

Di bagian **Key Features → Onboarding**, ganti kalimatnya menjadi:

```markdown
- **Onboarding:** First-login welcome modal (role-aware) + two tours sharing one engine — a 10-step **menu tour** that maps the sidebar, and **per-page tours** (38 steps across 10 pages) that spotlight real controls and drive the page to reveal them (switching tabs, opening forms). Both run from one floating help button. On phones (≤768px) the menu tour becomes full-screen swipe cards, since the sidebar is off-canvas there. Permanent **Panduan** page (feature guide + role/permission table). Seen-state stored per user in `localStorage` (`masjid_onboarding_seen_v1_<userId>`)
```

Di bagian **Conventions**, tambahkan:

```markdown
- Tour steps are pure data in `pageTours.js`; pages only carry `data-tour` attributes and never import the tour. `useTourTarget` is the only code that touches page DOM
- `pageTours.test.js` statically verifies every `data-tour` selector referenced by a step actually exists in the page sources — the guard against markup drifting away from tour content
```

- [ ] **Step 2: Jalankan seluruh test**

```bash
cd /Users/mac158/Documents/masjid/frontend/admin-panel && CI=true npx react-scripts test --watchAll=false
cd /Users/mac158/Documents/masjid/frontend/tv-display && CI=true npx react-scripts test --watchAll=false
```

Expected: 7 test lulus di admin panel; 36 test lulus di TV display (tidak tersentuh, tapi pastikan tidak ada regresi).

- [ ] **Step 3: Build untuk Vercel**

```bash
cd /Users/mac158/Documents/masjid && npm run build:vercel
```

Expected: berakhir dengan `🎉 All done! Ready to commit and push to Vercel.` Periksa `git status`: `admin/` harus berubah; `tv/` dan `api/backend/` tidak boleh berubah sama sekali karena tidak disentuh.

- [ ] **Step 4: Commit**

```bash
git add CLAUDE.md admin/
git commit -m "docs: document the layered tour and ship the admin build"
```

---

## Self-Review

**Cakupan spec:**

| Bagian spec | Task |
|---|---|
| §2 `openHelp` kode mati | 4 (dihapus) |
| §2 tur rusak di HP | 6 (varian kartu) |
| §2 tur menampilkan `short`, bukan `detail` | 4 (`readStep` memakai `detail`) |
| §4 arsitektur, daftar berkas | 1-6 |
| §4 bentuk langkah, `openWith` larik | 2 (data), 3 (eksekusi) |
| §5 isi tur peta menu | 4 |
| §5 38 langkah tur halaman | 1 (atribut), 2 (isi) |
| §6 menyetir, navigasi, progress, HP, tombol mengambang | 3, 4, 5, 6 |
| §7 penanganan kegagalan | 3 (target hilang → rect null), 4 (rute berubah → tur berhenti), 5 (halaman tanpa tur → item nonaktif) |
| §8 dua test statis | 2 |
| §9 deployment | 7 |

**Konsistensi antarmuka:** `getPageTour(pathname)` dan `pageTourLabel(pathname)` didefinisikan di Task 2 dan dipakai dengan nama yang sama di Task 4 dan Task 5. `useTourTarget(step, active)` didefinisikan di Task 3 dan dipanggil dengan urutan argumen yang sama di Task 4. Context Task 4 mengekspor `startMenuTour`, `startPageTour`, `tourActive`, dan `mode`; keempatnya dipakai persis dengan nama itu di Task 5 dan Task 6. Nilai `mode` hanya `'menu'`, `'page'`, atau `null` di seluruh rencana.

**Catatan risiko yang sudah ditangani di dalam rencana:** CSS di Task 5 dan Task 6 semula memakai `--surface` dan `--surface-hover`, dua variabel yang **tidak ada** di `admin.css` — keduanya sudah diganti dengan `--bg-elevated` dan `--bg-page` yang benar-benar terdaftar. Variabel CSS yang salah nama tidak memunculkan error, hanya warna kosong, sehingga kekeliruan seperti ini lolos dari build dan baru terlihat di layar.
