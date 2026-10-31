import { ATLANTIS_LEVELS } from "./levels.js";
import type { AtlantisChamberRecords } from "./types.js";

export function chamberStars(correct: number, questions: number): 0 | 1 | 2 | 3 {
  const accuracy = correct / questions;
  return accuracy >= .9 ? 3 : accuracy >= .75 ? 2 : accuracy >= .6 ? 1 : 0;
}
/** Independent bests: a later expedition cannot lower a reader's stars or score. */
export function mergeChamberRecords(...sources: (AtlantisChamberRecords | undefined)[]): AtlantisChamberRecords {
  const merged: AtlantisChamberRecords = {};
  for (const source of sources) {
    if (source === undefined) continue;
    if (!source || typeof source !== "object" || Array.isArray(source)) throw new Error("Invalid Atlantis chamber records.");
    for (const [key, record] of Object.entries(source)) {
      const id = Number(key), level = ATLANTIS_LEVELS[id - 1];
      if (!level || !Number.isInteger(id) || String(id) !== key || !record
        || ![1,2,3].includes(record.stars) || !Number.isSafeInteger(record.bestScore) || record.bestScore < 0
        || record.bestScore > level.questionCount * 150 + 200 + (id === 10 ? 500 : 0)
        || !Number.isFinite(record.bestAccuracy) || record.bestAccuracy < 60 || record.bestAccuracy > 100
        || chamberStars(record.bestAccuracy,100) !== record.stars) throw new Error("Invalid Atlantis chamber records.");
      const old = merged[id];
      merged[id] = {stars:Math.max(old?.stars ?? 0,record.stars) as 1 | 2 | 3,
        bestScore:Math.max(old?.bestScore ?? 0,record.bestScore), bestAccuracy:Math.max(old?.bestAccuracy ?? 0,record.bestAccuracy)};
    }
  }
  return merged;
}
