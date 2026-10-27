import test from "node:test";
import assert from "node:assert/strict";
import { hitsObstacle } from "../src/features/game/collisions.js";
import type { Obstacle } from "../src/features/game/engine.js";

const hazard = (kind: Obstacle["kind"], variant = 0.5): Obstacle => ({
  kind,
  variant,
  x: 0,
  y: 0,
  w: 96,
  h: 96,
});

test("wave face collides while empty corners and the hollow curl are clear", () => {
  const wave = hazard("wave");
  assert.equal(hitsObstacle({ x: 0, y: 0, w: 12, h: 12 }, wave), false);
  assert.equal(hitsObstacle({ x: 41, y: 30, w: 10, h: 20 }, wave), true);
  assert.equal(hitsObstacle({ x: 65, y: 37, w: 5, h: 10 }, wave), false);
});
test("airborne collision bodies exclude cloud corners, rain, shark fins, and tail tips", () => {
  const cloud = hazard("cloud"),
    shark = hazard("shark");
  assert.equal(hitsObstacle({ x: 1, y: 1, w: 6, h: 5 }, cloud), false);
  assert.equal(hitsObstacle({ x: 30, y: 40, w: 8, h: 8 }, cloud), true);
  assert.equal(hitsObstacle({ x: 30, y: 100, w: 8, h: 8 }, cloud), false);
  assert.equal(hitsObstacle({ x: 40, y: -15, w: 6, h: 8 }, shark), false);
  assert.equal(hitsObstacle({ x: 86, y: 3, w: 5, h: 8 }, shark), false);
  assert.equal(hitsObstacle({ x: 30, y: 35, w: 10, h: 10 }, shark), true);
});
test("coral follows the branch, tapered fan, or rounded colony rather than a bounding rectangle", () => {
  const staghorn = hazard("coral", 0.15),
    fan = hazard("coral", 0.5),
    brain = hazard("coral", 0.85);
  assert.equal(hitsObstacle({ x: 0, y: 0, w: 6, h: 8 }, staghorn), false);
  assert.equal(hitsObstacle({ x: 35, y: 78, w: 7, h: 10 }, staghorn), true);
  assert.equal(hitsObstacle({ x: 8, y: 72, w: 10, h: 10 }, fan), false);
  assert.equal(hitsObstacle({ x: 40, y: 35, w: 10, h: 10 }, fan), true);
  assert.equal(hitsObstacle({ x: 5, y: 4, w: 5, h: 5 }, brain), false);
  assert.equal(hitsObstacle({ x: 40, y: 40, w: 10, h: 10 }, brain), true);
  brain.x = 200;
  assert.equal(hitsObstacle({ x: 40, y: 40, w: 10, h: 10 }, brain), false);
  assert.equal(hitsObstacle({ x: 240, y: 40, w: 10, h: 10 }, brain), true);
});
