import React from 'react';

// Tanpa ini, satu error saat merender overlay akan membuat React melepas
// seluruh root sehingga TV menampilkan layar putih kosong sampai ada yang
// me-reboot box — dan tidak ada yang menyadarinya sampai waktu sholat
// berikutnya. Kegagalan di sini cukup menjatuhkan tampilan ke keadaan normal.
//
// Reset dipicu oleh perubahan string `phase` (diteruskan sebagai prop dari
// App.js), bukan oleh tiap perubahan props. `phase` stabil sepanjang satu
// fase berjalan, jadi error yang deterministik dicoba ulang sekitar dua
// puluh kali sehari — sebanyak transisi fase dalam sehari — bukan 86.400
// kali per detik. Tanpa reset sama sekali, satu error yang tidak disengaja
// mematikan fitur ini untuk sisa sesi TV yang bisa menyala berminggu-minggu
// tanpa ada yang memperhatikan (layar tetap terlihat normal, tidak error).
class PhaseErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, phase: props.phase };
  }

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  static getDerivedStateFromProps(props, state) {
    // Fase berubah dibanding percobaan render terakhir — reset status error
    // dan beri kesempatan render ulang. Dipanggil di setiap render (termasuk
    // render pemulihan setelah error), jadi ini murni perbandingan string,
    // bukan efek samping.
    if (props.phase !== state.phase) {
      return { hasError: false, phase: props.phase };
    }
    return null;
  }

  componentDidCatch(error) {
    console.error('Prayer phase overlay failed:', error);
  }

  render() {
    if (this.state.hasError) return null;
    return this.props.children;
  }
}

export default PhaseErrorBoundary;
