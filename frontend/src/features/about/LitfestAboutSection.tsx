import React from 'react';
import { AboutOceanAtmosphere } from './components/AboutOceanAtmosphere';
import { DistantShipwreck } from './components/DistantShipwreck';
import { LanternFish } from './components/LanternFish';
import { WhaleAndCalf } from './components/WhaleAndCalf';
import './LitfestAboutSection.css';

interface LitfestAboutSectionProps {
  id?: string;
  onExploreEvents?: () => void;
  onRegisterClick?: () => void;
  onAscendClick?: () => void;
}

export const LitfestAboutSection: React.FC<LitfestAboutSectionProps> = ({
  id = 'about',
  onAscendClick,
}) => {
  return (
    <section id={id} className="about-deep-section" aria-label="About Litfest 2.0">
      {/* 1. BLUE PULSE Ocean Atmosphere (Bubbles, Particles, Fish School, Kelp Fronds, God Rays) */}
      <AboutOceanAtmosphere />

      {/* 2. Distant Shipwreck with Faint Seabed Contour (Soft background discovery in middle-left) */}
      <DistantShipwreck />

      {/* 3. Whale and Calf Pod (Majestic animated silhouettes gliding through background) */}
      <WhaleAndCalf />

      {/* 4. Luminous Lanternfish with Searching Glowing Lure (Small detail in bottom-right) */}
      <LanternFish />

      {/* 5. Centered, Balanced Editorial Composition */}
      <div className="about-centered-content">
        {/* Main Heading */}
        <h2 className="about-main-title">About LITFEST</h2>

        {/* Subtitle */}
        <p className="about-subtitle">
          A celebration of literature, imagination, and creative energy.
        </p>

        {/* Introductory Description */}
        <p className="about-intro-description">
          LITFEST returns for its second edition under <strong>BLUE PULSE</strong>, bringing together
          literature, debate, creativity, and diplomacy in a deeper, more exciting experience. Here,
          words become waves, ideas create currents, and every voice leaves a ripple.
        </p>

        {/* Three Feature Cards in a Single Row (All with consistent, understated default styling) */}
        <div className="about-feature-cards-grid">
          {/* Card 1: INSPIRE */}
          <div className="feature-card" tabIndex={0} role="region" aria-label="Inspire">
            <div className="feature-icon-wrap" aria-hidden="true">
              <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M12 2a7 7 0 00-7 7c0 2.38 1.19 4.47 3 5.74V17a1 1 0 001 1h6a1 1 0 001-1v-2.26c1.81-1.27 3-3.36 3-5.74a7 7 0 00-7-7z" strokeLinecap="round" strokeLinejoin="round" />
                <path d="M9 21h6" strokeLinecap="round" />
              </svg>
            </div>
            <h3 className="feature-title">INSPIRE</h3>
            <p className="feature-desc">
              Discover fresh perspectives through literature, debate, and thought-provoking challenges.
            </p>
          </div>

          {/* Card 2: CREATE (Consistent default styling, no persistent glow) */}
          <div className="feature-card" tabIndex={0} role="region" aria-label="Create">
            <div className="feature-icon-wrap" aria-hidden="true">
              <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M12 19l7-7 3 3-7 7-3-3z" />
                <path d="M18 13l-1.5-7.5L2 2l3.5 14.5L13 18l5-5z" strokeLinecap="round" strokeLinejoin="round" />
                <path d="M2 2l7.586 7.586" strokeLinecap="round" strokeLinejoin="round" />
                <circle cx="11" cy="11" r="2" />
              </svg>
            </div>
            <h3 className="feature-title">CREATE</h3>
            <p className="feature-desc">
              Explore new ideas, express yourself, and take on creative experiences across the festival.
            </p>
          </div>

          {/* Card 3: CONNECT */}
          <div className="feature-card" tabIndex={0} role="region" aria-label="Connect">
            <div className="feature-icon-wrap" aria-hidden="true">
              <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2" strokeLinecap="round" strokeLinejoin="round" />
                <circle cx="9" cy="7" r="4" />
                <path d="M23 21v-2a4 4 0 00-3-3.87" strokeLinecap="round" strokeLinejoin="round" />
                <path d="M16 3.13a4 4 0 010 7.75" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </div>
            <h3 className="feature-title">CONNECT</h3>
            <p className="feature-desc">
              Meet curious minds, exchange perspectives, and find your place in a community of ideas.
            </p>
          </div>
        </div>

        {/* Festival Statistics in a Single Row */}
        <div className="about-stats-container">
          <div className="about-stats-row">
            <div className="stat-unit">
              <div className="stat-value">5</div>
              <div className="stat-name">Days</div>
            </div>

            <div className="stat-unit">
              <div className="stat-value">10+</div>
              <div className="stat-name">Events</div>
            </div>

            <div className="stat-unit">
              <div className="stat-value">1000+</div>
              <div className="stat-name">Participants</div>
            </div>
          </div>
        </div>

        {/* Legacy and New Experiences */}
        <p className="about-legacy-paragraph">
          From the energy of Tube Trolls to the parliamentary proceedings of Lok Sabha and the diplomacy of
          UNHRC, the first edition laid the foundation for a new tradition. Tube Trolls returns, while new
          events promise fresh challenges and unexpected adventures.
        </p>

        {/* Prominent, Centered Closing Message */}
        <div className="about-closing-wrapper">
          <p className="closing-dive-quote">
            &ldquo;Wishing you a happy and safe deep dive into the literary abyss.&rdquo;
          </p>

          {onAscendClick && (
            <button
              type="button"
              className="about-surface-link"
              onClick={onAscendClick}
              title="Return to Upper Surface"
            >
              <svg viewBox="0 0 20 20" width="13" height="13" fill="currentColor">
                <path fillRule="evenodd" d="M14.707 12.707a1 1 0 01-1.414 0L10 9.414l-3.293 3.293a1 1 0 01-1.414-1.414l4-4a1 1 0 011.414 0l4 4a1 1 0 010 1.414z" clipRule="evenodd" />
              </svg>
              <span>Surface</span>
            </button>
          )}
        </div>
      </div>
    </section>
  );
};

export default LitfestAboutSection;
