import React, { useMemo, useEffect, useRef } from 'react';
import { soundEngine } from '../../../utils/soundEngine';
import './BubblesTransition.css';

interface BubblesTransitionProps {
  /**
   * Transition progress from 0 (homepage) to 1 (peak bubbles) and back down to 0 (timeline established)
   * Typically computed via a bell-curve or windowed ramp around the dive scroll threshold
   */
  progress: number;
}

interface BubbleData {
  id: number;
  xPercent: number; // 0 to 100%
  baseYPercent: number; // 0 to 100%
  size: number; // in px
  speed: number;
  swayDuration: number;
  swayDelay: number;
  opacity: number;
  blur: number;
}

export const BubblesTransition: React.FC<BubblesTransitionProps> = ({ progress }) => {
  const hasTriggeredSoundRef = useRef<boolean>(false);

  // Generate 48 procedural bubble particles with multi-depth characteristics
  const bubbles = useMemo<BubbleData[]>(() => {
    return Array.from({ length: 48 }, (_, i) => {
      const xPercent = 3 + Math.random() * 94;
      const baseYPercent = Math.random() * 100;
      const size = 6 + Math.random() * 32;
      const speed = 0.6 + Math.random() * 1.6;
      const swayDuration = 3 + Math.random() * 4;
      const swayDelay = -(Math.random() * swayDuration);
      const opacity = 0.4 + Math.random() * 0.55;
      const blur = Math.random() < 0.25 ? 1.5 : 0;
      return {
        id: i,
        xPercent,
        baseYPercent,
        size,
        speed,
        swayDuration,
        swayDelay,
        opacity,
        blur,
      };
    });
  }, []);

  // Trigger bubble dive audio chime when crossing transition peak
  useEffect(() => {
    if (progress > 0.45 && !hasTriggeredSoundRef.current) {
      soundEngine.playBubbleDive();
      hasTriggeredSoundRef.current = true;
    } else if (progress < 0.15) {
      hasTriggeredSoundRef.current = false;
    }
  }, [progress]);

  // If outside transition zone, don't render for performance
  if (progress <= 0.01) {
    return null;
  }

  const clampedProgress = Math.max(0, Math.min(1, progress));

  return (
    <div
      className="bubbles-transition-overlay"
      aria-hidden="true"
      style={{
        opacity: Number(Math.min(1, clampedProgress * 1.5).toFixed(3)),
      }}
    >
      {/* Oceanic Cyan Caustic Depth Veil */}
      <div
        className="bubbles-depth-bloom"
        style={{
          opacity: Number((clampedProgress * 0.75).toFixed(3)),
          transform: `scale(${1 + clampedProgress * 0.3})`,
        }}
      />

      {/* Bubble Stream Curtain */}
      <div className="bubbles-curtain-field">
        {bubbles.map((b) => {
          // As progress advances, bubbles rise rapidly upwards from bottom to top
          const yOffsetPercent = (1 - clampedProgress) * 110 * b.speed - clampedProgress * 40;
          return (
            <div
              key={b.id}
              className="diving-bubble"
              style={{
                left: `${b.xPercent}%`,
                top: `${b.baseYPercent}%`,
                width: `${b.size}px`,
                height: `${b.size}px`,
                opacity: b.opacity,
                filter: b.blur > 0 ? `blur(${b.blur}px)` : 'none',
                transform: `translate3d(0, ${yOffsetPercent}vh, 0)`,
                animationDuration: `${b.swayDuration}s`,
                animationDelay: `${b.swayDelay}s`,
              }}
            >
              <div className="bubble-highlight" />
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default BubblesTransition;
