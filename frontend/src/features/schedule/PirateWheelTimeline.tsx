import React, { useState, useEffect, useRef, useCallback } from 'react';
import Lenis from 'lenis';
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
  Award,
  ZoomIn,
  ZoomOut
} from 'lucide-react';
import { PIRATE_WHEEL_MILESTONES } from './timelineData';
import { PirateWheelSvg } from './PirateWheelSvg';
import { soundEngine } from '../../utils/soundEngine';
import { TimelineMilestone, PirateWheelTimelineProps } from '../../types/timeline';

export const PirateWheelTimeline: React.FC<PirateWheelTimelineProps> = ({
  milestones = PIRATE_WHEEL_MILESTONES,
  title = "3D Z-Axis Voyage Timeline",
  subtitle = "Scroll down to zoom into the screen — travel forward through the 14 milestone checkpoints in 3D space.",
  className = "",
  isFaqOpen = false,
  onMilestoneSelect
}) => {
  const [activeIdx, setActiveIdx] = useState<number>(0);
  const [rotationDeg, setRotationDeg] = useState<number>(0);
  const [isMuted, setIsMuted] = useState<boolean>(soundEngine.getMuted());
  const [currentZ, setCurrentZ] = useState<number>(0);
  const [isSteering, setIsSteering] = useState<boolean>(false);

  const containerRef = useRef<HTMLDivElement | null>(null);
  const cameraRef = useRef<HTMLDivElement | null>(null);
  const wheelWrapRef = useRef<HTMLDivElement | null>(null);
  const lenisRef = useRef<Lenis | null>(null);

  // Z-spacing between milestone event checkpoints in 3D world space
  const SPACING_Z = 1200;
  const totalCards = milestones.length;
  const maxCameraZ = (totalCards - 1) * SPACING_Z;
  const totalEvents = 14;

  const targetZRef = useRef<number>(0);
  const currentZRef = useRef<number>(0);
  const prevActiveIdxRef = useRef<number>(0);

  // Mouse drag steering wheel refs
  const isDraggingHelmRef = useRef<boolean>(false);
  const lastPointerAngleRef = useRef<number>(0);
  const totalDragAngleRef = useRef<number>(0);
  const hasDraggedRef = useRef<boolean>(false);

  // Snap-to-nearest checkpoint timer refs
  const scrollSnapTimerRef = useRef<number | null>(null);
  const dragSnapTimerRef = useRef<number | null>(null);

  const selectedMilestone = milestones[activeIdx] || milestones[0];

  // Initialize Lenis smooth scroll engine synchronized with GSAP Ticker
  useEffect(() => {
    const lenis = new Lenis({
      duration: 1.2,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      orientation: 'vertical',
      gestureOrientation: 'vertical',
      smoothWheel: true,
      wheelMultiplier: 1.0,
      touchMultiplier: 1.6,
    });
    lenisRef.current = lenis;

    // Connect Lenis animation frame to GSAP ticker for 60/120fps hardware rendering
    const tickerUpdate = (time: number) => {
      lenis.raf(time * 1000);
    };
    gsap.ticker.add(tickerUpdate);
    gsap.ticker.lagSmoothing(0);

    // Lenis scroll listener: Translates scroll progress into 3D Z-axis traversal
    lenis.on('scroll', (e: { progress: number; velocity: number }) => {
      if (isDraggingHelmRef.current) return;

      const zVal = e.progress * maxCameraZ;
      currentZRef.current = zVal;
      targetZRef.current = zVal;

      if (cameraRef.current) {
        cameraRef.current.style.transform = `translate3d(0, 0, ${zVal}px)`;
      }

      const continuousIdx = zVal / SPACING_Z;
      const approxIdx = Math.max(0, Math.min(Math.round(continuousIdx), totalCards - 1));

      if (approxIdx !== prevActiveIdxRef.current) {
        prevActiveIdxRef.current = approxIdx;
        setActiveIdx(approxIdx);
        soundEngine.playHelmClick(approxIdx);
        soundEngine.playSeaBell(approxIdx);

        // GSAP micro-animation on active event card
        const activeCard = document.querySelector(`.z-milestone-checkpoint-plane[data-event-idx="${approxIdx}"] .z-checkpoint-card`);
        if (activeCard) {
          gsap.fromTo(
            activeCard,
            { scale: 0.97 },
            { scale: 1, duration: 0.45, ease: 'power2.out' }
          );
        }
      }

      // Selected event remains fixed at 12 o'clock top pointer
      const targetWheelRotation = -continuousIdx * (360 / totalEvents);
      setRotationDeg(targetWheelRotation);
      setCurrentZ(Math.round(zVal));
    });

    // Snap to nearest event milestone on scroll stop
    lenis.on('scroll', () => {
      if (isDraggingHelmRef.current) return;
      if (scrollSnapTimerRef.current) clearTimeout(scrollSnapTimerRef.current);

      scrollSnapTimerRef.current = window.setTimeout(() => {
        if (isDraggingHelmRef.current) return;
        const limit = lenis.limit;
        if (limit > 0) {
          const nearestIdx = Math.max(0, Math.min(Math.round(lenis.progress * (totalCards - 1)), totalCards - 1));
          const snapScroll = (nearestIdx / (totalCards - 1)) * limit;
          lenis.scrollTo(snapScroll, {
            duration: 0.85,
            easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t))
          });
        }
      }, 180);
    });

    return () => {
      gsap.ticker.remove(tickerUpdate);
      lenis.destroy();
      lenisRef.current = null;
      if (scrollSnapTimerRef.current) clearTimeout(scrollSnapTimerRef.current);
      if (dragSnapTimerRef.current) clearTimeout(dragSnapTimerRef.current);
    };
  }, [totalCards, maxCameraZ, SPACING_Z, totalEvents]);

  // Pause / Resume Lenis when FAQ chamber modal opens
  useEffect(() => {
    if (!lenisRef.current) return;
    if (isFaqOpen) {
      lenisRef.current.stop();
    } else {
      lenisRef.current.start();
    }
  }, [isFaqOpen]);

  // Snap to nearest event helper
  const snapToNearestEvent = useCallback(() => {
    const nearestIdx = Math.max(0, Math.min(Math.round(currentZRef.current / SPACING_Z), totalCards - 1));
    if (lenisRef.current && lenisRef.current.limit > 0) {
      const snapScroll = (nearestIdx / (totalCards - 1)) * lenisRef.current.limit;
      lenisRef.current.scrollTo(snapScroll, {
        duration: 0.85,
        easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t))
      });
    } else {
      targetZRef.current = nearestIdx * SPACING_Z;
      currentZRef.current = nearestIdx * SPACING_Z;
      if (cameraRef.current) {
        cameraRef.current.style.transform = `translate3d(0, 0, ${nearestIdx * SPACING_Z}px)`;
      }
      setActiveIdx(nearestIdx);
      setRotationDeg(-nearestIdx * (360 / totalEvents));
      setCurrentZ(nearestIdx * SPACING_Z);
    }
  }, [totalCards, totalEvents, SPACING_Z]);

  // Navigate directly to a specific event milestone
  const zoomToMilestone = useCallback((idx: number) => {
    const targetIdx = Math.max(0, Math.min(idx, totalCards - 1));
    if (lenisRef.current && lenisRef.current.limit > 0) {
      const targetScroll = (targetIdx / (totalCards - 1)) * lenisRef.current.limit;
      lenisRef.current.scrollTo(targetScroll, {
        duration: 0.9,
        easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t))
      });
    } else {
      targetZRef.current = targetIdx * SPACING_Z;
      currentZRef.current = targetIdx * SPACING_Z;
      if (cameraRef.current) {
        cameraRef.current.style.transform = `translate3d(0, 0, ${targetIdx * SPACING_Z}px)`;
      }
      setActiveIdx(targetIdx);
      setRotationDeg(-targetIdx * (360 / totalEvents));
      setCurrentZ(targetIdx * SPACING_Z);
    }

    soundEngine.playHelmClick(targetIdx);
    soundEngine.playSeaBell(targetIdx);

    if (onMilestoneSelect) {
      onMilestoneSelect(milestones[targetIdx]);
    }
  }, [totalCards, totalEvents, SPACING_Z, milestones, onMilestoneSelect]);

  const stepZoomOut = () => {
    const targetIdx = Math.max(0, activeIdx - 1);
    zoomToMilestone(targetIdx);
  };

  const stepZoomIn = () => {
    const targetIdx = Math.min(totalCards - 1, activeIdx + 1);
    zoomToMilestone(targetIdx);
  };

  const toggleSound = () => {
    const newMuted = soundEngine.toggleMute();
    setIsMuted(newMuted);
    if (!newMuted) {
      soundEngine.playSeaBell(activeIdx);
    }
  };

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
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
  }, [activeIdx, totalCards]);

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
      const approxIdx = Math.max(0, Math.min(Math.round(continuousIdx), totalCards - 1));

      if (approxIdx !== prevActiveIdxRef.current) {
        prevActiveIdxRef.current = approxIdx;
        setActiveIdx(approxIdx);
        soundEngine.playHelmClick(approxIdx);
        soundEngine.playSeaBell(approxIdx);
      }

      setRotationDeg(-continuousIdx * (360 / totalEvents));
      setCurrentZ(Math.round(newZ));

      // Synchronize Lenis scroll
      if (lenisRef.current && lenisRef.current.limit > 0) {
        const syncScroll = (newZ / maxCameraZ) * lenisRef.current.limit;
        lenisRef.current.scrollTo(syncScroll, { immediate: true });
      }

      lastPointerAngleRef.current = currentAngle;

      // If user pauses dragging in between for >300ms, snap smoothly
      if (dragSnapTimerRef.current) clearTimeout(dragSnapTimerRef.current);
      dragSnapTimerRef.current = window.setTimeout(() => {
        snapToNearestEvent();
      }, 300);
    };

    const onPointerUp = () => {
      isDraggingHelmRef.current = false;
      setIsSteering(false);
      if (dragSnapTimerRef.current) clearTimeout(dragSnapTimerRef.current);
      window.removeEventListener('pointermove', onPointerMove);
      window.removeEventListener('pointerup', onPointerUp);
      window.removeEventListener('pointercancel', onPointerUp);

      // When stopping steering wheel drag, automatically snap to nearest event card!
      snapToNearestEvent();
    };

    window.addEventListener('pointermove', onPointerMove, { passive: false });
    window.addEventListener('pointerup', onPointerUp);
    window.addEventListener('pointercancel', onPointerUp);
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
      id="timeline"
      ref={containerRef}
      className={`z-axis-interactive-viewport ${className}`}
      aria-label="LitFest 2.0 3D Z-Axis Event Timeline"
    >
      {/* 3D Oceanic Starfield / Water Tunnel */}
      <div className="z-ocean-starfield" aria-hidden="true">
        <div className="z-tunnel-ring ring-1" style={{ transform: `translateZ(${-(currentZ * 0.4) % 1800}px)` }} />
        <div className="z-tunnel-ring ring-2" style={{ transform: `translateZ(${-(currentZ * 0.7) % 2400}px)` }} />
        <div className="z-tunnel-ring ring-3" style={{ transform: `translateZ(${-(currentZ * 1.0) % 3000}px)` }} />
      </div>

      {/* 3D WORLD STAGE: perspective container */}
      <div className="z-world-perspective-stage">
        {/* CAMERA RIG: Translates along Z-axis */}
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
              // Fade out smoothly as camera zooms inside, before reaching navbar height
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
                      <span>EVENT {milestone.eventNumber || milestone.spokeNumber}</span>
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
                        <MapPin size={12} /> LOCATION DECK
                      </span>
                      <strong className="meta-tile-value">{milestone.venue}</strong>
                    </div>
                  </div>

                  <div className="card-captains-log">
                    <div className="log-feather-icon">📜 Captain's Logbook Placeholder:</div>
                    <p className="log-text">"{milestone.captainLog}"</p>
                  </div>

                  <div className="card-highlights-box">
                    <div className="highlights-header">
                      <Sparkles size={13} />
                      <span>Highlights Placeholder:</span>
                    </div>
                    <p className="highlights-desc">{milestone.highlights}</p>
                  </div>

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

      {/* HEADS-UP DISPLAY (HUD) */}
      <div className="z-axis-hud-overlay">
        {/* Bottom Left: The 14-Event Pirate Ship Steering Wheel
            Turnable by mouse drag or scroll, with selected spoke fixed at 12 o'clock! */}
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
                  soundEngine.playSeaBell(activeIdx + 1);
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

        {/* Bottom Center: Minimal Event Progress Bar */}
        <div className="z-minimal-progress-dock" aria-label="Event Timeline Progress">
          <div className="minimal-progress-meta">
            <span className="meta-event-badge">EVENT {activeIdx + 1} OF {totalCards}</span>
            <span className="meta-event-title">{selectedMilestone.title}</span>
            <span className="meta-event-pct">{Math.round((activeIdx / (totalCards - 1)) * 100)}%</span>
          </div>

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

        {/* Bottom Right: Floating Zoom In / Zoom Out Controls */}
        <div className="z-hud-zoom-controls">
          <button
            type="button"
            className="zoom-action-btn interactive"
            onClick={stepZoomIn}
            disabled={activeIdx === totalCards - 1}
            title="Next Event (Zoom In / Scroll Down)"
            aria-label="Next event"
          >
            <ZoomIn size={18} />
            <span>ENTER</span>
          </button>

          <button
            type="button"
            className="zoom-action-btn interactive"
            onClick={stepZoomOut}
            disabled={activeIdx === 0}
            title="Previous Event (Zoom Out / Scroll Up)"
            aria-label="Previous event"
          >
            <ZoomOut size={18} />
            <span>EXIT</span>
          </button>
        </div>
      </div>
    </section>
  );
};

export default PirateWheelTimeline;
