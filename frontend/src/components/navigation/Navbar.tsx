import React, { useState } from 'react';
import { Compass, Anchor, HelpCircle, Menu, X } from 'lucide-react';
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
        {/* Brand */}
        <div className="nav-brand interactive" onClick={handleTimelineClick}>
          <div className="brand-crest">
            <Anchor size={20} className="brand-anchor" />
          </div>
          <div className="brand-text">
            <span className="brand-title">LITFEST 2.0</span>
            <span className="brand-subtitle">[NAVBAR PLACEHOLDER]</span>
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
            <span>3D Z-Axis Timeline</span>
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

        {/* Action button */}
        <div className="nav-actions">
          <button
            type="button"
            className="nav-cta-btn interactive"
            onClick={isFaqOpen ? handleTimelineClick : handleFaqClick}
          >
            <span>{isFaqOpen ? 'Back to 3D Helm' : 'Open FAQs'}</span>
          </button>

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
            <span>3D Z-Axis Timeline</span>
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
