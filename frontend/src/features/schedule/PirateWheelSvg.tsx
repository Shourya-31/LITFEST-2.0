import React from 'react';
import { TimelineMilestone } from '../../types/timeline';

interface PirateWheelSvgProps {
  milestones: TimelineMilestone[];
  activeIdx: number;
  rotationDeg: number;
  onSpokeClick: (idx: number) => void;
  onCenterClick?: () => void;
}

export const PirateWheelSvg: React.FC<PirateWheelSvgProps> = ({
  milestones,
  activeIdx,
  rotationDeg,
  onSpokeClick,
  onCenterClick
}) => {
  const totalSpokes = 14;

  const spokes = Array.from({ length: totalSpokes }, (_, i) => {
    // Spoke 0 starts at 0 deg (12 o'clock / top)
    const angleDeg = (i * 360) / totalSpokes;
    const milestone = milestones[i] || milestones[0];
    const isActive = activeIdx === i;
    return {
      index: i,
      angleDeg,
      milestone,
      isActive
    };
  });

  return (
    <div className="pirate-helm-wrapper">
      {/* Ambient Seafoam Backlight */}
      <div className="helm-ambient-backlight" />

      {/* Main Vector Ship's Wheel SVG with comfortable padding (viewBox -240 to +240) */}
      <svg
        viewBox="-240 -240 480 480"
        className="pirate-helm-svg"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          <radialGradient id="timberRimGrad" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#451a03" />
            <stop offset="65%" stopColor="#78350f" />
            <stop offset="85%" stopColor="#92400e" />
            <stop offset="100%" stopColor="#290e02" />
          </radialGradient>

          <linearGradient id="spokeWoodGrad" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#351402" />
            <stop offset="30%" stopColor="#854d0e" />
            <stop offset="50%" stopColor="#b45309" />
            <stop offset="70%" stopColor="#854d0e" />
            <stop offset="100%" stopColor="#290e02" />
          </linearGradient>

          <linearGradient id="brassGoldGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#fef08a" />
            <stop offset="25%" stopColor="#eab308" />
            <stop offset="55%" stopColor="#b45309" />
            <stop offset="80%" stopColor="#d4af37" />
            <stop offset="100%" stopColor="#78350f" />
          </linearGradient>

          <radialGradient id="sapphireCoreGrad" cx="40%" cy="35%" r="60%">
            <stop offset="0%" stopColor="#e0f2fe" />
            <stop offset="25%" stopColor="#38bdf8" />
            <stop offset="65%" stopColor="#0284c7" />
            <stop offset="90%" stopColor="#082f49" />
            <stop offset="100%" stopColor="#031525" />
          </radialGradient>

          <filter id="cyanGlow" x="-30%" y="-30%" width="160%" height="160%">
            <feGaussianBlur stdDeviation="5" result="blur" />
            <feComposite in="SourceGraphic" in2="blur" operator="over" />
          </filter>

          <filter id="goldGlow" x="-30%" y="-30%" width="160%" height="160%">
            <feGaussianBlur stdDeviation="3.5" result="blur" />
            <feComposite in="SourceGraphic" in2="blur" operator="over" />
          </filter>
        </defs>

        {/* Outer Compass Tick Rings (Static reference) */}
        <circle cx="0" cy="0" r="224" fill="none" stroke="rgba(56, 189, 248, 0.15)" strokeWidth="1" strokeDasharray="3 5" />
        <circle cx="0" cy="0" r="228" fill="none" stroke="rgba(212, 175, 55, 0.25)" strokeWidth="1.2" />

        {/* ROTATING GROUP: Rotates smoothly by rotationDeg */}
        <g transform={`rotate(${rotationDeg})`}>
          {/* 1. 14 Spoke Shafts & Outer Handles */}
          <g className="wheel-spokes-group">
            {spokes.map(({ index, angleDeg, isActive }) => (
              <g
                key={`spoke-${index}`}
                transform={`rotate(${angleDeg})`}
                className={`helm-spoke-element ${isActive ? 'is-active-spoke' : ''}`}
                onClick={() => onSpokeClick(index)}
                style={{ cursor: 'pointer' }}
              >
                {/* Spoke Shaft from hub (r=42) to rim (r=152) */}
                <rect
                  x="-4.5"
                  y="-152"
                  width="9"
                  height="110"
                  fill="url(#spokeWoodGrad)"
                  stroke="#1c0a00"
                  strokeWidth="0.8"
                  rx="2"
                />

                {/* Brass ferrule sleeve near hub */}
                <rect x="-5.5" y="-55" width="11" height="6.5" fill="url(#brassGoldGrad)" rx="1" />

                {/* Turned baluster ring on spoke */}
                <ellipse cx="0" cy="-80" rx="6" ry="3" fill="url(#brassGoldGrad)" />

                {/* Outer Ergonomic Handle extending beyond Outer Rim (r=152 to r=206) */}
                <path
                  d="M -3.8 -152 
                     L -3.2 -166 
                     Q -6.5 -182 -4.5 -194
                     Q 0 -201 4.5 -194
                     Q 6.5 -182 3.2 -166
                     L 3.8 -152 Z"
                  fill="url(#spokeWoodGrad)"
                  stroke="#290e02"
                  strokeWidth="0.8"
                />

                {/* Handle pommel brass ring */}
                <ellipse cx="0" cy="-168" rx="5" ry="2.2" fill="url(#brassGoldGrad)" />

                {/* Handle brass crown knob (well within boundary at r=200) */}
                <circle cx="0" cy="-198" r="5" fill="url(#brassGoldGrad)" stroke="#451a03" strokeWidth="0.8" />
                <circle cx="0" cy="-198" r="2.2" fill="#fef08a" opacity="0.85" />
              </g>
            ))}
          </g>

          {/* 2. Heavy Timber Felloe / Double Ring Rim (r=98 to r=154) */}
          <g className="wheel-felloe-rim">
            <path
              d="M 0 -154 
                 A 154 154 0 1 1 0 154 
                 A 154 154 0 1 1 0 -154 
                 M 0 -98 
                 A 98 98 0 1 0 0 98 
                 A 98 98 0 1 0 0 -98 Z"
              fill="url(#timberRimGrad)"
              stroke="#1c0a00"
              strokeWidth="2.2"
              fillRule="evenodd"
            />

            {/* Outer and Inner Brass Bands */}
            <circle cx="0" cy="0" r="154" fill="none" stroke="url(#brassGoldGrad)" strokeWidth="2.8" />
            <circle cx="0" cy="0" r="150" fill="none" stroke="rgba(0,0,0,0.55)" strokeWidth="1" />
            <circle cx="0" cy="0" r="98" fill="none" stroke="url(#brassGoldGrad)" strokeWidth="2.8" />
            <circle cx="0" cy="0" r="102" fill="none" stroke="rgba(0,0,0,0.55)" strokeWidth="1" />

            {/* Brass joint straps */}
            {spokes.map(({ index, angleDeg }) => (
              <g key={`joint-${index}`} transform={`rotate(${angleDeg + (360 / 28)})`}>
                <line x1="0" y1="-98" x2="0" y2="-154" stroke="#1f0a01" strokeWidth="1.2" />
                <circle cx="0" cy="-144" r="2.4" fill="url(#brassGoldGrad)" stroke="#3f1c04" strokeWidth="0.5" />
                <circle cx="0" cy="-108" r="2.4" fill="url(#brassGoldGrad)" stroke="#3f1c04" strokeWidth="0.5" />
              </g>
            ))}

            {/* Wave rope inlay */}
            <circle
              cx="0"
              cy="0"
              r="126"
              fill="none"
              stroke="rgba(212, 175, 55, 0.35)"
              strokeWidth="1.2"
              strokeDasharray="3 5"
            />
          </g>

          {/* 3. 14 SPOKE BADGES & UPRIGHT NUMERALS (Vector SVG elements)
              Positioned at radius r=126 along the rim.
              The text group is counter-rotated by -(angleDeg + rotationDeg)
              so EVERY numeral is ALWAYS 100% STRICTLY UPRIGHT at all times! */}
          <g className="wheel-spoke-badges-layer">
            {spokes.map(({ index, angleDeg, milestone, isActive }) => {
              return (
                <g
                  key={`spoke-badge-${index}`}
                  transform={`rotate(${angleDeg}) translate(0, -126)`}
                  onClick={() => onSpokeClick(index)}
                  style={{ cursor: 'pointer' }}
                >
                  {/* Active Spoke Glow Aura */}
                  {isActive && (
                    <circle
                      cx="0"
                      cy="0"
                      r="19"
                      fill="none"
                      stroke="#22d3ee"
                      strokeWidth="2.5"
                      filter="url(#cyanGlow)"
                      className="active-pulse-aura"
                    />
                  )}

                  {/* Badge Circle Coin */}
                  <circle
                    cx="0"
                    cy="0"
                    r="15"
                    fill={isActive ? '#0284c7' : '#5c2406'}
                    stroke={isActive ? '#22d3ee' : '#d4af37'}
                    strokeWidth={isActive ? '2' : '1.2'}
                  />

                  {/* Counter-Rotate Text: -angleDeg cancels spoke angle, -rotationDeg cancels wheel angle!
                      Result: Net world rotation = 0 deg (Strictly Upright) */}
                  <g transform={`rotate(${-angleDeg - rotationDeg})`}>
                    <text
                      x="0"
                      y="-1"
                      textAnchor="middle"
                      dominantBaseline="middle"
                      fill={isActive ? '#ffffff' : '#fef08a'}
                      fontFamily="var(--font-serif)"
                      fontSize="9.5"
                      fontWeight="800"
                      letterSpacing="-0.02em"
                    >
                      {milestone.romanNumeral}
                    </text>
                    <text
                      x="0"
                      y="7.5"
                      textAnchor="middle"
                      dominantBaseline="middle"
                      fill={isActive ? '#e0f2fe' : 'rgba(254, 240, 138, 0.75)'}
                      fontFamily="var(--font-mono)"
                      fontSize="5.5"
                      fontWeight="600"
                    >
                      {index + 1}
                    </text>
                  </g>
                </g>
              );
            })}
          </g>

          {/* 4. Center Brass Hub (r=44) */}
          <g className="wheel-center-hub" onClick={onCenterClick} style={{ cursor: 'pointer' }}>
            <circle cx="0" cy="0" r="46" fill="url(#brassGoldGrad)" stroke="#260f02" strokeWidth="2.2" />
            <circle cx="0" cy="0" r="42" fill="#451a03" stroke="#d4af37" strokeWidth="1" />

            {[0, 45, 90, 135, 180, 225, 270, 315].map((deg, bIdx) => (
              <g key={`bolt-${bIdx}`} transform={`rotate(${deg})`}>
                <circle cx="0" cy="-36" r="2.2" fill="url(#brassGoldGrad)" stroke="#1a0700" strokeWidth="0.5" />
              </g>
            ))}

            <g className="hub-compass-rose">
              <polygon points="0,-32 3.5,-10 0,-7 -3.5,-10" fill="#fef08a" />
              <polygon points="0,-32 0,-7 -3.5,-10" fill="#ca8a04" />
              <polygon points="0,32 3.5,10 0,7 -3.5,10" fill="#fef08a" />
              <polygon points="0,32 0,7 3.5,10" fill="#ca8a04" />
              <polygon points="32,0 10,3.5 7,0 10,-3.5" fill="#fef08a" />
              <polygon points="32,0 7,0 10,3.5" fill="#ca8a04" />
              <polygon points="-32,0 -10,3.5 -7,0 -10,-3.5" fill="#fef08a" />
              <polygon points="-32,0 -7,0 -10,-3.5" fill="#ca8a04" />
            </g>

            <circle
              cx="0"
              cy="0"
              r="16"
              fill="url(#sapphireCoreGrad)"
              stroke="#22d3ee"
              strokeWidth="2"
            />
            <ellipse cx="-3.5" cy="-4" rx="4" ry="2.5" fill="#ffffff" opacity="0.65" />
          </g>
        </g>

        {/* FIXED 12 O'CLOCK ACTIVE SPOKE POINTER (Always marks the top selected spoke position) */}
        <g className="fixed-active-spoke-pointer">
          {/* Golden pointer needle pointing down at the top active spoke */}
          <polygon points="0,-146 -7,-159 7,-159" fill="#f59e0b" filter="url(#goldGlow)" />
          <polygon points="0,-146 0,-159 7,-159" fill="#d97706" />
          <circle cx="0,-163" r="3.5" fill="#fef08a" stroke="#78350f" strokeWidth="1" />
        </g>
      </svg>
    </div>
  );
};

PirateWheelSvg.displayName = 'PirateWheelSvg';
