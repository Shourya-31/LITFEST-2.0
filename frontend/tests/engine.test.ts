import test from "node:test";
import assert from "node:assert/strict";
import {
  FLIGHT_SECONDS,
  RUN_ACCELERATION,
  START_SPEED,
  RunnerEngine,
  intersects,
} from "../src/features/game/engine.js";
import type { GameMode } from "../src/types/game.js";

function advance(game: RunnerEngine, seconds: number, fps = 60) {
  for (let i = 0; i < Math.round(seconds * fps); i++) game.update(1 / fps);
}

test("portrait play lane sits near the middle and hazards follow it when resizing", () => {
  for (const mode of ["surface", "underwater"] as GameMode[]) {
    const game = new RunnerEngine(mode, () => 0.1);
    game.start(); advance(game, 1.1);
    const obstacle = game.obstacles[0];
    const floorOffset = obstacle.y - game.ground;
    const distance = game.distance;
    game.resize(480, 760);
    assert.equal(game.ground, 760 * 0.58);
    assert.equal(obstacle.y - game.ground, floorOffset);
    assert.equal(game.distance, distance);
    assert.ok(game.playerBox.y > 760 * 0.45 && game.playerBox.y < 760 * 0.6);
    game.resize(960, 380);
    assert.equal(game.ground, 312);
    assert.equal(obstacle.y - game.ground, floorOffset);
  }
});

test("speed accelerates smoothly, stays capped, freezes on pause and resets", () => {
  for (const width of [480, 960]) {
    const game = new RunnerEngine("surface");
    game.resize(width, 380);
    game.start();
    assert.equal(game.speed, START_SPEED);
    advance(game, 0.5);
    assert.ok(Math.abs(game.speed - (START_SPEED + 0.5 * RUN_ACCELERATION)) < 0.001);
    game.pause();
    const speed = game.speed;
    advance(game, 1);
    assert.equal(game.speed, speed);
    // Distance thresholds unlock group variety without a sudden speed jump.
    game.distance = 299.99 * 12;
    assert.equal(game.level, 0);
    game.distance = 300 * 12;
    assert.equal(game.level, 1);
    assert.equal(game.speed, speed);
    game.elapsed = 1000;
    assert.equal(game.speed, Math.min(780, width * 1.12));
    game.start();
    assert.equal(game.speed, START_SPEED);
    assert.equal(game.metres, 0);
  }
});

test("release produces a shorter jump; holding never creates automatic jumps", () => {
  for (const fps of [30, 60, 144]) {
    const peaks = [true, false].map(short => {
      const game = new RunnerEngine("surface");
      game.start();
      game.jump();
      if (short) game.releaseJump();
      let peak = 0;
      for (let i = 0; i < fps * 0.8; i++) {
        game.update(1 / fps);
        peak = Math.max(peak, -game.playerY);
      }
      assert.equal(game.playerY, 0);
      return peak;
    });
    assert.ok(peaks[0] >= 30 && peaks[0] < 60);
    assert.ok(peaks[1] > 90 && peaks[1] < 110);
    assert.ok(peaks[1] - peaks[0] > 30);
  }
});

test("midair jump presses do not double jump or queue a jump on landing", () => {
  const game = new RunnerEngine("surface");
  game.start(); game.jump();
  advance(game, 0.45);
  const velocity = game.velocityY;
  game.jump();
  assert.equal(game.velocityY, velocity);
  advance(game, 0.3);
  assert.equal(game.playerY, 0);
  assert.equal(game.velocityY, 0);
});

