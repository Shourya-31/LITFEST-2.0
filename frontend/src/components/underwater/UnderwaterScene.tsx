import React, { useState, useCallback } from 'react';
import { DeepWater } from './DeepWater';
import { LightRays } from './LightRays';
import { WaterHaze } from './WaterHaze';
import { Particles } from './Particles';
import { BubbleOverlay } from './BubbleOverlay';
import PhaserGame from './PhaserGame';
import { LitfestAboutSection } from '../../features/about/LitfestAboutSection';
import './Underwater.css';

export interface UnderwaterSceneProps {
  className?: string;
  style?: React.CSSProperties;
  particleCount?: number;
  enableClickBubbles?: boolean;
  enableAvatar?: boolean;
  onNavigate?: (section: string) => void;
  children?: React.ReactNode;
}

export const UnderwaterScene: React.FC<UnderwaterSceneProps> = ({
  className = '',
  style,
  particleCount = 45,
  enableClickBubbles = true,
  enableAvatar = true,
  onNavigate,
  children,
}) => {
  const [activeModal, setActiveModal] = useState<string | null>(null);

  const handleLandmarkTrigger = useCallback(
    (target: string) => {
      setActiveModal(target);
      onNavigate?.(target);
    },
    [onNavigate]
  );

  return (
    <div
      className={`underwater-scene ${className}`.trim()}
      style={style}
      role="presentation"
      aria-hidden="true"
    >
      <DeepWater />
      <LightRays />
      <WaterHaze />
      <Particles count={particleCount} />
      {enableAvatar && <PhaserGame onNavigate={handleLandmarkTrigger} />}
      {enableClickBubbles && <BubbleOverlay />}
      {children}

      {/* Self-contained Landmark Modal Overlay */}
      {activeModal && (
        <div
          className="underwater-landmark-modal-overlay"
          onClick={() => setActiveModal(null)}
          role="dialog"
          aria-modal="true"
        >
          {activeModal === 'about' ? (
            <div
              className="underwater-about-modal-card"
              onClick={(e) => e.stopPropagation()}
            >
              <button
                type="button"
                className="underwater-modal-close"
                onClick={() => setActiveModal(null)}
                aria-label="Close"
              >
                &times;
              </button>
              <LitfestAboutSection onAscendClick={() => setActiveModal(null)} />
            </div>
          ) : (
            <div
              className="underwater-landmark-modal-card"
              onClick={(e) => e.stopPropagation()}
            >
              <button
                type="button"
                className="underwater-modal-close"
                onClick={() => setActiveModal(null)}
                aria-label="Close"
              >
                &times;
              </button>

              {activeModal === 'schedule' && (
                <div>
                  <span className="underwater-modal-eyebrow">FESTIVAL ITINERARY</span>
                  <h3 className="underwater-modal-title">Buried Capsule Tower — Schedule</h3>
                  <p className="underwater-modal-desc">
                    The ancient hands of the underwater clock mark the hours of celebration. Here is the official festival timeline for LitFest 2.0:
                  </p>
                  <div className="underwater-schedule-list">
                    <div className="underwater-schedule-item">
                      <span className="underwater-schedule-time">09:30 AM</span>
                      <span className="underwater-schedule-event">Opening Voyage & Keynote Address</span>
                    </div>
                    <div className="underwater-schedule-item">
                      <span className="underwater-schedule-time">11:00 AM</span>
                      <span className="underwater-schedule-event">Verbatim: Parliamentary Debate Battles</span>
                    </div>
                    <div className="underwater-schedule-item">
                      <span className="underwater-schedule-time">02:30 PM</span>
                      <span className="underwater-schedule-event">Inkspire: Creative Flash Fiction & Spoken Word</span>
                    </div>
                    <div className="underwater-schedule-item">
                      <span className="underwater-schedule-time">05:00 PM</span>
                      <span className="underwater-schedule-event">Quizzitch: High Seas Pop-Culture & Literary Quest</span>
                    </div>
                  </div>
                  <button
                    type="button"
                    className="underwater-modal-btn"
                    onClick={() => setActiveModal(null)}
                  >
                    Close Itinerary
                  </button>
                </div>
              )}

              {activeModal === 'register' && (
                <div>
                  <span className="underwater-modal-eyebrow">REGISTRATION PORTAL</span>
                  <h3 className="underwater-modal-title">Pearl of Passage — Register</h3>
                  <p className="underwater-modal-desc">
                    Secure your place aboard the flagship voyage. Unlock access to all competitive literary arenas, author panels, and merit certificates.
                  </p>
                  <button
                    type="button"
                    className="underwater-modal-btn"
                    onClick={() => setActiveModal(null)}
                  >
                    Confirm Registration
                  </button>
                </div>
              )}

              {activeModal !== 'schedule' && activeModal !== 'register' && (
                <div>
                  <span className="underwater-modal-eyebrow">OCEANIC DISCOVERY</span>
                  <h3 className="underwater-modal-title">{activeModal.toUpperCase()}</h3>
                  <p className="underwater-modal-desc">
                    You have discovered the {activeModal} sector in the depths of Blue Pulse.
                  </p>
                  <button
                    type="button"
                    className="underwater-modal-btn"
                    onClick={() => setActiveModal(null)}
                  >
                    Close
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default UnderwaterScene;
