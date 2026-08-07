import React, { useEffect, useState } from 'react';
import { useOnboarding } from './OnboardingContext';
import useTourTarget from './useTourTarget';
import MenuTourCards from './MenuTourCards';

const TOOLTIP_W = 320;

// Langkah tur menu memakai bentuk `features` (label/detail); langkah tur
// halaman memakai bentuk pageTours (title/body). Satu penerjemah kecil supaya
// penggambarnya tidak perlu tahu bedanya.
const readStep = (step, mode) =>
  mode === 'menu'
    ? { selector: `[data-tour="${step.key}"]`, title: step.label, body: step.detail }
    : { selector: step.target, title: step.title, body: step.body };

const GuidedTour = () => {
  const { tourActive, mode, stepIndex, steps, nextStep, prevStep, stopTour } = useOnboarding();

  // 768 px adalah ambang yang sama dengan media query tempat sidebar jadi
  // off-canvas (admin.css). Menyamakannya mencegah JS dan CSS berselisih.
  const [isPhone, setIsPhone] = useState(() => window.matchMedia('(max-width: 768px)').matches);

  useEffect(() => {
    const mq = window.matchMedia('(max-width: 768px)');
    const onChange = (e) => setIsPhone(e.matches);
    mq.addEventListener('change', onChange);
    return () => mq.removeEventListener('change', onChange);
  }, []);

  const step = steps[stepIndex];
  const view = step ? readStep(step, mode) : null;

  // useTourTarget menerima bentuk seragam: target + openWith.
  const normalized = step
    ? (mode === 'menu' ? { target: view.selector } : step)
    : null;

  // Varian kartu di HP tidak punya sorotan, jadi mengukur sidebar off-canvas
  // (yang tetap ada di DOM, hanya digeser translateX(-100%)) hanya kerja sia-sia
  // terhadap elemen yang tidak bisa dilihat pengguna. Matikan mesin sorotan
  // sepenuhnya selama kartu tampil.
  const rect = useTourTarget(normalized, tourActive && !(mode === 'menu' && isPhone));

  useEffect(() => {
    if (!tourActive) return undefined;
    const onKey = (e) => {
      if (e.key === 'Escape') stopTour();
      else if (e.key === 'ArrowRight') nextStep();
      else if (e.key === 'ArrowLeft') prevStep();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [tourActive, stopTour, nextStep, prevStep]);

  if (tourActive && mode === 'menu' && isPhone) return <MenuTourCards />;

  if (!tourActive || !step) return null;

  const isLast = stepIndex >= steps.length - 1;
  const pad = 6;

  // Tooltip di sebelah kanan sorotan bila muat, kalau tidak di kirinya.
  let tipStyle;
  if (rect) {
    let left = rect.right + 16;
    if (left + TOOLTIP_W > window.innerWidth - 12) left = Math.max(12, rect.left - TOOLTIP_W - 16);
    let top = rect.top - 6;
    top = Math.min(top, window.innerHeight - 240);
    top = Math.max(12, top);
    tipStyle = { left, top };
  } else {
    tipStyle = { left: '50%', top: '50%', transform: 'translate(-50%, -50%)' };
  }

  return (
    <div className="tour-root" aria-live="polite">
      <div className="tour-backdrop" onClick={(e) => e.stopPropagation()} />
      {rect && (
        <div
          className="tour-spotlight"
          style={{
            top: rect.top - pad,
            left: rect.left - pad,
            width: rect.width + pad * 2,
            height: rect.height + pad * 2,
          }}
        />
      )}
      <div className="tour-tooltip" style={tipStyle} role="dialog" aria-modal="true" aria-label={`Panduan: ${view.title}`}>
        <div className="tour-tooltip-head">
          <span className="tour-step-count">{stepIndex + 1} / {steps.length}</span>
          <button className="tour-close" onClick={stopTour} aria-label="Tutup tur">
            <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></svg>
          </button>
        </div>
        <h3 className="tour-tooltip-title">{view.title}</h3>
        <p className="tour-tooltip-body">{view.body}</p>
        <div className="tour-tooltip-actions">
          <button className="btn btn-ghost btn-sm tour-skip" onClick={stopTour}>Lewati</button>
          <div className="tour-nav">
            {stepIndex > 0 && <button className="btn btn-outline btn-sm" onClick={prevStep}>Sebelumnya</button>}
            <button className="btn btn-primary btn-sm" onClick={nextStep}>{isLast ? 'Selesai' : 'Berikutnya'}</button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default GuidedTour;
