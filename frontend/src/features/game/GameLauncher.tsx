import { useEffect, useRef } from 'react';
import type { MouseEvent } from 'react';
import { GameDialog } from './game-dialog';
import { getAdapters } from '../../services/auth';
import { AtlantisDialog } from '../atlantis/dialog';
import { MemoryAtlantisService } from '../atlantis/service';
import { AquaSplashDialog } from '../aqua-splash/dialog';
import { MemoryAquaSplashService } from '../aqua-splash/service';
import '../../styles/blue-pulse.css';
import '../atlantis/atlantis.css';
import '../aqua-splash/aqua-splash.css';
import './GameLauncher.css';

// The modal is imperative DOM: replace an old open instance when its code updates.
if (import.meta.hot) {
  import.meta.hot.accept('./game-dialog', () => window.location.reload());
  import.meta.hot.accept('../atlantis/dialog', () => window.location.reload());
  import.meta.hot.accept('../aqua-splash/dialog', () => window.location.reload());
}

/** React owns the launcher; the existing Canvas game owns its native modal. */
export function GameLauncher() {
  const dialogRef = useRef<GameDialog | null>(null);
  const atlantisRef = useRef<AtlantisDialog | null>(null);
  const aquaSplashRef = useRef<AquaSplashDialog | null>(null);
  const openGame = (event: MouseEvent<HTMLButtonElement>) => {
    void dialogRef.current?.open(event.currentTarget);
  };

  useEffect(() => {
    const adapters = getAdapters();
    const dialog = new GameDialog(adapters);
    const atlantis = new AtlantisDialog({auth:adapters.auth,
      service:window.bluePulseAtlantisService ?? new MemoryAtlantisService(adapters.auth)});
    const aquaSplash = new AquaSplashDialog({
      auth: adapters.auth,
      service: window.bluePulseAquaSplashService ?? new MemoryAquaSplashService(adapters.auth)
    });
    dialogRef.current = dialog;
    atlantisRef.current = atlantis;
    aquaSplashRef.current = aquaSplash;
    return () => {
      dialog.destroy();
      atlantis.destroy();
      aquaSplash.destroy();
      dialogRef.current = null;
      atlantisRef.current = null;
      aquaSplashRef.current = null;
    };
  }, []);

  return (
    <section className="ocean-game-entry">
      <div className="ocean-game-ambience" aria-hidden="true">
        <svg className="ocean-game-waves" viewBox="0 0 1440 320" preserveAspectRatio="none">
          <path className="ocean-game-wave ocean-game-wave-back" d="M-200 150 Q0 60 240 150 T720 150 T1200 150 T1680 150 L1680 320 H-200Z" />
          <path className="ocean-game-wave ocean-game-wave-front" d="M-200 210 Q40 120 280 210 T760 210 T1240 210 T1720 210 L1720 320 H-200Z" />
        </svg>
        <span className="ocean-game-bubble" /><span className="ocean-game-bubble" />
        <span className="ocean-game-bubble" /><span className="ocean-game-bubble" />
        <span className="ocean-game-bubble" /><span className="ocean-game-bubble" />
      </div>

      <div className="ocean-arcade-header">
        <h2 className="ocean-arcade-title">
          Sunken Arcade &amp; Minigames
        </h2>
        <p className="ocean-arcade-desc">
          Take a break from the sessions. Test your reflexes, explore lost literary chambers, or stack crystalline blocks below the surface.
        </p>
      </div>

      <div className="ocean-game-grid">
        <h2 className="ocean-game-heading">
          <button
            type="button"
            className="ocean-game-card ocean-game-card-rush"
            aria-haspopup="dialog"
            aria-labelledby="ocean-game-title"
            aria-describedby="ocean-game-tagline"
            onClick={openGame}
          >
            <span className="ocean-game-eyebrow">BLUE PULSE ARCADE</span>
            <span id="ocean-game-title" className="ocean-game-title">
              <span>Ocean Rush</span>
              <span className="game-status-badge rush-status">READY</span>
            </span>
            <span id="ocean-game-tagline" className="ocean-game-tagline">
              Ride the waves or explore the reef. Two modes, one endless adventure.
            </span>

            <div className="ocean-game-card-footer">
              <span className="ocean-game-play-btn rush-play-btn">
                <span className="play-triangle" aria-hidden="true">▶</span>
                <span>PLAY NOW</span>
              </span>
              <span className="ocean-game-meta">Endless Waves</span>
            </div>
          </button>
        </h2>

        <h2 className="ocean-game-heading">
          <button
            type="button"
            className="ocean-game-card ocean-game-card-atlantis"
            aria-haspopup="dialog"
            aria-labelledby="ocean-game-2-title"
            aria-describedby="ocean-game-2-status"
            onClick={event => { void atlantisRef.current?.open(event.currentTarget); }}
          >
            <span className="ocean-game-eyebrow">LITERARY QUIZ ADVENTURE</span>
            <span id="ocean-game-2-title" className="ocean-game-title">
              <span>The Sunken City of Atlantis</span>
              <span className="game-status-badge atlantis-status">10 LEVELS</span>
            </span>
            <span id="ocean-game-2-status" className="ocean-game-tagline">
              Ten lost chambers. Test your literary knowledge and awaken Atlantis.
            </span>

            <div className="ocean-game-card-footer">
              <span className="ocean-game-play-btn atlantis-play-btn">
                <span className="play-triangle" aria-hidden="true">▶</span>
                <span>ENTER RUINS</span>
              </span>
              <span className="ocean-game-meta">Trivia &amp; Lore</span>
            </div>
          </button>
        </h2>

        <h2 className="ocean-game-heading">
          <button
            type="button"
            className="ocean-game-card ocean-game-card-aqua"
            aria-haspopup="dialog"
            aria-labelledby="ocean-game-3-title"
            aria-describedby="ocean-game-3-status"
            onClick={event => { void aquaSplashRef.current?.open(event.currentTarget); }}
          >
            <span className="ocean-game-eyebrow">UNDERWATER TETRIS ARCADE</span>
            <span id="ocean-game-3-title" className="ocean-game-title">
              <span>Aqua Splash</span>
              <span className="game-status-badge aqua-status">ARCADE</span>
            </span>
            <span id="ocean-game-3-status" className="ocean-game-tagline">
              Dive into the sunken ruins. Stack crystal blocks, hold pieces, and earn credits.
            </span>

            <div className="ocean-game-card-footer">
              <span className="ocean-game-play-btn aqua-play-btn">
                <span className="play-triangle" aria-hidden="true">▶</span>
                <span>DROP IN</span>
              </span>
              <span className="ocean-game-meta">Puzzle Challenge</span>
            </div>
          </button>
        </h2>
      </div>
    </section>
  );
}
