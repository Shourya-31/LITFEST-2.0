import React, { useState, useEffect } from 'react';
import { Compass, Anchor, HelpCircle, Menu, X } from 'lucide-react';
import { soundEngine } from '../../utils/soundEngine';

export const Navbar: React.FC = () => {
  const [scrolled, setScrolled] = useState<boolean>(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState<boolean>(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 40);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navLinks = [
    { label: '3D Z-Axis Timeline', href: '#timeline', icon: Compass },
    { label: 'Festival FAQs', href: '#faq', icon: HelpCircle }
  ];

  const handleNavClick = (href: string) => {
    soundEngine.playDroplet();
    setMobileMenuOpen(false);
    const target = document.querySelector(href);
    if (target) {
      target.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <header className={`nautical-navbar ${scrolled ? 'is-scrolled' : ''}`}>
      <div className="navbar-container">
        {/* Brand */}
        <a href="#hero" className="nav-brand interactive" onClick={() => soundEngine.playDroplet()}>
          <div className="brand-crest">
            <Anchor size={20} className="brand-anchor" />
          </div>
          <div className="brand-text">
            <span className="brand-title">LITFEST 2.0</span>
            <span className="brand-subtitle">[NAVBAR PLACEHOLDER]</span>
          </div>
        </a>

        {/* Links to Timeline & FAQ */}
        <nav className="desktop-nav" aria-label="Main Navigation">
          {navLinks.map((item, idx) => {
            const Icon = item.icon;
            return (
              <a
                key={idx}
                href={item.href}
                className="nav-link interactive"
                onClick={(e) => {
                  e.preventDefault();
                  handleNavClick(item.href);
                }}
              >
                <Icon size={15} />
                <span>{item.label}</span>
              </a>
            );
          })}
        </nav>

        {/* Action button */}
        <div className="nav-actions">
          <button
            type="button"
            className="nav-cta-btn interactive"
            onClick={() => handleNavClick('#timeline')}
          >
            <span>Timeline</span>
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
          {navLinks.map((item, idx) => {
            const Icon = item.icon;
            return (
              <a
                key={idx}
                href={item.href}
                className="mobile-nav-link"
                onClick={(e) => {
                  e.preventDefault();
                  handleNavClick(item.href);
                }}
              >
                <Icon size={18} />
                <span>{item.label}</span>
              </a>
            );
          })}
        </div>
      )}
    </header>
  );
};
