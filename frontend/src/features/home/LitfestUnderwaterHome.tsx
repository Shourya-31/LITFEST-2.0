import React, { Suspense, lazy, useState, useRef, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { createPortal } from 'react-dom';
import { Compass, HelpCircle, Mail, X, ChevronUp } from 'lucide-react';
import {
  OceanAtmosphere,
  MarineLife,
  MarineVegetation,
  UnderwaterTitle,
  FestivalNav,
  BubblesTransition,
} from './components';
import { LitfestAboutSection } from '../about';
import { SponsorsSection } from '../sponsors';
import { FaqSection } from '../faq';
import { ContactSection } from '../contact';
import { soundEngine } from '../../utils/soundEngine';
import type { AbyssalNavigationTarget } from '../../components/underwater/abyssal-explorer';
import './LitfestUnderwaterHome.css';

const LazyGameLauncher = lazy(() =>
  import('../game/GameLauncher').then(({ GameLauncher }) => ({
    default: GameLauncher,
  }))
);

const LazyAbyssalExplorer = lazy(() =>
  import('../../components/underwater/abyssal-explorer').then(({ AbyssalExplorer }) => ({
    default: AbyssalExplorer,
  }))
);

const LazyPirateWheelTimeline = lazy(() =>
  import('../schedule').then(({ PirateWheelTimeline }) => ({
    default: PirateWheelTimeline,
  }))
);

export const SECTIONS = [
  { id: 'home', label: 'Home', depthName: 'Surface 0m' },
  { id: 'arcade', label: 'Arcade & 3D', depthName: 'Sunken Arcade & 3D Voyage 150m' },
  { id: 'about', label: 'About', depthName: 'Litfest About 400m' },
  { id: 'timeline', label: 'Timeline', depthName: '3D Pirate Timeline 600m' },
  { id: 'sponsors', label: 'Sponsors', depthName: 'Institutional Patrons 750m' },
] as const;

export type SectionId = (typeof SECTIONS)[number]['id'];

interface LitfestUnderwaterHomeProps {
  onExploreClick?: () => void;
  onExploreAbyss?: () => void;
  onAbyssalNavigate?: (target: AbyssalNavigationTarget) => void;
  initialDestination?: AbyssalNavigationTarget | null;
  isTimelineActive?: boolean;
  isDestinationOpen?: boolean;
}

export const LitfestUnderwaterHome: React.FC<LitfestUnderwaterHomeProps> = ({
  onExploreClick,
  onExploreAbyss,
  isTimelineActive = false,
  isDestinationOpen = false,
  onAbyssalNavigate,
  initialDestination = null,
}) => {
  const navigate = useNavigate();
  const [activeIndex, setActiveIndex] = useState<number>(0);
  const [isTransitioning, setIsTransitioning] = useState<boolean>(false);
  const [transitionDirection, setTransitionDirection] = useState<'dive' | 'surface'>('dive');
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);
  const [activeModal, setActiveModal] = useState<'events' | null>(() =>
    initialDestination === 'events' ? initialDestination : null
  );
  const [abyssalExplorerOpen, setAbyssalExplorerOpen] = useState(false);
  const [faqChamberOpen, setFaqChamberOpen] = useState<boolean>(() =>
    initialDestination === 'faq' || initialDestination === 'contact'
  );
  const [faqTab, setFaqTab] = useState<'faq' | 'contact'>(() =>
    initialDestination === 'contact' ? 'contact' : 'faq'
  );
  const [loadArcade, setLoadArcade] = useState(() => typeof IntersectionObserver === 'undefined');
  const [isNavScrolled, setIsNavScrolled] = useState(false);
  const hasAppliedInitialDestination = useRef(false);

  const pendingIndexRef = useRef<number | null>(null);
  const lastTransitionTime = useRef<number>(0);
  const wheelAccumulator = useRef<number>(0);
  const wheelResetTimeout = useRef<number | null>(null);
  const touchStartY = useRef<number | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const arcadeRef = useRef<HTMLDivElement | null>(null);

  const audioCtxRef = useRef<AudioContext | null>(null);
  const gainNodeRef = useRef<GainNode | null>(null);

  // Transition to a specific slide with cinematic oceanic bubble surge and 3D camera travel
  const goToSlide = useCallback(
    (targetIndex: number) => {
      if (isTransitioning) return;
      const target = Math.max(0, Math.min(SECTIONS.length - 1, targetIndex));
      if (target === activeIndex) return;
      wheelAccumulator.current = 0;

      if (target === 1) {
        setLoadArcade(true);
      }

      const direction: 'dive' | 'surface' = target > activeIndex ? 'dive' : 'surface';
      pendingIndexRef.current = target;
      setTransitionDirection(direction);
      setIsTransitioning(true);

      // Play authentic bubble dive audio cue
      soundEngine.playBubbleDive();
    },
    [activeIndex, isTransitioning]
  );

  const zoomIn = useCallback(() => {
    if (activeIndex < SECTIONS.length - 1) {
      goToSlide(activeIndex + 1);
    }
  }, [activeIndex, goToSlide]);

  const zoomOut = useCallback(() => {
    if (activeIndex > 0) {
      goToSlide(activeIndex - 1);
    }
  }, [activeIndex, goToSlide]);

  // Midpoint of bubble surge (300ms): commit active index while screen is enveloped by bubbles
  const handleTransitionMidpoint = useCallback(() => {
    if (pendingIndexRef.current === null) return;
    const target = pendingIndexRef.current;
    setActiveIndex(target);

    // Reset scroll position on incoming slide so it opens at top
    window.requestAnimationFrame(() => {
      const activeSlideEl = document.querySelector(
        `.litfest-z-slide[data-slide-index="${target}"] .scrollable-content`
      );
      if (activeSlideEl) {
        activeSlideEl.scrollTop = 0;
      }
    });
  }, []);

  // Completion of bubble surge (720ms): clear transition lock
  const handleTransitionComplete = useCallback(() => {
    setIsTransitioning(false);
    pendingIndexRef.current = null;
    wheelAccumulator.current = 0;
    lastTransitionTime.current = performance.now();
  }, []);

  const handleNavClick = useCallback(
    (targetSection: string) => {
      if (targetSection === 'events') {
        setActiveModal('events');
        return;
      }
      if (targetSection === 'faq') {
        setFaqTab('faq');
        setFaqChamberOpen(true);
        return;
      }
      if (targetSection === 'contact') {
        setFaqTab('contact');
        setFaqChamberOpen(true);
        return;
      }
      if (targetSection === '3d' || targetSection === 'arcade') {
        goToSlide(1);
        return;
      }
      if (targetSection === 'about') {
        goToSlide(2);
        return;
      }
      if (targetSection === 'schedule' || targetSection === 'timeline') {
        goToSlide(3);
        return;
      }
      if (targetSection === 'sponsors') {
        goToSlide(4);
        return;
      }
      const idx = SECTIONS.findIndex((s) => s.id === targetSection);
      if (idx !== -1) {
        goToSlide(idx);
      }
    },
    [goToSlide]
  );

  // Allow inner scroll on content panels (About, FAQ, Sponsors, Arcade) before triggering Z-axis dive/surface
  const shouldAllowZNav = useCallback((deltaY: number, target: HTMLElement | null): boolean => {
    if (!target) return true;
    if (
      target.closest('.ocean-modal-overlay') ||
      target.closest('.abyssal-explorer-overlay') ||
      target.closest('.faq-chamber-backdrop')
    ) {
      return false;
    }
    // Inspect the scrollable container of the active slide
    const activeSlide = document.querySelector(`.litfest-z-slide[data-slide-index="${activeIndex}"]`);
    const scrollable = activeSlide?.querySelector('.scrollable-content') as HTMLElement | null;
    if (!scrollable) return true;

    const maxScroll = scrollable.scrollHeight - scrollable.clientHeight;
    if (maxScroll <= 35) {
      return true; // Content fits in viewport without scrolling
    }

    const tolerance = 12; // Generous tolerance for fractional/subpixel scaling
    const isAtTop = scrollable.scrollTop <= tolerance;
    const isAtBottom =
      scrollable.scrollTop + scrollable.clientHeight >= scrollable.scrollHeight - tolerance;

    if (deltaY > 0 && !isAtBottom) {
      return false;
    }
    if (deltaY < 0 && !isAtTop) {
      return false;
    }
    return true;
  }, [activeIndex]);

  // Monitor scroll in active slide's scrollable container to give Navbar a solid opaque background
  useEffect(() => {
    let scrollable: HTMLElement | null = null;
    let cleanup: (() => void) | null = null;

    const attach = () => {
      const activeSlide = document.querySelector(`.litfest-z-slide[data-slide-index="${activeIndex}"]`);
      const target = activeSlide?.querySelector('.scrollable-content') as HTMLElement | null;

      if (target) {
        if (scrollable !== target) {
          cleanup?.();
          scrollable = target;
          const handleScroll = () => {
            setIsNavScrolled(scrollable!.scrollTop > 20);
          };
          handleScroll();
          scrollable.addEventListener('scroll', handleScroll, { passive: true });
          cleanup = () => {
            scrollable?.removeEventListener('scroll', handleScroll);
          };
        }
      } else {
        setIsNavScrolled(false);
      }
    };

    attach();
    const rafId = requestAnimationFrame(attach);
    const timer = setTimeout(attach, 150);

    return () => {
      cancelAnimationFrame(rafId);
      clearTimeout(timer);
      cleanup?.();
    };
  }, [activeIndex, loadArcade]);

  // Back to Top navigation (surfaces to 0m and resets scroll)
  const handleBackToTop = useCallback(() => {
    const activeSlideEl = document.querySelector(
      `.litfest-z-slide[data-slide-index="${activeIndex}"] .scrollable-content`
    );
    if (activeSlideEl) {
      activeSlideEl.scrollTo({ top: 0, behavior: 'smooth' });
    }
    setIsNavScrolled(false);
    goToSlide(0);
  }, [activeIndex, goToSlide]);

  // Wheel handling for 3D Z-axis zoom
  const handleWheel = (e: React.WheelEvent<HTMLDivElement>) => {
    if (activeModal || abyssalExplorerOpen || faqChamberOpen) return;
    if (isTransitioning) return;

    // Timeline handles its own wheel stepping across milestones
    if (activeIndex === 3) return;

    if (!shouldAllowZNav(e.deltaY, e.target as HTMLElement | null)) {
      return;
    }

    const now = performance.now();
    if (now - lastTransitionTime.current < 280) return;

    // Reset accumulator on direction change
    if ((wheelAccumulator.current > 0 && e.deltaY < 0) || (wheelAccumulator.current < 0 && e.deltaY > 0)) {
      wheelAccumulator.current = 0;
    }

    wheelAccumulator.current += e.deltaY;

    if (wheelResetTimeout.current) {
      window.clearTimeout(wheelResetTimeout.current);
    }
    wheelResetTimeout.current = window.setTimeout(() => {
      wheelAccumulator.current = 0;
    }, 240);

    if (Math.abs(wheelAccumulator.current) >= 32) {
      if (wheelAccumulator.current > 0) {
        zoomIn();
      } else {
        zoomOut();
      }
      wheelAccumulator.current = 0;
      lastTransitionTime.current = now;
    }
  };

  // Touch gesture handling
  const handleTouchStart = (e: React.TouchEvent<HTMLDivElement>) => {
    touchStartY.current = e.touches[0].clientY;
  };

  const handleTouchEnd = (e: React.TouchEvent<HTMLDivElement>) => {
    if (touchStartY.current === null) return;
    const deltaY = touchStartY.current - e.changedTouches[0].clientY;
    touchStartY.current = null;

    if (activeModal || abyssalExplorerOpen || faqChamberOpen) return;
    if (isTransitioning) return;
    if (activeIndex === 3) return;

    if (!shouldAllowZNav(deltaY, e.target as HTMLElement | null)) return;

    const now = performance.now();
    if (now - lastTransitionTime.current < 600) return;

    if (Math.abs(deltaY) >= 40) {
      if (deltaY > 0) {
        zoomIn(); // swipe up zooms in (dives deeper)
      } else {
        zoomOut(); // swipe down zooms out (surfaces)
      }
      lastTransitionTime.current = now;
    }
  };

  // Keyboard navigation (ArrowDown / PageDown dives deeper; ArrowUp / PageUp surfaces)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const tag = (e.target as HTMLElement)?.tagName?.toLowerCase();
      if (tag === 'input' || tag === 'textarea' || tag === 'select') return;
      if (e.key === 'Escape' && faqChamberOpen) {
        setFaqChamberOpen(false);
        return;
      }
      if (activeModal || abyssalExplorerOpen || faqChamberOpen) return;
      if (isTransitioning) return;

      if (e.key === 'ArrowDown' || e.key === 'PageDown') {
        if (activeIndex !== 3) {
          e.preventDefault();
          zoomIn();
        }
      } else if (e.key === 'ArrowUp' || e.key === 'PageUp') {
        if (activeIndex !== 3) {
          e.preventDefault();
          zoomOut();
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [zoomIn, zoomOut, activeIndex, activeModal, abyssalExplorerOpen, faqChamberOpen, isTransitioning]);

  // Inert background when 3D Abyssal Explorer is open
  useEffect(() => {
    if (!abyssalExplorerOpen) return undefined;
    const container = containerRef.current;
    const previousBodyOverflow = document.body.style.overflow;
    const previousDocumentOverflow = document.documentElement.style.overflow;
    document.body.style.overflow = 'hidden';
    document.documentElement.style.overflow = 'hidden';
    if (container) container.inert = true;
    return () => {
      document.body.style.overflow = previousBodyOverflow;
      document.documentElement.style.overflow = previousDocumentOverflow;
      if (container) container.inert = false;
    };
  }, [abyssalExplorerOpen]);

  // Handle external navigation target (e.g. from abyssal explorer or URL hash)
  const handleAbyssalNavigate = useCallback(
    (target: AbyssalNavigationTarget) => {
      setAbyssalExplorerOpen(false);
      if (target === 'register') {
        navigate('/signup');
      } else if (target === 'events') {
        setActiveModal('events');
      } else {
        handleNavClick(target);
      }
    },
    [navigate, handleNavClick]
  );

  useEffect(() => {
    if (!initialDestination || hasAppliedInitialDestination.current) return;
    hasAppliedInitialDestination.current = true;
    if (initialDestination === 'events') {
      setActiveModal('events');
    } else if (initialDestination === 'faq') {
      setFaqTab('faq');
      setFaqChamberOpen(true);
    } else if (initialDestination === 'contact') {
      setFaqTab('contact');
      setFaqChamberOpen(true);
    } else if (initialDestination === 'register') {
      navigate('/signup');
    } else {
      handleNavClick(initialDestination);
    }
  }, [initialDestination, handleNavClick, navigate]);

  // Ambient deep sea audio synthesis via Web Audio API
  const toggleAmbientAudio = () => {
    if (!isPlayingAudio) {
      try {
        const AudioContextClass =
          window.AudioContext ||
          (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
        const ctx = new AudioContextClass();
        audioCtxRef.current = ctx;

        const bufferSize = ctx.sampleRate * 2;
        const noiseBuffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
        const output = noiseBuffer.getChannelData(0);
        let b0 = 0,
          b1 = 0,
          b2 = 0;
        for (let i = 0; i < bufferSize; i++) {
          const white = Math.random() * 2 - 1;
          b0 = 0.99886 * b0 + white * 0.0555179;
          b1 = 0.99332 * b1 + white * 0.0750759;
          b2 = 0.969 * b2 + white * 0.153852;
          output[i] = (b0 + b1 + b2) * 0.11;
        }

        const whiteNoise = ctx.createBufferSource();
        whiteNoise.buffer = noiseBuffer;
        whiteNoise.loop = true;

        const filter = ctx.createBiquadFilter();
        filter.type = 'lowpass';
        filter.frequency.setValueAtTime(260, ctx.currentTime);
        filter.Q.setValueAtTime(2.2, ctx.currentTime);

        const lfo = ctx.createOscillator();
        lfo.frequency.setValueAtTime(0.14, ctx.currentTime);
        const lfoGain = ctx.createGain();
        lfoGain.gain.setValueAtTime(120, ctx.currentTime);
        lfo.connect(lfoGain);
        lfoGain.connect(filter.frequency);
        lfo.start();

        const masterGain = ctx.createGain();
        masterGain.gain.setValueAtTime(0.01, ctx.currentTime);
        masterGain.gain.exponentialRampToValueAtTime(0.35, ctx.currentTime + 2.5);
        gainNodeRef.current = masterGain;

        whiteNoise.connect(filter);
        filter.connect(masterGain);
        masterGain.connect(ctx.destination);
        whiteNoise.start();

        setIsPlayingAudio(true);
      } catch (err) {
        console.warn('Audio could not be initialized:', err);
      }
    } else {
      if (gainNodeRef.current && audioCtxRef.current) {
        const ctx = audioCtxRef.current;
        gainNodeRef.current.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.8);
        setTimeout(() => {
          ctx.close();
          audioCtxRef.current = null;
          setIsPlayingAudio(false);
        }, 850);
      } else {
        setIsPlayingAudio(false);
      }
    }
  };

  const renderSlideContent = (index: number) => {
    switch (index) {
      case 0:
        return (
          <section
            id="home"
            className="hero-underwater-viewport"
            aria-label="Litfest 2.0 Surface & Title"
          >
            <OceanAtmosphere />
            <MarineLife showJellyfish={true} />
            <MarineVegetation />
            <UnderwaterTitle
              onExploreClick={() => {
                if (onExploreClick) {
                  onExploreClick();
                } else {
                  goToSlide(3);
                }
              }}
              onDescendClick={() => goToSlide(1)}
            />
          </section>
        );

      case 1:
        return (
          <div className="scrollable-content" data-lenis-prevent>
            <div
              ref={arcadeRef}
              id="arcade"
              className="arcade-deferred-boundary"
              role="region"
              aria-label="Sunken Arcade & 3D Voyage"
              aria-busy={!loadArcade}
            >
              {loadArcade ? (
                <Suspense
                  fallback={
                    <div className="arcade-deferred-placeholder" role="status">
                      Loading the sunken arcade & 3D voyage…
                    </div>
                  }
                >
                  <LazyGameLauncher
                    onExploreAbyss={() => (onExploreAbyss ? onExploreAbyss() : setAbyssalExplorerOpen(true))}
                    onAscendClick={() => goToSlide(0)}
                    onDescendClick={() => goToSlide(2)}
                  />
                </Suspense>
              ) : (
                <div className="arcade-deferred-placeholder" aria-hidden="true" />
              )}
            </div>
          </div>
        );

      case 2:
        return (
          <div className="scrollable-content" data-lenis-prevent>
            <LitfestAboutSection
              id="about"
              onExploreEvents={() => goToSlide(3)}
              onRegisterClick={() => navigate('/signup')}
              onAscendClick={() => goToSlide(1)}
            />
          </div>
        );

      case 3:
        return (
          <div style={{ width: '100%', height: '100%', position: 'relative' }}>
            <Suspense
              fallback={
                <div className="timeline-loading-placeholder" role="status">
                  Diving to 3D Timeline Helm…
                </div>
              }
            >
              <LazyPirateWheelTimeline
                isActive={activeIndex === 3}
                initialEventIndex={0}
                onNavigateHome={() => goToSlide(0)}
                onNavigatePrev={() => goToSlide(2)}
                onNavigateNext={() => goToSlide(4)}
              />
            </Suspense>
          </div>
        );

      case 4:
        return (
          <div className="scrollable-content" data-lenis-prevent>
            <SponsorsSection
              id="sponsors"

              onAscendClick={handleBackToTop}
              onContactClick={() => {
                setFaqTab('contact');
                setFaqChamberOpen(true);
              }}
            />
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <main
      ref={containerRef}
      onWheel={handleWheel}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
      className={`litfest-underwater-root ${isTransitioning ? 'is-transitioning' : ''}`}
      role="main"
      aria-label="Litfest 2.0 3D Underwater Experience"
      data-lenis-prevent
    >
      

      {/* 1. Global Navigation Header */}
      <FestivalNav
        onRegisterClick={() => navigate('/signup')}
        onNavClick={handleNavClick}
        activeSection={faqChamberOpen ? 'faq' : (SECTIONS[activeIndex]?.id || 'home')}
        isScrolled={isNavScrolled}
      />

      {/* 2. Oceanic Bubbles Transition Layer with Volumetric Depth Bloom */}
      <BubblesTransition
        isActive={isTransitioning}
        direction={transitionDirection}
        onMidpoint={handleTransitionMidpoint}
        onComplete={handleTransitionComplete}
      />

      {/* 3. 3D World Space with Preserved Z-Axis Perspective */}
      <div className="litfest-z-world">
        {SECTIONS.map((sec, index) => {
          const delta = index - activeIndex;
          let transform = 'translate3d(0, 0, 0px) scale(1)';
          let opacity = 1;
          let filter = 'blur(0px)';
          const isActive = delta === 0;
          const isTransitionParticipant = isTransitioning && Math.abs(delta) <= 1;


          if (delta === 0) {
            transform = 'translate3d(0, 0, 0px) scale(1)';
            opacity = 1;
            filter = 'blur(0px)';


          } else if (delta > 0) {
            // Deeper ahead in the oceanic abyss
            const zDistance = -Math.min(delta * 900, 2400);
            const scale = Math.max(0.4, 1 - delta * 0.35);
            transform = `translate3d(0, 0, ${zDistance}px) scale(${scale})`;
            opacity = 0;
            filter = 'blur(10px)';


          } else {
            // Passed into camera / closer to surface
            const zDistance = Math.min(-delta * 750, 1800);
            const scale = 1 + -delta * 0.55;
            transform = `translate3d(0, 0, ${zDistance}px) scale(${scale})`;
            opacity = 0;
            filter = 'blur(10px)';


          }


          const pointerEvents: 'auto' | 'none' = isActive && !isTransitioning ? 'auto' : 'none';
          const visibility: 'visible' | 'hidden' = isActive || isTransitionParticipant ? 'visible' : 'hidden';

          return (
            <div
              key={sec.id}
              data-slide-index={index}
              data-active={isActive ? 'true' : 'false'}
              className={`litfest-z-slide ${isActive ? 'is-active-slide' : 'is-inactive-slide'}`}
              style={{
                transform,
                opacity,
                filter,
                pointerEvents,
                visibility,
                zIndex: isActive ? 30 : 10,
              }}
            >
              <div className="litfest-z-slide-inner">
                {Math.abs(delta) <= 1 ? renderSlideContent(index) : null}
              </div>
            </div>
          );
        })}
      </div>

      {/* 4. 3D Depth Floating Pearls Navigation (Right Edge) */}
      <nav aria-label="3D Depth Navigation" className="z-depth-nav">
        {SECTIONS.map((sec, idx) => {
          const isActive = idx === activeIndex;



          return (
            <button
              key={sec.id}
              type="button"
              onClick={() => goToSlide(idx)}
              aria-label={`Dive to ${sec.label}`}
              title={`${sec.label} • ${sec.depthName}`}
              className="z-depth-pearl-btn"
            >
              <span className={`z-depth-pearl-dot ${isActive ? 'active' : ''}`} />
              <span className="z-depth-tooltip">
                <strong>{sec.label}</strong>
                <span className="z-depth-tooltip-depth">{sec.depthName}</span>
              </span>
            </button>
          );
        })}
      </nav>

      {/* 6. Ambient Ocean Swell Audio Toggle (Fixed Floating Button in Bottom Left - ONLY visible on Home) */}
      {activeIndex === 0 && !activeModal && !abyssalExplorerOpen && !faqChamberOpen && (
        <button
          type="button"
          className={`ambient-audio-toggle ${isPlayingAudio ? 'playing' : ''}`}
          onClick={toggleAmbientAudio}
          title={isPlayingAudio ? 'Mute Ocean Waves' : 'Play Ambient Deep Sea Audio'}
          aria-label="Toggle ocean sound"
          id="ocean-audio-toggle"
        >
          <svg
            viewBox="0 0 24 24"
            width="18"
            height="18"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
          >
            {isPlayingAudio ? (
              <>
                <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" fill="currentColor" />
                <path d="M19.07 4.93a10 10 0 0 1 0 14.14M15.54 8.46a5 5 0 0 1 0 7.07" />
              </>
            ) : (
              <>
                <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" fill="currentColor" />
                <line x1="23" y1="9" x2="17" y2="15" />
                <line x1="17" y1="9" x2="23" y2="15" />
              </>
            )}
          </svg>
          <span className="audio-label">{isPlayingAudio ? 'Sound On' : 'Ocean Sound'}</span>
        </button>
      )}

      {/* 6b. Minimal Back to Top Button on Every Page Except Homepage */}
      {activeIndex !== 0 && !activeModal && !abyssalExplorerOpen && !faqChamberOpen && (
        <button
          type="button"
          className="back-to-top-btn"
          onClick={handleBackToTop}
          aria-label="Back to top"
          title="Return to Litfest 2.0 Surface (0m)"
          id="back-to-top-btn"
        >
          <span className="back-to-top-icon" aria-hidden="true">
            <ChevronUp size={15} />
          </span>
          <span>Top</span>
        </button>
      )}

      {/* 7. Interactive Modal for Registration / Event Exploration */}
      {activeModal && (
        <div
          className="ocean-modal-overlay"
          onClick={() => setActiveModal(null)}
          role="dialog"
          aria-modal="true"
        >
          <div className="ocean-modal-window" onClick={(e) => e.stopPropagation()}>
            <button
              type="button"
              className="modal-close-btn"
              onClick={() => setActiveModal(null)}
              aria-label="Close"
              id="modal-close-btn"
            >
              &times;
            </button>

            <div className="modal-body">
              <span className="modal-eyebrow">FESTIVAL LINEUP</span>
              <h3>Featured Arenas</h3>
              <p>Discover the literary and expressive categories configured for Litfest 2.0.</p>
              <div className="events-grid-preview">
                <div className="event-preview-card">
                  <h4>Verbatim</h4>
                  <p>Parliamentary Debate & Extempore Battles</p>
                </div>
                <div className="event-preview-card">
                  <h4>Inkspire</h4>
                  <p>Creative Poetry, Flash Fiction & Journalism</p>
                </div>
                <div className="event-preview-card">
                  <h4>Quizzitch</h4>
                  <p>Flagship General & Pop-Culture Trivia Quest</p>
                </div>
              </div>
              <div className="modal-cta-group">
                <button
                  type="button"
                  className="modal-primary-btn"
                  onClick={() => {
                    setActiveModal(null);
                    goToSlide(3);
                  }}
                >
                  Explore in 3D Timeline
                </button>
                <button
                  type="button"
                  className="modal-secondary-btn"
                  onClick={() => {
                    setActiveModal(null);
                    navigate('/signup');
                  }}
                >
                  Register for Events
                </button>
                <button
                  type="button"
                  className="modal-secondary-btn"
                  onClick={() => setActiveModal(null)}
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 8. 3D Abyssal Explorer Overlay */}
      {abyssalExplorerOpen &&
        createPortal(
          <div
            className="abyssal-explorer-overlay"
            role="dialog"
            aria-modal="true"
            aria-label="Abyssal Voyage"
          >
            <Suspense
              fallback={
                <div className="abyssal-loading" role="status">
                  Preparing the abyssal voyage…
                </div>
              }
            >
              <LazyAbyssalExplorer
                onExit={() => setAbyssalExplorerOpen(false)}
                onLandmarkNavigate={handleAbyssalNavigate}
              />
            </Suspense>
          </div>,
          document.body
        )}

      {/* 9. Captain's Desk FAQ & Contact Chamber Modal Overlay */}
      {faqChamberOpen && (
        <div
          className="faq-chamber-backdrop"
          onClick={() => setFaqChamberOpen(false)}
          data-lenis-prevent
          role="dialog"
          aria-modal="true"
          aria-label="Captain's Desk FAQs and Contact"
        >
          <div
            className="faq-chamber-modal"
            onClick={(e) => e.stopPropagation()}
            data-lenis-prevent
          >
            <div className="faq-chamber-modal-header">
              <div className="modal-title-wrap">
                <Compass size={18} className="modal-compass" />
                <span>CAPTAIN'S DESK • OFFICIAL INQUIRIES & CONTACT</span>
              </div>

              <div className="faq-chamber-tab-group" role="tablist">
                <button
                  type="button"
                  role="tab"
                  aria-selected={faqTab === 'faq'}
                  className={`faq-tab-btn ${faqTab === 'faq' ? 'active' : ''}`}
                  onClick={() => setFaqTab('faq')}
                  id="faq-chamber-faq-tab"
                >
                  <HelpCircle size={14} />
                  <span>Frequently Asked Questions</span>
                </button>
                <button
                  type="button"
                  role="tab"
                  aria-selected={faqTab === 'contact'}
                  className={`faq-tab-btn ${faqTab === 'contact' ? 'active' : ''}`}
                  onClick={() => setFaqTab('contact')}
                  id="faq-chamber-contact-tab"
                >
                  <Mail size={14} />
                  <span>Contact Us</span>
                </button>
              </div>

              <button
                type="button"
                className="faq-modal-close-btn interactive"
                onClick={() => setFaqChamberOpen(false)}
                title="Return to Voyage"
                aria-label="Close modal"
                id="faq-chamber-close-btn"
              >
                <X size={16} />
                <span>BACK</span>
              </button>
            </div>

            <div
              className="faq-chamber-scroll-body"
              data-lenis-prevent
              tabIndex={0}
              onWheel={(e) => e.stopPropagation()}
            >
              {faqTab === 'faq' ? (
                <FaqSection />
              ) : (
                <ContactSection />
              )}
            </div>
          </div>
        </div>
      )}
    </main>
  );
};

export default LitfestUnderwaterHome;

