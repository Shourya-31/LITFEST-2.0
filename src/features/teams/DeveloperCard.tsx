import React, { useState, useRef, type MouseEvent } from 'react';
import type { DeveloperMember } from './developerData';
import { PixelCanvasEffect } from './PixelCanvasEffect';
import { useFocusCards } from './FocusCardsContainer';

export interface DeveloperCardProps {
  developer: DeveloperMember;
  index: number;
  isFocused?: boolean;
  isBlurred?: boolean;
  onHover?: () => void;
  onLeave?: () => void;
  onSelect?: () => void;
}

export const DeveloperCard: React.FC<DeveloperCardProps> = ({
  developer,
  index,
  isFocused: propFocused,
  isBlurred: propBlurred,
  onHover,
  onLeave,
  onSelect,
}) => {
  const context = useFocusCards();
  const [burstCount, setBurstCount] = useState(0);
  const [burstPos, setBurstPos] = useState<{ x: number; y: number } | null>(null);
  const [photoFailed, setPhotoFailed] = useState(false);
  const cardRef = useRef<HTMLButtonElement>(null);

  const isFocused =
    propFocused !== undefined
      ? propFocused
      : context.focusedId === developer.id;
  const isBlurred =
    propBlurred !== undefined
      ? propBlurred
      : context.focusedId !== null && context.focusedId !== developer.id;

  const initials = developer.name
    .split(' ')
    .filter(Boolean)
    .map((w) => w[0])
    .slice(0, 2)
    .join('')
    .toUpperCase();
  const photo = developer.photo || `/team/${developer.id}.jpg`;

  const handleMouseEnter = () => {
    onHover?.();
    context.onCardHover(developer.id);
  };

  const handleMouseLeave = () => {
    onLeave?.();
    context.onCardLeave(developer.id);
  };

  const handleFocus = () => {
    onHover?.();
    context.onCardHover(developer.id);
  };

  const handleBlur = () => {
    onLeave?.();
    context.onCardLeave(developer.id);
  };

  const handleClick = (e: MouseEvent<HTMLButtonElement>) => {
    if (cardRef.current) {
      const rect = cardRef.current.getBoundingClientRect();
      setBurstPos({
        x: e.clientX - rect.left,
        y: e.clientY - rect.top,
      });
    }
    setBurstCount((b) => b + 1);
    onSelect?.();
    context.onCardToggle(developer.id);
  };

  return (
    <button
      ref={cardRef}
      type="button"
      aria-label={`${developer.name}, ${developer.role}`}
      aria-pressed={isFocused}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      onFocus={handleFocus}
      onBlur={handleBlur}
      onClick={handleClick}
      className={`team-focus-card dev-card ${isFocused ? 'is-focused' : ''} ${
        isBlurred ? 'is-blurred' : ''
      }`}
    >
      {/* Pixel Canvas Effect */}
      <PixelCanvasEffect
        active={isFocused}
        burstTrigger={burstCount}
        burstOrigin={burstPos}
        gap={8}
        speed={isFocused ? 36 : 24}
      />

      {/* Frame border highlight */}
      {isFocused && <span aria-hidden className="team-card-active-glow" />}

      {/* Order Badge */}
      <span className="dev-order-badge">{index + 1 < 10 ? `0${index + 1}` : index + 1}</span>

      {/* Circular Profile Photograph */}
      <div className="team-avatar-wrap">
        <div className="team-avatar-inner avatar-developer">
          {photo && !photoFailed ? (
            <img
              src={photo}
              alt={developer.name}
              loading="lazy"
              className="team-avatar-img"
              onError={() => setPhotoFailed(true)}
            />
          ) : (
            <div className="team-avatar-initials">{initials}</div>
          )}
        </div>
      </div>

      {/* Name and Role */}
      <div className="team-info-wrap">
        <h3 className="team-member-name">{developer.name}</h3>
        <p className="team-member-role">
          <span className="role-pearl-dot" />
          <span>{developer.role}</span>
          <span className="role-pearl-dot" />
        </p>
      </div>
    </button>
  );
};
