import React from 'react';
import moment from 'moment';
import 'moment/locale/id';

const Kajian = ({ kajianList }) => {
  const formatDate = (date) => moment(date).format('dddd, DD MMM YYYY');

  return (
    <div className="card">
      <div className="card-title">
        <span className="icon">📚</span>
        Jadwal Kajian
      </div>
      <div className="kajian-list">
        {kajianList && kajianList.length > 0 ? (
          kajianList.map((item) => (
            <div key={item.id} className="kajian-item">
              <div className="title">{item.judul}</div>
              <div className="ustadz">{item.ustadz}</div>
              <div className="datetime">{formatDate(item.tanggal)} • {item.jam_mulai}{item.jam_selesai ? ` - ${item.jam_selesai}` : ''}</div>
            </div>
          ))
        ) : (
          <div className="empty-state">Belum ada jadwal kajian</div>
        )}
      </div>
    </div>
  );
};

export default Kajian;