import type { AquaSplashState, PieceName } from "./types.js";

/** Standard Tetris piece definitions: each rotation is a list of [row, col] offsets. */
const PIECES: Record<PieceName, number[][][]> = {
  I: [
    [[0, 0], [0, 1], [0, 2], [0, 3]],
    [[0, 0], [1, 0], [2, 0], [3, 0]],
    [[0, 0], [0, 1], [0, 2], [0, 3]],
    [[0, 0], [1, 0], [2, 0], [3, 0]],
  ],
  O: [
    [[0, 0], [0, 1], [1, 0], [1, 1]],
    [[0, 0], [0, 1], [1, 0], [1, 1]],
    [[0, 0], [0, 1], [1, 0], [1, 1]],
    [[0, 0], [0, 1], [1, 0], [1, 1]],
  ],
  T: [
    [[0, 0], [0, 1], [0, 2], [1, 1]],
    [[0, 0], [1, 0], [2, 0], [1, 1]],
    [[1, 0], [1, 1], [1, 2], [0, 1]],
    [[0, 0], [1, 0], [2, 0], [1, -1]],
  ],
  S: [
    [[0, 1], [0, 2], [1, 0], [1, 1]],
    [[0, 0], [1, 0], [1, 1], [2, 1]],
    [[0, 1], [0, 2], [1, 0], [1, 1]],
    [[0, 0], [1, 0], [1, 1], [2, 1]],
  ],
  Z: [
    [[0, 0], [0, 1], [1, 1], [1, 2]],
    [[0, 1], [1, 0], [1, 1], [2, 0]],
    [[0, 0], [0, 1], [1, 1], [1, 2]],
    [[0, 1], [1, 0], [1, 1], [2, 0]],
  ],
  J: [
    [[0, 0], [1, 0], [1, 1], [1, 2]],
    [[0, 0], [0, 1], [1, 0], [2, 0]],
    [[0, 0], [0, 1], [0, 2], [1, 2]],
    [[0, 0], [1, 0], [2, 0], [2, -1]],
  ],
  L: [
    [[0, 2], [1, 0], [1, 1], [1, 2]],
    [[0, 0], [1, 0], [2, 0], [2, 1]],
    [[0, 0], [0, 1], [0, 2], [1, 0]],
    [[0, 0], [0, 1], [1, 1], [2, 1]],
  ],
};

export const PIECE_COLORS: Record<PieceName, string> = {
  I: "#00e5ff",
  O: "#ffd740",
  T: "#e040fb",
  S: "#69f0ae",
  Z: "#ff5252",
  J: "#448aff",
  L: "#ff9100",
};

export const PIECE_GLOW: Record<PieceName, string> = {
  I: "#80f0ff",
  O: "#ffecb3",
  T: "#ea80fc",
  S: "#b9f6ca",
  Z: "#ff8a80",
  J: "#82b1ff",
  L: "#ffcc80",
};

const PIECE_NAMES: PieceName[] = ["I", "O", "T", "S", "Z", "J", "L"];
const COLS = 10;
const ROWS = 20;

function dropInterval(level: number): number {
  const speeds = [800, 720, 630, 550, 470, 380, 300, 220, 140, 100, 80, 80, 80, 70, 70, 70, 50, 50, 50, 30];
  return speeds[Math.min(level, speeds.length - 1)];
}

export interface ActivePiece {
  name: PieceName;
  rotation: number;
  row: number;
  col: number;
}

export class AquaTetrisEngine {
  readonly cols = COLS;
  readonly rows = ROWS;
  grid: (PieceName | 0)[][] = [];
  state: AquaSplashState = "ready";
  score = 0;
  highScore = 125000;
  level = 1;
  linesCleared = 0;
  credits = 2; // Starting arcade credits

  current: ActivePiece | null = null;
  heldPiece: PieceName | null = null;
  canHold = true;
  nextQueue: PieceName[] = [];

  clearedRows: number[] = [];
  clearAnimTime = 0;
  lastClearScore = 0;

  private dropTimer = 0;
  private lockTimer = 0;
  private bag: PieceName[] = [];
  private linesToLevel = 10;
  private softDrop = false;

  // Audio / UI Event Callbacks
  onMove?: () => void;
  onRotate?: () => void;
  onHardDrop?: () => void;
  onHold?: () => void;
  onLineClear?: (lines: number) => void;
  onLevelUp?: (level: number, credits: number) => void;
  onTopOut?: () => void;
  onGameOver?: () => void;
  onContinue?: () => void;

  constructor() {
    this.reset();
  }

  get next(): PieceName {
    return this.nextQueue[0] || "T";
  }

