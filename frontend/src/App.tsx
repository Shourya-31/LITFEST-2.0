import React, { Suspense, lazy, useCallback, useState } from 'react';
import { BrowserRouter as Router, Routes, Route, useNavigate } from 'react-router-dom';
import { AuthProvider } from './state/AuthContext';
import { LitfestUnderwaterHome } from './features/home';
import type { AbyssalNavigationTarget } from './components/underwater/abyssal-explorer';

import './App.css';

const LazyContactUs = lazy(() => import('./features/contact/ContactUs'));
const LazySponsorPage = lazy(() => import('./SponsorPageStandalone'));
const LazyLoginPage = lazy(() => import('./features/auth/LoginPage'));
const LazySignupPage = lazy(() => import('./features/auth/SignupPage'));
const LazyForgotPasswordPage = lazy(() => import('./features/auth/ForgotPasswordPage'));
const LazyResetPasswordPage = lazy(() => import('./features/auth/ResetPasswordPage'));
const LazyParticipantDashboard = lazy(() => import('./features/participant/ParticipantDashboard'));
const LazyAbyssalExplorer = lazy(() =>
  import('./components/underwater/abyssal-explorer').then(({ AbyssalExplorer }) => ({
    default: AbyssalExplorer,
  }))
);

const destinationTargets = new Set<string>([
  'home',
  'timeline',
  'about',
  'arcade',
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

const LazyPirateWheelTimeline = lazy(() =>
  import('./features/schedule/PirateWheelTimeline').then(({ PirateWheelTimeline }) => ({
    default: PirateWheelTimeline,
  }))
);

const HomeView: React.FC = () => {
  const [requestedDestination] = useState(readDestinationFromUrl);
  const [activeDestination, setActiveDestination] = useState<'timeline' | null>(() =>
    requestedDestination === 'timeline' ? requestedDestination : null
  );

  const handleAbyssalNavigate = useCallback((target: AbyssalNavigationTarget) => {
    if (target === 'timeline') {
      setActiveDestination(target);
    }
  }, []);

  return (
    <div className="app-container">
      <LitfestUnderwaterHome
        onAbyssalNavigate={handleAbyssalNavigate}
        initialDestination={requestedDestination}
        isDestinationOpen={activeDestination !== null}
      />
      {activeDestination === 'timeline' && (
        <div
          className="abyssal-destination-overlay"
          role="dialog"
          aria-modal="true"
          aria-label="Festival timeline"
        >
          <button
            type="button"
            className="abyssal-destination-exit"
            onClick={() => setActiveDestination(null)}
            aria-label="Return to the ocean"
          >
            Return to the ocean
          </button>
          <Suspense fallback={<div className="abyssal-loading" role="status">Opening festival destination…</div>}>
            <LazyPirateWheelTimeline onNavigateHome={() => setActiveDestination(null)} />
          </Suspense>
        </div>
      )}
    </div>
  );
};

const AbyssalRouteView: React.FC = () => {
  const navigate = useNavigate();
  return <LazyAbyssalExplorer autoplay onExit={() => navigate('/')} />;
};

export const App: React.FC = () => {
  return (
    <AuthProvider>
      <Router>
        <Suspense fallback={<div className="route-loading" role="status">Loading page…</div>}>
          <Routes>
            {/* Main Underwater Home View */}
            <Route path="/" element={<HomeView />} />

            {/* Standalone / Deep Pages */}
            <Route path="/contact" element={<LazyContactUs />} />
            <Route path="/contactus.html" element={<LazyContactUs />} />
            <Route path="/sponsors" element={<LazySponsorPage />} />
            <Route path="/sponsors.html" element={<LazySponsorPage />} />
            <Route path="/abyssal" element={<AbyssalRouteView />} />
            <Route path="/explorer" element={<AbyssalRouteView />} />
            <Route path="/dashboard" element={<LazyParticipantDashboard />} />

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
