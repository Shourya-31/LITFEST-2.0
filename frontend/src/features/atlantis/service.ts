import type { AuthAdapter } from "../../types/game.js";
import type { AtlantisBoard, AtlantisEntry, AtlantisProgress, AtlantisResult, AtlantisService, AtlantisSubmission } from "./types.js";
import { ATLANTIS_LEVELS } from "./levels.js";
import { MAX_ATLANTIS_SCORE, QUESTION_BANK } from "./questions.js";
import { mergeChamberRecords } from "./progress.js";

export function compareAtlantisEntries(a: AtlantisEntry, b: AtlantisEntry): number {
  return b.score - a.score || b.highestCompletedLevel - a.highestCompletedLevel
    || (a.completionTime ?? Infinity) - (b.completionTime ?? Infinity)
    || a.achievedAt.localeCompare(b.achievedAt) || a.userId.localeCompare(b.userId);
}
export function validateResult(result: AtlantisResult): void {
  const requiredCorrect = ATLANTIS_LEVELS.slice(0,result.highestCompletedLevel).reduce((sum, level) => sum + level.requiredCorrect,0);
  if (!result.runId || result.runId.length > 128 || !Number.isSafeInteger(result.score) || result.score < 0 || result.score > MAX_ATLANTIS_SCORE
    || !Number.isInteger(result.highestCompletedLevel) || result.highestCompletedLevel < 0 || result.highestCompletedLevel > 10
    || !Number.isSafeInteger(result.correctAnswers) || result.correctAnswers < requiredCorrect || result.completed !== (result.highestCompletedLevel === 10)
    || result.score > result.correctAnswers * 150 + result.highestCompletedLevel * 200 + (result.completed ? 500 : 0)
    || !Number.isFinite(result.elapsedSeconds) || result.elapsedSeconds < 0
    || !Number.isSafeInteger(result.wrongAnswers) || result.wrongAnswers < 0
    || !Number.isSafeInteger(result.unansweredAnswers) || result.unansweredAnswers < 0
    || !Number.isInteger(result.hintsUsed) || result.hintsUsed < 0 || result.hintsUsed > QUESTION_BANK.length) throw new Error("Invalid Atlantis result.");
}
/** Same adapter pattern as Ocean Rush, but a separate, initially empty store. No persistence. */
export class MemoryAtlantisService implements AtlantisService {
  private auth: AuthAdapter;
  private rows = new Map<string, AtlantisEntry>();
  private progress = new Map<string, AtlantisProgress>();
  constructor(auth: AuthAdapter) { this.auth = auth; }
  private async requireUser(userId?: string) {
    const user = await this.auth.getUser();
    if (!user || (userId !== undefined && user.id !== userId)) throw new Error("Sign in to your own account to save Atlantis progress.");
    return user;
  }
  async getAtlantisLeaderboard(): Promise<AtlantisBoard> {
    const user = await this.auth.getUser();
    const entries = [...this.rows.values()].map(row => ({...row})).sort(compareAtlantisEntries).map((row, i) => ({...row, rank:i + 1}));
    return {entries, currentPlayer:entries.find(row => row.userId === user?.id) ?? null, source:"mock"};
  }
  async getAtlantisProgress(userId: string): Promise<AtlantisProgress | null> {
    await this.requireUser(userId);
    const progress = this.progress.get(userId);
    return progress ? {...progress,chambers:mergeChamberRecords(progress.chambers)} : null;
  }
  async saveAtlantisProgress(value: AtlantisProgress) {
    await this.requireUser(value.userId);
    const chambers = mergeChamberRecords(value.chambers);
    if (![value.unlockedLevel, value.highestCompletedLevel, value.bestScore, value.completedRuns].every(Number.isSafeInteger)
      || value.highestCompletedLevel < 0 || value.highestCompletedLevel > 10 || value.unlockedLevel < 1
      || value.unlockedLevel > 10 || value.unlockedLevel > value.highestCompletedLevel + 1
      || value.bestScore < 0 || value.bestScore > MAX_ATLANTIS_SCORE || value.completedRuns < 0
      || Object.keys(chambers).some(id => Number(id) > value.highestCompletedLevel)
      || (value.bestCompletionTime !== null && (!Number.isFinite(value.bestCompletionTime) || value.bestCompletionTime < 0))) throw new Error("Invalid Atlantis progress.");
    const old = this.progress.get(value.userId);
    this.progress.set(value.userId, {...value,
      chambers:mergeChamberRecords(old?.chambers,chambers),
      unlockedLevel:Math.max(old?.unlockedLevel ?? 1, value.unlockedLevel),
      highestCompletedLevel:Math.max(old?.highestCompletedLevel ?? 0, value.highestCompletedLevel),
      bestScore:Math.max(old?.bestScore ?? 0, value.bestScore),
      completedRuns:Math.max(old?.completedRuns ?? 0, value.completedRuns),
      bestCompletionTime:Math.min(old?.bestCompletionTime ?? Infinity, value.bestCompletionTime ?? Infinity) === Infinity
        ? null : Math.min(old?.bestCompletionTime ?? Infinity, value.bestCompletionTime ?? Infinity),
    });
    return {persisted:false};
  }
  async submitAtlantisScore(result: AtlantisSubmission) {
    const user = await this.requireUser(result.userId); validateResult(result);
    const candidate: AtlantisEntry = {userId:user.id, displayName:user.displayName, score:result.score,
      highestCompletedLevel:result.highestCompletedLevel, completionTime:result.completed ? result.elapsedSeconds : null,
      achievedAt:new Date().toISOString(), rank:0};
    const old = this.rows.get(user.id);
    if (!old || compareAtlantisEntries(candidate, old) < 0) this.rows.set(user.id, candidate);
    return {persisted:false};
  }
}