  reset(): void {
    this.grid = Array.from({ length: ROWS }, () => Array(COLS).fill(0));
    try {
      const saved = localStorage.getItem("aqua_splash_high_score");
      if (saved) this.highScore = Math.max(125000, Number(saved) || 0);
    } catch { }
    this.score = 0;
    this.level = 1;
    this.linesCleared = 0;
    this.linesToLevel = 10;
    this.credits = 2;
    this.dropTimer = 0;
    this.lockTimer = 0;
    this.bag = [];
    this.clearedRows = [];
    this.clearAnimTime = 0;
    this.lastClearScore = 0;
    this.current = null;
    this.heldPiece = null;
    this.canHold = true;

    // Fill next queue with initial pieces
    this.nextQueue = [];
    this.refillNextQueue();
    this.state = "ready";
  }

  start(): void {
    this.reset();
    this.state = "playing";
    this.spawnPiece();
  }

  pause(): void {
    if (this.state === "playing") this.state = "paused";
  }

  resume(): void {
    if (this.state === "paused") this.state = "playing";
  }

  /** Player uses 1 credit to continue after top-out, wiping the top 4 rows */
  useContinue(): boolean {
    if (this.credits <= 0) return false;
    this.credits--;

    // Remove top 4 rows where blocks are piled up to give room
    this.grid.splice(0, 4);
    this.grid.unshift(Array(COLS).fill(0), Array(COLS).fill(0), Array(COLS).fill(0), Array(COLS).fill(0));

    this.state = "playing";
    this.canHold = true;
    this.spawnPiece();
    this.onContinue?.();
    return true;
  }

  /** Hold current piece like normal Tetris */
  hold(): boolean {
    if (this.state !== "playing" || !this.current || !this.canHold) return false;
    const currentName = this.current.name;

    if (this.heldPiece === null) {
      this.heldPiece = currentName;
      this.canHold = false;
      this.spawnPiece();
    } else {
      const swapName = this.heldPiece;
      this.heldPiece = currentName;
      this.canHold = false;
      const rotation = 0;
      const col = Math.floor((COLS - this.pieceWidth(swapName, rotation)) / 2);
      const row = 0;
      this.current = { name: swapName, rotation, row, col };
      this.dropTimer = 0;
      this.lockTimer = 0;
    }
    this.onHold?.();
    return true;
  }

  update(dt: number): void {
    if (this.state !== "playing") return;

    // Handle line clear animation
    if (this.clearedRows.length > 0) {
      this.clearAnimTime += dt;
      if (this.clearAnimTime >= 0.35) {
        this.commitClear();
        this.clearedRows = [];
        this.clearAnimTime = 0;
        this.spawnPiece();
      }
      return;
    }

    if (!this.current) return;

    const interval = this.softDrop
      ? Math.min(dropInterval(this.level), 50)
      : dropInterval(this.level);

    this.dropTimer += dt * 1000;
    if (this.dropTimer >= interval) {
      this.dropTimer = 0;
      if (!this.moveDown()) {
        this.lockTimer += interval;
        if (this.lockTimer >= 500) {
          this.lockPiece();
        }
      } else {
        this.lockTimer = 0;
        if (this.softDrop) this.score += 1;
      }
    }
  }

  setSoftDrop(on: boolean): void { this.softDrop = on; }

  hardDrop(): void {
    if (this.state !== "playing" || !this.current) return;
    let dropped = 0;
    while (this.canPlace(this.current.name, this.current.rotation, this.current.row + 1, this.current.col)) {
      this.current.row++;
      dropped++;
    }
    this.score += dropped * 2;
    this.onHardDrop?.();
    this.lockPiece();
  }

  moveLeft(): boolean {
    const ok = this.tryMove(0, -1);
    if (ok) this.onMove?.();
    return ok;
  }

  moveRight(): boolean {
    const ok = this.tryMove(0, 1);
    if (ok) this.onMove?.();
    return ok;
  }

  moveDown(): boolean {
    return this.tryMove(1, 0);
  }

  rotate(): void {
    if (this.state !== "playing" || !this.current) return;
    const next = (this.current.rotation + 1) % 4;
    const kicks = [0, -1, 1, -2, 2];
    for (const kick of kicks) {
      if (this.canPlace(this.current.name, next, this.current.row, this.current.col + kick)) {
        this.current.rotation = next;
        this.current.col += kick;
        this.onRotate?.();
        return;
      }
    }
  }

