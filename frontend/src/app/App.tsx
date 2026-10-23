import React, { useState } from 'react';
import { Navbar } from '../components/navigation/Navbar';
import { PirateWheelTimeline } from '../features/schedule/PirateWheelTimeline';
import { FaqSection } from '../features/faq/FaqSection';
import { X, Compass } from 'lucide-react';
import { soundEngine } from '../utils/soundEngine';

export const App: React.FC = () => {
  const [faqOpen, setFaqOpen] = useState<boolean>(false);

  const toggleFaq = (open: boolean) => {
    soundEngine.playDroplet();
    setFaqOpen(open);
  };

  return (
    <div className="litfest-app-root">
      {/* Top Navbar */}
      <Navbar
        onOpenFaq={() => toggleFaq(true)}
        onOpenTimeline={() => toggleFaq(false)}
        isFaqOpen={faqOpen}
      />

      {/* Lenis Virtual Scroll Height Spacer for momentum smooth scrolling */}
      <div className="lenis-scroll-spacer" style={{ height: '1400vh' }} aria-hidden="true" />

      {/* PRIMARY COMPONENT: 3D Z-Axis Zoom-In / Zoom-Out Timeline */}
      <main className="main-3d-z-viewport">
        <PirateWheelTimeline isFaqOpen={faqOpen} />
      </main>

      {/* FAQ Chamber Modal Overlay (Opens on demand via Navbar so timeline maintains pure Z-axis scroll) */}
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
