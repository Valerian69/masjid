import React from 'react';
import moment from 'moment';
import 'moment/locale/id';
import { CalendarIcon } from './Icons';

const Agenda = ({ agendaList }) => {
  const formatDate = (date) => moment(date).format('dddd, DD MMM YYYY');

  return (
    <div className="card agenda-card animate-in stagger-4">
      <div className="card-title">
        <CalendarIcon size={18} />
        Agenda Kegiatan
      </div>
      <div className="agenda-list">
        {agendaList && agendaList.length > 0 ? (
          agendaList.map((item, index) => (
            <div
              key={item.id}
              className="agenda-item"
              style={{ animation: `fadeInUp 0.4s var(--ease-out) ${index * 60}ms both` }}
            >
              <div className="title">{item.judul}</div>
              <div className="date">{formatDate(item.tanggal)}{item.lokasi ? ` • ${item.lokasi}` : ''}</div>
            </div>
          ))
        ) : (
          <div className="empty-state">Belum ada agenda kegiatan</div>
        )}
      </div>
    </div>
  );
};

export default Agenda;
