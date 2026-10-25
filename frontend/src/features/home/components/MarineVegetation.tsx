import React, { useMemo } from 'react';
import './MarineVegetation.css';

interface BioParticle {
  id: number;
  left: number;
  top: number;
  size: number;
  opacity: number;
  color: string;
  glowClass: string;
  driftClass: string;
  delay: string;
}

export const MarineVegetation: React.FC = () => {
  // Pre-configured natural bioluminescent drift particles suspended in deep water
  const suspendedParticles: BioParticle[] = useMemo(() => {
    return [
      // Left flank suspended field
      { id: 1, left: 6, top: 68, size: 2.2, opacity: 0.65, color: '#38bdf8', glowClass: 'bio-gentle-a', driftClass: 'drift-motion-a', delay: '-3.2s' },
      { id: 2, left: 12, top: 76, size: 3.2, opacity: 0.85, color: '#a5f3fc', glowClass: 'bio-static', driftClass: 'drift-motion-b', delay: '0s' },
      { id: 3, left: 18, top: 62, size: 1.8, opacity: 0.45, color: '#7dd3fc', glowClass: 'bio-shimmer-a', driftClass: 'drift-motion-c', delay: '-6.4s' },
      { id: 4, left: 24, top: 82, size: 2.5, opacity: 0.70, color: '#22d3ee', glowClass: 'bio-gentle-b', driftClass: 'drift-motion-a', delay: '-11.1s' },
      { id: 5, left: 9, top: 88, size: 2.8, opacity: 0.55, color: '#0ea5e9', glowClass: 'bio-gentle-c', driftClass: 'drift-motion-b', delay: '-4.8s' },
      { id: 6, left: 29, top: 72, size: 1.6, opacity: 0.40, color: '#38bdf8', glowClass: 'bio-static', driftClass: 'drift-motion-c', delay: '0s' },
      { id: 7, left: 15, top: 54, size: 2.0, opacity: 0.60, color: '#7dd3fc', glowClass: 'bio-shimmer-b', driftClass: 'drift-motion-a', delay: '-8.2s' },

      // Right flank suspended field
      { id: 8, left: 72, top: 74, size: 1.8, opacity: 0.50, color: '#38bdf8', glowClass: 'bio-gentle-c', driftClass: 'drift-motion-b', delay: '-9.5s' },
      { id: 9, left: 78, top: 84, size: 2.6, opacity: 0.75, color: '#22d3ee', glowClass: 'bio-static', driftClass: 'drift-motion-c', delay: '0s' },
      { id: 10, left: 84, top: 64, size: 3.4, opacity: 0.88, color: '#a5f3fc', glowClass: 'bio-gentle-a', driftClass: 'drift-motion-a', delay: '-5.7s' },
      { id: 11, left: 91, top: 78, size: 2.2, opacity: 0.62, color: '#7dd3fc', glowClass: 'bio-shimmer-a', driftClass: 'drift-motion-b', delay: '-12.3s' },
      { id: 12, left: 95, top: 58, size: 1.6, opacity: 0.42, color: '#0ea5e9', glowClass: 'bio-gentle-b', driftClass: 'drift-motion-c', delay: '-2.4s' },
      { id: 13, left: 88, top: 90, size: 2.8, opacity: 0.58, color: '#38bdf8', glowClass: 'bio-static', driftClass: 'drift-motion-a', delay: '0s' },
      { id: 14, left: 82, top: 52, size: 2.0, opacity: 0.48, color: '#7dd3fc', glowClass: 'bio-shimmer-b', driftClass: 'drift-motion-b', delay: '-7.1s' },

      // Deep lower-mid ambient micro-nodes
      { id: 15, left: 38, top: 86, size: 1.8, opacity: 0.45, color: '#38bdf8', glowClass: 'bio-gentle-b', driftClass: 'drift-motion-c', delay: '-14.0s' },
      { id: 16, left: 44, top: 92, size: 1.5, opacity: 0.35, color: '#0284c7', glowClass: 'bio-static', driftClass: 'drift-motion-a', delay: '0s' },
      { id: 17, left: 58, top: 91, size: 1.6, opacity: 0.38, color: '#0284c7', glowClass: 'bio-gentle-a', driftClass: 'drift-motion-b', delay: '-8.6s' },
      { id: 18, left: 64, top: 85, size: 2.0, opacity: 0.48, color: '#38bdf8', glowClass: 'bio-shimmer-a', driftClass: 'drift-motion-c', delay: '-3.9s' },
    ];
  }, []);

  return (
    <div className="marine-vegetation-layer" aria-hidden="true">
      {/* =========================================
          1. TALL LEFT KELP FOREST (Framing Left Edge)
          ========================================= */}
      <div className="kelp-forest kelp-left-group">
        <svg
          className="kelp-svg"
          viewBox="0 0 340 850"
          preserveAspectRatio="none"
          style={{ overflow: 'visible' }}
        >
          <defs>
            <linearGradient id="kelpDeepGradLeft" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#041a33" stopOpacity="0.75" />
              <stop offset="65%" stopColor="#020e1d" stopOpacity="0.95" />
              <stop offset="100%" stopColor="#010610" stopOpacity="1" />
            </linearGradient>
            <linearGradient id="kelpForeGradLeft" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#062446" stopOpacity="0.95" />
              <stop offset="60%" stopColor="#021224" stopOpacity="0.98" />
              <stop offset="100%" stopColor="#010610" stopOpacity="1" />
            </linearGradient>
          </defs>

          {/* Deep background kelp ribbon (sways very slowly) */}
          <g className="kelp-sway-slow">
            <path
              d="
                M 40,850
                Q 20,660 50,510
                T 25,320
                Q 5,190 35,95
                Q 50,45 30,12
                Q 45,50 35,100
                Q 10,195 30,325
                T 55,515
                Q 25,665 45,850
                Z
              "
              fill="url(#kelpDeepGradLeft)"
              opacity="0.45"
            />
            {/* Background fronds */}
            <path
              d="M 35,320 Q 80,285 110,245 Q 85,265 35,325 Z"
              fill="#03162b"
              opacity="0.5"
            />
            <path
              d="M 45,490 Q 95,445 130,395 Q 100,425 45,495 Z"
              fill="#03162b"
              opacity="0.5"
            />
            {/* Deep glowing tip - steady soft glow */}
            <circle
              cx="30"
              cy="12"
              r="2.8"
              fill="#38bdf8"
              className="bio-static"
            />
          </g>

          {/* Midground kelp ribbon */}
          <g className="kelp-sway-mid">
            <path
              d="
                M 90,850
                Q 130,640 85,470
                T 115,275
                Q 135,150 100,50
                Q 90,18 105,2
                Q 95,22 105,55
                Q 140,155 120,280
                T 90,475
                Q 135,645 95,850
                Z
              "
              fill="url(#kelpDeepGradLeft)"
              opacity="0.75"
            />
            {/* Midground blades */}
            <path
              d="M 115,275 Q 170,235 205,185 Q 175,215 118,279 Z"
              fill="#021427"
              opacity="0.75"
            />
            <path
              d="M 85,470 Q 30,425 5,365 Q 35,405 88,472 Z"
              fill="#021427"
              opacity="0.75"
            />
            {/* Desynchronized bioluminescent nodes */}
            <circle
              cx="105"
              cy="2"
              r="3.2"
              fill="#7dd3fc"
              className="bio-gentle-b"
              style={{ animationDelay: '-4.3s' }}
            />
            <circle
              cx="205"
              cy="185"
              r="2.4"
              fill="#38bdf8"
              className="bio-shimmer-a"
              style={{ animationDelay: '-1.8s' }}
            />
          </g>

          {/* Foreground tall kelp ribbons (crisp rich silhouettes with restrained cyan nodes) */}
          <g className="kelp-sway-fore">
            <path
              d="
                M 140,850
                Q 90,620 145,430
                T 105,215
                Q 80,95 120,18
                Q 130,-4 125,-16
                Q 135,-4 125,22
                Q 85,100 110,220
                T 150,435
                Q 95,625 145,850
                Z
              "
              fill="url(#kelpForeGradLeft)"
            />
            {/* Leaf fronds along stem */}
            <path
              d="M 125,22 Q 185,8 220,-28 Q 180,-8 125,25 Z"
              fill="#031a33"
            />
            <path
              d="M 105,215 Q 50,178 20,120 Q 55,158 108,218 Z"
              fill="#021224"
            />
            <path
              d="M 145,430 Q 215,385 250,315 Q 210,360 148,433 Z"
              fill="#010d1c"
            />
            {/* Bioluminescent leaf tips with unique timing */}
            <circle
              cx="125"
              cy="-16"
              r="3.8"
              fill="#a5f3fc"
              className="bio-gentle-a"
              style={{ animationDelay: '-7.2s' }}
            />
            <circle
              cx="220"
              cy="-28"
              r="2.8"
              fill="#38bdf8"
              className="bio-static"
            />
            <circle
              cx="20"
              cy="120"
              r="2.6"
              fill="#22d3ee"
              className="bio-gentle-c"
              style={{ animationDelay: '-10.5s' }}
            />
            <circle
              cx="250"
              cy="315"
              r="2.8"
              fill="#38bdf8"
              className="bio-shimmer-b"
              style={{ animationDelay: '-5.1s' }}
            />
          </g>
        </svg>
      </div>

      {/* =========================================
          2. TALL RIGHT KELP FOREST (Framing Right Edge)
          ========================================= */}
      <div className="kelp-forest kelp-right-group">
        <svg
          className="kelp-svg"
          viewBox="0 0 340 850"
          preserveAspectRatio="none"
          style={{ overflow: 'visible' }}
        >
          <defs>
            <linearGradient id="kelpDeepGradRight" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#041a33" stopOpacity="0.75" />
              <stop offset="65%" stopColor="#020e1d" stopOpacity="0.95" />
              <stop offset="100%" stopColor="#010610" stopOpacity="1" />
            </linearGradient>
            <linearGradient id="kelpForeGradRight" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#062446" stopOpacity="0.95" />
              <stop offset="60%" stopColor="#021224" stopOpacity="0.98" />
              <stop offset="100%" stopColor="#010610" stopOpacity="1" />
            </linearGradient>
          </defs>

          {/* Deep background kelp ribbon */}
          <g className="kelp-sway-slow-alt">
            <path
              d="
                M 300,850
                Q 320,660 290,510
                T 315,320
                Q 335,190 305,95
                Q 290,45 310,12
                Q 295,50 305,100
                Q 330,195 310,325
                T 285,515
                Q 315,665 295,850
                Z
              "
              fill="url(#kelpDeepGradRight)"
              opacity="0.45"
            />
            <path
              d="M 305,320 Q 260,285 230,245 Q 255,265 305,325 Z"
              fill="#03162b"
              opacity="0.5"
            />
            <circle
              cx="310"
              cy="12"
              r="2.8"
              fill="#38bdf8"
              className="bio-gentle-b"
              style={{ animationDelay: '-8.7s' }}
            />
          </g>

          {/* Midground kelp ribbon */}
          <g className="kelp-sway-mid-alt">
            <path
              d="
                M 250,850
                Q 210,640 255,470
                T 225,275
                Q 205,150 240,50
                Q 250,18 235,2
                Q 245,22 235,55
                Q 200,155 220,280
                T 250,475
                Q 205,645 245,850
                Z
              "
              fill="url(#kelpDeepGradRight)"
              opacity="0.75"
            />
            <path
              d="M 225,275 Q 170,235 135,185 Q 165,215 222,279 Z"
              fill="#021427"
              opacity="0.75"
            />
            <path
              d="M 255,470 Q 310,425 335,365 Q 305,405 252,472 Z"
              fill="#021427"
              opacity="0.75"
            />
            <circle
              cx="235"
              cy="2"
              r="3.2"
              fill="#7dd3fc"
              className="bio-static"
            />
            <circle
              cx="135"
              cy="185"
              r="2.4"
              fill="#38bdf8"
              className="bio-gentle-a"
              style={{ animationDelay: '-2.9s' }}
            />
          </g>

          {/* Foreground tall kelp ribbons */}
          <g className="kelp-sway-fore-alt">
            <path
              d="
                M 200,850
                Q 250,620 195,430
                T 235,215
                Q 260,95 220,18
                Q 210,-4 215,-16
                Q 205,-4 215,22
                Q 255,100 230,220
                T 190,435
                Q 245,625 195,850
                Z
              "
              fill="url(#kelpForeGradRight)"
            />
            <path
              d="M 215,22 Q 155,8 120,-28 Q 160,-8 215,25 Z"
              fill="#031a33"
            />
            <path
              d="M 235,215 Q 290,178 320,120 Q 285,158 232,218 Z"
              fill="#021224"
            />
            <path
              d="M 195,430 Q 125,385 90,315 Q 130,360 192,433 Z"
              fill="#010d1c"
            />
            {/* Desynchronized bioluminescent nodes */}
            <circle
              cx="215"
              cy="-16"
              r="3.8"
              fill="#a5f3fc"
              className="bio-gentle-c"
              style={{ animationDelay: '-12.0s' }}
            />
            <circle
              cx="120"
              cy="-28"
              r="2.8"
              fill="#38bdf8"
              className="bio-shimmer-a"
              style={{ animationDelay: '-4.6s' }}
            />
            <circle
              cx="320"
              cy="120"
              r="2.6"
              fill="#22d3ee"
              className="bio-static"
            />
            <circle
              cx="90"
              cy="315"
              r="2.8"
              fill="#38bdf8"
              className="bio-gentle-b"
              style={{ animationDelay: '-6.8s' }}
            />
          </g>
        </svg>
      </div>

      {/* =========================================
          3. REEF CORAL FORMATIONS & LOWER SILHOUETTES
          (No visible seabed, horizontal line, or translucent film!
           Corals rise organically from beyond bottom edge)
          ========================================= */}
      <div className="reef-corals-container">
        <svg
          className="reef-corals-svg"
          viewBox="0 0 1600 420"
          preserveAspectRatio="none"
          style={{ overflow: 'visible' }}
        >
          <defs>
            {/* Gradients ending in pure abyss base color #010610 */}
            <linearGradient id="coralDeepGrad" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#031428" stopOpacity="0.65" />
              <stop offset="65%" stopColor="#020b16" stopOpacity="0.95" />
              <stop offset="100%" stopColor="#010610" stopOpacity="1" />
            </linearGradient>
            <linearGradient id="coralMidGrad" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#041a34" stopOpacity="0.85" />
              <stop offset="60%" stopColor="#020e1c" stopOpacity="0.98" />
              <stop offset="100%" stopColor="#010610" stopOpacity="1" />
            </linearGradient>
            <linearGradient id="coralForeGrad" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#052244" stopOpacity="0.96" />
              <stop offset="60%" stopColor="#021122" stopOpacity="1" />
              <stop offset="100%" stopColor="#010610" stopOpacity="1" />
            </linearGradient>
          </defs>

          {/* ----------------------------------------------------
              A. LEFT FLANK CORALS (Branching, Mound, and Sea-Fan)
              ---------------------------------------------------- */}
          <g className="coral-formation coral-left-complex">
            {/* 1. Deep Layer: Rounded Boulder/Brain Coral Mound */}
            <path
              d="
                M 40,460
                L 40,360
                C 55,310 90,290 125,295
                C 145,298 165,318 185,305
                C 210,290 245,295 265,325
                C 285,355 290,400 290,460
                Z
              "
              fill="url(#coralDeepGrad)"
            />

            {/* 2. Midground: Gorgonian Sea-Fan with delicate filigree lattice */}
            <g className="gorgonian-fan-left">
              {/* Fan body */}
              <path
                d="
                  M 220,460
                  L 220,365
                  C 200,340 170,300 165,240
                  C 175,225 200,210 230,215
                  C 260,220 285,245 295,275
                  C 285,320 250,350 230,365
                  L 230,460
                  Z
                "
                fill="url(#coralMidGrad)"
                opacity="0.85"
              />
              {/* Interior structural ribs of the fan */}
              <path
                d="
                  M 225,365 Q 200,300 175,235
                  M 225,365 Q 215,280 205,220
                  M 225,365 Q 240,285 250,225
                  M 225,365 Q 260,305 285,260
                "
                stroke="#082b4c"
                strokeWidth="1.4"
                strokeLinecap="round"
                fill="none"
                opacity="0.7"
              />
              {/* Bioluminescent micro-accent on fan crest */}
              <circle cx="205" cy="220" r="2.2" fill="#38bdf8" className="bio-shimmer-a" style={{ animationDelay: '-6.2s' }} />
              <circle cx="250" cy="225" r="2.2" fill="#7dd3fc" className="bio-static" />
            </g>

            {/* 3. Foreground: Majestic Branching Staghorn Coral (Acropora) */}
            <path
              d="
                M 125,460
                L 130,340
                C 115,310 95,280 80,250
                C 75,240 70,225 72,210
                C 80,212 90,230 102,255
                C 112,275 125,295 135,315
                C 132,270 126,220 120,180
                C 118,165 122,150 128,140
                C 136,145 138,165 138,185
                C 138,225 142,265 145,290
                C 148,240 152,190 155,155
                C 158,140 164,130 170,125
                C 176,132 174,150 170,175
                C 165,215 160,260 158,295
                C 175,270 195,235 210,200
                C 215,190 222,185 228,188
                C 228,198 220,215 208,240
                C 195,270 178,310 165,340
                C 185,330 215,310 235,285
                C 242,275 248,272 252,278
                C 248,288 235,310 215,335
                C 195,360 175,395 168,460
                Z
              "
              fill="url(#coralForeGrad)"
            />

            {/* Bioluminescent Coral Tips (Varied timing, no synchronization) */}
            <circle cx="72" cy="210" r="3.2" fill="#38bdf8" className="bio-gentle-b" style={{ animationDelay: '-1.5s' }} />
            <circle cx="128" cy="140" r="3.8" fill="#a5f3fc" className="bio-gentle-a" style={{ animationDelay: '-5.8s' }} />
            <circle cx="170" cy="125" r="4.2" fill="#22d3ee" className="bio-static" />
            <circle cx="228" cy="188" r="3.4" fill="#7dd3fc" className="bio-shimmer-b" style={{ animationDelay: '-8.4s' }} />
            <circle cx="252" cy="278" r="2.8" fill="#38bdf8" className="bio-gentle-c" style={{ animationDelay: '-3.7s' }} />
          </g>

          {/* ----------------------------------------------------
              B. LEFT-CENTER SUB-REEF (x: 320 to 460)
              ---------------------------------------------------- */}
          <g className="coral-formation coral-left-center">
            {/* Clustered boulder coral */}
            <path
              d="
                M 330,460
                C 330,390 355,340 390,340
                C 415,340 435,360 455,348
                C 475,335 495,350 510,380
                C 525,410 530,440 530,460
                Z
              "
              fill="url(#coralMidGrad)"
              opacity="0.9"
            />
            {/* Branching coral shoot */}
            <path
              d="
                M 380,460
                L 385,350
                Q 370,300 355,260
                Q 368,265 382,295
                Q 395,250 405,215
                Q 415,220 408,260
                Q 425,240 440,225
                Q 445,235 432,265
                L 420,460
                Z
              "
              fill="url(#coralForeGrad)"
            />
            <circle cx="355" cy="260" r="2.8" fill="#38bdf8" className="bio-static" />
            <circle cx="405" cy="215" r="3.5" fill="#a5f3fc" className="bio-gentle-c" style={{ animationDelay: '-7.9s' }} />
            <circle cx="440" cy="225" r="2.6" fill="#22d3ee" className="bio-shimmer-a" style={{ animationDelay: '-2.2s' }} />
          </g>

          {/* ----------------------------------------------------
              C. RIGHT FLANK CORALS (Branching, Boulder, and Sea-Fan)
              ---------------------------------------------------- */}
          <g className="coral-formation coral-right-complex">
            {/* 1. Deep Layer: Clustered Boulder Reef Mound */}
            <path
              d="
                M 1320,460
                C 1320,400 1330,350 1360,320
                C 1385,295 1420,290 1445,305
                C 1470,320 1490,298 1515,295
                C 1545,290 1575,320 1585,360
                L 1585,460
                Z
              "
              fill="url(#coralDeepGrad)"
            />

            {/* 2. Midground: Gorgonian Sea-Fan */}
            <g className="gorgonian-fan-right">
              <path
                d="
                  M 1370,460
                  L 1370,360
                  C 1350,335 1315,295 1310,235
                  C 1325,220 1350,210 1380,215
                  C 1410,220 1435,245 1445,275
                  C 1435,320 1400,350 1380,360
                  L 1380,460
                  Z
                "
                fill="url(#coralMidGrad)"
                opacity="0.85"
              />
              <path
                d="
                  M 1375,360 Q 1350,295 1320,230
                  M 1375,360 Q 1365,275 1355,215
                  M 1375,360 Q 1390,280 1400,220
                  M 1375,360 Q 1410,300 1435,255
                "
                stroke="#082b4c"
                strokeWidth="1.4"
                strokeLinecap="round"
                fill="none"
                opacity="0.7"
              />
              <circle cx="1355" cy="215" r="2.2" fill="#7dd3fc" className="bio-static" />
              <circle cx="1400" cy="220" r="2.2" fill="#38bdf8" className="bio-shimmer-b" style={{ animationDelay: '-4.9s' }} />
            </g>

            {/* 3. Foreground: Branching Staghorn Coral (Acropora - Right Flank) */}
            <path
              d="
                M 1485,460
                L 1480,340
                C 1465,310 1435,280 1415,250
                C 1405,238 1395,225 1392,210
                C 1400,212 1415,230 1430,255
                C 1445,280 1460,300 1470,318
                C 1465,270 1455,220 1445,180
                C 1442,165 1445,148 1452,138
                C 1460,145 1464,165 1465,185
                C 1466,225 1472,265 1475,290
                C 1480,240 1488,190 1495,155
                C 1498,140 1505,128 1512,122
                C 1518,130 1516,148 1512,175
                C 1506,215 1500,260 1496,295
                C 1510,270 1530,235 1545,200
                C 1550,190 1558,185 1564,188
                C 1562,198 1552,215 1540,240
                C 1525,270 1508,310 1498,340
                C 1520,330 1548,310 1568,285
                C 1575,275 1582,272 1586,278
                C 1580,288 1568,310 1548,335
                C 1528,360 1508,395 1502,460
                Z
              "
              fill="url(#coralForeGrad)"
            />

            {/* Bioluminescent Coral Tips (Right flank - independent rhythms) */}
            <circle cx="1392" cy="210" r="3.2" fill="#38bdf8" className="bio-gentle-a" style={{ animationDelay: '-9.1s' }} />
            <circle cx="1452" cy="138" r="3.8" fill="#a5f3fc" className="bio-static" />
            <circle cx="1512" cy="122" r="4.2" fill="#22d3ee" className="bio-gentle-b" style={{ animationDelay: '-3.3s' }} />
            <circle cx="1564" cy="188" r="3.4" fill="#7dd3fc" className="bio-shimmer-a" style={{ animationDelay: '-7.5s' }} />
            <circle cx="1586" cy="278" r="2.8" fill="#38bdf8" className="bio-gentle-c" style={{ animationDelay: '-11.4s' }} />
          </g>

          {/* ----------------------------------------------------
              D. RIGHT-CENTER SUB-REEF (x: 1140 to 1270)
              ---------------------------------------------------- */}
          <g className="coral-formation coral-right-center">
            {/* Clustered rounded reef coral */}
            <path
              d="
                M 1130,460
                C 1130,410 1145,365 1175,345
                C 1195,330 1220,340 1240,320
                C 1265,295 1300,310 1315,350
                C 1330,390 1335,425 1335,460
                Z
              "
              fill="url(#coralMidGrad)"
              opacity="0.9"
            />
            {/* Slender branching coral shoot */}
            <path
              d="
                M 1205,460
                L 1210,350
                Q 1195,300 1180,255
                Q 1195,260 1208,290
                Q 1220,245 1230,210
                Q 1240,215 1232,255
                Q 1250,235 1265,220
                Q 1270,230 1258,260
                L 1245,460
                Z
              "
              fill="url(#coralForeGrad)"
            />
            <circle cx="1180" cy="255" r="2.8" fill="#38bdf8" className="bio-shimmer-b" style={{ animationDelay: '-1.4s' }} />
            <circle cx="1230" cy="210" r="3.5" fill="#a5f3fc" className="bio-static" />
            <circle cx="1265" cy="220" r="2.6" fill="#22d3ee" className="bio-gentle-a" style={{ animationDelay: '-6.5s' }} />
          </g>

          {/* ----------------------------------------------------
              E. LOW CENTRAL SEA-GRASS WISPS (Subtle Framing, Zero Floor Line)
              Leaves the entire central screen open for Title & CTA!
              ---------------------------------------------------- */}
          <g className="central-open-water-flora">
            {/* Left-center wispy frond */}
            <path
              d="M 580,460 Q 565,380 590,335 Q 582,385 595,460 Z"
              fill="#020e1e"
              opacity="0.85"
            />
            <circle cx="590" cy="335" r="2.0" fill="#38bdf8" className="bio-gentle-b" style={{ animationDelay: '-10.1s' }} />

            {/* Right-center wispy frond */}
            <path
              d="M 1020,460 Q 1035,380 1010,335 Q 1018,385 1005,460 Z"
              fill="#020e1e"
              opacity="0.85"
            />
            <circle cx="1010" cy="335" r="2.0" fill="#38bdf8" className="bio-static" />
          </g>
        </svg>
      </div>

      {/* =========================================
          4. SUSPENDED BIOLUMINESCENT DRIFT PARTICLES
          (Naturally drifting deep-sea plankton, irregular and desynchronized)
          ========================================= */}
      <div className="bio-suspension-field" aria-hidden="true">
        {suspendedParticles.map((p) => (
          <span
            key={p.id}
            className={`bio-drift-node ${p.glowClass} ${p.driftClass}`}
            style={{
              left: `${p.left}%`,
              top: `${p.top}%`,
              width: `${p.size}px`,
              height: `${p.size}px`,
              backgroundColor: p.color,
              opacity: p.opacity,
              animationDelay: p.delay,
              boxShadow: `0 0 ${p.size * 2.5}px ${p.color}`,
            }}
          />
        ))}
      </div>
    </div>
  );
};

export default MarineVegetation;
