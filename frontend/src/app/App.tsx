import React from 'react';
import { Navbar } from '../components/navigation/Navbar';
import { PirateWheelTimeline } from '../features/schedule/PirateWheelTimeline';
import { FaqSection } from '../features/faq/FaqSection';
import { Compass, HelpCircle, Anchor, Sparkles } from 'lucide-react';
import { soundEngine } from '../utils/soundEngine';

export const App: React.FC = () => {
  const scrollToSection = (id: string) => {
    soundEngine.playDroplet();
    const el = document.querySelector(id);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <div className="litfest-app-root">
      {/* Navigation Header */}
      <Navbar />

      {/* Hero Showcase Section */}
      <section className="hero-ocean-section" id="hero">
        <div className="ocean-ambient-canvas" aria-hidden="true">
          <div className="ocean-wave-glow glow-1" />
          <div className="ocean-wave-glow glow-2" />
        </div>

        <div className="hero-content">
          <div className="hero-ship-crest">
            <Compass size={15} className="spin-slow" />
            <span>NIT RAIPUR • LITERATI COMMITTEE PRESENTS</span>
          </div>

          <h1 className="hero-main-title">
            LITFEST 2.0<br />
            <span style={{ fontSize: '0.65em', color: 'var(--pirate-gold)' }}>
              THE HIGH-SEAS ODYSSEY
            </span>
          </h1>

          <p className="hero-description">
            Unfurl the sails and take the helm. Journey through 14 voyage milestones of central India's flagship literary festival — from the Model United Nations and Poetry Slam to the legendary Aircrash showdown.
          </p>

          <div className="hero-cta-group">
            <button
              type="button"
              className="hero-primary-btn interactive"
              onClick={() => scrollToSection('#timeline')}
            >
              <Compass size={18} />
              <span>Turn the Pirate Helm</span>
            </button>

            <button
              type="button"
              className="hero-secondary-btn interactive"
              onClick={() => scrollToSection('#faq')}
            >
              <HelpCircle size={18} />
              <span>Explore Inquiries & FAQs</span>
            </button>
          </div>
        </div>
      </section>

      {/* 1. TIMELINE: 14-Spoke Pirate Ship Steering Wheel (Scroll & Interactive) */}
      <PirateWheelTimeline />

      {/* 2. FAQS: Full Litfest NIT Raipur Frequently Asked Questions */}
      <FaqSection />

      {/* High-Seas Nautical Footer */}
      <footer className="high-seas-footer">
        <div className="footer-container">
          <div className="footer-brand">
            <div className="nav-brand">
              <div className="brand-crest">
                <Anchor size={18} />
              </div>
              <div className="brand-text">
                <span className="brand-title">LITFEST 2.0</span>
                <span className="brand-subtitle">LITERATI NIT RAIPUR</span>
              </div>
            </div>
            <p>
              The official annual literature, debating, and cultural festival organized by Literati — the Literary Committee of National Institute of Technology Raipur.
            </p>
          </div>

          <div className="footer-col">
            <h4>Festival Navigation</h4>
            <ul className="footer-links">
              <li><a href="#hero" onClick={() => scrollToSection('#hero')}>Quarterdeck (Home)</a></li>
              <li><a href="#timeline" onClick={() => scrollToSection('#timeline')}>14-Spoke Voyage Timeline</a></li>
              <li><a href="#faq" onClick={() => scrollToSection('#faq')}>Captain's Desk FAQs</a></li>
              <li><a href="mailto:literati@nitrr.ac.in">Hostel & Outstation Logistics</a></li>
            </ul>
          </div>

          <div className="footer-col">
            <h4>Literati Secretariat</h4>
            <ul className="footer-links">
              <li><a href="mailto:literati@nitrr.ac.in">literati@nitrr.ac.in</a></li>
              <li><a href="https://litfestnitrr.in" target="_blank" rel="noreferrer">litfestnitrr.in</a></li>
              <li><a href="https://nitrr.ac.in" target="_blank" rel="noreferrer">nitrr.ac.in</a></li>
              <li><span style={{ color: 'var(--text-muted)' }}>G.E. Road, Raipur, CG - 492010</span></li>
            </ul>
          </div>
        </div>

        <div className="footer-bottom">
          <span>© 2026 Literati, NIT Raipur. Built with React & TypeScript for LitFest 2.0.</span>
          <span style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
            <Sparkles size={14} style={{ color: 'var(--pirate-gold)' }} />
            Fair Winds & Following Seas
          </span>
        </div>
      </footer>
    </div>
  );
};

export default App;
