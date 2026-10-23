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
  timelineProgress,
  isTimelineActive = true,
  onNavigateToIndex,
  onSnapToIndex,
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

  // If controlled externally by timelineProgress from App
  useEffect(() => {
    if (timelineProgress === undefined) return;
    if (isDraggingHelmRef.current) return;

    const zVal = timelineProgress * maxCameraZ;
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
      soundEngine.playWaterTransition(approxIdx);

      // GSAP micro-animation on active event card
      const activeCard = document.querySelector(`.z-milestone-checkpoint-plane[data-event-idx="${approxIdx}"] .z-checkpoint-card`);
      if (activeCard) {
        gsap.fromTo(
          activeCard,
          { scale: 0.97 },
          { scale: 1, duration: 0.28, ease: 'power2.out' }
        );
      }
    }

    const targetWheelRotation = -continuousIdx * (360 / totalEvents);
    setRotationDeg(targetWheelRotation);
    setCurrentZ(Math.round(zVal));
  }, [timelineProgress, maxCameraZ, SPACING_Z, totalCards, totalEvents]);

  // Standalone Lenis fallback only when timelineProgress is NOT provided
  useEffect(() => {
    if (timelineProgress !== undefined) return;

    const lenis = new Lenis({
      duration: 0.7,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      orientation: 'vertical',
      gestureOrientation: 'vertical',
      smoothWheel: true,
      wheelMultiplier: 1.35,
      touchMultiplier: 2.0,
    });
    lenisRef.current = lenis;

    const tickerUpdate = (time: number) => {
      lenis.raf(time * 1000);
    };
    gsap.ticker.add(tickerUpdate);
    gsap.ticker.lagSmoothing(0);

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
        soundEngine.playWaterTransition(approxIdx);

        const activeCard = document.querySelector(`.z-milestone-checkpoint-plane[data-event-idx="${approxIdx}"] .z-checkpoint-card`);
        if (activeCard) {
          gsap.fromTo(
            activeCard,
            { scale: 0.97 },
            { scale: 1, duration: 0.28, ease: 'power2.out' }
          );
        }
      }

      const targetWheelRotation = -continuousIdx * (360 / totalEvents);
      setRotationDeg(targetWheelRotation);
      setCurrentZ(Math.round(zVal));
    });

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
            duration: 0.5,
            easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t))
          });
        }
      }, 120);
    });

    return () => {
      gsap.ticker.remove(tickerUpdate);
      lenis.destroy();
      lenisRef.current = null;
      if (scrollSnapTimerRef.current) clearTimeout(scrollSnapTimerRef.current);
      if (dragSnapTimerRef.current) clearTimeout(dragSnapTimerRef.current);
    };
  }, [timelineProgress, totalCards, maxCameraZ, SPACING_Z, totalEvents]);

  // Pause / Resume Lenis when FAQ chamber modal opens (standalone mode)
  useEffect(() => {
    if (!lenisRef.current) return;
    if (isFaqOpen) {
      lenisRef.current.stop();
    } else {
      lenisRef.current.start();
    }
  }, [isFaqOpen]);

  // Navigate directly to a specific event milestone
  const zoomToMilestone = useCallback((idx: number) => {
    const targetIdx = Math.max(0, Math.min(idx, totalCards - 1));

    if (onNavigateToIndex) {
      onNavigateToIndex(targetIdx);
    } else if (lenisRef.current && lenisRef.current.limit > 0) {
      const targetScroll = (targetIdx / (totalCards - 1)) * lenisRef.current.limit;
      lenisRef.current.scrollTo(targetScroll, {
        duration: 0.55,
        easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t))
      });
    } else {
      targetZRef.current = targetIdx * SPACING_Z;
      currentZRef.current = targetIdx * SPACING_Z;
      if (cameraRef.current) {
        cameraRef.current.style.transform = `translate3d(0, 0, ${targetIdx * SPACING_Z}px)`;
      }
      if (targetIdx !== prevActiveIdxRef.current) {
        prevActiveIdxRef.current = targetIdx;
        setActiveIdx(targetIdx);
        soundEngine.playWaterTransition(targetIdx);
      }
      setRotationDeg(-targetIdx * (360 / totalEvents));
      setCurrentZ(targetIdx * SPACING_Z);
    }

    if (onMilestoneSelect) {
      onMilestoneSelect(milestones[targetIdx]);
    }
  }, [totalCards, totalEvents, SPACING_Z, milestones, onNavigateToIndex, onMilestoneSelect]);

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
      soundEngine.playWaterDrop(activeIdx);
    }
  };

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (isFaqOpen || !isTimelineActive) return;
      if (e.key === 'ArrowDown' || e.key === 'PageDown') {
        e.preventDefault();
        stepZoomIn();
      } else if (e.key === 'ArrowUp' || e.key === 'PageUp') {
        e.preventDefault();
        stepZoomOut();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [activeIdx, totalCards, isFaqOpen, isTimelineActive]);

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

      if (deltaAngle > 180) deltaAngle -= 360;
      if (deltaAngle < -180) deltaAngle += 360;

      totalDragAngleRef.current += Math.abs(deltaAngle);
      if (totalDragAngleRef.current > 2.5) {
        hasDraggedRef.current = true;
      }

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
        soundEngine.playWaterTransition(approxIdx);
      }

      setRotationDeg(-continuousIdx * (360 / totalEvents));
      setCurrentZ(Math.round(newZ));

      lastPointerAngleRef.current = currentAngle;
    };

    const onPointerUp = () => {
      isDraggingHelmRef.current = false;
      setIsSteering(false);
      window.removeEventListener('pointermove', onPointerMove);
      window.removeEventListener('pointerup', onPointerUp);
      window.removeEventListener('pointercancel', onPointerUp);

      // Snap to nearest milestone
      const nearestIdx = Math.max(0, Math.min(Math.round(currentZRef.current / SPACING_Z), totalCards - 1));
      if (onSnapToIndex) {
        onSnapToIndex(nearestIdx);
      } else {
        zoomToMilestone(nearestIdx);
      }
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
      ref={containerRef}
      className={`z-axis-interactive-viewport ${className}`}
      aria-label="Interactive 3D Z-Axis Timeline Traversal"
    >
      {/* 1. Background Oceanic Atmosphere & Tunnel Concentric Rings */}
      <div className="z-ocean-starfield" aria-hidden="true">
        <div className="z-tunnel-ring ring-1" />
        <div className="z-tunnel-ring ring-2" />
        <div className="z-tunnel-ring ring-3" />
      </div>

      {/* 2. 3D Perspective Stage & Moving Camera Rig */}
      <div className="z-world-perspective-stage">
        <div ref={cameraRef} className="z-world-camera">
          {milestones.map((m, idx) => {
            const zPlane = -idx * SPACING_Z;
            const isActive = activeIdx === idx;
            const distFromCamera = Math.abs(currentZ - idx * SPACING_Z);

            let planeOpacity = 1;
            let blurAmount = 0;
            if (distFromCamera > SPACING_Z * 2.2) {
              planeOpacity = Math.max(0, 1 - (distFromCamera - SPACING_Z * 2.2) / (SPACING_Z * 1.5));
              blurAmount = Math.min(8, (distFromCamera - SPACING_Z * 2.2) * 0.005);
            }

            return (
              <div
                key={`milestone-plane-${m.id}`}
                className={`z-milestone-checkpoint-plane ${isActive ? 'is-active-checkpoint' : ''}`}
                data-event-idx={idx}
                style={{
                  transform: `translate3d(0, 0, ${zPlane}px)`,
                  opacity: planeOpacity,
                  filter: blurAmount > 0 ? `blur(${blurAmount}px)` : 'none',
                  pointerEvents: isActive ? 'auto' : 'none'
                }}
              >
                <article
                  className="z-checkpoint-card"
                  onClick={() => handleEventClick(idx)}
                >
                  <div className="card-header-row">
                    <div className="card-spoke-crest">
                      <Anchor size={14} className="crest-anchor" />
                      <span className="crest-roman">EVENT {m.romanNumeral}</span>
                    </div>
                    <div className="card-z-depth-pill">
                      <span>CHKP #{m.eventNumber}</span>
                    </div>
                  </div>

                  <h3 className="card-milestone-title">{m.title}</h3>
                  <div className="card-theme-tag">
                    <Sparkles size={13} />
                    <span>{m.nauticalTheme}</span>
                  </div>

                  <div className="card-voyage-meta">
                    <div className="meta-tile">
                      <span className="meta-tile-label">
                        <Calendar size={11} /> DATE
                      </span>
                      <span className="meta-tile-value">{m.date}</span>
                    </div>

                    <div className="meta-tile">
                      <span className="meta-tile-label">
                        <Clock size={11} /> TIME
                      </span>
                      <span className="meta-tile-value">{m.time}</span>
                    </div>

                    <div className="meta-tile meta-tile-full">
                      <span className="meta-tile-label">
                        <MapPin size={11} /> ANCHORAGE VENUE
                      </span>
                      <span className="meta-tile-value">{m.venue}</span>
                    </div>
                  </div>

                  <div className="card-captains-log">
                    <div className="log-feather-icon">LOGBOOK DISPATCH</div>
                    <p className="log-text">"{m.captainLog}"</p>
                  </div>

                  <div className="card-highlights-box">
                    <div className="highlights-header">
                      <Award size={13} />
                      <span>HIGHLIGHT ARENAS</span>
                    </div>
                    <p className="highlights-desc">{m.highlights}</p>
                  </div>

                  <div className="card-footer-row">
                    <div className="card-bounty-badge">
                      <span>BOUNTY: {m.bountyOrPrize}</span>
                    </div>
                    <button
                      type="button"
                      className="card-explore-btn interactive"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleEventClick(idx);
                      }}
                      title={`Inspect details for ${m.title}`}
                    >
                      <span>Explore Event</span>
                      <span className="explore-arrow">→</span>
                    </button>
                  </div>
                </article>
              </div>
            );
          })}
        </div>
      </div>

      {/* 3. Heads-Up Display (HUD) Controls */}
      <div className="z-axis-hud-overlay">
        {/* BOTTOM LEFT: Floating Ship Helm */}
        <div className={`z-hud-helm-dock ${isSteering ? 'is-steering' : ''}`}>
          <div className="helm-dock-header">
            <span>HELM • LITFEST ODYSSEY</span>
            <span className="dock-sub">EVENT #{activeIdx + 1} OF 14</span>
          </div>

          <div
            ref={wheelWrapRef}
            className={`helm-dock-wheel-wrap interactive ${isSteering ? 'is-steering' : ''}`}
            onPointerDown={handleHelmPointerDown}
            title="Drag the ship's wheel with your mouse or scroll vertically to navigate"
          >
            <PirateWheelSvg
              milestones={milestones}
              activeIdx={activeIdx}
              rotationDeg={rotationDeg}
              onEventClick={handleEventClick}
              onSpokeClick={handleEventClick}
              onCenterClick={() => zoomToMilestone(0)}
            />
          </div>

          <div className="helm-drag-hint">
            <Compass size={13} className="hint-compass-icon" />
            <span>Turn Helm or Scroll to Traversal Depth</span>
          </div>

          <div className="helm-dock-controls">
            <button
              type="button"
              className="dock-ctrl-btn interactive"
              onClick={stepZoomOut}
              disabled={activeIdx === 0}
              title="Reverse Helm (Port / Previous Event)"
            >
              <ChevronLeft size={16} />
              <span>PORT</span>
            </button>

            <button
              type="button"
              className="dock-ctrl-btn sound-btn interactive"
              onClick={toggleSound}
              title={isMuted ? "Unmute Audio" : "Mute Audio"}
            >
              {isMuted ? <VolumeX size={16} /> : <Volume2 size={16} />}
            </button>

            <button
              type="button"
              className="dock-ctrl-btn interactive"
              onClick={stepZoomIn}
              disabled={activeIdx === totalCards - 1}
              title="Advance Helm (Starboard / Next Event)"
            >
              <span>STBD</span>
              <ChevronRight size={16} />
            </button>
          </div>
        </div>

        {/* BOTTOM CENTER: Minimal Event Progress Bar */}
        <div className="z-minimal-progress-dock">
          <div className="minimal-progress-meta">
            <span className="meta-event-badge">EVENT {selectedMilestone.romanNumeral}</span>
            <span className="meta-event-title">{selectedMilestone.title}</span>
            <span className="meta-event-pct">{Math.round((activeIdx / (totalCards - 1)) * 100)}%</span>
          </div>

          <div
            className="minimal-progress-track interactive"
            onClick={handleProgressBarClick}
            title="Click progress track to travel directly"
          >
            <div
              className="minimal-progress-fill"
              style={{
                width: `${(activeIdx / (totalCards - 1)) * 100}%`
              }}
            />
            {milestones.map((_, i) => (
              <span
                key={`tick-${i}`}
                className={`minimal-progress-tick ${i <= activeIdx ? 'active' : ''}`}
                style={{ left: `${(i / (totalCards - 1)) * 100}%` }}
              />
            ))}
          </div>
        </div>

        {/* BOTTOM RIGHT: Zoom In / Zoom Out Step Buttons */}
        <div className="z-hud-zoom-controls">
          <button
            type="button"
            className="zoom-action-btn interactive"
            onClick={stepZoomIn}
            disabled={activeIdx === totalCards - 1}
            title="Zoom In Forward (Next Milestone)"
          >
            <ZoomIn size={15} />
            <span>ZOOM IN</span>
          </button>

          <button
            type="button"
            className="zoom-action-btn interactive"
            onClick={stepZoomOut}
            disabled={activeIdx === 0}
            title="Zoom Out Reverse (Previous Milestone)"
          >
            <ZoomOut size={15} />
            <span>ZOOM OUT</span>
          </button>
        </div>
      </div>
    </section>
  );
};

export default PirateWheelTimeline;
