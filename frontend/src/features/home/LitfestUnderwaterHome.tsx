import React, { useCallback, useEffect, useRef } from 'react';
import { OceanAtmosphere } from './components/OceanAtmosphere';
import { MarineLife } from './components/MarineLife';
import { MarineVegetation } from './components/MarineVegetation';
import { UnderwaterTitle } from './components/UnderwaterTitle';
import './LitfestUnderwaterHome.css';

interface LitfestUnderwaterHomeProps {
  onExploreClick?: () => void;
  isTimelineActive?: boolean;
}

export const LitfestUnderwaterHome: React.FC<LitfestUnderwaterHomeProps> = ({
  onExploreClick,
  isTimelineActive = false,
}) => {
  const touchStartY = useRef<number | null>(null);
  const isTriggeredRef = useRef<boolean>(false);

  useEffect(() => {
    if (!isTimelineActive) {
      isTriggeredRef.current = false;
    }
  }, [isTimelineActive]);

  const triggerDive = useCallback(() => {
    if (isTriggeredRef.current || isTimelineActive) return;
    isTriggeredRef.current = true;
    onExploreClick?.();
  }, [isTimelineActive, onExploreClick]);

  const handleHomeWheel = (event: React.WheelEvent<HTMLDivElement>) => {
    if (event.deltaY > 15) {
      triggerDive();
    }
  };

  const handleTouchStart = (event: React.TouchEvent<HTMLDivElement>) => {
    touchStartY.current = event.touches[0]?.clientY ?? null;
  };

  const handleTouchEnd = (event: React.TouchEvent<HTMLDivElement>) => {
    const touchStart = touchStartY.current;
    const touchEnd = event.changedTouches[0]?.clientY;
    if (touchStart !== null && touchEnd !== undefined && touchStart - touchEnd > 40) {
      triggerDive();
    }
    touchStartY.current = null;
  };

  useEffect(() => {
    if (isTimelineActive) return;

    const handleWindowWheel = (event: WheelEvent) => {
      if (document.querySelector('.ocean-modal-overlay')) return;
      if (event.deltaY > 15) {
        triggerDive();
      }
    };

    window.addEventListener('wheel', handleWindowWheel, { passive: true });
    return () => window.removeEventListener('wheel', handleWindowWheel);
  }, [isTimelineActive, triggerDive]);

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
      <OceanAtmosphere />
      <MarineLife showJellyfish />
      <MarineVegetation />
      <UnderwaterTitle onExploreClick={triggerDive} />
    </div>
  );
};

export default LitfestUnderwaterHome;
