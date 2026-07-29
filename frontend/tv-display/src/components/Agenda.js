import React from 'react';
import moment from 'moment';
import 'moment/locale/id';

const Agenda = ({ agendaList }) => {
  const formatDate = (date) => moment(date).format('dddd, DD MMM YYYY');

  return (
    <div className="card agenda-card">
      <div className="card-title">
        <span className="icon">📋</span>
        Agenda Kegiatan
      </div>
      <div className="agenda-list">
        {agendaList && agendaList.length > 0 ? (
          agendaList.map((item) => (
            <div key={item.id} className="agenda-item">
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
