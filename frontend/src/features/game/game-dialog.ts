import type {
  BluePulseAdapters,
  GameMode,
  GameUser,
} from "../../types/game.js";
import { RunnerEngine } from "./engine.js";
import { renderScene } from "./renderer.js";
import { MilestoneSound } from "./sound.js";
import { GameDisplay } from "./display.js";

import { gameMarkup } from "./dialog-markup.js";

export class GameDialog {
  readonly element = document.createElement("dialog");
  private game = new RunnerEngine("surface");
  private user: GameUser | null = null;
  private guestBest = 0;
  private accountBest = 0;
  private accountId: string | null = null;
  private authEpoch = 0;
  private runEpoch = 0;
  private frame = 0;
  private previousTime = 0;
  private impactStartedAt = 0;
  private refreshEpoch = 0;
  private opening = false;
  private opener: HTMLElement | null = null;
  private oldOverflow = "";
  private canvas: HTMLCanvasElement;
  private context: CanvasRenderingContext2D;
  private observer: ResizeObserver;
  private motion = matchMedia("(prefers-reduced-motion: reduce)");
  private events = new AbortController();
  private sound = new MilestoneSound();
  private display: GameDisplay;
  private adapters: BluePulseAdapters;
  private jumpInputs = new Set<string>();
  private duckInputs = new Set<string>();

  constructor(adapters: BluePulseAdapters) {
    this.adapters = adapters;
    this.element.className = "game-dialog";
    this.element.setAttribute("aria-labelledby", "game-title");
    this.element.innerHTML = gameMarkup;
    document.body.append(this.element);
    this.canvas = this.find("canvas");
    this.context = this.canvas.getContext("2d")!;
    this.observer = new ResizeObserver(() => this.resize());
    this.display = new GameDisplay(
      this.element,
      this.find(".game-content"),
      this.find(".fullscreen-button"),
      () => {
        this.pause();
        this.resize();
        if (!this.element.open) this.opener?.focus();
      },
    );
    const signal = this.events.signal;
    this.find(".close-dialog").addEventListener(
      "click",
      () => this.element.close(),
      { signal },
    );
    this.element.addEventListener("close", () => this.onClose(), { signal });
    this.element.addEventListener(
      "cancel",
      (event) => {
        if (this.display.expanded) {
          event.preventDefault();
          this.display.exit();
        }
      },
      { signal },
    );
    this.find(".continue").addEventListener(
      "click",
      () => {
        ++this.authEpoch;
        this.opening = false;
        this.setUser(null);
        this.showGame();
      },
      { signal },
    );
    this.find(".login").addEventListener(
      "click",
      () => {
        void this.login();
      },
      { signal },
    );
    this.find(".start-run").addEventListener(
      "click",
      () => this.startOrResume(),
      { signal },
    );
    this.find(".pause-button").addEventListener(
      "click",
      () => this.togglePause(),
      { signal },
    );
    this.find(".jump").addEventListener("click", (event) => {
      // Keyboard / assistive activation has no pointer hold/release sequence.
      if (event.detail === 0) { this.jump(); this.game.releaseJump(); }
    }, { signal });
    this.find(".sound-button").addEventListener(
      "click",
      () => {
        this.sound.setEnabled(!this.sound.enabled);
        const button = this.find<HTMLButtonElement>(".sound-button");
        button.setAttribute("aria-pressed", String(this.sound.enabled));
        button.title = this.sound.enabled
          ? "Mute milestone sound"
          : "Enable milestone sound";
        if (this.sound.enabled && this.game.state === "running")
          this.sound.unlock();
      },
      { signal },
    );
    this.element
      .querySelectorAll<HTMLButtonElement>(".mode-tabs [data-mode]")
      .forEach((button) => {
        button.addEventListener(
          "click",
          () => this.setMode(button.dataset.mode as GameMode),
          { signal },
        );
      });
    const holdControls: [HTMLElement, "jump" | "duck"][] = [
      [this.canvas, "jump"], [this.find(".jump"), "jump"], [this.find(".duck"), "duck"],
    ];
    for (const [target, action] of holdControls) target.addEventListener("pointerdown", (event) => {
      if (event.button > 0) return;
      event.preventDefault();
      this.canvas.focus();
      target.setPointerCapture?.(event.pointerId);
      this.pressInput(action, `pointer:${event.pointerId}`);
    }, { signal });
    const releasePointer = (event: PointerEvent) => this.releaseInput(`pointer:${event.pointerId}`);
    window.addEventListener("pointerup", releasePointer, { signal });
    window.addEventListener("pointercancel", releasePointer, { signal });
    this.element.addEventListener("lostpointercapture", releasePointer, { signal });
    this.element.addEventListener(
      "keydown",
      (event) => {
        if (this.find(".game-content").hidden) return;
        const interactive = (event.target as HTMLElement).closest(
          "button, a, input, select",
        );
        if (
          event.code === "ArrowUp" ||
          (event.code === "Space" && !interactive)
        ) {
          event.preventDefault();
          if (!event.repeat) this.pressInput("jump", event.code);
        }
        if (event.code === "ArrowDown") {
          event.preventDefault();
          if (!event.repeat) this.pressInput("duck", event.code);
        }
        if (event.code === "Enter" && !interactive && !event.repeat && this.game.state === "over") {
          event.preventDefault();
          this.start();
        }
        if (event.code === "KeyP" && !event.repeat) {
          event.preventDefault();
          this.togglePause();
        }
      },
      { signal },
    );
    window.addEventListener("keyup", (event) => {
      if (["Space", "ArrowUp", "ArrowDown"].includes(event.code)) this.releaseInput(event.code);
    }, { signal });
    document.addEventListener(
      "visibilitychange",
      () => {
        if (document.hidden) this.pause();
      },
      { signal },
    );
    window.addEventListener("blur", () => this.pause(), { signal });
  }

