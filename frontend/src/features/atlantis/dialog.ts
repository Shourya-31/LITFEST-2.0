import { GameDisplay } from "../game/display.js";
import { MilestoneSound } from "../game/sound.js";
import { AtlantisRun } from "./run.js";
import { atlantisMarkup, authMarkup, boardMarkup, failedMarkup, instructionsMarkup, levelMarkup, successMarkup, victoryMarkup } from "./components.js";
import { levelPopupMarkup, mapMarkup, mapNodeState } from "./map.js";
import { mergeChamberRecords } from "./progress.js";
import type { AtlantisAdapters, AtlantisChamberRecords, AtlantisProgress, AtlantisUser } from "./types.js";

type View = "auth" | "puzzle" | "paused" | "success" | "victory" | "instructions" | "leaderboard" | "map" | "failed";
export class AtlantisDialog {
  readonly element = document.createElement("dialog");
  readonly run = new AtlantisRun();
  private adapters: AtlantisAdapters;
  private now: () => number;
  private user: AtlantisUser | null = null;
  private accountId: string | null = null;
  private progress: AtlantisProgress | null = null;
  private chamberRecords: AtlantisChamberRecords = {};
  private selectedLevel: number | null = null;
  private revealLevel: number | null = null;
  private epoch = 0;
  private boardEpoch = 0;
  private view: View = "auth";
  private returnView: View = "map";
  private infoReturnView: View = "auth";
  private authMessage = "Checking your session…";
  private loginPending = false;
  private opener: HTMLElement | null = null;
  private overflow = "";
  private events = new AbortController();
  private sound = new MilestoneSound();
  private display: GameDisplay;
  private interval: number | undefined;
  private lastTime = 0;
  private points = 0;
  private saveQueue = Promise.resolve();
  constructor(adapters: AtlantisAdapters, now: () => number = () => performance.now()) {
    this.adapters = adapters; this.now = now;
    this.element.className = "game-dialog atlantis-dialog";
    this.element.setAttribute("aria-labelledby", "at-title");
    this.element.innerHTML = atlantisMarkup;
    document.body.append(this.element);
    this.display = new GameDisplay(this.element, this.find(".atlantis-shell"), this.find(".at-fullscreen"), () => this.pause());
    const signal = this.events.signal;
    this.element.addEventListener("click", event => {
      const button = (event.target as HTMLElement).closest<HTMLButtonElement>("[data-action]");
      if (button && !button.disabled) {
        if (button.dataset.action === "map-select") this.selectLevel(Number(button.dataset.level));
        else if (button.dataset.action === "map-play") this.playLevel(Number(button.dataset.level));
        else if (button.dataset.action === "answer") this.answer(Number(button.dataset.option));
        else void this.action(button.dataset.action!);
      }
    }, {signal});
    this.element.addEventListener("close", () => this.onClose(), {signal});
    this.element.addEventListener("cancel", event => {
      if (this.selectedLevel !== null) { event.preventDefault(); this.closeLevelPopup(); }
      else if (this.display.expanded) { event.preventDefault(); this.display.exit(); }
      else this.suspend();
    }, {signal});
    this.element.addEventListener("keydown", event => {
      const popup = this.element.querySelector<HTMLElement>(".at-level-popup");
      if (popup && event.key === "Escape") {
        event.preventDefault(); event.stopPropagation(); this.closeLevelPopup(); return;
      }
      if (!popup || event.key !== "Tab") return;
      const buttons = [...popup.querySelectorAll<HTMLButtonElement>("button:not(:disabled)")];
      const first = buttons[0], last = buttons.at(-1)!;
      if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last.focus(); }
      else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first.focus(); }
    }, {signal});
    document.addEventListener("visibilitychange", () => { if (document.hidden) this.pause(); }, {signal});
    window.addEventListener("blur", () => this.pause(), {signal});
  }
  private find<T extends HTMLElement = HTMLElement>(selector: string): T { return this.element.querySelector<T>(selector)!; }
  private answer(option: number): void {
    if (this.view !== "puzzle") return;
    this.updateClock();
    const outcome = this.run.answer(option);
    if (!outcome) return;
    if (outcome.correct) {
      this.element.classList.add("at-earned"); this.sound.update(this.run.correctAnswers * 100);
    }
    this.render("puzzle"); this.find('[data-action="continue"]').focus({preventScroll:true});
  }
  private note(text: string): void { this.find(".at-session").textContent = text; }
  private setAuthMessage(text: string): void {
    this.authMessage = text;
    const message = this.element.querySelector(".at-auth-message");
    if (message) message.textContent = text;
  }
  async open(opener: HTMLElement): Promise<void> {
    if (this.element.open) return;
    this.opener = opener; this.overflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    this.authMessage = "Checking your session…";
    this.render("auth"); this.element.showModal();
    this.interval = window.setInterval(() => this.updateClock(), 200);
    this.find<HTMLButtonElement>('[data-action="close"]').focus();
    const epoch = ++this.epoch;
    try {
      const user = await this.adapters.auth.getUser();
      if (epoch !== this.epoch || !this.element.open) return;
      this.setUser(user);
      if (user) {
        this.setAuthMessage("Loading your Atlantis expedition records…");
        await this.loadProgress(epoch);
        if (epoch === this.epoch && this.element.open) this.enterGame();
      }
      else this.setAuthMessage("Login, or choose Continue Anyway to explore as a guest.");
    } catch {
      if (epoch === this.epoch && this.element.open) this.setAuthMessage("Your session could not be checked. You can continue as a guest.");
    }
  }
  private setUser(user: AtlantisUser | null): void {
    if ((user?.id ?? null) !== this.accountId) {
      this.run.start("unstarted"); this.run.state = "ready";
      this.progress = null; this.chamberRecords = {}; this.revealLevel = null; this.sound.reset(); this.sound.pause();
    }
    this.user = user; this.accountId = user?.id ?? null;
    this.note(user ? "Account connected. Progress is temporary until a persistence service confirms a save."
      : "Guest expedition · Progress stays in this tab only. No leaderboard scores are submitted.");
  }
  private async loadProgress(epoch: number): Promise<void> {
    if (!this.user) return;
    const userId = this.user.id;
    try {
      const progress = await this.adapters.service.getAtlantisProgress(userId);
      if (epoch !== this.epoch || !this.element.open || this.user?.id !== userId) return;
      if (progress && progress.userId !== userId) throw new Error("Progress belongs to a different account.");
      this.chamberRecords = mergeChamberRecords(this.chamberRecords,progress?.chambers);
      this.progress = progress;
    } catch { if (epoch === this.epoch) this.note("Account progress could not be loaded. You can still play; saving is unconfirmed."); }
  }
  private async login(): Promise<void> {
    if (this.loginPending) return;
    this.loginPending = true;
    const epoch = ++this.epoch;
    const button = this.find<HTMLButtonElement>('[data-action="login"]'); button.disabled = true;
    try {
      await this.adapters.auth.login();
      const user = await this.adapters.auth.getUser();
      if (epoch !== this.epoch || !this.element.open) return;
      if (user) {
        this.setUser(user); await this.loadProgress(epoch);
        if (epoch === this.epoch && this.element.open) this.enterGame();
      }
      else this.setAuthMessage("Finish the site login, then reopen Atlantis, or choose Continue Anyway.");
    } catch (error) {
      if (epoch === this.epoch && this.element.open) this.setAuthMessage(error instanceof Error ? error.message : "Login is unavailable. Continue as a guest.");
    } finally {
      this.loginPending = false; button.disabled = false;
      const current = this.element.querySelector<HTMLButtonElement>('[data-action="login"]');
      if (current) current.disabled = false;
    }
  }
  private async action(action: string): Promise<void> {
    switch (action) {
      case "close": this.suspend(); this.element.close(); return;
      case "login": await this.login(); return;
      case "guest": ++this.epoch; this.setUser(null); this.enterGame(); return;
      case "sound": {
        this.sound.setEnabled(!this.sound.enabled);
        const button = this.find(".at-sound");
        button.setAttribute("aria-pressed", String(this.sound.enabled));
        button.setAttribute("aria-label", this.sound.enabled ? "Mute Atlantis sound" : "Enable Atlantis sound");
        button.title = this.sound.enabled ? "Mute sound" : "Enable sound";
        if (this.sound.enabled && this.run.state === "playing") this.sound.unlock();
        return;
      }
      case "again": this.start(); return;
      case "next": if (this.run.state === "unlocked") this.render("map"); return;
      case "map-close": this.closeLevelPopup(); return;
      case "map-current": this.scrollMapToCurrent(); return;
      case "retry": this.run.retry(); this.lastTime = this.now(); this.sound.unlock(); this.render("puzzle"); return;
      case "resume": this.resume(); return;
      case "pause": if (this.run.state === "paused") this.resume(); else this.pause(); return;
      case "continue":
        if (this.run.state !== "feedback") return;
        this.points = this.run.continue(); this.lastTime = this.now(); this.element.classList.remove("at-earned");
        if (this.run.result().completed) { this.render("victory"); this.checkpoint(); }
        else if (this.run.highestCompletedLevel === this.run.level.id) { this.revealLevel = this.run.level.id + 1; this.render("success"); this.checkpoint(); }
        else this.render(this.run.attemptAnswered === this.run.level.questionCount ? "failed" : "puzzle");
        return;
      case "hint":
        this.updateClock(); if (this.run.state !== "playing") return;
        this.run.hint(); this.find(".at-hint").hidden = false;
        this.find('[data-action="hint"]').textContent = "View hint again"; this.updateHUD(); return;
      case "instructions":
        if (this.view === "instructions") { await this.action("back"); return; }
        this.infoReturnView = this.view === "puzzle" ? "paused" : this.view;
        this.suspend(); this.render("instructions"); return;
      case "leaderboard": case "home":
        this.returnView = this.view === "puzzle" ? "paused" : this.view;
        this.suspend();
        if (action === "leaderboard") await this.leaderboard();
        else this.render(action === "home" ? "map" : "instructions");
        return;
      case "back": {
        const fromInfo = this.view === "instructions", target = fromInfo ? this.infoReturnView : this.returnView;
        if (target === "leaderboard") await this.leaderboard();
        else this.render(this.run.state === "feedback" && target === "paused" ? "puzzle" : target);
        if (fromInfo) this.find(".at-info").focus({preventScroll:true});
        return;
      }
    }
  }
  private enterGame(): void {
    if (this.run.state === "ready") this.start();
    else { this.suspend(); this.render("map"); }
  }
  private start(): void {
    this.run.start(globalThis.crypto?.randomUUID?.() ?? `atlantis-${Date.now()}`);
    this.lastTime = this.now(); this.sound.reset(); this.sound.unlock();
    this.revealLevel = null; this.run.pause();
    this.element.classList.remove("at-earned"); this.render("map");
  }
  private selectLevel(id: number): void {
    if (this.view !== "map" || !Number.isInteger(id) || id < 1 || id > 10 || mapNodeState(this.run,id) === "locked") return;
    this.closeLevelPopup(); this.selectedLevel = id;
    this.find(".atlantis-shell").insertAdjacentHTML("beforeend",levelPopupMarkup(this.run,id,this.chamberRecords[id] ?? this.run.chambers[id]));
    for (const selector of [".at-panel",".at-toolbar",".at-session"]) this.find(selector).inert = true;
    this.find<HTMLButtonElement>(".at-play-level, .at-popup-close").focus({preventScroll:true});
  }
  private closeLevelPopup(): void {
    const selected = this.selectedLevel;
    this.selectedLevel = null; this.element.querySelector(".at-level-overlay")?.remove();
    for (const selector of [".at-panel",".at-toolbar",".at-session"]) this.find(selector).inert = false;
    if (selected !== null && this.element.open) this.element.querySelector<HTMLButtonElement>(`[data-action="map-select"][data-level="${selected}"]`)?.focus({preventScroll:true});
  }
  private playLevel(id: number): void {
    if (this.view !== "map" || this.selectedLevel !== id || !this.run.enterLevel(id)) return;
    this.closeLevelPopup(); this.lastTime = this.now(); this.element.classList.remove("at-earned");
    this.sound.unlock(); this.render("puzzle");
  }
  private scrollMapToCurrent(): void {
    if (this.view !== "map") return;
    const panel = this.find(".at-panel"), id = Math.min(10,this.run.highestCompletedLevel + 1);
    const node = this.find(`[data-action="map-select"][data-level="${id}"]`);
    const top = id === 1 ? 0 : Math.max(0,node.getBoundingClientRect().top - panel.getBoundingClientRect().top + panel.scrollTop - panel.clientHeight * .4);
    panel.scrollTo({top,behavior:window.matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth"});
    node.focus({preventScroll:true});
  }
  private resume(): void {
    if (this.run.state === "failed") { this.render("failed"); return; }
    this.run.resume(); this.lastTime = this.now(); this.sound.unlock(); this.render("puzzle");
  }
  private suspend(): void { this.updateClock(); this.run.pause(); this.sound.pause(); }
  private pause(): void {
    if (this.run.state !== "playing") return;
    this.suspend();
    if (this.element.open) this.render(this.run.feedback ? "puzzle" : "paused");
  }
  /** Uses actual active wall time; menu/blur/close transitions synchronize before pausing. */
  updateClock(): void {
    const time = this.now();
    if (this.element.open && this.run.state === "playing") {
      this.run.tick(Math.max(0, (time - this.lastTime) / 1000));
      if (this.run.feedback) { this.sound.pause(); this.render("puzzle"); }
      this.updateHUD();
    }
    this.lastTime = time;
  }
  private updateHUD(): void {
    const values = {score:String(this.run.score), level:`${this.run.level.id} / 10`,
      question:`${this.run.questionIndex + 1} / ${this.run.level.questionCount}`,
      timer:`${Math.ceil(this.run.remainingSeconds)}s`, hints:String(this.run.hintsUsed.size)};
    for (const [key, value] of Object.entries(values)) this.find(`[data-hud="${key}"]`).textContent = value;
    const timer = this.find('[data-hud="timer-label"]');
    timer.firstChild!.textContent = "TIME LEFT ";
    const progress = this.find<HTMLProgressElement>("progress"); progress.value = this.run.highestCompletedLevel;
    progress.setAttribute("aria-valuetext", `${this.run.highestCompletedLevel} of 10 chambers completed`);
    const questionProgress = this.find<HTMLProgressElement>(".at-question-progress");
    questionProgress.max = this.run.level.questionCount; questionProgress.value = this.run.attemptAnswered;
    questionProgress.setAttribute("aria-valuetext", `${this.run.attemptAnswered} of ${this.run.level.questionCount} questions answered`);
    this.find<HTMLButtonElement>(".at-pause").disabled = !["playing", "paused"].includes(this.run.state) || !["puzzle", "paused"].includes(this.view);
    this.find(".at-pause").textContent = this.run.state === "paused" ? "▶" : "Ⅱ";
    this.find(".at-pause").setAttribute("aria-label", this.run.state === "paused" ? "Resume expedition" : "Pause expedition");
  }
  private render(view: View): void {
    this.closeLevelPopup();
    this.view = view;
    const panel = this.find(".at-panel");
    panel.classList.toggle("is-map",view === "map");
    this.element.dataset.state = this.run.state;
    this.find(".at-hud").hidden = ["auth", "instructions", "leaderboard", "map"].includes(view);
    this.find(".at-info").setAttribute("aria-pressed",String(view === "instructions"));
    switch (view) {
      case "auth": panel.innerHTML = authMarkup; this.setAuthMessage(this.authMessage); this.find<HTMLButtonElement>('[data-action="login"]').disabled = this.loginPending; break;
      case "puzzle": panel.innerHTML = levelMarkup(this.run); break;
      case "instructions": panel.innerHTML = instructionsMarkup(); break;
      case "map": panel.innerHTML = mapMarkup(this.run,this.chamberRecords,this.revealLevel); this.revealLevel = null; break;
      case "success": panel.innerHTML = successMarkup(this.run, this.points); break;
      case "victory": panel.innerHTML = victoryMarkup(this.run); break;
      case "paused": panel.innerHTML = `<div class="at-intro"><span class="at-kicker">YOUR AIR IS SAFE</span><h2 id="at-title">The city can wait.</h2><p class="at-story">Your expedition is paused. Continue when you are ready.</p><button class="at-button" data-action="resume">Resume expedition →</button></div>`; break;
      case "failed": panel.innerHTML = failedMarkup(this.run); break;
      case "leaderboard": panel.innerHTML = `<h2 id="at-title">Reading the city’s records…</h2><button class="at-button" data-action="back">Back to expedition →</button>`; break;
    }
    this.updateHUD(); panel.scrollTop = 0;
    const heading = this.find("#at-title"); heading.tabIndex = -1;
    if (this.element.open) heading.focus({preventScroll:true});
    if (view === "map") this.scrollMapToCurrent();
  }
  private async leaderboard(): Promise<void> {
    this.render("leaderboard"); const token = ++this.boardEpoch;
    try {
      const board = await this.adapters.service.getAtlantisLeaderboard();
      if (token !== this.boardEpoch || !this.element.open || this.view !== "leaderboard") return;
      this.find(".at-panel").innerHTML = boardMarkup(board);
    } catch {
      if (token === this.boardEpoch && this.view === "leaderboard") this.find(".at-panel").innerHTML = `<h2 id="at-title">Records are unavailable.</h2><p>You can still explore every chamber.</p><button class="at-button" data-action="back">Back to expedition →</button>`;
    }
  }
  private checkpoint(): void {
    this.chamberRecords = mergeChamberRecords(this.chamberRecords,this.run.chambers);
    if (!this.user) return;
    const userId = this.user.id, epoch = this.epoch, result = this.run.result();
    const old = this.progress;
    const progress: AtlantisProgress = {userId, chambers:mergeChamberRecords(old?.chambers,this.chamberRecords),unlockedLevel:Math.max(old?.unlockedLevel ?? 1, Math.min(10, result.highestCompletedLevel + 1)),
      highestCompletedLevel:Math.max(old?.highestCompletedLevel ?? 0, result.highestCompletedLevel),
      bestScore:Math.max(old?.bestScore ?? 0, result.score), completedRuns:(old?.completedRuns ?? 0) + (result.completed ? 1 : 0),
      bestCompletionTime:result.completed ? Math.min(old?.bestCompletionTime ?? Infinity, result.elapsedSeconds) : old?.bestCompletionTime ?? null};
    this.progress = progress;
    this.saveQueue = this.saveQueue.then(async () => {
      if ((await this.adapters.auth.getUser())?.id !== userId) return;
      const saved = await this.adapters.service.saveAtlantisProgress(progress);
      await this.adapters.service.submitAtlantisScore({...result, userId});
      if (epoch !== this.epoch || !this.element.open) return;
      this.note(saved.persisted ? "Progress saved to your account." : "Temporary preview · Progress is in memory for this tab only. No server save confirmed.");
      if (result.completed) {
        const board = await this.adapters.service.getAtlantisLeaderboard();
        if (epoch === this.epoch && this.view === "victory" && board.source === "api" && board.currentPlayer) {
          this.find(".at-final-rank").textContent = `Account rank: #${board.currentPlayer.rank}`;
        }
      }
    }).catch(() => { if (epoch === this.epoch && this.element.open) this.note("Saving could not be confirmed. You can keep exploring; progress remains in this tab."); });
  }
  private onClose(): void {
    this.closeLevelPopup();
    this.stopClock();
    this.suspend(); this.display.exit(); ++this.epoch; ++this.boardEpoch;
    document.body.style.overflow = this.overflow; this.opener?.focus();
  }
  private stopClock(): void {
    if (this.interval !== undefined) window.clearInterval(this.interval);
    this.interval = undefined;
  }
  destroy(): void {
    if (this.element.open) { this.element.close(); this.onClose(); }
    this.stopClock(); this.events.abort(); this.display.destroy(); this.sound.destroy(); this.element.remove();
  }
}
