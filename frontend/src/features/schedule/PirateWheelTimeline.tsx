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
  Navigation2
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
  title = "The High-Seas Timeline",
  subtitle = "Turn the pirate ship's 14-spoke helm to chart the literary voyage of LitFest 2.0 at NIT Raipur.",
  className = "",
  onMilestoneSelect
}) => {
  const [activeIdx, setActiveIdx] = useState<number>(0);
  const [rotationDeg, setRotationDeg] = useState<number>(0);
  const [isMuted, setIsMuted] = useState<boolean>(soundEngine.getMuted());

  const sectionRef = useRef<HTMLElement | null>(null);
  const trackRef = useRef<HTMLDivElement | null>(null);
  const wheelRef = useRef<HTMLDivElement | null>(null);
  const timelineMasterRef = useRef<gsap.core.Timeline | null>(null);

  const selectedMilestone = milestones[activeIdx] || milestones[0];

  // Initialize GSAP pinned horizontal scroll trigger
  useEffect(() => {
    const section = sectionRef.current;
    const track = trackRef.current;
    const wheel = wheelRef.current;

    if (!section || !track || !wheel) return;

    // Check if on small mobile screen (graceful fallback)
    const isMobile = window.innerWidth < 1024;
    if (isMobile) {
      // Mobile adaptation: let user scroll cards or click spokes without full screen pinning
      return;
    }

    const cards = track.querySelectorAll('.timeline-voyage-card');
    const nodes = wheel.querySelectorAll('.helm-spoke-node');

    const ctx = gsap.context(() => {
      const getScrollAmount = () => {
        const trackWidth = track.scrollWidth;
        const containerWidth = track.parentElement ? track.parentElement.offsetWidth : window.innerWidth;
        return -(trackWidth - containerWidth + 120);
      };

      const timelineMaster = gsap.timeline({
        scrollTrigger: {
          trigger: section,
          pin: true,
          scrub: 1.2,
          start: "top top",
          end: () => `+=${Math.max(track.scrollWidth, 3200)}`,
          invalidateOnRefresh: true,
          onUpdate: (self) => {
            const progress = self.progress;
            const newIndex = Math.min(
              Math.floor(progress * milestones.length),
              milestones.length - 1
            );
            setActiveIdx(newIndex);
            setRotationDeg(progress * 360);
          }
        }
      });

      timelineMasterRef.current = timelineMaster;

      // 1. Rotate the Pirate Ship Wheel on the left continuously as we scroll
      timelineMaster.to(
        wheel,
        {
          rotation: 360,
          ease: "none"
        },
        0
      );

      // 2. COUNTER-ROTATE each node so Roman numerals & numbers stay strictly upright
      timelineMaster.to(
        nodes,
        {
          rotation: -360,
          ease: "none"
        },
        0
      );

      // 3. Translate the horizontal timeline voyage track on the right
      timelineMaster.to(
        track,
        {
          x: getScrollAmount,
          ease: "none"
        },
        0
      );

      // 4. Subtle entrance reveal for each milestone card as it crosses view
      cards.forEach((card) => {
        const inner = card.querySelector('.voyage-card-inner');
        if (inner) {
          gsap.fromTo(
            inner,
            { opacity: 0.35, y: 30, scale: 0.95 },
            {
              opacity: 1,
              y: 0,
              scale: 1,
              duration: 1,
              ease: "power2.out",
              scrollTrigger: {
                trigger: card,
                containerAnimation: timelineMaster,
                start: "left 85%",
                end: "left 45%",
                scrub: true
              }
            }
          );
        }
      });
    }, section);

    return () => {
      ctx.revert();
      timelineMasterRef.current = null;
    };
  }, [milestones]);

  // Handle clicking a specific spoke or navigation button
  const handleSpokeClick = useCallback((idx: number) => {
    setActiveIdx(idx);
    const targetDeg = (idx / milestones.length) * 360;
    setRotationDeg(targetDeg);

    // Audio feedback
    soundEngine.playHelmClick(idx);
    soundEngine.playSeaBell(idx);

    if (onMilestoneSelect) {
      onMilestoneSelect(milestones[idx]);
    }

    // If GSAP pinned scroll is active, smoothly animate scroll progress to that milestone
    if (timelineMasterRef.current && timelineMasterRef.current.scrollTrigger) {
      const st = timelineMasterRef.current.scrollTrigger;
      const targetProgress = idx / (milestones.length - 1);
      const scrollPos = st.start + targetProgress * (st.end - st.start);
      window.scrollTo({
        top: scrollPos,
        behavior: 'smooth'
      });
    } else {
      // In mobile or fallback mode, scroll track horizontally
      if (trackRef.current) {
        const targetCard = trackRef.current.children[idx] as HTMLElement;
        if (targetCard) {
          targetCard.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
        }
      }
    }
  }, [milestones, onMilestoneSelect]);

  // Steer Port (Previous)
  const steerPort = () => {
    const nextIdx = (activeIdx - 1 + milestones.length) % milestones.length;
    handleSpokeClick(nextIdx);
  };

  // Steer Starboard (Next)
  const steerStarboard = () => {
    const nextIdx = (activeIdx + 1) % milestones.length;
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

  // Center hub click
  const handleCenterClick = () => {
    soundEngine.playSeaBell(activeIdx + 2);
  };

  return (
    <section
      id="timeline"
      className={`pirate-timeline-section ${className}`}
      ref={sectionRef}
      aria-label="LitFest 2.0 Timeline"
    >
      {/* Ambient Seafoam Lighting Canvas */}
      <div className="ocean-ambient-canvas" aria-hidden="true">
        <div className="ocean-wave-glow glow-1" />
        <div className="ocean-wave-glow glow-2" />
      </div>

      <div className="pirate-timeline-container">

        {/* LEFT COLUMN: THE PIRATE SHIP STEERING WHEEL & CAPTAIN'S LOG */}
        <div className="timeline-helm-column">
          {/* Header Eyebrow */}
          <div className="helm-header">
            <div className="nautical-eyebrow">
              <Compass className="eyebrow-icon spin-slow" size={14} />
              <span>THE 14-SPOKE VOYAGE CHRONOLOGY</span>
            </div>
            <h2 className="helm-title">{title}</h2>
            <p className="helm-subtitle">{subtitle}</p>
          </div>

          {/* Interactive Pirate Ship Wheel with 14 Spokes */}
          <div className="helm-interactive-stage">
            <PirateWheelSvg
              milestones={milestones}
              activeIdx={activeIdx}
              onSpokeClick={handleSpokeClick}
              onCenterClick={handleCenterClick}
              wheelRef={wheelRef}
              rotationDeg={rotationDeg}
            />
          </div>

          {/* Helmsman's Navigation Controls (Port / Sound / Starboard) */}
          <div className="helm-controls-bar">
            <button
              type="button"
              className="steer-btn steer-port interactive"
              onClick={steerPort}
              title="Steer Port (Previous Spoke)"
              aria-label="Previous milestone"
            >
              <ChevronLeft size={18} />
              <span>PORT</span>
            </button>

            <button
              type="button"
              className={`sound-toggle-btn interactive ${isMuted ? 'muted' : ''}`}
              onClick={toggleSound}
              title={isMuted ? "Unmute Nautical Soundscape" : "Mute Sound"}
              aria-label={isMuted ? "Unmute sound" : "Mute sound"}
            >
              {isMuted ? <VolumeX size={18} /> : <Volume2 size={18} />}
              <span className="sound-lbl">{isMuted ? "BELL OFF" : "BELL ON"}</span>
            </button>

            <button
              type="button"
              className="steer-btn steer-starboard interactive"
              onClick={steerStarboard}
              title="Steer Starboard (Next Spoke)"
              aria-label="Next milestone"
            >
              <span>STARBOARD</span>
              <ChevronRight size={18} />
            </button>
          </div>

          {/* Active Spoke Telemetry Card */}
          <div className="helm-telemetry-card">
            <div className="telemetry-badge-row">
              <span className="telemetry-spoke-badge">
                SPOKE {selectedMilestone.spokeNumber} • {selectedMilestone.romanNumeral}
              </span>
              <span className="telemetry-category-pill">
                {selectedMilestone.category}
              </span>
              <span className="telemetry-coord">
                <Navigation2 size={12} className="coord-icon" />
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

        {/* RIGHT COLUMN: HORIZONTALLY SCROLLING VOYAGE TRACK */}
        <div className="timeline-track-column">
          <div className="timeline-voyage-track" ref={trackRef}>
            {milestones.map((milestone, idx) => {
              const isActive = activeIdx === idx;
              return (
                <article
                  key={milestone.id}
                  className={`timeline-voyage-card ${isActive ? 'is-active-card' : ''}`}
                  onClick={() => handleSpokeClick(idx)}
                >
                  <div className="voyage-card-inner interactive">
                    {/* Top Row: Spoke Number, Category, and Status */}
                    <div className="card-header-row">
                      <div className="card-spoke-crest">
                        <Anchor size={14} className="crest-anchor" />
                        <span>SPOKE {milestone.spokeNumber}</span>
                        <strong className="crest-roman">[{milestone.romanNumeral}]</strong>
                      </div>
                      <span className={`card-status-badge status-${milestone.status.toLowerCase()}`}>
                        <span className="status-dot" />
                        {milestone.status}
                      </span>
                    </div>

                    {/* Milestone Title */}
                    <h3 className="card-milestone-title">{milestone.title}</h3>

                    {/* Nautical Theme Bar */}
                    <div className="card-theme-tag">
                      <Compass size={13} />
                      <span>{milestone.nauticalTheme}</span>
                    </div>

                    {/* Date, Time & Venue maritime grid */}
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

                    {/* Captain's Log Parchment Block */}
                    <div className="card-captains-log">
                      <div className="log-feather-icon">📜 Captain's Log:</div>
                      <p className="log-text">"{milestone.captainLog}"</p>
                    </div>

                    {/* Highlights */}
                    <div className="card-highlights-box">
                      <div className="highlights-header">
                        <Sparkles size={13} />
                        <span>Voyage Highlights:</span>
                      </div>
                      <p className="highlights-desc">{milestone.highlights}</p>
                    </div>

                    {/* Card Footer: Prize Bounty & Role */}
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
                        Chart Course
                      </button>
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        </div>

      </div>
    </section>
  );
};

export default PirateWheelTimeline;
