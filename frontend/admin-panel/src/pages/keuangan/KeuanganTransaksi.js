import React from 'react';
import moment from 'moment';
import { formatIDR, metodeLabel, statusLabel, statusBadge, jenisLabel } from '../../utils/format';
import TransaksiForm from './TransaksiForm';

const KeuanganTransaksi = ({
  transaksi, filter, changeFilter, canEdit,
  showForm, form, setForm, editingId, saving,
  onSubmit, onCancelForm, onEdit, onDelete,
}) => (
  <>
    {showForm && canEdit && (
      <TransaksiForm form={form} setForm={setForm} editingId={editingId} saving={saving} onSubmit={onSubmit} onCancel={onCancelForm} />
    )}

    <div className="filter-bar">
      <div className="filter-row">
        <div className="form-group flex-grow">
          <label className="form-label">Cari</label>
          <input value={filter.search} onChange={(e) => changeFilter('search', e.target.value)} className="form-input" placeholder="Deskripsi, kategori, catatan..." />
        </div>
        <div className="form-group">
          <label className="form-label">Dari</label>
          <input type="date" value={filter.start_date} onChange={(e) => changeFilter('start_date', e.target.value)} className="form-input" />
        </div>
        <div className="form-group">
          <label className="form-label">Sampai</label>
          <input type="date" value={filter.end_date} onChange={(e) => changeFilter('end_date', e.target.value)} className="form-input" />
        </div>
        <div className="form-group">
          <label className="form-label">Jenis</label>
          <select value={filter.jenis} onChange={(e) => changeFilter('jenis', e.target.value)} className="form-input">
            <option value="">Semua</option><option value="masuk">Masuk</option><option value="keluar">Keluar</option>
          </select>
        </div>
        <div className="form-group">
          <label className="form-label">Metode</label>
          <select value={filter.metode} onChange={(e) => changeFilter('metode', e.target.value)} className="form-input">
            <option value="">Semua</option><option value="cash">Tunai</option><option value="transfer">Transfer</option><option value="e-wallet">E-Wallet</option>
          </select>
        </div>
        <div className="form-group">
          <label className="form-label">Status</label>
          <select value={filter.status} onChange={(e) => changeFilter('status', e.target.value)} className="form-input">
            <option value="">Semua</option><option value="confirmed">Dikonfirmasi</option><option value="pending">Menunggu</option><option value="cancelled">Dibatalkan</option>
          </select>
        </div>
      </div>
    </div>

    <div className="table-wrapper">
      <table className="table">
        <thead>
          <tr>
            <th>Tanggal</th><th>Jenis</th><th>Kategori</th><th>Metode</th><th>Pihak Terkait</th><th>Deskripsi</th><th className="text-right">Jumlah</th><th>Status</th><th className="text-center">Aksi</th>
          </tr>
        </thead>
        <tbody>
          {transaksi.map((item) => (
            <tr key={item.id}>
              <td>{moment(item.tanggal).format('DD MMM YYYY')}</td>
              <td>
                <span className={`badge ${item.jenis === 'masuk' ? 'badge-emerald' : 'badge-red'}`}>{jenisLabel(item.jenis)}</span>
              </td>
              <td style={{ fontWeight: 500 }}>{item.kategori}</td>
              <td>{metodeLabel(item.metode_pembayaran)}</td>
              <td>{item.penerima || '-'}</td>
              <td style={{ maxWidth: 200, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{item.deskripsi || '-'}</td>
              <td className="text-right" style={{ fontWeight: 600, color: item.jenis === 'masuk' ? '#0b3d2e' : '#c62828' }}>
                {item.jenis === 'masuk' ? '+' : '-'}{formatIDR(item.jumlah)}
              </td>
              <td>
                <span className={`badge ${statusBadge(item.status)}`}>{statusLabel(item.status)}</span>
              </td>
              <td className="text-center">
                {canEdit && (
                  <>
                    <button onClick={() => onEdit(item)} className="btn btn-ghost btn-sm" style={{ marginRight: 6 }}>Edit</button>
                    <button onClick={() => onDelete(item.id)} className="btn btn-danger btn-sm">Hapus</button>
                  </>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      {transaksi.length === 0 && <p className="empty-state">Tidak ada transaksi ditemukan</p>}
    </div>
  </>
);

export default KeuanganTransaksi;
