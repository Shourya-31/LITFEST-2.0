import React, { useState, useRef, useEffect } from 'react';
import type Lenis from 'lenis';
import { gsap } from 'gsap';
import { Navbar } from '../components/navigation/Navbar';
import { LitfestUnderwaterHome } from '../features/home/LitfestUnderwaterHome';
import { BubblesTransition } from '../features/home/components/BubblesTransition';
import { PirateWheelTimeline } from '../features/schedule/PirateWheelTimeline';
import { FaqSection } from '../features/faq/FaqSection';
import { LitfestAboutSection } from '../features/about';
import { GameLauncher } from '../features/game/GameLauncher';
import { AbyssalExplorer } from '../components/underwater';
import type { AbyssalNavigationTarget } from '../components/underwater';
import { X, Compass, CheckCircle2, Volume2, VolumeX } from 'lucide-react';
import { soundEngine } from '../utils/soundEngine';

export const App: React.FC = () => {
  const [faqOpen, setFaqOpen] = useState<boolean>(false);
  const [activeModal, setActiveModal] = useState<'register' | 'arenas' | null>(null);
  const [isAudioPlaying, setIsAudioPlaying] = useState<boolean>(false);
  const [abyssalExplorerOpen, setAbyssalExplorerOpen] = useState(false);
  const [currentNavSection, setCurrentNavSection] = useState<
    'home' | 'timeline' | 'about' | 'arcade'
  >('home');
  const [isTransitioning, setIsTransitioning] = useState<boolean>(false);
  const [transitionDirection, setTransitionDirection] = useState<'dive' | 'surface'>('dive');
  const lenisInstanceRef = useRef<Lenis | null>(null);

  useEffect(() => {
    if (!abyssalExplorerOpen) return undefined;
    const previousBodyOverflow = document.body.style.overflow;
    const previousDocumentOverflow = document.documentElement.style.overflow;
    document.body.style.overflow = 'hidden';
    document.documentElement.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = previousBodyOverflow;
      document.documentElement.style.overflow = previousDocumentOverflow;
    };
  }, [abyssalExplorerOpen]);

  const toggleFaq = (open: boolean) => {
    soundEngine.playDroplet();
    setFaqOpen(open);
  };

  const handleNavigateTimeline = () => {
    if (currentNavSection === 'timeline' || isTransitioning) return;
    if (currentNavSection !== 'home') {
      setCurrentNavSection('timeline');
      setFaqOpen(false);
      setActiveModal(null);
      lenisInstanceRef.current?.scrollTo(0, { immediate: true });
      return;
    }
    setIsTransitioning(true);
    setTransitionDirection('dive');

    // Zoom into home view to accompany rising bubbles
    const homeStage = document.getElementById('underwater-home-stage');
    if (homeStage) {
      gsap.to(homeStage, {
        scale: 2.2,
        opacity: 0,
        filter: 'blur(8px)',
        duration: 0.45,
        ease: 'power2.in',
      });
    }
  };

  const handleNavigateHome = () => {
    if (currentNavSection === 'home' || isTransitioning) return;
    if (currentNavSection !== 'timeline') {
      setCurrentNavSection('home');
      setFaqOpen(false);
      setActiveModal(null);
      return;
    }
    setIsTransitioning(true);
    setTransitionDirection('surface');
  };

  const handleNavigateAbout = () => {
    if (isTransitioning) return;
    setCurrentNavSection('about');
    setFaqOpen(false);
    setActiveModal(null);
  };

  const handleNavigateArcade = () => {
    if (isTransitioning) return;
    setCurrentNavSection('arcade');
    setFaqOpen(false);
    setActiveModal(null);
  };

  // Switch views at peak bubble surge density (300ms)
  const handleTransitionMidpoint = () => {
    if (transitionDirection === 'dive') {
      setCurrentNavSection('timeline');
      if (lenisInstanceRef.current) {
        lenisInstanceRef.current.scrollTo(0, { immediate: true });
      }
    } else {
      setCurrentNavSection('home');
      const homeStage = document.getElementById('underwater-home-stage');
      if (homeStage) {
        homeStage.style.display = 'block';
        gsap.fromTo(
          homeStage,
          { scale: 2.2, opacity: 0, filter: 'blur(8px)' },
          { scale: 1, opacity: 1, filter: 'blur(0px)', duration: 0.5, ease: 'power2.out' }
        );
      }
    }
  };

  const handleTransitionComplete = () => {
    setIsTransitioning(false);
  };

  const toggleAudio = () => {
    const active = soundEngine.toggleOceanAmbience();
    setIsAudioPlaying(active);
  };

  const handleAbyssalLandmarkNavigate = (target: AbyssalNavigationTarget) => {
    setAbyssalExplorerOpen(false);
    switch (target) {
      case 'home':
        handleNavigateHome();
        break;
      case 'timeline':
        handleNavigateTimeline();
        break;
      case 'about':
        handleNavigateAbout();
        break;
      case 'arcade':
        handleNavigateArcade();
        break;
      case 'faq':
        toggleFaq(true);
        break;
      case 'events':
        setActiveModal('arenas');
        break;
      case 'register':
        setActiveModal('register');
        break;
    }
  };

  return (
    <div className="litfest-app-root">
      <div inert={abyssalExplorerOpen}>
      {/* 1. Global Floating Navbar */}
      <Navbar
        currentSection={currentNavSection}
        onNavigateHome={handleNavigateHome}
        onNavigateTimeline={handleNavigateTimeline}
        onNavigateAbout={handleNavigateAbout}
        onNavigateArcade={handleNavigateArcade}
        onOpenFaq={() => toggleFaq(true)}
        onOpenArenas={() => setActiveModal('arenas')}
        onOpenRegister={() => setActiveModal('register')}
        isFaqOpen={faqOpen}
      />

      {/* 2. Sleek Floating Bottom-Left Mute Button - Only visible on Home */}
      {currentNavSection === 'home' && !isTransitioning && (
        <button
          type="button"
          className={`ocean-mute-btn ${isAudioPlaying ? 'is-playing' : ''}`}
          onClick={toggleAudio}
          title={isAudioPlaying ? 'Mute Ocean Waves' : 'Play Ambient Deep Sea Audio'}
          aria-label="Toggle ocean audio"
          id="ocean-mute-toggle"
        >
          {isAudioPlaying ? <Volume2 size={18} /> : <VolumeX size={18} />}
        </button>
      )}

      {/* 3. Lenis Virtual Scroll Spacer (800vh when in timeline for silky smooth navigation) */}
      <div
        className="lenis-scroll-spacer"
        style={{ height: currentNavSection === 'timeline' ? '800vh' : '100vh' }}
        aria-hidden="true"
      />

      {/* 4. Surface & Abyssal Underwater Homepage */}
      <LitfestUnderwaterHome
        onExploreClick={handleNavigateTimeline}
        onExploreAbyss={() => setAbyssalExplorerOpen(true)}
        isTimelineActive={currentNavSection !== 'home'}
      />

      {(currentNavSection === 'about' || currentNavSection === 'arcade') && (
        <section
          className="secondary-content-view"
          aria-label={currentNavSection === 'about' ? 'About Litfest 2.0' : 'Blue Pulse Arcade'}
        >
          {currentNavSection === 'about' ? (
            <LitfestAboutSection onAscendClick={handleNavigateHome} />
          ) : (
            <GameLauncher />
          )}
        </section>
      )}

      {/* 4. Cinematic Oceanic Bubbles Transition Layer */}
      <BubblesTransition
        isActive={isTransitioning}
        direction={transitionDirection}
        onMidpoint={handleTransitionMidpoint}
        onComplete={handleTransitionComplete}
      />

      {/* 5. PRIMARY COMPONENT: 3D Z-Axis Voyage Timeline */}
      <main
        className="main-3d-z-viewport"
        style={{
          zIndex: currentNavSection === 'timeline' ? 15 : 0,
          opacity: currentNavSection === 'timeline' ? 1 : 0,
          pointerEvents: currentNavSection === 'timeline' ? 'auto' : 'none',
          display: currentNavSection === 'timeline' ? 'block' : 'none',
        }}
      >
        <PirateWheelTimeline
          isFaqOpen={faqOpen}
          onNavigateHome={handleNavigateHome}
          onRegisterLenis={(lenis) => {
            lenisInstanceRef.current = lenis;
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
                  <span>Keynote speaker panels, masterclasses & author workshops</span>
                </div>
                <div className="perk-item">
                  <CheckCircle2 size={16} className="perk-check" />
                  <span>Official Literati Certificate of Merit & flagship bounties</span>
                </div>
              </div>
              <div className="modal-cta-group">
                <a className="modal-secondary-btn" href="/contact">
                  Contact Organizing Committee
                </a>
                <button
                  type="button"
                  className="modal-primary-btn"
                  onClick={() => {
                    soundEngine.playWaterBell(0);
                    setActiveModal(null);
                  }}
                >
                  Confirm Registration
                </button>
                <button
                  type="button"
                  className="modal-secondary-btn"
                  onClick={() => setActiveModal(null)}
                >
                  Return to Voyage
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 7. Arenas Overview Modal */}
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
              <h3>Featured Events</h3>
              <p>
                Discover the literary and expressive competitive events configured for Litfest 2.0.
              </p>
              <div className="events-grid-preview">
                <div className="event-preview-card">
                  <h4>Verbatim</h4>
                  <p>Parliamentary Debate & Extempore Battles on the main stage.</p>
                </div>
                <div className="event-preview-card">
                  <h4>Inkspire</h4>
                  <p>Creative Poetry, Flash Fiction & Investigative Journalism.</p>
                </div>
                <div className="event-preview-card">
                  <h4>Quizzitch</h4>
                  <p>Flagship General & Pop-Culture High Seas Trivia Quest.</p>
                </div>
              </div>
              <div className="modal-cta-group">
                <button
                  type="button"
                  className="modal-primary-btn"
                  onClick={() => {
                    setActiveModal(null);
                    handleNavigateTimeline();
                  }}
                >
                  Explore in 3D Timeline
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

      {abyssalExplorerOpen && (
        <div className="abyssal-explorer-overlay" role="dialog" aria-modal="true" aria-label="Abyssal Voyage">
          <AbyssalExplorer
            onExit={() => setAbyssalExplorerOpen(false)}
            onLandmarkNavigate={handleAbyssalLandmarkNavigate}
          />
        </div>
      )}
    </div>
  );
};

export default App;
