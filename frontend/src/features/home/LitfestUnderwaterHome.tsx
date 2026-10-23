import React from 'react';
import { OceanAtmosphere } from './components/OceanAtmosphere';
import { MarineLife } from './components/MarineLife';
import { UnderwaterTitle } from './components/UnderwaterTitle';
import './LitfestUnderwaterHome.css';

interface LitfestUnderwaterHomeProps {
  onExploreClick?: () => void;
  onRegisterClick?: () => void;
  isAudioPlaying?: boolean;
  onToggleAudio?: () => void;
  isTimelineActive?: boolean;
}

export const LitfestUnderwaterHome: React.FC<LitfestUnderwaterHomeProps> = ({
  onExploreClick,
  onRegisterClick,
  isAudioPlaying = false,
  onToggleAudio,
  isTimelineActive = false,
}) => {
  return (
    <div
      id="underwater-home-stage"
      className="litfest-underwater-root"
      role="region"
      aria-label="Litfest 2.0 Underwater Experience"
      style={{
        display: isTimelineActive ? 'none' : 'block',
        pointerEvents: isTimelineActive ? 'none' : 'auto',
      }}
    >
      {/* 1. Deep Sea Atmosphere & Volumetric Sunlight */}
      <OceanAtmosphere />

      {/* 2. Layered Flat Marine Silhouettes (Whale, Shark, Shoal, Octopus, Jellyfish, Manta) */}
      <MarineLife />

      {/* 3. Central Prominent Display Title (LITFEST 2.0, Unboxed) */}
      <UnderwaterTitle
        onRegisterClick={onRegisterClick}
        onExploreClick={onExploreClick}
      />

      {/* 4. Minimal Sound Toggle (Corner Icon) */}
      {onToggleAudio && (
        <button
          type="button"
          className={`ambient-audio-toggle ${isAudioPlaying ? 'playing' : ''}`}
          onClick={onToggleAudio}
          title={isAudioPlaying ? 'Mute Ocean Waves' : 'Play Ambient Deep Sea Audio'}
          aria-label="Toggle ocean sound"
          id="ocean-audio-toggle"
        >
          <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2">
            {isAudioPlaying ? (
              <>
                <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" fill="currentColor" />
                <path d="M19.07 4.93a10 10 0 0 1 0 14.14M15.54 8.46a5 5 0 0 1 0 7.07" />
              </>
            ) : (
              <>
                <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" fill="currentColor" />
                <line x1="23" y1="9" x2="17" y2="15" />
                <line x1="17" y1="9" x2="23" y2="15" />
              </>
            )}
          </svg>
          <span className="audio-label">{isAudioPlaying ? 'Sound On' : 'Ocean Sound'}</span>
        </button>
      )}
    </div>
  );
};

export default LitfestUnderwaterHome;
