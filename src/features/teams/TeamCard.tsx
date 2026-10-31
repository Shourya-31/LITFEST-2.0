import React, { useState, useRef, type MouseEvent } from 'react';
import type { TeamMember } from './teamData';
import { PixelCanvasEffect } from './PixelCanvasEffect';
import { useFocusCards } from './FocusCardsContainer';

export interface TeamCardProps {
  member: TeamMember;
  isFocused?: boolean;
  isBlurred?: boolean;
  prominence?: 'highest' | 'high' | 'elevated' | 'medium' | 'standard' | 'compact' | 'compact-grid';
  onHover?: () => void;
  onLeave?: () => void;
  onSelect?: () => void;
}

export const TeamCard: React.FC<TeamCardProps> = ({
  member,
  isFocused: propFocused,
  isBlurred: propBlurred,
  prominence = 'standard',
  onHover,
  onLeave,
  onSelect,
}) => {
  const context = useFocusCards();
  const [burstCount, setBurstCount] = useState(0);
  const [burstPos, setBurstPos] = useState<{ x: number; y: number } | null>(null);
  const [photoFailed, setPhotoFailed] = useState(false);
  const cardRef = useRef<HTMLButtonElement>(null);

  // If inside FocusCardsContainer, derive focused/blurred state from context unless explicitly passed as props
  const isFocused =
    propFocused !== undefined
      ? propFocused
      : context.focusedId === member.id;
  const isBlurred =
    propBlurred !== undefined
      ? propBlurred
      : context.focusedId !== null && context.focusedId !== member.id;

  const initials = member.name
    .split(' ')
    .filter(Boolean)
    .map((w) => w[0])
    .slice(0, 2)
    .join('')
    .toUpperCase();
  const photo = member.photo || `/team/${member.id}.jpg`;

  const handleMouseEnter = () => {
    onHover?.();
    context.onCardHover(member.id);
  };

  const handleMouseLeave = () => {
    onLeave?.();
    context.onCardLeave(member.id);
  };

  const handleFocus = () => {
    onHover?.();
    context.onCardHover(member.id);
  };

  const handleBlur = () => {
    onLeave?.();
    context.onCardLeave(member.id);
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
    context.onCardToggle(member.id);
  };

  const isLeader = prominence === 'highest' || prominence === 'high';

  return (
    <button
      ref={cardRef}
      type="button"
      aria-label={`${member.name}, ${member.role}`}
      aria-pressed={isFocused}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      onFocus={handleFocus}
      onBlur={handleBlur}
      onClick={handleClick}
      className={`team-focus-card prominence-${prominence} ${isFocused ? 'is-focused' : ''} ${
        isBlurred ? 'is-blurred' : ''
      }`}
    >
      {/* 21st.dev Pixel Canvas Effect */}
      <PixelCanvasEffect
        active={isFocused}
        burstTrigger={burstCount}
        burstOrigin={burstPos}
        gap={prominence === 'compact-grid' ? 10 : 8}
        speed={isFocused ? 36 : 24}
      />

      {/* Frame border highlight */}
      {isFocused && <span aria-hidden className="team-card-active-glow" />}

      {/* Circular Profile Photograph / Initials Avatar */}
      <div className="team-avatar-wrap">
        <div className={`team-avatar-inner ${isLeader ? 'avatar-leader' : ''}`}>
          {photo && !photoFailed ? (
            <img
              src={photo}
              alt={member.name}
              loading="lazy"
              className="team-avatar-img"
              onError={() => setPhotoFailed(true)}
            />
          ) : (
            <div className="team-avatar-initials">{initials}</div>
          )}
        </div>
      </div>

      {/* Name and Designation */}
      <div className="team-info-wrap">
        <h3 className="team-member-name">{member.name}</h3>
        <p className="team-member-role">
          <span className="role-pearl-dot" />
          <span>{member.role}</span>
          <span className="role-pearl-dot" />
        </p>
      </div>
    </button>
  );
};
