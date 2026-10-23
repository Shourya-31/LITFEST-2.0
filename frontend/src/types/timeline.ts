export interface TimelineMilestone {
  id: number;
  spokeNumber: number; // 1 to 14
  romanNumeral: string; // I to XIV
  title: string;
  category: string;
  date: string;
  time: string;
  venue: string;
  nauticalTheme: string;
  captainLog: string;
  highlights: string;
  crewRoles: string;
  bountyOrPrize: string;
  coordinates: string;
  status: string;
}

export interface PirateWheelTimelineProps {
  milestones?: TimelineMilestone[];
  title?: string;
  subtitle?: string;
  className?: string;
  onMilestoneSelect?: (milestone: TimelineMilestone) => void;
}
