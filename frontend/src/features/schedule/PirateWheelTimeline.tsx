import React, { useState, useEffect, useRef, useCallback } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
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
  Layers
} from 'lucide-react';
import { PIRATE_WHEEL_MILESTONES } from './timelineData';
import { PirateWheelSvg } from './PirateWheelSvg';
import { soundEngine } from '../../utils/soundEngine';
import { TimelineMilestone, PirateWheelTimelineProps } from '../../types/timeline';

// Register GSAP ScrollTrigger plugin safely
if (typeof window !== 'undefined') {
  gsap.registerPlugin(ScrollTrigger);
}

export const PirateWheelTimeline: React.FC<PirateWheelTimelineProps> = ({
  milestones = PIRATE_WHEEL_MILESTONES,
  title = "3D Z-Axis Voyage Timeline",
  subtitle = "Turn the pirate ship's 14-spoke helm to voyage along the Z-axis through the 14 milestone checkpoints.",
  className = "",
  onMilestoneSelect
}) => {
  const [activeIdx, setActiveIdx] = useState<number>(0);
  const [isMuted, setIsMuted] = useState<boolean>(soundEngine.getMuted());

  const sectionRef = useRef<HTMLElement | null>(null);
  const wheelRef = useRef<HTMLDivElement | null>(null);
  const zStageRef = useRef<HTMLDivElement | null>(null);
  const cardsRef = useRef<(HTMLDivElement | null)[]>([]);
  const timelineMasterRef = useRef<gsap.core.Timeline | null>(null);

  const totalCards = milestones.length;
  const selectedMilestone = milestones[activeIdx] || milestones[0];

  // Initialize GSAP 3D Z-Axis ScrollTrigger Animation
  useEffect(() => {
    const section = sectionRef.current;
    const wheel = wheelRef.current;
    const zStage = zStageRef.current;

    if (!section || !wheel || !zStage) return;

    const cards = cardsRef.current.filter(Boolean) as HTMLDivElement[];
    const uprightTexts = wheel.querySelectorAll('.spoke-upright-content');

    const ctx = gsap.context(() => {
      // Total duration for the master timeline corresponds to the number of intervals (totalCards - 1)
      const masterDuration = Math.max(totalCards - 1, 1);

      const timelineMaster = gsap.timeline({
        scrollTrigger: {
          trigger: section,
          pin: true,
          scrub: 1.1,
          start: "top top",
          end: () => `+=${masterDuration * 320}`,
          invalidateOnRefresh: true,
          onUpdate: (self) => {
            const progress = self.progress;
            const newIndex = Math.min(
              Math.floor(progress * totalCards),
              totalCards - 1
            );
            setActiveIdx(newIndex);
          }
        }
      });

      timelineMasterRef.current = timelineMaster;

      // 1. ROTATE PIRATE SHIP WHEEL 360 DEGREES ON SCROLL
      timelineMaster.to(
        wheel,
        {
          rotation: 360,
          ease: "none",
          duration: masterDuration
        },
        0
      );

      // 2. COUNTER-ROTATE SPOKE TEXT BY -360 DEGREES TO KEEP NUMERALS/LABELS STRICTLY UPRIGHT
      // By animating .spoke-upright-content, the outer spoke maintains its circular position,
      // while the inner text counter-rotates seamlessly with zero glitch!
      timelineMaster.to(
        uprightTexts,
        {
          rotation: -360,
          ease: "none",
          duration: masterDuration
        },
        0
      );

      // 3. 3D Z-AXIS SCROLLING: Animate each milestone card forward through Z-space!
      // Each card i reaches focus (z=0, scale=1, opacity=1) at time t = i.
      cards.forEach((card, i) => {
        const tFocus = i;

        // Initial state before its entrance (deep in background Z)
        gsap.set(card, {
          z: i === 0 ? 0 : -1400,
          opacity: i === 0 ? 1 : 0,
          scale: i === 0 ? 1 : 0.6,
          filter: i === 0 ? "blur(0px)" : "blur(8px)",
          pointerEvents: i === 0 ? "auto" : "none"
        });

        // Entrance animation (from deep Z to focus plane z=0)
        if (i > 0) {
          const tEnterStart = Math.max(tFocus - 1.5, 0);

          // Deep background to mid-depth (z: -1400 -> -650)
          timelineMaster.fromTo(
            card,
            { z: -1400, opacity: 0, scale: 0.6, filter: "blur(8px)", pointerEvents: "none" },
            {
              z: -650,
              opacity: 0.45,
              scale: 0.85,
              filter: "blur(3px)",
              ease: "power1.in",
              duration: tFocus - 0.7 - tEnterStart,
              pointerEvents: "none"
            },
            tEnterStart
          );

          // Mid-depth into crisp foreground focus (z: -650 -> 0)
          timelineMaster.to(
            card,
            {
              z: 0,
              opacity: 1,
              scale: 1,
              filter: "blur(0px)",
              ease: "power1.out",
              duration: 0.7,
              pointerEvents: "auto"
            },
            tFocus - 0.7
          );
        }

        // Exit animation (from focus plane z=0 forward past camera z: +500)
        if (i < totalCards - 1) {
          timelineMaster.to(
            card,
            {
              z: 500,
              opacity: 0,
              scale: 1.25,
              filter: "blur(4px)",
              ease: "power1.in",
              duration: 0.75,
              pointerEvents: "none"
            },
            tFocus
          );
        }
      });
    }, section);

    return () => {
      ctx.revert();
      timelineMasterRef.current = null;
    };
  }, [totalCards]);

  // Navigate to a specific spoke / Z-depth checkpoint
  const handleSpokeClick = useCallback((idx: number) => {
    setActiveIdx(idx);

    soundEngine.playHelmClick(idx);
    soundEngine.playSeaBell(idx);

    if (onMilestoneSelect) {
      onMilestoneSelect(milestones[idx]);
    }

    if (timelineMasterRef.current && timelineMasterRef.current.scrollTrigger) {
      const st = timelineMasterRef.current.scrollTrigger;
      const targetProgress = idx / (totalCards - 1);
      const scrollPos = st.start + targetProgress * (st.end - st.start);
      window.scrollTo({
        top: scrollPos,
        behavior: 'smooth'
      });
    }
  }, [totalCards, milestones, onMilestoneSelect]);

  // Steer Port (Previous Z checkpoint)
  const steerPort = () => {
    const nextIdx = Math.max(activeIdx - 1, 0);
    handleSpokeClick(nextIdx);
  };

  // Steer Starboard (Next Z checkpoint)
  const steerStarboard = () => {
    const nextIdx = Math.min(activeIdx + 1, totalCards - 1);
    handleSpokeClick(nextIdx);
  };

  // Toggle Mute
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
      className={`pirate-timeline-section z-axis-timeline-stage ${className}`}
      ref={sectionRef}
      aria-label="LitFest 2.0 3D Z-Axis Timeline"
    >
      {/* Oceanic Ambient Light Canvas */}
      <div className="ocean-ambient-canvas" aria-hidden="true">
        <div className="ocean-wave-glow glow-1" />
        <div className="ocean-wave-glow glow-2" />
      </div>

      <div className="pirate-timeline-container z-axis-container">

        {/* LEFT COLUMN: THE PIRATE SHIP STEERING WHEEL */}
        <div className="timeline-helm-column">
          <div className="helm-header">
            <div className="nautical-eyebrow">
              <Compass className="eyebrow-icon spin-slow" size={14} />
              <span>3D Z-AXIS VOYAGE • 14 SPOKES</span>
            </div>
            <h2 className="helm-title">{title}</h2>
            <p className="helm-subtitle">{subtitle}</p>
          </div>

          {/* 14-Spoke Pirate Ship Wheel with clean upright text */}
          <div className="helm-interactive-stage">
            <PirateWheelSvg
              ref={wheelRef}
              milestones={milestones}
              activeIdx={activeIdx}
              onSpokeClick={handleSpokeClick}
              onCenterClick={() => soundEngine.playSeaBell(activeIdx + 1)}
            />
          </div>

          {/* Helmsman Controls */}
          <div className="helm-controls-bar">
            <button
              type="button"
              className="steer-btn steer-port interactive"
              onClick={steerPort}
              disabled={activeIdx === 0}
              title="Steer Port (Previous Z Depth)"
              aria-label="Previous milestone"
            >
              <ChevronLeft size={18} />
              <span>PORT</span>
            </button>

            <button
              type="button"
              className={`sound-toggle-btn interactive ${isMuted ? 'muted' : ''}`}
              onClick={toggleSound}
              title={isMuted ? "Unmute Nautical Audio" : "Mute Audio"}
              aria-label={isMuted ? "Unmute sound" : "Mute sound"}
            >
              {isMuted ? <VolumeX size={18} /> : <Volume2 size={18} />}
              <span className="sound-lbl">{isMuted ? "BELL OFF" : "BELL ON"}</span>
            </button>

            <button
              type="button"
              className="steer-btn steer-starboard interactive"
              onClick={steerStarboard}
              disabled={activeIdx === totalCards - 1}
              title="Steer Starboard (Next Z Depth)"
              aria-label="Next milestone"
            >
              <span>STARBOARD</span>
              <ChevronRight size={18} />
            </button>
          </div>

          {/* Active Spoke Telemetry & Z-Depth Indicator */}
          <div className="helm-telemetry-card">
            <div className="telemetry-badge-row">
              <span className="telemetry-spoke-badge">
                SPOKE {selectedMilestone.spokeNumber} • {selectedMilestone.romanNumeral}
              </span>
              <span className="telemetry-z-indicator">
                <Layers size={12} />
                DEPTH Z: {(activeIdx * 100).toFixed(0)}m
              </span>
              <span className="telemetry-coord">
                {selectedMilestone.coordinates}
              </span>
            </div>

            <h3 className="telemetry-title">{selectedMilestone.title}</h3>

            <div className="telemetry-meta-row">
              <span className="telemetry-meta-item">
                <Calendar size={13} />
                {selectedMilestone.date}
              </span>
              <span className="telemetry-meta-item">
                <Clock size={13} />
                {selectedMilestone.time}
              </span>
              <span className="telemetry-meta-item">
                <MapPin size={13} />
                {selectedMilestone.venue}
              </span>
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: 3D Z-AXIS TUNNEL STAGE */}
        <div className="timeline-z-stage-column" ref={zStageRef}>
          <div className="z-axis-depth-viewport">
            {/* Visual 3D Tunnel Grid Lines */}
            <div className="z-tunnel-perspective-grid" aria-hidden="true" />

            {/* 14 3D Z-Depth Milestone Cards */}
            {milestones.map((milestone, idx) => {
              const isActive = activeIdx === idx;
              return (
                <div
                  key={milestone.id}
                  ref={(el) => (cardsRef.current[idx] = el)}
                  className={`z-milestone-layer ${isActive ? 'is-in-focus' : ''}`}
                  onClick={() => handleSpokeClick(idx)}
                >
                  <article className="voyage-card-inner z-card-content interactive">
                    {/* Header */}
                    <div className="card-header-row">
                      <div className="card-spoke-crest">
                        <Anchor size={14} className="crest-anchor" />
                        <span>SPOKE {milestone.spokeNumber}</span>
                        <strong className="crest-roman">[{milestone.romanNumeral}]</strong>
                      </div>
                      <span className="card-z-depth-pill">
                        Z-CHECKPOINT {idx + 1}/14
                      </span>
                    </div>

                    {/* Milestone Placeholder Title */}
                    <h3 className="card-milestone-title">{milestone.title}</h3>

                    {/* Category & Theme Placeholders */}
                    <div className="card-theme-tag">
                      <Compass size={13} />
                      <span>{milestone.nauticalTheme}</span>
                    </div>

                    {/* Metadata Grid */}
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

                    {/* Captain's Logbook Placeholder */}
                    <div className="card-captains-log">
                      <div className="log-feather-icon">📜 Captain's Logbook:</div>
                      <p className="log-text">"{milestone.captainLog}"</p>
                    </div>

                    {/* Highlights Placeholder */}
                    <div className="card-highlights-box">
                      <div className="highlights-header">
                        <Sparkles size={13} />
                        <span>Highlights Placeholder:</span>
                      </div>
                      <p className="highlights-desc">{milestone.highlights}</p>
                    </div>

                    {/* Footer */}
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
                          handleSpokeClick(idx);
                        }}
                      >
                        Select Milestone
                      </button>
                    </div>
                  </article>
                </div>
              );
            })}
          </div>
        </div>

      </div>
    </section>
  );
};

export default PirateWheelTimeline;
