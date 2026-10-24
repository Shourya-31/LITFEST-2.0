import test from "node:test";
import assert from "node:assert/strict";
import { MockGameService } from "../src/services/game-service.js";
import { developmentAuth } from "../src/services/auth.js";

test("development authentication stays signed out and reports pending integration", async () => {
  assert.equal(await developmentAuth.getUser(), null);
  await assert.rejects(developmentAuth.login(), /integration is pending/);
});
test("guests cannot submit or acquire saved progress", async () => {
  const service = new MockGameService(async () => null);
  const before = await service.getLeaderboard();
  await assert.rejects(
    service.submitScore(99999),
    /Guests cannot submit/,
  );
  assert.equal(await service.getMyBestScore(), null);
  assert.deepEqual(await service.getLeaderboard(), before);
  assert.equal(before.source, "mock");
  assert.equal(before.currentPlayer, null);
});
test("authenticated mock keeps one highest score per account and rejects invalid scores", async () => {
  const service = new MockGameService(async () => ({
    id: "test-user",
    displayName: "<b>Reef Explorer</b>",
  }));
  await service.submitScore(1500);
  await service.submitScore(100);
  assert.equal(await service.getMyBestScore(), 1500);
  const board = await service.getLeaderboard();
  assert.equal(board.currentPlayer?.rank, 1);
  assert.equal(board.currentPlayer?.score, 1500);
  assert.ok(!Number.isNaN(Date.parse(board.currentPlayer!.achievedAt)));
  await service.submitScore(5);
  assert.equal((await service.getLeaderboard()).currentPlayer?.rank, 1);
  await service.submitScore(1800);
  const improved = await service.getLeaderboard();
  assert.equal(improved.currentPlayer?.score, 1800);
  assert.equal(improved.entries.filter(row => row.userId === "test-user").length, 1);
  for (const score of [-1, NaN, Infinity, 1.5])
    await assert.rejects(
      service.submitScore(score),
      /Invalid score/,
    );
  board.entries[0].score = 99999;
  assert.equal(await service.getMyBestScore(), 1800);
});
test("mock progress is not persisted across service instances", async () => {
  const getUser = async () => ({ id: "test-user", displayName: "Tester" });
  const first = new MockGameService(getUser);
  await first.submitScore(2000);
  const second = new MockGameService(getUser);
  assert.equal(await second.getMyBestScore(), 0);
});

test("accounts keep distinct ranks and bests even when their display names match", async () => {
  let user = { id: "first", displayName: "Explorer" };
  const service = new MockGameService(async () => user);
  await service.submitScore(1600);
  user = { id: "second", displayName: "Explorer" };
  assert.equal(await service.getMyBestScore(), 0);
  await service.submitScore(2000);
  assert.equal((await service.getLeaderboard()).currentPlayer?.rank, 1);
  user = { id: "first", displayName: "Explorer" };
  assert.equal(await service.getMyBestScore(), 1600);
  assert.equal((await service.getLeaderboard()).currentPlayer?.rank, 2);
  assert.equal((await service.getLeaderboard()).entries.filter(row => row.displayName === "Explorer").length, 2);
});
