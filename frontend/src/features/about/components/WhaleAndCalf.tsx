import React from 'react';
import './WhaleAndCalf.css';

export const WhaleAndCalf: React.FC = () => {
  return (
    <div className="about-whale-pod-layer" aria-hidden="true">
      {/* Whale Pod Container (Smooth oceanic transit across the background) */}
      <div className="whale-pod-track">
        {/* 1. Adult Whale (Dominant, graceful swimmer) */}
        <div className="whale-adult-wrapper">
          <svg
            className="whale-adult-svg"
            viewBox="0 0 460 160"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <defs>
              {/* Oceanic gradient fill with rim-lit highlights */}
              <linearGradient id="adultWhaleBodyGrad" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor="#143c65" />
                <stop offset="35%" stopColor="#0b2442" />
                <stop offset="75%" stopColor="#05172d" />
                <stop offset="100%" stopColor="#020d1c" />
              </linearGradient>

              {/* Cyan rim-lighting gradient along dorsal curvature */}
              <linearGradient id="adultWhaleRimGrad" x1="0%" y1="0%" x2="100%" y2="50%">
                <stop offset="0%" stopColor="#38bdf8" stopOpacity="0.8" />
                <stop offset="40%" stopColor="#0ea5e9" stopOpacity="0.6" />
                <stop offset="85%" stopColor="#0284c7" stopOpacity="0.3" />
                <stop offset="100%" stopColor="#0369a1" stopOpacity="0.1" />
              </linearGradient>

              {/* Ventral belly grooving gradient */}
              <linearGradient id="adultVentralGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#38bdf8" stopOpacity="0.25" />
                <stop offset="50%" stopColor="#0284c7" stopOpacity="0.15" />
                <stop offset="100%" stopColor="#0284c7" stopOpacity="0" />
              </linearGradient>
            </defs>

            {/* Main Whale Body Silhouette */}
            <path
              className="whale-main-body"
              d="
                M 32,82
                C 32,66 54,46 95,38
                C 145,28 235,32 305,52
                C 335,61 350,60 358,54
                L 364,48
                C 365,58 372,66 385,72
                C 408,79 432,84 445,86
                C 440,94 415,98 385,98
                C 325,116 235,126 145,120
                C 85,116 48,104 32,82
                Z
              "
              fill="url(#adultWhaleBodyGrad)"
              stroke="url(#adultWhaleRimGrad)"
              strokeWidth="1.4"
            />

            {/* Ventral Pleat / Throat Grooves Texture */}
            <path
              d="
                M 56,86 C 85,96 140,105 210,104
                M 68,92 C 95,101 150,110 225,108
                M 82,98 C 110,107 165,114 235,111
              "
              stroke="url(#adultVentralGrad)"
              strokeWidth="1"
              strokeLinecap="round"
              fill="none"
            />

            {/* Eye Ridge Subtle Accent */}
            <ellipse cx="64" cy="74" rx="2" ry="1.4" fill="#38bdf8" opacity="0.6" />

            {/* Pectoral Fin with Undulation */}
            <path
              className="whale-pectoral-fin"
              d="
                M 160,104
                C 176,122 208,154 228,158
                C 222,150 196,124 182,106
                Z
              "
              fill="#061c36"
              stroke="rgba(56, 189, 248, 0.45)"
              strokeWidth="1"
            />

            {/* Tail Fluke (Animated independently for organic swimming motion) */}
            <g className="whale-tail-group">
              <path
                d="
                  M 440,86
                  C 446,74 458,62 464,58
                  C 460,78 450,88 455,90
                  C 460,92 466,104 460,114
                  C 450,104 442,94 438,90
                  Z
                "
                fill="#082240"
                stroke="rgba(56, 189, 248, 0.45)"
                strokeWidth="1.2"
              />
            </g>
          </svg>
        </div>

        {/* 2. Calf (Noticeably smaller, swimming alongside in the mother's slipstream) */}
        <div className="whale-calf-wrapper">
          <svg
            className="whale-calf-svg"
            viewBox="0 0 460 160"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <defs>
              <linearGradient id="calfWhaleBodyGrad" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor="#184775" />
                <stop offset="40%" stopColor="#0d2c4f" />
                <stop offset="80%" stopColor="#061a33" />
                <stop offset="100%" stopColor="#031022" />
              </linearGradient>

              <linearGradient id="calfWhaleRimGrad" x1="0%" y1="0%" x2="100%" y2="50%">
                <stop offset="0%" stopColor="#7dd3fc" stopOpacity="0.85" />
                <stop offset="50%" stopColor="#38bdf8" stopOpacity="0.6" />
                <stop offset="100%" stopColor="#0284c7" stopOpacity="0.2" />
              </linearGradient>
            </defs>

            {/* Calf Body Silhouette */}
            <path
              className="calf-main-body"
              d="
                M 32,82
                C 32,66 54,46 95,38
                C 145,28 235,32 305,52
                C 335,61 350,60 358,54
                L 364,48
                C 365,58 372,66 385,72
                C 408,79 432,84 445,86
                C 440,94 415,98 385,98
                C 325,116 235,126 145,120
                C 85,116 48,104 32,82
                Z
              "
              fill="url(#calfWhaleBodyGrad)"
              stroke="url(#calfWhaleRimGrad)"
              strokeWidth="1.5"
            />

            {/* Calf Pectoral Fin */}
            <path
              className="calf-pectoral-fin"
              d="
                M 160,104
                C 176,122 208,154 228,158
                C 222,150 196,124 182,106
                Z
              "
              fill="#082240"
              stroke="rgba(125, 211, 252, 0.5)"
              strokeWidth="1"
            />

            {/* Calf Fluke */}
            <g className="calf-tail-group">
              <path
                d="
                  M 440,86
                  C 446,74 458,62 464,58
                  C 460,78 450,88 455,90
                  C 460,92 466,104 460,114
                  C 450,104 442,94 438,90
                  Z
                "
                fill="#0a2a4e"
                stroke="rgba(125, 211, 252, 0.55)"
                strokeWidth="1.2"
              />
            </g>
          </svg>
        </div>
      </div>
    </div>
  );
};

export default WhaleAndCalf;
