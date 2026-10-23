import React from 'react';
import './MarineLife.css';

export const MarineLife: React.FC = () => {
  // Generate coordinates for an organic, natural school of small fish
  const fishSchool = [
    { id: 1, x: 0, y: 0, s: 1.0 },
    { id: 2, x: -16, y: -10, s: 0.9 },
    { id: 3, x: -18, y: 12, s: 0.95 },
    { id: 4, x: -32, y: -6, s: 0.85 },
    { id: 5, x: -30, y: 18, s: 0.8 },
    { id: 6, x: -46, y: 6, s: 0.88 },
    { id: 7, x: -44, y: -16, s: 0.75 },
    { id: 8, x: -60, y: -4, s: 0.82 },
    { id: 9, x: -58, y: 16, s: 0.78 },
    { id: 10, x: -74, y: 8, s: 0.85 },
    { id: 11, x: -70, y: -12, s: 0.72 },
    { id: 12, x: -88, y: 0, s: 0.8 },
    { id: 13, x: -84, y: 22, s: 0.7 },
    { id: 14, x: -98, y: -8, s: 0.75 },
    { id: 15, x: -102, y: 12, s: 0.68 },
    { id: 16, x: -116, y: 4, s: 0.72 },
    { id: 17, x: -120, y: -16, s: 0.65 },
    { id: 18, x: -132, y: 18, s: 0.6 },
    { id: 19, x: -136, y: -4, s: 0.65 },
    { id: 20, x: -148, y: 8, s: 0.58 },
  ];

  return (
    <div className="marine-life-layer" aria-hidden="true">
      {/* 1. OCCASIONAL MAJESTIC WHALE (Deep background abyss) */}
      <div className="creature-track whale-track">
        <svg
          className="whale-svg"
          viewBox="0 0 540 180"
          width="540"
          height="180"
        >
          {/* Whale body silhouette */}
          <path
            className="whale-body"
            d="
              M 510,75
              C 480,50 420,38 340,36
              C 270,34 210,42 160,52
              C 120,60 85,68 55,62
              C 35,58 20,44 14,35
              C 10,28 6,32 10,48
              C 14,64 16,74 22,82
              C 12,92 4,115 2,125
              C 6,122 15,108 24,96
              C 32,90 48,94 70,98
              C 100,104 140,110 185,112
              C 220,122 250,140 270,158
              C 278,166 284,162 280,150
              C 274,134 278,118 310,112
              C 370,108 440,104 490,92
              C 520,84 530,78 510,75
              Z
            "
            fill="#020e1d"
          />
          {/* Faint ventral pleats texture */}
          <path
            d="M 360,98 Q 420,92 470,84 M 350,103 Q 410,97 460,88"
            stroke="rgba(0, 0, 0, 0.4)"
            strokeWidth="1.5"
            fill="none"
          />
        </svg>
      </div>

      {/* 2. SCHOOL OF SMALL FISH (Passing through the upper sunbeams) */}
      <div className="creature-track fish-school-track">
        <div className="fish-school-cluster">
          {fishSchool.map((f) => (
            <div
              key={f.id}
              className="single-fish"
              style={{
                transform: `translate3d(${f.x}px, ${f.y}px, 0) scale(${f.s})`,
              }}
            >
              <svg viewBox="0 0 40 16" width="34" height="14">
                <path
                  d="M 38,8 C 34,4 26,1 17,2 C 9,3 4,5 0,8 C 4,11 9,13 17,14 C 26,15 34,12 38,8 Z"
                  fill="#031220"
                />
                <path
                  className="fish-tail-wag"
                  d="M 2,8 L -3,3 C -1,6 -1,8 -2,8 C -1,9 -1,11 -3,13 Z"
                  fill="#031220"
                />
              </svg>
            </div>
          ))}
        </div>
      </div>

      {/* 3. SHARK (Slow graceful cruiser in mid-left depth) */}
      <div className="creature-track shark-track">
        <svg
          className="shark-svg"
          viewBox="0 0 320 110"
          width="320"
          height="110"
        >
          <path
            d="
              M 300,52
              C 280,40 250,36 215,34
              C 190,34 165,18 152,8
              C 146,3 139,6 142,16
              C 145,26 144,32 122,36
              C 95,39 70,41 52,45
              C 45,39 39,37 35,37
              C 33,41 35,45 28,48
              C 22,50 16,49 12,47
              C 8,39 4,22 1,10
              C -1,8 -2,12 3,26
              C 6,36 7,45 9,51
              C 6,55 2,64 0,72
              C 4,70 8,63 14,58
              C 20,56 26,56 35,58
              C 39,62 37,67 33,69
              C 42,67 48,61 60,61
              C 75,63 95,66 114,66
              C 118,72 128,88 140,99
              C 144,103 147,101 145,93
              C 142,83 146,72 165,66
              C 208,64 265,62 300,52
              Z
            "
            fill="#020f1e"
          />
        </svg>
      </div>

      {/* 4. OCTOPUS (Upper water layer, drifting near top right) */}
      <div className="creature-track octopus-track">
        <svg
          className="octopus-svg"
          viewBox="0 0 180 190"
          width="180"
          height="190"
        >
          {/* Mantle */}
          <path
            className="octopus-head"
            d="
              M 90,14
              C 58,14 44,40 48,72
              C 50,86 60,94 70,98
              C 76,100 104,100 110,98
              C 120,94 130,86 132,72
              C 136,40 122,14 90,14
              Z
            "
            fill="#021124"
          />
          {/* Tentacles */}
          <path
            className="tentacle-arm t-arm-1"
            d="M 52,94 C 30,105 10,120 12,142 C 14,160 30,166 38,154 C 42,146 36,134 26,136"
            fill="none"
            stroke="#021124"
            strokeWidth="7"
            strokeLinecap="round"
          />
          <path
            className="tentacle-arm t-arm-2"
            d="M 64,98 C 48,118 34,140 40,165 C 45,178 58,178 62,165 C 64,152 54,144 48,146"
            fill="none"
            stroke="#021124"
            strokeWidth="6.5"
            strokeLinecap="round"
          />
          <path
            className="tentacle-arm t-arm-3"
            d="M 76,100 C 66,122 58,148 70,172 C 76,182 86,180 84,168 C 82,154 74,148 70,150"
            fill="none"
            stroke="#021124"
            strokeWidth="6"
            strokeLinecap="round"
          />
          <path
            className="tentacle-arm t-arm-4"
            d="M 85,101 C 80,122 75,150 80,176 C 82,185 92,182 92,170 C 90,156 84,146 82,148"
            fill="none"
            stroke="#021124"
            strokeWidth="5.5"
            strokeLinecap="round"
          />
          <path
            className="tentacle-arm t-arm-5"
            d="M 95,101 C 100,122 105,150 100,176 C 98,185 88,182 88,170 C 90,156 96,146 98,148"
            fill="none"
            stroke="#021124"
            strokeWidth="5.5"
            strokeLinecap="round"
          />
          <path
            className="tentacle-arm t-arm-6"
            d="M 104,100 C 114,122 122,148 110,172 C 104,182 94,180 96,168 C 98,154 106,148 110,150"
            fill="none"
            stroke="#021124"
            strokeWidth="6"
            strokeLinecap="round"
          />
          <path
            className="tentacle-arm t-arm-7"
            d="M 116,98 C 132,118 146,140 140,165 C 135,178 122,178 118,165 C 116,152 126,144 132,146"
            fill="none"
            stroke="#021124"
            strokeWidth="6.5"
            strokeLinecap="round"
          />
          <path
            className="tentacle-arm t-arm-8"
            d="M 128,94 C 150,105 170,120 168,142 C 166,160 150,166 142,154 C 138,146 144,134 154,136"
            fill="none"
            stroke="#021124"
            strokeWidth="7"
            strokeLinecap="round"
          />
        </svg>
      </div>

      {/* 5. TRANSLUCENT BIOLUMINESCENT JELLYFISHES */}
      {/* Primary Jellyfish (Right midwater) */}
      <div className="creature-track jellyfish-track jelly-main">
        <svg
          className="jelly-svg"
          viewBox="0 0 120 220"
          width="120"
          height="220"
        >
          <defs>
            <linearGradient id="jellyBellGrad" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#38bdf8" stopOpacity="0.85" />
              <stop offset="40%" stopColor="#0ea5e9" stopOpacity="0.55" />
              <stop offset="90%" stopColor="#0284c7" stopOpacity="0.15" />
              <stop offset="100%" stopColor="#0369a1" stopOpacity="0" />
            </linearGradient>
            <radialGradient id="jellyGlow" cx="50%" cy="40%" r="45%">
              <stop offset="0%" stopColor="#e0f2fe" stopOpacity="0.8" />
              <stop offset="60%" stopColor="#38bdf8" stopOpacity="0.4" />
              <stop offset="100%" stopColor="#0284c7" stopOpacity="0" />
            </radialGradient>
          </defs>

          {/* Translucent Pulsing Bell */}
          <path
            className="jelly-bell"
            d="
              M 18,65
              C 18,24 35,10 60,10
              C 85,10 102,24 102,65
              C 95,70 86,66 79,69
              C 73,72 66,68 60,71
              C 54,68 47,72 41,69
              C 34,66 25,70 18,65
              Z
            "
            fill="url(#jellyBellGrad)"
          />

          {/* Luminous Core */}
          <ellipse cx="60" cy="42" rx="22" ry="16" fill="url(#jellyGlow)" />

          {/* Oral arms */}
          <path
            d="M 50,70 Q 44,95 56,125 Q 46,145 58,175 Q 52,150 48,125 Z"
            fill="#38bdf8"
            opacity="0.6"
          />
          <path
            d="M 70,70 Q 76,95 64,125 Q 74,145 62,175 Q 68,150 72,125 Z"
            fill="#0ea5e9"
            opacity="0.5"
          />

          {/* Whispy Tentacles */}
          <path
            className="jelly-filament f1"
            d="M 28,68 Q 20,110 32,155 T 24,205"
            fill="none"
            stroke="#7dd3fc"
            strokeWidth="1.2"
            opacity="0.6"
          />
          <path
            className="jelly-filament f2"
            d="M 40,70 Q 34,115 46,160 T 36,215"
            fill="none"
            stroke="#38bdf8"
            strokeWidth="1.4"
            opacity="0.75"
          />
          <path
            className="jelly-filament f3"
            d="M 80,70 Q 86,115 74,160 T 84,215"
            fill="none"
            stroke="#38bdf8"
            strokeWidth="1.4"
            opacity="0.75"
          />
          <path
            className="jelly-filament f4"
            d="M 92,68 Q 100,110 88,155 T 96,205"
            fill="none"
            stroke="#7dd3fc"
            strokeWidth="1.2"
            opacity="0.6"
          />
        </svg>
      </div>

      {/* Secondary Jellyfish (Distant background) */}
      <div className="creature-track jellyfish-track jelly-distant">
        <svg
          className="jelly-svg"
          viewBox="0 0 120 220"
          width="75"
          height="140"
        >
          <path
            className="jelly-bell"
            d="
              M 18,65
              C 18,24 35,10 60,10
              C 85,10 102,24 102,65
              C 95,70 86,66 79,69
              C 73,72 66,68 60,71
              C 54,68 47,72 41,69
              C 34,66 25,70 18,65
              Z
            "
            fill="rgba(56, 189, 248, 0.45)"
          />
          <path
            d="M 35,70 Q 30,115 40,160 T 32,210"
            fill="none"
            stroke="#38bdf8"
            strokeWidth="1"
            opacity="0.4"
          />
          <path
            d="M 85,70 Q 90,115 80,160 T 88,210"
            fill="none"
            stroke="#38bdf8"
            strokeWidth="1"
            opacity="0.4"
          />
        </svg>
      </div>

      {/* 6. MANTA RAYS (Gliding through lower abyss) */}
      <div className="creature-track manta-track manta-1">
        <svg viewBox="0 0 140 100" width="130" height="90">
          <path
            className="manta-wings"
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
            fill="#020d1c"
          />
        </svg>
      </div>

      <div className="creature-track manta-track manta-2">
        <svg viewBox="0 0 140 100" width="95" height="68">
          <path
            className="manta-wings"
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
            fill="#010915"
          />
        </svg>
      </div>
    </div>
  );
};
