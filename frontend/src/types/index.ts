export * from './timeline';
export * from './faq';

export type UserRole = 'USER' | 'PARTICIPANT' | 'ADMIN';

export type EventCategory =
  | 'Debate'
  | 'Creative Writing'
  | 'Poetry'
  | 'Quizzing'
  | 'Literary Arts'
  | 'Workshop';

export type RegistrationStatus = 'CONFIRMED' | 'WAITLISTED' | 'CANCELLED';

export interface User {
  id: string;
  name: string;
  email: string;
  phone?: string | null;
  college?: string | null;
  year?: string | null;
  role: UserRole;
  createdAt: string;
}

export interface Event {
  id: string;
  title: string;
  description: string;
  category: EventCategory | string;
  venue: string;
  startsAt: string;
  endsAt: string;
  capacity: number;
  registeredCount: number;
  remainingCapacity: number;
  isFull: boolean;
  isTeamEvent: boolean;
  minTeamSize?: number;
  maxTeamSize?: number;
  registrationOpen: boolean;
  userRegistration?: EventRegistration | null;
  teams?: Team[];
}

export interface EventRegistration {
  id: string;
  userId: string;
  eventId: string;
  teamId?: string | null;
  status: RegistrationStatus;
  createdAt: string;
  event?: Event;
  team?: Team | null;
}

export interface Team {
  id: string;
  name: string;
  eventId: string;
  leaderId: string;
  createdAt: string;
  members?: TeamMember[];
  event?: Event;
}

export interface TeamMember {
  id: string;
  teamId: string;
  userId: string;
  user?: {
    id: string;
    name: string;
    email?: string;
    college?: string | null;
  };
}

export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: {
    message: string;
    code?: string;
    details?: unknown;
  };
}
