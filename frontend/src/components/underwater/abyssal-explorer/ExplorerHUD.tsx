import { useState } from 'react';
import { abyssalLandmarks } from './Landmarks';
import type { LandmarkDefinition } from './types';

export interface ExplorerHUDProps {
  speed: number;
  depth: number;
  heading: number;
  boost: boolean;
  sonarReady: boolean;
  discoveryCount: number;
  interactionLabel: string;
  nearbyLandmark?: LandmarkDefinition;
  navigationTarget?: LandmarkDefinition;
  navigationDistance?: number;
  navigationBearing?: number;
  statusMessage: string;
  paused: boolean;
  soundEnabled: boolean;
  discoveredLandmarkIds: string[];
  selectedLandmarkId?: string;
  onTogglePause: () => void;
  onToggleSound: () => void;
  onExit: () => void;
  onRestart: () => void;
  onResetProgress: () => void;
  onInteract: () => void;
  onSonar: () => void;
  onSelectLandmark: (id: string) => void;
}

export function ExplorerHUD({
  speed,
  depth,
  heading,
  boost,
  sonarReady,
  discoveryCount,
  interactionLabel,
  nearbyLandmark,
  navigationTarget,
  navigationDistance,
  navigationBearing = 0,
  statusMessage,
  paused,
  soundEnabled,
  discoveredLandmarkIds,
  selectedLandmarkId,
  onTogglePause,
  onToggleSound,
  onExit,
  onRestart,
  onResetProgress,
  onInteract,
  onSonar,
  onSelectLandmark,
}: ExplorerHUDProps) {
  const [journalOpen, setJournalOpen] = useState(false);
  const compassPoints = ['N', 'NE', 'E', 'SE', 'S', 'SW', 'W', 'NW'];
  const compassPoint = compassPoints[Math.round(heading / 45) % compassPoints.length];
  const targetPoint = compassPoints[Math.round(navigationBearing / 45) % compassPoints.length];
  const targetName = nearbyLandmark?.name ?? navigationTarget?.name;
  const targetDescription = nearbyLandmark?.description ?? navigationTarget?.description ?? statusMessage;
  const panelVisible = Boolean(navigationTarget && (navigationDistance ?? Infinity) <= 58);

  return (
    <div className="abyssal-explorer-hud">
      <header className="abyssal-explorer-topbar">
        <div className="abyssal-topbar-left">
          <div className="abyssal-explorer-brand">
            <span className="abyssal-eyebrow">LITFEST 2.0</span>
            <h2>ABYSSAL VOYAGE</h2>
          </div>
          <details className="abyssal-control-hint">
            <summary aria-label="Show controls">Controls</summary>
            <p>WASD / arrows · Shift boost · Space sonar · E explore</p>
          </details>
          <details className="abyssal-status">
            <summary>Voyage log</summary>
            <div className="abyssal-status-content">
              <span>{speed.toFixed(0)} kn · {depth.toFixed(0)} m</span>
              <span>{boost ? 'Boosting' : 'Cruising'} · Sonar {sonarReady ? 'ready' : 'charging'}</span>
              <span>{discoveryCount}/5 relics · {discoveredLandmarkIds.length}/{abyssalLandmarks.length} landmarks</span>
              <div className="abyssal-status-actions">
                <button type="button" onClick={onRestart}>Checkpoint</button>
                <button type="button" onClick={onResetProgress}>Reset relics</button>
              </div>
            </div>
          </details>
          <button
            type="button"
            className="abyssal-journal-toggle"
            onClick={() => setJournalOpen(true)}
            aria-haspopup="dialog"
          >
            Destinations
          </button>
        </div>
        <div className="abyssal-explorer-actions">
          <button type="button" className="abyssal-mini-btn" onClick={onToggleSound}>
            {soundEnabled ? 'Sound on' : 'Sound off'}
          </button>
          <button type="button" className="abyssal-mini-btn" onClick={onTogglePause}>
            {paused ? 'Resume' : 'Pause'}
          </button>
          <button type="button" className="abyssal-mini-btn abyssal-danger" onClick={onExit}>
            Exit
          </button>
        </div>
      </header>

      {panelVisible && (
        <section className="abyssal-landmark-panel" aria-live="polite">
          <div className="abyssal-landmark-header">
            <div>
              <span className="abyssal-landmark-label">{nearbyLandmark ? 'DESTINATION IN RANGE' : 'BEARING TO DESTINATION'}</span>
              <h3>{targetName}</h3>
            </div>
          </div>
          <p>{targetDescription}</p>
          {!nearbyLandmark && (
            <span className="abyssal-navigation-distance">
              {targetPoint} · {Math.round(navigationDistance ?? 0)} m away
            </span>
          )}
          {nearbyLandmark && (
            <button type="button" className="abyssal-primary-btn" onClick={onInteract}>
              {interactionLabel}
            </button>
          )}
        </section>
      )}

      <div className="abyssal-compass-control">
        <span
          className="abyssal-compass"
          aria-label={`Heading ${Math.round(heading)} degrees${targetName ? `, ${targetPoint} to ${targetName}` : ''}`}
        >
          {compassPoint}
          <span
            className="abyssal-compass-needle"
            style={{ transform: `rotate(${navigationBearing - heading}deg)` }}
            aria-hidden="true"
          />
        </span>
        <button type="button" className="abyssal-sonar-control" onClick={onSonar} disabled={!sonarReady}>
          {sonarReady ? 'SONAR' : 'RECHARGING'}
        </button>
      </div>

      {journalOpen && (
        <div className="abyssal-journal-backdrop" role="presentation" onClick={() => setJournalOpen(false)}>
          <section
            className="abyssal-journal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="abyssal-journal-title"
            onClick={(event) => event.stopPropagation()}
            onKeyDown={(event) => {
              if (event.key === 'Escape') {
                event.stopPropagation();
                setJournalOpen(false);
              }
            }}
            tabIndex={-1}
          >
            <header>
              <div>
                <span className="abyssal-eyebrow">EXPEDITION CHART</span>
                <h2 id="abyssal-journal-title">Choose a destination</h2>
              </div>
              <button type="button" className="abyssal-mini-btn" onClick={() => setJournalOpen(false)} aria-label="Close destinations">
                Close
              </button>
            </header>
            <p>Follow the compass toward a landmark, or discover it in the open water.</p>
            <ul>
              {abyssalLandmarks.map((landmark) => {
                const discovered = discoveredLandmarkIds.includes(landmark.id);
                const selected = selectedLandmarkId === landmark.id;
                return (
                  <li key={landmark.id}>
                    <button
                      type="button"
                      className={selected ? 'abyssal-destination selected' : 'abyssal-destination'}
                      onClick={() => {
                        onSelectLandmark(landmark.id);
                        setJournalOpen(false);
                      }}
                    >
                      <span className="abyssal-destination-symbol" style={{ color: landmark.accent }}>
                        {discovered ? '✦' : '·'}
                      </span>
                      <span>
                        <strong>{landmark.name}</strong>
                        <small>{discovered ? 'Discovered' : 'Uncharted'} · {landmark.description}</small>
                      </span>
                      <span aria-hidden="true">{selected ? 'Following' : '→'}</span>
                    </button>
                  </li>
                );
              })}
            </ul>
          </section>
        </div>
      )}
    </div>
  );
}

export default ExplorerHUD;
