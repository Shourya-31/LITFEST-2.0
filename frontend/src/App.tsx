import { Suspense, lazy, useCallback, useState } from 'react';
import { LitfestUnderwaterHome } from './features/home';
import type { AbyssalNavigationTarget } from './components/underwater/abyssal-explorer';
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

function App() {
  const [requestedDestination] = useState(readDestinationFromUrl);
  const [activeDestination, setActiveDestination] = useState<'timeline' | null>(() =>
    requestedDestination === 'timeline'
      ? requestedDestination
      : null
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
            aria-label="Return to the homepage"
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
}

export default App;