  private pressInput(action: "jump" | "duck", id: string): void {
    const inputs = action === "jump" ? this.jumpInputs : this.duckInputs;
    if (inputs.has(id)) return;
    if (action === "jump") this.jump();
    inputs.add(id);
    if (action === "duck") this.game.setDuck(true);
  }
  private releaseInput(id: string): void {
    if (this.jumpInputs.delete(id) && !this.jumpInputs.size) this.game.releaseJump();
    if (this.duckInputs.delete(id) && !this.duckInputs.size) this.game.setDuck(false);
  }
  private clearInput(): void {
    this.jumpInputs.clear();
    this.duckInputs.clear();
    this.game.releaseJump();
    this.game.setDuck(false);
  }

  private find<T extends HTMLElement = HTMLElement>(selector: string): T {
    return this.element.querySelector<T>(selector)!;
  }
  private say(selector: string, value: string): void {
    this.find(selector).textContent = value;
  }
  private get best(): number {
    return this.user ? this.accountBest : this.guestBest;
  }
  private set best(score: number) {
    if (this.user) this.accountBest = score;
    else this.guestBest = score;
  }
  private setUser(user: GameUser | null): void {
    // A guest's paused run must never turn into a submitted account run.
    if (this.user?.id !== user?.id) {
      this.stopFrame();
      this.sound.reset();
      this.sound.pause();
      ++this.runEpoch;
      this.game = new RunnerEngine(this.game.mode);
    }
    if (user?.id !== this.accountId)
      this.accountBest = 0;
    this.accountId = user?.id ?? null;
    this.user = user;
  }

  async open(opener: HTMLElement): Promise<void> {
    if (this.opening || this.element.open) return;
    this.opening = true;
    this.opener = opener;
    const epoch = ++this.authEpoch;
    this.find(".auth-gate").hidden = false;
    this.find(".game-content").hidden = true;
    this.element.dataset.view = "auth";
    this.find(".auth-gate").prepend(this.find(".close-dialog"));
    this.say(".auth-message", "Checking your session…");
    this.oldOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    this.element.showModal();
    this.find(".close-dialog").focus();
    try {
      const user = await this.adapters.auth.getUser();
      if (!this.element.open || epoch !== this.authEpoch) return;
      this.setUser(user);
      this.say(
        ".auth-message",
        window.bluePulseAdapters
          ? "Log in with your connected account, or continue as a guest."
          : "Development preview: login integration is pending.",
      );
      if (this.user) this.showGame();
    } catch {
      if (epoch !== this.authEpoch || !this.element.open) return;
      this.setUser(null);
      this.say(
        ".auth-message",
        "Your session could not be checked. You can still continue as a guest.",
      );
    } finally {
      if (epoch === this.authEpoch) this.opening = false;
    }
  }

