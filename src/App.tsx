import React, { Suspense, lazy, useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, useNavigate, useLocation } from 'react-router-dom';
import Lenis from 'lenis';
import { gsap } from 'gsap';
import 'lenis/dist/lenis.css';
import { AuthProvider } from './state/AuthContext';
import { LitfestUnderwaterHome } from './features/home';
import type { AbyssalNavigationTarget } from './components/underwater/abyssal-explorer';

import './App.css';

const LazyContactUs = lazy(() => import('./features/contact/ContactUs'));
const LazySponsorPage = lazy(() => import('./SponsorPageStandalone'));
const LazyOurTeamPage = lazy(() => import('./features/teams/OurTeamPage'));
const LazyDevelopersPage = lazy(() => import('./features/teams/DevelopersPage'));
const LazyLoginPage = lazy(() => import('./features/auth/LoginPage'));
const LazySignupPage = lazy(() => import('./features/auth/SignupPage'));
const LazyForgotPasswordPage = lazy(() => import('./features/auth/ForgotPasswordPage'));
const LazyResetPasswordPage = lazy(() => import('./features/auth/ResetPasswordPage'));
const LazyParticipantDashboard = lazy(() => import('./features/participant/ParticipantDashboard'));
const LazyAdminDashboard = lazy(() => import('./features/admin/AdminDashboard'));
const LazyAbyssalExplorer = lazy(() =>
  import('./components/underwater/abyssal-explorer').then(({ AbyssalExplorer }) => ({
    default: AbyssalExplorer,
  }))
);

const destinationTargets = new Set<string>([
  'home',
  'arcade',
  '3d',
  'about',
  'timeline',
  'schedule',
  'sponsors',
  'faq',
  'contact',
  'events',
  'register',
]);

function isAbyssalDestination(value: string | null): value is AbyssalNavigationTarget {
  return value !== null && destinationTargets.has(value);
}

function readDestinationFromUrl(): AbyssalNavigationTarget | null {
  const destination = new URLSearchParams(window.location.search).get('destination');
  return isAbyssalDestination(destination) ? destination : null;
}

const HomeView: React.FC<{ initialTarget?: AbyssalNavigationTarget }> = ({ initialTarget }) => {
  const [requestedDestination] = useState<AbyssalNavigationTarget | null>(
    () => initialTarget || readDestinationFromUrl()
  );

  return (
    <div className="app-container">
      <LitfestUnderwaterHome
        initialDestination={requestedDestination}
      />
    </div>
  );
};

const AbyssalRouteView: React.FC = () => {
  const navigate = useNavigate();
  return <LazyAbyssalExplorer autoplay onExit={() => navigate('/')} />;
};

const ScrollToTop: React.FC = () => {
  const { pathname } = useLocation();

  useEffect(() => {
    const lenis = (window as unknown as { __lenis?: Lenis }).__lenis;
    if (lenis) {
      lenis.scrollTo(0, { immediate: true });
    } else {
      window.scrollTo(0, 0);
    }
  }, [pathname]);

  return null;
};

export const App: React.FC = () => {
  useEffect(() => {
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReducedMotion) return undefined;

    // Initialize Lenis Smooth Scrolling
    const lenis = new Lenis({
      duration: 1.2,
      easing: (t: number) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      orientation: 'vertical',
      gestureOrientation: 'vertical',
      smoothWheel: true,
      touchMultiplier: 1.5,
      autoRaf: false, // Explicitly synced with GSAP ticker
    });

    // Synchronize Lenis with GSAP Ticker for 60/120fps buttery smooth scrolling
    const updateTicker = (time: number) => {
      lenis.raf(time * 1000);
    };

    gsap.ticker.add(updateTicker);
    gsap.ticker.lagSmoothing(0);

    (window as unknown as { __lenis?: Lenis }).__lenis = lenis;

    return () => {
      gsap.ticker.remove(updateTicker);
      lenis.destroy();
      delete (window as unknown as { __lenis?: Lenis }).__lenis;
    };
  }, []);

  return (
    <AuthProvider>
      <Router>
        <ScrollToTop />
        <Suspense fallback={<div className="route-loading" role="status">Loading page…</div>}>
          <Routes>
            {/* Main Underwater Home View */}
            <Route path="/" element={<HomeView />} />
            <Route path="/timeline" element={<HomeView initialTarget="timeline" />} />
            <Route path="/schedule" element={<HomeView initialTarget="timeline" />} />
            <Route path="/events" element={<HomeView initialTarget="events" />} />
            <Route path="/faq" element={<HomeView initialTarget="faq" />} />
            <Route path="/contact" element={<HomeView initialTarget="contact" />} />

            {/* Standalone / Deep Pages */}
            <Route path="/team" element={<LazyOurTeamPage />} />
            <Route path="/our-team" element={<LazyOurTeamPage />} />
            <Route path="/developers" element={<LazyDevelopersPage />} />
            <Route path="/contactus.html" element={<LazyContactUs />} />
            <Route path="/sponsors" element={<LazySponsorPage />} />
            <Route path="/sponsors.html" element={<LazySponsorPage />} />
            <Route path="/abyssal" element={<AbyssalRouteView />} />
            <Route path="/explorer" element={<AbyssalRouteView />} />
            <Route path="/dashboard" element={<LazyParticipantDashboard />} />
            <Route path="/admin/dashboard" element={<LazyAdminDashboard />} />

            {/* Auth Feature Screens */}
            <Route path="/login" element={<LazyLoginPage />} />
            <Route path="/signup" element={<LazySignupPage />} />
            <Route path="/register" element={<LazySignupPage />} />
            <Route path="/forgot-password" element={<LazyForgotPasswordPage />} />
            <Route path="/reset-password" element={<LazyResetPasswordPage />} />

            {/* Fallback to Home */}
            <Route path="*" element={<HomeView />} />
          </Routes>
        </Suspense>
      </Router>
    </AuthProvider>
  );
};

export default App;
