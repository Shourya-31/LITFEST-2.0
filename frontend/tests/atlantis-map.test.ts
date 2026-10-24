import test from "node:test";
import assert from "node:assert/strict";
import { MAP_HEIGHT, MAP_NODES, MAP_SEGMENTS, MAP_WIDTH } from "../src/features/atlantis/map-config.js";
import { mapNodeState } from "../src/features/atlantis/map.js";
import { chamberStars, mergeChamberRecords } from "../src/features/atlantis/progress.js";
import { AtlantisRun } from "../src/features/atlantis/run.js";
import { MemoryAtlantisService } from "../src/features/atlantis/service.js";
import type { AtlantisProgress } from "../src/features/atlantis/types.js";

const clear = (run:AtlantisRun,correct = run.level.questionCount) => {
  for (let i = 0; i < run.level.questionCount; i++) {
    run.answer(i < correct ? run.question.correctAnswer : (run.question.correctAnswer + 1) % 4); run.continue();
  }
};
test("the ten nodes and continuous cubic route share one scalable chart and descend through four zones",() => {
  assert.equal(MAP_NODES.length,10); assert.equal(MAP_SEGMENTS.length,9);
  const turns = new Set(MAP_SEGMENTS.map(segment => Math.sign(segment.end.x - segment.start.x)));
  assert.ok(turns.has(-1) && turns.has(1));
  for (const segment of MAP_SEGMENTS) {
    assert.match(segment.d,/^M \d+ \d+ C /);
    assert.equal(segment.start,MAP_NODES[segment.from - 1]); assert.equal(segment.end,MAP_NODES[segment.to - 1]);
    assert.ok(segment.end.y > segment.start.y);
    for (const point of [segment.start,segment.end,segment.c1,segment.c2]) {
      assert.ok(point.x > 0 && point.x < MAP_WIDTH); assert.ok(point.y > 0 && point.y < MAP_HEIGHT);
    }
  }
  for (let i = 1; i < MAP_SEGMENTS.length; i++) {
    const previous = MAP_SEGMENTS[i - 1], next = MAP_SEGMENTS[i];
    assert.ok(Math.abs((previous.end.x - previous.c2.x) - (next.c1.x - next.start.x)) < .02);
    assert.ok(Math.abs((previous.end.y - previous.c2.y) - (next.c1.y - next.start.y)) < .02);
  }
});
test("map entry cannot skip, replay completed chambers, resample a paused question or award duplicate scores",() => {
  const run = new AtlantisRun(); run.start("map"); run.pause();
  const questions = structuredClone(run.questions);
  for (const id of [0,2,10,11,NaN,1.5]) assert.equal(run.enterLevel(id),false);
  assert.equal(run.enterLevel(1),true); assert.deepEqual(run.questions,questions);
  run.tick(4); run.pause(); const time = run.remainingSeconds;
  assert.equal(run.enterLevel(1),true); assert.equal(run.remainingSeconds,time);
  run.answer(run.question.correctAnswer); const score = run.score;
  run.pause(); assert.equal(run.enterLevel(1),true); assert.equal(run.state,"feedback"); assert.equal(run.score,score);
  run.continue();
  for (let i = 1; i < 3; i++) {run.answer(run.question.correctAnswer); run.continue();}
  assert.equal(mapNodeState(run,1),"complete"); assert.equal(mapNodeState(run,2),"current"); assert.equal(mapNodeState(run,3),"locked");
  const clearedScore = run.score;
  assert.equal(run.enterLevel(1),false); assert.equal(run.enterLevel(3),false); assert.equal(run.score,clearedScore);
  assert.equal(run.enterLevel(2),true); assert.equal(run.level.id,2); assert.equal(run.highestCompletedLevel,1);
});
test("failed map entries retry only the current chamber with unused questions",() => {
  const run = new AtlantisRun(); run.start("retry-map"); clear(run); run.next();
  const ids = new Set(run.questions.map(question => question.id)); clear(run,0);
  assert.equal(run.chambers[2],undefined); assert.equal(run.enterLevel(3),false);
  assert.equal(run.enterLevel(2),true); assert.equal(run.highestCompletedLevel,1);
  assert.ok(run.questions.every(question => !ids.has(question.id)));
});
test("stars use exact accuracy thresholds and best records merge without mutation or regression",() => {
  for (const [correct,total,stars] of [[59,100,0],[60,100,1],[74,100,1],[75,100,2],[89,100,2],[90,100,3],[100,100,3], [2,3,1],[3,4,2],[3,5,1],[6,7,2]]) {
    assert.equal(chamberStars(correct,total),stars);
  }
  const old = {1:{stars:3 as const,bestScore:650,bestAccuracy:100}};
  const merged = mergeChamberRecords(old,{1:{stars:1,bestScore:280,bestAccuracy:2 / 3 * 100}});
  assert.deepEqual(merged,old); merged[1]!.bestScore = 0; assert.equal(old[1].bestScore,650);
  assert.throws(() => mergeChamberRecords({11:{stars:3,bestScore:100,bestAccuracy:100}}),/Invalid/);
  assert.throws(() => mergeChamberRecords({1:{stars:3,bestScore:650,bestAccuracy:60}}),/Invalid/);
});
test("earned records match passed chamber results and reset only with an explicit new expedition",() => {
  const run = new AtlantisRun(); run.start("stars"); clear(run,2);
  assert.equal(run.chambers[1]?.stars,1); assert.equal(run.chambers[1]?.bestScore,280);
  assert.equal(run.chambers[1]?.bestAccuracy,2 / 3 * 100);
  const record = structuredClone(run.chambers);
  run.pause(); run.enterLevel(2); assert.deepEqual(run.chambers,record);
  run.start("new"); assert.deepEqual(run.chambers,{}); assert.equal(run.highestCompletedLevel,0);
});
test("account chamber stars are optional, validated, deeply copied, monotonic, and isolated",async () => {
  let id = "a";
  const service = new MemoryAtlantisService({async getUser() {return {id,displayName:id};},async login() {}});
  const progress:AtlantisProgress = {userId:"a",unlockedLevel:2,highestCompletedLevel:1,bestScore:650,completedRuns:0,bestCompletionTime:null,
    chambers:{1:{stars:3,bestScore:650,bestAccuracy:100}}};
  assert.equal((await service.saveAtlantisProgress(progress)).persisted,false);
  progress.chambers![1]!.stars = 1;
  const loaded = (await service.getAtlantisProgress("a"))!; assert.equal(loaded.chambers?.[1]?.stars,3);
  loaded.chambers![1]!.bestScore = 0;
  await service.saveAtlantisProgress({...progress,chambers:{1:{stars:1,bestScore:280,bestAccuracy:2 / 3 * 100}}});
  assert.equal((await service.getAtlantisProgress("a"))?.chambers?.[1]?.bestScore,650);
  assert.equal((await service.getAtlantisProgress("a"))?.chambers?.[1]?.stars,3);
  await assert.rejects(service.saveAtlantisProgress({...progress,chambers:{2:{stars:3,bestScore:650,bestAccuracy:100}}}),/Invalid/);
  id = "b"; assert.equal(await service.getAtlantisProgress("b"),null);
  await assert.rejects(service.getAtlantisProgress("a"),/own account/);
});
