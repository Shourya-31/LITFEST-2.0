import React from 'react';
import './LanternFish.css';

export const LanternFish: React.FC = () => {
  return (
    <div className="lanternfish-container" aria-hidden="true">
      {/* Ambient water illumination aura cast by the glowing esca bulb */}
      <div className="esca-water-halo" />

      <svg
        className="lanternfish-svg"
        viewBox="0 0 240 180"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          {/* Deep-water silhouette gradient for fish body */}
          <linearGradient id="lanternFishBodyGrad" x1="20%" y1="20%" x2="90%" y2="80%">
            <stop offset="0%" stopColor="#041528" />
            <stop offset="50%" stopColor="#020c18" />
            <stop offset="100%" stopColor="#010610" />
          </linearGradient>

          {/* Glowing Esca bulb gradients */}
          <radialGradient id="escaCoreGlow" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#ffffff" stopOpacity="1" />
            <stop offset="35%" stopColor="#a5f3fc" stopOpacity="0.95" />
            <stop offset="70%" stopColor="#38bdf8" stopOpacity="0.8" />
            <stop offset="100%" stopColor="#0284c7" stopOpacity="0" />
          </radialGradient>

          <radialGradient id="escaAuraGlow" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#38bdf8" stopOpacity="0.5" />
            <stop offset="50%" stopColor="#0284c7" stopOpacity="0.2" />
            <stop offset="100%" stopColor="#010610" stopOpacity="0" />
          </radialGradient>

          {/* Soft blur for outer bioluminescent illumination */}
          <filter id="escaBloom" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur in="SourceGraphic" stdDeviation="4" />
          </filter>
        </defs>

        {/* ----------------------------------------------------
            1. REAR TAIL FIN (Gentle Wag Motion)
            ---------------------------------------------------- */}
        <g className="lantern-tail-group">
          {/* Flared caudal tail fin */}
          <path
            className="lantern-caudal-fin"
            d="
              M 188,102
              C 198,88 214,75 228,70
              C 222,86 220,98 226,104
              C 220,110 222,122 228,138
              C 214,133 198,120 188,106
              Z
            "
            fill="#020e1c"
            stroke="rgba(56, 189, 248, 0.2)"
            strokeWidth="0.8"
          />
          {/* Tail fin ray lines */}
          <path
            d="M 190,104 Q 206,94 224,78 M 190,104 Q 210,104 224,104 M 190,104 Q 206,114 224,130"
            stroke="rgba(56, 189, 248, 0.15)"
            strokeWidth="0.8"
            fill="none"
          />
        </g>

        {/* ----------------------------------------------------
            2. MAIN BODY SILHOUETTE (Facing Left)
            ---------------------------------------------------- */}
        <g className="lantern-body-group">
          {/* Dorsal Fin (spiny rayed crest) */}
          <path
            d="
              M 135,74
              C 142,54 154,48 162,46
              C 158,58 160,68 170,72
              C 162,75 148,76 135,74
              Z
            "
            fill="#020e1c"
            stroke="rgba(56, 189, 248, 0.18)"
            strokeWidth="0.8"
          />
          {/* Anal / Ventral fin */}
          <path
            d="
              M 152,126
              C 158,138 166,144 172,145
              C 168,138 169,132 176,128
              C 168,126 158,126 152,126
              Z
            "
            fill="#020e1c"
            stroke="rgba(56, 189, 248, 0.18)"
            strokeWidth="0.8"
          />

          {/* Main silhouette: Large bulbous head, cavernous jaw, deep rounded belly */}
          <path
            className="lantern-torso"
            d="
              M 42,94
              C 40,86 48,74 62,68
              C 76,62 96,64 120,68
              C 148,72 172,88 188,102
              C 188,106 172,120 148,126
              C 126,132 102,136 78,128
              C 62,122 48,110 42,94
              Z
            "
            fill="url(#lanternFishBodyGrad)"
            stroke="rgba(56, 189, 248, 0.25)"
            strokeWidth="1"
          />

          {/* Gaping mouth line & subtle needle teeth silhouette */}
          <path
            d="M 44,95 Q 64,98 76,110"
            stroke="#010610"
            strokeWidth="2.5"
            fill="none"
          />
          {/* Subtle sharp teeth needle tips */}
          <path
            d="
              M 48,95 L 49,99 L 52,95
              M 55,96 L 56,101 L 59,96
              M 62,97 L 64,103 L 67,98
              M 50,105 L 53,101 L 55,106
              M 58,108 L 61,103 L 64,109
              M 66,110 L 69,105 L 72,111
            "
            stroke="rgba(224, 242, 254, 0.35)"
            strokeWidth="0.8"
            fill="none"
          />

          {/* Pectoral Fin (delicate fan fin behind gill) */}
          <path
            className="lantern-pectoral-fin"
            d="
              M 92,102
              C 104,96 118,98 126,104
              C 120,110 114,116 102,114
              C 94,112 92,106 92,102
              Z
            "
            fill="#03162b"
            stroke="rgba(56, 189, 248, 0.2)"
            strokeWidth="0.8"
          />

          {/* Faint gill slit & subtle shadowed eye contour */}
          <path
            d="M 85,86 C 88,96 86,108 80,114"
            stroke="rgba(0, 0, 0, 0.5)"
            strokeWidth="1.5"
            strokeLinecap="round"
            fill="none"
          />
          {/* Shadowy, small deep-sea eye (barely noticeable, preserves dark silhouette) */}
          <circle cx="58" cy="80" r="3.2" fill="#010814" stroke="rgba(56, 189, 248, 0.2)" strokeWidth="0.8" />
          <circle cx="57.5" cy="79.5" r="0.8" fill="#38bdf8" opacity="0.6" />
        </g>

        {/* ----------------------------------------------------
            3. PROTRUDING LURE & GLOWING ESCA BULB
            (The distinctive searching lantern)
            ---------------------------------------------------- */}
        <g className="lantern-lure-group">
          {/* Lure stalk (illicium) arching upward and forward from forehead */}
          <path
            className="lure-stalk"
            d="
              M 66,66
              C 62,48 54,30 38,28
              C 26,26 18,36 22,50
            "
            stroke="#082b4c"
            strokeWidth="2.2"
            strokeLinecap="round"
            fill="none"
          />
          {/* Whispy tactile antenna filament extending from lure */}
          <path
            d="M 22,50 Q 15,56 12,65"
            stroke="rgba(56, 189, 248, 0.4)"
            strokeWidth="0.8"
            fill="none"
          />

          {/* Large soft cyan outer halo */}
          <circle
            cx="22"
            cy="50"
            r="28"
            fill="url(#escaAuraGlow)"
            className="esca-soft-aura"
          />

          {/* Luminous glowing Esca bulb */}
          <circle
            cx="22"
            cy="50"
            r="7"
            fill="url(#escaCoreGlow)"
            className="esca-glowing-bulb"
          />

          {/* Core bright white spark point */}
          <circle
            cx="22"
            cy="50"
            r="2.5"
            fill="#ffffff"
            className="esca-core-spark"
          />
        </g>
      </svg>
    </div>
  );
};

export default LanternFish;
