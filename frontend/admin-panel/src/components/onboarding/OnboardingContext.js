import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { visibleFeatures } from './content';

const OnboardingContext = createContext(null);

const flagKey = (userId) => `masjid_onboarding_seen_v1_${userId || 'anon'}`;

export const OnboardingProvider = ({ children }) => {
  const { user } = useAuth();
  const [welcomeOpen, setWelcomeOpen] = useState(false);
  const [tourActive, setTourActive] = useState(false);
  const [stepIndex, setStepIndex] = useState(0);

  const steps = useMemo(() => visibleFeatures(user?.role), [user?.role]);

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

  const startTour = useCallback(() => {
    setWelcomeOpen(false);
    setStepIndex(0);
    setTourActive(true);
  }, []);

  const stopTour = useCallback(() => {
    setTourActive(false);
    markSeen();
  }, [markSeen]);

  const nextStep = useCallback(() => {
    setStepIndex((i) => {
      if (i >= steps.length - 1) { setTourActive(false); markSeen(); return i; }
      return i + 1;
    });
  }, [steps.length, markSeen]);

  const prevStep = useCallback(() => setStepIndex((i) => Math.max(0, i - 1)), []);

  // Opened manually from the help button — reset and show welcome again.
  const openHelp = useCallback(() => {
    setStepIndex(0);
    setWelcomeOpen(true);
  }, []);

  const value = {
    welcomeOpen, tourActive, stepIndex, steps,
    startTour, stopTour, nextStep, prevStep, closeWelcome, openHelp,
  };

  return <OnboardingContext.Provider value={value}>{children}</OnboardingContext.Provider>;
};

export const useOnboarding = () => {
  const ctx = useContext(OnboardingContext);
  if (!ctx) throw new Error('useOnboarding must be used within an OnboardingProvider');
  return ctx;
};
