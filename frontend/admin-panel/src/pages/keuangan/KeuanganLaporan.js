import React from 'react';
import moment from 'moment';
import { formatIDR, jenisLabel } from '../../utils/format';

const currentYear = Number(moment().format('YYYY'));
const yearOptions = [currentYear, currentYear - 1, currentYear - 2];

const sumBy = (rows, key) => (rows || []).reduce((s, x) => s + (x[key] || 0), 0);

const KeuanganLaporan = ({ reportMonth, setReportMonth, reportData, onView, onDownloadPDF }) => {
  const totalMasuk = sumBy(reportData?.summary, 'masuk');
  const totalKeluar = sumBy(reportData?.summary, 'keluar');

  return (
    <>
      <div className="filter-row" style={{ marginBottom: 20 }}>
        <div className="form-group">
          <label className="form-label">Bulan</label>
          <select value={reportMonth.month} onChange={(e) => setReportMonth({ ...reportMonth, month: e.target.value })} className="form-input">
            {Array.from({ length: 12 }, (_, i) => String(i + 1).padStart(2, '0')).map((m) => (
              <option key={m} value={m}>{moment(m, 'MM').format('MMMM')}</option>
            ))}
          </select>
        </div>
        <div className="form-group">
          <label className="form-label">Tahun</label>
          <select value={reportMonth.year} onChange={(e) => setReportMonth({ ...reportMonth, year: e.target.value })} className="form-input">
            {yearOptions.map((y) => <option key={y} value={y}>{y}</option>)}
          </select>
        </div>
        <button onClick={onView} className="btn btn-primary">Lihat Laporan</button>
        <button onClick={onDownloadPDF} className="btn btn-danger" data-tour="keu-pdf">Download PDF</button>
      </div>

      {reportData && reportData.summary && (
        <>
          <div className="two-col-grid">
            <div className="card">
              <div className="card-header"><h2 style={{ color: '#0b3d2e' }}>Pemasukan per Kategori</h2></div>
              {(reportData.summary || []).filter((s) => s.masuk > 0).map((s, i) => (
                <div key={i} className="transaction-row">
                  <span style={{ fontSize: '0.85rem' }}>{s.kategori}</span>
                  <span style={{ color: '#0b3d2e', fontWeight: 600 }}>{formatIDR(s.masuk)}</span>
                </div>
              ))}
              <div className="transaction-row" style={{ fontWeight: 700, borderTop: '2px solid #0b3d2e', marginTop: 8 }}>
                <span>Total Masuk</span>
                <span style={{ color: '#0b3d2e' }}>{formatIDR(totalMasuk)}</span>
              </div>
            </div>

            <div className="card">
              <div className="card-header"><h2 style={{ color: '#c62828' }}>Pengeluaran per Kategori</h2></div>
              {(reportData.summary || []).filter((s) => s.keluar > 0).map((s, i) => (
                <div key={i} className="transaction-row">
                  <span style={{ fontSize: '0.85rem' }}>{s.kategori}</span>
                  <span style={{ color: '#c62828', fontWeight: 600 }}>{formatIDR(s.keluar)}</span>
                </div>
              ))}
              <div className="transaction-row" style={{ fontWeight: 700, borderTop: '2px solid #c62828', marginTop: 8 }}>
                <span>Total Keluar</span>
                <span style={{ color: '#c62828' }}>{formatIDR(totalKeluar)}</span>
              </div>
            </div>
          </div>

          <div className="card" style={{ marginBottom: 24 }}>
            <div className="keuangan-summary-inline" style={{ display: 'flex', justifyContent: 'space-around', textAlign: 'center', gap: 16, flexWrap: 'wrap' }}>
              <div>
                <div style={{ fontSize: '0.75rem', color: '#7a9a8e', textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: 4 }}>Total Masuk</div>
                <div style={{ fontSize: '1.3rem', fontWeight: 700, color: '#0b3d2e' }}>{formatIDR(totalMasuk)}</div>
              </div>
              <div>
                <div style={{ fontSize: '0.75rem', color: '#7a9a8e', textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: 4 }}>Total Keluar</div>
                <div style={{ fontSize: '1.3rem', fontWeight: 700, color: '#c62828' }}>{formatIDR(totalKeluar)}</div>
              </div>
              <div>
                <div style={{ fontSize: '0.75rem', color: '#7a9a8e', textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: 4 }}>Selisih</div>
                <div style={{ fontSize: '1.3rem', fontWeight: 700, color: '#d4913d' }}>{formatIDR(totalMasuk - totalKeluar)}</div>
              </div>
            </div>
          </div>

          <div className="table-wrapper">
            <table className="table">
              <thead>
                <tr><th>Tanggal</th><th>Jenis</th><th>Kategori</th><th>Deskripsi</th><th className="text-right">Jumlah</th></tr>
              </thead>
              <tbody>
                {(reportData.detail || []).map((item) => (
                  <tr key={item.id}>
                    <td>{moment(item.tanggal).format('DD MMM YYYY')}</td>
                    <td>
                      <span className={`badge ${item.jenis === 'masuk' ? 'badge-emerald' : 'badge-red'}`}>{jenisLabel(item.jenis)}</span>
                    </td>
                    <td>{item.kategori}</td>
                    <td>{item.deskripsi || '-'}</td>
                    <td className="text-right" style={{ fontWeight: 600, color: item.jenis === 'masuk' ? '#0b3d2e' : '#c62828' }}>
                      {item.jenis === 'masuk' ? '+' : '-'}{formatIDR(item.jumlah)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}
    </>
  );
};

export default KeuanganLaporan;
