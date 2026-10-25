import { GameDisplay } from "../game/display.js";
import { AquaArcadeAudio } from "./sound.js";
import { AquaTetrisEngine } from "./engine.js";
import { renderAquaTetris, VIRTUAL_WIDTH, VIRTUAL_HEIGHT } from "./renderer.js";
import {
  renderLucideIcon,
  Pause,
  Play,
  Trophy,
  BookOpen,
  Volume2,
  VolumeX,
  Maximize2,
  X,
  ChevronLeft,
  ChevronRight,
  RotateCw,
  RotateCcw,
  ArrowDown,
  ArrowDownToLine,
  Layers,
  Coins,
  Zap,
  Eye,
  Gamepad2,
  Smartphone,
  Compass,
} from "./icons.js";
import type { AquaSplashAdapters, AquaSplashUser } from "./types.js";

type View = "auth" | "game" | "leaderboard";

/** HTML markup escape helper */
const html = (value: unknown): string =>
  String(value).replace(/[&<>"']/g, char =>
    ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[char]!,
  );

function shellMarkup(): string {
  return `<div class="aq-shell">
  <header class="aq-toolbar">
    <div class="aq-toolbar-heading">
      <span class="aq-brand">BLUE PULSE <small>AQUA SPASH</small></span>
    </div>
    <div class="aq-toolbar-actions">
      <button class="scene-button aq-pause-btn" data-action="toggle-pause" aria-label="Pause or Resume (P)" title="Pause or Resume (P)">${renderLucideIcon(Pause, { width: 17, height: 17 })}</button>
      <button class="scene-button aq-lb-btn" data-action="toggle-leaderboard" aria-label="Leaderboard" title="Leaderboard">${renderLucideIcon(Trophy, { width: 17, height: 17 })}</button>
      <button class="scene-button aq-rules-btn" data-action="toggle-rules" aria-label="Rules & Controls" title="Rules & Controls">${renderLucideIcon(BookOpen, { width: 17, height: 17 })}</button>
      <button class="scene-button aq-sound" data-action="sound" aria-label="Mute sound" aria-pressed="true" title="Mute sound">${renderLucideIcon(Volume2, { width: 17, height: 17 })}</button>
      <button class="scene-button aq-fullscreen" aria-label="Fullscreen game" aria-pressed="false" title="Fullscreen">${renderLucideIcon(Maximize2, { width: 17, height: 17 })}</button>
      <button class="scene-button" data-action="close" aria-label="Close Aqua Spash" title="Close">${renderLucideIcon(X, { width: 18, height: 18 })}</button>
    </div>
  </header>
  <main class="aq-panel" aria-labelledby="aq-title"></main>
  <p class="aq-session" role="status"></p>
</div>`;
}

function rulesAndControlsMarkup(isPaused: boolean): string {
  const mainBtnLabel = isPaused
    ? `Resume Dive ${renderLucideIcon(Play, { width: 14, height: 14, style: "vertical-align: -1px; margin-left: 4px;" })}`
    : `Dive In · Start Game ${renderLucideIcon(Play, { width: 14, height: 14, style: "vertical-align: -1px; margin-left: 4px;" })}`;
  const mainBtnAction = isPaused ? "resume" : "start";

  return `<div class="aq-rules-page">
    <span class="aq-kicker">HOW TO PLAY · RULES &amp; CONTROLS</span>
    <h3 class="aq-overlay-title">AQUA SPASH</h3>
    <p class="aq-overlay-desc">Dive into the deep blue reef. Stack falling aquatic blocks, clear complete horizontal lines, and master the currents!</p>
    
    <div class="aq-rules-grid">
      <!-- Rules Column -->
      <div class="aq-rules-col">
        <h4 class="aq-rules-col-title">${renderLucideIcon(Compass, { width: 15, height: 15, style: "vertical-align: -2px; margin-right: 6px;" })} Game Rules</h4>
        <ul class="aq-rules-list">
          <li>
            <span class="aq-rule-icon">${renderLucideIcon(Layers, { width: 18, height: 18 })}</span>
            <div>
              <strong>Clear Lines:</strong> Form solid horizontal rows to clear them and score combo points.
            </div>
          </li>
          <li>
            <span class="aq-rule-icon">${renderLucideIcon(Coins, { width: 18, height: 18 })}</span>
            <div>
              <strong>Earn Credits:</strong> Every level cleared awards <strong>+1 Credit</strong>. Drop speed increases each level!
            </div>
          </li>
          <li>
            <span class="aq-rule-icon">${renderLucideIcon(Zap, { width: 18, height: 18 })}</span>
            <div>
              <strong>Continue on Loss:</strong> When blocks reach the top, spend <strong>1 Credit</strong> to remove the top 3 rows and continue your run!
            </div>
          </li>
          <li>
            <span class="aq-rule-icon">${renderLucideIcon(RotateCcw, { width: 18, height: 18 })}</span>
            <div>
              <strong>Submarine Hold:</strong> Store any tetromino in the brass hold porthole (left side) and swap it back whenever needed.
            </div>
          </li>
          <li>
            <span class="aq-rule-icon">${renderLucideIcon(Eye, { width: 18, height: 18 })}</span>
            <div>
              <strong>Next 3 Queue:</strong> Track the 3 upcoming pieces in the portholes on the right to plan combos ahead.
            </div>
          </li>
        </ul>
      </div>

      <!-- Controls Column -->
      <div class="aq-rules-col">
        <h4 class="aq-rules-col-title">${renderLucideIcon(Gamepad2, { width: 15, height: 15, style: "vertical-align: -2px; margin-right: 6px;" })} Controls</h4>
        <div class="aq-controls-grid">
          <div class="aq-ctrl-row">
            <div class="aq-ctrl-keys">
              <span class="aq-key-badge">←</span><span class="aq-key-badge">→</span>
              <span class="aq-key-sep">or</span>
              <span class="aq-key-badge">A</span><span class="aq-key-badge">D</span>
            </div>
            <span class="aq-ctrl-desc">Move Left / Right</span>
          </div>
          <div class="aq-ctrl-row">
            <div class="aq-ctrl-keys">
              <span class="aq-key-badge">↑</span>
              <span class="aq-key-sep">or</span>
              <span class="aq-key-badge">W</span>
            </div>
            <span class="aq-ctrl-desc">Rotate Clockwise</span>
          </div>
          <div class="aq-ctrl-row">
            <div class="aq-ctrl-keys">
              <span class="aq-key-badge">Z</span>
            </div>
            <span class="aq-ctrl-desc">Rotate Counter-CW</span>
          </div>
          <div class="aq-ctrl-row">
            <div class="aq-ctrl-keys">
              <span class="aq-key-badge">↓</span>
              <span class="aq-key-sep">or</span>
              <span class="aq-key-badge">S</span>
            </div>
            <span class="aq-ctrl-desc">Soft Drop (Speed up)</span>
          </div>
          <div class="aq-ctrl-row">
            <div class="aq-ctrl-keys">
              <span class="aq-key-badge">Space</span>
            </div>
            <span class="aq-ctrl-desc">Hard Drop (Instant)</span>
          </div>
          <div class="aq-ctrl-row">
            <div class="aq-ctrl-keys">
              <span class="aq-key-badge">C</span>
              <span class="aq-key-sep">or</span>
              <span class="aq-key-badge">Shift</span>
            </div>
            <span class="aq-ctrl-desc">Hold Piece</span>
          </div>
          <div class="aq-ctrl-row">
            <div class="aq-ctrl-keys">
              <span class="aq-key-badge">P</span>
              <span class="aq-key-sep">or</span>
              <span class="aq-key-badge">Esc</span>
            </div>
            <span class="aq-ctrl-desc">Pause / Resume</span>
          </div>
        </div>
        <p class="aq-touch-hint">${renderLucideIcon(Smartphone, { width: 13, height: 13, style: "vertical-align: -2px; margin-right: 4px;" })} On touchscreens, use the arcade buttons under the screen.</p>
      </div>
    </div>

    <div class="aq-actions">
      <button class="aq-button aq-btn-large" data-action="${mainBtnAction}">${mainBtnLabel}</button>
      <button class="aq-button aq-secondary" data-action="toggle-leaderboard" title="View High Scores">${renderLucideIcon(Trophy, { width: 14, height: 14, style: "vertical-align: -2px; margin-right: 4px;" })} Leaderboard</button>
    </div>
  </div>`;
}

function authMarkup(message: string): string {
  return `<div class="aq-intro aq-welcome">
    <span class="aq-kicker">AQUATIC RETRO ARCADE</span>
    <h2 id="aq-title">Aqua Spash</h2>
    <p class="aq-story">Dive beneath the sunlit waves and take on the depths in this water-themed Tetris arcade adventure. Clear levels to earn credits, hold pieces for strategic combos, and set high scores!</p>
    <div class="aq-welcome-facts">
      <span><strong>Hold</strong> Queue (C / Shift)</span>
      <span><strong>3</strong> Next Previews</span>
      <span><strong>1</strong> Credit Earned Per Level</span>
    </div>
    <div class="aq-actions">
      <button class="aq-button" data-action="login">Login with Account</button>
      <button class="aq-button aq-secondary" data-action="guest">Continue as Guest →</button>
    </div>
    <p class="aq-fine">Guest progress stays in this tab. Sign in to submit verified scores.</p>
    <p class="aq-auth-message notice" role="status">${html(message)}</p>
  </div>`;
}

function gameMarkup(source: "mock" | "api"): string {
  return `<div class="aq-game-layout">
    <div class="aq-stage">
      <div class="aq-canvas-wrap">
        <canvas class="aq-canvas" tabindex="0"
          aria-label="Aqua Spash Tetris. Arrow keys to move, Up to rotate, Down for soft drop, Space for hard drop, C to hold, P to pause."
        ></canvas>
        <div class="aq-overlay" data-visible="true">
          <span class="aq-kicker">AQUA SPASH</span>
          <h3 class="aq-overlay-title">Ready to Dive?</h3>
          <p class="aq-overlay-desc">Arrow keys to move/rotate · Space to hard drop · C to hold · P to pause</p>
          <div class="aq-actions">
            <button class="aq-button" data-action="start">Start Game ${renderLucideIcon(Play, { width: 14, height: 14, style: "vertical-align: -1px; margin-left: 4px;" })}</button>
            <button class="aq-button aq-secondary" data-action="toggle-leaderboard">${renderLucideIcon(Trophy, { width: 14, height: 14, style: "vertical-align: -2px; margin-right: 4px;" })} High Scores</button>
          </div>
        </div>
      </div>
      <div class="aq-touch-controls" aria-label="Game controls">
        <button class="aq-touch-btn" data-action="ctrl-left" aria-label="Move left" title="Move Left">${renderLucideIcon(ChevronLeft, { width: 20, height: 20 })}</button>
        <button class="aq-touch-btn" data-action="ctrl-rotate" aria-label="Rotate" title="Rotate">${renderLucideIcon(RotateCw, { width: 18, height: 18 })}</button>
        <button class="aq-touch-btn" data-action="ctrl-hold" aria-label="Hold" title="Hold Piece">${renderLucideIcon(RotateCcw, { width: 18, height: 18 })}</button>
        <button class="aq-touch-btn" data-action="ctrl-down" aria-label="Soft drop" title="Soft Drop">${renderLucideIcon(ArrowDown, { width: 18, height: 18 })}</button>
        <button class="aq-touch-btn" data-action="ctrl-right" aria-label="Move right" title="Move Right">${renderLucideIcon(ChevronRight, { width: 20, height: 20 })}</button>
        <button class="aq-touch-btn" data-action="toggle-pause" aria-label="Pause" title="Pause">${renderLucideIcon(Pause, { width: 18, height: 18 })}</button>
        <button class="aq-touch-btn aq-drop-btn" data-action="ctrl-drop" aria-label="Hard drop" title="Hard Drop">${renderLucideIcon(ArrowDownToLine, { width: 20, height: 20 })}</button>
      </div>
    </div>
    <aside class="aq-leaderboard-drawer" data-open="false">
      <div class="aq-lb-header">
        <div class="aq-lb-title-wrap">
          <h3 id="aq-lb-title">${renderLucideIcon(Trophy, { width: 18, height: 18, style: "vertical-align: -2px; margin-right: 6px;" })} Top Explorers</h3>
          <span class="aq-lb-badge">${source === "mock" ? "DEMO · MOCK" : "GLOBAL"}</span>
        </div>
        <button class="scene-button aq-lb-close" data-action="toggle-leaderboard" aria-label="Close leaderboard">${renderLucideIcon(X, { width: 18, height: 18 })}</button>
      </div>
      <div class="aq-lb-body">
        <p class="aq-lb-status">Loading rankings…</p>
      </div>
      <p class="aq-game-message notice" role="status"></p>
    </aside>
  </div>`;
}

function boardHTML(entries: { rank: number; displayName: string; score: number; level: number; userId: string }[], currentUserId: string | null): string {
  if (!entries.length) return `<p class="aq-lb-status">No scores recorded yet. Be the first!</p>`;
  return `<table class="aq-lb-table">
    <thead><tr><th>RANK</th><th>EXPLORER</th><th>SCORE</th><th>LVL</th></tr></thead>
    <tbody>${entries.slice(0, 8).map(e =>
    `<tr class="${e.userId === currentUserId ? "aq-current" : ""}">
      <td>${String(e.rank).padStart(2, "0")}</td>
      <td>${html(e.displayName)}</td>
      <td>${e.score.toLocaleString()}</td>
      <td>${e.level}</td>
    </tr>`).join("")}</tbody>
  </table>`;
}

export class AquaSplashDialog {
  readonly element = document.createElement("dialog");
  private engine = new AquaTetrisEngine();
  private adapters: AquaSplashAdapters;
  private user: AquaSplashUser | null = null;
  private accountId: string | null = null;
  private epoch = 0;
  private boardEpoch = 0;
  private view: View = "auth";
  private authMessage = "Checking your session…";
  private loginPending = false;
  private opener: HTMLElement | null = null;
  private overflow = "";
  private events = new AbortController();
  private audio = new AquaArcadeAudio();
  private display!: GameDisplay;
  private frame = 0;
  private prevTime = 0;
  private canvas!: HTMLCanvasElement;
  private ctx!: CanvasRenderingContext2D;
  private observer!: ResizeObserver;
  private showingRules = true;

  constructor(adapters: AquaSplashAdapters) {
    this.adapters = adapters;
    this.element.className = "game-dialog aq-dialog";
    this.element.setAttribute("aria-labelledby", "aq-title");
    this.element.innerHTML = shellMarkup();
    document.body.append(this.element);

    this.display = new GameDisplay(
      this.element,
      this.find(".aq-shell"),
      this.find(".aq-fullscreen"),
      () => { this.pause(); },
    );

    this.bindEngineAudio();

    const signal = this.events.signal;

    this.element.addEventListener("click", event => {
      const button = (event.target as HTMLElement).closest<HTMLButtonElement>("[data-action]");
      if (button && !button.disabled) void this.action(button.dataset.action!);
    }, { signal });

    this.element.addEventListener("close", () => this.onClose(), { signal });
    this.element.addEventListener("cancel", event => {
      if (this.display.expanded) { event.preventDefault(); this.display.exit(); }
    }, { signal });

    document.addEventListener("visibilitychange", () => { if (document.hidden) this.pause(); }, { signal });
    window.addEventListener("blur", () => this.pause(), { signal });
  }

  private bindEngineAudio(): void {
    this.engine.onMove = () => this.audio.playMove();
    this.engine.onRotate = () => this.audio.playRotate();
    this.engine.onHardDrop = () => this.audio.playHardDrop();
    this.engine.onHold = () => this.audio.playHold();
    this.engine.onLineClear = (lines) => this.audio.playLineClear(lines);
    this.engine.onLevelUp = () => this.audio.playLevelUp();
    this.engine.onContinue = () => this.audio.playContinue();
    this.engine.onGameOver = () => {
      this.audio.playGameOver();
      this.stopFrame();
      this.updateOverlay();
      void this.finishRun();
    };
    this.engine.onTopOut = () => {
      this.audio.playGameOver();
      this.stopFrame();
      this.updateOverlay();
    };
  }

  private find<T extends HTMLElement = HTMLElement>(selector: string): T {
    return this.element.querySelector<T>(selector)!;
  }
  private say(selector: string, text: string): void {
    const el = this.element.querySelector(selector);
    if (el) el.textContent = text;
  }

  async open(opener: HTMLElement): Promise<void> {
    if (this.element.open) return;
    this.opener = opener;
    this.overflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    this.authMessage = "Checking your session…";
    this.renderAuth();
    this.element.showModal();
    this.find<HTMLButtonElement>('[data-action="close"]').focus();

    const epoch = ++this.epoch;
    try {
      const user = await this.adapters.auth.getUser();
      if (epoch !== this.epoch || !this.element.open) return;
      this.setUser(user);
      if (user) this.enterGame();
      else this.setAuthMessage("Login, or choose Continue as Guest to play without saving.");
    } catch {
      if (epoch === this.epoch && this.element.open)
        this.setAuthMessage("Session check failed. You can continue as a guest.");
    }
  }

  private setUser(user: AquaSplashUser | null): void {
    if ((user?.id ?? null) !== this.accountId) {
      this.stopFrame();
      this.engine = new AquaTetrisEngine();
      this.bindEngineAudio();
    }
    this.user = user;
    this.accountId = user?.id ?? null;
    this.say(".aq-session", user
      ? "Account connected. Scores will be submitted to the global reef leaderboard."
      : "Guest session · Scores are recorded for this session only.");
  }

  private setAuthMessage(text: string): void {
    this.authMessage = text;
    const el = this.element.querySelector(".aq-auth-message");
    if (el) el.textContent = text;
  }

  private async action(name: string): Promise<void> {
    this.audio.unlock();
    switch (name) {
      case "close": this.pause(); this.element.close(); return;
      case "login": await this.login(); return;
      case "guest": ++this.epoch; this.setUser(null); this.enterGame(); return;
      case "sound": {
        this.audio.setEnabled(!this.audio.enabled);
        const btn = this.find(".aq-sound");
        btn.setAttribute("aria-pressed", String(this.audio.enabled));
        btn.title = this.audio.enabled ? "Mute sound" : "Enable sound";
        btn.innerHTML = this.audio.enabled
          ? renderLucideIcon(Volume2, { width: 17, height: 17 })
          : renderLucideIcon(VolumeX, { width: 17, height: 17 });
        return;
      }
      case "start": this.startGame(); return;
      case "toggle-pause": this.togglePause(); return;
      case "toggle-rules": this.toggleRules(); return;
      case "resume": this.resume(); return;
      case "continue-run": this.continueWithCredit(); return;
      case "give-up": this.giveUpRun(); return;
      case "toggle-leaderboard": this.toggleLeaderboard(); return;
      case "leaderboard": this.renderLeaderboardView(); return;
      case "back": this.enterGame(); return;

      // Mobile touch controls
      case "ctrl-left":   this.engine.moveLeft();       this.draw(); return;
      case "ctrl-right":  this.engine.moveRight();      this.draw(); return;
      case "ctrl-rotate": this.engine.rotate();         this.draw(); return;
      case "ctrl-hold":   this.engine.hold();           this.draw(); return;
      case "ctrl-down":   this.engine.setSoftDrop(true); this.draw(); return;
      case "ctrl-drop":   this.engine.hardDrop();       this.draw(); return;
    }
  }

  private toggleRules(): void {
    if (this.view !== "game") return;
    if (this.showingRules) {
      this.showingRules = false;
      if (this.engine.state === "paused") {
        this.resume();
      } else {
        this.updateOverlay();
      }
    } else {
      if (this.engine.state === "playing") {
        this.pause();
      }
      this.showingRules = true;
      this.updateOverlay();
    }
  }

  private updatePauseButton(paused: boolean): void {
    const btn = this.element.querySelector<HTMLButtonElement>(".aq-pause-btn");
    if (btn) {
      btn.innerHTML = paused
        ? renderLucideIcon(Play, { width: 17, height: 17 })
        : renderLucideIcon(Pause, { width: 17, height: 17 });
      btn.title = paused ? "Resume Game (P)" : "Pause Game (P)";
      btn.setAttribute("aria-label", paused ? "Resume Game" : "Pause Game");
    }
  }

  private togglePause(): void {
    if (this.engine.state === "playing") {
      this.pause();
    } else if (this.engine.state === "paused") {
      this.resume();
    }
  }

  private continueWithCredit(): void {
    if (this.engine.state !== "continue") return;
    const ok = this.engine.useContinue();
    if (ok) {
      this.updateOverlay();
      this.schedule();
      this.draw();
      this.canvas.focus();
    }
  }

  private giveUpRun(): void {
    this.engine.state = "over";
    this.updateOverlay();
    void this.finishRun();
  }

  private toggleLeaderboard(): void {
    const drawer = this.element.querySelector<HTMLElement>(".aq-leaderboard-drawer");
    if (drawer) {
      const open = drawer.dataset.open === "true";
      drawer.dataset.open = open ? "false" : "true";
      if (!open) void this.refreshLeaderboard();
    }
  }

  private async login(): Promise<void> {
    if (this.loginPending) return;
    this.loginPending = true;
    const epoch = ++this.epoch;
    const button = this.find<HTMLButtonElement>('[data-action="login"]');
    button.disabled = true;
    try {
      await this.adapters.auth.login();
      const user = await this.adapters.auth.getUser();
      if (epoch !== this.epoch || !this.element.open) return;
      if (user) { this.setUser(user); this.enterGame(); }
      else this.setAuthMessage("Finish login on the site, then reopen Aqua Spash.");
    } catch (error) {
      if (epoch === this.epoch && this.element.open)
        this.setAuthMessage(error instanceof Error ? error.message : "Login unavailable. Continue as guest.");
    } finally {
      this.loginPending = false;
      button.disabled = false;
    }
  }

  private enterGame(): void {
    this.view = "game";
    this.showingRules = true;
    const panel = this.find(".aq-panel");
    panel.innerHTML = gameMarkup(this.user ? "api" : "mock");

    this.canvas = this.find<HTMLCanvasElement>(".aq-canvas");
    this.ctx = this.canvas.getContext("2d")!;
    this.observer = new ResizeObserver(() => this.resize());
    this.observer.observe(this.canvas);

    // Keyboard controls
    const signal = this.events.signal;
    this.canvas.addEventListener("keydown", event => {
      this.audio.unlock();

      if (this.showingRules) {
        if (event.code === "Enter" || event.code === "Space") {
          event.preventDefault();
          if (this.engine.state === "ready" || this.engine.state === "over") {
            this.startGame();
          } else if (this.engine.state === "paused") {
            this.resume();
          }
          return;
        } else if (event.code === "KeyH" || event.code === "Escape") {
          event.preventDefault();
          this.toggleRules();
          return;
        }
      }

      if (this.engine.state === "playing") {
        switch (event.code) {
          case "ArrowLeft":
          case "KeyA":
            event.preventDefault();
            this.engine.moveLeft();
            break;
          case "ArrowRight":
          case "KeyD":
            event.preventDefault();
            this.engine.moveRight();
            break;
          case "ArrowDown":
          case "KeyS":
            event.preventDefault();
            this.engine.setSoftDrop(true);
            break;
          case "ArrowUp":
          case "KeyW":
            event.preventDefault();
            this.engine.rotate();
            break;
          case "KeyZ":
            event.preventDefault();
            this.engine.rotateCounter();
            break;
          case "KeyC":
          case "ShiftLeft":
          case "ShiftRight":
            event.preventDefault();
            this.engine.hold();
            break;
          case "Space":
            event.preventDefault();
            this.engine.hardDrop();
            break;
          case "KeyP":
          case "Escape":
            event.preventDefault();
            this.pause();
            break;
          case "KeyH":
            event.preventDefault();
            this.toggleRules();
            break;
        }
      } else if (this.engine.state === "paused" && (event.code === "KeyP" || event.code === "Escape" || event.code === "Space")) {
        event.preventDefault();
        this.resume();
      } else if (this.engine.state === "continue" && (event.code === "Enter" || event.code === "Space")) {
        event.preventDefault();
        this.continueWithCredit();
      } else if (this.engine.state === "over" && (event.code === "Enter" || event.code === "Space")) {
        event.preventDefault();
        this.startGame();
      }
      this.draw();
    }, { signal });

    this.canvas.addEventListener("keyup", event => {
      if (event.code === "ArrowDown" || event.code === "KeyS") {
        this.engine.setSoftDrop(false);
      }
    }, { signal });

    this.resize();
    this.draw();
    this.updateOverlay();
    this.refreshLeaderboard();
    this.canvas.focus();
  }

  private startGame(): void {
    this.stopFrame();
    this.showingRules = false;
    this.engine.start();
    this.updatePauseButton(false);
    this.audio.unlock();
    this.updateOverlay();
    this.schedule();
    this.canvas.focus();
  }

  private pause(): void {
    if (this.engine.state !== "playing") return;
    this.engine.pause();
    this.updatePauseButton(true);
    this.audio.pause();
    this.stopFrame();
    this.draw();
    this.updateOverlay();
  }

  private resume(): void {
    if (this.engine.state !== "paused") return;
    this.showingRules = false;
    this.engine.resume();
    this.updatePauseButton(false);
    this.audio.unlock();
    this.updateOverlay();
    this.schedule();
  }

  private updateOverlay(): void {
    const overlay = this.element.querySelector<HTMLElement>(".aq-overlay");
    if (!overlay) return;

    if (this.showingRules) {
      overlay.dataset.visible = "true";
      overlay.innerHTML = rulesAndControlsMarkup(this.engine.state === "paused");
      return;
    }

    switch (this.engine.state) {
      case "ready":
        overlay.dataset.visible = "true";
        overlay.innerHTML = `
          <span class="aq-kicker">AQUA SPASH ARCADE</span>
          <h3 class="aq-overlay-title">Ready to Dive?</h3>
          <p class="aq-overlay-desc">Clear lines to increase level and earn credits! Use C or touch to hold shapes.</p>
          <div class="aq-actions">
            <button class="aq-button aq-btn-large" data-action="start">Dive In · Start Game ${renderLucideIcon(Play, { width: 14, height: 14, style: "vertical-align: -1px; margin-left: 4px;" })}</button>
            <button class="aq-button aq-secondary" data-action="toggle-rules">${renderLucideIcon(BookOpen, { width: 14, height: 14, style: "vertical-align: -2px; margin-right: 4px;" })} Rules &amp; Controls</button>
            <button class="aq-button aq-secondary" data-action="toggle-leaderboard" title="Leaderboard">${renderLucideIcon(Trophy, { width: 14, height: 14, style: "vertical-align: -2px; margin-right: 4px;" })} Board</button>
          </div>`;
        break;
      case "paused":
        overlay.dataset.visible = "true";
        overlay.innerHTML = `
          <span class="aq-kicker">TAKE A BREATH</span>
          <h3 class="aq-overlay-title">Game Paused</h3>
          <p class="aq-overlay-desc">The ocean awaits your return. Press P, Space, or click below to resume.</p>
          <div class="aq-actions">
            <button class="aq-button" data-action="resume">Resume Dive ${renderLucideIcon(Play, { width: 14, height: 14, style: "vertical-align: -1px; margin-left: 4px;" })}</button>
            <button class="aq-button aq-secondary" data-action="toggle-rules">${renderLucideIcon(BookOpen, { width: 14, height: 14, style: "vertical-align: -2px; margin-right: 4px;" })} Rules &amp; Controls</button>
          </div>`;
        break;
      case "continue":
        overlay.dataset.visible = "true";
        overlay.innerHTML = `
          <span class="aq-kicker">OUT OF DEPTH</span>
          <h3 class="aq-overlay-title">CONTINUE?</h3>
          <p class="aq-overlay-desc">You have <strong>${this.engine.credits} ${this.engine.credits === 1 ? "Credit" : "Credits"}</strong> remaining.<br>Use 1 Credit to remove the top 3 rows and continue your run!</p>
          <div class="aq-actions">
            <button class="aq-button" data-action="continue-run">Use 1 Credit to Continue ${renderLucideIcon(Zap, { width: 14, height: 14, style: "vertical-align: -1px; margin-left: 4px;" })}</button>
            <button class="aq-button aq-secondary" data-action="give-up">End Game</button>
          </div>`;
        break;
      case "over":
        overlay.dataset.visible = "true";
        overlay.innerHTML = `
          <span class="aq-kicker">GAME OVER</span>
          <h3 class="aq-overlay-title">The Depths Claim You</h3>
          <p class="aq-overlay-desc">Final Score: <strong>${this.engine.score.toLocaleString()}</strong> · Level ${this.engine.level} · ${this.engine.linesCleared} lines</p>
          <div class="aq-actions">
            <button class="aq-button" data-action="start">Play Again ${renderLucideIcon(Play, { width: 14, height: 14, style: "vertical-align: -1px; margin-left: 4px;" })}</button>
            <button class="aq-button aq-secondary" data-action="toggle-rules">${renderLucideIcon(BookOpen, { width: 14, height: 14, style: "vertical-align: -2px; margin-right: 4px;" })} Rules &amp; Controls</button>
            <button class="aq-button aq-secondary" data-action="toggle-leaderboard" title="Leaderboard">${renderLucideIcon(Trophy, { width: 14, height: 14, style: "vertical-align: -2px; margin-right: 4px;" })} Board</button>
          </div>`;
        break;
      case "playing":
        overlay.dataset.visible = "false";
        break;
    }
  }

  private resize(): void {
    if (!this.canvas) return;
    const ratio = Math.min(window.devicePixelRatio || 1, 2.5);
    this.canvas.width = Math.round(VIRTUAL_WIDTH * ratio);
    this.canvas.height = Math.round(VIRTUAL_HEIGHT * ratio);
    this.draw();
  }

  private draw(): void {
    if (!this.ctx || !this.canvas) return;
    renderAquaTetris(this.ctx, this.engine, this.canvas.width, this.canvas.height);
  }

  private schedule(): void {
    if (this.frame || !this.element.open || this.engine.state !== "playing") return;
    this.frame = requestAnimationFrame(this.tick);
  }

  private tick = (time: number): void => {
    this.frame = 0;
    const dt = this.prevTime ? (time - this.prevTime) / 1000 : 0;
    this.prevTime = time;
    this.engine.update(Math.min(dt, 0.1));
    this.draw();

    if (this.engine.state === "playing") {
      this.schedule();
    }
  };

  private stopFrame(): void {
    cancelAnimationFrame(this.frame);
    this.frame = 0;
    this.prevTime = 0;
  }

  private async finishRun(): Promise<void> {
    if (!this.user) {
      this.say(".aq-game-message", "Great game! Sign in to submit your score to the global leaderboard.");
      return;
    }
    try {
      await this.adapters.service.submitAquaSplashScore({
        userId: this.user.id,
        score: this.engine.score,
        level: this.engine.level,
        linesCleared: this.engine.linesCleared,
      });
      this.say(".aq-game-message", "Score submitted to the reef leaderboard!");
      await this.refreshLeaderboard();
    } catch {
      this.say(".aq-game-message", "Score could not be submitted.");
    }
  }

  private async refreshLeaderboard(): Promise<void> {
    const epoch = ++this.boardEpoch;
    try {
      const board = await this.adapters.service.getAquaSplashLeaderboard();
      if (epoch !== this.boardEpoch || !this.element.open) return;
      const body = this.element.querySelector(".aq-lb-body");
      if (body) {
        body.innerHTML = boardHTML(board.entries, this.user?.id ?? null);
      }
      const badge = this.element.querySelector(".aq-lb-badge");
      if (badge) badge.textContent = board.source === "mock" ? "DEMO · MOCK" : "GLOBAL";
    } catch {
      const body = this.element.querySelector(".aq-lb-body");
      if (body) body.innerHTML = `<p class="aq-lb-status">Rankings unavailable.</p>`;
    }
  }

  private renderAuth(): void {
    this.view = "auth";
    this.find(".aq-panel").innerHTML = authMarkup(this.authMessage);
  }

  private async renderLeaderboardView(): Promise<void> {
    this.view = "leaderboard";
    const panel = this.find(".aq-panel");
    panel.innerHTML = `<div class="aq-intro">
      <span class="aq-kicker">AQUA SPASH RANKINGS</span>
      <h2 id="aq-title">The Reef's Finest</h2>
      <div class="aq-lb-full-body"><p class="aq-lb-status">Loading…</p></div>
      <button class="aq-button aq-secondary" data-action="back">Back to Game →</button>
    </div>`;
    try {
      const board = await this.adapters.service.getAquaSplashLeaderboard();
      if (this.view !== "leaderboard" || !this.element.open) return;
      const body = this.element.querySelector(".aq-lb-full-body");
      if (body) body.innerHTML = boardHTML(board.entries, this.user?.id ?? null);
    } catch {
      const body = this.element.querySelector(".aq-lb-full-body");
      if (body) body.innerHTML = `<p class="aq-lb-status">Rankings unavailable.</p>`;
    }
  }

  private onClose(): void {
    this.stopFrame();
    this.pause();
    this.display.exit();
    ++this.epoch;
    ++this.boardEpoch;
    if (this.observer) this.observer.disconnect();
    document.body.style.overflow = this.overflow;
    this.opener?.focus();
  }

  destroy(): void {
    if (this.element.open) { this.element.close(); this.onClose(); }
    this.events.abort();
    this.display.destroy();
    this.audio.destroy();
    this.stopFrame();
    if (this.observer) this.observer.disconnect();
    this.element.remove();
  }
}
