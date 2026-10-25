import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { ExplorerScene } from './ExplorerScene';
import { ExplorerHUD } from './ExplorerHUD';
import { abyssalLandmarks, relics } from './Landmarks';
import type { AbyssalNavigationTarget, ExplorerTelemetry, LandmarkDefinition } from './types';
import { soundEngine } from '../../../utils/soundEngine';
import './AbyssalExplorer.css';

export interface AbyssalExplorerProps {
  className?: string;
  onLandmarkNavigate?: (target: AbyssalNavigationTarget) => void;
  onExit?: () => void;
}

const STORAGE_KEY = 'litfest-abyssal-progress';
const ARTIFACT_IDS = new Set(relics.map((artifact) => artifact.id));

interface ExplorerNotice {
  title: string;
  description?: string;
  destinationStatus?: string;
  destinationHref?: string;
}

function openDestinationInNewTab(target: AbyssalNavigationTarget): { opened: boolean; href: string } {
  const destinationUrl = new URL(window.location.href);
  destinationUrl.searchParams.set('destination', target);
  const href = destinationUrl.toString();
  const destinationTab = window.open('about:blank', '_blank');
  if (!destinationTab) return { opened: false, href };

  try {
    destinationTab.opener = null;
    destinationTab.location.replace(href);
    return { opened: true, href };
  } catch (error) {
    console.error('Unable to open the Abyssal Voyage destination tab.', error);
    destinationTab.close();
    return { opened: false, href };
  }
}

function readSavedProgress(): { collectedArtifactIds: string[]; hasWon: boolean } {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return { collectedArtifactIds: [], hasWon: false };
    const parsed: unknown = JSON.parse(raw);
    const savedIds = Array.isArray(parsed)
      ? parsed
      : typeof parsed === 'object' && parsed !== null && 'collectedArtifactIds' in parsed && Array.isArray(parsed.collectedArtifactIds)
        ? parsed.collectedArtifactIds
        : [];
    const collectedArtifactIds = [...new Set(savedIds.filter((id): id is string => typeof id === 'string' && ARTIFACT_IDS.has(id)))];
    const hasWon = typeof parsed === 'object' && parsed !== null && 'hasWon' in parsed && parsed.hasWon === true;
    return { collectedArtifactIds, hasWon: hasWon && collectedArtifactIds.length === relics.length };
  } catch (error) {
    console.warn('Unable to restore Abyssal Voyage progress.', error);
    return { collectedArtifactIds: [], hasWon: false };
  }
}

