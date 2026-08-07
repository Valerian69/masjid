# Jeda Ikamah & Layar Sholat — Design Spec

**Tanggal:** 2026-08-06
**Status:** Disetujui, siap masuk tahap perencanaan implementasi

## 1. Ringkasan

TV display masjid saat ini hanya menampilkan satu tampilan: jadwal sholat, hitung mundur, dan panel informasi yang berotasi. Spec ini menambahkan tiga fase tampilan yang dipicu otomatis oleh masuknya waktu sholat fardhu:

1. **Azan** — notifikasi layar penuh selama 2 menit saat waktu sholat masuk.
2. **Ikamah** — hitung mundur menit:detik menuju ikamah, dengan imbauan menonaktifkan ponsel.
3. **Sholat (layar gelap)** — layar hitam selama sholat berjamaah berlangsung, lalu kembali normal.

Durasi tiap fase dapat diatur per sholat dari panel admin.

## 2. Keputusan desain

| Keputusan | Pilihan | Alasan |
|---|---|---|
| Sholat yang memicu | Hanya 5 fardhu (Subuh, Dzuhur, Ashar, Maghrib, Isya) | Tabel `jadwal_sholat` juga berisi Imsak, Terbit, dan Dhuha yang tidak punya ikamah |
| Penyimpanan konfigurasi | Key terpisah per sholat di tabel `settings` | Tahan terhadap `POST /api/jadwal-sholat/sync` yang menghapus dan menyisipkan ulang seluruh baris jadwal |
| Hubungan azan dan ikamah | Fase azan berada **di dalam** durasi ikamah | "Ikamah 15 menit" berarti ikamah tepat 15 menit setelah azan — sesuai cara takmir menghitung |
| Hari Jumat | Sholat Jum'at (Dzuhur) dilewati total | Diisi khutbah; Subuh, Ashar, Maghrib, dan Isya di hari Jumat tetap berjalan normal |
| Kontrol manual | Hanya saklar global di panel admin | Tidak ada penanganan tombol remote — mengurangi state tersembunyi dan risiko salah pencet |
| Sumber waktu | Jam browser apa adanya (`moment()`) | Konsisten dengan `Header.js`, `NextPrayer.js`, dan `PrayerSchedule.js` yang sudah ada |
| Tampilan layar gelap | Hitam dengan teks status sangat redup | Menegaskan TV berfungsi normal, bukan mati |
| Arsitektur state | Fungsi murni yang diturunkan dari jam | Pulih sendiri setelah reboot tanpa kode recovery, dan mudah diuji |

### Alternatif yang ditolak

- **State machine `useReducer` + `setTimeout` berantai.** Rentan throttling timer di Android WebView, drift pada timeout panjang, dan butuh kode rekonstruksi state setelah reload yang isinya sama saja dengan pendekatan turunan.
- **Fase dihitung di backend.** Polling 30 detik membuat transisi telat hingga 30 detik, sementara hitung mundur per detik tetap harus dihitung lokal — logika jadi terduplikasi di dua tempat.
- **Kolom `durasi_ikamah` / `durasi_sholat` di tabel `jadwal_sholat`.** Akan terhapus setiap kali takmir menekan "Sinkron Sekarang", karena `backend/routes/jadwalSholat.js:144-156` menghapus seluruh baris lalu menyisipkan ulang dan hanya mempertahankan `is_active`.
- **Koreksi jam terhadap header `Date` dari server.** Ditolak demi konsistensi dengan komponen lain; diasumsikan Android TV box tersambung internet dengan jam otomatis aktif.

## 3. Arsitektur

Tidak ada perubahan pada backend. `PUT /api/settings` sudah melakukan upsert untuk key apa pun yang belum ada (`backend/routes/settings.js:33-39`), dan `GET /api/dashboard` sudah mengirim seluruh isi tabel `settings` (`backend/routes/dashboard.js:28-30`). Direktori `api/` tidak tersentuh.

