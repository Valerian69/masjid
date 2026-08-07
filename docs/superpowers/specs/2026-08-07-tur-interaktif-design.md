# Tur Interaktif Bertingkat — Design Spec

**Tanggal:** 2026-08-07
**Status:** Disetujui, siap masuk tahap perencanaan implementasi

## 1. Ringkasan

Panel admin sudah punya tur interaktif, tetapi turnya hanya menyorot sepuluh menu di sidebar dan tidak pernah berpindah halaman. Spec ini menambahkan lapisan kedua: **tur per halaman** yang menyorot kontrol nyata di dalam halaman yang sedang dibuka, menyetir tampilan bila perlu, dan menjelaskan hal-hal yang tidak terbaca dari layarnya sendiri.

Hasil akhirnya dua jenis tur di atas satu mesin yang sama:

1. **Tur peta menu** — 10 langkah, mengenalkan seluruh menu. Sudah ada; diperkaya isinya dan diperbaiki di layar HP.
2. **Tur halaman** — 38 langkah tersebar di 10 halaman, dijalankan saat pengguna membutuhkannya.

## 2. Masalah pada tur yang ada

Empat hal ditemukan saat menelaah kode sebelum merancang:

- **Tur tidak pernah memperlihatkan apa yang dijelaskannya.** Seluruh langkah menyorot sidebar (`components/Layout.js:111` adalah satu-satunya tempat `data-tour` dipasang) dan tur tidak berpindah halaman. Dijalankan dari halaman Panduan — pintu masuk utamanya — pengguna menatap halaman Panduan selama sepuluh langkah sementara tooltip bercerita tentang menu yang tak satu pun terlihat.
- **Tur memberi informasi lebih sedikit daripada halaman statisnya.** Tooltip hanya menampilkan `short` (satu kalimat), sementara teks `detail` yang jauh lebih kaya sudah ada di `content.js` dan hanya dipakai halaman Panduan (`pages/Panduan.js:44`).
- **Rusak di layar HP.** Sidebar berada di `transform: translateX(-100%)` (`styles/admin.css:2200`) — di luar layar tetapi tetap terukur oleh `getBoundingClientRect`. Spotlight digambar di luar viewport dan tooltip menempel di tepi kiri menunjuk ke ketiadaan.
- **`openHelp` adalah kode mati.** Didefinisikan dan diekspor di `OnboardingContext.js:55`, tetapi tidak pernah dipanggil dari mana pun; kedua tombol "?" memanggil `startTour` langsung.

## 3. Keputusan desain

| Keputusan | Pilihan | Alasan |
|---|---|---|
| Bentuk pendalaman | Tur bertingkat | Tur utama tetap ringkas; pengguna belajar mendalam hanya saat butuh, tidak dipaksa 48 langkah di hari pertama |
| Cakupan | Semua 10 halaman | Tombol bantuan selalu ada di mana pun pengguna berada — tidak ada halaman yang tombolnya mati |
| Target tersembunyi | Tur menyetir halaman | Tur menekan tab/tombol yang perlu agar targetnya terlihat; pengguna cukup menekan Berikutnya |
| Tur utama di HP | Kartu geser layar penuh | Spotlight ke sidebar off-canvas tidak masuk akal di layar sempit |
| Pintu masuk | Tombol mengambang, menggantikan kedua tombol "?" | Satu tempat untuk semua bantuan; tanpa menyentuh berkas halaman |
| Arsitektur langkah | Deklaratif lewat `data-tour` | Halaman tetap tidak tahu-menahu soal tur; menambah langkah nanti murni pekerjaan data |
| Progress | Tidak disimpan | Tur terpanjang 6 langkah; menyimpan posisi menambah state untuk masalah yang tidak terasa |

### Alternatif yang ditolak

