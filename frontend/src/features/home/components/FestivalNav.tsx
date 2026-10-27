import React, { useState, useEffect } from 'react';
import litfestLogo from '../../../assets/media/litfest-logo-transparent.png';
import './FestivalNav.css';

interface FestivalNavProps {
  onRegisterClick?: () => void;
  onNavClick?: (section: string) => void;
}

export const FestivalNav: React.FC<FestivalNavProps> = ({
  onRegisterClick,
  onNavClick,
}) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 40);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleLink = (section: string, e: React.MouseEvent) => {
    e.preventDefault();
    setMobileMenuOpen(false);
    if (onNavClick) {
      onNavClick(section);
    }
  };

  return (
    <header className={`festival-nav-header ${isScrolled ? 'nav-scrolled' : ''}`} role="banner">
      <div className="nav-inner-container">
        {/* Left: Brand Identity (Clicking returns to top of page) */}
        <a
          href="#home"
          className="nav-brand-logo"
          id="nav-brand-logo"
          onClick={(e) => handleLink('home', e)}
          title="Return to Litfest 2.0 Surface"
        >
          <img
            src={litfestLogo}
            alt="LITFEST 2.0"
            className="nav-brand-img"
          />
        </a>

        {/* Center: Navigation Links */}
        <nav
          className={`nav-links-menu ${mobileMenuOpen ? 'mobile-active' : ''}`}
          role="navigation"
          aria-label="Main Navigation"
        >
          <a
            href="#events"
            className="nav-item"
            id="nav-link-events"
            onClick={(e) => handleLink('events', e)}
          >
            Events
          </a>
          <a
            href="#arcade"
            className="nav-item"
            id="nav-link-arcade"
            onClick={(e) => handleLink('arcade', e)}
          >
            Arcade
          </a>
          <a
            href="#3d"
            className="nav-item nav-item-3d"
            id="nav-link-3d"
            onClick={(e) => handleLink('3d', e)}
          >
            <span className="nav-3d-badge">3D</span>
            Voyage
          </a>
          <a
            href="#about"
            className="nav-item"
            id="nav-link-about"
            onClick={(e) => handleLink('about', e)}
          >
            About
          </a>
          <a
            href="#sponsors"
            className="nav-item"
            id="nav-link-sponsors"
            onClick={(e) => handleLink('sponsors', e)}
          >
            Sponsors
          </a>
          <a
            href="#faq"
            className="nav-item"
            id="nav-link-faq"
            onClick={(e) => handleLink('faq', e)}
          >
            FAQ
          </a>
          <a
            href="#contact"
            className="nav-item"
            id="nav-link-contact"
            onClick={(e) => handleLink('contact', e)}
          >
            Contact
          </a>

          {/* Mobile-only register button in drawer */}
          <button
            type="button"
            className="nav-register-btn mobile-register"
            onClick={onRegisterClick}
          >
            Register
          </button>
        </nav>

        {/* Right: Registration CTA & Mobile Toggle */}
        <div className="nav-right-actions">
          <button
            type="button"
            className="nav-register-btn desktop-register"
            onClick={onRegisterClick}
            id="nav-register-btn"
          >
            <span>Register</span>
          </button>

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
    </header>
  );
};