  private async login(): Promise<void> {
    const button = this.find<HTMLButtonElement>(".login");
    button.disabled = true;
    const epoch = ++this.authEpoch;
    try {
      await this.adapters.auth.login();
      const user = await this.adapters.auth.getUser();
      if (epoch !== this.authEpoch || !this.element.open) return;
      this.setUser(user);
      if (this.element.open && this.user) this.showGame();
      else
        this.say(
          ".auth-message",
          "Complete your login, then reopen the game. You can also continue as a guest.",
        );
    } catch (error) {
      if (epoch !== this.authEpoch || !this.element.open) return;
      this.say(
        ".auth-message",
        error instanceof Error
          ? error.message
          : "Login is unavailable. Continue as a guest to play.",
      );
    } finally {
      button.disabled = false;
    }
  }

  private showGame(): void {
    this.find(".auth-gate").hidden = true;
    this.find(".game-content").hidden = false;
    this.element.dataset.view = "game";
    const close = this.find(".close-dialog");
    close.classList.add("scene-button");
    this.find(".stage-actions").append(close);
    this.say(
      ".player-label",
      this.user ? this.user.displayName : "◌ Playing as guest",
    );
    this.find(".best-label").title = this.user ? "Personal best across both modes" : "Session best across both modes";
    this.find(".scorebar").setAttribute(
      "aria-label",
      this.user
        ? "Current distance compared with your personal best"
        : "Guest current distance compared with your best this session",
    );
    this.say(
      ".session-note",
      this.user
        ? "Scores use the configured adapter. Mock progress lasts in memory for this tab only."
        : "Guest scores are session-only. Demo rankings are not a global competition.",
    );
    this.say(".game-message", "");
    this.observer.observe(this.canvas);
    this.resize();
    this.updateUI();
    this.find(".start-run").focus();
    void this.refreshLeaderboard();
  }

  private setMode(mode: GameMode): void {
    if (this.game.mode === mode) return;
    this.stopFrame();
    this.clearInput();
    this.sound.reset();
    this.sound.pause();
    ++this.runEpoch;
    this.game = new RunnerEngine(mode);
    this.element
      .querySelectorAll<HTMLButtonElement>(".mode-tabs [data-mode]")
      .forEach((button) =>
        button.setAttribute(
          "aria-pressed",
          String(button.dataset.mode === mode),
        ),
      );
    this.say(".jump-label", mode === "underwater" ? "Swim" : "Jump");
    this.say(".game-message", "");
    this.resize();
    this.updateUI();
    void this.refreshLeaderboard();
  }

