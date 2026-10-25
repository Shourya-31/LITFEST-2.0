import type { AuthAdapter, GameUser, LeaderboardEntry } from "../../types/game.js";

export type AquaSplashState = "ready" | "playing" | "paused" | "continue" | "over";

/** Standard Tetris piece names */
export type PieceName = "I" | "O" | "T" | "S" | "Z" | "J" | "L";

export interface AquaSplashEntry extends LeaderboardEntry {
  level: number;
  linesCleared: number;
}
export interface AquaSplashBoard {
  entries: AquaSplashEntry[];
  currentPlayer: AquaSplashEntry | null;
  source: "mock" | "api";
}
export interface AquaSplashSubmission {
  userId: string;
  score: number;
  level: number;
  linesCleared: number;
}
export interface PersistenceReceipt { persisted: boolean }
export interface AquaSplashService {
  getAquaSplashLeaderboard(): Promise<AquaSplashBoard>;
  submitAquaSplashScore(result: AquaSplashSubmission): Promise<PersistenceReceipt>;
}
export interface AquaSplashAdapters { auth: AuthAdapter; service: AquaSplashService }
export type AquaSplashUser = GameUser;
declare global { interface Window { bluePulseAquaSplashService?: AquaSplashService } }