```
GET /api/dashboard  (tiap 30 detik, sudah ada di App.js:29)
        │
        ├─ data.settings ──────► parseConfig()   ── 11 key + default fallback
        │                            │
        ├─ data.jadwal_sholat ───────┤
                                     ▼
                          usePrayerPhase(jadwal, config)
                                     │  tick 1 detik
                                     ▼
                          computePhase(now, jadwal, config)   ← fungsi murni
                                     │
                     ┌───────────────┴───────────────┐
                  NORMAL                     AZAN / IKAMAH / BLANK
                     │                                │
             tampilan biasa                 <PrayerPhaseOverlay />
             (tanpa overlay)                 position: fixed, z-index atas
                                             UI normal tetap mounted di bawah
```

### Berkas

| Berkas | Peran |
|---|---|
| `frontend/tv-display/src/lib/prayerPhase.js` *(baru)* | `computePhase()` dan `parseConfig()` — murni, tanpa React |
| `frontend/tv-display/src/lib/prayerPhase.test.js` *(baru)* | Unit test dengan `now` yang disuntik |
| `frontend/tv-display/src/hooks/usePrayerPhase.js` *(baru)* | Tick 1 detik dan memoisasi |
| `frontend/tv-display/src/components/PrayerPhaseOverlay.js` *(baru)* | Render ketiga fase, murni presentasional |
| `frontend/tv-display/src/components/PhaseErrorBoundary.js` *(baru)* | Error boundary pelindung overlay |
| `frontend/tv-display/src/App.js` | Pasang hook dan render overlay bersyarat |
| `frontend/tv-display/src/styles/global.css` | Gaya overlay |
| `frontend/admin-panel/src/pages/Settings.js` | Kartu "Jeda Ikamah" |
| `supabase/seed.sql` | 11 key default untuk deployment baru |
| `CLAUDE.md` | Daftar key settings baru dan deskripsi fitur |

## 4. Kontrak konfigurasi

Seluruh nilai di tabel `settings` bertipe TEXT. `parseConfig()` mengubahnya menjadi angka dan jatuh ke default bila nilainya kosong, bukan angka, negatif, atau lebih dari 120. Nilai pecahan dalam rentang yang sah (mis. `10.5`) dipangkas ke bawah (`Math.floor`) alih-alih ditolak — dianggap lebih ramah daripada melompat ke default, dan form admin memakai `step="1"` sehingga nilai pecahan tidak pernah benar-benar diketik lewat UI.

| Key | Default | Arti |
|---|---|---|
| `iqomah_enabled` | `true` | Saklar global. Bila key belum ada di database, fitur dianggap **aktif**. Bila key ada tetapi nilainya bukan string `"true"`, fitur dianggap nonaktif |
| `ikamah_subuh` | `15` | Menit dari azan sampai ikamah |
| `ikamah_dzuhur` | `10` | idem |
| `ikamah_ashar` | `10` | idem |
| `ikamah_maghrib` | `5` | idem |
| `ikamah_isya` | `10` | idem |
| `sholat_subuh` | `15` | Menit layar gelap |
| `sholat_dzuhur` | `15` | idem |
| `sholat_ashar` | `15` | idem |
| `sholat_maghrib` | `15` | idem |
| `sholat_isya` | `15` | idem |

Nilai `0` berarti fase tersebut dilewati. `ikamah_x=0` membuat fase azan dan ikamah dilewati sehingga layar langsung gelap saat waktu masuk; `sholat_x=0` membuat tampilan langsung kembali normal setelah hitung mundur habis.

## 5. Logika fase

```js
const FARDHU = ['Subuh', 'Dzuhur', 'Ashar', 'Maghrib', 'Isya'];

computePhase(now, jadwal, config) {
  if (!config.enabled) return { phase: 'normal' };

  const current = sholatFardhuTerakhirYangSudahLewat(now, jadwal);
  if (!current) return { phase: 'normal' };                 // sebelum Subuh
  if (now.day() === 5 && current.key === 'dzuhur')          // Jum'at dilewati
    return { phase: 'normal' };

  const elapsed = now - current.waktu;                      // detik
  const ikamah  = config.ikamah[current.key] * 60;
  const sholat  = config.sholat[current.key] * 60;

  if (elapsed < Math.min(120, ikamah)) return { phase: 'azan',   prayer: current };
  if (elapsed < ikamah)                return { phase: 'ikamah', prayer: current, sisa: ikamah - elapsed };
  if (elapsed < ikamah + sholat)       return { phase: 'blank',  prayer: current };
  return { phase: 'normal' };
}
```