  private resize(): void {
    const bounds = this.canvas.getBoundingClientRect();
    if (!bounds.width || !bounds.height) return;
    const ratio = Math.min(window.devicePixelRatio || 1, 2.5);
    this.canvas.width = Math.round(bounds.width * ratio);
    this.canvas.height = Math.round(bounds.height * ratio);
    const worldWidth = Math.max(
      480,
      bounds.width,
      (300 * bounds.width) / bounds.height,
    );
    if (Math.abs(this.game.width - worldWidth) > 1) this.pause();
    this.game.resize(worldWidth, (bounds.height * worldWidth) / bounds.width);
    this.draw();
  }
  private draw(impactAge = 1): void {
    this.context.setTransform(
      this.canvas.width / this.game.width,
      0,
      0,
      this.canvas.height / this.game.height,
      0,
      0,
    );
    renderScene(this.context, this.game, this.motion.matches, impactAge);
  }
  private startOrResume(): void {
    if (this.game.state === "paused") {
      this.sound.unlock();
      this.game.resume();
      this.updateUI();
      this.schedule();
    } else this.start();
    this.canvas.focus();
  }
  private start(): void {
    this.stopFrame();
    this.clearInput();
    ++this.runEpoch;
    this.game.start();
    this.sound.reset();
    this.sound.unlock();
    this.say(".game-message", "");
    this.updateUI();
    this.schedule();
    this.canvas.focus();
  }
  private jump(): void {
    if (this.game.state === "paused") return;
    if (this.game.state !== "running") this.start();
    this.sound.unlock();
    this.game.jump();
  }
  private pause(): void {
    this.clearInput();
    this.sound.pause();
    if (this.game.state !== "running") return;
    this.game.pause();
    this.stopFrame();
    this.updateUI();
    this.draw();
  }
  private togglePause(): void {
    if (this.game.state === "running") this.pause();
    else if (this.game.state === "paused") this.startOrResume();
  }
  private stopFrame(): void {
    cancelAnimationFrame(this.frame);
    this.frame = 0;
    this.previousTime = 0;
  }
  private schedule(): void {
    if (this.frame || !this.element.open || this.game.state !== "running")
      return;
    this.frame = requestAnimationFrame(this.tick);
  }
  private tick = (time: number): void => {
    this.frame = 0;
    const dt = this.previousTime ? (time - this.previousTime) / 1000 : 0;
    this.previousTime = time;
    this.game.update(dt);
    this.sound.update(this.game.metres);
    this.draw();
    this.updateScores();
    if (this.game.state === "over") {
      this.previousTime = 0;
      this.best = Math.max(this.best, this.game.score);
      this.updateUI();
      void this.finishRun(this.game.score, this.runEpoch);
      if (!this.motion.matches && this.element.open) {
        this.impactStartedAt = time;
        this.frame = requestAnimationFrame(this.animateImpact);
      }
    } else this.schedule();
  };

  // A short presentation-only burst after collision. The simulation and score stay frozen.
  private animateImpact = (time: number): void => {
    this.frame = 0;
    if (!this.element.open || document.hidden || this.game.state !== "over")
      return;
    const age = (time - this.impactStartedAt) / 1000;
    this.draw(age);
    if (age < 0.55 && !this.motion.matches)
      this.frame = requestAnimationFrame(this.animateImpact);
  };

  private updateScores(): void {
    const score = String(this.game.score).padStart(4, "0");
    if (this.find(".score-value").textContent !== score)
      this.say(".score-value", score);
    this.say(".best-value", String(this.best).padStart(4, "0"));
  }
  private updateUI(): void {
    const { state, mode } = this.game;
    const under = mode === "underwater";
    const stage = this.find(".game-stage");
    stage.dataset.mode = mode;
    this.find(".game-content").dataset.theme = mode;
    stage.dataset.state = state;
    this.find(".run-results").hidden = state !== "over";
    this.find(".stage-overlay").hidden = state === "running";
    this.say(".stage-kicker", `${under ? "UNDERWATER" : "SURFACE"} MODE`);
    this.say(
      ".stage-title",
      state === "over"
        ? "What a ride."
        : state === "paused"
          ? "Take a breather."
          : under
            ? "Go a little deeper."
            : "Find your flow.",
    );
    this.say(
      ".stage-description",
      state === "over"
        ? this.collisionDescription()
        : state === "paused"
          ? "Your ocean is waiting. Resume when you’re ready."
          : under
            ? "Swim over corals. Duck beneath low sharks."
            : "Jump the waves. Duck beneath low storm clouds.",
    );
    this.say(
      ".start-run",
      state === "over"
        ? "Ride again →"
        : state === "paused"
          ? "Resume run →"
          : "Start run →",
    );
    const pause = this.find<HTMLButtonElement>(".pause-button");
    pause.disabled = state === "ready" || state === "over";
    pause.textContent = state === "paused" ? "▶" : "Ⅱ";
    pause.setAttribute(
      "aria-label",
      state === "paused" ? "Resume game" : "Pause game",
    );
    this.find<HTMLButtonElement>(".jump").disabled = state === "paused";
    this.find<HTMLButtonElement>(".duck").disabled = state !== "running";
    this.find(".game-instructions").hidden = state === "over";
    this.updateScores();
  }

