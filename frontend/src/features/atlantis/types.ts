import type { AuthAdapter, GameUser, LeaderboardEntry } from "../../types/game.js";

export type LiteraryDifficulty = "easy" | "medium" | "hard";
export interface LiteraryQuestion {
  id: string; level: number; category: string; difficulty: LiteraryDifficulty;
  question: string; options: [string, string, string, string]; correctAnswer: number;
  explanation: string; hint?: string;
}
export interface AtlantisLevel {
  id: number; name: string; description: string; category: string;
  difficultyLabel: string; questionCount: number; requiredCorrect: number;
}
export interface AtlantisResult {
  runId: string; score: number; highestCompletedLevel: number; completed: boolean;
  elapsedSeconds: number; correctAnswers: number; wrongAnswers: number; unansweredAnswers: number; hintsUsed: number;
}
export interface AtlantisProgress {
  userId: string; unlockedLevel: number; highestCompletedLevel: number;
  bestScore: number; completedRuns: number; bestCompletionTime: number | null;
  chambers?: AtlantisChamberRecords;
}
export interface AtlantisChamberRecord { stars: 1 | 2 | 3; bestScore: number; bestAccuracy: number }
export type AtlantisChamberRecords = Partial<Record<number, AtlantisChamberRecord>>;
export interface AtlantisEntry extends LeaderboardEntry {
  highestCompletedLevel: number; completionTime: number | null;
}
export interface AtlantisBoard {
  entries: AtlantisEntry[]; currentPlayer: AtlantisEntry | null; source: "mock" | "api";
}
export interface PersistenceReceipt { persisted: boolean }
export type AtlantisSubmission = AtlantisResult & { userId: string };
/** A receipt must confirm persistence before the UI may say account progress is saved. */
export interface AtlantisService {
  getAtlantisLeaderboard(): Promise<AtlantisBoard>;
  getAtlantisProgress(userId: string): Promise<AtlantisProgress | null>;
  saveAtlantisProgress(progress: AtlantisProgress): Promise<PersistenceReceipt>;
  submitAtlantisScore(result: AtlantisSubmission): Promise<PersistenceReceipt>;
}
export interface AtlantisAdapters { auth: AuthAdapter; service: AtlantisService }
export type AtlantisUser = GameUser;
declare global { interface Window { bluePulseAtlantisService?: AtlantisService } }
