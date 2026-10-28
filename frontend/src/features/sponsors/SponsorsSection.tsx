import React from 'react';
import { Mail, ExternalLink } from 'lucide-react';
import nitrrLogo from '../../assets/media/nitrr_new_logo_new.png';
import sbiLogo from '../../assets/media/SBI-Logo.png';
import './SponsorsSection.css';

interface SponsorsSectionProps {
  id?: string;
  onAscendClick?: () => void;
  onContactClick?: () => void;
}

export const SponsorsSection: React.FC<SponsorsSectionProps> = ({
  id = 'sponsors',
  onAscendClick,
  onContactClick,
}) => {
  return (
    <section id={id} className="sponsors-section" aria-label="Our Sponsors">
      {/* Background ambient lighting matching About & ocean theme */}
      <div className="ocean-ambient-canvas" aria-hidden="true">
        <div className="ocean-wave-glow glow-1" />
        <div className="ocean-wave-glow glow-2" />
      </div>

      <div className="sponsors-container">
        {/* Section Heading matching About styling */}
        <div className="sponsors-header">
          <h2 className="sponsors-title">Our Sponsors</h2>
          <p className="sponsors-subtitle">
            Honoring our esteemed patron institutions and partners whose dedication powers
            the literary voyage, debates, and creative excellence of Litfest 2.0.
          </p>
        </div>

        {/* Sponsor Cards Grid (NIT Raipur & SBI Bank from sponsors.html) */}
        <div className="sponsors-grid">
          {/* Sponsor 1: NIT Raipur */}
          <div
            className="sponsor-card"
            role="link"
            aria-label="NIT Raipur Sponsor Card - Open official portal"
            tabIndex={0}
            onClick={() => window.open('https://www.nitrr.ac.in', '_blank', 'noopener,noreferrer')}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                window.open('https://www.nitrr.ac.in', '_blank', 'noopener,noreferrer');
              }
            }}
          >
            <div className="sponsor-badge-wrap">
              <span className="sponsor-role-badge">Patron &amp; Host Institute</span>
              <span className="sponsor-status-chip">
                <span>Academic Partner</span>
                <ExternalLink size={11} className="sponsor-ext-icon" aria-hidden="true" />
              </span>
            </div>

            <div className="sponsor-logo-box" aria-label="National Institute of Technology Raipur Official Emblem">
              <img
                src={nitrrLogo}
                alt="NIT Raipur Official Emblem"
                className="sponsor-logo-img"
                width="150"
                height="150"
                loading="lazy"
                decoding="async"
              />
            </div>

            <div className="sponsor-content">
              <h3 className="sponsor-name">NIT RAIPUR</h3>
              <p className="sponsor-tagline">National Institute of Technology Raipur</p>
              <p className="sponsor-desc">
                An Institution of National Importance, championing academic eminence, technological
                innovation, and holistic literary culture through Literati.
              </p>
            </div>
          </div>

          {/* Sponsor 2: SBI Bank */}
          <div
            className="sponsor-card"
            role="link"
            aria-label="SBI Bank Sponsor Card - Open official portal"
            tabIndex={0}
            onClick={() => window.open('https://sbi.bank.in/', '_blank', 'noopener,noreferrer')}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                window.open('https://sbi.bank.in/', '_blank', 'noopener,noreferrer');
              }
            }}
          >
            <div className="sponsor-badge-wrap">
              <span className="sponsor-role-badge">Official Banking Partner</span>
              <span className="sponsor-status-chip">
                <span>Title Partner</span>
                <ExternalLink size={11} className="sponsor-ext-icon" aria-hidden="true" />
              </span>
            </div>

            <div className="sponsor-logo-box" aria-label="State Bank of India Official Logo">
              <img
                src={sbiLogo}
                alt="State Bank of India Official Logo"
                className="sponsor-logo-img"
                width="220"
                height="120"
                loading="lazy"
                decoding="async"
              />
            </div>

            <div className="sponsor-content">
              <h3 className="sponsor-name">SBI BANK</h3>
              <p className="sponsor-tagline">State Bank of India &bull; The Banker to Every Indian</p>
              <p className="sponsor-desc">
                India’s largest and most trusted financial institution, actively empowering youth
                advancement, student entrepreneurship, and collegiate festivals.
              </p>
            </div>
          </div>
        </div>

        {/* Navigation Action Buttons */}
        {(onAscendClick || onContactClick) && (
          <div className="sponsors-surface-wrap">
            {onContactClick && (
              <button
                type="button"
                className="sponsors-surface-btn sponsors-contact-btn"
                onClick={onContactClick}
                title="Open FAQ & Contact Chamber"
                aria-label="Contact organizing committee"
              >
                <Mail size={14} aria-hidden="true" />
                <span>Contact Committee</span>
              </button>
            )}
            {onAscendClick && (
              <button
                type="button"
                className="sponsors-surface-btn sponsors-top-btn"
                onClick={onAscendClick}
                title="Return to Litfest 2.0 Surface (0m)"
                aria-label="Back to top"
              >
                <svg viewBox="0 0 20 20" width="14" height="14" fill="currentColor" aria-hidden="true">
                  <path
                    fillRule="evenodd"
                    d="M14.707 12.707a1 1 0 01-1.414 0L10 9.414l-3.293 3.293a1 1 0 01-1.414-1.414l4-4a1 1 0 011.414 0l4 4a1 1 0 010 1.414z"
                    clipRule="evenodd"
                  />
                </svg>
                <span>Back to Top</span>
              </button>
            )}
          </div>
        )}
      </div>
    </section>
  );
};

export default SponsorsSection;
