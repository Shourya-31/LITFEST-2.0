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
import { OceanicTimelineBackdrop } from './components/OceanicTimelineBackdrop';
import { soundEngine } from '../../utils/soundEngine';
import { TimelineMilestone, PirateWheelTimelineProps } from '../../types/timeline';

export const PirateWheelTimeline: React.FC<PirateWheelTimelineProps> = ({
  milestones = PIRATE_WHEEL_MILESTONES,
  title = "3D Z-Axis Voyage Timeline",
  subtitle = "Scroll down to zoom into the screen — travel forward through the 14 milestone checkpoints in 3D space.",
  className = "",
  isFaqOpen = false,
  onMilestoneSelect,
  onRegisterLenis,
  onScrollProgress,
  onNavigateHome
}) => {
  const [activeIdx, setActiveIdx] = useState<number>(0);
  const [rotationDeg, setRotationDeg] = useState<number>(0);
  const [isMuted, setIsMuted] = useState<boolean>(soundEngine.getMuted());
  const [currentZ, setCurrentZ] = useState<number>(0);
  const [isSteering, setIsSteering] = useState<boolean>(false);

  // Stable refs to prevent tearing down Lenis during parent re-renders
  const onRegisterLenisRef = useRef(onRegisterLenis);
  onRegisterLenisRef.current = onRegisterLenis;
  const onScrollProgressRef = useRef(onScrollProgress);
  onScrollProgressRef.current = onScrollProgress;
  const onNavigateHomeRef = useRef(onNavigateHome);
  onNavigateHomeRef.current = onNavigateHome;
  const activeIdxRef = useRef<number>(0);
  activeIdxRef.current = activeIdx;

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
  const atMilestoneZeroSinceRef = useRef<number>(Date.now());

  const selectedMilestone = milestones[activeIdx] || milestones[0];

  // Initialize Lenis smooth scroll engine synchronized with GSAP Ticker
  useEffect(() => {
    const lenis = new Lenis({
      duration: 0.8,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      orientation: 'vertical',
      gestureOrientation: 'vertical',
      smoothWheel: true,
      wheelMultiplier: 1.25,
      touchMultiplier: 2.0,
    });
    lenisRef.current = lenis;

    if (onRegisterLenisRef.current) {
      onRegisterLenisRef.current(lenis);
    }

    // Connect Lenis animation frame to GSAP ticker for 60/120fps hardware rendering
    const tickerUpdate = (time: number) => {
      lenis.raf(time * 1000);
    };
    gsap.ticker.add(tickerUpdate);
    gsap.ticker.lagSmoothing(0);

    // Lenis scroll listener: Translates scroll progress into pure 3D Z-axis traversal
    lenis.on('scroll', (e: { progress: number; velocity: number }) => {
      if (onScrollProgressRef.current) {
        onScrollProgressRef.current(e.progress);
      }

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

        // GSAP micro-animation on active event card
        const activeCard = document.querySelector(
          `.z-milestone-checkpoint-plane[data-event-idx="${approxIdx}"] .z-checkpoint-card`
        );
        if (activeCard) {
          gsap.fromTo(
            activeCard,
            { scale: 0.96 },
            { scale: 1, duration: 0.3, ease: 'back.out(1.4)' }
          );
        }
      }

      // Selected event remains fixed at 12 o'clock top pointer
      const targetWheelRotation = -continuousIdx * (360 / totalEvents);
      setRotationDeg(targetWheelRotation);
      setCurrentZ(Math.round(zVal));

      if (approxIdx === 0 && lenis.scroll <= 25) {
        if (atMilestoneZeroSinceRef.current === 0) {
          atMilestoneZeroSinceRef.current = Date.now();
        }
      } else {
        atMilestoneZeroSinceRef.current = 0;
      }
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
          if (Math.abs(lenis.scroll - snapScroll) > 8) {
            lenis.scrollTo(snapScroll, {
              duration: 0.45,
              easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
            });
          }
        }
      }, 150);
    });

    // Upward scroll at Milestone 0 smoothly surfaces back to Home
    const handleHomeAscendWheel = (e: WheelEvent) => {
      if (isFaqOpen) return;
      if (document.querySelector('.ocean-modal-overlay') || document.querySelector('.faq-chamber-backdrop')) {
        return;
      }
      if (activeIdxRef.current === 0 && lenis.scroll <= 40 && e.deltaY < -15) {
        if (atMilestoneZeroSinceRef.current > 0 && Date.now() - atMilestoneZeroSinceRef.current > 150) {
          if (onNavigateHomeRef.current) {
            onNavigateHomeRef.current();
          }
        }
      }
    };
    window.addEventListener('wheel', handleHomeAscendWheel, { passive: true });

    return () => {
      gsap.ticker.remove(tickerUpdate);
      window.removeEventListener('wheel', handleHomeAscendWheel);
      lenis.destroy();
      lenisRef.current = null;
      if (scrollSnapTimerRef.current) clearTimeout(scrollSnapTimerRef.current);
      if (dragSnapTimerRef.current) clearTimeout(dragSnapTimerRef.current);
    };
  }, [totalCards, maxCameraZ, SPACING_Z, totalEvents, isFaqOpen]);

  // Pause / Resume Lenis when FAQ chamber modal opens
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
    const limit = (lenisRef.current && lenisRef.current.limit > 0)
      ? lenisRef.current.limit
      : (document.documentElement.scrollHeight - window.innerHeight);

    if (lenisRef.current && limit > 0) {
      const targetScroll = (targetIdx / (totalCards - 1)) * limit;
      lenisRef.current.scrollTo(targetScroll, {
        duration: 0.55,
        easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t))
      });
    } else {
      const newZ = targetIdx * SPACING_Z;
      targetZRef.current = newZ;
      currentZRef.current = newZ;
      if (cameraRef.current) {
        cameraRef.current.style.transform = `translate3d(0, 0, ${newZ}px)`;
      }
      if (targetIdx !== prevActiveIdxRef.current) {
        prevActiveIdxRef.current = targetIdx;
        setActiveIdx(targetIdx);
        soundEngine.playWaterTransition(targetIdx);
      }
      setRotationDeg(-targetIdx * (360 / totalEvents));
      setCurrentZ(newZ);
    }

    if (onMilestoneSelect) {
      onMilestoneSelect(milestones[targetIdx]);
    }
  }, [totalCards, totalEvents, SPACING_Z, milestones, onMilestoneSelect]);

  const stepZoomOut = useCallback(() => {
    const current = activeIdxRef.current;
    if (current > 0) {
      zoomToMilestone(current - 1);
    } else if (onNavigateHomeRef.current) {
      onNavigateHomeRef.current();
    }
  }, [zoomToMilestone]);

  const stepZoomIn = useCallback(() => {
    const current = activeIdxRef.current;
    if (current < totalCards - 1) {
      zoomToMilestone(current + 1);
    }
  }, [totalCards, zoomToMilestone]);

  const toggleSound = () => {
    const newMuted = soundEngine.toggleMute();
    setIsMuted(newMuted);
    if (!newMuted) {
      soundEngine.playWaterBell(activeIdx);
    }
  };

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (isFaqOpen) return;
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
  }, [isFaqOpen, stepZoomIn, stepZoomOut]);

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

      if (lenisRef.current && lenisRef.current.limit > 0) {
        const syncScroll = (newZ / maxCameraZ) * lenisRef.current.limit;
        lenisRef.current.scrollTo(syncScroll, { immediate: true });
      }

      lastPointerAngleRef.current = currentAngle;

      if (dragSnapTimerRef.current) clearTimeout(dragSnapTimerRef.current);
      dragSnapTimerRef.current = window.setTimeout(() => {
        const nearestIdx = Math.max(0, Math.min(Math.round(currentZRef.current / SPACING_Z), totalCards - 1));
        zoomToMilestone(nearestIdx);
      }, 140);
    };

    const onPointerUp = () => {
      isDraggingHelmRef.current = false;
      setIsSteering(false);
      window.removeEventListener('pointermove', onPointerMove);
      window.removeEventListener('pointerup', onPointerUp);

      const nearestIdx = Math.max(0, Math.min(Math.round(currentZRef.current / SPACING_Z), totalCards - 1));
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
      aria-label="Interactive 3D Z-Axis Timeline Traversal"
    >
      {/* 1. Living Oceanic Voyage Backdrop: Animated creatures, swaying kelp, corals, shipwreck, and parallax seabed */}
      <OceanicTimelineBackdrop
        currentZ={currentZ}
        maxCameraZ={maxCameraZ}
        activeIdx={activeIdx}
      />

      {/* Subtle 3D Navigational Rings */}
      <div className="z-ocean-starfield" aria-hidden="true">
        <div className="z-tunnel-ring ring-1" style={{ transform: `translateZ(${-(currentZ * 0.4) % 1800}px)` }} />
        <div className="z-tunnel-ring ring-2" style={{ transform: `translateZ(${-(currentZ * 0.7) % 2400}px)` }} />
        <div className="z-tunnel-ring ring-3" style={{ transform: `translateZ(${-(currentZ * 1.0) % 3000}px)` }} />
      </div>

      {/* 2. 3D Perspective Stage & Moving Camera Rig */}
      <div className="z-world-perspective-stage">
        <div ref={cameraRef} className="z-world-camera">
          {milestones.map((m, idx) => {
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
                key={`milestone-plane-${m.id}`}
                className={`z-milestone-checkpoint-plane ${isInFocus ? 'is-active-checkpoint' : ''}`}
                data-event-idx={idx}
                style={{
                  transform: `translate3d(0, 0, ${milestoneWorldZ}px)`,
                  opacity,
                  filter: `blur(${blurPx.toFixed(1)}px)`,
                  pointerEvents: isInFocus ? 'auto' : 'none'
                }}
                onClick={() => zoomToMilestone(idx)}
              >
                <article
                  className="voyage-card-inner z-checkpoint-card interactive"
                  onClick={() => handleEventClick(idx)}
                >
                  <div className="card-header-row">
                    <div className="card-spoke-crest">
                      <Anchor size={14} className="crest-anchor" />
                      <span>EVENT {m.eventNumber || idx + 1}</span>
                      <strong className="crest-roman">[{m.romanNumeral}]</strong>
                    </div>
                    <span className="card-z-depth-pill">
                      EVENT {idx + 1} OF {totalCards}
                    </span>
                  </div>

                  <h3 className="card-milestone-title">{m.title}</h3>
                  <div className="card-theme-tag">
                    <Compass size={13} />
                    <span>{m.nauticalTheme}</span>
                  </div>

                  <div className="card-voyage-meta">
                    <div className="meta-tile">
                      <span className="meta-tile-label">
                        <Calendar size={12} /> DATE
                      </span>
                      <strong className="meta-tile-value">{m.date}</strong>
                    </div>

                    <div className="meta-tile">
                      <span className="meta-tile-label">
                        <Clock size={12} /> TIME
                      </span>
                      <strong className="meta-tile-value">{m.time}</strong>
                    </div>

                    <div className="meta-tile meta-tile-full">
                      <span className="meta-tile-label">
                        <MapPin size={12} /> LOCATION DECK
                      </span>
                      <strong className="meta-tile-value">{m.venue}</strong>
                    </div>
                  </div>

                  <div className="card-captains-log">
                    <div className="log-feather-icon">📜 Captain's Logbook Dispatch:</div>
                    <p className="log-text">"{m.captainLog}"</p>
                  </div>

                  <div className="card-highlights-box">
                    <div className="highlights-header">
                      <Sparkles size={13} />
                      <span>Highlights:</span>
                    </div>
                    <p className="highlights-desc">{m.highlights}</p>
                  </div>

                  <div className="card-footer-row">
                    <div className="card-bounty-badge">
                      <Award size={15} />
                      <span>{m.bountyOrPrize}</span>
                    </div>
                    <button
                      type="button"
                      className="card-explore-btn interactive"
                      onClick={(e) => {
                        e.stopPropagation();
                        zoomToMilestone(idx);
                        if (onMilestoneSelect) onMilestoneSelect(m);
                      }}
                      title={`Inspect details for ${m.title}`}
                      aria-label={`Explore details for Event ${m.eventNumber || idx + 1}: ${m.title}`}
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
              onCenterClick={() => {
                if (!hasDraggedRef.current) {
                  soundEngine.playWaterBell(activeIdx);
                }
              }}
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
              title={activeIdx === 0 ? "Return to Ocean Surface" : "Reverse Helm (Port / Previous Event)"}
              aria-label={activeIdx === 0 ? "Return to Home" : "Previous Event"}
            >
              <ChevronLeft size={16} />
              <span>{activeIdx === 0 ? 'SURFACE' : 'PORT'}</span>
            </button>

            <button
              type="button"
              className={`dock-ctrl-btn sound-btn interactive ${isMuted ? 'muted' : ''}`}
              onClick={toggleSound}
              title={isMuted ? "Unmute Audio" : "Mute Audio"}
              aria-label={isMuted ? "Unmute audio" : "Mute audio"}
            >
              {isMuted ? <VolumeX size={16} /> : <Volume2 size={16} />}
            </button>

            <button
              type="button"
              className="dock-ctrl-btn interactive"
              onClick={stepZoomIn}
              disabled={activeIdx === totalCards - 1}
              title="Advance Helm (Starboard / Next Event)"
              aria-label="Next Event"
            >
              <span>STBD</span>
              <ChevronRight size={16} />
            </button>
          </div>
        </div>

        {/* BOTTOM CENTER: Minimal Event Progress Bar */}
        <div className="z-minimal-progress-dock" aria-label="Event Timeline Progress">
          <div className="minimal-progress-meta">
            <span className="meta-event-badge">EVENT {selectedMilestone.romanNumeral}</span>
            <span className="meta-event-title">{selectedMilestone.title}</span>
            <span className="meta-event-pct">{Math.round((activeIdx / (totalCards - 1)) * 100)}%</span>
          </div>

          <div
            className="minimal-progress-track interactive"
            onClick={handleProgressBarClick}
            title="Click progress track to travel directly"
            role="progressbar"
            aria-valuenow={activeIdx + 1}
            aria-valuemin={1}
            aria-valuemax={totalCards}
          >
            <div
              className="minimal-progress-fill"
              style={{
                width: `${Math.max(3, (currentZ / maxCameraZ) * 100)}%`
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
            aria-label="Next Event"
          >
            <ZoomIn size={15} />
            <span>ZOOM IN</span>
          </button>

          <button
            type="button"
            className="zoom-action-btn interactive"
            onClick={stepZoomOut}
            title={activeIdx === 0 ? "Return to Surface" : "Zoom Out Reverse (Previous Milestone)"}
            aria-label={activeIdx === 0 ? "Return to Home" : "Previous Event"}
          >
            <ZoomOut size={15} />
            <span>{activeIdx === 0 ? 'SURFACE' : 'ZOOM OUT'}</span>
          </button>
        </div>
      </div>
    </section>
  );
};

export default PirateWheelTimeline;
