import React from 'react';
import { Navbar } from '../components/navigation/Navbar';
import { PirateWheelTimeline } from '../features/schedule/PirateWheelTimeline';
import { FaqSection } from '../features/faq/FaqSection';
import { Compass, HelpCircle, Sparkles } from 'lucide-react';
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

      {/* Hero Section Placeholder (Other team's domain) */}
      <section className="hero-ocean-section" id="hero">
        <div className="ocean-ambient-canvas" aria-hidden="true">
          <div className="ocean-wave-glow glow-1" />
          <div className="ocean-wave-glow glow-2" />
        </div>

        <div className="hero-content">
          <div className="hero-ship-crest">
            <Compass size={15} className="spin-slow" />
            <span>[HERO COMPONENT PLACEHOLDER — OTHER TEAM DOMAIN]</span>
          </div>

          <h1 className="hero-main-title">
            LITFEST 2.0<br />
            <span style={{ fontSize: '0.62em', color: 'var(--pirate-gold)' }}>
              [High-Seas Literary Odyssey Placeholder]
            </span>
          </h1>

          <p className="hero-description">
            [Placeholder banner for landing screen / hero introduction. Team members working on the landing/hero component can replace this container directly.]
          </p>

          <div className="hero-cta-group">
            <button
              type="button"
              className="hero-primary-btn interactive"
              onClick={() => scrollToSection('#timeline')}
            >
              <Compass size={18} />
              <span>Jump to 3D Z-Axis Timeline</span>
            </button>

            <button
              type="button"
              className="hero-secondary-btn interactive"
              onClick={() => scrollToSection('#faq')}
            >
              <HelpCircle size={18} />
              <span>Jump to FAQs</span>
            </button>
          </div>
        </div>
      </section>

      {/* ASSIGNED COMPONENT 1: 3D Z-Axis Timeline with 14-Spoke Pirate Ship Wheel */}
      <PirateWheelTimeline />

      {/* ASSIGNED COMPONENT 2: Official LitFest FAQ Section */}
      <FaqSection />

      {/* Footer Placeholder (Other team's domain) */}
      <footer className="high-seas-footer" id="footer">
        <div className="footer-container">
          <div className="footer-brand">
            <div className="brand-text">
              <span className="brand-title">LITFEST 2.0</span>
              <span className="brand-subtitle">[FOOTER PLACEHOLDER — OTHER TEAM DOMAIN]</span>
            </div>
            <p>
              [Footer component placeholder. Social links, sponsors, and institutional copyright blocks to be integrated by the respective team.]
            </p>
          </div>

          <div className="footer-col">
            <h4>Quick Section Jump</h4>
            <ul className="footer-links">
              <li><a href="#hero" onClick={() => scrollToSection('#hero')}>Top / Hero Placeholder</a></li>
              <li><a href="#timeline" onClick={() => scrollToSection('#timeline')}>3D Z-Axis Timeline</a></li>
              <li><a href="#faq" onClick={() => scrollToSection('#faq')}>Frequently Asked Questions</a></li>
            </ul>
          </div>
        </div>

        <div className="footer-bottom">
          <span>[NIT Raipur Literati 2.0 Website Scaffold]</span>
          <span style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
            <Sparkles size={14} style={{ color: 'var(--pirate-gold)' }} />
            Timeline & FAQ Modules Ready for Integration
          </span>
        </div>
      </footer>
    </div>
  );
};

export default App;
