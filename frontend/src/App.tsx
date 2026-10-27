import React, { Suspense, lazy, useCallback, useState } from 'react';
import { BrowserRouter as Router, Routes, Route, useNavigate } from 'react-router-dom';
import { AuthProvider } from './state/AuthContext';
import { LitfestUnderwaterHome } from './features/home';
import ContactUs from './features/contact/ContactUs';
import SponsorPage from './SponsorPageStandalone';
import { AbyssalExplorer } from './components/underwater/abyssal-explorer';
import type { AbyssalNavigationTarget } from './components/underwater/abyssal-explorer';

// Auth & User Pages
import LoginPage from './features/auth/LoginPage';
import SignupPage from './features/auth/SignupPage';
import ForgotPasswordPage from './features/auth/ForgotPasswordPage';
import ResetPasswordPage from './features/auth/ResetPasswordPage';
import ParticipantDashboard from './features/participant/ParticipantDashboard';

import './App.css';

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
  return <AbyssalExplorer autoplay onExit={() => navigate('/')} />;
};

export const App: React.FC = () => {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          {/* Main Underwater Home View */}
          <Route path="/" element={<HomeView />} />

          {/* Standalone / Deep Pages */}
          <Route path="/contact" element={<ContactUs />} />
          <Route path="/contactus.html" element={<ContactUs />} />
          <Route path="/sponsors" element={<SponsorPage />} />
          <Route path="/sponsors.html" element={<SponsorPage />} />
          <Route path="/abyssal" element={<AbyssalRouteView />} />
          <Route path="/explorer" element={<AbyssalRouteView />} />
          <Route path="/dashboard" element={<ParticipantDashboard />} />

          {/* Auth Feature Screens */}
          <Route path="/login" element={<LoginPage />} />
          <Route path="/signup" element={<SignupPage />} />
          <Route path="/register" element={<SignupPage />} />
          <Route path="/forgot-password" element={<ForgotPasswordPage />} />
          <Route path="/reset-password" element={<ResetPasswordPage />} />

          {/* Fallback to Home */}
          <Route path="*" element={<HomeView />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
};

export default App;
