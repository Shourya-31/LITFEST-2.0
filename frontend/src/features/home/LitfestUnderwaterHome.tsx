import React, { Suspense, lazy, useState, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { OceanAtmosphere } from './components/OceanAtmosphere';
import { MarineLife } from './components/MarineLife';
import { MarineVegetation } from './components/MarineVegetation';
import { UnderwaterTitle } from './components/UnderwaterTitle';
import { FestivalNav } from './components/FestivalNav';
import { LitfestAboutSection } from '../about';
import { SponsorsSection } from '../sponsors';
import { FaqSection } from '../faq';
import { ContactSection } from '../contact';
import { GameLauncher } from '../game/GameLauncher';
import type { AbyssalNavigationTarget } from '../../components/underwater/abyssal-explorer';
import './LitfestUnderwaterHome.css';

const LazyAbyssalExplorer = lazy(() =>
  import('../../components/underwater/abyssal-explorer').then(({ AbyssalExplorer }) => ({
    default: AbyssalExplorer,
  }))
);

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
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);
  const [activeModal, setActiveModal] = useState<'register' | 'events' | null>(() =>
    initialDestination === 'register' || initialDestination === 'events'
      ? initialDestination
      : null
  );
  const [abyssalExplorerOpen, setAbyssalExplorerOpen] = useState(false);
  const homeRef = useRef<HTMLElement | null>(null);

  const audioCtxRef = useRef<AudioContext | null>(null);
  const gainNodeRef = useRef<GainNode | null>(null);

  useEffect(() => {
    if (!abyssalExplorerOpen) return undefined;
    const homeElement = homeRef.current;
    const previousBodyOverflow = document.body.style.overflow;
    const previousDocumentOverflow = document.documentElement.style.overflow;
    const previousInert = homeElement?.inert ?? false;
    document.body.style.overflow = 'hidden';
    document.documentElement.style.overflow = 'hidden';
    if (homeElement) homeElement.inert = true;
    return () => {
      document.body.style.overflow = previousBodyOverflow;
      document.documentElement.style.overflow = previousDocumentOverflow;
      if (homeElement) homeElement.inert = previousInert;
    };
  }, [abyssalExplorerOpen]);

  // Smooth scroll handler for in-page oceanic descent navigation
  const scrollToSection = React.useCallback((sectionId: string) => {
    if (sectionId === 'home') {
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }
    const elem = document.getElementById(sectionId);
    if (elem) {
      elem.scrollIntoView({ behavior: 'smooth' });
    }
  }, []);

  const handleNavClick = (sec: string) => {
    if (sec === 'home') {
      scrollToSection('home');
    } else if (sec === 'events') {
      setActiveModal('events');
    } else if (sec === 'arcade') {
      scrollToSection('arcade');
    } else if (sec === '3d' || sec === 'abyss') {
      scrollToSection('3d');
    } else if (sec === 'about') {
      scrollToSection('about');
    } else if (sec === 'sponsors') {
      scrollToSection('sponsors');
    } else if (sec === 'faq') {
      scrollToSection('faq');
    } else if (sec === 'contact') {
      scrollToSection('contact');
    } else if (sec === 'schedule' || sec === 'gallery') {
      setActiveModal('events');
    }
  };

  // Synthesize realistic ambient ocean swell audio using Web Audio API (zero external assets needed)
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
        lfo.frequency.setValueAtTime(0.14, ctx.currentTime); // ~7s swell period
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

  const handleAbyssalNavigate = React.useCallback((target: AbyssalNavigationTarget) => {
    setAbyssalExplorerOpen(false);
    switch (target) {
      case 'home':
        scrollToSection('home');
        break;
      case 'about':
        scrollToSection('about');
        break;
      case 'sponsors':
        scrollToSection('sponsors');
        break;
      case 'faq':
        scrollToSection('faq');
        break;
      case 'contact':
        scrollToSection('contact');
        break;
      case 'arcade':
        scrollToSection('arcade');
        break;
      case 'events':
        setActiveModal('events');
        break;
      case 'register':
        setActiveModal('register');
        break;
      case 'timeline':
        onAbyssalNavigate?.(target);
        break;
    }
  }, [onAbyssalNavigate, scrollToSection]);

  useEffect(() => {
    if (initialDestination === 'home') {
      scrollToSection('home');
    } else if (initialDestination === 'arcade') {
      scrollToSection('arcade');
    } else if (initialDestination === 'about') {
      scrollToSection('about');
    } else if (initialDestination === 'sponsors') {
      scrollToSection('sponsors');
    } else if (initialDestination === 'faq') {
      scrollToSection('faq');
    } else if (initialDestination === 'contact') {
      scrollToSection('contact');
    }
  }, [initialDestination, scrollToSection]);

  return (
    <main
      ref={homeRef}
      className="litfest-underwater-root"
      role="main"
      aria-label="Litfest 2.0 Underwater Experience"
      style={{ display: isTimelineActive ? 'none' : undefined }}
      inert={isDestinationOpen}
    >
      {/* 1. Global Navigation Header (Floating, fixed with glassmorphism on scroll) */}
      <FestivalNav
        onRegisterClick={() => setActiveModal('register')}
        onNavClick={handleNavClick}
      />

      {/* 2. Primary Upper-Ocean Illuminated Viewport (Homepage) */}
      <section
        id="home"
        className="hero-underwater-viewport"
        aria-label="Litfest 2.0 Surface & Title"
      >
        {/* Deep Sea Atmosphere & Volumetric Sunlight */}
        <OceanAtmosphere />

        {/* Layered Flat Marine Silhouettes (Whale, Shark, Shoal, Octopus, Jellyfish, Manta) */}
        <MarineLife showJellyfish={true} />

        {/* Underwater Vegetation (Tall Left/Right Kelp & Bioluminescent Corals) */}
        <MarineVegetation />

        {/* Central Prominent Display Title & Interactive Descend Indicator */}
        <UnderwaterTitle
          onExploreClick={() => {
            if (onExploreClick) {
              onExploreClick();
            } else {
              setActiveModal('events');
            }
          }}
          onDescendClick={() => scrollToSection('about')}
        />
      </section>

      <GameLauncher />

      <section id="3d" className="abyss-entry-section" aria-label="3D Underwater Experience">
        <div className="abyss-entry-copy">
          <h2>Explore The Stories Beneath The Surface in 3D</h2>
          <p>
            Dive into an interactive, real-time 3D simulation of Litfest 2.0. Pilot an abyssal submersible, discover sunken literary monuments, and recover lost relics in the deep.
          </p>
        </div>
        <button
          type="button"
          className="abyss-entry-button"
          onClick={() => onExploreAbyss ? onExploreAbyss() : setAbyssalExplorerOpen(true)}
          id="abyss-launch-3d-btn"
        >
          <span>ENTER 3D EXPERIENCE</span>
          <span className="abyss-btn-arrow" aria-hidden="true">↗</span>
        </button>
      </section>

      {/* 3. Deeper Ocean Descent & Litfest 2.0 About Experience */}
      <LitfestAboutSection
        id="about"
        onExploreEvents={() => setActiveModal('events')}
        onRegisterClick={() => setActiveModal('register')}
        onAscendClick={() => scrollToSection('home')}
      />

      {/* 4. Institutional Sponsors & Partners from sponsors.html */}
      <SponsorsSection
        id="sponsors"
        onAscendClick={() => scrollToSection('home')}
        onContactClick={() => scrollToSection('contact')}
      />

      {/* 5. Frequently Asked Questions Section */}
      <FaqSection
        onAscendClick={() => scrollToSection('home')}
      />

      {/* 6. Contact & Direct Transmission Section */}
      <ContactSection
        id="contact"
        onAscendClick={() => scrollToSection('home')}
      />

      {/* 4. Ambient Ocean Swell Audio Toggle (Fixed Floating Button) */}
      <button
        type="button"
        className={`ambient-audio-toggle ${isPlayingAudio ? 'playing' : ''}`}
        onClick={toggleAmbientAudio}
        title={isPlayingAudio ? 'Mute Ocean Waves' : 'Play Ambient Deep Sea Audio'}
        aria-label="Toggle ocean sound"
        id="ocean-audio-toggle"
      >
        <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2">
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

      {/* Interactive Modal for Registration / Event Exploration */}
      {activeModal && (
        <div
          className="ocean-modal-overlay"
          onClick={() => setActiveModal(null)}
          role="dialog"
          aria-modal="true"
        >
          <div
            className="ocean-modal-window"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              type="button"
              className="modal-close-btn"
              onClick={() => setActiveModal(null)}
              aria-label="Close"
              id="modal-close-btn"
            >
              &times;
            </button>

            {activeModal === 'register' ? (
              <div className="modal-body">
                <span className="modal-eyebrow">LITFEST 2.0 &bull; PARTICIPANT ACCESS</span>
                <h3>Festival Registration</h3>
                <p>
                  Join Literati at NIT Raipur for flagship debates, spoken word, creative writing
                  symposiums, and literary quests.
                </p>
                <div className="registration-perks">
                  <div className="perk-item">
                    <span className="perk-check">&bull;</span>
                    <span>Exclusive entry to all flagship competitive events</span>
                  </div>
                  <div className="perk-item">
                    <span className="perk-check">&bull;</span>
                    <span>National guest speaker panels & workshops</span>
                  </div>
                  <div className="perk-item">
                    <span className="perk-check">&bull;</span>
                    <span>Official certificate of participation & merit prizes</span>
                  </div>
                </div>
                <div className="modal-cta-group">
                  <a
                    href="/ContactUs.html"
                    className="modal-primary-btn"
                    id="modal-contact-link"
                  >
                    Contact Organizing Committee
                  </a>
                  <button
                    type="button"
                    className="modal-secondary-btn"
                    onClick={() => setActiveModal(null)}
                  >
                    Return to Ocean
                  </button>
                </div>
              </div>
            ) : (
              <div className="modal-body">
                <span className="modal-eyebrow">FESTIVAL LINEUP</span>
                <h3>Featured Arenas</h3>
                <p>
                  Discover the literary and expressive categories configured for Litfest 2.0.
                </p>
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
                    onClick={() => setActiveModal('register')}
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
            )}
          </div>
        </div>
      )}
      {abyssalExplorerOpen &&
        createPortal(
          <div className="abyssal-explorer-overlay" role="dialog" aria-modal="true" aria-label="Abyssal Voyage">
            <Suspense fallback={<div className="abyssal-loading" role="status">Preparing the abyssal voyage…</div>}>
              <LazyAbyssalExplorer
                onExit={() => setAbyssalExplorerOpen(false)}
                onLandmarkNavigate={handleAbyssalNavigate}
              />
            </Suspense>
          </div>,
          document.body
        )}
    </main>
  );
};

export default LitfestUnderwaterHome;