  private collisionDescription(): string {
    const kind = this.game.collision?.kind;
    const causes = {
      wave: "A wave caught you. Jump over the whole set.",
      cloud: "You hit a storm cloud. Hold Down to duck beneath low clouds.",
      coral: "You touched coral. Swim above the colony.",
      shark: "You hit a shark. Hold Down to duck beneath low sharks.",
    };
    return `${this.game.metres.toLocaleString()} m · ${kind ? causes[kind] : "There’s always another wave."}`;
  }

  private async finishRun(
    score: number,
    run: number,
  ): Promise<void> {
    if (!this.user) {
      this.say(
        ".game-message",
        "Nice run! Your guest best is kept for this tab only. No score was submitted.",
      );
      return;
    }
    try {
      await this.adapters.gameService.submitScore(score);
      if (
        this.runEpoch === run &&
        this.element.open
      ) {
        this.say(
          ".game-message",
          "Score submitted to the configured leaderboard.",
        );
        await this.refreshLeaderboard();
      }
    } catch {
      if (this.runEpoch === run)
        this.say(
          ".game-message",
          "Your score could not be submitted. Your current run is still shown here.",
        );
    }
  }

  private async refreshLeaderboard(): Promise<void> {
    const epoch = ++this.refreshEpoch;
    this.say(".leaderboard-caption", "Loading rankings…");
    this.find("tbody").replaceChildren();
    this.say(".player-position", "");
    try {
      const [board, best] = await Promise.all([
        this.adapters.gameService.getLeaderboard(),
        this.user
          ? this.adapters.gameService.getMyBestScore()
          : Promise.resolve(null),
      ]);
      if (epoch !== this.refreshEpoch || !this.element.open) return;
      const mock = board.source === "mock";
      this.say(
        ".session-note",
        this.user
          ? mock
            ? "Development mock: progress lasts in memory for this tab only. No global competition is connected."
            : "Your scores use the connected leaderboard service."
          : "Guest scores are session-only. No scores are submitted to the leaderboard.",
      );
      this.say(".mock-badge", mock ? "DEMO · MOCK DATA" : "GLOBAL RANKINGS");
      this.say(
        ".leaderboard-caption",
        `Both modes · best score per account · ${mock ? "demonstration only" : "best runs"}`,
      );
      if (best !== null && this.user) this.accountBest = Math.max(this.accountBest, best);
      const body = this.find("tbody");
      for (const entry of board.entries.slice(0, 5)) {
        const row = document.createElement("tr");
        if (entry.userId === this.user?.id) row.className = "current-player";
        for (const value of [
          String(entry.rank).padStart(2, "0"),
          entry.displayName,
          `${entry.score.toLocaleString()} m`,
        ]) {
          const cell = document.createElement("td");
          cell.textContent = value;
          row.append(cell);
        }
        body.append(row);
      }
      this.say(
        ".player-position",
        board.currentPlayer && this.user
          ? `Your position: #${board.currentPlayer.rank} · ${board.currentPlayer.score.toLocaleString()} m`
          : this.user
            ? "Complete a run to join the rankings."
            : "Guests are not ranked. Your run is just for you.",
      );
      if (!board.entries.length)
        this.say(
          ".leaderboard-caption",
          "No scores yet. Be the first to complete a run.",
        );
      this.updateScores();
    } catch {
      if (epoch === this.refreshEpoch)
        this.say(
          ".leaderboard-caption",
          "Rankings are unavailable. You can still play.",
        );
    }
  }

  private onClose(): void {
    this.display.exit();
    this.sound.pause();
    this.pause();
    this.stopFrame();
    this.observer.disconnect();
    ++this.refreshEpoch;
    ++this.authEpoch;
    ++this.runEpoch;
    this.opening = false;
    document.body.style.overflow = this.oldOverflow;
    this.opener?.focus();
  }
  destroy(): void {
    if (this.element.open) {
      this.element.close();
      this.onClose();
    }
    this.events.abort();
    this.display.destroy();
    this.sound.destroy();
    this.stopFrame();
    this.observer.disconnect();
    this.element.remove();
  }
}
