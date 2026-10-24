export type UserRole = 'PARTICIPANT' | 'ADMIN';

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
  createdAt: string | Date;
}

export interface Event {
  id: string;
  title: string;
  description: string;
  category: EventCategory | string;
  venue: string;
  startsAt: string | Date;
  endsAt: string | Date;
  capacity: number;
  registeredCount?: number;
  isTeamEvent: boolean;
  minTeamSize?: number;
  maxTeamSize?: number;
  registrationOpen: boolean;
  createdAt?: string | Date;
}

export interface EventRegistration {
  id: string;
  userId: string;
  eventId: string;
  teamId?: string | null;
  status: RegistrationStatus;
  createdAt: string | Date;
  event?: Event;
  user?: User;
  team?: Team | null;
}

export interface Team {
  id: string;
  name: string;
  eventId: string;
  leaderId: string;
  createdAt: string | Date;
  members?: TeamMember[];
  event?: Event;
}

export interface TeamMember {
  id: string;
  teamId: string;
  userId: string;
  user?: User;
}

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: {
    message: string;
    code?: string;
    details?: any;
  };
}
