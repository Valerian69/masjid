import moment from 'moment';

export const kategoriMasuk = ['Infaq', 'Donasi', 'Sedekah', 'Kas Jumat', 'Dana Pembangunan', 'Zakat', 'Lainnya'];
export const kategoriKeluar = ['Operasional', 'Gaji/Insentif', 'Pemeliharaan', 'Listrik & Air', 'Beli Barang', 'Sosial', 'Renovasi', 'Lainnya'];

export const emptyTransaksiForm = () => ({
  tanggal: moment().format('YYYY-MM-DD'),
  jenis: 'masuk',
  kategori: 'Infaq',
  deskripsi: '',
  jumlah: '',
  metode_pembayaran: 'cash',
  penerima: '',
  no_ref: '',
  catatan: '',
  status: 'confirmed',
});
