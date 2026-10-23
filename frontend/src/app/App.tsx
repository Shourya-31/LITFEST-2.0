import React, { useState, useEffect, useRef } from 'react';
import Lenis from 'lenis';
import { gsap } from 'gsap';
import { Navbar } from '../components/navigation/Navbar';
import { LitfestUnderwaterHome } from '../features/home/LitfestUnderwaterHome';
import { BubblesTransition } from '../features/home/components/BubblesTransition';
import { PirateWheelTimeline } from '../features/schedule/PirateWheelTimeline';
import { FaqSection } from '../features/faq/FaqSection';
import { X, Compass, Sparkles, CheckCircle2 } from 'lucide-react';
import { soundEngine } from '../utils/soundEngine';

export const App: React.FC = () => {
  const [scrollProgress, setScrollProgress] = useState<number>(0);
  const [faqOpen, setFaqOpen] = useState<boolean>(false);
  const [activeModal, setActiveModal] = useState<'register' | 'arenas' | null>(null);
  const [isAudioPlaying, setIsAudioPlaying] = useState<boolean>(false);

  const lenisRef = useRef<Lenis | null>(null);
  const DIVE_THRESHOLD = 0.14; // Scroll progress boundary between Underwater Home and 3D Timeline

  // Initialize global Lenis smooth scrolling engine synchronized with GSAP ticker
  useEffect(() => {
    const lenis = new Lenis({
      duration: 0.75,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      orientation: 'vertical',
      gestureOrientation: 'vertical',
      smoothWheel: true,
      wheelMultiplier: 1.25,
      touchMultiplier: 1.8,
    });
    lenisRef.current = lenis;

    const tickerUpdate = (time: number) => {
      lenis.raf(time * 1000);
    };
    gsap.ticker.add(tickerUpdate);
    gsap.ticker.lagSmoothing(0);

    lenis.on('scroll', (e: { progress: number }) => {
      setScrollProgress(e.progress);
    });

    return () => {
      gsap.ticker.remove(tickerUpdate);
      lenis.destroy();
      lenisRef.current = null;
    };
  }, []);

  // Pause / resume Lenis when any modal (FAQ, Registration, Arenas) is open
  useEffect(() => {
    if (!lenisRef.current) return;
    const isAnyModalOpen = faqOpen || activeModal !== null;
    if (isAnyModalOpen) {
      lenisRef.current.stop();
    } else {
      lenisRef.current.start();
    }
  }, [faqOpen, activeModal]);

  // Compute stage progress variables
  // 1. Homepage zoom: 0 -> 1 during scroll [0, DIVE_THRESHOLD]
  const homeZoomProgress = Math.min(1, Math.max(0, scrollProgress / DIVE_THRESHOLD));

  // 2. Bubbles transition veil: surges when diving through DIVE_THRESHOLD
  let bubbleProgress = 0;
  if (scrollProgress >= 0.02 && scrollProgress <= 0.22) {
    if (scrollProgress < DIVE_THRESHOLD) {
      bubbleProgress = (scrollProgress - 0.02) / (DIVE_THRESHOLD - 0.02);
    } else {
      bubbleProgress = 1 - (scrollProgress - DIVE_THRESHOLD) / (0.22 - DIVE_THRESHOLD);
    }
  }

  // 3. Timeline progress: 0 -> 1 during scroll [DIVE_THRESHOLD, 1.0]
  const timelineProgress = Math.min(
    1,
    Math.max(0, (scrollProgress - DIVE_THRESHOLD) / (1 - DIVE_THRESHOLD))
  );

  const isTimelineVisible = scrollProgress >= DIVE_THRESHOLD * 0.45;
  const isTimelineActive = scrollProgress >= DIVE_THRESHOLD * 0.95;

  // Navigation Handlers
  const handleNavigateHome = () => {
    if (lenisRef.current) {
      lenisRef.current.scrollTo(0, {
        duration: 0.85,
        easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      });
    }
    setFaqOpen(false);
  };

  const handleNavigateTimeline = (targetMilestoneIdx: number = 0) => {
    if (lenisRef.current && lenisRef.current.limit > 0) {
      const targetTimelinePct = targetMilestoneIdx / 13;
      const targetGlobalPct = DIVE_THRESHOLD + targetTimelinePct * (1 - DIVE_THRESHOLD);
      const targetScroll = targetGlobalPct * lenisRef.current.limit;
      lenisRef.current.scrollTo(targetScroll, {
        duration: 0.8,
        easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      });
    }
    setFaqOpen(false);
  };

  const handleSnapToIndex = (idx: number) => {
    handleNavigateTimeline(idx);
  };

  const toggleAudio = () => {
    const active = soundEngine.toggleOceanAmbience();
    setIsAudioPlaying(active);
  };

  const toggleFaq = (open: boolean) => {
    soundEngine.playDroplet();
    setFaqOpen(open);
  };

  return (
    <div className="litfest-app-root">
      {/* 1. Global Floating Navbar */}
      <Navbar
        currentSection={scrollProgress < DIVE_THRESHOLD ? 'home' : 'timeline'}
        onNavigateHome={handleNavigateHome}
        onNavigateTimeline={() => handleNavigateTimeline(0)}
        onOpenFaq={() => toggleFaq(true)}
        onOpenArenas={() => setActiveModal('arenas')}
        onOpenRegister={() => setActiveModal('register')}
        isFaqOpen={faqOpen}
        isAudioPlaying={isAudioPlaying}
        onToggleAudio={toggleAudio}
      />

      {/* 2. Virtual Scroll Spacer for buttery smooth Lenis pacing */}
      <div className="lenis-scroll-spacer" style={{ height: '1600vh' }} aria-hidden="true" />

      {/* 3. Surface & Abyssal Underwater Homepage (Zooms into screen on scroll) */}
      <LitfestUnderwaterHome
        zoomProgress={homeZoomProgress}
        onExploreClick={() => handleNavigateTimeline(0)}
        onRegisterClick={() => setActiveModal('register')}
        isAudioPlaying={isAudioPlaying}
        onToggleAudio={toggleAudio}
      />

      {/* 4. Cinematic Oceanic Bubbles Transition Layer */}
      <BubblesTransition progress={bubbleProgress} />

      {/* 5. 3D Z-Axis Voyage Timeline & Steering Helm in Deep Abyss */}
      <main
        className="main-3d-z-viewport"
        style={{
          opacity: isTimelineVisible ? Math.min(1, (scrollProgress - DIVE_THRESHOLD * 0.45) / (DIVE_THRESHOLD * 0.45)) : 0,
          pointerEvents: isTimelineActive ? 'auto' : 'none',
          visibility: isTimelineVisible ? 'visible' : 'hidden',
        }}
      >
        <PirateWheelTimeline
          isFaqOpen={faqOpen}
          timelineProgress={timelineProgress}
          isTimelineActive={isTimelineActive}
          onNavigateToIndex={handleNavigateTimeline}
          onSnapToIndex={handleSnapToIndex}
        />
      </main>

      {/* 6. Official Litfest Participant Registration Modal */}
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
                    handleNavigateTimeline(0);
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
                    handleNavigateTimeline(0);
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
                title="Return to Voyage"
                aria-label="Close FAQs"
              >
                <X size={18} />
                <span>RETURN TO ODYSSEY</span>
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
