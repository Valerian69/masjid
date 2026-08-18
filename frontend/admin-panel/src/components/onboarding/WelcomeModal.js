import React, { useEffect, useId, useRef, useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { settingsAPI } from '../../services/api';
import { useOnboarding } from './OnboardingContext';
import { roleLabel, roleSummary } from './content';
import useDialog from '../useDialog';

const MosqueIcon = () => (
  <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" focusable="false">
    <path d="M3 21h18" /><path d="M5 21V7l8-4v18" /><path d="M19 21V11l-6-4" /><path d="M9 9v.01M9 12v.01M9 15v.01M9 18v.01" />
  </svg>
);

const WelcomeModal = () => {
  const { user } = useAuth();
  const { welcomeOpen, startMenuTour, closeWelcome } = useOnboarding();
  const [masjidName, setMasjidName] = useState('');
  const titleId = useId();
  const startRef = useRef(null);
  // Fokus awal ke "Mulai Tur": aksi utama di sini tidak merusak apa pun.
  const dialogRef = useDialog({ open: welcomeOpen, onDismiss: closeWelcome, initialRef: startRef });

  useEffect(() => {
    if (!welcomeOpen) return;
    let active = true;
    settingsAPI.get()
      .then((res) => { if (active) setMasjidName(res.data?.masjid_name || ''); })
      .catch(() => {});
    return () => { active = false; };
  }, [welcomeOpen]);

  if (!welcomeOpen) return null;

  const firstName = (user?.full_name || 'Pengguna').split(' ')[0];
  const role = user?.role;

  return (
    <div className="modal-overlay" onClick={closeWelcome}>
      <div ref={dialogRef} className="onboarding-welcome" role="dialog" aria-modal="true" aria-labelledby={titleId} onClick={(e) => e.stopPropagation()}>
        <div className="onboarding-welcome-head">
          <div className="onboarding-welcome-icon"><MosqueIcon /></div>
          <div>
            <h2 className="onboarding-welcome-title" id={titleId}>Selamat datang, {firstName}!</h2>
            <p className="onboarding-welcome-sub">{masjidName || 'Panel Administrator Masjid'}</p>
          </div>
        </div>

        <p className="onboarding-welcome-body">
          Ini panel untuk mengelola informasi masjid — jadwal sholat, kajian, keuangan, agenda,
          dan yang tampil di layar TV. Mari kenali fitur-fiturnya dalam tur singkat.
        </p>

        {role && (
          <div className="onboarding-role">
            <span className="badge badge-emerald">Peran Anda: {roleLabel[role] || role}</span>
            <p>{roleSummary[role] || 'Akses sesuai peran Anda.'}</p>
          </div>
        )}

        <div className="onboarding-welcome-actions">
          <button ref={startRef} type="button" className="btn btn-primary" onClick={startMenuTour}>Mulai Tur</button>
          <button type="button" className="btn btn-outline" onClick={closeWelcome}>Lewati</button>
        </div>
        <p className="onboarding-welcome-hint">Tur bisa diputar ulang kapan saja lewat tombol bantuan mengambang di pojok kanan-bawah.</p>
      </div>
    </div>
  );
};

export default WelcomeModal;
