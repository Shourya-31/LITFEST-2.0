import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { ExplorerScene } from './ExplorerScene';
import { ExplorerHUD } from './ExplorerHUD';
import { abyssalLandmarks, relics } from './Landmarks';
import type { ExplorerTelemetry, LandmarkDefinition } from './types';
import './AbyssalExplorer.css';

export interface AbyssalExplorerProps {
  className?: string;
  onLandmarkNavigate?: (route: string) => void;
  onExit?: () => void;
  autoplay?: boolean;
}

const STORAGE_KEY = 'litfest-abyssal-progress';
const RELIC_IDS = new Set(relics.map((relic) => relic.id));

function readSavedProgress(): string[] {
  if (typeof window === 'undefined') {
    return [];
  }

  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      return [];
    }
    const parsed: unknown = JSON.parse(raw);
    return Array.isArray(parsed) && parsed.every((id): id is string => typeof id === 'string')
      ? [...new Set(parsed.filter((id) => RELIC_IDS.has(id)))]
      : [];
  } catch (error) {
    console.warn('Unable to restore Abyssal Voyage progress.', error);
    return [];
  }
}

export function AbyssalExplorer({
  className = '',
  onLandmarkNavigate,
  onExit,
  autoplay = false,
}: AbyssalExplorerProps) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const sceneRef = useRef<ExplorerScene | null>(null);
  const navigateRef = useRef(onLandmarkNavigate);
  const [started, setStarted] = useState(autoplay);
  const [paused, setPaused] = useState(false);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [collection, setCollection] = useState<string[]>(() => readSavedProgress());
  const collectionRef = useRef(collection);
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
  const [notification, setNotification] = useState('');
  const [storageWarning, setStorageWarning] = useState('');
  const [sceneError, setSceneError] = useState('');

  useEffect(() => {
    navigateRef.current = onLandmarkNavigate;
  }, [onLandmarkNavigate]);

  useEffect(() => {
    collectionRef.current = collection;
  }, [collection]);

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
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(collection));
    } catch (error) {
      console.warn('Unable to save Abyssal Voyage progress.', error);
      window.setTimeout(() => setStorageWarning('Progress cannot be saved in this browser session.'), 0);
    }
  }, [collection]);

  useEffect(() => {
    if (!containerRef.current || !started) {
      return undefined;
    }

    let scene: ExplorerScene;
    try {
      scene = new ExplorerScene({
        container: containerRef.current,
        collectedRelicIds: collectionRef.current,
        discoveredLandmarkIds: discoveriesRef.current,
        callbacks: {
          onTelemetry: (next) => {
            setTelemetry(next);
            setLandmark(next.nearbyLandmark);
          },
          onLandmarkInteract: (selectedLandmark) => {
            setLandmark(selectedLandmark);
            setNotification(`${selectedLandmark.name} discovered`);
            navigateRef.current?.(selectedLandmark.route ?? selectedLandmark.id);
          },
          onLandmarkDiscovered: (discoveredLandmark) => {
            setDiscoveredLandmarkIds((current) => current.includes(discoveredLandmark.id)
              ? current
              : [...current, discoveredLandmark.id]);
            setNotification(`${discoveredLandmark.name} revealed by sonar`);
          },
          onRelicCollected: (relicId) => {
            setCollection((current) => current.includes(relicId) ? current : [...current, relicId]);
            setNotification(`Relic recovered: ${relics.find((relic) => relic.id === relicId)?.name ?? 'relic'}`);
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
    sceneRef.current?.resetCollectedRelics();
    setNotification('Relics will be rediscovered on this voyage');
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
    setNotification('Checkpoint restored');
  }, []);

  const handleExit = useCallback(() => {
    setStarted(false);
    setPaused(false);
    setSceneError('');
    onExit?.();
  }, [onExit]);

  useEffect(() => {
    sceneRef.current?.setPaused(paused);
  }, [paused, started]);

  useEffect(() => {
    if (!notification) {
      return undefined;
    }

    const timer = window.setTimeout(() => setNotification(''), 1800);
    return () => window.clearTimeout(timer);
  }, [notification]);

  useEffect(() => {
    if (!started) return undefined;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.code === 'Escape') {
        handlePauseToggle();
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
  }, [handleInteract, handleMove, handlePauseToggle, handleSonar, paused, started]);

  return (
    <div className={`abyssal-explorer ${className}`.trim()}>
      {!started && (
        <div className="abyssal-intro-overlay">
          <div className="abyssal-intro-card">
            <p className="abyssal-intro-kicker">LITFEST 2.0</p>
            <h1>THE ABYSSAL VOYAGE</h1>
            <p className="abyssal-intro-copy">Pilot the current. Discover the stories beneath the surface.</p>
            <p className="abyssal-intro-controls">
              W / A / S / D or arrows to steer · Shift to boost · Space for sonar · E to explore
            </p>
            <button type="button" className="abyssal-begin-btn" onClick={() => setStarted(true)}>
              BEGIN YOUR VOYAGE
            </button>
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
          nearbyLandmark={landmark ?? telemetry.nearbyLandmark}
          navigationTarget={telemetry.navigationTarget}
          navigationDistance={telemetry.navigationDistance}
          navigationBearing={telemetry.navigationBearing}
          statusMessage={telemetry.statusMessage}
          paused={paused}
          soundEnabled={soundEnabled}
          discoveredLandmarkIds={discoveredLandmarkIds}
          selectedLandmarkId={telemetry.navigationTarget?.id}
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

      {notification && <div className="abyssal-notification">{notification}</div>}

      {started && (
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
          </div>
        </div>
      )}
    </div>
  );
}

export default AbyssalExplorer;
