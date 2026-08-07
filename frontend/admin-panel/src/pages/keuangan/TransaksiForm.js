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
          <label className="form-label">Tanggal</label>
          <input type="date" value={form.tanggal} onChange={(e) => setForm({ ...form, tanggal: e.target.value })} className="form-input" required />
        </div>
        <div className="form-group">
          <label className="form-label">Jenis</label>
          <select value={form.jenis} onChange={(e) => setForm({ ...form, jenis: e.target.value, kategori: e.target.value === 'masuk' ? 'Infaq' : 'Operasional' })} className="form-input">
            <option value="masuk">Pemasukan</option><option value="keluar">Pengeluaran</option>
          </select>
        </div>
        <div className="form-group">
          <label className="form-label">Kategori</label>
          <select value={form.kategori} onChange={(e) => setForm({ ...form, kategori: e.target.value })} className="form-input">
            {(form.jenis === 'masuk' ? kategoriMasuk : kategoriKeluar).map((k) => <option key={k} value={k}>{k}</option>)}
          </select>
        </div>
        <div className="form-group">
          <label className="form-label">Jumlah (Rp)</label>
          <input type="number" value={form.jumlah} onChange={(e) => setForm({ ...form, jumlah: e.target.value })} className="form-input" required min="0" placeholder="0" />
        </div>
        <div className="form-group">
          <label className="form-label">Metode Pembayaran</label>
          <select value={form.metode_pembayaran} onChange={(e) => setForm({ ...form, metode_pembayaran: e.target.value })} className="form-input">
            <option value="cash">Tunai</option><option value="transfer">Transfer</option><option value="e-wallet">E-Wallet</option>
          </select>
        </div>
        <div className="form-group">
          <label className="form-label">{form.jenis === 'masuk' ? 'Pemberi' : 'Penerima'}</label>
          <input value={form.penerima} onChange={(e) => setForm({ ...form, penerima: e.target.value })} className="form-input" placeholder="Nama pihak terkait" />
        </div>
        <div className="form-group">
          <label className="form-label">No. Referensi</label>
          <input value={form.no_ref} onChange={(e) => setForm({ ...form, no_ref: e.target.value })} className="form-input" placeholder="TRF-XXXX-XXX" />
        </div>
        <div className="form-group">
          <label className="form-label">Status</label>
          <select value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })} className="form-input">
            <option value="confirmed">Dikonfirmasi</option><option value="pending">Menunggu</option><option value="cancelled">Dibatalkan</option>
          </select>
        </div>
        <div className="form-group admin-form-full">
          <label className="form-label">Deskripsi</label>
          <input value={form.deskripsi} onChange={(e) => setForm({ ...form, deskripsi: e.target.value })} className="form-input" placeholder="Deskripsi singkat transaksi" />
        </div>
        <div className="form-group admin-form-full">
          <label className="form-label">Catatan Tambahan</label>
          <input value={form.catatan} onChange={(e) => setForm({ ...form, catatan: e.target.value })} className="form-input" placeholder="Catatan internal (opsional)" />
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
