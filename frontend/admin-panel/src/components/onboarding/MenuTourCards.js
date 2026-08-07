import React from 'react';
import { useOnboarding } from './OnboardingContext';

// Di layar HP sidebar berada di luar layar (translateX(-100%)), jadi menyorotnya
// berarti menunjuk ke ketiadaan. Tur peta menu di sini berganti bentuk jadi
// kartu layar penuh; tur halaman tetap memakai spotlight karena isinya memang
// terlihat.
//
// Penanganan keyboard (Escape/ArrowLeft/ArrowRight) sengaja TIDAK ada di sini.
// GuidedTour tetap terpasang saat varian ini tampil dan sudah punya listener
// keydown-nya sendiri yang mencakup kedua varian. Menambahkan listener kedua
// di sini akan membuat satu tekan tombol memicu dua langkah.
const MenuTourCards = () => {
  const { stepIndex, steps, nextStep, prevStep, stopTour } = useOnboarding();

  const step = steps[stepIndex];
  if (!step) return null;

  const isLast = stepIndex >= steps.length - 1;

  return (
    <div className="menu-cards-root" role="dialog" aria-modal="true" aria-label={`Panduan: ${step.label}`}>
      <div className="menu-cards-card">
        <div className="menu-cards-head">
          <span className="tour-step-count">{stepIndex + 1} / {steps.length}</span>
          <button className="tour-close" onClick={stopTour} aria-label="Tutup tur">
            <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></svg>
          </button>
        </div>
        <h3 className="menu-cards-title">{step.label}</h3>
        <p className="menu-cards-body">{step.detail}</p>
        <div className="menu-cards-dots" aria-hidden="true">
          {steps.map((s, i) => (
            <span key={s.key} className={`menu-cards-dot ${i === stepIndex ? 'on' : ''}`} />
          ))}
        </div>
        <div className="menu-cards-actions">
          <button className="btn btn-ghost btn-sm" onClick={stopTour}>Lewati</button>
          <div className="tour-nav">
            {stepIndex > 0 && <button className="btn btn-outline btn-sm" onClick={prevStep}>Sebelumnya</button>}
            <button className="btn btn-primary btn-sm" onClick={nextStep}>{isLast ? 'Selesai' : 'Berikutnya'}</button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MenuTourCards;
