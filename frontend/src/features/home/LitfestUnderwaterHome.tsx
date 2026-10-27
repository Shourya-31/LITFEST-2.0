import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { OceanAtmosphere } from './components/OceanAtmosphere';
import { MarineLife } from './components/MarineLife';
import { MarineVegetation } from './components/MarineVegetation';
import { UnderwaterTitle } from './components/UnderwaterTitle';
import { FestivalNav } from './components/FestivalNav';
import { LitfestAboutSection } from '../about';
import './LitfestUnderwaterHome.css';

export const LitfestUnderwaterHome: React.FC = () => {
  const navigate = useNavigate();
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);
  const [activeModal, setActiveModal] = useState<'events' | null>(null);

  const audioCtxRef = useRef<AudioContext | null>(null);
  const gainNodeRef = useRef<GainNode | null>(null);

  // Smooth scroll handler for in-page oceanic descent navigation
  const scrollToSection = (sectionId: string) => {
    if (sectionId === 'home') {
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }
    const elem = document.getElementById(sectionId);
    if (elem) {
      elem.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const handleNavClick = (sec: string) => {
    if (sec === 'home') {
      scrollToSection('home');
    } else if (sec === 'about') {
      scrollToSection('about');
    } else if (sec === 'events' || sec === 'schedule' || sec === 'speakers' || sec === 'gallery') {
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

  return (
    <main
      className="litfest-underwater-root"
      role="main"
      aria-label="Litfest 2.0 Underwater Experience"
    >
      {/* 1. Global Navigation Header (Floating, fixed with glassmorphism on scroll) */}
      <FestivalNav
        onRegisterClick={() => navigate('/signup')}
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
          onExploreClick={() => setActiveModal('events')}
          onDescendClick={() => scrollToSection('about')}
        />
      </section>

      {/* 3. Deeper Ocean Descent & Litfest 2.0 About Experience */}
      <LitfestAboutSection
        id="about"
        onExploreEvents={() => setActiveModal('events')}
        onRegisterClick={() => navigate('/signup')}
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
    </main>
  );
};

export default LitfestUnderwaterHome;