Fungsi mencari **sholat fardhu terakhir yang waktunya sudah lewat hari ini**, bukan melakukan iterasi maju. Dengan begitu, bila durasi yang dikonfigurasi kepanjangan sampai menabrak waktu sholat berikutnya, sholat yang lebih baru otomatis menang tanpa perlu kode khusus.

Fase azan memakai `min(120 detik, ikamah)` agar konfigurasi ekstrem seperti `ikamah_maghrib=1` tidak membuat notifikasi azan lebih panjang daripada jeda ikamahnya sendiri.

### Contoh linimasa

Subuh 04:45, `ikamah_subuh=15`, `sholat_subuh=15`:

```
04:45 ──────► 04:47   AZAN       notifikasi layar penuh
04:47 ──────► 05:00   IKAMAH     hitung mundur 13:00 → 00:00
05:00 ──────► 05:15   BLANK      layar gelap
05:15                 NORMAL
```

### Pencocokan nama sholat

Nama dinormalisasi dengan lowercase dan trim, lalu dicocokkan ke peta alias agar variasi ejaan yang lazim diketik takmir tetap dikenali:

| Key internal | Alias yang diterima |
|---|---|
| `subuh` | `subuh`, `shubuh` |
| `dzuhur` | `dzuhur`, `zuhur`, `dhuhur` |
| `ashar` | `ashar`, `asar` |
| `maghrib` | `maghrib`, `magrib` |
| `isya` | `isya`, `isha` |

Nama di luar peta ini diperlakukan sebagai bukan-fardhu dan diabaikan, termasuk Imsak, Terbit, dan Dhuha.

### Kasus tepi

| Kasus | Perilaku |
|---|---|
| `iqomah_enabled=false` | Selalu NORMAL, tanpa perhitungan lain |
| Jumat dan sholat saat ini Dzuhur | NORMAL; Subuh, Ashar, Maghrib, dan Isya di hari Jumat tetap berjalan |
| `ikamah=0` | Fase azan dan ikamah dilewati, langsung BLANK |
| `sholat=0` | Fase blank dilewati, langsung NORMAL |
| Fetch `/api/dashboard` gagal atau `jadwal` kosong | NORMAL — kegagalan tidak pernah menggelapkan layar |
| Format `waktu` rusak | Entri diabaikan; bila tidak ada entri valid, hasilnya NORMAL |
| Durasi menabrak sholat berikutnya | Sholat terbaru menang otomatis |
| Refresh 30 detik atau sinkron jadwal di tengah fase | Fase dihitung ulang dari data baru dan menyesuaikan sendiri |
| Reboot atau refresh browser | Fase pulih persis di posisi semula |

### Batas yang diketahui

Fase yang seharusnya melewati tengah malam terpotong di 00:00, karena perhitungan hanya melihat jadwal hari berjalan. Dalam praktik Isya ditambah 25 menit tidak pernah mendekati tengah malam, sehingga penanganan lintas-hari sengaja tidak ditambahkan.

## 6. Desain visual

Seluruh ukuran memakai satuan `vw` agar proporsinya tetap di TV 32" maupun 55".

Transisi memudar dua arah, konsisten dengan crossfade 0.8 detik pada rotasi halaman yang sudah ada. Container overlay tetap mounted sepanjang waktu dan hanya beralih `opacity` 0 ⇄ 1 (transition 0.8s) antara "tidak ada fase yang tampil" dan "azan/ikamah/blank sedang tampil" — termasuk saat kembali ke NORMAL, di mana container menahan (memegang) konten fase terakhir yang terlihat sambil memudar keluar, alih-alih memotong seketika dari layar gelap ke dashboard terang. Di dalam container, elemen konten di-key oleh string fase: berpindah fase (mis. azan → ikamah) me-remount elemen ini sehingga animasi masuknya (`phaseFadeIn`, fade-in 0.8 detik) berjalan ulang di atas latar container yang sudah tampil, membuat tiap fase punya kemunculan yang lembut tanpa ikut memudarkan seluruh container.

