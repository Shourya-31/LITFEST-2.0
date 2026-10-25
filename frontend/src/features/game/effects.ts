import { line, oval, shape, TAU, wrap, type Context } from "./art.js";
import { GRAVITY, JUMP_VELOCITY, type RunnerEngine } from "./engine.js";

/** Bounded, analytic particles: no accumulating arrays, timers, or random game input. */
export function drawWake(c: Context, game: RunnerEngine, t: number): void {
  if (game.state === "ready" || game.state === "over") return;
  const under = game.mode === "underwater";
  const x = game.playerX,
    y = game.ground + game.playerY;
  if (under) {
    for (let i = 0; i < 10; i++) {
      const age = wrap(t * 0.7 + i / 10, 1);
      const px = x - 35 - age * 65;
      const py = y - 5 - age * 28 + Math.sin(i * 3 + t) * 3;
      c.globalAlpha = (1 - age) * 0.7;
      line(c, "#c7fff0", 1, () => c.arc(px, py, 1.2 + age * 2.3, 0, TAU));
      oval(c, px - 0.5, py - 0.5, 0.5, 0.5, "#f1fff4");
    }
    c.globalAlpha = 1;
  } else if (game.playerY >= -1) {
    oval(c, x - 16, game.ground + 4, 42, 3.5, "#dafded3d");
    for (let i = 0; i < 12; i++) {
      const age = wrap(t * 2 + i / 12, 1);
      c.globalAlpha = (1 - age) * 0.8;
      const px = x - 27 - age * (25 + (i % 3) * 12);
      const py = game.ground - Math.sin(age * Math.PI) * (5 + (i % 4) * 3);
      oval(c, px, py, 1.7 - age, 1.3, "#e8fff3");
    }
    c.globalAlpha = 1;
  }
  if (!under && game.playerY < -1) {
    const jumpAge = (game.velocityY - JUMP_VELOCITY) / GRAVITY;
    if (jumpAge >= 0 && jumpAge < 0.3) {
      c.globalAlpha = 1 - jumpAge / 0.3;
      line(c, "#c9ffeb", 2, () =>
        c.ellipse(
          x - jumpAge * game.speed,
          game.ground + 3,
          18 + jumpAge * 50,
          3 + jumpAge * 5,
          0,
          0,
          TAU,
        ),
      );
      c.globalAlpha = 1;
    }
  }
}

export function drawImpact(c: Context, game: RunnerEngine, age: number): void {
  if (age < 0 || age >= 0.55) return;
  const x = game.playerX,
    y = game.ground + game.playerY - 29;
  c.save();
  c.globalAlpha = Math.max(0, 1 - age / 0.55);
  line(c, "#e5fff1", 2 * (1 - age), () => c.arc(x, y, 10 + age * 75, 0, TAU));
  for (let i = 0; i < 12; i++) {
    const angle = (i / 12) * TAU;
    const travel = 10 + age * (48 + (i % 3) * 22);
    const px = x + Math.cos(angle) * travel;
    const py = y + Math.sin(angle) * travel + age * age * 60;
    const radius = 2.4 * (1 - age);
    if (i % 3) oval(c, px, py, radius, radius, i % 2 ? "#d6fff0" : "#ffcc90");
    else
      shape(c, "#f4fff3", () => {
        c.moveTo(px, py - radius * 2);
        c.lineTo(px + radius, py);
        c.lineTo(px, py + radius * 2);
        c.lineTo(px - radius, py);
      });
  }
  c.restore();
}

export function drawCollisionMarker(c: Context, game: RunnerEngine): void {
  const obstacle = game.collision;
  if (game.state !== "over" || !obstacle) return;
  c.save();
  const center = obstacle.x + obstacle.w / 2,
    top = obstacle.y - 12;
  shape(c, "#ffe2a1", () => {
    c.moveTo(center - 5, top - 6);
    c.lineTo(center + 5, top - 6);
    c.lineTo(center, top);
  });
  c.restore();
}
