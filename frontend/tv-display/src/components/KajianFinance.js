import React from 'react';
import moment from 'moment';
import 'moment/locale/id';
import { BookIcon } from './Icons';

const formatCurrency = (amount) => {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency', currency: 'IDR', minimumFractionDigits: 0,
  }).format(amount || 0);
};

const KajianFinance = ({ kajianList, keuangan }) => {
  return (
    <div className="card kajian-finance-card animate-in stagger-3">
      <div className="card-title">
        <BookIcon size={18} />
        Jadwal Kajian
      </div>
      <div className="kajian-list">
        {kajianList && kajianList.length > 0 ? (
          kajianList.map((item, index) => (
            <div
              key={item.id}
              className="kajian-item"
              style={{ animation: `fadeInUp 0.4s var(--ease-out) ${index * 60}ms both` }}
            >
              <div className="title">{item.judul}</div>
              <div className="ustadz">{item.ustadz}</div>
              <div className="datetime">{moment(item.tanggal).format('dddd, DD MMM')} • {item.jam_mulai}{item.jam_selesai ? ` - ${item.jam_selesai}` : ''}</div>
            </div>
          ))
        ) : (
          <div className="empty-state">Belum ada jadwal kajian</div>
        )}
      </div>
      <div className="finance-divider"></div>
      <div className="finance-section-inline">
        <div className="finance-box saldo">
          <div className="finance-label">Saldo Kas</div>
          <div className="finance-amount">{formatCurrency(keuangan?.saldo)}</div>
        </div>
        <div className="finance-box infaq">
          <div className="finance-label">Infaq Bulan Ini</div>
          <div className="finance-amount">{formatCurrency(keuangan?.total_infaq_bulan)}</div>
        </div>
      </div>
    </div>
  );
};

export default KajianFinance;
