import React from 'react';
import type { TeamSectionHierarchy } from './teamData';
import { TeamCard } from './TeamCard';
import { FocusCardsContainer } from './FocusCardsContainer';

export interface TeamSectionProps {
  section: TeamSectionHierarchy;
  tierIndex: number;
  totalTiers: number;
  isActive?: boolean;
}

export const TeamSection: React.FC<TeamSectionProps> = ({
  section,
  tierIndex,
  totalTiers,
}) => {
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
    <section
      className={`team-section-block prominence-${section.prominence}`}
      id={`section-${section.role.toLowerCase().replace(/[^a-z0-9]+/g, '-')}`}
      aria-label={section.title}
    >
      <div className="tier-header">
        <span className="tier-label-tag">
          Tier {tierIndex + 1 < 10 ? `0${tierIndex + 1}` : tierIndex + 1} of{' '}
          {totalTiers < 10 ? `0${totalTiers}` : totalTiers}
        </span>
        <h2 className="tier-title">{section.title}</h2>
        <p className="tier-subtitle">{section.subtitle}</p>
        <span className="tier-member-count">
          {section.members.length} {section.members.length === 1 ? 'Leader' : 'Members'}
        </span>
      </div>

      <div className="team-cards-wrapper">
        <FocusCardsContainer className={`team-cards-grid ${getGridClass(section.prominence)}`}>
          {section.members.map((member) => (
            <TeamCard
              key={member.id}
              member={member}
              prominence={section.prominence}
            />
          ))}
        </FocusCardsContainer>
      </div>

      {tierIndex < totalTiers - 1 && (
        <div className="tier-separator" aria-hidden="true">
          <span className="tier-separator-line" />
          <span className="tier-separator-pearl" />
          <span className="tier-separator-line" />
        </div>
      )}
    </section>
  );
};
