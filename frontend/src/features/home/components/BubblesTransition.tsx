import React, { useMemo, useEffect, useRef, useState } from 'react';
import { soundEngine } from '../../../utils/soundEngine';
import './BubblesTransition.css';

export interface BubblesTransitionProps {
  /**
   * When true, activates the full cinematic oceanic dive/surface bubble surge
   */
  isActive?: boolean;
  /**
   * Direction of the voyage transition:
   * 'dive' = descending into the deep 3D timeline abyss
   * 'surface' = ascending back to the ocean surface homepage
   */
  direction?: 'dive' | 'surface';
  /**
   * Optional manual scroll progress (0 to 1) for scroll-linked animations
   */
  progress?: number;
  /**
   * Callback fired at peak bubble shroud (ideal for switching background views)
   */
  onMidpoint?: () => void;
  /**
   * Callback fired when bubbles have completely surged and cleared the screen
   */
  onComplete?: () => void;
}

interface BubbleParticle {
  id: number;
  leftPercent: number; // 2% to 98%
  size: number; // 10px to 48px
  duration: number; // 0.62s to 0.88s
  delay: number; // 0s to 0.22s
  driftX: number; // -35px to 35px GPU lateral sway
  opacity: number;
  isLarge: boolean;
}

export const BubblesTransition: React.FC<BubblesTransitionProps> = ({
  isActive = false,
  direction = 'dive',
  progress,
  onMidpoint,
  onComplete,
}) => {
  const [isAnimating, setIsAnimating] = useState<boolean>(false);

  const onMidpointRef = useRef(onMidpoint);
  onMidpointRef.current = onMidpoint;
  const onCompleteRef = useRef(onComplete);
  onCompleteRef.current = onComplete;

  const midpointTimerRef = useRef<number | null>(null);
  const completeTimerRef = useRef<number | null>(null);
  const hasTriggeredSoundRef = useRef<boolean>(false);

  // Generate 40 lightweight, high-impact GPU bubble particles
  const bubbles = useMemo<BubbleParticle[]>(() => {
    return Array.from({ length: 40 }, (_, i) => {
      const leftPercent = 3 + Math.random() * 94;
      const size = 10 + Math.pow(Math.random(), 1.4) * 38;
      const duration = 0.62 + Math.random() * 0.26;
      const delay = Math.random() * 0.18;
      const driftX = (Math.random() - 0.5) * 60; // -30px to +30px
      const opacity = 0.6 + Math.random() * 0.38;
      const isLarge = size > 26;

      return {
        id: i,
        leftPercent,
        size,
        duration,
        delay,
        driftX,
        opacity,
        isLarge,
      };
    });
  }, []);

  const isSurging = isActive || isAnimating;

  // Handle active dive/surface surge lifecycle (optimized 720ms total, 300ms midpoint)
  useEffect(() => {
    if (!isActive) {
      setIsAnimating(false);
      hasTriggeredSoundRef.current = false;
      if (midpointTimerRef.current) clearTimeout(midpointTimerRef.current);
      if (completeTimerRef.current) clearTimeout(completeTimerRef.current);
      return;
    }

    setIsAnimating(true);

    // Play bubble dive sound
    if (!hasTriggeredSoundRef.current) {
      soundEngine.playBubbleDive();
      hasTriggeredSoundRef.current = true;
    }

    // Trigger midpoint screen switch at peak bubble density (300ms)
    midpointTimerRef.current = window.setTimeout(() => {
      if (onMidpointRef.current) onMidpointRef.current();
    }, 300);

    // Complete transition when bubbles clear (720ms)
    completeTimerRef.current = window.setTimeout(() => {
      setIsAnimating(false);
      if (onCompleteRef.current) onCompleteRef.current();
    }, 720);

    return () => {
      if (midpointTimerRef.current) clearTimeout(midpointTimerRef.current);
      if (completeTimerRef.current) clearTimeout(completeTimerRef.current);
    };
  }, [isActive]);

  // Handle manual scroll progress audio trigger if provided
  useEffect(() => {
    if (progress !== undefined) {
      if (progress > 0.4 && !hasTriggeredSoundRef.current) {
        soundEngine.playBubbleDive();
        hasTriggeredSoundRef.current = true;
      } else if (progress < 0.15) {
        hasTriggeredSoundRef.current = false;
      }
    }
  }, [progress]);

  const isProgressMode = progress !== undefined && progress > 0.01;
  if (!isSurging && !isProgressMode) {
    return null;
  }

  const manualProgress = progress !== undefined ? Math.max(0, Math.min(1, progress)) : 0;

  return (
    <div
      className={`bubbles-transition-overlay ${isSurging ? 'is-surging' : ''} ${direction === 'surface' ? 'is-surface' : 'is-dive'}`}
      aria-hidden="true"
      style={isProgressMode ? { opacity: Number(Math.min(1, manualProgress * 1.5).toFixed(3)) } : undefined}
    >
      {/* 1. Shimmering Water Distortion Backdrop Veil */}
      <div className="bubbles-water-veil" />

      {/* 2. Radiant Bioluminescent Cyan Depth Bloom */}
      <div
        className="bubbles-depth-bloom"
        style={
          isProgressMode
            ? {
                opacity: Number((manualProgress * 0.85).toFixed(3)),
                transform: `scale(${1 + manualProgress * 0.35})`,
              }
            : undefined
        }
      />

      {/* 3. Volumetric Caustic Light Beams */}
      <div className="bubbles-caustic-rays" />

      {/* 4. Surging Bubble Stream Curtain */}
      <div className="bubbles-curtain-field">
        {bubbles.map((b) => {
          const yOffsetPercent = isProgressMode
            ? (1 - manualProgress) * 115 - manualProgress * 45
            : 0;

          return (
            <div
              key={b.id}
              className={`diving-bubble ${b.isLarge ? 'bubble-large' : ''}`}
              style={{
                left: `${b.leftPercent}%`,
                width: `${b.size}px`,
                height: `${b.size}px`,
                '--bubble-op': b.opacity,
                '--bubble-duration': `${b.duration}s`,
                '--bubble-delay': `${b.delay}s`,
                '--drift-x': `${b.driftX}px`,
                ...(isProgressMode
                  ? {
                      opacity: b.opacity,
                      transform: `translate3d(${b.driftX * manualProgress}px, ${yOffsetPercent}vh, 0)`,
                    }
                  : {}),
              } as React.CSSProperties}
            >
              <div className="bubble-highlight" />
              {b.isLarge && <div className="bubble-micro-highlight" />}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default BubblesTransition;
