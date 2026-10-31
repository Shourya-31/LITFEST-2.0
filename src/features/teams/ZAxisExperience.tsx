import React, { useRef, useEffect, useCallback, type ReactNode, type WheelEvent, type TouchEvent } from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';

export interface ZAxisExperienceProps<T> {
  items: T[];
  activeIndex: number;
  onChangeActiveIndex: (index: number) => void;
  userZoomScale?: number;
  renderItem: (item: T, index: number, isActive: boolean) => ReactNode;
  getLabel?: (item: T, index: number) => string;
  className?: string;
  onAscendToTop?: () => void;
}

export function ZAxisExperience<T>({
  items,
  activeIndex,
  onChangeActiveIndex,
  userZoomScale = 1,
  renderItem,
  getLabel,
  className = '',
  onAscendToTop,
}: ZAxisExperienceProps<T>) {
  const containerRef = useRef<HTMLDivElement>(null);
  const lastTransitionTime = useRef(0);
  const wheelAccumulator = useRef(0);
  const touchStartY = useRef<number | null>(null);

  const total = items.length;

  const goToIndex = useCallback(
    (index: number) => {
      const target = Math.max(0, Math.min(total - 1, index));
      if (target !== activeIndex) {
        onChangeActiveIndex(target);
      }
    },
    [total, activeIndex, onChangeActiveIndex]
  );

  const diveNext = useCallback(() => {
    if (activeIndex < total - 1) {
      goToIndex(activeIndex + 1);
    }
  }, [activeIndex, total, goToIndex]);

  const surfacePrev = useCallback(() => {
    if (activeIndex > 0) {
      goToIndex(activeIndex - 1);
    }
  }, [activeIndex, goToIndex]);

  // Wheel handling with scroll-boundary detection
  const handleWheel = (e: WheelEvent<HTMLDivElement>) => {
    const now = performance.now();
    if (now - lastTransitionTime.current < 450) return;

    // Check if inner content is scrollable
    const target = e.target as HTMLElement | null;
    const scrollable = target?.closest('.team-cards-scroll-container') as HTMLElement | null;
    if (scrollable) {
      const tolerance = 12;
      const isAtTop = scrollable.scrollTop <= tolerance;
      const isAtBottom =
        scrollable.scrollTop + scrollable.clientHeight >= scrollable.scrollHeight - tolerance;

      if (e.deltaY > 0 && !isAtBottom) return;
      if (e.deltaY < 0 && !isAtTop) return;
    }

    wheelAccumulator.current += e.deltaY;
    if (Math.abs(wheelAccumulator.current) >= 40) {
      if (wheelAccumulator.current > 0) {
        diveNext();
      } else {
        surfacePrev();
      }
      wheelAccumulator.current = 0;
      lastTransitionTime.current = now;
    }
  };

  // Touch handlers
  const handleTouchStart = (e: TouchEvent<HTMLDivElement>) => {
    touchStartY.current = e.touches[0].clientY;
  };

  const handleTouchEnd = (e: TouchEvent<HTMLDivElement>) => {
    if (touchStartY.current === null) return;
    const deltaY = touchStartY.current - e.changedTouches[0].clientY;
    touchStartY.current = null;

    const target = e.target as HTMLElement | null;
    const scrollable = target?.closest('.team-cards-scroll-container') as HTMLElement | null;
    if (scrollable) {
      const tolerance = 14;
      const isAtTop = scrollable.scrollTop <= tolerance;
      const isAtBottom =
        scrollable.scrollTop + scrollable.clientHeight >= scrollable.scrollHeight - tolerance;

      if (deltaY > 0 && !isAtBottom) return;
      if (deltaY < 0 && !isAtTop) return;
    }

    if (Math.abs(deltaY) >= 45) {
      if (deltaY > 0) {
        diveNext();
      } else {
        surfacePrev();
      }
    }
  };

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const tag = (e.target as HTMLElement)?.tagName?.toLowerCase();
      if (tag === 'input' || tag === 'textarea') return;

      if (e.key === 'ArrowDown' || e.key === 'PageDown') {
        e.preventDefault();
        diveNext();
      } else if (e.key === 'ArrowUp' || e.key === 'PageUp') {
        e.preventDefault();
        surfacePrev();
      } else if (e.key === 'Home') {
        e.preventDefault();
        goToIndex(0);
      } else if (e.key === 'End') {
        e.preventDefault();
        goToIndex(total - 1);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [diveNext, surfacePrev, goToIndex, total]);

  return (
    <div
      ref={containerRef}
      onWheel={handleWheel}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
      className={`team-3d-viewport ${className}`}
      data-lenis-prevent
    >
      <div className="team-3d-world">
        {items.map((item, index) => {
          const delta = index - activeIndex;
          let transform = 'translate3d(0, 0, 0px) scale(1)';
          let opacity = 1;
          let filter = 'blur(0px)';
          let pointerEvents: 'auto' | 'none' = 'auto';
          let visibility: 'visible' | 'hidden' = 'visible';

          if (delta === 0) {
            // Current in-focus section
            transform = `translate3d(0, 0, 0px) scale(${userZoomScale})`;
            opacity = 1;
            filter = 'blur(0px)';
            pointerEvents = 'auto';
            visibility = 'visible';
          } else if (delta > 0) {
            // Sections deeper in Z-space ahead of viewer
            const zDist = -Math.min(delta * 850, 2600);
            const scale = Math.max(0.35, 1 - delta * 0.28);
            transform = `translate3d(0, 0, ${zDist}px) scale(${scale})`;
            opacity = delta === 1 ? 0.08 : 0;
            filter = 'blur(10px)';
            pointerEvents = 'none';
            visibility = delta === 1 ? 'visible' : 'hidden';
          } else {
            // Sections moved past the camera closer to viewer
            const zDist = Math.min(-delta * 750, 2000);
            const scale = 1 + -delta * 0.45;
            transform = `translate3d(0, 0, ${zDist}px) scale(${scale})`;
            opacity = 0;
            filter = 'blur(12px)';
            pointerEvents = 'none';
            visibility = 'hidden';
          }

          return (
            <div
              key={index}
              data-tier-index={index}
              className={`team-3d-slide ${delta === 0 ? 'is-active-tier' : ''}`}
              style={{
                transform,
                opacity,
                filter,
                pointerEvents,
                visibility,
                zIndex: delta === 0 ? 20 : 5,
              }}
            >
              {Math.abs(delta) <= 1 ? renderItem(item, index, delta === 0) : null}
            </div>
          );
        })}
      </div>

      {/* Floating 3D Depth Stepper (Right side pearls) */}
      <nav aria-label="Tier Depth Navigator" className="team-depth-stepper">
        {items.map((item, idx) => {
          const label = getLabel ? getLabel(item, idx) : `Tier ${idx + 1}`;
          return (
            <button
              key={idx}
              type="button"
              onClick={() => goToIndex(idx)}
              className={`depth-step-dot ${idx === activeIndex ? 'is-active' : ''}`}
              title={label}
              aria-label={`Jump to ${label}`}
            />
          );
        })}
      </nav>

      {/* Bottom Dive / Return Status Button */}
      <div className="team-dive-status-bar">
        {activeIndex < total - 1 ? (
          <button type="button" onClick={diveNext} className="team-dive-status-btn">
            <span>Scroll or click to dive deeper</span>
            <ChevronDown size={15} />
          </button>
        ) : (
          <button
            type="button"
            onClick={onAscendToTop || (() => goToIndex(0))}
            className="team-dive-status-btn"
          >
            <span>Return to Overall Coordinators</span>
            <ChevronUp size={15} />
          </button>
        )}
      </div>
    </div>
  );
}
