import React, { useState, useEffect } from 'react';
import { useAuth } from '../../../state/AuthContext';
import { AuthNavWidget } from '../../../components/navigation/AuthNavWidget';
import litfestLogo from '../../../assets/media/litfest-logo-transparent.png';
import './FestivalNav.css';

interface FestivalNavProps {
  onRegisterClick?: () => void;
  onNavClick?: (section: string) => void;
  activeSection?: string;
  isScrolled?: boolean;
}

export const FestivalNav: React.FC<FestivalNavProps> = ({
  onRegisterClick,
  onNavClick,
  activeSection = 'home',
  isScrolled: controlledScrolled,
}) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [internalScrolled, setInternalScrolled] = useState(false);
  const { isAuthenticated } = useAuth();

  useEffect(() => {
    const handleScroll = () => {
      setInternalScrolled(window.scrollY > 40);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const isScrolled = controlledScrolled !== undefined ? controlledScrolled : internalScrolled;

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
            href="#home"
            className={`nav-item ${activeSection === 'home' ? 'active' : ''}`}
            id="nav-link-home"
            onClick={(e) => handleLink('home', e)}
          >
            Home
          </a>
          <a
            href="#arcade"
            className={`nav-item nav-item-3d ${activeSection === 'arcade' || activeSection === '3d' ? 'active' : ''}`}
            id="nav-link-arcade"
            onClick={(e) => handleLink('arcade', e)}
          >
            <span className="nav-3d-badge">3D</span>
            Arcade &amp; Games
          </a>
          <a
            href="#about"
            className={`nav-item ${activeSection === 'about' ? 'active' : ''}`}
            id="nav-link-about"
            onClick={(e) => handleLink('about', e)}
          >
            About
          </a>
          <a
            href="#timeline"
            className={`nav-item ${activeSection === 'timeline' ? 'active' : ''}`}
            id="nav-link-timeline"
            onClick={(e) => handleLink('timeline', e)}
          >
            Timeline &amp; Events
          </a>
          <a
            href="#sponsors"
            className={`nav-item ${activeSection === 'sponsors' ? 'active' : ''}`}
            id="nav-link-sponsors"
            onClick={(e) => handleLink('sponsors', e)}
          >
            Sponsors
          </a>
          <a
            href="#faq"
            className={`nav-item ${activeSection === 'faq' ? 'active' : ''}`}
            id="nav-link-faq"
            onClick={(e) => handleLink('faq', e)}
          >
            FAQ
          </a>

          {/* Conditional drawer links based on auth state */}
          {!isAuthenticated ? (
            <button
              type="button"
              className="nav-register-btn mobile-register"
              onClick={onRegisterClick}
            >
              Register
            </button>
          ) : (
            <a
              href="/dashboard"
              className="nav-item"
              id="nav-link-dashboard"
            >
              Dashboard
            </a>
          )}
        </nav>

        {/* Right: Auth Action Widget & Mobile Toggle */}
        <div className="nav-right-actions">
          <AuthNavWidget onRegisterClick={onRegisterClick} />

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