- **Halaman mendaftarkan langkahnya sendiri (`useTourSteps`).** Menyetir lewat state React asli memang lebih bersih secara teknis, tetapi sepuluh berkas halaman jadi meng-import tur, isi tur tersebar di sepuluh tempat, dan jumlah langkah baru diketahui saat halaman termuat.
- **Query param di URL (`?tour=keuangan&step=3`).** Bisa di-deep-link, tetapi paling banyak kodenya, mengotori URL, dan tiap halaman tetap harus tahu soal tur — gabungan kelemahan dua pendekatan lain tanpa kelebihan sepadan untuk panel internal.
- **Hanya memperkaya isi tooltip.** Perubahan paling kecil, tetapi tidak menyentuh masalah utamanya: pengguna tetap tidak pernah melihat fitur yang sedang dijelaskan.
- **Melewati langkah yang targetnya tersembunyi.** Paling sedikit kode, tetapi pengguna bisa tidak pernah tahu fitur export PDF itu ada, tanpa sadar telah melewatkannya.

## 4. Arsitektur

Dua jenis tur berbagi satu mesin; yang membedakan hanya sumber langkahnya.

```
      HelpButton  (mengambang, kanan-bawah)
         ├─ "Pandu halaman ini"  → startPageTour(location.pathname)
         ├─ "Tur peta menu"      → startMenuTour()
         └─ "Halaman Panduan"    → navigate('/panduan')
                    │
         OnboardingContext { mode: 'menu' | 'page' | null, steps, stepIndex }
                    │
        ┌───────────┴────────────┐
   mode='menu' & layar HP      selainnya
        │                          │
  MenuTourCards              GuidedTour (spotlight)
  (kartu geser)                    │
                            useTourTarget(step)
                              ├─ klik `openWith` bila ada
                              ├─ tunggu satu frame render
                              └─ ukur rect target
```

`useTourTarget` adalah **satu-satunya bagian yang menyentuh DOM halaman.** Ia menerima satu langkah dan mengembalikan posisi kotak sorotan. Komponen di atasnya hanya menggambar; isi tur hanya data. Bila cara menyetir berubah kelak, hanya hook itu yang disentuh.

### Berkas

| Berkas | Peran |
|---|---|
| `onboarding/pageTours.js` *(baru)* | Data langkah semua halaman, dikunci per rute |
| `onboarding/useTourTarget.js` *(baru)* | Menyetir dan mengukur satu langkah; satu-satunya penyentuh DOM |
| `onboarding/MenuTourCards.js` *(baru)* | Varian kartu geser untuk tur peta menu di HP |
| `onboarding/HelpButton.js` *(baru)* | Tombol mengambang dan menu kecilnya |
| `onboarding/GuidedTour.js` | Penggambar spotlight; kini melayani dua jenis tur |
| `onboarding/OnboardingContext.js` | Dua mode tur, sadar rute; `openHelp` yang mati dihapus |
| `onboarding/content.js` | Tetap sebagai isi tur menu dan halaman Panduan |
| `components/Layout.js` | Dua tombol "?" dihapus, `HelpButton` dipasang |
| `styles/admin.css` | Gaya tombol mengambang dan kartu geser |
| 10 berkas halaman + 3 sub-komponen `pages/keuangan/` | **Hanya menambah atribut `data-tour`** — tanpa import, tanpa state |

### Bentuk satu langkah

```js
{
  target: '[data-tour="keu-export"]',        // wajib — elemen yang disorot
  openWith: '[data-tour="keu-tab-laporan"]', // opsional — diklik lebih dulu
  title: 'Unduh laporan bulanan',
  body: 'Rekap per bulan bisa diunduh sebagai PDF siap cetak atau CSV…',
}
```

`openWith` menerima satu selector **atau larik selector yang diklik berurutan**. Larik diperlukan karena sebagian target butuh dua tindakan: form transaksi baru di Keuangan hanya muncul setelah pindah ke tab Transaksi *lalu* menekan tombol "Transaksi Baru".

