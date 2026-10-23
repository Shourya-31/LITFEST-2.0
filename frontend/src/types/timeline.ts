export interface TimelineMilestone {
  id: number;
  spokeNumber: number; // 1 to 14
  romanNumeral: string; // I to XIV
  title: string;
  category: 'Ceremony' | 'Competition' | 'Keynote' | 'Flagship' | 'Debate' | 'Literature';
  date: string;
  time: string;
  venue: string;
  nauticalTheme: string;
  captainLog: string;
  highlights: string;
  crewRoles: string;
  bountyOrPrize: string;
  coordinates: string;
  status: 'Anchored' | 'Navigating' | 'Charted';
}

export interface PirateWheelTimelineProps {
  milestones?: TimelineMilestone[];
  title?: string;
  subtitle?: string;
  className?: string;
  onMilestoneSelect?: (milestone: TimelineMilestone) => void;
}
