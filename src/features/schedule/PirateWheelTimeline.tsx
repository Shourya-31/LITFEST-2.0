import React, { useState, useEffect, useRef, useCallback } from 'react';
import { gsap } from 'gsap';
import {
  Compass,
  Volume2,
  VolumeX,
  MapPin,
  Clock,
  Calendar,
  Anchor,
  ChevronLeft,
  ChevronRight,
  Sparkles,
  Award
} from 'lucide-react';
import { PIRATE_WHEEL_MILESTONES } from './timelineData';
import { PirateWheelSvg } from './PirateWheelSvg';
import { OceanicTimelineBackdrop } from './components/OceanicTimelineBackdrop';
import { soundEngine } from '../../utils/soundEngine';
import type { PirateWheelTimelineProps } from '../../types/timeline';
import '../../styles/timeline.css';

export const PirateWheelTimeline: React.FC<PirateWheelTimelineProps> = ({
  milestones = PIRATE_WHEEL_MILESTONES,
  title = "3D Z-Axis Voyage Timeline",
  subtitle = "Scroll down to zoom into the screen – travel forward through the 10 milestone checkpoints in 3D space.",
  className = "",
  isFaqOpen = false,
  isActive = true,
  initialEventIndex,
  onMilestoneSelect,
  onNavigateHome,
  onNavigateNext,
  onNavigatePrev,
}) => {
  const totalCards = milestones.length;
  const SPACING_Z = 1200;
  const maxCameraZ = Math.max(1, (totalCards - 1) * SPACING_Z);
  const totalEvents = totalCards;

  const [activeIdx, setActiveIdx] = useState<number>(() => {
    if (typeof initialEventIndex === 'number' && initialEventIndex >= 0 && initialEventIndex < totalCards) {
      return initialEventIndex;
    }
    return 0;
  });

  const [rotationDeg, setRotationDeg] = useState<number>(() => {
    const idx = typeof initialEventIndex === 'number' && initialEventIndex >= 0 && initialEventIndex < totalCards
      ? initialEventIndex
      : 0;
    return -idx * (360 / totalEvents);
  });

  const [isMuted, setIsMuted] = useState<boolean>(soundEngine.getMuted());
  const [currentZ, setCurrentZ] = useState<number>(() => {
    const idx = typeof initialEventIndex === 'number' && initialEventIndex >= 0 && initialEventIndex < totalCards
      ? initialEventIndex
      : 0;
    return idx * SPACING_Z;
  });
  const [isSteering, setIsSteering] = useState<boolean>(false);

  // Stable refs to prevent re-binding listeners during parent re-renders
  const isActiveRef = useRef(isActive);
  isActiveRef.current = isActive;
  const onNavigateHomeRef = useRef(onNavigateHome);
  onNavigateHomeRef.current = onNavigateHome;
  const onNavigateNextRef = useRef(onNavigateNext);
  onNavigateNextRef.current = onNavigateNext;
  const onNavigatePrevRef = useRef(onNavigatePrev);
  onNavigatePrevRef.current = onNavigatePrev;
  const activeIdxRef = useRef<number>(activeIdx);
  activeIdxRef.current = activeIdx;

  const activationTimeRef = useRef<number>(performance.now());
  const boundaryOverscrollRef = useRef<number>(0);
  const boundaryResetTimeoutRef = useRef<number | null>(null);

  // Initialize or re-position camera when activated or initialEventIndex changes
  useEffect(() => {
    if (isActive) {
      activationTimeRef.current = performance.now();
      boundaryOverscrollRef.current = 0;

      const targetIdx =
        typeof initialEventIndex === 'number' && initialEventIndex >= 0 && initialEventIndex < totalCards
          ? initialEventIndex
          : 0;
      const destZ = targetIdx * SPACING_Z;
      targetZRef.current = destZ;
      currentZRef.current = destZ;
      setActiveIdx(targetIdx);
      setRotationDeg(-targetIdx * (360 / totalEvents));
      setCurrentZ(destZ);
      if (cameraRef.current) {
        cameraRef.current.style.transform = `translate3d(0, 0, ${destZ}px)`;
      }
    }
  }, [isActive, initialEventIndex, totalCards, SPACING_Z, totalEvents]);

  const containerRef = useRef<HTMLDivElement | null>(null);
  const cameraRef = useRef<HTMLDivElement | null>(null);
  const wheelWrapRef = useRef<HTMLDivElement | null>(null);

  // Smooth Momentum Z-Axis Animation State
  const initialZ = typeof initialEventIndex === 'number' && initialEventIndex >= 0 && initialEventIndex < totalCards
    ? initialEventIndex * SPACING_Z
    : 0;
  const targetZRef = useRef<number>(initialZ);
  const currentZRef = useRef<number>(initialZ);
  const prevActiveIdxRef = useRef<number>(activeIdx);

  // Mouse drag steering wheel refs
  const isDraggingHelmRef = useRef<boolean>(false);
  const lastPointerAngleRef = useRef<number>(0);
  const totalDragAngleRef = useRef<number>(0);
  const hasDraggedRef = useRef<boolean>(false);

  // Snap-to-nearest checkpoint timer ref
  const scrollSnapTimerRef = useRef<number | null>(null);
  const dragSnapTimerRef = useRef<number | null>(null);
  const touchStartYRef = useRef<number | null>(null);

  // Navigate directly to a specific event milestone with smooth GSAP easing
  const zoomToMilestone = useCallback((idx: number) => {
    const targetIdx = Math.max(0, Math.min(idx, totalCards - 1));
    const destinationZ = targetIdx * SPACING_Z;

    gsap.killTweensOf(targetZRef);
    gsap.to(targetZRef, {
      current: destinationZ,
      duration: 0.55,
      ease: 'power2.out',
    });

    if (onMilestoneSelect) {
      onMilestoneSelect(milestones[targetIdx]);
    }
  }, [totalCards, SPACING_Z, milestones, onMilestoneSelect]);

  const stepZoomOut = useCallback(() => {
    const current = activeIdxRef.current;
    if (current > 0) {
      zoomToMilestone(current - 1);
    } else if (onNavigatePrevRef.current) {
      onNavigatePrevRef.current();
    } else if (onNavigateHomeRef.current) {
      onNavigateHomeRef.current();
    }
  }, [zoomToMilestone]);

  const stepZoomIn = useCallback(() => {
    const current = activeIdxRef.current;
    if (current < totalCards - 1) {
      zoomToMilestone(current + 1);
    } else if (onNavigateNextRef.current) {
      onNavigateNextRef.current();
    }
  }, [totalCards, zoomToMilestone]);

  const toggleSound = () => {
    const newMuted = soundEngine.toggleMute();
    setIsMuted(newMuted);
    if (!newMuted) {
      soundEngine.playWaterBell(activeIdx);
    }
  };

  // Main 60/120fps Animation Loop connected to GSAP Ticker
  useEffect(() => {
    const tickerUpdate = () => {
      if (!isActiveRef.current) return;

      // Silky smooth momentum lerp: currentZ smoothly pursues targetZ
      const diff = targetZRef.current - currentZRef.current;
      if (Math.abs(diff) > 0.05) {
        currentZRef.current += diff * 0.14;
      } else {
        currentZRef.current = targetZRef.current;
      }

      const zVal = currentZRef.current;

      // 1. Smooth 3D Camera Rig translation
      if (cameraRef.current) {
        cameraRef.current.style.transform = `translate3d(0, 0, ${zVal}px)`;
      }

      // 2. Smooth Steering Wheel Rotation (active spoke stays at 12 o'clock)
      const continuousIdx = zVal / SPACING_Z;
      const degPerEvent = 360 / totalEvents;
      const targetWheelRotation = -continuousIdx * degPerEvent;
      setRotationDeg(targetWheelRotation);
      setCurrentZ(Math.round(zVal));

      // 3. Active milestone index detection with audio & card micro-pop
      const approxIdx = Math.max(0, Math.min(Math.round(continuousIdx), totalCards - 1));
      if (approxIdx !== prevActiveIdxRef.current) {
        prevActiveIdxRef.current = approxIdx;
        setActiveIdx(approxIdx);
        soundEngine.playWaterTransition(approxIdx);

        // GSAP micro-animation on active event card
        const activeCard = document.querySelector(
          `.z-milestone-checkpoint-plane[data-event-idx="${approxIdx}"] .z-checkpoint-card`
        );
        if (activeCard) {
          gsap.fromTo(
            activeCard,
            { scale: 0.97 },
            { scale: 1, duration: 0.28, ease: 'power2.out' }
          );
        }
      }
    };

    gsap.ticker.add(tickerUpdate);
    gsap.ticker.lagSmoothing(0);

    // Smooth Wheel Event Listener: continuous momentum traversal and boundary slide transitions
    const handleTimelineWheel = (e: WheelEvent) => {
      if (!isActiveRef.current || isFaqOpen) return;
      if (
        document.querySelector('.ocean-modal-overlay') ||
        document.querySelector('.faq-chamber-backdrop') ||
        document.querySelector('.abyssal-explorer-overlay')
      ) {
        return;
      }

      const now = performance.now();
      const isReadyForBoundary = now - activationTimeRef.current >= 300;

      // Boundary condition: At Event 1 (top) and scrolling up -> surface to About (Slide 2)
      const atTop = targetZRef.current <= 25;
      if (atTop && e.deltaY < 0 && isReadyForBoundary) {
        if (boundaryResetTimeoutRef.current) window.clearTimeout(boundaryResetTimeoutRef.current);
        boundaryOverscrollRef.current += e.deltaY;

        boundaryResetTimeoutRef.current = window.setTimeout(() => {
          boundaryOverscrollRef.current = 0;
        }, 220);

        if (boundaryOverscrollRef.current <= -28) {
          boundaryOverscrollRef.current = 0;
          if (onNavigatePrevRef.current) {
            onNavigatePrevRef.current();
            return;
          } else if (onNavigateHomeRef.current) {
            onNavigateHomeRef.current();
            return;
          }
        }
        return;
      }

      // Boundary condition: At Event 10 (bottom) and scrolling down -> dive to Sponsors (Slide 4)
      const atBottom = targetZRef.current >= maxCameraZ - 25;
      if (atBottom && e.deltaY > 0 && isReadyForBoundary) {
        if (boundaryResetTimeoutRef.current) window.clearTimeout(boundaryResetTimeoutRef.current);
        boundaryOverscrollRef.current += e.deltaY;

        boundaryResetTimeoutRef.current = window.setTimeout(() => {
          boundaryOverscrollRef.current = 0;
        }, 220);

        if (boundaryOverscrollRef.current >= 28) {
          boundaryOverscrollRef.current = 0;
          if (onNavigateNextRef.current) {
            onNavigateNextRef.current();
            return;
          }
        }
        return;
      }

      // Inside timeline: reset boundary accumulator
      boundaryOverscrollRef.current = 0;

      // Smooth continuous momentum wheel travel across the 10 milestone cards
      gsap.killTweensOf(targetZRef);
      const scrollStep = e.deltaY * 1.5;
      targetZRef.current = Math.max(0, Math.min(maxCameraZ, targetZRef.current + scrollStep));

      // Snap smoothly to nearest event milestone once wheeling settles
      if (scrollSnapTimerRef.current) clearTimeout(scrollSnapTimerRef.current);
      scrollSnapTimerRef.current = window.setTimeout(() => {
        if (isDraggingHelmRef.current) return;
        const nearestIdx = Math.max(
          0,
          Math.min(Math.round(targetZRef.current / SPACING_Z), totalCards - 1)
        );
        const snappedZ = nearestIdx * SPACING_Z;
        gsap.to(targetZRef, {
          current: snappedZ,
          duration: 0.5,
          ease: 'power2.out',
        });
      }, 150);
    };

    window.addEventListener('wheel', handleTimelineWheel, { passive: true });

    return () => {
      gsap.ticker.remove(tickerUpdate);
      window.removeEventListener('wheel', handleTimelineWheel);
      if (scrollSnapTimerRef.current) clearTimeout(scrollSnapTimerRef.current);
      if (dragSnapTimerRef.current) clearTimeout(dragSnapTimerRef.current);
      if (boundaryResetTimeoutRef.current) clearTimeout(boundaryResetTimeoutRef.current);
    };
  }, [totalCards, maxCameraZ, SPACING_Z, totalEvents, isFaqOpen]);

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isActiveRef.current || isFaqOpen) return;
      if (e.key === 'ArrowDown' || e.key === 'PageDown' || e.key === ' ') {
        e.preventDefault();
        stepZoomIn();
      } else if (e.key === 'ArrowUp' || e.key === 'PageUp') {
        e.preventDefault();
        stepZoomOut();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [stepZoomIn, stepZoomOut, isFaqOpen]);

  // Touch gesture swipe handling with boundary support
  const handleTouchStart = (e: React.TouchEvent<HTMLDivElement>) => {
    touchStartYRef.current = e.touches[0].clientY;
  };

  const handleTouchMove = (e: React.TouchEvent<HTMLDivElement>) => {
    if (touchStartYRef.current === null) return;
    const deltaY = touchStartYRef.current - e.touches[0].clientY;
    touchStartYRef.current = e.touches[0].clientY;

    const now = performance.now();
    const isReadyForBoundary = now - activationTimeRef.current >= 300;

    // Boundary check on touch swipe
    if (targetZRef.current <= 25 && deltaY < -24 && isReadyForBoundary) {
      if (onNavigatePrevRef.current) {
        onNavigatePrevRef.current();
        return;
      }
    }

    if (targetZRef.current >= maxCameraZ - 25 && deltaY > 24 && isReadyForBoundary) {
      if (onNavigateNextRef.current) {
        onNavigateNextRef.current();
        return;
      }
    }

    gsap.killTweensOf(targetZRef);
    targetZRef.current = Math.max(0, Math.min(maxCameraZ, targetZRef.current + deltaY * 2.2));
  };

  const handleTouchEnd = () => {
    touchStartYRef.current = null;
    const nearestIdx = Math.max(
      0,
      Math.min(Math.round(targetZRef.current / SPACING_Z), totalCards - 1)
    );
    zoomToMilestone(nearestIdx);
  };

  // Mouse / Pointer steering wheel turning by dragging around the helm
  const handleHelmPointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    if (e.button !== 0) return;
    const wrap = wheelWrapRef.current;
    if (!wrap) return;

    const rect = wrap.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;

    const startAngle = Math.atan2(e.clientY - centerY, e.clientX - centerX) * (180 / Math.PI);
    lastPointerAngleRef.current = startAngle;
    isDraggingHelmRef.current = true;
    hasDraggedRef.current = false;
    totalDragAngleRef.current = 0;
    setIsSteering(true);

    const onPointerMove = (moveEvt: PointerEvent) => {
      if (!isDraggingHelmRef.current) return;
      moveEvt.preventDefault();

      const currentAngle = Math.atan2(moveEvt.clientY - centerY, moveEvt.clientX - centerX) * (180 / Math.PI);
      let deltaAngle = currentAngle - lastPointerAngleRef.current;

      // Handle wrap-around across the +/- 180 degree threshold
      if (deltaAngle > 180) deltaAngle -= 360;
      if (deltaAngle < -180) deltaAngle += 360;

      totalDragAngleRef.current += Math.abs(deltaAngle);
      if (totalDragAngleRef.current > 2.5) {
        hasDraggedRef.current = true;
      }

      // Convert wheel angular change to Z-axis travel:
      const degPerEvent = 360 / totalEvents;
      const deltaZ = -deltaAngle * (SPACING_Z / degPerEvent);
      const newZ = Math.max(0, Math.min(currentZRef.current + deltaZ, maxCameraZ));

      currentZRef.current = newZ;
      targetZRef.current = newZ;

      if (cameraRef.current) {
        cameraRef.current.style.transform = `translate3d(0, 0, ${newZ}px)`;
      }

      const continuousIdx = newZ / SPACING_Z;
      setRotationDeg(-continuousIdx * degPerEvent);
      setCurrentZ(Math.round(newZ));

      const approxIdx = Math.max(0, Math.min(Math.round(continuousIdx), totalCards - 1));
      if (approxIdx !== prevActiveIdxRef.current) {
        prevActiveIdxRef.current = approxIdx;
        setActiveIdx(approxIdx);
        soundEngine.playWaterTransition(approxIdx);
      }

      lastPointerAngleRef.current = currentAngle;
    };

    const onPointerUp = () => {
      isDraggingHelmRef.current = false;
      setIsSteering(false);
      window.removeEventListener('pointermove', onPointerMove);
      window.removeEventListener('pointerup', onPointerUp);

      const nearestIdx = Math.max(
        0,
        Math.min(Math.round(currentZRef.current / SPACING_Z), totalCards - 1)
      );
      zoomToMilestone(nearestIdx);
    };

    window.addEventListener('pointermove', onPointerMove);
    window.addEventListener('pointerup', onPointerUp);
  };

  const handleEventClick = (idx: number) => {
    if (hasDraggedRef.current) return;
    zoomToMilestone(idx);
  };

  const handleProgressBarClick = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const fraction = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
    const targetIdx = Math.round(fraction * (totalCards - 1));
    zoomToMilestone(targetIdx);
  };

  return (
    <section
      ref={containerRef}
      id="timeline-stage"
      className={`z-axis-interactive-viewport ${className}`}
      aria-label={`${title}. ${subtitle}`}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    >
      {/* 1. Living Oceanic Voyage Backdrop */}
      <OceanicTimelineBackdrop
        currentZ={currentZ}
        maxCameraZ={maxCameraZ}
        activeIdx={activeIdx}
      />

      {/* 2. 3D Oceanic Starfield / Water Tunnel */}
      <div className="z-ocean-starfield" aria-hidden="true">
        <div className="z-tunnel-ring ring-1" style={{ transform: `translateZ(${-(currentZ * 0.4) % 1800}px)` }} />
        <div className="z-tunnel-ring ring-2" style={{ transform: `translateZ(${-(currentZ * 0.7) % 2400}px)` }} />
        <div className="z-tunnel-ring ring-3" style={{ transform: `translateZ(${-(currentZ * 1.0) % 3000}px)` }} />
      </div>

      {/* 3. 3D WORLD STAGE: perspective container & camera rig */}
      <div className="z-world-perspective-stage">
        <div ref={cameraRef} className="z-world-camera">
          {milestones.map((milestone, idx) => {
            const milestoneWorldZ = -idx * SPACING_Z;
            const relDist = milestoneWorldZ + currentZ;

            const isVisible = relDist > -3600 && relDist < 250;
            if (!isVisible) return null;

            let opacity = 1;
            let blurPx = 0;
            if (relDist < 0) {
              opacity = Math.max(0, Math.min(1, 1 - Math.abs(relDist) / 2200));
              blurPx = Math.min(6, Math.abs(relDist) / 400);
            } else {
              // Fade out smoothly as camera zooms inside
              opacity = Math.max(0, Math.min(1, 1 - relDist / 200));
              blurPx = Math.min(8, relDist / 25);
            }

            const isInFocus = activeIdx === idx;

            return (
              <div
                key={milestone.id}
                data-event-idx={idx}
                className={`z-milestone-checkpoint-plane ${isInFocus ? 'is-active-checkpoint' : ''}`}
                style={{
                  transform: `translate3d(0, 0, ${milestoneWorldZ}px)`,
                  opacity,
                  filter: `blur(${blurPx.toFixed(1)}px)`,
                  pointerEvents: isInFocus ? 'auto' : 'none'
                }}
                onClick={() => zoomToMilestone(idx)}
              >
                <article className="voyage-card-inner z-checkpoint-card interactive">
                  <div className="card-header-row">
                    <div className="card-spoke-crest">
                      <Anchor size={14} className="crest-anchor" />
                      <span>EVENT {milestone.eventNumber || idx + 1}</span>
                      <strong className="crest-roman">[{milestone.romanNumeral}]</strong>
                    </div>
                    <span className="card-z-depth-pill">
                      EVENT {idx + 1} OF {totalCards}
                    </span>
                  </div>

                  <h3 className="card-milestone-title">{milestone.title}</h3>

                  <div className="card-theme-tag">
                    <Compass size={13} />
                    <span>{milestone.nauticalTheme}</span>
                  </div>

                  <div className="card-voyage-meta">
                    <div className="meta-tile">
                      <span className="meta-tile-label">
                        <Calendar size={12} /> DATE
                      </span>
                      <strong className="meta-tile-value">{milestone.date}</strong>
                    </div>
                    <div className="meta-tile">
                      <span className="meta-tile-label">
                        <Clock size={12} /> TIME
                      </span>
                      <strong className="meta-tile-value">{milestone.time}</strong>
                    </div>
                    <div className="meta-tile meta-tile-full">
                      <span className="meta-tile-label">
                        <MapPin size={12} /> LOCATION
                      </span>
                      <strong className="meta-tile-value">{milestone.venue}</strong>
                    </div>
                  </div>

                  <div className="card-captains-log">
                    <div className="log-feather-icon">📜 Captain's Logbook:</div>
                    <p className="log-text">"{milestone.captainLog}"</p>
                  </div>

                  <div className="card-highlights-box">
                    <div className="highlights-header">
                      <Sparkles size={13} />
                      <span>Highlights:</span>
                    </div>
                    <p className="highlights-desc">{milestone.highlights}</p>
                  </div>

                  {(milestone.leads?.length || milestone.team?.length) ? (
                    <div className="card-team-box">
                      {milestone.leads && milestone.leads.length > 0 && (
                        <div className="card-team-row">
                          <span className="card-team-label">
                            Team {milestone.leads.length > 1 ? 'Leads' : 'Lead'}:
                          </span>
                          <span className="card-team-names leads">
                            {milestone.leads.join(', ')}
                          </span>
                        </div>
                      )}
                      {milestone.team && milestone.team.length > 0 && (
                        <div className="card-team-row">
                          <span className="card-team-label">Team:</span>
                          <span className="card-team-names">
                            {milestone.team.join(', ')}
                          </span>
                        </div>
                      )}
                    </div>
                  ) : null}

                  <div className="card-footer-row">
                    <div className="card-bounty-badge">
                      <Award size={15} />
                      <span>{milestone.bountyOrPrize}</span>
                    </div>
                    <button
                      type="button"
                      className="card-explore-btn interactive"
                      onClick={(e) => {
                        e.stopPropagation();
                        zoomToMilestone(idx);
                        if (onMilestoneSelect) onMilestoneSelect(milestone);
                      }}
                      title={`Inspect details for ${milestone.title}`}
                      aria-label={`Explore details for Event ${milestone.eventNumber || idx + 1}: ${milestone.title}`}
                    >
                      <span>Explore Event</span>
                      <ChevronRight size={14} className="explore-arrow" />
                    </button>
                  </div>
                </article>
              </div>
            );
          })}
        </div>
      </div>

      {/* 4. HEADS-UP DISPLAY (HUD) */}
      <div className="z-axis-hud-overlay">
        {/* Bottom Left: The 10-Spoke Pirate Ship Steering Wheel (Unboxed & Floating) */}
        <div className={`z-hud-helm-dock ${isSteering ? 'is-steering' : ''}`}>
          <div className="helm-dock-header">
            <span className="dock-title">PIRATE SHIP HELM</span>
            <span className="dock-sub">{isSteering ? '⚓ STEERING...' : `EVENT ${activeIdx + 1} AT TOP`}</span>
          </div>

          <div
            ref={wheelWrapRef}
            className={`helm-dock-wheel-wrap ${isSteering ? 'is-steering' : ''}`}
            onPointerDown={handleHelmPointerDown}
            title="Click and drag around the wheel to steer through the events"
          >
            <PirateWheelSvg
              milestones={milestones}
              activeIdx={activeIdx}
              rotationDeg={rotationDeg}
              onEventClick={handleEventClick}
              onCenterClick={() => {
                if (!hasDraggedRef.current) {
                  soundEngine.playWaterBell(activeIdx);
                }
              }}
            />
          </div>

          <div className="helm-drag-hint" title="Drag the steering wheel to navigate events">
            <Compass size={12} className="hint-compass-icon" />
            <span>Steer through the Timeline</span>
          </div>

          {/* Steer Port / Sound / Starboard Buttons */}
          <div className="helm-dock-controls">
            <button
              type="button"
              className="dock-ctrl-btn interactive"
              onClick={stepZoomOut}
              disabled={activeIdx === 0}
              title="Previous Event (Zoom Out)"
              aria-label="Previous event"
            >
              <ChevronLeft size={16} />
              <span>PORT</span>
            </button>

            <button
              type="button"
              className={`dock-ctrl-btn sound-btn interactive ${isMuted ? 'muted' : ''}`}
              onClick={toggleSound}
              title={isMuted ? "Unmute Sound" : "Mute Sound"}
              aria-label={isMuted ? "Unmute sound" : "Mute sound"}
            >
              {isMuted ? <VolumeX size={15} /> : <Volume2 size={15} />}
            </button>

            <button
              type="button"
              className="dock-ctrl-btn interactive"
              onClick={stepZoomIn}
              disabled={activeIdx === totalCards - 1}
              title="Next Event (Zoom In)"
              aria-label="Next event"
            >
              <span>STBD</span>
              <ChevronRight size={16} />
            </button>
          </div>
        </div>

        {/* Bottom Center: Minimalistic Loading Progress Bar (No Text) */}
        <div className="z-minimal-progress-dock" aria-label="Event Timeline Progress">
          <div
            className="minimal-progress-track interactive"
            onClick={handleProgressBarClick}
            title="Click to jump to event along timeline"
            role="progressbar"
            aria-valuenow={activeIdx + 1}
            aria-valuemin={1}
            aria-valuemax={totalCards}
          >
            <div
              className="minimal-progress-fill"
              style={{ width: `${Math.max(3, (currentZ / maxCameraZ) * 100)}%` }}
            />
            {milestones.map((_, i) => (
              <div
                key={`tick-${i}`}
                className={`minimal-progress-tick ${activeIdx === i ? 'active' : ''}`}
                style={{ left: `${(i / (totalCards - 1)) * 100}%` }}
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default PirateWheelTimeline;
