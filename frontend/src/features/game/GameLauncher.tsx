import { useEffect, useRef } from 'react';
import type { MouseEvent } from 'react';
import { GameDialog } from './game-dialog';
import { getAdapters } from '../../services/auth';
import '../../styles/blue-pulse.css';
import './GameLauncher.css';

// The modal is imperative DOM: replace an old open instance when its code updates.
if (import.meta.hot) {
  import.meta.hot.accept('./game-dialog', () => window.location.reload());
}

/** React owns the launcher; the existing Canvas game owns its native modal. */
export function GameLauncher() {
  const dialogRef = useRef<GameDialog | null>(null);
  const openGame = (event: MouseEvent<HTMLButtonElement>) => {
    void dialogRef.current?.open(event.currentTarget);
  };

  useEffect(() => {
    const dialog = new GameDialog(getAdapters());
    dialogRef.current = dialog;
    return () => {
      dialog.destroy();
      dialogRef.current = null;
    };
  }, []);

  return (
    <section className="ocean-game-entry" aria-labelledby="ocean-game-title">
      <div className="ocean-game-ambience" aria-hidden="true">
        <svg className="ocean-game-waves" viewBox="0 0 1440 320" preserveAspectRatio="none">
          <path className="ocean-game-wave ocean-game-wave-back" d="M-200 150 Q0 60 240 150 T720 150 T1200 150 T1680 150 L1680 320 H-200Z" />
          <path className="ocean-game-wave ocean-game-wave-front" d="M-200 210 Q40 120 280 210 T760 210 T1240 210 T1720 210 L1720 320 H-200Z" />
        </svg>
        <span className="ocean-game-bubble" /><span className="ocean-game-bubble" />
        <span className="ocean-game-bubble" /><span className="ocean-game-bubble" />
        <span className="ocean-game-bubble" /><span className="ocean-game-bubble" />
      </div>
      <div className="ocean-game-grid">
      <h2 className="ocean-game-heading">
        <button type="button" className="ocean-game-card" aria-haspopup="dialog"
          aria-labelledby="ocean-game-title" aria-describedby="ocean-game-tagline" onClick={openGame}>
          <span className="ocean-game-eyebrow">BLUE PULSE ARCADE</span>
          <span id="ocean-game-title" className="ocean-game-title">
            Ocean Rush <span className="ocean-game-arrow" aria-hidden="true">→</span>
          </span>
          <span id="ocean-game-tagline" className="ocean-game-tagline">
            Ride the waves or explore the reef. Two modes, one endless adventure.
          </span>
        </button>
      </h2>
      {[2, 3].map(number => (
        <h2 className="ocean-game-heading" key={number}>
          <button type="button" className="ocean-game-card" disabled
            aria-labelledby={`ocean-game-${number}-title`} aria-describedby={`ocean-game-${number}-status`}>
            <span className="ocean-game-eyebrow">BLUE PULSE ARCADE</span>
            <span id={`ocean-game-${number}-title`} className="ocean-game-title">Game {number}</span>
            <span id={`ocean-game-${number}-status`} className="ocean-game-tagline">Coming soon</span>
          </button>
        </h2>
      ))}
      </div>
    </section>
  );
}
