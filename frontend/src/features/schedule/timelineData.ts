import { TimelineMilestone } from '../../types/timeline';

/**
 * 14-Spoke Timeline Dataset (Placeholders)
 * Skeletons for the 14 milestones to be integrated with domain/event data
 */
export const PIRATE_WHEEL_MILESTONES: TimelineMilestone[] = Array.from({ length: 14 }, (_, i) => {
  const romanNumerals = [
    "I", "II", "III", "IV", "V", "VI", "VII",
    "VIII", "IX", "X", "XI", "XII", "XIII", "XIV"
  ];
  const num = i + 1;
  const numStr = num < 10 ? `0${num}` : `${num}`;

  return {
    id: i,
    spokeNumber: num,
    romanNumeral: romanNumerals[i],
    title: `Milestone ${numStr}: [Event Title Placeholder]`,
    category: `[Category Placeholder ${num}]`,
    date: `Festival Day ${Math.min(Math.ceil(num / 4), 4)} [Date Placeholder]`,
    time: `[Time Slot Placeholder]`,
    venue: `[Venue / Deck Placeholder]`,
    nauticalTheme: `[Nautical Voyage Theme Placeholder ${num}]`,
    captainLog: `Captain's logbook entry placeholder for Milestone ${numStr}. Voyage narrative, coordinates, and instructions to be integrated by the domain team.`,
    highlights: `Milestone ${numStr} schedule guidelines, stage rounds, and competitive details placeholder.`,
    crewRoles: `[Eligibility / Team Size Placeholder]`,
    bountyOrPrize: `[Prize / Bounty Pool Placeholder]`,
    coordinates: `21.${2480 + i * 2}° N, 81.${6040 + i * 2}° E`,
    status: i === 0 ? 'Navigating' : i < 5 ? 'Charted' : 'Anchored'
  };
});
