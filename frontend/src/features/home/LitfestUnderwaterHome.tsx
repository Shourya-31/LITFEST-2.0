import React, { useRef, useEffect } from 'react';
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
  const touchStartY = useRef<number | null>(null);
  const isTriggeredRef = useRef<boolean>(false);

  // Reset trigger lock whenever returning to home
  useEffect(() => {
    if (!isTimelineActive) {
      isTriggeredRef.current = false;
    }
  }, [isTimelineActive]);

  const triggerDive = () => {
    if (isTriggeredRef.current || isTimelineActive) return;
    isTriggeredRef.current = true;
    if (onExploreClick) {
      onExploreClick();
    }
  };

  const handleHomeWheel = (e: React.WheelEvent<HTMLDivElement>) => {
    if (e.deltaY > 15) {
      triggerDive();
    }
  };

  const handleTouchStart = (e: React.TouchEvent<HTMLDivElement>) => {
    touchStartY.current = e.touches[0].clientY;
  };

  const handleTouchEnd = (e: React.TouchEvent<HTMLDivElement>) => {
    if (touchStartY.current !== null) {
      const deltaY = touchStartY.current - e.changedTouches[0].clientY;
      if (deltaY > 40) {
        triggerDive();
      }
      touchStartY.current = null;
    }
  };

  // Window-level wheel listener for instant response anywhere on the home screen
  useEffect(() => {
    if (isTimelineActive) return;

    const handleWindowWheel = (e: WheelEvent) => {
      if (document.querySelector('.ocean-modal-overlay')) return;
      if (e.deltaY > 15) {
        triggerDive();
      }
    };

    window.addEventListener('wheel', handleWindowWheel, { passive: true });
    return () => window.removeEventListener('wheel', handleWindowWheel);
  }, [isTimelineActive]);

  return (
    <div
      id="underwater-home-stage"
      className="litfest-underwater-root"
      onWheel={handleHomeWheel}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
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
        onExploreClick={triggerDive}
      />
    </div>
  );
};

export default LitfestUnderwaterHome;
