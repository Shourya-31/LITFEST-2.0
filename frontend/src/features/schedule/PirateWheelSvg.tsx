import React from 'react';
import type { TimelineMilestone } from '../../types/timeline';

interface PirateWheelSvgProps {
  milestones: TimelineMilestone[];
  activeIdx: number;
  rotationDeg: number;
  onEventClick?: (idx: number) => void;
  onSpokeClick?: (idx: number) => void;
  onCenterClick?: () => void;
}

export const PirateWheelSvg: React.FC<PirateWheelSvgProps> = ({
  milestones,
  activeIdx,
  rotationDeg,
  onEventClick,
  onSpokeClick,
  onCenterClick
}) => {
  const handleClick = onEventClick || onSpokeClick || (() => {});
  const totalSpokes = milestones.length || 10;

  const spokes = Array.from({ length: totalSpokes }, (_, i) => {
    // Event 0 starts at 0 deg (12 o'clock / top)
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
      {/* Main Vector Ship's Wheel SVG with comfortable padding (viewBox -240 to +240) */}
      <svg
        viewBox="-240 -240 480 480"
        className="pirate-helm-svg"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          {/* Deep Abyssal Obsidian & Navy Rim Gradient */}
          <radialGradient id="abyssalRimGrad" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#010610" />
            <stop offset="55%" stopColor="#05162a" />
            <stop offset="85%" stopColor="#082845" />
            <stop offset="100%" stopColor="#010610" />
          </radialGradient>

          {/* Submerged Nautical Spoke Gradient */}
          <linearGradient id="abyssalSpokeGrad" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#020b18" />
            <stop offset="30%" stopColor="#082845" />
            <stop offset="50%" stopColor="#0e3a61" />
            <stop offset="70%" stopColor="#082845" />
            <stop offset="100%" stopColor="#010610" />
          </linearGradient>

          {/* Bioluminescent Cyan & Aquamarine Gleam Gradient */}
          <linearGradient id="biolumCyanGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#f0f9ff" />
            <stop offset="25%" stopColor="#a5f3fc" />
            <stop offset="55%" stopColor="#38bdf8" />
            <stop offset="80%" stopColor="#0284c7" />
            <stop offset="100%" stopColor="#082845" />
          </linearGradient>

          {/* Radiant Bioluminescent Core Sapphire Gradient */}
          <radialGradient id="sapphireCoreGrad" cx="38%" cy="32%" r="65%">
            <stop offset="0%" stopColor="#f0f9ff" />
            <stop offset="25%" stopColor="#a5f3fc" />
            <stop offset="60%" stopColor="#38bdf8" />
            <stop offset="85%" stopColor="#0284c7" />
            <stop offset="100%" stopColor="#020b18" />
          </radialGradient>

          <filter id="cyanGlow" x="-30%" y="-30%" width="160%" height="160%">
            <feGaussianBlur stdDeviation="5" result="blur" />
            <feComposite in="SourceGraphic" in2="blur" operator="over" />
          </filter>

          <filter id="subtleCyanGlow" x="-30%" y="-30%" width="160%" height="160%">
            <feGaussianBlur stdDeviation="3.5" result="blur" />
            <feComposite in="SourceGraphic" in2="blur" operator="over" />
          </filter>
        </defs>

        {/* Outer Compass Tick Rings (Static reference) */}
        <circle cx="0" cy="0" r="224" fill="none" stroke="rgba(56, 189, 248, 0.22)" strokeWidth="1" strokeDasharray="3 5" />
        <circle cx="0" cy="0" r="228" fill="none" stroke="rgba(165, 243, 252, 0.3)" strokeWidth="1.2" />

        {/* ROTATING GROUP: Rotates smoothly by rotationDeg */}
        <g transform={`rotate(${rotationDeg})`}>
          {/* 1. Spoke Shafts & Outer Handles */}
          <g className="wheel-spokes-group">
            {spokes.map(({ index, angleDeg, isActive }) => (
              <g
                key={`spoke-${index}`}
                transform={`rotate(${angleDeg})`}
                className={`helm-spoke-element ${isActive ? 'is-active-spoke' : ''}`}
                onClick={() => handleClick(index)}
                style={{ cursor: 'pointer' }}
              >
                {/* Spoke Shaft from hub (r=42) to rim (r=152) */}
                <rect
                  x="-4.5"
                  y="-152"
                  width="9"
                  height="110"
                  fill="url(#abyssalSpokeGrad)"
                  stroke="#010610"
                  strokeWidth="0.8"
                  rx="2"
                />

                {/* Bioluminescent cyan ferrule sleeve near hub */}
                <rect x="-5.5" y="-55" width="11" height="6.5" fill="url(#biolumCyanGrad)" rx="1" />

                {/* Turned baluster ring on spoke */}
                <ellipse cx="0" cy="-80" rx="6" ry="3" fill="url(#biolumCyanGrad)" />

                {/* Outer Ergonomic Handle extending beyond Outer Rim (r=152 to r=206) */}
                <path
                  d="M -3.8 -152
                     L -3.2 -166
                     Q -6.5 -182 -4.5 -194
                     Q 0 -201 4.5 -194
                     Q 6.5 -182 3.2 -166
                     L 3.8 -152 Z"
                  fill="url(#abyssalSpokeGrad)"
                  stroke="#010610"
                  strokeWidth="0.8"
                />

                {/* Handle pommel ring */}
                <ellipse cx="0" cy="-168" rx="5" ry="2.2" fill="url(#biolumCyanGrad)" />

                {/* Handle crown knob */}
                <circle cx="0" cy="-198" r="5" fill="url(#biolumCyanGrad)" stroke="#020b18" strokeWidth="0.8" />
                <circle cx="0" cy="-198" r="2.2" fill="#a5f3fc" opacity="0.9" />
              </g>
            ))}
          </g>

          {/* 2. Heavy Double Ring Rim (r=98 to r=154) */}
          <g className="wheel-felloe-rim">
            <path
              d="M 0 -154
                 A 154 154 0 1 1 0 154
                 A 154 154 0 1 1 0 -154
                 M 0 -98
                 A 98 98 0 1 0 0 98
                 A 98 98 0 1 0 0 -98 Z"
              fill="url(#abyssalRimGrad)"
              stroke="#010610"
              strokeWidth="2.2"
              fillRule="evenodd"
            />

            {/* Outer and Inner Glowing Bioluminescent Bands */}
            <circle cx="0" cy="0" r="154" fill="none" stroke="url(#biolumCyanGrad)" strokeWidth="2.8" />
            <circle cx="0" cy="0" r="150" fill="none" stroke="rgba(0,0,0,0.6)" strokeWidth="1" />
            <circle cx="0" cy="0" r="98" fill="none" stroke="url(#biolumCyanGrad)" strokeWidth="2.8" />
            <circle cx="0" cy="0" r="102" fill="none" stroke="rgba(0,0,0,0.6)" strokeWidth="1" />

            {/* Joint straps halfway between spokes */}
            {spokes.map(({ index, angleDeg }) => (
              <g key={`joint-${index}`} transform={`rotate(${angleDeg + (360 / (totalSpokes * 2))})`}>
                <line x1="0" y1="-98" x2="0" y2="-154" stroke="#010610" strokeWidth="1.2" />
                <circle cx="0" cy="-144" r="2.4" fill="url(#biolumCyanGrad)" stroke="#010610" strokeWidth="0.5" />
                <circle cx="0" cy="-108" r="2.4" fill="url(#biolumCyanGrad)" stroke="#010610" strokeWidth="0.5" />
              </g>
            ))}

            {/* Wave rope inlay */}
            <circle
              cx="0"
              cy="0"
              r="126"
              fill="none"
              stroke="rgba(56, 189, 248, 0.35)"
              strokeWidth="1.2"
              strokeDasharray="3 5"
            />
          </g>

          {/* 3. SPOKE BADGES & UPRIGHT NUMERALS (Vector SVG elements)
              The text group is counter-rotated by -(angleDeg + rotationDeg)
              so EVERY numeral is ALWAYS 100% STRICTLY UPRIGHT at all times! */}
          <g className="wheel-spoke-badges-layer">
            {spokes.map(({ index, angleDeg, milestone, isActive }) => {
              return (
                <g
                  key={`spoke-badge-${index}`}
                  transform={`rotate(${angleDeg}) translate(0, -126)`}
                  onClick={() => handleClick(index)}
                  style={{ cursor: 'pointer' }}
                  role="button"
                  aria-label={`Event ${index + 1}: ${milestone.romanNumeral}`}
                >
                  {/* Active Spoke Glow Aura */}
                  {isActive && (
                    <>
                      <circle
                        cx="0"
                        cy="0"
                        r="20"
                        fill="none"
                        stroke="#a5f3fc"
                        strokeWidth="1.2"
                        strokeDasharray="2 3"
                        opacity="0.85"
                      />
                      <circle
                        cx="0"
                        cy="0"
                        r="18"
                        fill="none"
                        stroke="#38bdf8"
                        strokeWidth="2.2"
                        filter="url(#cyanGlow)"
                        className="active-pulse-aura"
                      />
                    </>
                  )}

                  {/* Badge Circle Coin */}
                  <circle
                    cx="0"
                    cy="0"
                    r="15"
                    fill={isActive ? '#0284c7' : '#05162a'}
                    stroke={isActive ? '#a5f3fc' : '#38bdf8'}
                    strokeWidth={isActive ? '2.4' : '1.2'}
                  />

                  {/* Counter-Rotate Text: Net world rotation = 0 deg (Strictly Upright) */}
                  <g transform={`rotate(${-(angleDeg + rotationDeg)})`}>
                    <text
                      x="0"
                      y="4"
                      textAnchor="middle"
                      fill={isActive ? '#ffffff' : '#e0f2fe'}
                      fontSize={milestone.romanNumeral.length > 3 ? '8.5' : '10'}
                      fontWeight={isActive ? '900' : '700'}
                      fontFamily="var(--font-serif)"
                      letterSpacing="0.02em"
                      style={{
                        pointerEvents: 'none',
                        userSelect: 'none',
                        textShadow: isActive ? '0 0 8px rgba(165, 243, 252, 0.9)' : '0 1px 2px rgba(0,0,0,0.8)'
                      }}
                    >
                      {milestone.romanNumeral}
                    </text>
                  </g>
                </g>
              );
            })}
          </g>

          {/* 4. Central Hub with Celestial Compass Rose */}
          <g
            className="wheel-central-hub"
            onClick={onCenterClick}
            style={{ cursor: onCenterClick ? 'pointer' : 'default' }}
          >
            {/* Outer Hub Collar (r=48) */}
            <circle cx="0" cy="0" r="48" fill="url(#abyssalRimGrad)" stroke="#010610" strokeWidth="2.5" />
            <circle cx="0" cy="0" r="44" fill="none" stroke="url(#biolumCyanGrad)" strokeWidth="2.2" />

            {/* Hub mounting bolt rivets */}
            {spokes.map(({ index, angleDeg }) => (
              <g key={`bolt-${index}`} transform={`rotate(${angleDeg})`}>
                <circle cx="0" cy="-44" r="1.8" fill="url(#biolumCyanGrad)" />
              </g>
            ))}

            {/* Inner Hub Plate (r=36) */}
            <circle cx="0" cy="0" r="36" fill="#020b18" stroke="url(#biolumCyanGrad)" strokeWidth="1.5" />

            {/* Center Sapphire Core Dome (r=26) */}
            <circle cx="0" cy="0" r="26" fill="url(#sapphireCoreGrad)" filter="url(#subtleCyanGlow)" />
            <circle cx="0" cy="0" r="26" fill="none" stroke="#a5f3fc" strokeWidth="1" opacity="0.6" />

            {/* 8-Point Compass Rose Star Emblem */}
            <g className="hub-compass-star">
              {/* Cardinal North/South/East/West Points */}
              <polygon points="0,-22 4,-6 0,0 -4,-6" fill="#f0f9ff" />
              <polygon points="0,22 4,6 0,0 -4,6" fill="#0284c7" />
              <polygon points="22,0 6,4 0,0 6,-4" fill="#38bdf8" />
              <polygon points="-22,0 -6,4 0,0 -6,-4" fill="#0284c7" />

              {/* Diagonal NE/NW/SE/SW Points */}
              <g transform="rotate(45)">
                <polygon points="0,-16 3,-5 0,0 -3,-5" fill="#a5f3fc" opacity="0.9" />
                <polygon points="0,16 3,5 0,0 -3,5" fill="#0284c7" opacity="0.9" />
                <polygon points="16,0 5,3 0,0 5,-3" fill="#38bdf8" opacity="0.9" />
                <polygon points="-16,0 -5,3 0,0 -5,-3" fill="#0284c7" opacity="0.9" />
              </g>

              {/* Center Pivot Point */}
              <circle cx="0" cy="0" r="4.2" fill="#ffffff" stroke="#020b18" strokeWidth="1" />
              <circle cx="0" cy="0" r="1.8" fill="#38bdf8" />
            </g>
          </g>
        </g>

        {/* STATIC OVERLAY: Top 12 o'clock Gold Needle Pointer (Fixed at top, does NOT rotate) */}
        <g className="wheel-top-pointer-static" transform="translate(0, -150)">
          {/* Luminous beacon flare */}
          <circle cx="0" cy="0" r="9" fill="#38bdf8" opacity="0.25" filter="url(#cyanGlow)" />
          {/* Compass Arrow Pointing Down at active 12 o'clock Spoke */}
          <polygon
            points="0,16 -7,0 0,3 7,0"
            fill="url(#biolumCyanGrad)"
            stroke="#010610"
            strokeWidth="0.8"
            filter="url(#subtleCyanGlow)"
          />
          <polygon points="0,16 0,3 7,0" fill="#a5f3fc" opacity="0.9" />
        </g>
      </svg>
    </div>
  );
};

export default PirateWheelSvg;
