import React, { useState, useEffect } from 'react';
import Header from './components/Header';
import PrayerSchedule from './components/PrayerSchedule';
import NextPrayer from './components/NextPrayer';
import SecondaryRotator from './components/SecondaryRotator';
import RunningText from './components/RunningText';
import { MosqueIcon } from './components/Icons';
import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5001/api';

function App() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

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

  if (loading) {
    return (
      <div className="loading-screen">
        <div className="loading-icon"><MosqueIcon size={80} /></div>
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
      <div className="tv-main">
        <PrayerSchedule jadwal={data?.jadwal_sholat} />
        <div className="tv-right">
          <NextPrayer jadwal={data?.jadwal_sholat} />
          <SecondaryRotator
            kajian={data?.kajian_terdekat}
            agenda={data?.agenda_terdekat}
            keuangan={data?.keuangan}
          />
        </div>
      </div>
      <RunningText texts={data?.running_text} />
    </div>
  );
}

export default App;