export function AbyssalExplorer({
  className = '',
  onLandmarkNavigate,
  onExit,
}: AbyssalExplorerProps) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const sceneRef = useRef<ExplorerScene | null>(null);
  const navigateRef = useRef(onLandmarkNavigate);
  const [started, setStarted] = useState(false);
  const [paused, setPaused] = useState(false);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [savedProgress] = useState(() => readSavedProgress());
  const [collection, setCollection] = useState<string[]>(() => savedProgress.collectedArtifactIds);
  const collectionRef = useRef(collection);
  const [hasWon, setHasWon] = useState(savedProgress.hasWon);
  const hasWonRef = useRef(savedProgress.hasWon);
  const artifactNoticeUntilRef = useRef(0);
  const [missionOpen, setMissionOpen] = useState(true);
  const [howToPlayOpen, setHowToPlayOpen] = useState(false);
  const [journalOpen, setJournalOpen] = useState(false);
  const [victoryOpen, setVictoryOpen] = useState(false);
  const [discoveredLandmarkIds, setDiscoveredLandmarkIds] = useState<string[]>(() => {
    try {
      const raw = window.localStorage.getItem('litfest-abyssal-discoveries');
      const parsed: unknown = raw ? JSON.parse(raw) : [];
      const validIds = new Set(abyssalLandmarks.map((entry) => entry.id));
      return Array.isArray(parsed)
        ? [...new Set(parsed.filter((id): id is string => typeof id === 'string' && validIds.has(id)))]
        : [];
    } catch (error) {
      console.warn('Unable to restore Abyssal Voyage discoveries.', error);
      return [];
    }
  });
  const discoveriesRef = useRef(discoveredLandmarkIds);
  const [telemetry, setTelemetry] = useState<ExplorerTelemetry>({
    speed: 0,
    depth: 32,
    heading: 0,
    boost: false,
    sonarReady: true,
    discoveryCount: 0,
    interactionLabel: 'SWIM TO A LANDMARK',
    statusMessage: 'Cruising the abyssal shelf',
  });
  const [landmark, setLandmark] = useState<LandmarkDefinition | undefined>();
  const [notification, setNotification] = useState<ExplorerNotice | null>(null);
  const [storageWarning, setStorageWarning] = useState('');
  const [sceneError, setSceneError] = useState('');

  useEffect(() => {
    navigateRef.current = onLandmarkNavigate;
  }, [onLandmarkNavigate]);

  useEffect(() => {
    collectionRef.current = collection;
  }, [collection]);

  useEffect(() => {
    hasWonRef.current = hasWon;
  }, [hasWon]);

  useEffect(() => {
    discoveriesRef.current = discoveredLandmarkIds;
  }, [discoveredLandmarkIds]);

  const keyboardSignal = useMemo(
    () => ({
      forward: (active: boolean) => sceneRef.current?.setInputState('forward', active),
      reverse: (active: boolean) => sceneRef.current?.setInputState('reverse', active),
      left: (active: boolean) => sceneRef.current?.setInputState('left', active),
      right: (active: boolean) => sceneRef.current?.setInputState('right', active),
      boost: (active: boolean) => sceneRef.current?.setInputState('boost', active),
      sonar: () => sceneRef.current?.setInputState('sonar', true),
      interact: () => sceneRef.current?.setInputState('interact', true),
    }),
    []
  );

  useEffect(() => {
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify({
        version: 2,
        collectedArtifactIds: collection,
        hasWon,
      }));
    } catch (error) {
      console.warn('Unable to save Abyssal Voyage progress.', error);
      window.setTimeout(() => setStorageWarning('Progress cannot be saved in this browser session.'), 0);
    }
  }, [collection, hasWon]);

  useEffect(() => {
    if (!containerRef.current || !started) {
      return undefined;
    }

    let scene: ExplorerScene;
    try {
      scene = new ExplorerScene({
        container: containerRef.current,
        collectedArtifactIds: collectionRef.current,
        discoveredLandmarkIds: discoveriesRef.current,
        callbacks: {
          onTelemetry: (next) => {
            setTelemetry(next);
            setLandmark(next.nearbyLandmark);
          },
          onLandmarkDiscovered: (discoveredLandmark) => {
            setDiscoveredLandmarkIds((current) => current.includes(discoveredLandmark.id)
              ? current
              : [...current, discoveredLandmark.id]);
            if (Date.now() >= artifactNoticeUntilRef.current) {
              setNotification({ title: `${discoveredLandmark.name} revealed by sonar` });
            }
          },
          onArtifactCollected: (artifactId) => {
            const artifact = relics.find((entry) => entry.id === artifactId);
            if (!artifact) {
              console.error(`Collected unknown Abyssal Voyage artifact "${artifactId}".`);
              return false;
            }
            if (collectionRef.current.includes(artifactId)) return false;

            const nextCollection = [...collectionRef.current, artifactId];
            collectionRef.current = nextCollection;
            setCollection(nextCollection);
            try {
              window.localStorage.setItem(STORAGE_KEY, JSON.stringify({
                version: 2,
                collectedArtifactIds: nextCollection,
                hasWon: hasWonRef.current,
              }));
            } catch (error) {
              console.warn('Unable to save Abyssal Voyage progress.', error);
              setStorageWarning('Progress cannot be saved in this browser session.');
            }

            const destination = openDestinationInNewTab(artifact.route);
            artifactNoticeUntilRef.current = Date.now() + 3200;
            setNotification({
              title: 'ARTIFACT ACQUIRED',
              description: `${artifact.name} collected.`,
              destinationStatus: destination.opened
                ? `${artifact.destination} opened in a new tab.`
                : 'DESTINATION READY — OPEN PAGE',
              destinationHref: destination.opened ? undefined : destination.href,
            });
            soundEngine.playSeaBell(nextCollection.length % 14);
            return destination.opened;
          },
          onVictory: () => {
            if (hasWonRef.current) return;
            hasWonRef.current = true;
            setHasWon(true);
            setVictoryOpen(true);
          },
        },
      });
    } catch (error) {
      console.error('Unable to initialize the Abyssal Voyage WebGL scene.', error);
      window.setTimeout(() => {
        setSceneError('This browser could not start the 3D voyage. Try a browser with WebGL enabled.');
      }, 0);
      return undefined;
    }

    sceneRef.current = scene;
    scene.start();

    return () => {
      scene.dispose();
      sceneRef.current = null;
    };
  }, [started]);

  useEffect(() => {
    try {
      window.localStorage.setItem('litfest-abyssal-discoveries', JSON.stringify(discoveredLandmarkIds));
    } catch (error) {
      console.warn('Unable to save Abyssal Voyage discoveries.', error);
      window.setTimeout(() => setStorageWarning('Discoveries cannot be saved in this browser session.'), 0);
    }
  }, [discoveredLandmarkIds]);

  const handleMove = useCallback((action: 'forward' | 'reverse' | 'left' | 'right' | 'boost', active: boolean) => {
    keyboardSignal[action](active);
  }, [keyboardSignal]);

  const handleResetProgress = useCallback(() => {
    setCollection([]);
    setHasWon(false);
    hasWonRef.current = false;
    setVictoryOpen(false);
    setDiscoveredLandmarkIds([]);
    discoveriesRef.current = [];
    setJournalOpen(false);
    sceneRef.current?.resetCollectedRelics();
    setNotification({ title: 'THE HUNT IS RESET', description: 'All seven artifacts restored.' });
  }, []);

  const handleInteract = useCallback(() => {
    keyboardSignal.interact();
  }, [keyboardSignal]);

  const handleSonar = useCallback(() => {
    keyboardSignal.sonar();
  }, [keyboardSignal]);

  const handlePauseToggle = useCallback(() => {
    setPaused((current) => !current);
  }, []);

  const handleRestart = useCallback(() => {
    sceneRef.current?.restartCheckpoint();
    setPaused(false);
    setLandmark(undefined);
    setNotification({ title: 'Checkpoint restored' });
  }, []);

  const handleExit = useCallback(() => {
    setStarted(false);
    setPaused(false);
    setMissionOpen(true);
    setVictoryOpen(false);
    setJournalOpen(false);
    setSceneError('');
    onExit?.();
  }, [onExit]);

  const handleBeginHunt = useCallback(() => {
    setMissionOpen(false);
    setStarted(true);
    if (collectionRef.current.length === relics.length && !hasWonRef.current) {
      hasWonRef.current = true;
      setHasWon(true);
      setVictoryOpen(true);
    }
  }, []);

  const handleOpenArtifactJournal = useCallback(() => {
    setVictoryOpen(false);
    setJournalOpen(true);
  }, []);

  useEffect(() => {
    sceneRef.current?.setPaused(paused);
  }, [paused, started]);

  useEffect(() => {
    if (!notification) {
      return undefined;
    }

    const timer = window.setTimeout(() => setNotification(null), 3200);
    return () => window.clearTimeout(timer);
  }, [notification]);

  useEffect(() => {
    if (!started) return undefined;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.code === 'Escape') {
        event.preventDefault();
        handleExit();
        return;
      }
      if (paused || event.repeat) return;
      if (['KeyW', 'ArrowUp', 'KeyS', 'ArrowDown', 'KeyA', 'ArrowLeft', 'KeyD', 'ArrowRight', 'Space'].includes(event.code)) {
        event.preventDefault();
      }
      if (event.code === 'KeyW' || event.code === 'ArrowUp') handleMove('forward', true);
      if (event.code === 'KeyS' || event.code === 'ArrowDown') handleMove('reverse', true);
      if (event.code === 'KeyA' || event.code === 'ArrowLeft') handleMove('left', true);
      if (event.code === 'KeyD' || event.code === 'ArrowRight') handleMove('right', true);
      if (event.code === 'ShiftLeft' || event.code === 'ShiftRight') handleMove('boost', true);
      if (event.code === 'Space') handleSonar();
      if (event.code === 'KeyE') handleInteract();
    };

    const onKeyUp = (event: KeyboardEvent) => {
      if (event.code === 'KeyW' || event.code === 'ArrowUp') handleMove('forward', false);
      if (event.code === 'KeyS' || event.code === 'ArrowDown') handleMove('reverse', false);
      if (event.code === 'KeyA' || event.code === 'ArrowLeft') handleMove('left', false);
      if (event.code === 'KeyD' || event.code === 'ArrowRight') handleMove('right', false);
      if (event.code === 'ShiftLeft' || event.code === 'ShiftRight') handleMove('boost', false);
    };

    const onBlur = () => {
      for (const action of ['forward', 'reverse', 'left', 'right', 'boost'] as const) {
        handleMove(action, false);
      }
    };

    window.addEventListener('keydown', onKeyDown);
    window.addEventListener('keyup', onKeyUp);
    window.addEventListener('blur', onBlur);

    return () => {
      window.removeEventListener('keydown', onKeyDown);
      window.removeEventListener('keyup', onKeyUp);
      window.removeEventListener('blur', onBlur);
    };
  }, [handleExit, handleInteract, handleMove, handleSonar, paused, started]);

  return (
    <div className={`abyssal-explorer ${className}`.trim()}>
      {missionOpen && !started && (
        <div className="abyssal-intro-overlay">
          <div className="abyssal-intro-card">
            <p className="abyssal-intro-kicker">LITFEST 2.0 · ABYSSAL VOYAGE</p>
            <h1>THE SEVEN SACRED ARTIFACTS</h1>
            <p className="abyssal-intro-subtitle">Seven relics. Seven destinations. One unforgettable voyage.</p>
            <p className="abyssal-intro-copy">
              Ancient treasures lie hidden throughout the sunken world of LITFEST. Pilot your submarine,
              discover the glowing artifacts, and unlock every destination. Collect all seven to claim victory.
            </p>
            <div className="abyssal-mission-progress" aria-label={`${collection.length} of 7 artifacts already collected`}>
              {relics.map((artifact) => (
                <span key={artifact.id} className={collection.includes(artifact.id) ? 'collected' : ''} style={{ '--artifact-color': artifact.color } as React.CSSProperties} title={artifact.name} />
              ))}
              <strong>{collection.length} / 7</strong>
            </div>
            <p className="abyssal-intro-controls">
              WASD / arrows · Navigate &nbsp; Shift · Boost &nbsp; Space · Sonar &nbsp; E · Collect
              <br />Destination Journal · Review discovered locations
            </p>
            {howToPlayOpen && (
              <p className="abyssal-how-to-play">
                Follow the compass, pilot close to each landmark, then collect its artifact with E or the on-screen button.
                Each recovered artifact unlocks one destination in your journal.
              </p>
            )}
            <div className="abyssal-mission-actions">
              <button type="button" className="abyssal-begin-btn" onClick={handleBeginHunt}>
                {collection.length ? 'RESUME THE HUNT' : 'BEGIN THE HUNT'}
              </button>
              <button type="button" className="abyssal-secondary-btn" onClick={() => setHowToPlayOpen((open) => !open)}>
                {howToPlayOpen ? 'HIDE INSTRUCTIONS' : 'HOW TO PLAY'}
              </button>
            </div>
          </div>
        </div>
      )}

      <div ref={containerRef} className="abyssal-scene" aria-label="Abyssal Voyage 3D scene" />

      {sceneError && (
        <div className="abyssal-error-notice" role="alert">
          <p>{sceneError}</p>
          <button type="button" className="abyssal-mini-btn" onClick={handleExit}>Back to the site</button>
        </div>
      )}

      {started && (
        <ExplorerHUD
          speed={telemetry.speed}
          depth={telemetry.depth}
          heading={telemetry.heading}
          boost={telemetry.boost}
          sonarReady={telemetry.sonarReady}
          discoveryCount={collection.length}
          interactionLabel={telemetry.interactionLabel}
          nearbyArtifact={telemetry.nearbyArtifact}
          nearbyLandmark={landmark ?? telemetry.nearbyLandmark}
          navigationTarget={telemetry.navigationTarget}
          navigationDistance={telemetry.navigationDistance}
          navigationBearing={telemetry.navigationBearing}
          statusMessage={telemetry.statusMessage}
          paused={paused}
          soundEnabled={soundEnabled}
          discoveredLandmarkIds={discoveredLandmarkIds}
          collectedArtifactIds={collection}
          journalOpen={journalOpen}
          selectedLandmarkId={telemetry.navigationTarget?.id}
          onOpenJournal={handleOpenArtifactJournal}
          onCloseJournal={() => setJournalOpen(false)}
          onNavigate={(target) => navigateRef.current?.(target)}
          onTogglePause={handlePauseToggle}
          onToggleSound={() => setSoundEnabled((current) => !current)}
          onExit={handleExit}
          onRestart={handleRestart}
          onResetProgress={handleResetProgress}
          onInteract={handleInteract}
          onSonar={handleSonar}
          onSelectLandmark={(id) => sceneRef.current?.selectNavigationTarget(id)}
        />
      )}

      {started && victoryOpen && (
        <div className="abyssal-victory-overlay" role="dialog" aria-modal="true" aria-labelledby="abyssal-victory-title">
          <section className="abyssal-victory-card">
            <span className="abyssal-eyebrow">THE ABYSSAL VOYAGE IS COMPLETE</span>
            <h2 id="abyssal-victory-title">CONGRATULATIONS!</h2>
            <h3>YOU WON THE GAME!</h3>
            <p>You discovered all seven sacred artifacts and unlocked every LITFEST destination.</p>
            <div className="abyssal-mission-progress victory-progress" aria-label="7 of 7 artifacts collected">
              {relics.map((artifact) => (
                <span key={artifact.id} className="collected" style={{ '--artifact-color': artifact.color } as React.CSSProperties} title={artifact.name} />
              ))}
            </div>
            <strong className="abyssal-victory-count">7 / 7 ARTIFACTS COLLECTED</strong>
            <div className="abyssal-victory-actions">
              <button type="button" className="abyssal-begin-btn" onClick={handleOpenArtifactJournal}>EXPLORE UNLOCKED DESTINATIONS</button>
              <button type="button" className="abyssal-secondary-btn" onClick={() => setVictoryOpen(false)}>CONTINUE EXPLORING</button>
              <button type="button" className="abyssal-secondary-btn" onClick={handleExit}>RETURN TO LITFEST</button>
            </div>
          </section>
        </div>
      )}

      {started && paused && (
        <div className="abyssal-pause-overlay" role="dialog" aria-modal="true" aria-label="Voyage paused">
          <div className="abyssal-pause-card">
            <span className="abyssal-eyebrow">VOYAGE PAUSED</span>
            <h2>Take a moment to look around.</h2>
            <div className="abyssal-pause-actions">
              <button type="button" className="abyssal-primary-btn" onClick={handlePauseToggle}>Resume voyage</button>
              <button type="button" className="abyssal-secondary-btn" onClick={handleRestart}>Return to checkpoint</button>
              <button type="button" className="abyssal-secondary-btn" onClick={handleResetProgress}>Reset relics</button>
              <button type="button" className="abyssal-secondary-btn" onClick={handleExit}>Exit voyage</button>
            </div>
          </div>
        </div>
      )}

      {storageWarning && <div className="abyssal-storage-warning" role="status">{storageWarning}</div>}

          {notification && (
            <div className="abyssal-notification" role="status" aria-live="polite">
              <strong>{notification.title}</strong>
              {notification.description && <span>{notification.description}</span>}
              {notification.destinationStatus && <span>{notification.destinationStatus}</span>}
              {notification.destinationHref && (
                <a href={notification.destinationHref} target="_blank" rel="noopener noreferrer">
                  OPEN DESTINATION
                </a>
              )}
            </div>
          )}

      {started && !journalOpen && !paused && !victoryOpen && (
        <div className="abyssal-mobile-controls" aria-label="Touch controls">
          <div className="abyssal-dpad" aria-label="Directional controls">
            <button type="button" className="abyssal-touch-btn" aria-label="Move forward" onPointerDown={() => handleMove('forward', true)} onPointerUp={() => handleMove('forward', false)} onPointerLeave={() => handleMove('forward', false)} onPointerCancel={() => handleMove('forward', false)}>↑</button>
            <button type="button" className="abyssal-touch-btn" aria-label="Turn left" onPointerDown={() => handleMove('left', true)} onPointerUp={() => handleMove('left', false)} onPointerLeave={() => handleMove('left', false)} onPointerCancel={() => handleMove('left', false)}>←</button>
            <button type="button" className="abyssal-touch-btn" aria-label="Move backward" onPointerDown={() => handleMove('reverse', true)} onPointerUp={() => handleMove('reverse', false)} onPointerLeave={() => handleMove('reverse', false)} onPointerCancel={() => handleMove('reverse', false)}>↓</button>
            <button type="button" className="abyssal-touch-btn" aria-label="Turn right" onPointerDown={() => handleMove('right', true)} onPointerUp={() => handleMove('right', false)} onPointerLeave={() => handleMove('right', false)} onPointerCancel={() => handleMove('right', false)}>→</button>
          </div>
          <div className="abyssal-touch-actions">
            <button type="button" className="abyssal-touch-btn" onPointerDown={() => handleMove('boost', true)} onPointerUp={() => handleMove('boost', false)} onPointerLeave={() => handleMove('boost', false)} onPointerCancel={() => handleMove('boost', false)}>BOOST</button>
            <button type="button" className="abyssal-touch-btn" onClick={handleSonar}>SONAR</button>
            {telemetry.nearbyArtifact && (
              <button type="button" className="abyssal-touch-btn abyssal-touch-collect" onClick={handleInteract}>COLLECT</button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default AbyssalExplorer;
