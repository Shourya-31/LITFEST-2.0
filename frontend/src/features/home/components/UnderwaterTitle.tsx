import React from 'react';
import './UnderwaterTitle.css';

interface UnderwaterTitleProps {
  onExploreClick?: () => void;
  onDescendClick?: () => void;
}

export const UnderwaterTitle: React.FC<UnderwaterTitleProps> = ({
  onExploreClick,
  onDescendClick,
}) => {
  return (
    <div className="underwater-title-wrapper">
      <div className="title-content-flow">
        {/* Luminous water tendril filigree overlay framing the title naturally */}
        <div className="title-tendrils-container" aria-hidden="true">
          <svg
            className="tendrils-svg"
            viewBox="0 0 680 160"
            fill="none"
            preserveAspectRatio="xMidYMid meet"
          >
            <defs>
              <linearGradient id="whisperCyan" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#38bdf8" stopOpacity="0" />
                <stop offset="30%" stopColor="#38bdf8" stopOpacity="0.75" />
                <stop offset="70%" stopColor="#7dd3fc" stopOpacity="0.85" />
                <stop offset="100%" stopColor="#38bdf8" stopOpacity="0" />
              </linearGradient>
              <linearGradient id="glowGleam" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#a5f3fc" stopOpacity="0" />
                <stop offset="50%" stopColor="#e0f2fe" stopOpacity="0.9" />
                <stop offset="100%" stopColor="#38bdf8" stopOpacity="0" />
              </linearGradient>
            </defs>

            {/* Graceful flowing aquatic tendrils curving around the text */}
            <path
              className="tendril-curve curve-1"
              d="M 40,80 Q 140,25 280,75 T 520,70 Q 600,60 640,90"
              stroke="url(#whisperCyan)"
              strokeWidth="1.5"
              strokeLinecap="round"
            />
            <path
              className="tendril-curve curve-2"
              d="M 80,105 Q 220,135 340,90 T 580,100 Q 620,110 650,85"
              stroke="url(#glowGleam)"
              strokeWidth="1.2"
              strokeLinecap="round"
            />
            <path
              className="tendril-curve curve-3"
              d="M 120,65 Q 200,95 320,60 T 480,85"
              stroke="url(#whisperCyan)"
              strokeWidth="1"
              strokeLinecap="round"
            />
            {/* Luminous water orb accent */}
            <circle cx="270" cy="55" r="3.5" fill="#e0f2fe" className="water-orb" />
          </svg>
        </div>

        {/* PRIMARY UNBOXED DISPLAY TITLE */}
        <h1 className="ocean-litfest-title">
          <span className="title-letter-glimmer">LITFEST</span>
        </h1>

        {/* 2.0 EDITION DIVIDER (NO BOX, PURE TYPOGRAPHY & DIVIDER) */}
        <div className="edition-line">
          <span className="accent-bar left-bar" />
          <div className="edition-text-wrapper">
            <span className="edition-number">2.0</span>
          </div>
          <span className="accent-bar right-bar" />
        </div>


        {/* PRIMARY CALL TO ACTION BUTTON */}
        <div className="hero-action-buttons">
          <button
            type="button"
            className="ocean-cta explore-btn"
            onClick={onExploreClick}
            id="hero-explore-btn"
          >
            <span>Explore Events</span>
            <svg
              className="cta-chevron"
              viewBox="0 0 20 20"
              width="18"
              height="18"
              fill="currentColor"
            >
              <path
                fillRule="evenodd"
                d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z"
                clipRule="evenodd"
              />
            </svg>
          </button>
        </div>

      </div>

      {/* Downward indicator inviting deeper exploration (Anchored at very bottom) */}
      <button
        type="button"
        className="scroll-invitation"
        onClick={onDescendClick}
        aria-label="Descend to Sunken Arcade and 3D Voyage section"
        id="hero-descend-btn"
      >
        <span className="scroll-caption">DESCEND</span>
        <svg
          className="scroll-arrow"
          viewBox="0 0 24 24"
          width="18"
          height="18"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M7 10l5 5 5-5" />
        </svg>
      </button>
    </div>
  );
};
