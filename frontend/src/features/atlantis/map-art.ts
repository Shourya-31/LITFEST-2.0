/** Original lightweight SVG scenery in the map's 360 × 2200 chart. */
export const mapArtwork = `<defs>
  <linearGradient id="atm-water" x2=".15" y2="1"><stop stop-color="#237e8a"/><stop offset=".22" stop-color="#12556b"/><stop offset=".5" stop-color="#092c46"/><stop offset=".77" stop-color="#071a33"/><stop offset="1" stop-color="#050f23"/></linearGradient>
  <linearGradient id="atm-ray" x2="0" y2="1"><stop stop-color="#c0fff6" stop-opacity=".22"/><stop offset="1" stop-color="#83e5e5" stop-opacity="0"/></linearGradient>
  <linearGradient id="atm-stone" x2="1" y2="1"><stop stop-color="#43808a"/><stop offset=".45" stop-color="#224f65"/><stop offset="1" stop-color="#122e46"/></linearGradient>
  <linearGradient id="atm-gold" x2=".5" y2="1"><stop stop-color="#f7df9d"/><stop offset="1" stop-color="#9d8252"/></linearGradient>
  <radialGradient id="atm-halo"><stop stop-color="#70e6d4" stop-opacity=".2"/><stop offset="1" stop-color="#70e6d4" stop-opacity="0"/></radialGradient>
  <radialGradient id="atm-heart-halo"><stop stop-color="#8bf9e4" stop-opacity=".36"/><stop offset=".45" stop-color="#436bad" stop-opacity=".15"/><stop offset="1" stop-color="#436bad" stop-opacity="0"/></radialGradient>
  <pattern id="atm-water-dust" width="48" height="67" patternUnits="userSpaceOnUse"><circle cx="9" cy="22" r=".65" fill="#c5fff4" opacity=".2"/><circle cx="32" cy="49" r=".4" fill="#c5fff4" opacity=".15"/></pattern>
  <symbol id="atm-coral" viewBox="0 0 86 110"><g class="at-map-sway" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round">
    <path d="M43 106 Q40 68 47 31 M42 82 Q18 67 14 42 M44 65 Q66 58 75 30 M43 92 Q65 87 77 66" stroke-width="4"/>
    <path d="M44 65 Q30 43 23 15 M31 48 L12 25 M23 36 L31 23 M17 54 L4 45 M45 46 L60 19 M51 36 L40 17 M63 48 L62 29 M70 40 L82 37 M59 87 L59 66 M70 78 L83 82 M32 77 L19 83" stroke-width="2"/>
    <path d="M20 25 L17 12 M60 24 L70 13 M9 49 L5 32 M73 69 L74 54 M31 23 L32 13" stroke-width="1.2"/>
    </g></symbol>
  <symbol id="atm-fan" viewBox="0 0 90 100"><g class="at-map-sway" stroke="currentColor" fill="none" stroke-width="1.2"><path d="M45 96 Q3 48 12 18 Q45 -8 78 18 Q88 48 45 96Z" fill="currentColor" fill-opacity=".12"/><path d="M45 96 L12 18 M45 96 L22 9 M45 96 L35 3 M45 96 L48 2 M45 96 L62 8 M45 96 L78 18 M45 82 L8 42 M45 82 L83 41 M45 65 L9 28 M45 65 L82 28 M45 48 L15 15 M45 48 L75 16"/><path d="M16 29 Q45 48 77 28 M13 44 Q44 61 78 44 M23 62 Q45 74 67 61" stroke-opacity=".5"/></g></symbol>
  <symbol id="atm-kelp" viewBox="0 0 65 150"><g class="at-map-sway" fill="currentColor"><path d="M29 150 Q4 115 23 88 Q46 57 24 0 Q67 37 40 86 Q23 119 29 150"/><path d="M31 150 Q55 126 46 100 Q32 69 59 41 Q48 78 59 104 Q67 134 31 150" opacity=".65"/><path d="M25 150 Q-1 126 9 100 Q17 81 4 63 Q31 79 20 106 Q10 128 25 150" opacity=".55"/></g></symbol>
  <symbol id="atm-pillar" viewBox="0 0 70 170"><path d="M7 12 H63 V24 H7Z M13 25 H57 L53 145 H17Z M9 146 H61 V157 H9Z M4 157 H66 V168 H4Z" fill="url(#atm-stone)" stroke="#7bb1ac" stroke-opacity=".3"/>
    <path d="M21 31 L24 139 M31 31 L32 139 M42 31 L40 139 M51 31 L47 139" stroke="#9ac2b3" stroke-opacity=".24" stroke-width="2"/><path d="M8 10 Q3 -1 14 3 L56 3 Q69 -2 63 12" fill="none" stroke="#659b9d" stroke-width="5"/>
    <path d="M15 70 L32 79 L25 94 L36 104" fill="none" stroke="#06243b" stroke-width="2"/></symbol>
  <symbol id="atm-statue" viewBox="0 0 100 150"><g fill="url(#atm-stone)" stroke="#56838f" stroke-width=".7"><path d="M24 141 L30 105 Q30 87 45 81 L39 63 L35 27 Q39 9 57 12 Q76 15 73 34 L69 61 L57 78 L63 92 Q84 100 82 121 L76 145Z"/><path d="M33 32 Q28 10 48 5 Q68 -1 77 20 L77 34 L64 30 L53 17 L44 33Z"/><path d="M54 38 L48 52 L57 54 M42 38 L48 38 M61 38 L67 38 M50 63 L59 63" fill="none" stroke="#aac7be" stroke-opacity=".5"/><path d="M38 85 L55 108 L74 96 M55 108 L45 143 M28 109 L44 117" fill="none"/><path d="M31 118 L42 123 L39 132 L50 141" fill="none" stroke="#061b30" stroke-width="2"/><path d="M16 144 H91 V151 H16Z"/></g></symbol>
  <symbol id="atm-jelly" viewBox="0 0 60 110"><g class="at-map-drift" fill="none" stroke="#b7b9ff" stroke-width="1.2"><path d="M6 35 Q6 1 30 3 Q54 1 54 35 Q43 42 30 35 Q18 42 6 35Z" fill="#9495ea" fill-opacity=".25"/><path d="M17 35 Q11 53 22 64 T19 98 M29 37 Q42 61 28 76 T33 109 M42 36 Q35 52 44 65 T43 91"/><path d="M14 29 Q30 36 47 29 M23 7 Q15 19 20 32 M37 7 Q45 19 40 32" stroke-opacity=".4"/><circle cx="21" cy="25" r="1" fill="#e9dcff"/><circle cx="39" cy="25" r="1" fill="#e9dcff"/></g></symbol>
  <symbol id="atm-fish" viewBox="0 0 36 16"><path d="M4 8 Q16 -4 29 8 Q16 20 4 8 L0 1 V15Z" fill="currentColor"/><circle cx="24" cy="7" r="1" fill="#082a42"/></symbol>
  <symbol id="atm-school" viewBox="0 0 110 66"><use href="#atm-fish" x="5" y="12" width="24" height="12"/><use href="#atm-fish" x="36" y="0" width="28" height="14"/><use href="#atm-fish" x="64" y="22" width="23" height="12"/><use href="#atm-fish" x="32" y="34" width="20" height="10"/><use href="#atm-fish" x="87" y="7" width="22" height="11"/><use href="#atm-fish" x="61" y="51" width="18" height="9"/></symbol>
  <symbol id="atm-temple" viewBox="0 0 180 180"><g stroke="#78a6a3" stroke-opacity=".4" fill="url(#atm-stone)"><path d="M8 51 L90 9 L172 51Z M17 52 H163 V62 H17Z"/><path d="M35 46 L90 20 L145 46Z" fill="#0a2b43"/><path d="M69 41 L90 28 L111 41" fill="none" stroke="#9ecac0"/>
    <path d="M22 147 H158 V157 H22Z M14 158 H166 V168 H14Z M4 169 H176 V179 H4Z"/><path d="M42 146 V72 Q90 40 138 72 V146Z" fill="#051a2c"/>
    <path d="M77 145 V99 Q90 82 103 99 V145" fill="#50d5c1" fill-opacity=".11"/>
    <use href="#atm-pillar" x="23" y="62" width="31" height="85"/><use href="#atm-pillar" x="58" y="62" width="25" height="85"/><use href="#atm-pillar" x="98" y="62" width="25" height="85"/><use href="#atm-pillar" x="126" y="62" width="31" height="85"/>
    <path d="M90 93 L99 107 L90 122 L81 107Z" fill="#a5ffe3" stroke="#c5fff0"/>
    </g></symbol>
  <symbol id="atm-books" viewBox="0 0 100 65"><g stroke="#60989d" stroke-width="1.2"><path d="M7 47 L76 39 L84 54 L15 62Z" fill="#214f63"/><path d="M22 28 L86 32 L84 47 L20 43Z" fill="#347477"/><path d="M12 13 L71 5 L77 23 L18 31Z" fill="#31576e"/><path d="M19 16 L68 10 M24 35 L79 39 M16 51 L75 45" fill="none" stroke="#b6d6b3" stroke-opacity=".45"/><path d="M33 11 L38 27 M68 32 L67 46 M31 47 L35 60" fill="none" stroke="#e0bf7a" stroke-opacity=".6"/></g></symbol>
  <symbol id="atm-shell" viewBox="0 0 55 48"><g stroke="#c6b4af" stroke-width="1" fill="#a2939e"><path d="M24 43 Q-8 28 8 12 Q22 -8 44 10 Q65 29 31 43Z" fill-opacity=".65"/><path d="M27 41 L9 12 M27 41 L18 5 M27 41 V2 M27 41 L36 5 M27 41 L45 12 M27 41 L51 25" fill="none"/><path d="M19 44 H35" stroke-width="4"/></g></symbol>
  <symbol id="atm-chest" viewBox="0 0 80 63"><path d="M5 26 Q4 1 40 3 Q75 1 75 26 V58 H5Z" fill="#665747" stroke="#c4af74" stroke-width="2"/><path d="M5 27 H75 M19 8 V58 M60 8 V58" fill="none" stroke="#b5a16b" stroke-width="4"/><rect x="34" y="24" width="13" height="17" rx="2" fill="url(#atm-gold)"/><path d="M40 29 V35" stroke="#715e3c" stroke-width="2"/></symbol>
  <symbol id="atm-crystal" viewBox="0 0 40 85"><path d="M21 2 L35 31 L27 78 L11 80 L4 29Z" fill="#748bd2" fill-opacity=".45" stroke="#a8cde7" stroke-opacity=".5"/><path d="M21 2 L19 32 L27 78 M4 29 L19 32 L35 31 M19 32 L11 80" stroke="#c7e4ee" stroke-opacity=".3" fill="none"/></symbol>
</defs>
<rect width="360" height="2200" fill="url(#atm-water)"/>
<path d="M0 4 Q45 18 90 8 T180 7 T270 8 T360 6 V0 H0Z" fill="#c4fcdf" opacity=".35"/>
<g class="at-map-rays" fill="url(#atm-ray)"><path d="M12 0 H31 L164 720 L72 530Z"/><path d="M88 0 H111 L255 630 L164 490Z"/><path d="M258 0 H276 L355 470 L318 460Z"/></g>
<rect width="360" height="2200" fill="url(#atm-water-dust)"/>
<g fill="url(#atm-halo)"><ellipse cx="54" cy="390" rx="140" ry="150"/><ellipse cx="300" cy="795" rx="140" ry="155"/><ellipse cx="60" cy="1360" rx="110" ry="170"/></g>
<g fill="#06283e" opacity=".45"><path d="M0 420 Q80 391 130 453 T360 430 V530 Q250 498 160 550 T0 521Z"/><path d="M0 956 Q70 907 160 970 T360 937 V1030 Q260 1000 180 1046 T0 1047Z"/><path d="M0 1438 Q100 1400 180 1457 T360 1436 V1540 H0Z"/></g>
<g opacity=".55"><use href="#atm-pillar" x="13" y="215" width="43" height="115" transform="rotate(-11 30 320)"/><use href="#atm-pillar" x="288" y="462" width="56" height="145"/>
  <use href="#atm-temple" x="207" y="683" width="146" height="151"/><use href="#atm-pillar" x="2" y="816" width="55" height="147"/>
  <use href="#atm-statue" x="270" y="1120" width="86" height="135"/><use href="#atm-statue" x="-14" y="1458" width="105" height="151"/>
</g>
<g color="#c38e9c"><use href="#atm-coral" x="-9" y="300" width="83" height="115"/><use href="#atm-fan" x="285" y="190" width="65" height="91"/></g>
<g color="#438f91"><use href="#atm-kelp" x="-8" y="180" width="48" height="138"/><use href="#atm-kelp" x="310" y="336" width="47" height="145"/><use href="#atm-kelp" x="6" y="579" width="43" height="126"/></g>
<g color="#6381a0" opacity=".7"><use href="#atm-fan" x="-12" y="1004" width="79" height="100"/><use href="#atm-coral" x="292" y="1316" width="72" height="112"/></g>
<g color="#7690a2" opacity=".65"><use href="#atm-school" x="210" y="277" width="104" height="64"/><use href="#atm-school" x="43" y="785" width="90" height="54"/><use href="#atm-school" x="182" y="1374" width="100" height="62"/></g>
<g opacity=".85"><use href="#atm-shell" x="297" y="593" width="38" height="34"/><use href="#atm-shell" x="31" y="417" width="26" height="25"/>
  <use href="#atm-books" x="234" y="923" width="99" height="64"/><use href="#atm-books" x="26" y="972" width="67" height="49"/>
  <use href="#atm-chest" x="19" y="1169" width="62" height="49"/><use href="#atm-crystal" x="294" y="867" width="24" height="57"/><use href="#atm-crystal" x="44" y="1036" width="26" height="68"/>
  <use href="#atm-jelly" x="279" y="1198" width="42" height="86"/><use href="#atm-jelly" x="19" y="1570" width="48" height="99"/>
</g>
<ellipse cx="180" cy="1940" rx="180" ry="220" fill="url(#atm-heart-halo)"/>
<g opacity=".9"><use href="#atm-temple" x="27" y="1835" width="306" height="302"/></g>
<path d="M0 2110 Q65 2079 125 2116 Q213 2082 276 2112 Q310 2095 360 2108 V2200 H0Z" fill="#071d2d"/>
<g color="#2e626d"><use href="#atm-kelp" x="-6" y="1990" width="49" height="151"/><use href="#atm-kelp" x="319" y="1984" width="47" height="151"/><use href="#atm-coral" x="36" y="2079" width="48" height="65"/><use href="#atm-fan" x="279" y="2067" width="63" height="77"/></g>
<use href="#atm-shell" x="124" y="2120" width="20" height="19"/>
${Array.from({length:18},(_,index) => `<circle class="at-map-bubble" cx="${18 + (index * 79) % 326}" cy="${140 + index * 107}" r="${index % 3 + 1.5}" fill="none" stroke="#b9f5ee" stroke-opacity=".25" stroke-width=".7" style="animation-delay:-${index * .7}s"/>`).join("")}`;
