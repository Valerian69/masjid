import React, { useEffect, useRef, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useOnboarding } from './OnboardingContext';
import { getPageTour, pageTourLabel } from './pageTours';

const HelpIcon = () => (
  <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10" />
    <path d="M9.1 9a3 3 0 0 1 5.8 1c0 2-3 3-3 3" />
    <line x1="12" y1="17" x2="12.01" y2="17" />
  </svg>
);

const HelpButton = () => {
  const { startMenuTour, startPageTour, tourActive } = useOnboarding();
  const location = useLocation();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const rootRef = useRef(null);
  const menuRef = useRef(null);
  const triggerRef = useRef(null);

  const pageSteps = getPageTour(location.pathname);
  const label = pageTourLabel(location.pathname);

  useEffect(() => setOpen(false), [location.pathname]);

  // Saat menu terbuka, pindahkan fokus ke item pertama yang tidak disabled —
  // item "Pandu halaman ini" bisa disabled di rute tanpa tur halaman, dan
  // elemen disabled tidak bisa menerima fokus.
  useEffect(() => {
    if (!open || !menuRef.current) return;
    const firstEnabled = menuRef.current.querySelector('.help-fab-item:not(:disabled)');
    if (firstEnabled) firstEnabled.focus();
  }, [open]);

  useEffect(() => {
    if (!open) return undefined;
    const onDown = (e) => {
      // Klik di luar: cukup tutup, jangan rebut fokus dari elemen yang baru diklik user.
      if (rootRef.current && !rootRef.current.contains(e.target)) setOpen(false);
    };
    const onKey = (e) => {
      // Escape: tutup dan kembalikan fokus ke tombol pemicu.
      if (e.key === 'Escape') {
        setOpen(false);
        triggerRef.current?.focus();
      }
    };
    document.addEventListener('mousedown', onDown);
    window.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('mousedown', onDown);
      window.removeEventListener('keydown', onKey);
    };
  }, [open]);

  // Menyingkir selama tur berjalan supaya tidak menutupi sorotan atau tooltip.
  if (tourActive) return null;

  const run = (fn) => { setOpen(false); fn(); };

  return (
    <div className="help-fab-root" ref={rootRef}>
      <button
        type="button"
        ref={triggerRef}
        className="help-fab"
        onClick={() => setOpen((v) => !v)}
        aria-haspopup="menu"
        aria-expanded={open}
        aria-label="Bantuan dan panduan"
      >
        <HelpIcon />
      </button>
      {open && (
        <div className="help-fab-menu" role="menu" aria-label="Bantuan" ref={menuRef}>
          <button
            type="button"
            role="menuitem"
            className="help-fab-item"
            disabled={pageSteps.length === 0}
            onClick={() => run(() => startPageTour(location.pathname))}
          >
            <span className="help-fab-item-title">Pandu halaman ini</span>
            <span className="help-fab-item-sub">
              {pageSteps.length > 0 ? `${label} · ${pageSteps.length} langkah` : 'Belum tersedia untuk halaman ini'}
            </span>
          </button>
          <button type="button" role="menuitem" className="help-fab-item" onClick={() => run(startMenuTour)}>
            <span className="help-fab-item-title">Tur peta menu</span>
            <span className="help-fab-item-sub">Kenali seluruh menu panel</span>
          </button>
          <button type="button" role="menuitem" className="help-fab-item" onClick={() => run(() => navigate('/panduan'))}>
            <span className="help-fab-item-title">Buka halaman Panduan</span>
            <span className="help-fab-item-sub">Ringkasan fitur & tabel peran</span>
          </button>
        </div>
      )}
    </div>
  );
};

export default HelpButton;
