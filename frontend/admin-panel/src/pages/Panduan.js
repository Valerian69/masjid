import React from 'react';
import { useOnboarding } from '../components/onboarding/OnboardingContext';
import { features, roleLabel, roleSummary } from '../components/onboarding/content';

const PlayIcon = () => (
  <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><polygon points="5 3 19 12 5 21 5 3" /></svg>
);

const Panduan = () => {
  const { startTour } = useOnboarding();

  return (
    <div className="animate-in">
      <div className="page-header">
        <div className="page-header-left">
          <h1>Panduan</h1>
          <p className="page-header-subtitle">Kenali fitur panel admin masjid</p>
        </div>
        <div className="page-header-actions">
          <button onClick={startTour} className="btn btn-primary btn-sm">
            <PlayIcon /> Mulai Tur Interaktif
          </button>
        </div>
      </div>

      <div className="card" style={{ marginBottom: 'var(--space-6)' }}>
        <div className="card-body">
          <p className="body-md text-secondary" style={{ margin: 0 }}>
            Panel ini digunakan untuk mengelola seluruh informasi masjid yang tampil di layar TV publik
            dan dikelola secara internal. Berikut ringkasan setiap menu. Anda juga bisa menjalankan
            <strong> Tur Interaktif</strong> untuk dipandu langkah demi langkah.
          </p>
        </div>
      </div>

      <div className="grid grid-2" style={{ marginBottom: 'var(--space-6)' }}>
        {features.map((f) => (
          <div key={f.key} className="card">
            <div className="card-body">
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 'var(--space-3)', marginBottom: 'var(--space-2)' }}>
                <h3 style={{ fontSize: '1rem', margin: 0 }}>{f.label}</h3>
                <span className="badge badge-slate" style={{ whiteSpace: 'normal' }}>{f.access}</span>
              </div>
              <p className="body-sm text-secondary" style={{ margin: 0 }}>{f.detail}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="card">
        <div className="card-header"><h2>Peran &amp; Hak Akses</h2></div>
        <div className="table-wrapper">
          <table className="table">
            <thead>
              <tr><th style={{ width: 160 }}>Peran</th><th>Ringkasan akses</th></tr>
            </thead>
            <tbody>
              {Object.keys(roleSummary).map((r) => (
                <tr key={r}>
                  <td><span className="badge badge-emerald">{roleLabel[r]}</span></td>
                  <td className="body-sm">{roleSummary[r]}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Panduan;
