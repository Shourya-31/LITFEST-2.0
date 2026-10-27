export const EVENT_CATEGORIES = [
  'Debate',
  'Creative Writing',
  'Poetry',
  'Quizzing',
  'Literary Arts',
  'Workshop'
] as const;

export const REGISTRATION_STATUS = {
  CONFIRMED: 'CONFIRMED',
  WAITLISTED: 'WAITLISTED',
  CANCELLED: 'CANCELLED'
} as const;

export const USER_ROLES = {
  PARTICIPANT: 'PARTICIPANT',
  ADMIN: 'ADMIN'
} as const;

export const API_PREFIX = '/api/v1';

export const COOKIE_NAME = 'litfest_token';
