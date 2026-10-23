import React from 'react';
import { TimelineMilestone } from '../../types/timeline';

interface PirateWheelSvgProps {
  milestones: TimelineMilestone[];
  activeIdx: number;
  onSpokeClick: (idx: number) => void;
  onCenterClick?: () => void;
  wheelRef?: React.RefObject<HTMLDivElement>;
  rotationDeg?: number;
}

export const PirateWheelSvg: React.FC<PirateWheelSvgProps> = ({
  milestones,
  activeIdx,
  onSpokeClick,
  onCenterClick,
  wheelRef,
  rotationDeg = 0
}) => {
  const totalSpokes = 14;

  // Calculate spoke angles
  const spokes = Array.from({ length: totalSpokes }, (_, i) => {
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

      {/* Outer Water Ring Wave Indicator */}
      <div className="helm-outer-compass-ring">
        <svg viewBox="0 0 490 490" className="compass-ticks-svg">
          <circle cx="245" cy="245" r="236" fill="none" stroke="rgba(56, 189, 248, 0.15)" strokeWidth="1" strokeDasharray="3 5" />
          <circle cx="245" cy="245" r="242" fill="none" stroke="rgba(212, 175, 55, 0.22)" strokeWidth="1.5" />
        </svg>
      </div>

      {/* The Rotating Ship's Wheel (GSAP or State Controlled) */}
      <div ref={wheelRef} className="pirate-helm-wheel">
        <svg
          viewBox="-240 -240 480 480"
          className="pirate-helm-svg"
          xmlns="http://www.w3.org/2000/svg"
        >
          <defs>
            {/* Rich Dark Ship Timber Gradient */}
            <radialGradient id="timberRimGrad" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#451a03" />
              <stop offset="65%" stopColor="#78350f" />
              <stop offset="85%" stopColor="#92400e" />
              <stop offset="100%" stopColor="#311102" />
            </radialGradient>

            {/* Turn Spoke Wood Gradient */}
            <linearGradient id="spokeWoodGrad" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#351402" />
              <stop offset="30%" stopColor="#854d0e" />
              <stop offset="50%" stopColor="#b45309" />
              <stop offset="70%" stopColor="#854d0e" />
              <stop offset="100%" stopColor="#290e02" />
            </linearGradient>

            {/* Burnished Brass & Gold Gradient */}
            <linearGradient id="brassGoldGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#fef08a" />
              <stop offset="25%" stopColor="#eab308" />
              <stop offset="55%" stopColor="#b45309" />
              <stop offset="80%" stopColor="#d4af37" />
              <stop offset="100%" stopColor="#78350f" />
            </linearGradient>

            {/* Central Ocean Sapphire Core */}
            <radialGradient id="sapphireCoreGrad" cx="40%" cy="35%" r="60%">
              <stop offset="0%" stopColor="#e0f2fe" />
              <stop offset="25%" stopColor="#38bdf8" />
              <stop offset="65%" stopColor="#0284c7" />
              <stop offset="90%" stopColor="#082f49" />
              <stop offset="100%" stopColor="#031525" />
            </radialGradient>

            {/* Glow Filter for Active Elements */}
            <filter id="cyanGlow" x="-30%" y="-30%" width="160%" height="160%">
              <feGaussianBlur stdDeviation="6" result="blur" />
              <feComposite in="SourceGraphic" in2="blur" operator="over" />
            </filter>

            <filter id="goldGlow" x="-30%" y="-30%" width="160%" height="160%">
              <feGaussianBlur stdDeviation="4" result="blur" />
              <feComposite in="SourceGraphic" in2="blur" operator="over" />
            </filter>
          </defs>

          {/* 1. LAYER: 14 Spoke Wooden Shafts & Ergonomic Handles extending beyond the Rim */}
          <g className="wheel-spokes-group">
            {spokes.map(({ index, angleDeg, isActive }) => (
              <g
                key={`spoke-${index}`}
                transform={`rotate(${angleDeg})`}
                className={`helm-spoke-element ${isActive ? 'is-active-spoke' : ''}`}
                onClick={() => onSpokeClick(index)}
              >
                {/* Spoke Shaft from Hub (r=45) out to Handle Tip (r=222) */}
                {/* Inner shaft segment */}
                <rect
                  x="-5"
                  y="-165"
                  width="10"
                  height="120"
                  fill="url(#spokeWoodGrad)"
                  stroke="#1c0a00"
                  strokeWidth="0.8"
                  rx="2"
                />

                {/* Brass ferrule sleeve near hub */}
                <rect x="-6" y="-58" width="12" height="7" fill="url(#brassGoldGrad)" rx="1" />

                {/* Turned ornamental baluster ring on spoke */}
                <ellipse cx="0" cy="-86" rx="6.5" ry="3.5" fill="url(#brassGoldGrad)" />

                {/* Outer Handle extending beyond Outer Rim (r=165 to r=222) */}
                {/* Handle neck */}
                <path
                  d="M -4 -165 
                     L -3.5 -180 
                     Q -7 -196 -5 -206
                     Q 0 -214 5 -206
                     Q 7 -196 3.5 -180
                     L 4 -165 Z"
                  fill="url(#spokeWoodGrad)"
                  stroke="#290e02"
                  strokeWidth="0.8"
                />

                {/* Handle brass pommel ring */}
                <ellipse cx="0" cy="-182" rx="5.5" ry="2.5" fill="url(#brassGoldGrad)" />

                {/* Handle outer brass crown knob */}
                <circle cx="0" cy="-213" r="5.5" fill="url(#brassGoldGrad)" stroke="#451a03" strokeWidth="0.8" />
                <circle cx="0" cy="-213" r="2.5" fill="#fef08a" opacity="0.85" />
              </g>
            ))}
          </g>

          {/* 2. LAYER: Heavy Timber Felloe / Double Ring Rim (r=106 to r=166) */}
          <g className="wheel-felloe-rim">
            {/* Main Wooden Rim Donut */}
            <path
              d="M 0 -166 
                 A 166 166 0 1 1 0 166 
                 A 166 166 0 1 1 0 -166 
                 M 0 -106 
                 A 106 106 0 1 0 0 106 
                 A 106 106 0 1 0 0 -106 Z"
              fill="url(#timberRimGrad)"
              stroke="#1c0a00"
              strokeWidth="2.5"
              fillRule="evenodd"
            />

            {/* Outer Brass Protective Tire Ring */}
            <circle cx="0" cy="0" r="166" fill="none" stroke="url(#brassGoldGrad)" strokeWidth="3" />
            <circle cx="0" cy="0" r="162" fill="none" stroke="rgba(0,0,0,0.6)" strokeWidth="1" />

            {/* Inner Brass Ring */}
            <circle cx="0" cy="0" r="106" fill="none" stroke="url(#brassGoldGrad)" strokeWidth="3" />
            <circle cx="0" cy="0" r="110" fill="none" stroke="rgba(0,0,0,0.6)" strokeWidth="1" />

            {/* 14 Brass Felloe Joint Straps & Rivets */}
            {spokes.map(({ index, angleDeg }) => (
              <g key={`felloe-joint-${index}`} transform={`rotate(${angleDeg + (360 / 28)})`}>
                {/* Subtle wood seam */}
                <line x1="0" y1="-106" x2="0" y2="-166" stroke="#1f0a01" strokeWidth="1.5" />
                {/* Brass rivet near outer edge */}
                <circle cx="0" cy="-155" r="2.8" fill="url(#brassGoldGrad)" stroke="#3f1c04" strokeWidth="0.6" />
                <circle cx="-0.8" cy="-155.8" r="0.9" fill="#fff" opacity="0.75" />
                {/* Brass rivet near inner edge */}
                <circle cx="0" cy="-117" r="2.8" fill="url(#brassGoldGrad)" stroke="#3f1c04" strokeWidth="0.6" />
                <circle cx="-0.8" cy="-117.8" r="0.9" fill="#fff" opacity="0.75" />
              </g>
            ))}

            {/* Decorative Nautical Wave Rope Inlay */}
            <circle
              cx="0"
              cy="0"
              r="136"
              fill="none"
              stroke="rgba(212, 175, 55, 0.45)"
              strokeWidth="1.5"
              strokeDasharray="4 6"
            />
          </g>

          {/* 3. LAYER: The Center Brass Hub Plate (r=48) */}
          <g className="wheel-center-hub" onClick={onCenterClick} style={{ cursor: 'pointer' }}>
            {/* Outer Brass Ring */}
            <circle cx="0" cy="0" r="50" fill="url(#brassGoldGrad)" stroke="#260f02" strokeWidth="2.5" />
            <circle cx="0" cy="0" r="46" fill="#451a03" stroke="#d4af37" strokeWidth="1" />

            {/* 8 Hub Bolts */}
            {[0, 45, 90, 135, 180, 225, 270, 315].map((deg, bIdx) => (
              <g key={`hub-bolt-${bIdx}`} transform={`rotate(${deg})`}>
                <circle cx="0" cy="-40" r="2.4" fill="url(#brassGoldGrad)" stroke="#1a0700" strokeWidth="0.5" />
              </g>
            ))}

            {/* Golden Compass Rose 8-Point Star */}
            <g className="hub-compass-rose">
              {/* 4 Cardinal Points */}
              <polygon points="0,-36 4,-12 0,-8 -4,-12" fill="#fef08a" />
              <polygon points="0,-36 0,-8 -4,-12" fill="#ca8a04" />

              <polygon points="0,36 4,12 0,8 -4,12" fill="#fef08a" />
              <polygon points="0,36 0,8 4,12" fill="#ca8a04" />

              <polygon points="36,0 12,4 8,0 12,-4" fill="#fef08a" />
              <polygon points="36,0 8,0 12,4" fill="#ca8a04" />

              <polygon points="-36,0 -12,4 -8,0 -12,-4" fill="#fef08a" />
              <polygon points="-36,0 -8,0 -12,-4" fill="#ca8a04" />

              {/* 4 Diagonal Points */}
              <polygon points="22,-22 9,-5 6,-6 5,-9" fill="#d4af37" />
              <polygon points="-22,-22 -9,-5 -6,-6 -5,-9" fill="#d4af37" />
              <polygon points="22,22 9,5 6,6 5,9" fill="#d4af37" />
              <polygon points="-22,22 -9,5 -6,6 -5,9" fill="#d4af37" />
            </g>

            {/* Center Ocean Sapphire Gem Core with Glowing Aquamarine Pulse */}
            <circle
              cx="0"
              cy="0"
              r="18"
              fill="url(#sapphireCoreGrad)"
              stroke="#22d3ee"
              strokeWidth="2"
              className="sapphire-core-pulsar"
            />
            {/* Core Specular Highlight */}
            <ellipse cx="-4" cy="-5" rx="5" ry="3" fill="#ffffff" opacity="0.65" />
            <circle cx="0" cy="0" r="5" fill="#38bdf8" filter="url(#cyanGlow)" />
          </g>
        </svg>

        {/* 4. LAYER: 14 HTML Spoke Badges (Roman Numerals I through XIV)
            Positioned at radius r=136 on the rim, with COUNTER-ROTATION
            so their text remains upright as the ship's wheel turns! */}
        <div className="helm-nodes-overlay">
          {spokes.map(({ index, angleDeg, milestone, isActive }) => {
            const rad = ((angleDeg - 90) * Math.PI) / 180;
            const rDist = 136; // positioned along the mid-felloe ring
            const x = Math.cos(rad) * rDist;
            const y = Math.sin(rad) * rDist;

            return (
              <button
                key={`badge-${index}`}
                type="button"
                className={`helm-spoke-node interactive ${isActive ? 'active' : ''}`}
                style={{
                  transform: `translate(${x}px, ${y}px)`
                }}
                onClick={(e) => {
                  e.stopPropagation();
                  onSpokeClick(index);
                }}
                title={`Spoke ${index + 1}: ${milestone.romanNumeral} — ${milestone.title}`}
                aria-label={`Select Spoke ${index + 1}: ${milestone.title}`}
              >
                {/* Counter-rotate the inner content by the wheel's negative rotation so it stays upright! */}
                <div
                  className="node-counter-rotator"
                  style={{
                    transform: `rotate(${-rotationDeg}deg)`
                  }}
                >
                  <span className="node-roman-num">{milestone.romanNumeral}</span>
                  <span className="node-spoke-idx">{index + 1}</span>
                </div>

                {/* Active Cyan Pulse Ring */}
                {isActive && <span className="active-pulse-aura" />}
              </button>
            );
          })}
        </div>
      </div>

      {/* Decorative Sea Helm Pedestal / Binnacle Stand */}
      <div className="helm-binnacle-stand">
        <div className="binnacle-gold-rim" />
        <div className="binnacle-compass-label">
          <span>PORT ◄</span>
          <span className="binnacle-heading-deg">{Math.round((rotationDeg % 360 + 360) % 360)}° HEADING</span>
          <span>► STBD</span>
        </div>
      </div>
    </div>
  );
};