### Fase Azan

Latar `#061a14` dengan radial glow emerald yang bernapas 4 detik, senada dengan tampilan normal sehingga peralihannya terasa menyambung.

```
┌──────────────────────────────────────────────┐
│                                              │
│           TELAH MASUK WAKTU SHOLAT           │  2.2vw · amber #d4913d · tracking lebar
│                                              │
│                  MAGHRIB                     │  11vw · Outfit 700 · putih hangat
│                                              │
│                   17:57                      │  4vw · opacity 0.55
│                                              │
│         ╭────── glow bernapas ──────╮        │
└──────────────────────────────────────────────┘
```

### Fase Ikamah

Angka adalah elemen dominan, memakai `font-weight 300`. Pada ukuran 26vw, goresan tipis tetap terbaca sangat jelas dari jarak jauh sekaligus memancarkan cahaya jauh lebih sedikit daripada angka tebal.

```
┌──────────────────────────────────────────────┐
│                  MAGHRIB                     │  3vw · opacity 0.5
│                MENUJU IKAMAH                 │  2vw · amber · tracking lebar
│                                              │
│              0 4 : 3 7                       │  26vw · weight 300 · tabular-nums
│                                              │      warna #f0c66e · opacity 0.9
│      ┌────────────────────────────────┐      │
│      │  ▢  MOHON NONAKTIFKAN PONSEL   │      │  3vw · bingkai tipis + ikon
│      └────────────────────────────────┘      │
│  ▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔░░░░░░░░░░░░░░░░░░░░    │  progress tipis 3px di tepi bawah
└──────────────────────────────────────────────┘
```

Lapisan `.phase-dim` (hitam, di bawah konten) meredupkan latar dari opacity 0 ke 1 sepanjang hitung mundur, agar masuk ke layar gelap terasa mulus tanpa ikut meredupkan angka countdown itu sendiri. Pada 60 detik terakhir angka berdenyut halus sebagai penanda ikamah sudah dekat.

### Fase Blank

Latar `#000` murni dengan satu baris teks putih penuh.

```
┌──────────────────────────────────────────────┐
│                                              │
│                                              │
│          SEDANG SHOLAT BERJAMAAH             │  2.4vw · weight 300 · putih penuh
│                                              │
│                                              │
└──────────────────────────────────────────────┘
```

Teks ini semula dirancang nyaris tak terlihat (opacity 0.10) demi meminimalkan cahaya, tetapi diubah menjadi putih penuh atas permintaan: keterbacaan menang, karena satu-satunya fungsi teks ini adalah meyakinkan jamaah bahwa TV sedang bekerja dan bukan mati. Satu baris tipis di layar hitam tetap memancarkan cahaya jauh lebih sedikit daripada tampilan normal maupun fase hitung mundur.

Karena teks ini kini terang, statis selama 15 menit, dan berulang lima kali sehari, posisinya bergeser setiap menit untuk menahan burn-in pada panel yang menyala 24 jam. Jarak geser dinaikkan seiring kenaikan kecerahan — masih jauh di bawah tinggi hurufnya sehingga tidak terbaca sebagai gerakan. Implementasinya murni CSS dan tidak menambah state.

### Catatan operasional

Screensaver bawaan Android TV box perlu dimatikan dari pengaturan box. Ini sudah menjadi prasyarat sejak sebelum fitur ini ada, karena TV tidak pernah menerima input remote sepanjang hari. Tidak ada penanganan di sisi aplikasi.

## 7. Panel admin

Satu kartu baru di `frontend/admin-panel/src/pages/Settings.js`, memakai `<form>` dan tombol "Simpan Pengaturan" yang sudah ada sehingga tidak muncul tombol simpan kedua. Hak akses otomatis benar karena `PUT /api/settings` sudah dibatasi untuk `superadmin` dan `takmir`.

