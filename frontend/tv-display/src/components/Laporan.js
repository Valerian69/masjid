import React, { useState, useEffect } from 'react';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5001/api';

const Laporan = () => {
  const [laporan, setLaporan] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchLaporan();
  }, []);

  const fetchLaporan = async () => {
    try {
      const response = await fetch(`${API_URL}/laporan/latest`);
      const data = await response.json();
      setLaporan(data);
    } catch (error) {
      console.error('Error fetching laporan:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateStr) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' });
  };

  if (loading) {
    return (
      <div className="laporan-section">
        <h3 className="section-title">LAPORAN KEGIATAN</h3>
        <p style={{ color: 'var(--text-muted)', textAlign: 'center' }}>Memuat laporan...</p>
      </div>
    );
  }

  return (
    <div className="laporan-section">
      <h3 className="section-title">LAPORAN KEGIATAN</h3>
      {laporan.length === 0 ? (
        <p style={{ color: 'var(--text-muted)', textAlign: 'center' }}>Belum ada laporan</p>
      ) : (
        <div className="laporan-list">
          {laporan.map((item) => (
            <div key={item.id} className="laporan-card">
              <div className="laporan-card-header">
                <span className="laporan-badge">{item.kategori}</span>
                <span className="laporan-date">{formatDate(item.tanggal)}</span>
              </div>
              <h4 className="laporan-card-title">{item.judul}</h4>
              <p className="laporan-card-text">{item.isi}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Laporan;
