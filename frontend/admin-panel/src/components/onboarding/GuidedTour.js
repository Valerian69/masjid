import React, { useLayoutEffect, useState, useEffect, useCallback } from 'react';
import { useOnboarding } from './OnboardingContext';

const TOOLTIP_W = 300;

const GuidedTour = () => {
  const { tourActive, stepIndex, steps, nextStep, prevStep, stopTour } = useOnboarding();
  const [rect, setRect] = useState(null);

  const step = steps[stepIndex];

  const measure = useCallback(() => {
    if (!step) return;
    const el = document.querySelector(`[data-tour="${step.key}"]`);
    if (el) {
      el.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
      const r = el.getBoundingClientRect();
      setRect({ top: r.top, left: r.left, width: r.width, height: r.height, right: r.right, bottom: r.bottom });
    } else {
      setRect(null);
    }
  }, [step]);

  useLayoutEffect(() => {
    if (!tourActive) return;
    measure();
    const onChange = () => measure();
    window.addEventListener('resize', onChange);
    window.addEventListener('scroll', onChange, true);
    return () => {
      window.removeEventListener('resize', onChange);
      window.removeEventListener('scroll', onChange, true);
    };
  }, [tourActive, stepIndex, measure]);

  useEffect(() => {
    if (!tourActive) return;
    const onKey = (e) => {
      if (e.key === 'Escape') stopTour();
      else if (e.key === 'ArrowRight') nextStep();
      else if (e.key === 'ArrowLeft') prevStep();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [tourActive, stopTour, nextStep, prevStep]);

  if (!tourActive || !step) return null;

  const isLast = stepIndex >= steps.length - 1;
  const pad = 6;

  // Tooltip placement: to the right of the highlighted sidebar item, clamped.
  let tipStyle;
  if (rect) {
    let left = rect.right + 16;
    if (left + TOOLTIP_W > window.innerWidth - 12) left = Math.max(12, rect.left - TOOLTIP_W - 16);
    let top = rect.top - 6;
    top = Math.min(top, window.innerHeight - 220);
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
      <div className="tour-tooltip" style={tipStyle} role="dialog" aria-modal="true" aria-label={`Panduan: ${step.label}`}>
        <div className="tour-tooltip-head">
          <span className="tour-step-count">{stepIndex + 1} / {steps.length}</span>
          <button className="tour-close" onClick={stopTour} aria-label="Tutup tur">
            <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></svg>
          </button>
        </div>
        <h3 className="tour-tooltip-title">{step.label}</h3>
        <p className="tour-tooltip-body">{step.short}</p>
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
