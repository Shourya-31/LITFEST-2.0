import React, { useState } from 'react';
import { Compass, HelpCircle, Menu, X } from 'lucide-react';
import { soundEngine } from '../../utils/soundEngine';

interface NavbarProps {
  onOpenFaq?: () => void;
  onOpenTimeline?: () => void;
  isFaqOpen?: boolean;
}

export const Navbar: React.FC<NavbarProps> = ({
  onOpenFaq,
  onOpenTimeline,
  isFaqOpen = false
}) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState<boolean>(false);

  const handleTimelineClick = () => {
    soundEngine.playDroplet();
    setMobileMenuOpen(false);
    if (onOpenTimeline) onOpenTimeline();
  };

  const handleFaqClick = () => {
    soundEngine.playDroplet();
    setMobileMenuOpen(false);
    if (onOpenFaq) onOpenFaq();
  };

  return (
    <header className="nautical-navbar is-scrolled">
      <div className="navbar-container">
        {/* Brand: Clean Typography (No fest logo for now as requested) */}
        <div className="nav-brand interactive" onClick={handleTimelineClick}>
          <div className="brand-text">
            <span className="brand-title">LITFEST 2.0</span>
            <span className="brand-subtitle">[OFFICIAL FESTIVAL PORTAL]</span>
          </div>
        </div>

        {/* Links to Timeline & FAQ */}
        <nav className="desktop-nav" aria-label="Main Navigation">
          <button
            type="button"
            className={`nav-link-btn interactive ${!isFaqOpen ? 'active' : ''}`}
            onClick={handleTimelineClick}
          >
            <Compass size={15} />
            <span>Timeline</span>
          </button>

          <button
            type="button"
            className={`nav-link-btn interactive ${isFaqOpen ? 'active' : ''}`}
            onClick={handleFaqClick}
          >
            <HelpCircle size={15} />
            <span>Festival FAQs</span>
          </button>
        </nav>

        {/* Mobile menu toggle */}
        <div className="nav-actions">
          <button
            type="button"
            className="mobile-toggle-btn interactive"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label="Toggle navigation menu"
          >
            {mobileMenuOpen ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="mobile-nav-drawer">
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
        </div>
      )}
    </header>
  );
};
