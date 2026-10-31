import React, { useState, useRef, useCallback, useEffect, type WheelEvent } from 'react';
import { Users, Code2, ArrowLeft, ChevronDown, ChevronUp } from 'lucide-react';
import { teamSectionsHierarchy, developersList, type TeamMember, type DeveloperMember } from './teamData';
import { TeamCard } from './TeamCard';
import { DeveloperCard } from './DeveloperCard';
import { ZoomControls } from './ZoomControls';
import './LitfestTeamSection.css';

interface LitfestTeamSectionProps {
  id?: string;
  initialMode?: 'team' | 'developers';
  onAscendClick?: () => void;
}

export const LitfestTeamSection: React.FC<LitfestTeamSectionProps> = ({
  id = 'team',
  initialMode = 'team',
  onAscendClick,
}) => {
  const [activeMode, setActiveMode] = useState<'team' | 'developers'>(initialMode);
  const [activeTierIndex, setActiveTierIndex] = useState(0);
  const [userZoomScale, setUserZoomScale] = useState(1);
  const [hoveredCardId, setHoveredCardId] = useState<string | null>(null);

  const containerRef = useRef<HTMLDivElement>(null);
  const lastTransitionTime = useRef(0);
  const wheelAccumulator = useRef(0);

  const totalTiers = teamSectionsHierarchy.length;
  const currentTier = teamSectionsHierarchy[activeTierIndex];

  const goToTier = useCallback(
    (index: number) => {
      const target = Math.max(0, Math.min(totalTiers - 1, index));
      if (target !== activeTierIndex) {
        setActiveTierIndex(target);
        setUserZoomScale(1);
        setHoveredCardId(null);
      }
    },
    [totalTiers, activeTierIndex]
  );

  const zoomIn = useCallback(() => {
    if (activeMode === 'team') {
      if (activeTierIndex < totalTiers - 1) {
        goToTier(activeTierIndex + 1);
      } else {
        setUserZoomScale((prev) => Math.min(1.2, prev + 0.1));
      }
    } else {
      setUserZoomScale((prev) => Math.min(1.2, prev + 0.1));
    }
  }, [activeMode, activeTierIndex, totalTiers, goToTier]);

  const zoomOut = useCallback(() => {
    if (userZoomScale > 1.05) {
      setUserZoomScale(1);
    } else if (activeMode === 'team' && activeTierIndex > 0) {
      goToTier(activeTierIndex - 1);
    } else {
      setUserZoomScale((prev) => Math.max(0.85, prev - 0.1));
    }
  }, [userZoomScale, activeMode, activeTierIndex, goToTier]);

  const resetView = useCallback(() => {
    setActiveTierIndex(0);
    setUserZoomScale(1);
    setHoveredCardId(null);
  }, []);

  // Handle wheel navigation between 3D tiers when user scrolls past scrollable boundaries
  const handleWheel = (e: WheelEvent<HTMLDivElement>) => {
    if (activeMode !== 'team') return;
    const now = performance.now();
    if (now - lastTransitionTime.current < 550) return;

    const scrollable = (e.target as HTMLElement).closest('.team-cards-scroll-container') as HTMLElement | null;
    if (scrollable) {
      const tolerance = 8;
      const isAtTop = scrollable.scrollTop <= tolerance;
      const isAtBottom = scrollable.scrollTop + scrollable.clientHeight >= scrollable.scrollHeight - tolerance;

      if (e.deltaY > 0 && !isAtBottom) return;
      if (e.deltaY < 0 && !isAtTop) return;
    }

    wheelAccumulator.current += e.deltaY;
    if (Math.abs(wheelAccumulator.current) >= 45) {
      if (wheelAccumulator.current > 0) {
        zoomIn();
      } else {
        zoomOut();
      }
      wheelAccumulator.current = 0;
      lastTransitionTime.current = now;
    }
  };

  const getGridClass = (prominence: string) => {
    switch (prominence) {
      case 'highest':
        return 'grid-cols-highest';
      case 'high':
        return 'grid-cols-high';
      case 'compact':
      case 'compact-grid':
        return 'grid-cols-compact';
      default:
        return 'grid-cols-standard';
    }
  };

  return (
    <section id={id} ref={containerRef} onWheel={handleWheel} className="litfest-team-section" aria-label="Our Team & Developers">
      {/* Background Ambience */}
      <div className="team-ambient-canvas" aria-hidden="true">
        <div className="team-wave-glow glow-1" />
        <div className="team-wave-glow glow-2" />
      </div>

      {/* Main Header & View Mode Switcher */}
      <div className="team-section-header">
        <div className="team-badge-pill">
          <span className="team-badge-dot" />
          <span>{activeMode === 'team' ? 'Litfest 2026 Collective' : 'Engineers & Architects'}</span>
          <span className="team-badge-dot" />
        </div>

        <h2 className="team-main-title">
          {activeMode === 'team' ? 'MEET OUR TEAM' : 'THE MINDS BEHIND THE EXPERIENCE'}
        </h2>

        <p className="team-main-subtitle">
          {activeMode === 'team'
            ? 'The minds, creativity and people behind Literati.'
            : 'Meet the developers who brought the digital world of Literati to life.'}
        </p>

        {/* Chamber Switcher: Our Team (85) | Developers (10) */}
        <div className="team-view-switcher" role="tablist" aria-label="Section Selector">
          <button
            type="button"
            role="tab"
            aria-selected={activeMode === 'team'}
            onClick={() => {
              setActiveMode('team');
              setHoveredCardId(null);
            }}
            className={`view-tab-btn ${activeMode === 'team' ? 'is-active' : ''}`}
          >
            <Users size={15} />
            <span>Litfest Team</span>
            <span className="view-tab-count">85</span>
          </button>

          <button
            type="button"
            role="tab"
            aria-selected={activeMode === 'developers'}
            onClick={() => {
              setActiveMode('developers');
              setHoveredCardId(null);
            }}
            className={`view-tab-btn ${activeMode === 'developers' ? 'is-active' : ''}`}
          >
            <Code2 size={15} />
            <span>Developers</span>
            <span className="view-tab-count">10</span>
          </button>
        </div>
      </div>

      {/* 3D World Viewport */}
      <div className="team-3d-viewport">
        {activeMode === 'team' ? (
          /* ========================================================
             1. ALL 7 DESIGNATION TIERS IN 3D Z-AXIS DEPTH EXPERIENCE
             ======================================================== */
          <div className="team-3d-world">
            {teamSectionsHierarchy.map((section, index) => {
              const delta = index - activeTierIndex;
              let transform = 'translate3d(0, 0, 0px) scale(1)';
              let opacity = 1;
              let filter = 'blur(0px)';
              let pointerEvents: 'auto' | 'none' = 'auto';
              let visibility: 'visible' | 'hidden' = 'visible';

              if (delta === 0) {
                transform = `translate3d(0, 0, 0px) scale(${userZoomScale})`;
                opacity = 1;
                filter = 'blur(0px)';
                pointerEvents = 'auto';
                visibility = 'visible';
              } else if (delta > 0) {
                const zDist = -Math.min(delta * 800, 2400);
                const scale = Math.max(0.4, 1 - delta * 0.3);
                transform = `translate3d(0, 0, ${zDist}px) scale(${scale})`;
                opacity = delta === 1 ? 0.08 : 0;
                filter = 'blur(10px)';
                pointerEvents = 'none';
                visibility = delta === 1 ? 'visible' : 'hidden';
              } else {
                const zDist = Math.min(-delta * 700, 1800);
                const scale = 1 + -delta * 0.45;
                transform = `translate3d(0, 0, ${zDist}px) scale(${scale})`;
                opacity = 0;
                filter = 'blur(12px)';
                pointerEvents = 'none';
                visibility = 'hidden';
              }

              return (
                <div
                  key={section.role}
                  className="team-3d-slide"
                  style={{
                    transform,
                    opacity,
                    filter,
                    pointerEvents,
                    visibility,
                    zIndex: delta === 0 ? 15 : 5,
                  }}
                >
                  <div className="tier-header">
                    <span className="tier-label-tag">Tier 0{index + 1} of 07</span>
                    <h3 className="tier-title">{section.title}</h3>
                    <p className="tier-subtitle">{section.subtitle}</p>
                  </div>

                  <div className="team-cards-scroll-container" onMouseLeave={() => setHoveredCardId(null)}>
                    <div className={`team-cards-grid ${getGridClass(section.prominence)}`}>
                      {section.members.map((member) => (
                        <TeamCard
                          key={member.id}
                          member={member}
                          prominence={section.prominence}
                          isFocused={hoveredCardId === member.id}
                          isBlurred={hoveredCardId !== null && hoveredCardId !== member.id}
                          onHover={() => setHoveredCardId(member.id)}
                          onLeave={() => {
                            if (hoveredCardId === member.id) setHoveredCardId(null);
                          }}
                          onSelect={() =>
                            setHoveredCardId((curr) => (curr === member.id ? null : member.id))
                          }
                        />
                      ))}
                    </div>
                  </div>
                </div>
              );
            })}

            {/* Depth Stepper Pearls (Right side) */}
            <nav aria-label="Tier Depth Navigator" className="team-depth-stepper">
              {teamSectionsHierarchy.map((sec, idx) => (
                <button
                  key={sec.role}
                  type="button"
                  onClick={() => goToTier(idx)}
                  className={`depth-step-dot ${idx === activeTierIndex ? 'is-active' : ''}`}
                  title={sec.title}
                  aria-label={`Jump to ${sec.title}`}
                />
              ))}
            </nav>

            {/* Bottom Dive / Return Status Button */}
            <div className="team-dive-status-bar">
              {activeTierIndex < totalTiers - 1 ? (
                <button type="button" onClick={zoomIn} className="team-dive-status-btn">
                  <span>Scroll or tap to dive deeper</span>
                  <ChevronDown size={15} />
                </button>
              ) : (
                <button type="button" onClick={() => goToTier(0)} className="team-dive-status-btn">
                  <span>Return to Top Tier</span>
                  <ChevronUp size={15} />
                </button>
              )}
            </div>
          </div>
        ) : (
          /* ========================================================
             2. DEVELOPERS CHAMBER (INSIDE OUR TEAM SECTION)
             ======================================================== */
          <div className="team-3d-world" style={{ transform: `scale(${userZoomScale})` }}>
            <div className="team-3d-slide" style={{ opacity: 1, pointerEvents: 'auto' }}>
              <div className="tier-header" style={{ marginBottom: 18 }}>
                <button
                  type="button"
                  onClick={() => setActiveMode('team')}
                  className="team-dive-status-btn"
                  style={{ marginBottom: 12, display: 'inline-flex' }}
                >
                  <ArrowLeft size={14} />
                  <span>Back to Our Team Tiers</span>
                </button>
                <h3 className="tier-title">Core Digital &amp; Interactive Engineering</h3>
                <p className="tier-subtitle">
                  The ten creators behind Litfest 2.0 digital platform, 3D spatial experiences, and visual systems.
                </p>
              </div>

              <div className="team-cards-scroll-container" onMouseLeave={() => setHoveredCardId(null)}>
                <div className="team-cards-grid grid-cols-developers">
                  {developersList.map((dev, index) => (
                    <DeveloperCard
                      key={dev.id}
                      developer={dev}
                      index={index}
                      isFocused={hoveredCardId === dev.id}
                      isBlurred={hoveredCardId !== null && hoveredCardId !== dev.id}
                      onHover={() => setHoveredCardId(dev.id)}
                      onLeave={() => {
                        if (hoveredCardId === dev.id) setHoveredCardId(null);
                      }}
                      onSelect={() =>
                        setHoveredCardId((curr) => (curr === dev.id ? null : dev.id))
                      }
                    />
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Floating Zoom Controls (+ / - / Reset) */}
      <ZoomControls
        onZoomIn={zoomIn}
        onZoomOut={zoomOut}
        onReset={resetView}
        canZoomIn={activeMode === 'team' ? activeTierIndex < totalTiers - 1 || userZoomScale < 1.2 : userZoomScale < 1.2}
        canZoomOut={activeMode === 'team' ? activeTierIndex > 0 || userZoomScale > 0.85 : userZoomScale > 0.85}
        currentLevel={activeMode === 'team' ? activeTierIndex : 0}
        totalLevels={activeMode === 'team' ? totalTiers : 1}
        depthLabel={activeMode === 'team' ? currentTier?.role.replace('Coordinator', 'Coord') : 'Developers'}
      />
    </section>
  );
};
