import React, { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { visibleFeatures } from './content';
import { getPageTour } from './pageTours';

const OnboardingContext = createContext(null);

const flagKey = (userId) => `masjid_onboarding_seen_v1_${userId || 'anon'}`;

export const OnboardingProvider = ({ children }) => {
  const { user } = useAuth();
  const location = useLocation();
  const [welcomeOpen, setWelcomeOpen] = useState(false);
  const [mode, setMode] = useState(null); // 'menu' | 'page' | null
  const [pageSteps, setPageSteps] = useState([]);
  const [stepIndex, setStepIndex] = useState(0);

  // Pathname the active tour was started on. Effects commit child-before-parent,
  // and this provider is an ancestor of every routed page — so in the same commit
  // where a descendant starts a tour and the route changes together, a naive
  // `useEffect(..., [location.pathname])` reset would fire after the start and
  // wipe it out immediately. Comparing against the remembered pathname instead
  // of just "did pathname change since last render" lets the reset only fire on
  // a *real* subsequent navigation, not the one a tour legitimately starts on.
  const tourPathnameRef = useRef(null);

  const menuSteps = useMemo(() => visibleFeatures(user?.role), [user?.role]);

  const steps = mode === 'page' ? pageSteps : mode === 'menu' ? menuSteps : [];

  // Auto-show the welcome modal once per user on first login.
  useEffect(() => {
    if (!user?.id) return;
    let seen = false;
    try { seen = !!localStorage.getItem(flagKey(user.id)); } catch { /* ignore */ }
    if (!seen) setWelcomeOpen(true);
  }, [user?.id]);

  const markSeen = useCallback(() => {
    try { if (user?.id) localStorage.setItem(flagKey(user.id), '1'); } catch { /* ignore */ }
  }, [user?.id]);

  const closeWelcome = useCallback(() => {
    setWelcomeOpen(false);
    markSeen();
  }, [markSeen]);

  const stopTour = useCallback(() => {
    setMode(null);
    setPageSteps([]);
    tourPathnameRef.current = null;
    markSeen();
  }, [markSeen]);

  const startMenuTour = useCallback(() => {
    tourPathnameRef.current = location.pathname;
    setWelcomeOpen(false);
    setStepIndex(0);
    setPageSteps([]);
    setMode('menu');
  }, [location.pathname]);

  const startPageTour = useCallback((pathname) => {
    const found = getPageTour(pathname);
    if (found.length === 0) return;
    tourPathnameRef.current = pathname;
    setWelcomeOpen(false);
    setStepIndex(0);
    setPageSteps(found);
    setMode('page');
  }, []);

  // Berhenti bila rute berubah: tur Keuangan tidak boleh terus berjalan di
  // atas halaman Agenda. Dibandingkan dengan pathname yang direkam saat tur
  // dimulai (bukan sekadar "pathname berubah sejak render lalu") supaya commit
  // yang men-start tur sekaligus mengubah rute tidak langsung menimpanya —
  // lihat komentar pada tourPathnameRef di atas.
  useEffect(() => {
    if (tourPathnameRef.current !== null && location.pathname !== tourPathnameRef.current) {
      setMode(null);
      setPageSteps([]);
      tourPathnameRef.current = null;
    }
  }, [location.pathname]);

  const nextStep = useCallback(() => {
    if (stepIndex >= steps.length - 1) { stopTour(); return; }
    setStepIndex((i) => i + 1);
  }, [stepIndex, steps.length, stopTour]);

  const prevStep = useCallback(() => setStepIndex((i) => Math.max(0, i - 1)), []);

  const value = {
    welcomeOpen, mode, tourActive: mode !== null, stepIndex, steps,
    startMenuTour, startPageTour, stopTour, nextStep, prevStep, closeWelcome,
  };

  return <OnboardingContext.Provider value={value}>{children}</OnboardingContext.Provider>;
};

export const useOnboarding = () => {
  const ctx = useContext(OnboardingContext);
  if (!ctx) throw new Error('useOnboarding must be used within an OnboardingProvider');
  return ctx;
};
