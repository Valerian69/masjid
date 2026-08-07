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
      target: '[data-tour="set-ikamah-durasi"]',
      title: 'Jeda Ikamah',
      body: 'Saat aktif, TV otomatis menampilkan notifikasi azan, hitung mundur ikamah, lalu layar gelap selama sholat berjamaah. Durasinya diatur per sholat — misalnya ikamah Subuh 15 menit tapi Maghrib cukup 5 menit. Isi 0 untuk melewati salah satu fase. Sholat Jum’at otomatis dilewati karena diisi khutbah.',
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
