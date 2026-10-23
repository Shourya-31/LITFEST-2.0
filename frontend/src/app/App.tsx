import React, { useState, useRef } from 'react';
import type Lenis from 'lenis';
import { Navbar } from '../components/navigation/Navbar';
import { LitfestUnderwaterHome } from '../features/home/LitfestUnderwaterHome';
import { BubblesTransition } from '../features/home/components/BubblesTransition';
import { PirateWheelTimeline } from '../features/schedule/PirateWheelTimeline';
import { FaqSection } from '../features/faq/FaqSection';
import { X, Compass, CheckCircle2 } from 'lucide-react';
import { soundEngine } from '../utils/soundEngine';

export const App: React.FC = () => {
  const [faqOpen, setFaqOpen] = useState<boolean>(false);
  const [activeModal, setActiveModal] = useState<'register' | 'arenas' | null>(null);
  const [isAudioPlaying, setIsAudioPlaying] = useState<boolean>(false);
  const [currentNavSection, setCurrentNavSection] = useState<'home' | 'timeline'>('home');

  const lenisInstanceRef = useRef<Lenis | null>(null);
  const HOME_ZONE = 0.12;

  const toggleFaq = (open: boolean) => {
    soundEngine.playDroplet();
    setFaqOpen(open);
  };

  const handleNavigateHome = () => {
    if (lenisInstanceRef.current) {
      lenisInstanceRef.current.scrollTo(0, {
        duration: 0.85,
        easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      });
    }
    setFaqOpen(false);
  };

  const handleNavigateTimeline = () => {
    if (lenisInstanceRef.current && lenisInstanceRef.current.limit > 0) {
      const targetScroll = HOME_ZONE * lenisInstanceRef.current.limit;
      lenisInstanceRef.current.scrollTo(targetScroll, {
        duration: 0.8,
        easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      });
    }
    setFaqOpen(false);
  };

  const toggleAudio = () => {
    const active = soundEngine.toggleOceanAmbience();
    setIsAudioPlaying(active);
  };

  return (
    <div className="litfest-app-root">
      {/* 1. Global Floating Navbar */}
      <Navbar
        currentSection={currentNavSection}
        onNavigateHome={handleNavigateHome}
        onNavigateTimeline={handleNavigateTimeline}
        onOpenFaq={() => toggleFaq(true)}
        onOpenArenas={() => setActiveModal('arenas')}
        onOpenRegister={() => setActiveModal('register')}
        isFaqOpen={faqOpen}
        isAudioPlaying={isAudioPlaying}
        onToggleAudio={toggleAudio}
      />

      {/* 2. Lenis Virtual Scroll Spacer (1400vh for natural, buttery smooth travel) */}
      <div className="lenis-scroll-spacer" style={{ height: '1400vh' }} aria-hidden="true" />

      {/* 3. Surface & Abyssal Underwater Homepage (Controlled directly in Lenis RAF for 120fps) */}
      <LitfestUnderwaterHome
        onExploreClick={handleNavigateTimeline}
        onRegisterClick={() => setActiveModal('register')}
        isAudioPlaying={isAudioPlaying}
        onToggleAudio={toggleAudio}
      />

      {/* 4. Cinematic Oceanic Bubbles Transition Layer */}
      <div id="underwater-bubbles-stage" style={{ opacity: 0, display: 'none' }}>
        <BubblesTransition progress={1} />
      </div>

      {/* 5. PRIMARY COMPONENT: 3D Z-Axis Voyage Timeline */}
      <main className="main-3d-z-viewport">
        <PirateWheelTimeline
          isFaqOpen={faqOpen}
          onRegisterLenis={(lenis) => {
            lenisInstanceRef.current = lenis;
          }}
          onScrollProgress={(progress) => {
            setCurrentNavSection(progress <= HOME_ZONE ? 'home' : 'timeline');
          }}
        />
      </main>

      {/* 6. Participant Registration Modal */}
      {activeModal === 'register' && (
        <div
          className="ocean-modal-overlay"
          onClick={() => setActiveModal(null)}
          role="dialog"
          aria-modal="true"
          data-lenis-prevent
        >
          <div
            className="ocean-modal-window"
            onClick={(e) => e.stopPropagation()}
            data-lenis-prevent
          >
            <button
              type="button"
              className="modal-close-btn"
              onClick={() => setActiveModal(null)}
              aria-label="Close modal"
              id="modal-close-btn"
            >
              &times;
            </button>

            <div className="modal-body">
              <span className="modal-eyebrow">LITFEST 2.0 • PARTICIPANT ACCESS</span>
              <h3>Festival Registration</h3>
              <p>
                Join Literati at NIT Raipur for flagship debates, spoken word, creative writing
                symposiums, and literary quests across the high seas.
              </p>
              <div className="registration-perks">
                <div className="perk-item">
                  <CheckCircle2 size={16} className="perk-check" />
                  <span>Exclusive entry to all flagship competitive arenas & quests</span>
                </div>
                <div className="perk-item">
                  <CheckCircle2 size={16} className="perk-check" />
                  <span>National guest speaker panels, workshops & masterclasses</span>
                </div>
                <div className="perk-item">
                  <CheckCircle2 size={16} className="perk-check" />
                  <span>Official certificate of participation & merit cash prizes</span>
                </div>
              </div>
              <div className="modal-cta-group">
                <button
                  type="button"
                  className="modal-primary-btn"
                  onClick={() => {
                    soundEngine.playDroplet();
                    setActiveModal(null);
                    handleNavigateTimeline();
                  }}
                  id="modal-register-action"
                >
                  Explore Arenas in Timeline
                </button>
                <button
                  type="button"
                  className="modal-secondary-btn"
                  onClick={() => setActiveModal(null)}
                >
                  Return to Ocean
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 7. Featured Arenas Modal */}
      {activeModal === 'arenas' && (
        <div
          className="ocean-modal-overlay"
          onClick={() => setActiveModal(null)}
          role="dialog"
          aria-modal="true"
          data-lenis-prevent
        >
          <div
            className="ocean-modal-window"
            onClick={(e) => e.stopPropagation()}
            data-lenis-prevent
          >
            <button
              type="button"
              className="modal-close-btn"
              onClick={() => setActiveModal(null)}
              aria-label="Close modal"
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
                    soundEngine.playDroplet();
                    setActiveModal(null);
                    handleNavigateTimeline();
                  }}
                >
                  View in Timeline
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

      {/* 8. Captain's Desk FAQ Chamber Modal Overlay */}
      {faqOpen && (
        <div
          className="faq-chamber-backdrop"
          onClick={() => toggleFaq(false)}
          data-lenis-prevent
        >
          <div
            className="faq-chamber-modal"
            onClick={(e) => e.stopPropagation()}
            role="dialog"
            aria-modal="true"
            aria-label="Frequently Asked Questions"
            data-lenis-prevent
          >
            <div className="faq-chamber-modal-header">
              <div className="modal-title-wrap">
                <Compass size={18} className="modal-compass" />
                <span>CAPTAIN'S DESK • OFFICIAL FESTIVAL FAQS</span>
              </div>
              <button
                type="button"
                className="faq-modal-close-btn interactive"
                onClick={() => toggleFaq(false)}
                title="Return to 3D Timeline"
                aria-label="Close FAQs"
              >
                <X size={20} />
                <span>RETURN TO HELM</span>
              </button>
            </div>

            <div
              className="faq-chamber-scroll-body"
              data-lenis-prevent
              tabIndex={0}
              onWheel={(e) => e.stopPropagation()}
            >
              <FaqSection />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default App;
