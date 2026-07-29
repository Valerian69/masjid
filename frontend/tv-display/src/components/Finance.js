import React from 'react';

const formatCurrency = (amount) => {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
  }).format(amount || 0);
};

const Finance = ({ keuangan }) => {
  return (
    <div className="card">
      <div className="card-title">
        <span className="icon">💰</span>
        Keuangan Masjid
      </div>
      <div className="finance-section">
        <div className="finance-box saldo">
          <div className="finance-label">Saldo Kas</div>
          <div className="finance-amount">{formatCurrency(keuangan?.saldo)}</div>
        </div>
        <div className="finance-box infaq">
          <div className="finance-label">Total Infaq Bulan Ini</div>
          <div className="finance-amount">{formatCurrency(keuangan?.total_infaq_bulan)}</div>
        </div>
      </div>
    </div>
  );
};

export default Finance;