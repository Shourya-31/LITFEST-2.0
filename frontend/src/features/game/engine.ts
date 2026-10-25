import type { GameMode } from "../../types/game.js";
import { hitsObstacle } from "./collisions.js";

export type RunState = "ready" | "running" | "paused" | "over";
export interface Rect {
  x: number;
  y: number;
  w: number;
  h: number;
}
export interface Obstacle extends Rect {
  kind: "wave" | "cloud" | "coral" | "shark";
  variant: number;
  groupId?: number;
}
// Dino-style dynamics expressed in seconds, tuned for the existing ocean artwork.
export const GRAVITY = 2160;
export const JUMP_VELOCITY = -600;
export const FLIGHT_SECONDS = (-2 * JUMP_VELOCITY) / GRAVITY;
export const RUN_ACCELERATION = 3.6;
export const START_SPEED = 400;
const MIN_JUMP_HEIGHT = 30;
const RELEASE_VELOCITY = -300;
const FIRST_OBSTACLE_DELAY = 1;
export const intersects = (a: Rect, b: Rect): boolean =>
  a.x < b.x + b.w && a.x + a.w > b.x && a.y < b.y + b.h && a.y + a.h > b.y;

/** Pure simulation: world units and seconds, independent of Canvas and DOM. */
export class RunnerEngine {
  state: RunState = "ready";
  width = 960;
  height = 380;
  distance = 0;
  elapsed = 0;
  playerY = 0;
  velocityY = 0;
  obstacles: Obstacle[] = [];
  collision: Obstacle | null = null;
  private jumpReleased = false;
  private duckHeld = false;
  private speedDrop = false;
  private untilSpawn = FIRST_OBSTACLE_DELAY;
  private nextGroupId = 0;
  mode: GameMode;
  private random: () => number;
  constructor(
    mode: GameMode,
    random: () => number = Math.random,
  ) {
    this.mode = mode;
    this.random = random;
  }
  get ground(): number {
    // Tall mobile scenes keep the play lane near the middle, with water below it.
    return this.height > this.width ? this.height * 0.58 : this.height - 68;
  }
  get playerX(): number {
    return Math.max(64, this.width * 0.13);
  }
  get score(): number {
    return this.metres;
  }
  get metres(): number {
    return Math.floor(this.distance / 12);
  }
  get difficulty(): number {
    return Math.min(1, (this.speed - START_SPEED) / (780 - START_SPEED) + this.level * 0.04);
  }
  get level(): number {
    return Math.floor(this.metres / 300);
  }
  get speed(): number {
    const ceiling = Math.min(780, this.width * 1.12);
    return Math.min(ceiling, START_SPEED + this.elapsed * RUN_ACCELERATION);
  }
  get ducking(): boolean {
    return this.duckHeld && this.playerY === 0 && this.velocityY === 0;
  }
  get playerBox(): Rect {
    if (this.ducking) return {
      x: this.playerX - 18,
      y: this.ground - 30,
      w: 36,
      h: 25,
    };
    return {
      x: this.playerX - 13,
      y: this.ground + this.playerY - 57,
      w: 27,
      h: 52,
    };
  }
  resize(width: number, height: number): void {
    const oldGround = this.ground;
    this.width = width;
    this.height = height;
    for (const obstacle of this.obstacles)
      obstacle.y += this.ground - oldGround;
  }
  start(): void {
    this.distance = 0;
    this.elapsed = 0;
    this.playerY = 0;
    this.velocityY = 0;
    this.obstacles = [];
    this.collision = null;
    this.clearInput();
    this.untilSpawn = FIRST_OBSTACLE_DELAY;
    this.nextGroupId = 0;
    this.state = "running";
  }
  pause(): void {
    this.clearInput();
    if (this.state === "running") this.state = "paused";
  }
  resume(): void {
    if (this.state === "paused") this.state = "running";
  }
  jump(): void {
    if (this.state !== "running" || this.duckHeld || this.playerY !== 0 || this.velocityY !== 0) return;
    this.velocityY = JUMP_VELOCITY - this.speed * 0.1;
    this.jumpReleased = false;
    this.speedDrop = false;
  }
  releaseJump(): void {
    this.jumpReleased = true;
  }
  setDuck(held: boolean): void {
    this.duckHeld = held && this.state === "running";
    if (this.duckHeld && this.playerY < 0 && !this.speedDrop) {
      this.speedDrop = true;
      this.velocityY = Math.max(60, this.velocityY);
    }
  }
  private clearInput(): void {
    this.jumpReleased = false;
    this.duckHeld = false;
    this.speedDrop = false;
  }
  update(delta: number): void {
    if (this.state !== "running" || !Number.isFinite(delta) || delta <= 0)
      return;
    // Substeps prevent tunneling; a long stalled frame never advances an entire run.
    let remaining = Math.min(delta, 0.1);
    while (remaining > 0 && this.state === "running") {
      const dt = Math.min(remaining, 1 / 240);
      remaining -= dt;
      const beforeSpeed = this.speed;
      this.elapsed += dt;
      const stepSpeed = (beforeSpeed + this.speed) / 2;
      this.distance += stepSpeed * dt;
      if (this.jumpReleased && -this.playerY >= MIN_JUMP_HEIGHT && this.velocityY < RELEASE_VELOCITY)
        this.velocityY = RELEASE_VELOCITY;
      const fallMultiplier = this.speedDrop ? 3 : 1;
      this.playerY = Math.min(0, this.playerY + (this.velocityY * dt + GRAVITY * dt * dt / 2) * fallMultiplier);
      this.velocityY += GRAVITY * dt;
      if (this.playerY === 0) {
        this.velocityY = 0;
        this.speedDrop = false;
      }
      for (const obstacle of this.obstacles) obstacle.x -= stepSpeed * dt;
      this.obstacles = this.obstacles.filter(
        (obstacle) => obstacle.x + obstacle.w > -20,
      );
      this.untilSpawn -= dt;
      if (this.untilSpawn <= 1e-9) {
        const groupWidth = this.spawn();
        // Random spatial gaps grow with speed and the width of the whole set.
        // Keep time to land and react, including a tall held jump at this speed.
        const flightTime = -2 * (JUMP_VELOCITY - this.speed * 0.1) / GRAVITY;
        const minGap = Math.max(this.speed * (flightTime + 0.18), groupWidth * (this.speed / 60) + 72);
        this.untilSpawn = (groupWidth + minGap * (1 + this.random() * 0.5)) / this.speed;
      }
      this.collision =
        this.obstacles.find((obstacle) =>
          hitsObstacle(this.playerBox, obstacle),
        ) ?? null;
      if (this.collision) {
        this.state = "over";
        this.clearInput();
      }
    }
  }
  private spawn(): number {
    const groupId = ++this.nextGroupId;
    // Put the first hazard at the visible edge so it appears at one second,
    // instead of adding an off-screen travel delay to the opening wait.
    const spawnX = this.width + (groupId === 1 ? -1 : 24);
    const airborne = this.level >= 1 && this.random() > 0.76 - this.difficulty * 0.12;
    if (airborne) {
      const variant = this.random();
      const w = this.mode === "surface" ? 70 : 88;
      this.obstacles.push({
        x: spawnX,
        y: this.ground - (variant < 0.33 ? 68 : variant < 0.67 ? 108 : 160),
        w,
        h: 34,
        variant,
        groupId,
        kind: this.mode === "surface" ? "cloud" : "shark",
      });
      return w;
    }
    let count = 1;
    if (
      this.mode === "surface" &&
      this.level >= 1 &&
      this.random() < 0.25 + this.difficulty * 0.45
    ) {
      count =
        this.level >= 2 && this.random() < 0.2 + this.difficulty * 0.35 ? 3 : 2;
    }
    if (
      this.mode === "underwater" &&
      this.level >= 3 &&
      this.random() < 0.1 + this.difficulty * 0.25
    )
      count = 2;
    const gap = count > 1 ? 5 + this.random() * 3 : 0;
    const variants = Array.from({ length: count }, () => this.random());
    const widths = variants.map((variant) => 34 + variant * 26);
    const desiredWidth = widths.reduce((total, width) => total + width, 0);
    // A whole set fits inside the safe part of one jump, even on a narrow screen.
    const widthBudget = Math.max(60, this.speed * 0.26 - 27);
    const scale = Math.min(1, (widthBudget - gap * (count - 1)) / desiredWidth);
    let x = spawnX;
    for (let i = 0; i < count; i++) {
      const w = widths[i] * scale;
      const h =
        this.mode === "surface"
          ? 28 + this.random() * (22 + this.difficulty * 14)
          : 30 + this.random() * (17 + this.difficulty * 11);
      this.obstacles.push({
        x,
        y: this.ground - h,
        w,
        h,
        variant: variants[i],
        groupId,
        kind: this.mode === "surface" ? "wave" : "coral",
      });
      x += w + gap;
    }
    return x - gap - spawnX;
  }
}
