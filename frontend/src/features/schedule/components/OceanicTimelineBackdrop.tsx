import React, { useMemo } from 'react';
import './OceanicTimelineBackdrop.css';

interface OceanicTimelineBackdropProps {
  currentZ: number;
  maxCameraZ?: number;
  activeIdx?: number;
}

export const OceanicTimelineBackdrop: React.FC<OceanicTimelineBackdropProps> = ({
  currentZ,
  maxCameraZ = 15600,
}) => {
  // Normalize scroll depth from 0 (Event 1, upper reef) to 1 (Event 14, deep abyssal trench)
  const progress = Math.max(0, Math.min(1, currentZ / maxCameraZ));

  // Parallax offsets computed from current 3D voyage Z-traversal
  const seabedOffsetNear = -(currentZ * 0.12) % 1600;
  const seabedOffsetMid = -(currentZ * 0.06) % 1600;
  const seabedOffsetDeep = -(currentZ * 0.025) % 1600;
  const verticalDiveShift = Math.min(120, progress * 120);

  // Parallax drift for swimming creatures
  const whaleX = ((currentZ * 0.18) % 3200) - 400; // Whales cruise across
  const fishSchoolOffset = (currentZ * 0.35) % 2400;
  const mantaOffset = (currentZ * 0.14) % 2800;
  const lanternFishOffset = ((currentZ * 0.12) % 2200) - 200;

  // Generate 28 organic floating bioluminescent plankton/marine snow nodes
  const marineSnow = useMemo(() => {
    return Array.from({ length: 28 }, (_, i) => ({
      id: i,
      left: (i * 3.7 + Math.sin(i * 1.5) * 8) % 98,
      top: (i * 3.5 + Math.cos(i * 1.2) * 15) % 94,
      size: 1.5 + (i % 4) * 0.8,
      opacity: 0.25 + (i % 5) * 0.15,
      delay: -(i * 0.6),
      duration: 3.5 + (i % 5) * 1.2,
      depthSpeed: 0.15 + (i % 4) * 0.12,
    }));
  }, []);

  // Generate 16 small fish in a darting school
  const schoolFish = useMemo(() => {
    return [
      { id: 1, x: 0, y: 0, s: 1.0 },
      { id: 2, x: -18, y: -12, s: 0.9 },
      { id: 3, x: -16, y: 14, s: 0.95 },
      { id: 4, x: -34, y: -6, s: 0.85 },
      { id: 5, x: -32, y: 20, s: 0.8 },
      { id: 6, x: -50, y: 8, s: 0.88 },
      { id: 7, x: -48, y: -18, s: 0.75 },
      { id: 8, x: -66, y: -4, s: 0.82 },
      { id: 9, x: -64, y: 18, s: 0.78 },
      { id: 10, x: -82, y: 10, s: 0.85 },
      { id: 11, x: -78, y: -14, s: 0.72 },
      { id: 12, x: -96, y: 2, s: 0.8 },
      { id: 13, x: -92, y: 24, s: 0.7 },
      { id: 14, x: -110, y: -10, s: 0.75 },
      { id: 15, x: -114, y: 14, s: 0.68 },
      { id: 16, x: -128, y: 6, s: 0.72 },
    ];
  }, []);

  return (
    <div
      className="oceanic-timeline-backdrop"
      aria-hidden="true"
      style={{
        '--sea-progress': progress.toString(),
        '--current-z': `${currentZ}px`,
      } as React.CSSProperties}
    >
      {/* =========================================================================
          1. WATER COLUMN DEPTH GRADIENT & VOLUMETRIC SUNBEAM CAUSTICS
          ========================================================================= */}
      <div className="oceanic-depth-veil" />

      {/* Volumetric sunbeams filtering from above (softens as we dive deeper) */}
      <div
        className="oceanic-caustic-sunbeams"
        style={{
          opacity: Math.max(0, 0.85 - progress * 1.1),
        }}
      />

      {/* Deep sea ambient glow aura at current milestone */}
      <div
        className="abyssal-depth-bloom"
        style={{
          opacity: 0.35 + progress * 0.45,
          transform: `scale(${1 + progress * 0.25})`,
        }}
      />

      {/* =========================================================================
          2. DISTANT SEABED RIDGE CONTOURS (Parallax Horizon)
          ========================================================================= */}
      <div className="seabed-ridge-layer ridge-distant" style={{ transform: `translate3d(${seabedOffsetDeep}px, ${verticalDiveShift * 0.3}px, 0)` }}>
        <svg viewBox="0 0 1600 240" preserveAspectRatio="none" className="seabed-ridge-svg">
          <path
            d="
              M 0,240 L 0,140
              Q 220,105 480,135
              T 960,110
              Q 1200,90 1440,125
              L 1600,115 L 1600,240 Z
            "
            fill="#010a17"
            opacity="0.6"
          />
        </svg>
      </div>

      {/* =========================================================================
          3. DISTANT SUNKEN PIRATE SHIPWRECK ON SEABED (Mid-voyage event 5-9)
          ========================================================================= */}
      <div
        className="timeline-shipwreck-zone"
        style={{
          opacity: Math.max(0, Math.min(0.85, (progress - 0.2) * 3, (0.85 - progress) * 3)),
          transform: `translate3d(${-200 + progress * 240}px, ${40 - progress * 50}px, -400px) scale(${0.75 + progress * 0.3})`,
        }}
      >
        <svg className="timeline-shipwreck-svg" viewBox="0 0 520 380" fill="none">
          <defs>
            <linearGradient id="wreckHullGrad" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#082845" stopOpacity="0.75" />
              <stop offset="45%" stopColor="#041528" stopOpacity="0.65" />
              <stop offset="100%" stopColor="#010610" stopOpacity="0" />
            </linearGradient>
            <linearGradient id="wreckMastGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#0c3860" stopOpacity="0.8" />
              <stop offset="100%" stopColor="#020d1c" stopOpacity="0.4" />
            </linearGradient>
          </defs>

          {/* Broken main mast & tilted yards */}
          <g opacity="0.65">
            <path d="M 260,220 L 265,65 L 258,60 L 268,45 L 272,60 L 274,220 Z" fill="url(#wreckMastGrad)" />
            <path d="M 190,100 L 268,112 L 340,125 L 336,130 L 268,118 L 188,105 Z" fill="url(#wreckMastGrad)" />
            {/* Foremast leaning forward */}
            <path d="M 160,225 L 152,105 L 148,108 L 155,95 L 160,108 L 164,225 Z" fill="url(#wreckMastGrad)" />
            {/* Rigging shreds */}
            <path d="M 268,48 Q 200,130 150,200" stroke="#0ea5e9" strokeWidth="0.8" opacity="0.3" strokeDasharray="4 2" />
            <path d="M 268,48 Q 310,125 370,210" stroke="#0ea5e9" strokeWidth="0.8" opacity="0.3" />
            {/* Seaweed tendrils hanging from spar */}
            <path d="M 205,105 Q 210,135 206,170" stroke="#06223d" strokeWidth="1.2" strokeLinecap="round" />
            <path d="M 320,120 Q 316,150 322,185" stroke="#06223d" strokeWidth="1.2" strokeLinecap="round" />
          </g>

          {/* Galleon hull resting on seabed */}
          <path
            d="
              M 65,220
              C 95,214 140,212 210,213
              C 280,215 350,218 410,208
              C 430,204 445,212 448,228
              C 452,245 440,265 430,282
              C 395,320 325,352 235,365
              C 145,375 88,345 62,290
              C 52,266 55,238 65,220
              Z
            "
            fill="url(#wreckHullGrad)"
          />

          {/* Exposed hull rib frames */}
          <path
            d="
              M 110,220 C 108,245 112,272 124,300
              M 140,220 C 138,250 142,286 156,318
              M 172,219 C 170,255 176,295 194,330
              M 208,218 C 206,260 214,302 236,340
              M 244,219 C 244,262 254,308 280,345
              M 282,220 C 284,262 296,305 324,338
            "
            stroke="#072a4e"
            strokeWidth="2"
            strokeLinecap="round"
            fill="none"
            opacity="0.75"
          />
        </svg>
      </div>

      {/* =========================================================================
          4. SWIMMING CREATURES OF THE HIGH SEAS (Continuous Life & Parallax)
          ========================================================================= */}
      {/* A. Pod of Whales (Mother & Calf) Gliding across the abyss */}
      <div
        className="timeline-whale-pod"
        style={{
          transform: `translate3d(${whaleX}px, ${-60 + Math.sin(progress * Math.PI) * 50}px, 0)`,
        }}
      >
        {/* Mother Whale */}
        <div className="whale-adult-entity">
          <svg className="whale-adult-svg" viewBox="0 0 460 160" fill="none">
            <defs>
              <linearGradient id="whaleSkinGrad" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor="#082b4c" />
                <stop offset="45%" stopColor="#04182e" />
                <stop offset="100%" stopColor="#020c18" />
              </linearGradient>
              <linearGradient id="whaleRimGrad" x1="0%" y1="0%" x2="100%" y2="50%">
                <stop offset="0%" stopColor="#38bdf8" stopOpacity="0.8" />
                <stop offset="50%" stopColor="#0ea5e9" stopOpacity="0.4" />
                <stop offset="100%" stopColor="#0284c7" stopOpacity="0.1" />
              </linearGradient>
            </defs>

            {/* Torso */}
            <path
              className="whale-torso-path"
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
              fill="url(#whaleSkinGrad)"
              stroke="url(#whaleRimGrad)"
              strokeWidth="1.2"
            />
            {/* Ventral grooves */}
            <path
              d="M 56,86 C 85,96 140,105 210,104 M 68,92 C 95,101 150,110 225,108 M 82,98 C 110,107 165,114 235,111"
              stroke="rgba(56, 189, 248, 0.25)"
              strokeWidth="1"
              strokeLinecap="round"
              fill="none"
            />
            {/* Pectoral Fin */}
            <path
              className="whale-pec-fin"
              d="M 160,104 C 176,122 208,154 228,158 C 222,150 196,124 182,106 Z"
              fill="#061c36"
              stroke="rgba(56, 189, 248, 0.4)"
              strokeWidth="1"
            />
            {/* Animated Tail Fluke */}
            <g className="whale-tail-animated">
              <path
                d="M 440,86 C 446,74 458,62 464,58 C 460,78 450,88 455,90 C 460,92 466,104 460,114 C 450,104 442,94 438,90 Z"
                fill="#05172d"
                stroke="rgba(56, 189, 248, 0.4)"
                strokeWidth="1.2"
              />
            </g>
          </svg>
        </div>

        {/* Baby Calf Swimming in Slipstream */}
        <div className="whale-calf-entity">
          <svg className="whale-calf-svg" viewBox="0 0 460 160" fill="none">
            <path
              d="
                M 32,82 C 32,66 54,46 95,38 C 145,28 235,32 305,52 C 335,61 350,60 358,54 L 364,48
                C 365,58 372,66 385,72 C 408,79 432,84 445,86 C 440,94 415,98 385,98
                C 325,116 235,126 145,120 C 85,116 48,104 32,82 Z
              "
              fill="url(#whaleSkinGrad)"
              stroke="rgba(125, 211, 252, 0.5)"
              strokeWidth="1"
            />
            <g className="whale-tail-animated">
              <path
                d="M 440,86 C 446,74 458,62 464,58 C 460,78 450,88 455,90 C 460,92 466,104 460,114 C 450,104 442,94 438,90 Z"
                fill="#041629"
                stroke="rgba(125, 211, 252, 0.4)"
                strokeWidth="1"
              />
            </g>
          </svg>
        </div>
      </div>

      {/* B. Darting School of Fish with wagging tail fins */}
      <div
        className="timeline-fish-school"
        style={{
          transform: `translate3d(${-200 + fishSchoolOffset}px, ${80 + Math.sin(progress * 4) * 35}px, 0)`,
        }}
      >
        {schoolFish.map((f) => (
          <div
            key={f.id}
            className="schooling-fish"
            style={{
              transform: `translate3d(${f.x}px, ${f.y}px, 0) scale(${f.s})`,
            }}
          >
            <svg viewBox="0 0 40 16" width="30" height="12">
              <path
                d="M 38,8 C 34,4 26,1 17,2 C 9,3 4,5 0,8 C 4,11 9,13 17,14 C 26,15 34,12 38,8 Z"
                fill="#082845"
                stroke="rgba(56, 189, 248, 0.4)"
                strokeWidth="0.8"
              />
              <path
                className="school-tail-wag"
                d="M 2,8 L -3,3 C -1,6 -1,8 -2,8 C -1,9 -1,11 -3,13 Z"
                fill="#0ea5e9"
              />
            </svg>
          </div>
        ))}
      </div>

      {/* C. Translucent Bioluminescent Jellyfish Group (Rising with undulating bells) */}
      <div className="timeline-jellyfish-cluster">
        {/* Main Floating Jellyfish */}
        <div className="jelly-entity jelly-alpha" style={{ transform: `translate3d(0, ${-(currentZ * 0.08) % 600}px, 0)` }}>
          <svg className="jelly-svg" viewBox="0 0 120 220" width="105" height="195">
            <defs>
              <linearGradient id="jellyGradA" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor="#38bdf8" stopOpacity="0.85" />
                <stop offset="45%" stopColor="#0ea5e9" stopOpacity="0.55" />
                <stop offset="90%" stopColor="#0284c7" stopOpacity="0.15" />
                <stop offset="100%" stopColor="#0369a1" stopOpacity="0" />
              </linearGradient>
            </defs>
            <path
              className="jelly-bell-pulse"
              d="M 18,65 C 18,24 35,10 60,10 C 85,10 102,24 102,65 C 95,70 86,66 79,69 C 73,72 66,68 60,71 C 54,68 47,72 41,69 C 34,66 25,70 18,65 Z"
              fill="url(#jellyGradA)"
            />
            <ellipse cx="60" cy="42" rx="20" ry="14" fill="#a5f3fc" opacity="0.6" className="jelly-core-glow" />
            {/* Filament tentacles */}
            <path className="jelly-tentacle t1" d="M 32,68 Q 24,115 36,160 T 28,210" stroke="#7dd3fc" strokeWidth="1.2" fill="none" opacity="0.7" />
            <path className="jelly-tentacle t2" d="M 44,70 Q 38,120 50,165 T 40,220" stroke="#38bdf8" strokeWidth="1.4" fill="none" opacity="0.8" />
            <path className="jelly-tentacle t3" d="M 76,70 Q 82,120 70,165 T 80,220" stroke="#38bdf8" strokeWidth="1.4" fill="none" opacity="0.8" />
            <path className="jelly-tentacle t4" d="M 88,68 Q 96,115 84,160 T 92,210" stroke="#7dd3fc" strokeWidth="1.2" fill="none" opacity="0.7" />
          </svg>
        </div>

        {/* Secondary Distant Jellyfish */}
        <div className="jelly-entity jelly-beta" style={{ transform: `translate3d(0, ${-(currentZ * 0.05) % 500}px, 0)` }}>
          <svg className="jelly-svg" viewBox="0 0 120 220" width="70" height="130">
            <path
              className="jelly-bell-pulse"
              d="M 18,65 C 18,24 35,10 60,10 C 85,10 102,24 102,65 C 95,70 86,66 79,69 C 73,72 66,68 60,71 C 54,68 47,72 41,69 C 34,66 25,70 18,65 Z"
              fill="rgba(56, 189, 248, 0.45)"
            />
            <ellipse cx="60" cy="42" rx="14" ry="10" fill="#38bdf8" opacity="0.5" />
            <path className="jelly-tentacle t1" d="M 40,70 Q 35,115 45,160 T 36,210" stroke="#38bdf8" strokeWidth="1" fill="none" opacity="0.5" />
            <path className="jelly-tentacle t2" d="M 80,70 Q 85,115 75,160 T 84,210" stroke="#38bdf8" strokeWidth="1" fill="none" opacity="0.5" />
          </svg>
        </div>
      </div>

      {/* D. Deep Sea Lanternfish / Anglerfish with Glowing Esca Lure (Deep Abyss events 7-14) */}
      <div
        className="timeline-lanternfish"
        style={{
          opacity: Math.max(0, Math.min(1, (progress - 0.35) * 3)),
          transform: `translate3d(${lanternFishOffset}px, ${60 + Math.cos(progress * 3) * 30}px, 0)`,
        }}
      >
        <div className="esca-light-halo" />
        <svg className="lanternfish-svg" viewBox="0 0 240 180" fill="none">
          <defs>
            <linearGradient id="anglerSkinGrad" x1="20%" y1="20%" x2="90%" y2="80%">
              <stop offset="0%" stopColor="#04182e" />
              <stop offset="60%" stopColor="#020c18" />
              <stop offset="100%" stopColor="#010610" />
            </linearGradient>
            <radialGradient id="escaGlowGrad" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#ffffff" stopOpacity="1" />
              <stop offset="40%" stopColor="#a5f3fc" stopOpacity="0.95" />
              <stop offset="75%" stopColor="#38bdf8" stopOpacity="0.8" />
              <stop offset="100%" stopColor="#0284c7" stopOpacity="0" />
            </radialGradient>
          </defs>

          {/* Wagging tail fin */}
          <g className="angler-tail-wag">
            <path
              d="M 188,102 C 198,88 214,75 228,70 C 222,86 220,98 226,104 C 220,110 222,122 228,138 C 214,133 198,120 188,106 Z"
              fill="#020e1c"
              stroke="rgba(56, 189, 248, 0.25)"
              strokeWidth="0.8"
            />
          </g>

          {/* Main torso & cavernous jaw */}
          <path
            d="
              M 42,94 C 40,86 48,74 62,68 C 76,62 96,64 120,68 C 148,72 172,88 188,102
              C 188,106 172,120 148,126 C 126,132 102,136 78,128 C 62,122 48,110 42,94 Z
            "
            fill="url(#anglerSkinGrad)"
            stroke="rgba(56, 189, 248, 0.3)"
            strokeWidth="1"
          />

          {/* Needle teeth */}
          <path
            d="
              M 48,95 L 49,99 L 52,95 M 55,96 L 56,101 L 59,96 M 62,97 L 64,103 L 67,98
              M 50,105 L 53,101 L 55,106 M 58,108 L 61,103 L 64,109 M 66,110 L 69,105 L 72,111
            "
            stroke="rgba(224, 242, 254, 0.45)"
            strokeWidth="0.8"
            fill="none"
          />

          {/* Lure stalk & pulsating glowing esca bulb */}
          <path d="M 66,66 C 62,48 54,30 38,28 C 26,26 18,36 22,50" stroke="#0ea5e9" strokeWidth="2.2" strokeLinecap="round" fill="none" />
          <circle cx="22" cy="50" r="16" fill="rgba(56, 189, 248, 0.35)" className="esca-halo-pulse" />
          <circle cx="22" cy="50" r="6.5" fill="url(#escaGlowGrad)" className="esca-bulb-glow" />
          <circle cx="22" cy="50" r="2.5" fill="#ffffff" />
        </svg>
      </div>

      {/* E. Gliding Deep-Sea Manta Ray */}
      <div
        className="timeline-manta-cruiser"
        style={{
          transform: `translate3d(${-200 + mantaOffset}px, ${160 + Math.sin(progress * 2) * 40}px, 0)`,
        }}
      >
        <svg viewBox="0 0 140 100" width="130" height="90">
          <path
            className="manta-wings-undulate"
            d="M 70,12 C 95,20 130,45 138,62 C 134,66 112,60 88,68 C 82,78 76,96 74,100 C 72,96 66,78 60,68 C 36,60 14,66 10,62 C 18,45 53,20 70,12 Z"
            fill="#020e1d"
            stroke="rgba(56, 189, 248, 0.3)"
            strokeWidth="0.8"
          />
        </svg>
      </div>

      {/* =========================================================================
          5. LIVING SEABED FLORA & CORAL FORESTS (Continuous Swaying Plants)
          ========================================================================= */}
      {/* Midground Seabed Ridge */}
      <div className="seabed-ridge-layer ridge-midground" style={{ transform: `translate3d(${seabedOffsetMid}px, ${verticalDiveShift * 0.6}px, 0)` }}>
        <svg viewBox="0 0 1600 280" preserveAspectRatio="none" className="seabed-ridge-svg">
          <path
            d="
              M 0,280 L 0,160
              C 180,120 360,190 540,150
              C 720,110 900,180 1080,130
              C 1260,80 1440,160 1600,120
              L 1600,280 Z
            "
            fill="#020d1c"
            opacity="0.8"
          />
        </svg>
      </div>

      {/* LEFT FLANK KELP FOREST & BRANCHING CORALS */}
      <div className="seabed-flora-flank flank-left">
        <svg className="flora-svg flora-left-svg" viewBox="0 0 480 500" fill="none">
          <defs>
            <linearGradient id="kelpGradA" x1="0%" y1="100%" x2="0%" y2="0%">
              <stop offset="0%" stopColor="#010814" />
              <stop offset="40%" stopColor="#052446" />
              <stop offset="85%" stopColor="#0a4275" />
              <stop offset="100%" stopColor="#0ea5e9" stopOpacity="0.85" />
            </linearGradient>
            <linearGradient id="coralBranchGrad" x1="0%" y1="100%" x2="0%" y2="0%">
              <stop offset="0%" stopColor="#020c18" />
              <stop offset="50%" stopColor="#082b4c" />
              <stop offset="100%" stopColor="#1e5285" />
            </linearGradient>
          </defs>

          {/* Tall Swaying Kelp Fronds (Left Outer) */}
          <g className="kelp-stalk kelp-sway-slow">
            <path
              d="M 50,500 Q 20,380 60,280 T 30,120 Q 55,50 40,0 Q 80,60 55,140 T 75,300 Q 55,400 70,500 Z"
              fill="url(#kelpGradA)"
            />
            <circle cx="40" cy="8" r="3.5" fill="#38bdf8" className="bio-glow-node pulse-a" />
          </g>

          <g className="kelp-stalk kelp-sway-mid">
            <path
              d="M 120,500 Q 150,370 110,260 T 140,110 Q 120,40 135,10 Q 160,70 130,150 T 130,320 Q 150,420 140,500 Z"
              fill="url(#kelpGradA)"
              opacity="0.85"
            />
            <circle cx="135" cy="18" r="3.2" fill="#a5f3fc" className="bio-glow-node pulse-b" />
          </g>

          <g className="kelp-stalk kelp-sway-fast">
            <path
              d="M 190,500 Q 160,390 190,290 T 170,160 Q 200,90 185,50 Q 210,110 185,190 T 205,340 Q 185,430 205,500 Z"
              fill="url(#kelpGradA)"
              opacity="0.75"
            />
            <circle cx="185" cy="56" r="2.8" fill="#22d3ee" className="bio-glow-node pulse-c" />
          </g>

          {/* Branching Staghorn Corals & Glowing Polyps (Left Lower) */}
          <g className="coral-formation-group">
            <path
              d="
                M 80,500 L 95,360
                C 80,330 55,300 45,265 C 55,270 70,290 85,320
                C 82,270 78,220 72,175 C 80,185 86,210 88,245
                C 95,200 105,150 115,115 C 122,125 120,150 116,185
                C 128,155 145,120 160,88 C 165,100 155,125 142,155
                C 132,185 118,230 110,270
                L 125,500 Z
              "
              fill="url(#coralBranchGrad)"
            />
            {/* Glowing Coral Tips */}
            <circle cx="45" cy="265" r="3.5" fill="#38bdf8" className="bio-glow-node pulse-a" />
            <circle cx="72" cy="175" r="4" fill="#a5f3fc" className="bio-glow-node pulse-b" />
            <circle cx="115" cy="115" r="4.2" fill="#22d3ee" className="bio-glow-node pulse-c" />
            <circle cx="160" cy="88" r="3.8" fill="#7dd3fc" className="bio-glow-node pulse-a" />
          </g>
        </svg>
      </div>

      {/* RIGHT FLANK GORGONIAN SEA-FANS & REEF FORMATIONS */}
      <div className="seabed-flora-flank flank-right">
        <svg className="flora-svg flora-right-svg" viewBox="0 0 480 500" fill="none">
          <defs>
            <linearGradient id="gorgonianGrad" x1="0%" y1="100%" x2="0%" y2="0%">
              <stop offset="0%" stopColor="#010712" />
              <stop offset="50%" stopColor="#082845" />
              <stop offset="100%" stopColor="#144d7a" />
            </linearGradient>
          </defs>

          {/* Tall Kelp Stalks (Right Outer) */}
          <g className="kelp-stalk kelp-sway-mid">
            <path
              d="M 430,500 Q 460,380 420,270 T 450,110 Q 425,40 440,5 Q 400,65 425,145 T 405,305 Q 425,405 410,500 Z"
              fill="url(#kelpGradA)"
            />
            <circle cx="440" cy="12" r="3.5" fill="#38bdf8" className="bio-glow-node pulse-b" />
          </g>

          <g className="kelp-stalk kelp-sway-slow">
            <path
              d="M 360,500 Q 330,370 370,260 T 340,110 Q 360,40 345,15 Q 320,75 350,155 T 350,325 Q 330,425 340,500 Z"
              fill="url(#kelpGradA)"
              opacity="0.85"
            />
            <circle cx="345" cy="22" r="3.2" fill="#a5f3fc" className="bio-glow-node pulse-c" />
          </g>

          {/* Gorgonian Sea-Fan & Staghorn Coral (Right Lower) */}
          <g className="coral-formation-group">
            <path
              d="
                M 380,500 L 365,350
                C 380,320 410,290 425,255 C 415,260 400,280 385,310
                C 388,260 392,210 398,165 C 390,175 384,200 382,235
                C 375,190 365,140 355,105 C 348,115 350,140 354,175
                C 342,145 325,110 310,78 C 305,90 315,115 328,145
                C 338,175 352,220 360,260
                L 345,500 Z
              "
              fill="url(#gorgonianGrad)"
            />
            <circle cx="425" cy="255" r="3.6" fill="#38bdf8" className="bio-glow-node pulse-a" />
            <circle cx="398" cy="165" r="4.2" fill="#a5f3fc" className="bio-glow-node pulse-c" />
            <circle cx="355" cy="105" r="4" fill="#22d3ee" className="bio-glow-node pulse-b" />
            <circle cx="310" cy="78" r="3.6" fill="#7dd3fc" className="bio-glow-node pulse-a" />
          </g>
        </svg>
      </div>

      {/* Near Foreground Seabed Floor with Rocky Reef Shelf */}
      <div className="seabed-ridge-layer ridge-foreground" style={{ transform: `translate3d(${seabedOffsetNear}px, ${verticalDiveShift}px, 0)` }}>
        <svg viewBox="0 0 1600 220" preserveAspectRatio="none" className="seabed-ridge-svg">
          <path
            d="
              M 0,220 L 0,110
              C 120,70 240,130 380,90
              C 520,50 680,120 840,80
              C 1000,40 1140,110 1300,70
              C 1440,30 1520,90 1600,60
              L 1600,220 Z
            "
            fill="#010610"
          />
        </svg>
      </div>

      {/* =========================================================================
          6. SUSPENDED BIOLUMINESCENT MARINE SNOW & RISING OCEANIC BUBBLES
          ========================================================================= */}
      <div className="marine-snow-field">
        {marineSnow.map((p) => {
          const particleY = (p.top + currentZ * 0.05 * p.depthSpeed) % 100;
          return (
            <span
              key={p.id}
              className="marine-snow-mote"
              style={{
                left: `${p.left}%`,
                top: `${particleY}%`,
                width: `${p.size}px`,
                height: `${p.size}px`,
                opacity: p.opacity,
                animationDuration: `${p.duration}s`,
                animationDelay: `${p.delay}s`,
              }}
            />
          );
        })}
      </div>

      {/* Thermal vent bubble streams rising from seabed */}
      <div className="seabed-thermal-bubbles">
        <div className="bubble-vent vent-left" />
        <div className="bubble-vent vent-center" />
        <div className="bubble-vent vent-right" />
      </div>
    </div>
  );
};

export default OceanicTimelineBackdrop;