```js
{
  target: '[data-tour="keu-form"]',
  openWith: ['[data-tour="keu-tab-transaksi"]', '[data-tour="keu-add"]'],
  title: 'Mencatat transaksi',
  body: '…',
}
```

## 5. Isi tur

Prinsip pemilihan langkah: **jelaskan yang tidak terbaca dari layarnya sendiri.** Tombol "Hapus" tidak perlu dijelaskan. Yang perlu adalah keterkaitan antar menu, syarat yang harus dipenuhi lebih dulu, dan konsekuensi yang tidak terlihat — terutama "yang ini muncul di TV" dan "yang ini tidak bisa dibatalkan".

### Tur peta menu (10 langkah)

Tetap seperti sekarang, dengan satu perubahan: tooltip memakai teks `detail`, bukan `short`. Teksnya sudah ada dan sudah lebih kaya.

### Tur halaman (38 langkah)

| Halaman | Jml | Langkah |
|---|---|---|
| Dashboard | 3 | Empat kartu angka kunci · Kajian Terdekat dan asalnya · Agenda Terdekat dan asalnya |
| Jadwal Sholat | 4 | Tabel waktu — inilah yang tampil di TV · Sync EQuran.id, butuh lokasi diisi di Pengaturan dulu · Tambah manual untuk koreksi · Status nonaktif berarti hilang dari TV |
| Kajian | 4 | Tiga tab penyaring · Tab Berulang: kajian rutin cukup dibuat sekali · Form dengan pilihan hari berulang · Kajian terdekat muncul di TV dan Dashboard |
| Keuangan | 6 | Tiga tab dan bedanya · Kartu ringkasan dan tren 6 bulan · Filter transaksi · Form transaksi baru · Rekap bulanan dan unduh PDF · Export CSV mengikuti filter yang sedang aktif |
| Agenda | 3 | Form agenda · Draft tidak tampil di TV, hanya Published · Daftar dan urutannya |
| Running Text | 3 | Form teks dan jenis · Kolom urutan menentukan giliran bergulir di TV · Status aktif |
| Laporan | 3 | Form laporan · Kategori · Publish berarti masuk panel rotasi TV |
| Pengaturan | 5 | Nama dan alamat masjid tampil di header TV · Preview TV Display · Lokasi dan Sinkron Sekarang · Saklar Jeda Ikamah · Durasi per sholat dan catatan Jum'at dilewati |
| Monitoring | 4 | System Health · Database Collections · Latensi dan status request · Reset Metrics dan Clean Data tidak bisa dibatalkan |
| Users | 3 | Tab Pengaturan/Users · Form user dan peran · Tabel dan aksinya |

Sekitar sepuluh langkah memakai `openWith`, dalam dua bentuk. Yang memindahkan tab: tiga di Keuangan (ke tab Transaksi dan Laporan) dan satu di Kajian (tab Berulang). Yang membuka form dengan menekan tombol "Tambah": masing-masing satu di Jadwal Sholat, Kajian, Agenda, Running Text, Laporan, dan Users. Satu langkah — form transaksi di Keuangan — memakai bentuk larik karena butuh dua klik berurutan.

**Konsekuensi yang diterima secara sadar:** karena tur Keuangan berpindah tab dan membuka form, setelah tur selesai halaman tidak kembali ke keadaan semula — tab tertinggal di Laporan dan form transaksi mungkin terbuka. Ini harga dari tur yang menyetir, dan dipilih dengan sadar.

## 6. Perilaku

**Menyetir satu langkah.** `useTourTarget` menjalankan urutan yang sama setiap kali: klik tiap selector `openWith` berurutan → tunggu satu frame di antara klik → cari `target` → ukur → gulirkan ke tampak. Bila `target` belum ada, coba ulang hingga 10 frame (sekitar 160 ms) sebelum menyerah, karena form yang baru dibuka kadang butuh satu tick untuk terpasang.

