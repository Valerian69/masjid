import React from 'react';
import { kategoriMasuk, kategoriKeluar } from './constants';

const TransaksiForm = ({ form, setForm, editingId, saving, onSubmit, onCancel }) => (
  <form onSubmit={onSubmit} className="card" data-tour="keu-form">
    <div className="card-body">
      <h3 style={{ fontSize: '1rem', fontWeight: 600, color: 'var(--text-primary)', marginBottom: 16 }}>
        {editingId ? 'Edit Transaksi' : 'Transaksi Baru'}
      </h3>
      <div className="admin-form-grid-4">
        <div className="form-group">
          <label className="form-label" htmlFor="transaksiform-tanggal">Tanggal</label>
          <input id="transaksiform-tanggal" type="date" value={form.tanggal} onChange={(e) => setForm({ ...form, tanggal: e.target.value })} className="form-input" required />
        </div>
        <div className="form-group">
          <label className="form-label" htmlFor="transaksiform-jenis">Jenis</label>
          <select id="transaksiform-jenis" value={form.jenis} onChange={(e) => setForm({ ...form, jenis: e.target.value, kategori: e.target.value === 'masuk' ? 'Infaq' : 'Operasional' })} className="form-input">
            <option value="masuk">Pemasukan</option><option value="keluar">Pengeluaran</option>
          </select>
        </div>
        <div className="form-group">
          <label className="form-label" htmlFor="transaksiform-kategori">Kategori</label>
          <select id="transaksiform-kategori" value={form.kategori} onChange={(e) => setForm({ ...form, kategori: e.target.value })} className="form-input">
            {(form.jenis === 'masuk' ? kategoriMasuk : kategoriKeluar).map((k) => <option key={k} value={k}>{k}</option>)}
          </select>
        </div>
        <div className="form-group">
          <label className="form-label" htmlFor="transaksiform-jumlah">Jumlah (Rp)</label>
          <input id="transaksiform-jumlah" type="number" value={form.jumlah} onChange={(e) => setForm({ ...form, jumlah: e.target.value })} className="form-input" required min="0" placeholder="0" />
        </div>
        <div className="form-group">
          <label className="form-label" htmlFor="transaksiform-metode_pembayaran">Metode Pembayaran</label>
          <select id="transaksiform-metode_pembayaran" value={form.metode_pembayaran} onChange={(e) => setForm({ ...form, metode_pembayaran: e.target.value })} className="form-input">
            <option value="cash">Tunai</option><option value="transfer">Transfer</option><option value="e-wallet">E-Wallet</option>
          </select>
        </div>
        <div className="form-group">
          <label className="form-label" htmlFor="transaksiform-penerima">{form.jenis === 'masuk' ? 'Pemberi' : 'Penerima'}</label>
          <input id="transaksiform-penerima" value={form.penerima} onChange={(e) => setForm({ ...form, penerima: e.target.value })} className="form-input" placeholder="Nama pihak terkait" />
        </div>
        <div className="form-group">
          <label className="form-label" htmlFor="transaksiform-no_ref">No. Referensi</label>
          <input id="transaksiform-no_ref" value={form.no_ref} onChange={(e) => setForm({ ...form, no_ref: e.target.value })} className="form-input" placeholder="TRF-XXXX-XXX" />
        </div>
        <div className="form-group">
          <label className="form-label" htmlFor="transaksiform-status">Status</label>
          <select id="transaksiform-status" value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })} className="form-input">
            <option value="confirmed">Dikonfirmasi</option><option value="pending">Menunggu</option><option value="cancelled">Dibatalkan</option>
          </select>
        </div>
        <div className="form-group admin-form-full">
          <label className="form-label" htmlFor="transaksiform-deskripsi">Deskripsi</label>
          <input id="transaksiform-deskripsi" value={form.deskripsi} onChange={(e) => setForm({ ...form, deskripsi: e.target.value })} className="form-input" placeholder="Deskripsi singkat transaksi" />
        </div>
        <div className="form-group admin-form-full">
          <label className="form-label" htmlFor="transaksiform-catatan">Catatan Tambahan</label>
          <input id="transaksiform-catatan" value={form.catatan} onChange={(e) => setForm({ ...form, catatan: e.target.value })} className="form-input" placeholder="Catatan internal (opsional)" />
        </div>
      </div>
      <div className="admin-form-actions">
        <button type="submit" className="btn btn-amber" disabled={saving}>
          {saving ? 'Menyimpan...' : (editingId ? 'Update Transaksi' : 'Simpan Transaksi')}
        </button>
        <button type="button" onClick={onCancel} className="btn btn-outline">Batal</button>
      </div>
    </div>
  </form>
);

export default TransaksiForm;
