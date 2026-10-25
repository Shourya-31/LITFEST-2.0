import { Suspense, lazy, useEffect, useState } from 'react';
import { LitfestUnderwaterHome } from './features/home';
import type { AbyssalNavigationTarget } from './components/underwater/abyssal-explorer';
import './App.css';

const LazyPirateWheelTimeline = lazy(() =>
  import('./features/schedule/PirateWheelTimeline').then(({ PirateWheelTimeline }) => ({
    default: PirateWheelTimeline,
  }))
);
const LazyFaqSection = lazy(() =>
  import('./features/faq/FaqSection').then(({ FaqSection }) => ({ default: FaqSection }))
);

function App() {
  const [activeDestination, setActiveDestination] = useState<'timeline' | 'faq' | null>(null);

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

  const handleAbyssalNavigate = (target: AbyssalNavigationTarget) => {
    if (target === 'timeline' || target === 'faq') {
      setActiveDestination(target);
    }
  };

  return (
    <div className="app-container">
      <LitfestUnderwaterHome
        onAbyssalNavigate={handleAbyssalNavigate}
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
