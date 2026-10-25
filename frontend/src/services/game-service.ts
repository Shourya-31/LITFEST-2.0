import type {
  GameService,
  GameUser,
  Leaderboard,
  LeaderboardEntry,
} from "../types/game.js";

const demoRows = (): LeaderboardEntry[] =>
  [
    ["demo-1", "ReefRider", 1240],
    ["demo-2", "SaltySoul", 980],
    ["demo-3", "CoralKid", 760],
  ].map(([id, name, score], i) => ({
    userId: String(id),
    displayName: String(name),
    score: Number(score),
    rank: i + 1,
    achievedAt: "2026-01-01T00:00:00.000Z",
  }));

/** DEVELOPMENT MOCK. In-memory only; no shared competition or saved progress.
 * Replace with an authenticated API that validates runs server-side. */
export class MockGameService implements GameService {
  private rows = demoRows();
  private getUser: () => Promise<GameUser | null>;
  constructor(getUser: () => Promise<GameUser | null>) { this.getUser = getUser; }

  async getLeaderboard(): Promise<Leaderboard> {
    const user = await this.getUser();
    const entries = this.rows.map((row) => ({ ...row }));
    return {
      entries,
      currentPlayer: entries.find((row) => row.userId === user?.id) ?? null,
      source: "mock",
    };
  }

  async submitScore(score: number): Promise<void> {
    const user = await this.getUser();
    if (!user) throw new Error("Guests cannot submit scores.");
    if (!Number.isSafeInteger(score) || score < 0)
      throw new Error("Invalid score.");
    const existing = this.rows.find((row) => row.userId === user.id);
    if (existing && existing.score >= score) return;
    this.rows = this.rows.filter((row) => row.userId !== user.id);
    this.rows.push({
      userId: user.id,
      displayName: user.displayName,
      score,
      rank: 0,
      achievedAt: new Date().toISOString(),
    });
    this.rows.sort(
      (a, b) => b.score - a.score || a.achievedAt.localeCompare(b.achievedAt),
    );
    this.rows.forEach((row, i) => {
      row.rank = i + 1;
    });
  }

  async getMyBestScore(): Promise<number | null> {
    const user = await this.getUser();
    if (!user) return null;
    return this.rows.find((row) => row.userId === user.id)?.score ?? 0;
  }
}
