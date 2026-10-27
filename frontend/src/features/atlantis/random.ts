import type { AtlantisLevel, LiteraryQuestion } from "./types.js";

export function shuffle<T>(values: readonly T[], random: () => number = Math.random): T[] {
  const output = [...values];
  for (let i = output.length - 1; i > 0; i--) {
    const j = Math.floor(Math.max(0, Math.min(0.999999999, random())) * (i + 1));
    [output[i],output[j]] = [output[j],output[i]];
  }
  return output;
}
export function shuffleQuestion(question: LiteraryQuestion, random: () => number): LiteraryQuestion {
  const positions = shuffle([0,1,2,3],random);
  return {...question, options:positions.map(index => question.options[index]) as LiteraryQuestion["options"],
    correctAnswer:positions.indexOf(question.correctAnswer)};
}
/** Prefer unseen questions, with a chamber-appropriate difficulty mix. Attempts are sampled once. */
export function selectQuestions(bank: readonly LiteraryQuestion[], level: AtlantisLevel, seen: ReadonlySet<string>, random: () => number): LiteraryQuestion[] {
  const pool = bank.filter(question => question.level === level.id);
  if (pool.length < level.questionCount) throw new Error(`Not enough questions for chamber ${level.id}.`);
  const fresh = shuffle(pool.filter(question => !seen.has(question.id)),random);
  const selected: LiteraryQuestion[] = [];
  if (level.id >= 4 && level.id <= 7) {
    const easier = level.id === 7 ? "medium" : "easy";
    const target = level.id === 7 ? 2 : 1;
    selected.push(...fresh.filter(question => question.difficulty === easier).slice(0,target));
    const harder = level.id === 7 ? "hard" : "medium";
    for (const question of fresh.filter(question => question.difficulty === harder)) {
      if (selected.length === level.questionCount) break;
      selected.push(question);
    }
  }
  for (const question of fresh) if (selected.length < level.questionCount && !selected.some(chosen => chosen.id === question.id)) selected.push(question);
  if (selected.length < level.questionCount) {
    for (const question of shuffle(pool.filter(question => seen.has(question.id)),random)) {
      if (selected.length === level.questionCount) break;
      selected.push(question);
    }
  }
  return shuffle(selected,random).map(question => shuffleQuestion(question,random));
}
