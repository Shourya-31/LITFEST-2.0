import test from "node:test";
import assert from "node:assert/strict";
import { ATLANTIS_LEVELS, QUESTIONS_PER_RUN, QUESTION_SECONDS } from "../src/features/atlantis/levels.js";
import { QUESTION_BANK, MAX_ATLANTIS_SCORE } from "../src/features/atlantis/questions.js";
import { shuffleQuestion } from "../src/features/atlantis/random.js";
import { AtlantisRun } from "../src/features/atlantis/run.js";
import { MemoryAtlantisService, compareAtlantisEntries, validateResult } from "../src/features/atlantis/service.js";
import { MockGameService } from "../src/services/game-service.js";
import type { AtlantisEntry, AtlantisProgress } from "../src/features/atlantis/types.js";

function seeded(seed:number) { return () => ((seed = (seed * 1664525 + 1013904223) >>> 0) / 4294967296); }
function solveChamber(run:AtlantisRun, correct = run.level.questionCount) {
  for (let i = 0; i < run.level.questionCount; i++) {
    run.answer(i < correct ? run.question.correctAnswer : (run.question.correctAnswer + 1) % 4); run.continue();
  }
}
test("150 unique, complete literary questions cover all ten categories with four distinct options", () => {
  assert.equal(QUESTION_BANK.length,150);
  assert.equal(new Set(QUESTION_BANK.map(question => question.id)).size,150);
  assert.equal(new Set(QUESTION_BANK.map(question => question.question.toLowerCase())).size,150);
  assert.equal(new Set(QUESTION_BANK.map(question => question.category)).size,10);
  for (const question of QUESTION_BANK) {
    assert.equal(question.options.length,4);
    assert.equal(new Set(question.options.map(option => option.toLowerCase())).size,4,question.id);
    assert.ok(Number.isInteger(question.correctAnswer) && question.correctAnswer >= 0 && question.correctAnswer < 4);
    assert.ok(question.explanation.length > 20 && question.hint!.length > 30);
    assert.equal(question.category,ATLANTIS_LEVELS[question.level - 1].category);
  }
  for (const level of ATLANTIS_LEVELS) assert.equal(QUESTION_BANK.filter(question => question.level === level.id).length,15);
  const known = new Map([["Who wrote Pride and Prejudice?","Jane Austen"],["Who wrote The Great Gatsby?","F. Scott Fitzgerald"],
    ["Who wrote Gitanjali?","Rabindranath Tagore"],["Who wrote The Guide?","R. K. Narayan"],["Who wrote The Road Not Taken?","Robert Frost"]]);
  for (const [prompt,answer] of known) {
    const question = QUESTION_BANK.find(item => item.question === prompt)!;
    assert.equal(question.options[question.correctAnswer],answer);
  }
});
test("shuffling preserves the true answer and never mutates the source options", () => {
  const positions = new Set<number>();
  for (const question of QUESTION_BANK) for (let trial = 0; trial < 32; trial++) {
    const before = [...question.options], result = shuffleQuestion(question,seeded((trial * 2654435761) >>> 0));
    assert.equal(result.options[result.correctAnswer],question.options[question.correctAnswer]);
    assert.deepEqual(question.options,before); positions.add(result.correctAnswer);
  }
  assert.deepEqual([...positions].sort(),[0,1,2,3]);
});
test("clean runs sample 43 unique questions, vary by seed and keep active attempts stable", () => {
  assert.equal(QUESTIONS_PER_RUN,43);
  const signatures = new Set<string>();
  for (let seed = 1; seed <= 25; seed++) {
    const run = new AtlantisRun(seeded(seed)); run.start(`run-${seed}`);
    const ids:string[] = [];
    for (let chamber = 0; chamber < 10; chamber++) {
      assert.equal(run.remainingSeconds,QUESTION_SECONDS[run.question.difficulty]);
      const before = JSON.stringify(run.questions); run.tick(.01); run.pause(); run.resume();
      assert.equal(JSON.stringify(run.questions),before);
      if (run.level.id >= 4 && run.level.id <= 6) {
        assert.equal(run.questions.filter(question => question.difficulty === "easy").length,1);
        assert.equal(run.questions.filter(question => question.difficulty === "medium").length,3);
      }
      if (run.level.id === 7) assert.equal(run.questions.filter(question => question.difficulty === "medium").length,2);
      ids.push(...run.questions.map(question => question.id)); solveChamber(run); run.next();
    }
    assert.equal(ids.length,43); assert.equal(new Set(ids).size,43); signatures.add(ids.join(","));
    assert.equal(run.highestCompletedLevel,10); assert.equal(run.state,"victory");
  }
  assert.equal(signatures.size,25);
});
test("all chamber thresholds match 2/3, 3/4, 3/5, 5/7 and failure retries only the current chamber", () => {
  assert.deepEqual(ATLANTIS_LEVELS.map(level => level.requiredCorrect),[2,2,2,3,3,3,3,3,3,5]);
  for (let target = 0; target < 10; target++) {
    const run = new AtlantisRun(seeded(target + 1)); run.start("threshold");
    for (let i = 0; i < target; i++) {solveChamber(run); run.next();}
    solveChamber(run,run.level.requiredCorrect - 1);
    assert.equal(run.state,"failed"); assert.equal(run.highestCompletedLevel,target);
    const oldIds = new Set(run.questions.map(question => question.id));
    run.retry(); assert.equal(run.levelIndex,target);
    assert.ok(run.questions.every(question => !oldIds.has(question.id)));
    solveChamber(run,run.level.requiredCorrect);
    assert.equal(run.highestCompletedLevel,target + 1);
    assert.equal(run.state,target === 9 ? "victory" : "unlocked");
  }
});
test("answers lock, invalid selections do nothing, and bonuses cannot be awarded twice", () => {
  const run = new AtlantisRun(); run.start("lock");
  for (const value of [-1,4,NaN,1.5]) assert.equal(run.answer(value),null);
  const answer = run.question.correctAnswer; run.answer(answer);
  assert.equal(run.state,"feedback"); assert.equal(run.score,150);
  assert.equal(run.answer(answer),null); assert.equal(run.score,150);
  run.continue(); run.answer(run.question.correctAnswer); run.continue(); run.answer(run.question.correctAnswer);
  assert.equal(run.continue(),200); assert.equal(run.score,650);
  assert.equal(run.continue(),0); run.retry(); assert.equal(run.score,650);
  assert.equal(run.state,"unlocked");
});
test("question timers stop in feedback and pause; timeout is unanswered without a score penalty", () => {
  const run = new AtlantisRun(); run.start("time");
  assert.equal(run.remainingSeconds,25); run.tick(5); run.pause(); run.tick(500);
  assert.equal(run.remainingSeconds,20); run.resume(); run.tick(500);
  assert.equal(run.state,"feedback"); assert.equal(run.unansweredAnswers,1);
  assert.equal(run.wrongAnswers,0); assert.equal(run.score,0);
  assert.equal(run.feedback?.timedOut,true); const elapsed = run.elapsedSeconds;
  run.tick(10000); assert.equal(run.elapsedSeconds,elapsed);
  run.continue(); assert.equal(run.questionIndex,1); assert.equal(run.remainingSeconds,25);
  assert.equal(run.feedback,null);
});
test("wrong answers and once-per-question hints clamp score at zero; fast bonus decays", () => {
  const run = new AtlantisRun(); run.start("score");
  run.answer((run.question.correctAnswer + 1) % 4); assert.equal(run.score,0);
  run.continue(); run.hint(); assert.equal(run.hint(),false); assert.equal(run.score,0);
  run.tick(12.5); assert.equal(run.answer(run.question.correctAnswer)?.points,125);
  run.continue(); run.hint(); run.hint(); assert.equal(run.score,100);
  assert.equal(run.hintsUsed.size,2);
});
test("recycled retry questions cannot earn a second reward, even after the category pool is exhausted", () => {
  const run = new AtlantisRun(seeded(3)); run.start("retries");
  let repeated = 0;
  for (let attempt = 0; attempt < 30; attempt++) {
    const question = run.question, paid = run.rewardedQuestions.has(question.id);
    const outcome = run.answer(question.correctAnswer)!;
    assert.equal(outcome.points,paid ? 0 : 150);
    if (paid) repeated++;
    run.continue();
    for (let i = 0; i < 2; i++) {run.answer((run.question.correctAnswer + 1) % 4); run.continue();}
    assert.equal(run.state,"failed"); run.retry();
  }
  assert.ok(repeated > 0); assert.ok(run.rewardedQuestions.size <= 15);
});
test("a perfect 43-question expedition scores 8950 and produces valid literary result stats", () => {
  const run = new AtlantisRun(); run.start("perfect");
  for (let i = 0; i < 10; i++) {solveChamber(run); run.next();}
  assert.equal(run.score,8950); assert.equal(run.correctAnswers,43); assert.equal(run.accuracy,100);
  assert.equal(run.result().completed,true); assert.doesNotThrow(() => validateResult(run.result()));
  run.start("reset"); assert.equal(run.score,0); assert.equal(run.highestCompletedLevel,0);
  assert.equal(run.rewardedQuestions.size,0); assert.equal(run.hintsUsed.size,0);
  assert.equal(MAX_ATLANTIS_SCORE,25000);
});
test("Atlantis ranking remains ordered by score, chambers, then finished time", () => {
  const row:AtlantisEntry = {userId:"a",displayName:"A",rank:0,score:100,highestCompletedLevel:2,completionTime:null,achievedAt:"2026-01-01"};
  const rows = [row,{...row,userId:"b",score:200},{...row,userId:"c",highestCompletedLevel:10,completionTime:100},{...row,userId:"d",highestCompletedLevel:10,completionTime:90}];
  assert.deepEqual(rows.sort(compareAtlantisEntries).map(entry => entry.userId),["b","d","c","a"]);
});
test("guest writes are rejected and literary scores stay separate from Ocean Rush", async () => {
  let user:{id:string;displayName:string}|null = null;
  const auth = {async getUser() {return user;},async login() {}};
  const service = new MemoryAtlantisService(auth), surfer = new MockGameService(() => auth.getUser());
  const run = new AtlantisRun(); run.start("service"); solveChamber(run);
  await assert.rejects(service.submitAtlantisScore({...run.result(),userId:"a"}),/Sign in/);
  user = {id:"a",displayName:"Reader"}; await surfer.submitScore(9999);
  assert.deepEqual((await service.getAtlantisLeaderboard()).entries,[]);
  assert.equal((await service.submitAtlantisScore({...run.result(),userId:"a"})).persisted,false);
  assert.equal((await service.getAtlantisLeaderboard()).currentPlayer?.score,650);
  assert.equal(await surfer.getMyBestScore(),9999);
  user = {id:"b",displayName:"Other"};
  await assert.rejects(service.submitAtlantisScore({...run.result(),userId:"a"}),/own account/);
});
test("progress remains account scoped, monotonic, temporary and validates new score limits", async () => {
  const auth = {async getUser() {return {id:"a",displayName:"A"};},async login() {}};
  const service = new MemoryAtlantisService(auth);
  const progress:AtlantisProgress = {userId:"a",unlockedLevel:3,highestCompletedLevel:2,bestScore:1300,completedRuns:0,bestCompletionTime:null};
  assert.equal((await service.saveAtlantisProgress(progress)).persisted,false);
  progress.bestScore = 0; assert.equal((await service.getAtlantisProgress("a"))?.bestScore,1300);
  await service.saveAtlantisProgress({...progress,unlockedLevel:1,highestCompletedLevel:0});
  assert.equal((await service.getAtlantisProgress("a"))?.unlockedLevel,3);
  await assert.rejects(service.getAtlantisProgress("b"),/own account/);
  assert.equal(await new MemoryAtlantisService(auth).getAtlantisProgress("a"),null);
  const run = new AtlantisRun(); run.start("invalid");
  await assert.rejects(service.submitAtlantisScore({...run.result(),userId:"a",score:Infinity}),/Invalid/);
});
