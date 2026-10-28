import type Lenis from 'lenis';

export interface TimelineMilestone {
  id: number;
  eventNumber: number; // 1 to 14 (Event index)
  spokeNumber: number; // Backward-compatible alias
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
  isFaqOpen?: boolean;
  isActive?: boolean;
  initialEventIndex?: number;
  onMilestoneSelect?: (milestone: TimelineMilestone) => void;
  onRegisterLenis?: (lenis: Lenis) => void;
  onScrollProgress?: (progress: number) => void;
  onNavigateHome?: () => void;
  onNavigateNext?: () => void;
  onNavigatePrev?: () => void;
}