```
┌─ Jeda Ikamah ────────────────────────────────────────────┐
│  [ ✓ ]  Aktifkan Jeda Ikamah & Layar Sholat              │
│                                                          │
│  Sholat      Jeda Ikamah (menit)   Layar Gelap (menit)   │
│  Subuh       [ 15 ]                [ 15 ]                │
│  Dzuhur      [ 10 ]                [ 15 ]                │
│  Ashar       [ 10 ]                [ 15 ]                │
│  Maghrib     [  5 ]                [ 15 ]                │
│  Isya        [ 10 ]                [ 15 ]                │
│                                                          │
│  ℹ Sholat Jum'at dilewati — saat waktu Jum'at TV tetap   │
│    menampilkan tampilan normal. Sholat lain di hari      │
│    Jumat tetap berjalan seperti biasa.                   │
│    Isi 0 untuk melewati salah satu fase.                 │
└──────────────────────────────────────────────────────────┘
```

Input dibatasi bilangan bulat 0 sampai 120 di sisi klien. Karena backend menyimpan nilai apa adanya sebagai TEXT, `parseConfig()` di TV tetap menjadi garis pertahanan terakhir.

## 8. Penanganan error

Prinsipnya: kegagalan apa pun harus jatuh ke tampilan normal, tidak pernah ke layar gelap.

| Lapis | Kegagalan | Akibat |
|---|---|---|
| `parseConfig` | Nilai kosong, bukan angka, negatif, atau > 120 | Pakai default, TV tetap jalan |
| `computePhase` | `jadwal` null, kosong, atau format `waktu` rusak | Kembalikan NORMAL |
| `App.js` | Fetch `/api/dashboard` gagal | `data` null sehingga hasilnya NORMAL |
| `PhaseErrorBoundary` | Bug tak terduga saat render overlay | Overlay dilepas, tampilan normal tetap hidup |

Lapis terakhir ditambahkan secara sadar. Tanpa error boundary, satu error saat render akan membuat React 18 melepas seluruh root sehingga TV menampilkan layar putih kosong sampai ada yang me-reboot box — kegagalan yang tidak akan disadari siapa pun sampai waktu sholat berikutnya.

## 9. Pengujian

### Unit test

`frontend/tv-display/src/lib/prayerPhase.test.js` menguji fungsi murni dengan `now` yang disuntik, tanpa merender React:

- Batas tiap transisi: detik terakhir fase azan, detik pertama fase ikamah, detik terakhir ikamah, detik pertama blank, detik terakhir blank, detik pertama normal.
- Hari Jumat: Dzuhur menghasilkan NORMAL, sementara Subuh, Ashar, Maghrib, dan Isya tetap menghasilkan fase.
- `iqomah_enabled=false` selalu menghasilkan NORMAL.
- `jadwal` kosong, null, dan berisi format `waktu` rusak.
- `ikamah=0` dan `sholat=0`.
- Durasi yang menabrak waktu sholat berikutnya.
- Alias nama sholat, serta Imsak, Terbit, dan Dhuha yang harus diabaikan.
- `parseConfig` terhadap nilai kosong, bukan angka, negatif, dan lebih dari 120.

### Verifikasi manual

Tanpa menunggu waktu sholat asli:

1. Buka menu Jadwal Sholat di panel admin, ubah sementara jam salah satu sholat fardhu ke 2 menit dari sekarang.
2. Di menu Pengaturan, set jeda ikamah 1 menit dan layar gelap 1 menit untuk sholat tersebut.
3. Buka TV display dan amati keempat transisi dalam waktu sekitar 3 menit.
4. Refresh browser di tengah fase blank untuk memastikan fase pulih di posisi yang sama.
5. Tekan "Sinkron Sekarang" di menu Pengaturan untuk mengembalikan jadwal asli.

## 10. Deployment

Tidak ada perubahan backend, sehingga direktori `api/` tidak tersentuh.

1. Jalankan `npm run build:vercel` agar `tv/` dan `admin/` terbangun ulang.
2. Commit `tv/` dan `admin/` bersama kode sumber.
3. `supabase/seed.sql` diperbarui dengan 11 key default untuk deployment baru.
4. Deployment yang sudah berjalan cukup membuka menu Pengaturan dan menekan Simpan — key baru akan dibuat otomatis oleh mekanisme upsert.
5. `CLAUDE.md` ditambah daftar key settings baru dan deskripsi fitur.
