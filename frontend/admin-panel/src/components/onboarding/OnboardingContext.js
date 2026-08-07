import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
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
    markSeen();
  }, [markSeen]);

  const startMenuTour = useCallback(() => {
    setWelcomeOpen(false);
    setStepIndex(0);
    setPageSteps([]);
    setMode('menu');
  }, []);

  const startPageTour = useCallback((pathname) => {
    const found = getPageTour(pathname);
    if (found.length === 0) return;
    setWelcomeOpen(false);
    setStepIndex(0);
    setPageSteps(found);
    setMode('page');
  }, []);

  // Berhenti bila rute berubah: tur Keuangan tidak boleh terus berjalan di
  // atas halaman Agenda.
  useEffect(() => {
    setMode(null);
    setPageSteps([]);
  }, [location.pathname]);

  const nextStep = useCallback(() => {
    setStepIndex((i) => {
      if (i >= steps.length - 1) { stopTour(); return i; }
      return i + 1;
    });
  }, [steps.length, stopTour]);

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
