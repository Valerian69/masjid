// Shared content for the onboarding tour and the Panduan page.

// Each feature maps to a sidebar item (data-tour === key === matches its menu).
// `access` lists roles that can actually manage it (informational); the tour
// still highlights whatever sidebar items are visible.
export const features = [
  {
    key: 'dashboard',
    label: 'Dashboard',
    short: 'Ringkasan aktivitas & keuangan masjid dalam satu layar.',
    detail: 'Menampilkan total transaksi, kajian, agenda, saldo kas, serta kajian & agenda terdekat. Titik awal untuk memantau kondisi masjid sekilas.',
    access: 'Semua peran',
  },
  {
    key: 'jadwal-sholat',
    label: 'Jadwal Sholat',
    short: 'Atur waktu sholat harian; bisa sinkron otomatis dari EQuran.id.',
    detail: 'Tambah/ubah waktu sholat manual, atau tekan "Sync dari EQuran.id" untuk mengambil jadwal sesuai lokasi masjid (atur lokasi di Pengaturan). Jadwal ini tampil di layar TV.',
    access: 'takmir, marbot, superadmin',
  },
  {
    key: 'kajian',
    label: 'Kajian',
    short: 'Kelola jadwal kajian & pengajian, termasuk kajian rutin.',
    detail: 'Buat kajian sekali jalan atau berulang (mis. setiap Jumat). Gunakan tab Semua/Mendatang/Berulang untuk memfilter. Kajian terdekat tampil di TV & Dashboard.',
    access: 'takmir, marbot, superadmin',
  },
  {
    key: 'keuangan',
    label: 'Keuangan',
    short: 'Catat pemasukan/pengeluaran, laporan bulanan, export PDF/CSV.',
    detail: 'Tab Dashboard menampilkan saldo, tren 6 bulan, dan kategori. Tab Transaksi untuk mencatat & memfilter. Tab Laporan untuk rekap bulanan dan unduh PDF/CSV. Setiap perubahan tercatat di audit trail.',
    access: 'bendahara, superadmin',
  },
  {
    key: 'agenda',
    label: 'Agenda',
    short: 'Kelola acara & kegiatan masjid yang tampil di layar TV.',
    detail: 'Tambah agenda dengan tanggal, waktu, lokasi, dan status publish. Agenda terdekat muncul di layar TV dan Dashboard.',
    access: 'takmir, marbot, superadmin',
  },
  {
    key: 'running-text',
    label: 'Running Text',
    short: 'Teks pengumuman berjalan di layar TV.',
    detail: 'Kelola teks berjalan (pengumuman/infaq/info), atur urutan dan status aktif. Teks aktif akan bergulir di bagian bawah layar TV.',
    access: 'takmir, marbot, superadmin',
  },
  {
    key: 'laporan',
    label: 'Laporan',
    short: 'Publikasikan laporan kegiatan masjid.',
    detail: 'Buat laporan kegiatan (renovasi, sosial, edukasi, dll) dengan status publish. Laporan yang dipublikasikan dapat ditampilkan ke jamaah.',
    access: 'takmir, marbot, superadmin',
  },
  {
    key: 'settings',
    label: 'Pengaturan',
    short: 'Identitas masjid & lokasi jadwal sholat.',
    detail: 'Atur nama & alamat masjid, koordinat/timezone, serta provinsi & kabupaten/kota untuk sinkronisasi jadwal sholat otomatis.',
    access: 'takmir, superadmin',
  },
  {
    key: 'monitoring',
    label: 'Monitoring',
    short: 'Kesehatan sistem & metrik aplikasi.',
    detail: 'Pantau uptime, memori, CPU, laju request, error, dan jumlah data per tabel. Superadmin dapat mereset metrik atau membersihkan data.',
    access: 'superadmin',
  },
  {
    key: 'users',
    label: 'Users',
    short: 'Kelola akun pengguna & peran.',
    detail: 'Tambah/ubah/hapus akun dan atur perannya. Hanya superadmin yang dapat mengakses menu ini.',
    access: 'superadmin',
    roles: ['superadmin'], // sidebar visibility (tour will skip if hidden)
  },
];

export const roleLabel = {
  superadmin: 'Superadmin',
  takmir: 'Takmir',
  bendahara: 'Bendahara',
  marbot: 'Marbot',
};

export const roleSummary = {
  superadmin: 'Akses penuh ke semua modul, kelola pengguna, dan monitoring sistem.',
  takmir: 'Kelola jadwal sholat, kajian, agenda, running text, laporan, dan pengaturan masjid.',
  bendahara: 'Fokus pada keuangan: catat transaksi, lihat laporan bulanan, dan export PDF/CSV.',
  marbot: 'Kelola jadwal sholat, kajian, agenda, running text, dan laporan.',
};

// Feature keys visible in the sidebar for a given role (used to build tour steps).
export const visibleFeatures = (role) =>
  features.filter((f) => !f.roles || f.roles.includes(role));