**Navigasi** tetap seperti sekarang: panah kiri/kanan, Escape untuk keluar, tombol Sebelumnya/Berikutnya/Lewati, dan penghitung `x / N`. Latar gelap memblokir klik ke halaman selama tur berjalan. Sebagai jaring pengaman, **tur berhenti sendiri bila rute berubah**, mencegah tur Keuangan terus berjalan di atas halaman Agenda.

**Progress tidak disimpan.** Keluar di tengah lalu membuka lagi berarti mulai dari langkah pertama.

**Di layar HP** — didefinisikan sebagai lebar ≤ 768 px, ambang yang sama dengan media query tempat sidebar berubah jadi off-canvas (`styles/admin.css:2169`), sehingga tidak mungkin meleset dari perilaku CSS-nya. Tur halaman tetap memakai spotlight, karena isi halaman memang terlihat di layar kecil dan `scrollIntoView` yang sudah ada menanganinya. Yang berganti bentuk hanya tur peta menu, menjadi kartu geser layar penuh berisi ikon, nama menu, teks `detail`, serta indikator titik dan tombol maju/mundur.

**Tombol mengambang** duduk di pojok kanan-bawah dan **menghilang selama tur berjalan** supaya tidak menutupi sorotan maupun tooltip. Menunya berisi tiga baris: "Pandu halaman ini" (dengan nama halaman dan jumlah langkahnya), "Tur peta menu", dan "Buka halaman Panduan".

## 7. Penanganan kegagalan

| Kegagalan | Perilaku |
|---|---|
| `target` tidak ditemukan setelah beberapa kali coba | Tooltip tampil di tengah layar tanpa sorotan — langkah tidak pernah hilang diam-diam |
| `openWith` tidak ditemukan | Klik dilewati, target tetap dicoba diukur |
| Halaman tidak punya entri di `pageTours.js` | Baris "Pandu halaman ini" tampil nonaktif dengan keterangan singkat |
| Rute berubah di tengah tur | Tur berhenti |

## 8. Pengujian

Panel admin belum punya test sama sekali, dan menambah `@testing-library/react` berada di luar cakupan. Dua test statis berikut menutup risiko terbesar arsitektur ini tanpa dependensi baru — keduanya murni operasi berkas dan berjalan di Jest bawaan CRA.

1. **Selector cocok dengan markup.** Test membaca `pageTours.js`, mengumpulkan semua nilai `target` dan `openWith`, lalu memindai berkas sumber halaman untuk memastikan setiap `data-tour` yang dirujuk benar-benar ada. Ini menangkap kegagalan yang paling mungkin terjadi: seseorang mengubah markup Keuangan enam bulan lagi dan beberapa langkah tur diam-diam berhenti menyorot apa pun.
2. **Tidak ada halaman yang terlewat.** Test memastikan setiap rute yang punya menu di sidebar juga punya entri di `pageTours.js`, supaya tidak ada halaman yang tombolnya nonaktif karena lupa diisi.

**Verifikasi manual** setelah implementasi: jalankan tur halaman di Keuangan dan pastikan perpindahan tab terjadi otomatis; jalankan tur peta menu di lebar layar HP dan pastikan yang tampil kartu geser, bukan spotlight ke sidebar yang tak terlihat; tekan Escape di tengah tur; dan klik menu lain di sidebar saat tur berjalan untuk memastikan tur berhenti, bukan ikut berpindah.

## 9. Deployment

Perubahan hanya di panel admin, tidak menyentuh backend maupun TV display. Setelah kode selesai, `npm run build:vercel` wajib dijalankan agar `admin/` terbangun ulang, lalu hasilnya di-commit bersama kode sumber. `CLAUDE.md` diperbarui: bagian onboarding kini menyebut dua jenis tur, tombol mengambang menggantikan tombol "?", dan berkas baru di `components/onboarding/`.
