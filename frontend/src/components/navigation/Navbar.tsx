import React, { useState } from 'react';
import { soundEngine } from '../../utils/soundEngine';

interface NavbarProps {
  currentSection?: 'home' | 'timeline' | 'about' | 'arcade';
  onNavigateHome?: () => void;
  onNavigateTimeline?: () => void;
  onNavigateAbout?: () => void;
  onNavigateArcade?: () => void;
  onOpenFaq?: () => void;
  onOpenArenas?: () => void;
  onOpenRegister?: () => void;
  isFaqOpen?: boolean;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentSection = 'home',
  onNavigateHome,
  onNavigateTimeline,
  onNavigateAbout,
  onNavigateArcade,
  onOpenFaq,
  onOpenArenas,
  onOpenRegister,
  isFaqOpen = false,
}) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState<boolean>(false);

  const handleHomeClick = (e: React.MouseEvent) => {
    e.preventDefault();
    soundEngine.playDroplet();
    setMobileMenuOpen(false);
    if (onNavigateHome) onNavigateHome();
  };

  const handleTimelineClick = (e: React.MouseEvent) => {
    e.preventDefault();
    soundEngine.playDroplet();
    setMobileMenuOpen(false);
    if (onNavigateTimeline) onNavigateTimeline();
  };

  const handleAboutClick = (e: React.MouseEvent) => {
    e.preventDefault();
    soundEngine.playDroplet();
    setMobileMenuOpen(false);
    if (onNavigateAbout) onNavigateAbout();
  };

  const handleArcadeClick = (e: React.MouseEvent) => {
    e.preventDefault();
    soundEngine.playDroplet();
    setMobileMenuOpen(false);
    if (onNavigateArcade) onNavigateArcade();
  };

  const handleFaqClick = (e: React.MouseEvent) => {
    e.preventDefault();
    soundEngine.playDroplet();
    setMobileMenuOpen(false);
    if (onOpenFaq) onOpenFaq();
  };

  const handleArenasClick = (e: React.MouseEvent) => {
    e.preventDefault();
    soundEngine.playDroplet();
    setMobileMenuOpen(false);
    if (onOpenArenas) onOpenArenas();
  };

  const handleRegisterClick = (e: React.MouseEvent) => {
    e.preventDefault();
    soundEngine.playDroplet();
    setMobileMenuOpen(false);
    if (onOpenRegister) onOpenRegister();
  };

  return (
    <header className="festival-nav-header nautical-navbar" role="banner">
      <div className="nav-inner-container navbar-container">
        {/* Brand: Official Literati • NIT Raipur Logo from underwater homepage */}
        <a
          href="#home"
          className="nav-brand-logo interactive"
          id="nav-brand-logo"
          onClick={handleHomeClick}
          title="Litfest 2.0 — Return to Ocean Surface"
        >
          <span className="brand-primary">LITERATI</span>
          <span className="brand-dot">•</span>
          <span className="brand-secondary">NIT RAIPUR</span>
        </a>

        {/* Center Navigation Links (Pure Floating Text) */}
        <nav className="desktop-nav nav-links-menu" aria-label="Main Navigation">
          <button
            type="button"
            className={`nav-item nav-link-btn interactive ${currentSection === 'home' && !isFaqOpen ? 'active' : ''}`}
            onClick={handleHomeClick}
            id="nav-link-home"
          >
            <span>Home</span>
          </button>

          <button
            type="button"
            className={`nav-item nav-link-btn interactive ${currentSection === 'timeline' && !isFaqOpen ? 'active' : ''}`}
            onClick={handleTimelineClick}
            id="nav-link-timeline"
          >
            <span>Timeline</span>
          </button>

          <button
            type="button"
            className={`nav-item nav-link-btn interactive ${currentSection === 'about' ? 'active' : ''}`}
            onClick={handleAboutClick}
            id="nav-link-about"
          >
            <span>About</span>
          </button>

          <button
            type="button"
            className={`nav-item nav-link-btn interactive ${currentSection === 'arcade' ? 'active' : ''}`}
            onClick={handleArcadeClick}
            id="nav-link-arcade"
          >
            <span>Arcade</span>
          </button>

          <button
            type="button"
            className={`nav-item nav-link-btn interactive ${isFaqOpen ? 'active' : ''}`}
            onClick={handleFaqClick}
            id="nav-link-faqs"
          >
            <span>Festival FAQs</span>
          </button>

          <button
            type="button"
            className="nav-item nav-link-btn interactive"
            onClick={handleArenasClick}
            id="nav-link-events"
          >
            <span>Events</span>
          </button>
        </nav>

        {/* Right Actions: Register CTA & Mobile Menu */}
        <div className="nav-right-actions">
          <button
            type="button"
            className="nav-register-btn desktop-register interactive"
            onClick={handleRegisterClick}
            id="nav-register-btn"
          >
            <span>Register</span>
          </button>

          {/* Mobile hamburger toggle */}
          <button
            type="button"
            className={`mobile-menu-toggle ${mobileMenuOpen ? 'open' : ''}`}
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label="Toggle navigation menu"
            id="nav-mobile-toggle"
          >
            <span className="bar" />
            <span className="bar" />
            <span className="bar" />
          </button>
        </div>
      </div>

      {/* Responsive Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="mobile-nav-drawer mobile-active">
          <button
            type="button"
            className="mobile-nav-link"
            onClick={handleHomeClick}
          >
            <span>Home</span>
          </button>

          <button
            type="button"
            className="mobile-nav-link"
            onClick={handleTimelineClick}
          >
            <span>Timeline</span>
          </button>

          <button
            type="button"
            className="mobile-nav-link"
            onClick={handleAboutClick}
          >
            <span>About</span>
          </button>

          <button
            type="button"
            className="mobile-nav-link"
            onClick={handleArcadeClick}
          >
            <span>Arcade</span>
          </button>

          <button
            type="button"
            className="mobile-nav-link"
            onClick={handleFaqClick}
          >
            <span>Festival FAQs</span>
          </button>

          <button
            type="button"
            className="mobile-nav-link"
            onClick={handleArenasClick}
          >
            <span>Events</span>
          </button>

          <button
            type="button"
            className="nav-register-btn mobile-register"
            onClick={handleRegisterClick}
          >
            Register for Litfest
          </button>
        </div>
      )}
    </header>
  );
};

export default Navbar;
