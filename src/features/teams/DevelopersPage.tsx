import React, { useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Users, Terminal } from 'lucide-react';
import { FestivalNav } from '../home/components/FestivalNav';
import { developersList } from './developerData';
import { DeveloperCard } from './DeveloperCard';
import { FocusCardsContainer } from './FocusCardsContainer';
import './LitfestTeamSection.css';

export const DevelopersPage: React.FC = () => {
  const navigate = useNavigate();
  const [isTransitioningBack, setIsTransitioningBack] = useState(false);

  const handleBackToTeam = useCallback(() => {
    setIsTransitioningBack(true);
    setTimeout(() => {
      navigate('/team');
    }, 350);
  }, [navigate]);

  return (
    <div
      className={`litfest-team-page-root developers-page-viewport ${
        isTransitioningBack ? 'transitioning-to-team' : 'entering-developers'
      }`}
    >
      {/* Global Navbar */}
      <FestivalNav
        onRegisterClick={() => navigate('/signup')}
        onNavClick={(sec) => {
          if (sec === 'home') navigate('/');
          else if (sec === 'team') handleBackToTeam();
          else if (sec === 'arcade' || sec === '3d') navigate('/?destination=arcade');
          else if (sec === 'about') navigate('/?destination=about');
          else if (sec === 'timeline') navigate('/?destination=timeline');
          else if (sec === 'sponsors') navigate('/?destination=sponsors');
          else if (sec === 'faq') navigate('/?destination=faq');
          else navigate(`/?destination=${sec}`);
        }}
        activeSection="team"
      />

      <main className="litfest-team-section" role="main" aria-label="Litfest 2.0 Developers">
        {/* Ocean Ambient Glows and Cyber Bioluminescence */}
        <div className="team-ambient-canvas" aria-hidden="true">
          <div className="team-wave-glow glow-1 glow-devs-1" />
          <div className="team-wave-glow glow-2 glow-devs-2" />
          <div className="team-particles-overlay" />
        </div>

        {/* Page Header */}
        <header className="team-section-header">
          {/* Back to Our Team Navigation */}
          <div className="team-back-nav-container">
            <button
              type="button"
              onClick={handleBackToTeam}
              className="back-to-team-btn"
              title="Return to Our Team page"
              id="back-to-team-header-btn"
            >
              <ArrowLeft size={15} />
              <span>Back to Our Team</span>
              <Users size={14} className="team-inline-icon" />
            </button>
          </div>

          <div className="team-badge-pill">
            <Terminal size={12} className="badge-terminal-icon" />
            <span>Digital Architecture &amp; Experience Engine</span>
            <span className="team-badge-dot" />
          </div>

          <h1 className="team-main-title">THE MINDS BEHIND THE EXPERIENCE</h1>

          <p className="team-main-subtitle">
            Meet the developers who brought the digital world of Literati to life.
          </p>
        </header>

        {/* All 10 Developer Cards Rendered Fully in Clean Responsive Focus Grid */}
        <div className="developers-cards-container">
          <FocusCardsContainer className="team-cards-grid grid-cols-developers">
            {developersList.map((developer, index) => (
              <DeveloperCard
                key={developer.id}
                developer={developer}
                index={index}
              />
            ))}
          </FocusCardsContainer>
        </div>

        {/* Floating Action: Back to Our Team */}
        <aside aria-label="Developer Navigation Controls" className="team-floating-actions">
          <button
            type="button"
            onClick={handleBackToTeam}
            aria-label="Back to Our Team"
            title="Return to Our Team page"
            className="floating-action-btn back-team-float-btn"
            id="floating-back-team-btn"
          >
            <ArrowLeft size={16} />
            <span className="floating-btn-text">Back to Our Team</span>
            <Users size={14} className="team-inline-icon" />
          </button>
        </aside>
      </main>
    </div>
  );
};

export default DevelopersPage;
