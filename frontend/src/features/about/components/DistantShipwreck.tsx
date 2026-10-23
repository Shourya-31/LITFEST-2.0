import React from 'react';
import './DistantShipwreck.css';

export const DistantShipwreck: React.FC = () => {
  return (
    <div className="distant-shipwreck-container" aria-hidden="true">
      {/* Soft atmospheric deep-ocean haze behind the wreckage */}
      <div className="shipwreck-ambient-haze" />

      <svg
        className="shipwreck-svg"
        viewBox="0 0 540 420"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          {/* Faint distant seabed terrain gradient (Soft, hazy, no hard horizontal ground) */}
          <linearGradient id="seabedHazeGrad" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#03162a" stopOpacity="0.5" />
            <stop offset="45%" stopColor="#020d1c" stopOpacity="0.4" />
            <stop offset="85%" stopColor="#010712" stopOpacity="0.15" />
            <stop offset="100%" stopColor="#010610" stopOpacity="0" />
          </linearGradient>

          {/* Hull gradient dissolving downward into the distant seabed haze */}
          <linearGradient id="shipHullFadeGrad" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#05203d" stopOpacity="0.82" />
            <stop offset="40%" stopColor="#03152a" stopOpacity="0.75" />
            <stop offset="80%" stopColor="#020c18" stopOpacity="0.45" />
            <stop offset="100%" stopColor="#010610" stopOpacity="0" />
          </linearGradient>

          {/* Timber and mast gradient */}
          <linearGradient id="mastWoodGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#072a4e" stopOpacity="0.85" />
            <stop offset="100%" stopColor="#020d1c" stopOpacity="0.45" />
          </linearGradient>

          {/* Soft haze filter for blending the distant seabed into surrounding water */}
          <filter id="seabedSoftBlur" x="-10%" y="-10%" width="120%" height="120%">
            <feGaussianBlur stdDeviation="6" />
          </filter>
        </defs>

        {/* ----------------------------------------------------
            1. FAINT SEABED CONTOUR AROUND & BEHIND THE WRECK
            (Suggested distant terrain, hazy edges, zero flat ground)
            ---------------------------------------------------- */}
        <g className="distant-seabed-terrain" filter="url(#seabedSoftBlur)">
          {/* Low-contrast ridge sloping gently beneath the keel */}
          <path
            d="
              M -20,420
              L -20,330
              C 60,305 130,295 210,310
              C 300,328 390,320 460,340
              C 500,352 530,370 560,390
              L 560,420
              Z
            "
            fill="url(#seabedHazeGrad)"
          />
          {/* Secondary subtle background ridge contour */}
          <path
            d="
              M 30,360
              C 120,315 230,310 340,335
              C 410,350 490,365 550,400
              L 550,420 L 30,420 Z
            "
            fill="#020b18"
            opacity="0.25"
          />
        </g>

        {/* ----------------------------------------------------
            2. DISTANT RIGGING & SHREDDED LINES
            ---------------------------------------------------- */}
        <g className="ship-rigging" opacity="0.48">
          <path d="M 270,55 Q 210,140 160,210" stroke="#082b4c" strokeWidth="1" strokeDasharray="4 2" />
          <path d="M 270,55 Q 310,135 370,225" stroke="#082b4c" strokeWidth="1" />
          <path d="M 160,110 Q 110,165 70,220" stroke="#082b4c" strokeWidth="0.9" />
          <path d="M 270,120 Q 220,170 170,225" stroke="#082b4c" strokeWidth="0.9" strokeDasharray="3 3" />
          <path d="M 270,120 Q 320,175 390,230" stroke="#082b4c" strokeWidth="0.9" />
          {/* Loose hanging seaweed / frayed rope tendril */}
          <path d="M 205,115 Q 210,150 206,190" stroke="#06223d" strokeWidth="1.2" strokeLinecap="round" />
          <path d="M 330,128 Q 326,165 332,205" stroke="#06223d" strokeWidth="1.2" strokeLinecap="round" />
        </g>

        {/* ----------------------------------------------------
            3. WEATHERED BROKEN MASTS & SPARS
            ---------------------------------------------------- */}
        <g className="ship-masts">
          {/* Mainmast: Tilted broken timber with splintered crown */}
          <path
            d="
              M 264,235
              L 268,75
              L 262,70 L 270,52 L 274,68 L 276,235
              Z
            "
            fill="url(#mastWoodGrad)"
          />

          {/* Crow's nest silhouette */}
          <path
            d="
              M 258,118
              L 282,122
              L 280,132
              C 274,136 266,136 260,132
              Z
            "
            fill="#03162b"
            opacity="0.85"
          />

          {/* Fractured main cross-yard (spar) tilted and broken */}
          <path
            d="
              M 195,112
              L 270,124
              L 335,135
              L 332,139
              L 270,128
              L 194,116
              Z
            "
            fill="url(#mastWoodGrad)"
          />

          {/* Foremast: Shorter splintered mast leaning forward */}
          <path
            d="
              M 160,235
              L 155,115
              L 151,118 L 158,102 L 163,115 L 165,235
              Z
            "
            fill="url(#mastWoodGrad)"
          />
          {/* Foremast tilted yardarm */}
          <path
            d="
              M 118,142
              L 192,154
              L 190,158
              L 116,146
              Z
            "
            fill="url(#mastWoodGrad)"
          />

          {/* Bowsprit reaching upward and outward into deep water */}
          <path
            d="
              M 72,228
              L 25,188
              L 22,192
              L 68,234
              Z
            "
            fill="url(#mastWoodGrad)"
          />
        </g>

        {/* ----------------------------------------------------
            4. WEATHERED HULL & EXPOSED WOODEN RIBS
            ---------------------------------------------------- */}
        <g className="ship-hull">
          {/* Main Hull Body Silhouette */}
          <path
            d="
              M 68,234
              C 95,228 140,225 210,226
              C 280,228 350,232 410,220
              C 432,215 448,225 452,242
              C 455,260 445,280 435,298
              C 400,340 330,375 240,388
              C 150,400 90,368 65,310
              C 55,285 58,255 68,234
              Z
            "
            fill="url(#shipHullFadeGrad)"
          />

          {/* Broken sterncastle transom galleries and gunports */}
          <g opacity="0.4" stroke="#082b4c" strokeWidth="1">
            <rect x="415" y="235" width="8" height="10" rx="1" fill="#010814" />
            <rect x="428" y="238" width="8" height="10" rx="1" fill="#010814" />
            <rect x="365" y="248" width="7" height="8" rx="1" fill="#010814" />
            <rect x="330" y="250" width="7" height="8" rx="1" fill="#010814" />
            <rect x="295" y="252" width="7" height="8" rx="1" fill="#010814" />
            <rect x="260" y="253" width="7" height="8" rx="1" fill="#010814" />
          </g>

          {/* Exposed broken wooden rib frames (decayed hull planks) */}
          <path
            d="
              M 115,235 C 112,260 115,290 128,320
              M 145,234 C 142,265 146,305 162,340
              M 178,233 C 176,270 182,315 202,355
              M 215,232 C 214,275 222,322 245,365
              M 252,233 C 252,278 262,328 290,368
              M 290,235 C 292,278 305,325 335,362
              M 330,236 C 334,275 348,318 375,350
            "
            stroke="#052446"
            strokeWidth="2.2"
            strokeLinecap="round"
            fill="none"
            opacity="0.65"
          />

          {/* Planking seams along upper deck */}
          <path
            d="
              M 72,245 C 130,240 230,240 420,248
              M 78,258 C 140,254 240,255 428,264
            "
            stroke="rgba(4, 30, 58, 0.45)"
            strokeWidth="1.2"
            fill="none"
          />
        </g>
      </svg>
    </div>
  );
};

export default DistantShipwreck;
