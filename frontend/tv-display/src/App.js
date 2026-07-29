import React, { useState, useEffect } from 'react';
import Header from './components/Header';
import PrayerSchedule from './components/PrayerSchedule';
import KajianFinance from './components/KajianFinance';
import Agenda from './components/Agenda';
import Laporan from './components/Laporan';
import RunningText from './components/RunningText';
import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5001/api';

function App() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(0);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await axios.get(`${API_URL}/dashboard`);
        setData(res.data);
      } catch (err) {
        console.error('Failed to fetch dashboard data:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
    const interval = setInterval(fetchData, 30000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const pageInterval = setInterval(() => {
      setCurrentPage(prev => (prev + 1) % 2);
    }, 10000);
    return () => clearInterval(pageInterval);
  }, []);

  if (loading) {
    return (
      <div className="loading-screen">
        <div className="skeleton-header" />
        <div className="skeleton-body">
          <div className="skeleton-card skeleton-card-left">
            <div className="skeleton-title" />
            {[...Array(6)].map((_, i) => (
              <div key={i} className="skeleton-row" style={{ animationDelay: `${i * 80}ms` }} />
            ))}
          </div>
          <div className="skeleton-right">
            <div className="skeleton-card" style={{ flex: 2, animationDelay: '100ms' }} />
            <div className="skeleton-card" style={{ flex: 1, animationDelay: '200ms' }} />
          </div>
        </div>
        <div className="skeleton-footer" />
      </div>
    );
  }

  return (
    <div className="tv-display">
      <Header settings={data?.settings} />
      <div className="page-container">
        <div className={`page page-main ${currentPage === 0 ? 'active' : ''}`}>
          <PrayerSchedule jadwal={data?.jadwal_sholat} />
          <div className="right-column">
            <KajianFinance kajianList={data?.kajian_terdekat} keuangan={data?.keuangan} />
            <Agenda agendaList={data?.agenda_terdekat} />
          </div>
        </div>
        <div className={`page page-laporan ${currentPage === 1 ? 'active' : ''}`}>
          <Laporan />
        </div>
      </div>
      <RunningText texts={data?.running_text} />
    </div>
  );
}

export default App;
