import React, { useMemo } from 'react';
import './OceanAtmosphere.css';

export const OceanAtmosphere: React.FC = () => {
  // Generate ambient floating marine particles
  const particles = useMemo(() => {
    return Array.from({ length: 45 }, (_, i) => {
      const left = Math.random() * 100;
      const top = Math.random() * 100;
      const size = 1.5 + Math.random() * 3.5;
      const duration = 12 + Math.random() * 18;
      const delay = -(Math.random() * duration);
      const opacity = 0.15 + Math.random() * 0.45;
      return { id: i, left, top, size, duration, delay, opacity };
    });
  }, []);

  // Generate sparse rising bubbles
  const bubbles = useMemo(() => {
    return Array.from({ length: 24 }, (_, i) => {
      const left = 5 + Math.random() * 90;
      const size = 3 + Math.random() * 9;
      const duration = 9 + Math.random() * 14;
      const delay = -(Math.random() * duration);
      const opacity = 0.2 + Math.random() * 0.45;
      return { id: i, left, size, duration, delay, opacity };
    });
  }, []);

  return (
    <div className="ocean-atmosphere-root" aria-hidden="true">
      {/* 1. Deep Midnight Ocean Background Gradient */}
      <div className="abyss-gradient" />

      {/* 2. Surface Water Line & Caustics */}
      <div className="surface-light-bloom" />

      {/* 3. Volumetric Downward Sunbeams (God Rays focused on center title) */}
      <div className="sunbeams-container">
        <svg
          className="sunbeams-svg"
          viewBox="0 0 1600 1000"
          preserveAspectRatio="none"
        >
          <defs>
            <linearGradient id="beamGradCenter" x1="50%" y1="0%" x2="50%" y2="100%">
              <stop offset="0%" stopColor="#bae6fd" stopOpacity="0.45" />
              <stop offset="25%" stopColor="#38bdf8" stopOpacity="0.28" />
              <stop offset="65%" stopColor="#0284c7" stopOpacity="0.08" />
              <stop offset="100%" stopColor="#0369a1" stopOpacity="0" />
            </linearGradient>

            <linearGradient id="beamGradLeft" x1="40%" y1="0%" x2="25%" y2="100%">
              <stop offset="0%" stopColor="#7dd3fc" stopOpacity="0.35" />
              <stop offset="35%" stopColor="#0ea5e9" stopOpacity="0.16" />
              <stop offset="80%" stopColor="#0369a1" stopOpacity="0" />
            </linearGradient>

            <linearGradient id="beamGradRight" x1="60%" y1="0%" x2="75%" y2="100%">
              <stop offset="0%" stopColor="#7dd3fc" stopOpacity="0.35" />
              <stop offset="35%" stopColor="#0ea5e9" stopOpacity="0.16" />
              <stop offset="80%" stopColor="#0369a1" stopOpacity="0" />
            </linearGradient>

            <filter id="beamBlur" x="-10%" y="-10%" width="120%" height="120%">
              <feGaussianBlur stdDeviation="16" />
            </filter>
          </defs>

          {/* Core Central Beam falling onto Litfest title */}
          <polygon
            className="sunbeam beam-center"
            points="700,0 900,0 1080,1000 520,1000"
            fill="url(#beamGradCenter)"
            filter="url(#beamBlur)"
          />

          {/* Left Flanking Beams */}
          <polygon
            className="sunbeam beam-left-1"
            points="580,0 720,0 740,1000 320,1000"
            fill="url(#beamGradLeft)"
            filter="url(#beamBlur)"
          />
          <polygon
            className="sunbeam beam-left-2"
            points="380,0 520,0 440,1000 120,1000"
            fill="url(#beamGradLeft)"
            filter="url(#beamBlur)"
          />

          {/* Right Flanking Beams */}
          <polygon
            className="sunbeam beam-right-1"
            points="880,0 1020,0 1280,1000 860,1000"
            fill="url(#beamGradRight)"
            filter="url(#beamBlur)"
          />
          <polygon
            className="sunbeam beam-right-2"
            points="1080,0 1220,0 1520,1000 1160,1000"
            fill="url(#beamGradRight)"
            filter="url(#beamBlur)"
          />
        </svg>
      </div>

      {/* 4. Ambient Oceanic Floating Particles */}
      <div className="particles-layer">
        {particles.map((p) => (
          <span
            key={p.id}
            className="marine-particle"
            style={{
              left: `${p.left}%`,
              top: `${p.top}%`,
              width: `${p.size}px`,
              height: `${p.size}px`,
              opacity: p.opacity,
              animationDuration: `${p.duration}s`,
              animationDelay: `${p.delay}s`,
            }}
          />
        ))}
      </div>

      {/* 5. Sparse Natural Rising Bubbles */}
      <div className="bubbles-container">
        {bubbles.map((b) => (
          <span
            key={b.id}
            className="ambient-bubble"
            style={{
              left: `${b.left}%`,
              width: `${b.size}px`,
              height: `${b.size}px`,
              opacity: b.opacity,
              animationDuration: `${b.duration}s`,
              animationDelay: `${b.delay}s`,
            }}
          />
        ))}
      </div>



      {/* 7. Vignette depth framing */}
      <div className="ocean-vignette" />
    </div>
  );
};
