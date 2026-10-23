import React, { useState, useEffect, useRef, useCallback } from 'react';
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
  Layers,
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
  onMilestoneSelect
}) => {
  const [activeIdx, setActiveIdx] = useState<number>(0);
  const [rotationDeg, setRotationDeg] = useState<number>(0);
  const [isMuted, setIsMuted] = useState<boolean>(soundEngine.getMuted());
  const [currentZ, setCurrentZ] = useState<number>(0);

  const containerRef = useRef<HTMLDivElement | null>(null);
  const cameraRef = useRef<HTMLDivElement | null>(null);
  const animFrameRef = useRef<number | null>(null);

  // Z-spacing between milestone checkpoints in 3D world space
  const SPACING_Z = 1200;
  const totalCards = milestones.length;
  const maxCameraZ = (totalCards - 1) * SPACING_Z;

  // Target and current camera positions for smooth interpolation (lerp)
  const targetZRef = useRef<number>(0);
  const currentZRef = useRef<number>(0);
  const touchStartYRef = useRef<number>(0);
  const prevActiveIdxRef = useRef<number>(0);

  const selectedMilestone = milestones[activeIdx] || milestones[0];

  // Smooth 60fps render loop for 3D Z-axis camera movement & wheel rotation
  useEffect(() => {
    const cameraEl = cameraRef.current;
    if (!cameraEl) return;

    let isRunning = true;

    const renderLoop = () => {
      if (!isRunning) return;

      // Smooth interpolation towards target depth
      const diff = targetZRef.current - currentZRef.current;
      currentZRef.current += diff * 0.085;

      const zVal = currentZRef.current;

      // Move camera forward into the screen (+Z)
      cameraEl.style.transform = `translate3d(0, 0, ${zVal}px)`;

      // Continuous milestone index (float)
      const continuousIdx = zVal / SPACING_Z;
      const approxIdx = Math.max(0, Math.min(Math.round(continuousIdx), totalCards - 1));

      if (approxIdx !== prevActiveIdxRef.current) {
        prevActiveIdxRef.current = approxIdx;
        setActiveIdx(approxIdx);
        soundEngine.playHelmClick(approxIdx);
        soundEngine.playSeaBell(approxIdx);
      }

      // To keep the selected spoke at the SAME SINGLE PLACE (12 o'clock top pointer),
      // the wheel rotates counter-clockwise by -continuousIdx * (360 / 14).
      // Whichever spoke is active is always brought to the 12 o'clock top position!
      const targetWheelRotation = -continuousIdx * (360 / totalSpokes);
      setRotationDeg(targetWheelRotation);
      setCurrentZ(Math.round(zVal));

      animFrameRef.current = requestAnimationFrame(renderLoop);
    };

    const totalSpokes = 14;
    animFrameRef.current = requestAnimationFrame(renderLoop);

    return () => {
      isRunning = false;
      if (animFrameRef.current) {
        cancelAnimationFrame(animFrameRef.current);
      }
    };
  }, [totalCards, maxCameraZ]);

  // Handle Wheel Scroll: Scrolling down ZOOMS IN (enters inside screen), scrolling up ZOOMS OUT
  const handleWheel = useCallback((e: React.WheelEvent) => {
    e.stopPropagation();
    const zoomDelta = e.deltaY * 1.6;
    targetZRef.current = Math.max(0, Math.min(targetZRef.current + zoomDelta, maxCameraZ));
  }, [maxCameraZ]);

  // Touch navigation for mobile
  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartYRef.current = e.touches[0].clientY;
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    const currentY = e.touches[0].clientY;
    const deltaY = (touchStartYRef.current - currentY) * 2.2;
    touchStartYRef.current = currentY;
    targetZRef.current = Math.max(0, Math.min(targetZRef.current + deltaY, maxCameraZ));
  };

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowDown' || e.key === 'PageDown' || e.key === ' ') {
        e.preventDefault();
        targetZRef.current = Math.min(targetZRef.current + SPACING_Z, maxCameraZ);
      } else if (e.key === 'ArrowUp' || e.key === 'PageUp') {
        e.preventDefault();
        targetZRef.current = Math.max(targetZRef.current - SPACING_Z, 0);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [maxCameraZ]);

  // Navigate directly to a specific milestone spoke
  const zoomToMilestone = useCallback((idx: number) => {
    targetZRef.current = idx * SPACING_Z;
    soundEngine.playHelmClick(idx);
    soundEngine.playSeaBell(idx);

    if (onMilestoneSelect) {
      onMilestoneSelect(milestones[idx]);
    }
  }, [milestones, onMilestoneSelect]);

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

  return (
    <section
      id="timeline"
      ref={containerRef}
      className={`z-axis-interactive-viewport ${className}`}
      onWheel={handleWheel}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      aria-label="LitFest 2.0 3D Z-Axis Zoom Timeline"
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

            const isVisible = relDist > -3600 && relDist < 900;
            if (!isVisible) return null;

            let opacity = 1;
            let blurPx = 0;
            if (relDist < 0) {
              opacity = Math.max(0, Math.min(1, 1 - Math.abs(relDist) / 2200));
              blurPx = Math.min(6, Math.abs(relDist) / 400);
            } else {
              opacity = Math.max(0, Math.min(1, 1 - relDist / 500));
              blurPx = Math.min(8, relDist / 80);
            }

            const isInFocus = activeIdx === idx;

            return (
              <div
                key={milestone.id}
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
                      <span>SPOKE {milestone.spokeNumber}</span>
                      <strong className="crest-roman">[{milestone.romanNumeral}]</strong>
                    </div>
                    <span className="card-z-depth-pill">
                      CHECKPOINT {idx + 1} OF 14
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
                      className="card-chart-btn"
                      onClick={(e) => {
                        e.stopPropagation();
                        zoomToMilestone(idx);
                      }}
                    >
                      Select Checkpoint
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
        {/* Top Floating HUD Bar (Reset & Jump to FAQ removed as requested) */}
        <div className="z-hud-top-bar">
          <div className="z-depth-gauge">
            <Layers size={15} className="depth-icon" />
            <span className="gauge-label">Z-AXIS DEPTH:</span>
            <strong className="gauge-value">{currentZ}m</strong>
            <span className="gauge-checkpoint-tag">
              [CHECKPOINT {activeIdx + 1} / 14]
            </span>
          </div>

          <div className="z-hud-instructions">
            <span className="hud-scroll-hint">
              ▼ SCROLL DOWN TO ENTER INSIDE SCREEN • SCROLL UP TO ZOOM OUT ▲
            </span>
          </div>
        </div>

        {/* Bottom Left: The 14-Spoke Pirate Ship Steering Wheel
            Selected spoke remains at the exact same 12 o'clock top pointer position at all times! */}
        <div className="z-hud-helm-dock">
          <div className="helm-dock-header">
            <span className="dock-title">PIRATE SHIP HELM</span>
            <span className="dock-sub">SPOKE {activeIdx + 1} AT TOP</span>
          </div>

          <div className="helm-dock-wheel-wrap">
            <PirateWheelSvg
              milestones={milestones}
              activeIdx={activeIdx}
              rotationDeg={rotationDeg}
              onSpokeClick={zoomToMilestone}
              onCenterClick={() => soundEngine.playSeaBell(activeIdx + 1)}
            />
          </div>

          {/* Steer Port / Sound / Starboard Buttons */}
          <div className="helm-dock-controls">
            <button
              type="button"
              className="dock-ctrl-btn interactive"
              onClick={stepZoomOut}
              disabled={activeIdx === 0}
              title="Zoom Out (Previous Milestone)"
              aria-label="Previous milestone"
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
              title="Zoom In (Next Milestone)"
              aria-label="Next milestone"
            >
              <span>STBD</span>
              <ChevronRight size={16} />
            </button>
          </div>
        </div>

        {/* Bottom Right: Floating Zoom In / Zoom Out Controls */}
        <div className="z-hud-zoom-controls">
          <button
            type="button"
            className="zoom-action-btn interactive"
            onClick={stepZoomIn}
            disabled={activeIdx === totalCards - 1}
            title="Zoom In Into Screen (Scroll Down)"
            aria-label="Zoom in"
          >
            <ZoomIn size={18} />
            <span>ENTER</span>
          </button>

          <button
            type="button"
            className="zoom-action-btn interactive"
            onClick={stepZoomOut}
            disabled={activeIdx === 0}
            title="Zoom Out Out of Screen (Scroll Up)"
            aria-label="Zoom out"
          >
            <ZoomOut size={18} />
            <span>EXIT</span>
          </button>
        </div>

        {/* Bottom Center: Voyage Horizon Status Bar */}
        <div className="z-hud-bottom-bar">
          <div className="voyage-status-indicator">
            <span className="status-chapter-badge">
              CHECKPOINT {selectedMilestone.spokeNumber} [{selectedMilestone.romanNumeral}]
            </span>
            <span className="status-milestone-title">
              {selectedMilestone.title}
            </span>
          </div>

          <div className="z-checkpoint-dots" aria-label="Milestone Checkpoints">
            {milestones.map((m, idx) => (
              <button
                key={m.id}
                type="button"
                className={`checkpoint-dot interactive ${activeIdx === idx ? 'active' : ''}`}
                onClick={() => zoomToMilestone(idx)}
                title={`Zoom to Spoke ${idx + 1}: ${m.romanNumeral}`}
                aria-label={`Go to checkpoint ${idx + 1}`}
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default PirateWheelTimeline;
