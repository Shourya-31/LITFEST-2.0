import React, { useState } from 'react';
import { Compass, HelpCircle, Sparkles, Menu, X, Waves } from 'lucide-react';
import { soundEngine } from '../../utils/soundEngine';

interface NavbarProps {
  currentSection?: 'home' | 'timeline' | 'faq';
  onNavigateHome?: () => void;
  onNavigateTimeline?: () => void;
  onOpenFaq?: () => void;
  onOpenArenas?: () => void;
  onOpenRegister?: () => void;
  isFaqOpen?: boolean;
  isAudioPlaying?: boolean;
  onToggleAudio?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentSection = 'home',
  onNavigateHome,
  onNavigateTimeline,
  onOpenFaq,
  onOpenArenas,
  onOpenRegister,
  isFaqOpen = false,
  isAudioPlaying = false,
  onToggleAudio,
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

        {/* Center Navigation Links */}
        <nav className="desktop-nav nav-links-menu" aria-label="Main Navigation">
          <button
            type="button"
            className={`nav-item nav-link-btn interactive ${currentSection === 'home' && !isFaqOpen ? 'active' : ''}`}
            onClick={handleHomeClick}
            id="nav-link-home"
          >
            <Waves size={14} className="nav-icon" />
            <span>Home</span>
          </button>

          <button
            type="button"
            className={`nav-item nav-link-btn interactive ${currentSection === 'timeline' && !isFaqOpen ? 'active' : ''}`}
            onClick={handleTimelineClick}
            id="nav-link-timeline"
          >
            <Compass size={14} className="nav-icon" />
            <span>Timeline</span>
          </button>

          <button
            type="button"
            className={`nav-item nav-link-btn interactive ${isFaqOpen ? 'active' : ''}`}
            onClick={handleFaqClick}
            id="nav-link-faqs"
          >
            <HelpCircle size={14} className="nav-icon" />
            <span>Festival FAQs</span>
          </button>

          <button
            type="button"
            className="nav-item nav-link-btn interactive"
            onClick={handleArenasClick}
            id="nav-link-arenas"
          >
            <Sparkles size={14} className="nav-icon" />
            <span>Arenas</span>
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
            <Waves size={18} />
            <span>Home</span>
          </button>

          <button
            type="button"
            className="mobile-nav-link"
            onClick={handleTimelineClick}
          >
            <Compass size={18} />
            <span>Timeline</span>
          </button>

          <button
            type="button"
            className="mobile-nav-link"
            onClick={handleFaqClick}
          >
            <HelpCircle size={18} />
            <span>Festival FAQs</span>
          </button>

          <button
            type="button"
            className="mobile-nav-link"
            onClick={handleArenasClick}
          >
            <Sparkles size={18} />
            <span>Featured Arenas</span>
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
