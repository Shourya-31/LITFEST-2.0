export type GameMode = "surface" | "underwater";
export type UserId = string;
export type DisplayName = string;
export type Score = number;
export type Rank = number;
export type Timestamp = string;

export interface GameUser {
  id: UserId;
  displayName: DisplayName;
}
export interface LeaderboardEntry {
  userId: UserId;
  displayName: DisplayName;
  score: Score;
  rank: Rank;
  achievedAt: Timestamp;
}
export interface Leaderboard {
  entries: LeaderboardEntry[];
  currentPlayer: LeaderboardEntry | null;
  source: "mock" | "api";
}
export interface GameService {
  getLeaderboard(): Promise<Leaderboard>;
  submitScore(score: Score): Promise<void>;
  getMyBestScore(): Promise<Score | null>;
}
export interface AuthAdapter {
  getUser(): Promise<GameUser | null>;
  login(): Promise<void>;
}
export interface BluePulseAdapters {
  auth: AuthAdapter;
  gameService: GameService;
}

declare global {
  interface Window {
    bluePulseAdapters?: BluePulseAdapters;
  }
}
