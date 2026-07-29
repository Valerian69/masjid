import React, { useState, useEffect } from 'react';
import { DocumentIcon } from './Icons';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5001/api';

const LaporanSkeleton = () => (
  <div className="laporan-section animate-in stagger-5">
    <h3 className="section-title">
      <DocumentIcon size={18} />
      LAPORAN KEGIATAN
    </h3>
    <div className="laporan-list">
      {[...Array(4)].map((_, i) => (
        <div
          key={i}
          style={{
            height: 100,
            borderRadius: 10,
            background: 'linear-gradient(90deg, rgba(255,255,255,0.03) 25%, rgba(255,255,255,0.06) 50%, rgba(255,255,255,0.03) 75%)',
            backgroundSize: '200% 100%',
            animation: `shimmer 1.5s ease-in-out ${i * 100}ms infinite`,
          }}
        />
      ))}
    </div>
  </div>
);

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

  if (loading) return <LaporanSkeleton />;

  return (
    <div className="laporan-section animate-in stagger-5">
      <h3 className="section-title">
        <DocumentIcon size={18} />
        LAPORAN KEGIATAN
      </h3>
      {laporan.length === 0 ? (
        <p className="empty-state">Belum ada laporan</p>
      ) : (
        <div className="laporan-list">
          {laporan.map((item, index) => (
            <div
              key={item.id}
              className="laporan-card"
              style={{ animation: `fadeInUp 0.4s var(--ease-out) ${index * 80}ms both` }}
            >
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
