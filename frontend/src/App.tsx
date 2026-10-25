import { Suspense, lazy, useCallback, useEffect, useState } from 'react';
import { LitfestUnderwaterHome } from './features/home';
import type { AbyssalNavigationTarget } from './components/underwater/abyssal-explorer';
import './App.css';

const destinationTargets = new Set<string>([
  'home',
  'timeline',
  'about',
  'arcade',
  'faq',
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
const LazyFaqSection = lazy(() =>
  import('./features/faq/FaqSection').then(({ FaqSection }) => ({ default: FaqSection }))
);

function App() {
  const [requestedDestination] = useState(readDestinationFromUrl);
  const [activeDestination, setActiveDestination] = useState<'timeline' | 'faq' | null>(() =>
    requestedDestination === 'timeline' || requestedDestination === 'faq'
      ? requestedDestination
      : null
  );

  useEffect(() => {
    if (activeDestination !== 'faq') return undefined;
    const previousBodyOverflow = document.body.style.overflow;
    const previousDocumentOverflow = document.documentElement.style.overflow;
    document.body.style.overflow = 'hidden';
    document.documentElement.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = previousBodyOverflow;
      document.documentElement.style.overflow = previousDocumentOverflow;
    };
  }, [activeDestination]);

  const handleAbyssalNavigate = useCallback((target: AbyssalNavigationTarget) => {
    if (target === 'timeline' || target === 'faq') {
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
      {activeDestination && (
        <div
          className="abyssal-destination-overlay"
          role="dialog"
          aria-modal="true"
          aria-label={activeDestination === 'timeline' ? 'Festival timeline' : 'Festival FAQs'}
        >
          <button
            type="button"
            className="abyssal-destination-exit"
            onClick={() => setActiveDestination(null)}
            aria-label="Return to the homepage"
          >
            Return to the ocean
          </button>
          <Suspense fallback={<div className="abyssal-loading" role="status">Opening festival destination…</div>}>
            {activeDestination === 'timeline' ? (
              <LazyPirateWheelTimeline onNavigateHome={() => setActiveDestination(null)} />
            ) : (
              <LazyFaqSection />
            )}
          </Suspense>
        </div>
      )}
    </div>
  );
}

export default App;
