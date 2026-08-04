import React, { useState, useEffect } from 'react';
import moment from 'moment';
import 'moment/locale/id';
import { BookIcon, CalendarIcon, DocumentIcon, WalletIcon } from './Icons';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5001/api';
const ROTATE_MS = 12000;

const formatCurrency = (amount) =>
  new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(amount || 0);

const KajianPanel = ({ items }) => (
  <div className="sec-list">
    {items.slice(0, 4).map((k) => (
      <div key={k.id} className="sec-item kajian">
        <div className="sec-item-title">{k.judul}</div>
        <div className="sec-item-accent">{k.ustadz}</div>
        <div className="sec-item-sub">{moment(k.tanggal).format('dddd, DD MMM')} · {k.jam_mulai}{k.jam_selesai ? ` - ${k.jam_selesai}` : ''}</div>
      </div>
    ))}
  </div>
);

const AgendaPanel = ({ items }) => (
  <div className="sec-list">
    {items.slice(0, 4).map((a) => (
      <div key={a.id} className="sec-item agenda">
        <div className="sec-item-title">{a.judul}</div>
        <div className="sec-item-sub">{moment(a.tanggal).format('dddd, DD MMM YYYY')}{a.lokasi ? ` · ${a.lokasi}` : ''}</div>
      </div>
    ))}
  </div>
);

const LaporanPanel = ({ items }) => (
  <div className="sec-list">
    {items.slice(0, 3).map((l) => (
      <div key={l.id} className="sec-item laporan">
        <div className="sec-item-head">
          <span className="sec-badge">{l.kategori}</span>
          <span className="sec-item-date">{moment(l.tanggal).format('DD MMM YYYY')}</span>
        </div>
        <div className="sec-item-title">{l.judul}</div>
        <div className="sec-item-text">{l.isi}</div>
      </div>
    ))}
  </div>
);

const KeuanganPanel = ({ keuangan }) => (
  <div className="sec-finance">
    <div className="sec-finance-box saldo">
      <div className="sec-finance-label">Saldo Kas Masjid</div>
      <div className="sec-finance-amount">{formatCurrency(keuangan?.saldo)}</div>
    </div>
    <div className="sec-finance-box infaq">
      <div className="sec-finance-label">Infaq Bulan Ini</div>
      <div className="sec-finance-amount">{formatCurrency(keuangan?.total_infaq_bulan)}</div>
    </div>
  </div>
);

const SecondaryRotator = ({ kajian, agenda, keuangan }) => {
  const [laporan, setLaporan] = useState([]);
  const [index, setIndex] = useState(0);

  useEffect(() => {
    let active = true;
    fetch(`${API_URL}/laporan/latest`)
      .then((r) => r.json())
      .then((d) => { if (active) setLaporan(Array.isArray(d) ? d : []); })
      .catch(() => {});
    return () => { active = false; };
  }, []);

  // Build panels only for content that exists
  const panels = [];
  if (kajian && kajian.length) panels.push({ key: 'kajian', title: 'Jadwal Kajian', icon: <BookIcon size={26} />, render: <KajianPanel items={kajian} /> });
  if (agenda && agenda.length) panels.push({ key: 'agenda', title: 'Agenda Kegiatan', icon: <CalendarIcon size={26} />, render: <AgendaPanel items={agenda} /> });
  if (laporan && laporan.length) panels.push({ key: 'laporan', title: 'Laporan Kegiatan', icon: <DocumentIcon size={26} />, render: <LaporanPanel items={laporan} /> });
  if (keuangan) panels.push({ key: 'keuangan', title: 'Keuangan Masjid', icon: <WalletIcon size={26} />, render: <KeuanganPanel keuangan={keuangan} /> });

  useEffect(() => {
    if (panels.length <= 1) return;
    const t = setInterval(() => setIndex((i) => (i + 1) % panels.length), ROTATE_MS);
    return () => clearInterval(t);
  }, [panels.length]);

  if (panels.length === 0) return <div className="secondary-panel" />;

  const current = panels[Math.min(index, panels.length - 1)];

  return (
    <div className="secondary-panel">
      <div className="secondary-head">
        <div className="secondary-title">{current.icon}{current.title}</div>
        {panels.length > 1 && (
          <div className="secondary-dots">
            {panels.map((p, i) => (
              <span key={p.key} className={`dot ${i === index ? 'on' : ''}`} />
            ))}
          </div>
        )}
      </div>
      <div key={current.key} className="secondary-body">
        {current.render}
      </div>
    </div>
  );
};

export default SecondaryRotator;
