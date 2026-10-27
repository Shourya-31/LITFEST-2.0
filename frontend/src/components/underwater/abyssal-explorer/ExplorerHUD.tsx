import { abyssalLandmarks, relics } from './Landmarks';
import type { AbyssalNavigationTarget, LandmarkDefinition, RelicDefinition } from './types';

const artifactByLandmark = new Map(relics.map((artifact) => [artifact.landmarkId, artifact]));

export interface ExplorerHUDProps {
  speed: number;
  depth: number;
  heading: number;
  boost: boolean;
  sonarReady: boolean;
  discoveryCount: number;
  interactionLabel: string;
  nearbyArtifact?: RelicDefinition;
  nearbyLandmark?: LandmarkDefinition;
  navigationTarget?: LandmarkDefinition;
  navigationDistance?: number;
  navigationBearing?: number;
  statusMessage: string;
  paused: boolean;
  soundEnabled: boolean;
  discoveredLandmarkIds: string[];
  collectedArtifactIds: string[];
  journalOpen: boolean;
  selectedLandmarkId?: string;
  onOpenJournal: () => void;
  onCloseJournal: () => void;
  onNavigate: (route: AbyssalNavigationTarget) => void;
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
  nearbyArtifact,
  nearbyLandmark,
  navigationTarget,
  navigationDistance,
  navigationBearing = 0,
  statusMessage,
  paused,
  soundEnabled,
  discoveredLandmarkIds,
  collectedArtifactIds,
  journalOpen,
  selectedLandmarkId,
  onOpenJournal,
  onCloseJournal,
  onNavigate,
  onTogglePause,
  onToggleSound,
  onExit,
  onRestart,
  onResetProgress,
  onInteract,
  onSonar,
  onSelectLandmark,
}: ExplorerHUDProps) {
  const compassPoints = ['N', 'NE', 'E', 'SE', 'S', 'SW', 'W', 'NW'];
  const compassPoint = compassPoints[Math.round(heading / 45) % compassPoints.length];
  const targetPoint = compassPoints[Math.round(navigationBearing / 45) % compassPoints.length];
  const targetName = nearbyLandmark?.name ?? navigationTarget?.name;
  const targetDescription = nearbyLandmark?.description ?? navigationTarget?.description ?? statusMessage;
  const panelVisible = Boolean(nearbyArtifact || (navigationTarget && (navigationDistance ?? Infinity) <= 58));

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
            <p>WASD / arrows · Shift boost · Space sonar · E collect</p>
          </details>
          <details className="abyssal-status">
            <summary>Voyage log</summary>
            <div className="abyssal-status-content">
              <span>{speed.toFixed(0)} kn · {depth.toFixed(0)} m</span>
              <span>{boost ? 'Boosting' : 'Cruising'} · Sonar {sonarReady ? 'ready' : 'charging'}</span>
              <span>{discoveryCount}/7 artifacts · {discoveredLandmarkIds.length}/{abyssalLandmarks.length} landmarks charted</span>
              <div className="abyssal-status-actions">
                <button type="button" onClick={onRestart}>Checkpoint</button>
                <button type="button" onClick={onResetProgress}>Reset hunt</button>
              </div>
            </div>
          </details>
          <button
            type="button"
            className="abyssal-journal-toggle"
            onClick={onOpenJournal}
            aria-haspopup="dialog"
          >
            Artifacts {discoveryCount}/7
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
              <span className="abyssal-landmark-label">{nearbyArtifact ? 'AN ARTIFACT NEARBY' : nearbyLandmark ? 'LANDMARK IN RANGE' : 'BEARING TO DESTINATION'}</span>
              <h3>{nearbyArtifact?.name ?? targetName}</h3>
            </div>
          </div>
          <p>{nearbyArtifact ? `${nearbyArtifact.destination} destination artifact` : targetDescription}</p>
          {nearbyArtifact ? (
            <button type="button" className="abyssal-primary-btn" onClick={onInteract}>
              {interactionLabel}
            </button>
          ) : !nearbyLandmark && (
            <span className="abyssal-navigation-distance">
              {targetPoint} · {Math.round(navigationDistance ?? 0)} m away
            </span>
          )}
        </section>
      )}

      <div className="abyssal-artifact-progress" role="status" aria-label={`${discoveryCount} of 7 artifacts collected`}>
        <strong>ARTIFACTS: {discoveryCount} / 7</strong>
        <div className="abyssal-artifact-dots">
          {abyssalLandmarks.map((entry) => {
            const artifact = artifactByLandmark.get(entry.id);
            const collected = artifact && collectedArtifactIds.includes(artifact.id);
            return <span key={entry.id} className={collected ? 'collected' : ''} aria-label={`${artifact?.name ?? entry.name}${collected ? ' collected' : ' not collected'}`} />;
          })}
        </div>
      </div>

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
        <div className="abyssal-journal-backdrop" role="presentation" onClick={onCloseJournal}>
          <section
            className="abyssal-journal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="abyssal-journal-title"
            onClick={(event) => event.stopPropagation()}
            onKeyDown={(event) => {
              if (event.key === 'Escape') {
                event.stopPropagation();
                onCloseJournal();
              }
            }}
            tabIndex={-1}
          >
            <header>
              <div>
                <span className="abyssal-eyebrow">THE SEVEN SACRED ARTIFACTS</span>
                <h2 id="abyssal-journal-title">Artifact Journal · {discoveryCount}/7</h2>
              </div>
              <button type="button" className="abyssal-mini-btn" onClick={onCloseJournal} aria-label="Close destinations">
                Close
              </button>
            </header>
            <p>Collect each artifact in the world to unlock its real LITFEST destination.</p>
            <ul>
              {abyssalLandmarks.map((landmark) => {
                const artifact = requireArtifactByLandmark(landmark.id);
                if (!artifact) return null;
                const unlocked = collectedArtifactIds.includes(artifact.id);
                const discovered = discoveredLandmarkIds.includes(landmark.id);
                const selected = selectedLandmarkId === landmark.id;
                return (
                  <li key={landmark.id}>
                    <div className={`abyssal-destination-row ${unlocked ? 'unlocked' : 'locked'}`}>
                      <span className={`abyssal-destination-symbol ${unlocked ? 'collected' : ''}`} style={{ color: artifact.color }}>
                        {unlocked ? '✦' : '·'}
                      </span>
                      <div className="abyssal-destination-details">
                        <strong>{artifact.name}</strong>
                        <small>{unlocked ? 'UNLOCKED' : 'LOCKED'}{discovered ? ' · LANDMARK DISCOVERED' : ''} · {artifact.destination}</small>
                      </div>
                      <button type="button" className={selected ? 'abyssal-journal-action selected' : 'abyssal-journal-action'} onClick={() => onSelectLandmark(landmark.id)}>
                        {selected ? 'Following' : 'Find'}
                      </button>
                      <button type="button" className="abyssal-journal-action open-destination" disabled={!unlocked} onClick={() => { onCloseJournal(); onNavigate(artifact.route); }}>
                        {unlocked ? `Open ${artifact.destination}` : 'Locked'}
                      </button>
                    </div>
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

function requireArtifactByLandmark(landmarkId: string): RelicDefinition | undefined {
  return artifactByLandmark.get(landmarkId);
}

export default ExplorerHUD;