test("ducking clears a low airborne hazard while standing collides, in both modes", () => {
  for (const mode of ["surface", "underwater"] as GameMode[]) {
    for (const duck of [false, true]) {
      const game = new RunnerEngine(mode);
      game.start(); game.setDuck(duck);
      game.obstacles.push({x: game.playerX - 10, y: game.ground - 68, w: 80, h: 34,
        kind: mode === "surface" ? "cloud" : "shark", variant: 0.5});
      game.update(1 / 60);
      assert.equal(game.state, duck ? "running" : "over");
      if (duck) {
        game.jump();
        assert.equal(game.velocityY, 0, "jump is blocked while duck is held");
        game.setDuck(false);
        assert.equal(game.ducking, false);
      }
    }
  }
});

test("Down in midair speeds up landing; pause and restart clear held input", () => {
  const normal = new RunnerEngine("surface"), fast = new RunnerEngine("surface");
  for (const game of [normal, fast]) { game.start(); game.jump(); advance(game, 0.2); }
  fast.setDuck(true);
  advance(fast, 0.16); advance(normal, 0.16);
  assert.equal(fast.playerY, 0);
  assert.ok(normal.playerY < -70);
  assert.equal(fast.ducking, true);
  fast.pause(); fast.resume();
  assert.equal(fast.ducking, false);
  fast.setDuck(true); fast.start();
  assert.equal(fast.ducking, false);
  fast.jump(); assert.ok(fast.velocityY < 0);
});
function seededRandom(seed: number) {
  return () => {
    seed = (seed * 1664525 + 1013904223) >>> 0;
    return seed / 4294967296;
  };
}
test("jump returns to the floor and ignores repeated airborne input", () => {
  const game = new RunnerEngine("surface");
  game.start();
  game.jump();
  advance(game, 0.2);
  assert.ok(game.playerY < -70);
  const velocity = game.velocityY;
  game.jump();
  assert.equal(game.velocityY, velocity);
  advance(game, 0.7);
  assert.equal(game.playerY, 0);
  assert.equal(game.velocityY, 0);
});
test("pause freezes time and score; resume and restart have distinct behavior", () => {
  const game = new RunnerEngine("surface");
  game.start();
  advance(game, 1);
  const score = game.score;
  assert.ok(score > 0);
  game.pause();
  advance(game, 2);
  assert.equal(game.score, score);
  assert.equal(game.elapsed < 1.01, true);
  game.resume();
  advance(game, 0.3);
  assert.ok(game.score > score);
  game.start();
  assert.equal(game.score, 0);
  assert.equal(game.obstacles.length, 0);
  assert.equal(game.playerY, 0);
});
test("score and distance are stable across 30, 60, and 144 Hz", () => {
  const games = [30, 60, 144].map((fps) => {
    const game = new RunnerEngine("surface", () => 0.2);
    game.start();
    advance(game, 0.9, fps);
    assert.equal(game.obstacles.length, 0);
    advance(game, 0.1, fps);
    assert.equal(game.obstacles.length, 1);
    assert.ok(
      game.obstacles[0].x < game.width,
      "first obstacle is visible at one second",
    );
    advance(game, 0.5, fps);
    return game;
  });
  assert.equal(games[0].score, games[1].score);
  assert.equal(games[1].score, games[2].score);
  assert.ok(Math.abs(games[0].distance - games[2].distance) < 0.1);
});
test("stalled frames and invalid deltas cannot teleport the player", () => {
  const game = new RunnerEngine("surface");
  game.start();
  game.update(20);
  assert.ok(game.elapsed <= 0.101);
  const d = game.distance;
  game.update(NaN);
  game.update(-1);
  assert.equal(game.distance, d);
});
test("hitboxes use strict overlap, not touching edges", () => {
  const a = { x: 0, y: 0, w: 10, h: 10 };
  assert.equal(intersects(a, { ...a, x: 10 }), false);
  assert.equal(intersects(a, { ...a, x: 9 }), true);
});
for (const mode of ["surface", "underwater"] as GameMode[]) {
  test(`${mode}: collision ends a run, score stops, and restart resets`, () => {
    const game = new RunnerEngine(mode, () => 0.1);
    game.start();
    advance(game, 8);
    assert.equal(game.state, "over");
    const score = game.score;
    advance(game, 5);
    assert.equal(game.score, score);
    game.start();
    assert.equal(game.state, "running");
    assert.equal(game.score, 0);
  });
  test(`${mode}: ground obstacle can be jumped and an airborne obstacle passed underneath`, () => {
    const game = new RunnerEngine(mode);
    game.start();
    game.obstacles.push({
      x: game.playerX + 75,
      y: game.ground - 45,
      w: 40,
      h: 45,
      kind: mode === "surface" ? "wave" : "coral",
      variant: 0.8,
    });
    game.jump();
    advance(game, 1);
    assert.equal(game.state, "running");
    game.obstacles = [
      {
        x: game.playerX + 30,
        y: game.ground - 108,
        w: 88,
        h: 34,
        kind: mode === "surface" ? "cloud" : "shark",
        variant: 0.2,
      },
    ];
    advance(game, 1);
    assert.equal(game.state, "running");
    game.obstacles = [
      {
        x: game.playerX + 30,
        y: game.ground - 108,
        w: 88,
        h: 34,
        kind: mode === "surface" ? "cloud" : "shark",
        variant: 0.2,
      },
    ];
    game.jump();
    // Observe the whole jump, including descent into the airborne hazard.
    advance(game, 0.9);
    assert.equal(game.state, "over");
    assert.equal(game.collision?.kind, mode === "surface" ? "cloud" : "shark");
  });
  for (const width of [480, 960]) {
    test(`${mode}: fair spacing permits a timed run for 120 seconds at width ${width}`, () => {
      for (const seed of [8, 31, 1234]) {
        const game = new RunnerEngine(mode, seededRandom(seed));
        game.resize(width, 380);
        game.start();
        let lastSpawn = -10;
        let lastDistance = 0;
        let spawns = 0;
        const seen = new Set<number>();
        const sizes = new Set<number>();
        const heights: number[] = [];
        for (let i = 0; i < 120 * 120; i++) {
          const lowAir = game.obstacles.find(o =>
            (o.kind === "cloud" || o.kind === "shark") &&
            o.y + o.h > game.ground - 57 &&
            o.x + o.w >= game.playerX - 18 &&
            o.x - game.playerX <= game.speed * 0.4,
          );
          game.setDuck(Boolean(lowAir));
          const obstacle = game.obstacles.find(
            (o) =>
              o.x + o.w >= game.playerX - 13 &&
              (o.kind === "wave" || o.kind === "coral"),
          );
          if (
            obstacle &&
            obstacle.x - (game.playerX + 14) <= game.speed * 0.2 &&
            obstacle.x > game.playerX
          )
            game.jump();
          game.update(1 / 120);
          const newGroups = new Set(
            game.obstacles
              .filter((o) => o.groupId && !seen.has(o.groupId))
              .map((o) => o.groupId!),
          );
          for (const id of newGroups) {
            seen.add(id);
            const group = game.obstacles.filter((o) => o.groupId === id);
            if (group[0].kind === "wave") {
              sizes.add(group.length);
              heights.push(...group.map((o) => o.h));
            }
            assert.ok(game.elapsed - lastSpawn >= FLIGHT_SECONDS + 0.18);
            lastSpawn = game.elapsed;
            spawns++;
          }
          assert.equal(
            game.state,
            "running",
            `seed ${seed} failed at ${game.elapsed.toFixed(2)}s: ${game.collision?.kind}`,
          );
          assert.ok(game.distance >= lastDistance);
          lastDistance = game.distance;
        }
        assert.ok(spawns > 45);
        assert.ok(game.speed <= Math.min(780, width * 1.12));
        assert.ok(game.score > 2000);
        if (mode === "surface") {
          assert.deepEqual([...sizes].sort(), [1, 2, 3]);
          assert.ok(Math.max(...heights) - Math.min(...heights) > 20);
        }
      }
    });
  }
}
