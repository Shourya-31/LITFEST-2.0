import React, { useMemo } from 'react';
import './AboutOceanAtmosphere.css';

export const AboutOceanAtmosphere: React.FC = () => {
  // Generate floating bubbles rising from the depths
  const bubbles = useMemo(() => {
    return Array.from({ length: 18 }, (_, i) => {
      const left = 6 + Math.random() * 88;
      const size = 3 + Math.random() * 8;
      const duration = 11 + Math.random() * 14;
      const delay = -(Math.random() * duration);
      const opacity = 0.2 + Math.random() * 0.45;
      return { id: i, left, size, duration, delay, opacity };
    });
  }, []);

  // Generate subtle drifting deep-sea bioluminescent particles
  const particles = useMemo(() => {
    return Array.from({ length: 26 }, (_, i) => {
      const left = Math.random() * 100;
      const top = Math.random() * 100;
      const size = 1.5 + Math.random() * 3.5;
      const duration = 14 + Math.random() * 18;
      const delay = -(Math.random() * duration);
      const opacity = 0.18 + Math.random() * 0.5;
      return { id: i, left, top, size, duration, delay, opacity };
    });
  }, []);

  // School of small fish swimming across in the mid-distance
  const fishSchool = [
    { id: 1, x: 0, y: 0, s: 0.9 },
    { id: 2, x: -18, y: -10, s: 0.8 },
    { id: 3, x: -20, y: 12, s: 0.85 },
    { id: 4, x: -35, y: -5, s: 0.75 },
    { id: 5, x: -34, y: 16, s: 0.7 },
    { id: 6, x: -50, y: 8, s: 0.78 },
    { id: 7, x: -48, y: -14, s: 0.65 },
    { id: 8, x: -66, y: -2, s: 0.72 },
    { id: 9, x: -64, y: 14, s: 0.68 },
    { id: 10, x: -80, y: 6, s: 0.75 },
    { id: 11, x: -94, y: -4, s: 0.68 },
    { id: 12, x: -108, y: 8, s: 0.6 },
  ];

  return (
    <div className="about-ocean-atmosphere-root" aria-hidden="true">
      {/* 1. Deep Oceanic Gradient Backdrop */}
      <div className="about-abyss-gradient" />

      {/* 2. Soft Volumetric Downwelling Light Rays */}
      <div className="about-light-rays-layer">
        <svg viewBox="0 0 1440 800" preserveAspectRatio="none" className="about-rays-svg">
          <defs>
            <linearGradient id="aboutRayGradCenter" x1="50%" y1="0%" x2="45%" y2="100%">
              <stop offset="0%" stopColor="#38bdf8" stopOpacity="0.09" />
              <stop offset="35%" stopColor="#0ea5e9" stopOpacity="0.05" />
              <stop offset="100%" stopColor="#010610" stopOpacity="0" />
            </linearGradient>
            <filter id="aboutRayBlur" x="-10%" y="-10%" width="120%" height="120%">
              <feGaussianBlur stdDeviation="24" />
            </filter>
          </defs>
          <polygon
            className="about-sunbeam ray-center"
            points="620,0 820,0 960,800 480,800"
            fill="url(#aboutRayGradCenter)"
            filter="url(#aboutRayBlur)"
          />
          <polygon
            className="about-sunbeam ray-left"
            points="240,0 380,0 460,800 120,800"
            fill="url(#aboutRayGradCenter)"
            filter="url(#aboutRayBlur)"
            opacity="0.65"
          />
          <polygon
            className="about-sunbeam ray-right"
            points="1040,0 1180,0 1340,800 920,800"
            fill="url(#aboutRayGradCenter)"
            filter="url(#aboutRayBlur)"
            opacity="0.65"
          />
        </svg>
      </div>

      {/* 3. Rising Ambient Deep-Sea Bubbles */}
      <div className="about-bubbles-layer">
        {bubbles.map((b) => (
          <span
            key={b.id}
            className="about-ambient-bubble"
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

      {/* 4. Drifting Marine Particles */}
      <div className="about-particles-layer">
        {particles.map((p) => (
          <span
            key={p.id}
            className="about-marine-particle"
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

      {/* 5. Swimming Distant Fish School (Upper-mid water column) */}
      <div className="about-creature-track about-fish-school-track">
        <div className="about-fish-school-cluster">
          {fishSchool.map((f) => (
            <div
              key={f.id}
              className="about-single-fish"
              style={{
                transform: `translate3d(${f.x}px, ${f.y}px, 0) scale(${f.s})`,
              }}
            >
              <svg viewBox="0 0 36 14" width="30" height="12">
                <path
                  d="M 34,7 C 30,3 23,1 15,2 C 8,3 3,4 0,7 C 3,10 8,11 15,12 C 23,13 30,11 34,7 Z"
                  fill="#03152a"
                />
                <path
                  className="about-fish-tail"
                  d="M 2,7 L -3,3 C -1,5 -1,7 -2,7 C -1,7 -1,9 -3,11 Z"
                  fill="#03152a"
                />
              </svg>
            </div>
          ))}
        </div>
      </div>

      {/* 6. Distant Deep Manta Ray Cruiser */}
      <div className="about-creature-track about-manta-track">
        <svg viewBox="0 0 140 100" width="115" height="82">
          <path
            className="about-manta-wings"
            d="
              M 70,12
              C 95,20 130,45 138,62
              C 134,66 112,60 88,68
              C 82,78 76,96 74,100
              C 72,96 66,78 60,68
              C 36,60 14,66 10,62
              C 18,45 53,20 70,12
              Z
            "
            fill="#020e1e"
            opacity="0.45"
          />
        </svg>
      </div>

      {/* 7. Marine Flora & Seaweed Silhouettes (Framing Left & Right Edges) */}
      <div className="about-flora-flanks" aria-hidden="true">
        {/* Left deep kelp fronds */}
        <div className="about-kelp-left">
          <svg viewBox="0 0 220 600" preserveAspectRatio="none" className="about-kelp-svg">
            <defs>
              <linearGradient id="aboutKelpGradLeft" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor="#041a34" stopOpacity="0.7" />
                <stop offset="70%" stopColor="#020e1d" stopOpacity="0.9" />
                <stop offset="100%" stopColor="#010610" stopOpacity="1" />
              </linearGradient>
            </defs>
            <path
              className="about-kelp-sway-1"
              d="
                M 30,600
                Q 15,440 38,320
                T 20,180
                Q 5,90 28,30
                Q 38,5 24,0
                Q 36,15 28,50
                Q 8,110 24,195
                T 44,330
                Q 20,445 35,600
                Z
              "
              fill="url(#aboutKelpGradLeft)"
            />
            {/* Outward leafy blade */}
            <path
              d="M 28,320 Q 75,285 105,240 Q 78,265 28,325 Z"
              fill="#03162b"
              opacity="0.6"
            />
          </svg>
        </div>

        {/* Right deep kelp fronds */}
        <div className="about-kelp-right">
          <svg viewBox="0 0 220 600" preserveAspectRatio="none" className="about-kelp-svg">
            <defs>
              <linearGradient id="aboutKelpGradRight" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor="#041a34" stopOpacity="0.7" />
                <stop offset="70%" stopColor="#020e1d" stopOpacity="0.9" />
                <stop offset="100%" stopColor="#010610" stopOpacity="1" />
              </linearGradient>
            </defs>
            <path
              className="about-kelp-sway-2"
              d="
                M 190,600
                Q 205,440 182,320
                T 200,180
                Q 215,90 192,30
                Q 182,5 196,0
                Q 184,15 192,50
                Q 212,110 196,195
                T 176,330
                Q 200,445 185,600
                Z
              "
              fill="url(#aboutKelpGradRight)"
            />
            <path
              d="M 182,320 Q 135,285 105,240 Q 132,265 182,325 Z"
              fill="#03162b"
              opacity="0.6"
            />
          </svg>
        </div>
      </div>
    </div>
  );
};

export default AboutOceanAtmosphere;
