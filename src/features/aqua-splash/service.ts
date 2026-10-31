import type { AuthAdapter } from "../../types/game.js";
import type { AquaSplashBoard, AquaSplashEntry, AquaSplashService, AquaSplashSubmission, PersistenceReceipt } from "./types.js";

function compareEntries(a: AquaSplashEntry, b: AquaSplashEntry): number {
  return b.score - a.score || b.level - a.level || b.linesCleared - a.linesCleared
    || a.achievedAt.localeCompare(b.achievedAt) || a.userId.localeCompare(b.userId);
}

const DEMO_ROWS: AquaSplashEntry[] = [
  { userId: "aq-1", displayName: "CoralKing", score: 14200, level: 6, linesCleared: 32, rank: 1, achievedAt: "2026-01-01T00:00:00.000Z" },
  { userId: "aq-2", displayName: "Nautilus", score: 9800, level: 4, linesCleared: 22, rank: 2, achievedAt: "2026-01-02T00:00:00.000Z" },
  { userId: "aq-3", displayName: "AbyssWalker", score: 6500, level: 3, linesCleared: 15, rank: 3, achievedAt: "2026-01-03T00:00:00.000Z" },
  { userId: "aq-4", displayName: "PearlDiver", score: 4200, level: 2, linesCleared: 9, rank: 4, achievedAt: "2026-01-04T00:00:00.000Z" },
];

/** Same adapter pattern as Ocean Rush & Atlantis, separate in-memory store. No persistence. */
export class MemoryAquaSplashService implements AquaSplashService {
  private auth: AuthAdapter;
  private rows = new Map<string, AquaSplashEntry>();

  constructor(auth: AuthAdapter) {
    this.auth = auth;
    for (const row of DEMO_ROWS) {
      this.rows.set(row.userId, { ...row });
    }
  }

  async getAquaSplashLeaderboard(): Promise<AquaSplashBoard> {
    const user = await this.auth.getUser();
    const entries = [...this.rows.values()].map(row => ({ ...row }))
      .sort(compareEntries).map((row, i) => ({ ...row, rank: i + 1 }));
    return {
      entries,
      currentPlayer: entries.find(row => row.userId === user?.id) ?? null,
      source: "mock",
    };
  }

  async submitAquaSplashScore(result: AquaSplashSubmission): Promise<PersistenceReceipt> {
    const user = await this.auth.getUser();
    if (!user || user.id !== result.userId) throw new Error("Sign in to submit Aqua Splash scores.");
    if (!Number.isSafeInteger(result.score) || result.score < 0) throw new Error("Invalid score.");

    const candidate: AquaSplashEntry = {
      userId: user.id,
      displayName: user.displayName,
      score: result.score,
      level: result.level,
      linesCleared: result.linesCleared,
      rank: 0,
      achievedAt: new Date().toISOString(),
    };
    const old = this.rows.get(user.id);
    if (!old || compareEntries(candidate, old) < 0) {
      this.rows.set(user.id, candidate);
    }
    return { persisted: false };
  }
}