  rotateCounter(): void {
    if (this.state !== "playing" || !this.current) return;
    const next = (this.current.rotation + 3) % 4;
    const kicks = [0, 1, -1, 2, -2];
    for (const kick of kicks) {
      if (this.canPlace(this.current.name, next, this.current.row, this.current.col - kick)) {
        this.current.rotation = next;
        this.current.col -= kick;
        this.onRotate?.();
        return;
      }
    }
  }

  getCells(name: PieceName, rotation: number, row: number, col: number): [number, number][] {
    return PIECES[name][rotation].map(([dr, dc]) => [row + dr, col + dc]);
  }

  getGhostRow(): number {
    if (!this.current) return 0;
    let row = this.current.row;
    while (this.canPlace(this.current.name, this.current.rotation, row + 1, this.current.col)) {
      row++;
    }
    return row;
  }

  private tryMove(dr: number, dc: number): boolean {
    if (this.state !== "playing" || !this.current) return false;
    if (this.canPlace(this.current.name, this.current.rotation, this.current.row + dr, this.current.col + dc)) {
      this.current.row += dr;
      this.current.col += dc;
      return true;
    }
    return false;
  }

  private canPlace(name: PieceName, rotation: number, row: number, col: number): boolean {
    for (const [dr, dc] of PIECES[name][rotation]) {
      const r = row + dr;
      const c = col + dc;
      if (r < 0 || r >= ROWS || c < 0 || c >= COLS) return false;
      if (this.grid[r][c] !== 0) return false;
    }
    return true;
  }

  private lockPiece(): void {
    if (!this.current) return;
    const cells = this.getCells(this.current.name, this.current.rotation, this.current.row, this.current.col);
    for (const [r, c] of cells) {
      if (r >= 0 && r < ROWS && c >= 0 && c < COLS) {
        this.grid[r][c] = this.current.name;
      }
    }
    this.current = null;
    this.dropTimer = 0;
    this.lockTimer = 0;
    this.canHold = true; // Can hold again for next piece

    // Check for completed lines
    const cleared: number[] = [];
    for (let r = 0; r < ROWS; r++) {
      if (this.grid[r].every(cell => cell !== 0)) {
        cleared.push(r);
      }
    }

    if (cleared.length > 0) {
      this.clearedRows = cleared;
      this.clearAnimTime = 0;
      const lines = cleared.length;
      const baseScores = [0, 100, 300, 500, 1000];
      const earned = (baseScores[Math.min(lines, 4)] || 100) * this.level;
      this.lastClearScore = earned;
      this.score += earned;
      if (this.score > this.highScore) {
        this.highScore = this.score;
        try { localStorage.setItem("aqua_splash_high_score", String(this.highScore)); } catch { }
      }
      this.linesCleared += lines;
      this.linesToLevel -= lines;

      this.onLineClear?.(lines);

      // Level up: every level you clear gives 1 credit!
      if (this.linesToLevel <= 0) {
        this.level++;
        this.credits++; // Award 1 credit per level cleared!
        this.linesToLevel += 10;
        this.onLevelUp?.(this.level, this.credits);
      }
    } else {
      this.spawnPiece();
    }
  }

  private commitClear(): void {
    const sorted = [...this.clearedRows].sort((a, b) => b - a);
    for (const r of sorted) {
      this.grid.splice(r, 1);
      this.grid.unshift(Array(COLS).fill(0));
    }
  }

  private spawnPiece(): void {
    this.refillNextQueue();
    const name = this.nextQueue.shift()!;
    this.refillNextQueue();

    const rotation = 0;
    const col = Math.floor((COLS - this.pieceWidth(name, rotation)) / 2);
    const row = 0;

    if (!this.canPlace(name, rotation, row, col)) {
      // Top-out condition
      this.current = null;
      if (this.credits > 0) {
        this.state = "continue";
        this.onTopOut?.();
      } else {
        this.state = "over";
        this.onGameOver?.();
      }
      return;
    }

    this.current = { name, rotation, row, col };
    this.dropTimer = 0;
    this.lockTimer = 0;
  }

  private pieceWidth(name: PieceName, rotation: number): number {
    const cols = PIECES[name][rotation].map(([, c]) => c);
    return Math.max(...cols) - Math.min(...cols) + 1;
  }

  private refillNextQueue(): void {
    while (this.nextQueue.length < 5) {
      this.nextQueue.push(this.pullFromBag());
    }
  }

  private pullFromBag(): PieceName {
    if (this.bag.length === 0) {
      this.bag = [...PIECE_NAMES];
      for (let i = this.bag.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [this.bag[i], this.bag[j]] = [this.bag[j], this.bag[i]];
      }
    }
    return this.bag.pop()!;
  }
}
