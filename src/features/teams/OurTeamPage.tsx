import React, { useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { ZoomIn, Sparkles, ChevronUp } from 'lucide-react';
import { FestivalNav } from '../home/components/FestivalNav';
import { teamSectionsHierarchy } from './teamData';
import { TeamSection } from './TeamSection';
import './LitfestTeamSection.css';

export const OurTeamPage: React.FC = () => {
  const navigate = useNavigate();
  const [isTransitioningToDevs, setIsTransitioningToDevs] = useState(false);

  const totalTiers = teamSectionsHierarchy.length;

  const handleZoomInToDevelopers = useCallback(() => {
    setIsTransitioningToDevs(true);
    // Smooth cinematic camera acceleration into developers page
    setTimeout(() => {
      navigate('/developers');
    }, 400);
  }, [navigate]);

  const scrollToTop = useCallback(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  return (
    <div
      className={`litfest-team-page-root ${
        isTransitioningToDevs ? 'transitioning-to-developers' : ''
      }`}
    >
      {/* Global Navbar with Our Team link active */}
      <FestivalNav
        onRegisterClick={() => navigate('/signup')}
        onNavClick={(sec) => {
          if (sec === 'home') navigate('/');
          else if (sec === 'team') scrollToTop();
          else if (sec === 'arcade' || sec === '3d') navigate('/?destination=arcade');
          else if (sec === 'about') navigate('/?destination=about');
          else if (sec === 'timeline') navigate('/?destination=timeline');
          else if (sec === 'sponsors') navigate('/?destination=sponsors');
          else if (sec === 'faq') navigate('/?destination=faq');
          else navigate(`/?destination=${sec}`);
        }}
        activeSection="team"
      />

      <main className="litfest-team-section" role="main" aria-label="Litfest 2.0 Our Team">
        {/* Ocean Ambient Glows and Bioluminescent Beams */}
        <div className="team-ambient-canvas" aria-hidden="true">
          <div className="team-wave-glow glow-1" />
          <div className="team-wave-glow glow-2" />
          <div className="team-particles-overlay" />
        </div>

        {/* Page Header */}
        <header className="team-section-header">
          <div className="team-badge-pill">
            <span className="team-badge-dot" />
            <span>Litfest 2026 Collective</span>
            <span className="team-badge-dot" />
          </div>

          <h1 className="team-main-title">MEET OUR TEAM</h1>

          <p className="team-main-subtitle">
            The minds, creativity and people behind Literati.
          </p>

          {/* Zoom In Option to Open Developers Page */}
          <div className="team-header-actions">
            <button
              type="button"
              onClick={handleZoomInToDevelopers}
              className="team-devs-link-btn"
              title="Zoom In to open the Developers page"
              id="zoom-in-devs-header-btn"
            >
              <ZoomIn size={16} />
              <span>Zoom In: Meet the Developers</span>
              <span className="team-devs-count-badge">10</span>
              <Sparkles size={14} className="sparkle-icon" />
            </button>
          </div>
        </header>

        {/* All 7 Designation Sections Rendered Continuously in Strict Hierarchy Order */}
        <div className="team-sections-stack">
          {teamSectionsHierarchy.map((section, index) => (
            <TeamSection
              key={section.role}
              section={section}
              tierIndex={index}
              totalTiers={totalTiers}
            />
          ))}
        </div>

        {/* Floating Zoom Controls: Zoom In (+) to Developers & Return to Top */}
        <aside aria-label="Team Navigation Controls" className="team-floating-actions">
          <button
            type="button"
            onClick={scrollToTop}
            aria-label="Scroll back to top"
            title="Scroll to top"
            className="floating-action-btn scroll-top-btn"
          >
            <ChevronUp size={16} />
            <span className="floating-btn-text">Top</span>
          </button>

          <button
            type="button"
            onClick={handleZoomInToDevelopers}
            aria-label="Zoom In (+) to open Developers page"
            title="Zoom In (+) to open Developers page"
            className="floating-action-btn zoom-in-developers-btn"
            id="floating-zoom-in-btn"
          >
            <ZoomIn size={16} />
            <span className="floating-btn-text">Zoom In (+)</span>
            <span className="floating-dev-count">Developers</span>
          </button>
        </aside>
      </main>
    </div>
  );
};

export default OurTeamPage;
