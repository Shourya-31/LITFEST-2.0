import React, { useState, useEffect } from 'react';
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
          <span className="brand-primary">LITERATI</span>
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
            href="#schedule"
            className="nav-item"
            id="nav-link-schedule"
            onClick={(e) => handleLink('schedule', e)}
          >
            Schedule
          </a>
          <a
            href="#speakers"
            className="nav-item"
            id="nav-link-speakers"
            onClick={(e) => handleLink('speakers', e)}
          >
            Speakers
          </a>
          <a
            href="#gallery"
            className="nav-item"
            id="nav-link-gallery"
            onClick={(e) => handleLink('gallery', e)}
          >
            Gallery
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
            href="/ContactUs.html"
            className="nav-item"
            id="nav-link-contact"
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
