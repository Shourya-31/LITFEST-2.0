import test from "node:test";
import assert from "node:assert/strict";
import { Window } from "happy-dom";
import { GameDialog } from "../src/features/game/game-dialog.js";
import { MockGameService } from "../src/services/game-service.js";
import { developmentAuth } from "../src/services/auth.js";
import type { RunnerEngine } from "../src/features/game/engine.js";
import type { AuthAdapter, GameService, GameUser } from "../src/types/game.js";

// DOM integration tests: rendering/layout and native focus trapping need a real browser.
async function environment(width = 900, auth: AuthAdapter = developmentAuth) {
  const win = new Window({ url: "http://localhost:5173" });
  const globals = new Map<string, PropertyDescriptor | undefined>();
  const install = (name: string, value: unknown) => {
    globals.set(name, Object.getOwnPropertyDescriptor(globalThis, name));
    Object.defineProperty(globalThis, name, {
      configurable: true,
      writable: true,
      value,
    });
  };
  const frames = new Map<number, FrameRequestCallback>();
  let next = 0;
  let time = 0;
  let disconnected = 0;
  install("window", win);
  install("document", win.document);
  install("AbortController", win.AbortController);
  install("matchMedia", win.matchMedia.bind(win));
  install(
    "ResizeObserver",
    class {
      observe() {}
      disconnect() {
        disconnected++;
      }
    },
  );
  install("requestAnimationFrame", (callback: FrameRequestCallback) => {
    frames.set(++next, callback);
    return next;
  });
  install("cancelAnimationFrame", (id: number) => frames.delete(id));
  const ctx = new Proxy(
    {},
    {
      get: (_, name) =>
        name === "createLinearGradient" || name === "createRadialGradient"
          ? () => ({ addColorStop() {} })
          : () => {},
      set: () => true,
    },
  );
  Object.defineProperty(win.HTMLCanvasElement.prototype, "getContext", {
    configurable: true,
    value: () => ctx,
  });
  Object.defineProperty(
    win.HTMLCanvasElement.prototype,
    "getBoundingClientRect",
    {
      configurable: true,
      value: () => ({ width, height: width / (width < 700 ? 1.42 : 2.38) }),
    },
  );
  const originalRandom = Math.random;
  Math.random = () => 0.1;
  const mock = new MockGameService(() => auth.getUser());
  const calls = { submit: 0, best: 0 };
  const service: GameService = {
    getLeaderboard: () => mock.getLeaderboard(),
    getMyBestScore: () => {
      calls.best++;
      return mock.getMyBestScore();
    },
    submitScore: (score) => {
      calls.submit++;
      return mock.submitScore(score);
    },
  };
  const dialog = new GameDialog({ auth, gameService: service });
  const opener = win.document.createElement("button");
  opener.textContent = "Play Game";
  win.document.body.append(opener);
  const query = <T extends HTMLElement = HTMLElement>(selector: string) =>
    dialog.element.querySelector<T>(selector)!;
  const click = (selector: string) =>
    query<HTMLButtonElement>(selector).click();
  const flush = async () => {
    for (let i = 0; i < 12; i++) await Promise.resolve();
  };
  return {
    win,
    dialog,
    opener,
    calls,
    frames,
    query,
    get game() { return (dialog as unknown as { game: RunnerEngine }).game; },
    click,
    flush,
    get disconnected() {
      return disconnected;
    },
    async open() {
      await dialog.open(opener as unknown as HTMLElement);
      await flush();
    },
    tick(count: number) {
      for (let i = 0; i < count; i++) {
        time += 1000 / 60;
        const pending = [...frames.values()];
        frames.clear();
        for (const callback of pending) callback(time);
      }
    },
    key(code: string, type = "keydown", repeat = false) {
      query("canvas").dispatchEvent(
        new win.KeyboardEvent(type, {
          code,
          repeat,
          bubbles: true,
          cancelable: true,
        }) as unknown as Event,
      );
    },
    pointer(selector: string, type: string, pointerId = 1) {
      query(selector).dispatchEvent(new win.PointerEvent(type, {
        pointerId, button: 0, bubbles: true, cancelable: true,
      }) as unknown as Event);
    },
    async cleanup() {
      dialog.destroy();
      Math.random = originalRandom;
      await win.happyDOM.close();
      for (const [name, descriptor] of globals) {
        if (descriptor) Object.defineProperty(globalThis, name, descriptor);
        else Reflect.deleteProperty(globalThis, name);
      }
    },
  };
}

test("compact modal keeps its HUD inside the scene and its mode selector after the scene", async () => {
  const env = await environment(358);
  try {
    await env.open(); env.click(".continue");
    const stage = env.query(".game-stage");
    assert.equal(env.query(".game-content").children.length, 2);
    assert.equal(stage.nextElementSibling, env.query(".mode-switcher"));
    assert.equal(env.query(".mode-switcher").contains(env.query(".mode-tabs")), true);
    assert.equal(env.dialog.element.querySelector(".dialog-heading"), null);
    assert.equal(env.dialog.element.querySelector(".controls-row"), null);
    for (const selector of [".scorebar", ".stage-actions", ".close-dialog", ".run-results"])
      assert.equal(stage.contains(env.query(selector)), true);
    assert.equal(env.query(".run-results").hidden, true);
    env.click(".start-run"); env.tick(600); await env.flush();
    assert.equal(env.query(".run-results").hidden, false);
    assert.equal(stage.contains(env.query(".leaderboard")), true);
  } finally { await env.cleanup(); }
});

test("keyboard release shortens a jump and repeated keys do not trigger a landing jump", async () => {
  const peaks: number[] = [];
  for (const short of [true, false]) {
    const env = await environment();
    try {
      await env.open(); env.click(".continue");
      env.key("Space");
      if (short) env.key("Space", "keyup");
      let peak = 0;
      for (let i = 0; i < 50; i++) {
        env.key("Space", "keydown", true);
        env.tick(1); peak = Math.max(peak, -env.game.playerY);
      }
      peaks.push(peak);
      assert.equal(env.game.playerY, 0);
    } finally { await env.cleanup(); }
  }
  assert.ok(peaks[1] - peaks[0] > 30);
});

test("touch hold, multi-touch release, cancellation, duck and blur clear inputs", async () => {
  const env = await environment(358);
  try {
    await env.open(); env.click(".continue"); env.click(".start-run");
    env.pointer("canvas", "pointerdown", 1);
    env.tick(7);
    env.pointer(".jump", "pointerdown", 2);
    env.pointer("canvas", "pointerup", 1);
    const before = env.game.velocityY;
    env.tick(1);
    assert.ok(env.game.velocityY < -300, "another finger still holds the jump");
    assert.ok(env.game.velocityY > before);
    env.pointer(".jump", "pointercancel", 2);
    env.tick(1);
    assert.ok(env.game.velocityY >= -300, "cancelling the final finger releases the jump");
    env.tick(40);
    env.pointer(".duck", "pointerdown", 3);
    assert.equal(env.game.ducking, true);
    env.pointer(".duck", "pointerup", 3);
    assert.equal(env.game.ducking, false);
    env.key("ArrowDown");
    assert.equal(env.game.ducking, true);
    env.key("ArrowDown", "keyup");
    assert.equal(env.game.ducking, false);
    env.pointer(".duck", "pointerdown", 4);
    env.win.dispatchEvent(new env.win.Event("blur"));
    assert.equal(env.game.state, "paused");
    assert.equal(env.game.ducking, false);
    env.click(".start-run");
    env.key("Space");
    assert.ok(env.game.velocityY < 0, "resuming does not leave duck stuck");
  } finally { await env.cleanup(); }
});

test("guest prompt, pending login, modal close, focus restoration and cleanup", async () => {
  const env = await environment();
  try {
    await env.open();
    assert.equal(env.dialog.element.open, true);
    assert.equal(env.win.document.body.style.overflow, "hidden");
    assert.match(
      env.query(".auth-gate").textContent!,
      /Log in to save your progress and compete on the leaderboard!/,
    );
    assert.equal(env.query(".game-content").hidden, true);
    env.click(".login");
    await env.flush();
    assert.match(
      env.query(".auth-message").textContent!,
      /integration is pending/,
    );
    env.click(".continue");
    await env.flush();
    assert.equal(env.query(".game-content").hidden, false);
    assert.equal(
      env.query(".sound-button").getAttribute("aria-pressed"),
      "true",
    );
    env.click(".sound-button");
    assert.equal(
      env.query(".sound-button").getAttribute("aria-pressed"),
      "false",
    );
    env.click(".sound-button");
    assert.equal(
      env.query(".sound-button").getAttribute("aria-pressed"),
      "true",
    );
    assert.equal(env.query(".run-results").hidden, true);
    assert.equal(env.dialog.element.querySelectorAll("tbody tr").length, 3);
    assert.match(env.query(".mock-badge").textContent!, /MOCK/);
    env.click(".close-dialog");
    assert.equal(env.dialog.element.open, false);
    assert.equal(env.win.document.body.style.overflow, "");
    assert.equal(env.win.document.activeElement, env.opener);
    assert.equal(env.frames.size, 0);
    assert.ok(env.disconnected > 0);
  } finally {
    await env.cleanup();
  }
});

test("guests compare current distance with their own session best across runs and modes", async () => {
  const env = await environment(358);
  try {
    await env.open(); env.click(".continue"); await env.flush();
    assert.match(env.query(".scorebar").getAttribute("aria-label")!, /Guest current distance/);
    assert.equal(env.query(".best-value").textContent, "0000");
    env.click(".start-run"); env.tick(600); await env.flush();
    const surfaceBest = Number(env.query(".best-value").textContent);
    assert.ok(surfaceBest > 0);
    assert.equal(Number(env.query(".score-value").textContent), surfaceBest);
    env.click(".start-run"); env.tick(30);
    const current = Number(env.query(".score-value").textContent);
    assert.ok(current > 0 && current < surfaceBest);
    assert.equal(Number(env.query(".best-value").textContent), surfaceBest);
    assert.equal(env.query(".scorebar").closest("[hidden]"), null);
    env.click('.mode-tabs [data-mode="underwater"]'); await env.flush();
    assert.equal(Number(env.query(".best-value").textContent), surfaceBest);
    env.click(".start-run"); env.tick(600); await env.flush();
    const combinedBest = Math.max(surfaceBest, Number(env.query(".score-value").textContent));
    assert.equal(Number(env.query(".best-value").textContent), combinedBest);
    env.click('.mode-tabs [data-mode="surface"]'); await env.flush();
    assert.equal(Number(env.query(".best-value").textContent), combinedBest);
    env.click(".close-dialog"); await env.open(); env.click(".continue");
    assert.equal(Number(env.query(".best-value").textContent), combinedBest);
    env.click('.mode-tabs [data-mode="underwater"]'); await env.flush();
    assert.equal(Number(env.query(".best-value").textContent), combinedBest);
    assert.equal(env.calls.submit, 0);
    assert.equal(env.calls.best, 0);
    assert.equal(env.win.localStorage.length, 0);
    assert.equal(env.win.sessionStorage.length, 0);
  } finally { await env.cleanup(); }
});

for (const width of [358, 900]) {
  test(`guest gameplay, modes, pause, restart and session best at CSS width ${width}`, async () => {
    const env = await environment(width);
    try {
      await env.open();
      env.click(".continue");
      await env.flush();
      env.click(".start-run");
      assert.equal(env.query(".stage-overlay").hidden, true);
      assert.equal(env.query(".run-results").hidden, true);
      env.key("ArrowUp");
      env.tick(60);
      assert.ok(Number(env.query(".score-value").textContent) > 0);
      env.key("KeyP");
      assert.equal(env.query(".run-results").hidden, true);
      const paused = env.query(".score-value").textContent;
      env.tick(60);
      assert.equal(env.query(".score-value").textContent, paused);
      assert.equal(env.frames.size, 0);
      env.click(".start-run");
      env.tick(600);
      await env.flush();
      assert.equal(env.query(".stage-title").textContent, "What a ride.");
      assert.match(
        env.query(".stage-description").textContent!,
        /wave caught you/,
      );
      assert.equal(env.query(".run-results").hidden, false);
      const finishedScore = env.query(".score-value").textContent;
      env.tick(60);
      assert.equal(env.query(".score-value").textContent, finishedScore);
      assert.equal(env.frames.size, 0);
      const best = Number(env.query(".best-value").textContent);
      assert.ok(best > 0);
      assert.equal(env.calls.submit, 0);
      assert.equal(env.calls.best, 0);
      assert.equal(env.win.localStorage.length, 0);
      assert.equal(env.win.sessionStorage.length, 0);
      env.click(".restart");
      assert.equal(env.query(".run-results").hidden, true);
      assert.equal(env.query(".score-value").textContent, "0000");
      assert.equal(Number(env.query(".best-value").textContent), best);
      env.click('.mode-tabs [data-mode="underwater"]');
      await env.flush();
      assert.equal(env.query(".run-results").hidden, true);
      assert.equal(
        env.query('.mode-tabs [data-mode="underwater"]').getAttribute("aria-pressed"),
        "true",
      );
      assert.equal(Number(env.query(".best-value").textContent), best);
      assert.equal(env.query(".jump-label").textContent, "Swim");
      assert.match(
        env.query(".leaderboard-caption").textContent!,
        /Both modes · best score per account/,
      );
      env.click(".start-run");
      env.tick(600);
      await env.flush();
      assert.equal(env.query(".stage-title").textContent, "What a ride.");
      assert.match(
        env.query(".stage-description").textContent!,
        /touched coral/,
      );
      assert.equal(env.query(".run-results").hidden, false);
      assert.equal(env.calls.submit, 0);
    } finally {
      await env.cleanup();
    }
  });
}

test("hidden tab and closing pause a run and reopening does not advance it", async () => {
  const env = await environment();
  try {
    await env.open();
    env.click(".continue");
    env.click(".start-run");
    env.tick(50);
    Object.defineProperty(env.win.document, "hidden", {
      configurable: true,
      value: true,
    });
    env.win.document.dispatchEvent(new env.win.Event("visibilitychange"));
    assert.equal(env.query(".stage-title").textContent, "Take a breather.");
    assert.equal(env.frames.size, 0);
    Object.defineProperty(env.win.document, "hidden", {
      configurable: true,
      value: false,
    });
    env.click(".start-run");
    env.tick(25);
    env.click(".close-dialog");
    const score = env.query(".score-value").textContent;
    env.tick(100);
    await env.open();
    env.click(".continue");
    assert.equal(env.query(".stage-title").textContent, "Take a breather.");
    assert.equal(env.query(".score-value").textContent, score);
    assert.equal(env.frames.size, 0);
    env.click(".start-run");
    assert.equal(env.frames.size, 1);
  } finally {
    await env.cleanup();
  }
});

test("authenticated player skips prompt and submits to a labeled mock without HTML injection", async () => {
  const user = { id: "test", displayName: "<img src=x onerror=alert(1)>" };
  const env = await environment(900, {
    async getUser() {
      return user;
    },
    async login() {},
  });
  try {
    await env.open();
    assert.equal(env.query(".auth-gate").hidden, true);
    assert.equal(env.query(".game-content").hidden, false);
    env.click(".start-run");
    env.tick(600);
    await env.flush();
    assert.equal(env.calls.submit, 1);
    assert.ok(env.calls.best > 0);
    assert.ok(Number(env.query(".best-value").textContent) > 0);
    assert.match(env.query(".player-position").textContent!, /Your position:/);
    assert.equal(env.dialog.element.querySelector("img"), null);
    assert.ok(env.query("tbody").textContent?.includes(user.displayName));
  } finally {
    await env.cleanup();
  }
});

test("both modes share one account rank and best without leaking it into another account", async () => {
  let user = { id: "combined-player", displayName: "Combined Player" };
  const env = await environment(900, {
    async getUser() { return user; },
    async login() {},
  });
  const finish = async (metres: number) => {
    env.click(".start-run");
    env.game.distance = metres * 12;
    env.game.obstacles = [{
      x: env.game.playerX - 20, y: env.game.ground - 55, w: 80, h: 34,
      kind: env.game.mode === "surface" ? "cloud" : "shark", variant: 0.5,
    }];
    env.tick(3); await env.flush();
    assert.equal(env.game.state, "over");
  };
  try {
    await env.open(); await finish(800);
    assert.equal(Number(env.query(".best-value").textContent), 800);
    assert.match(env.query(".player-position").textContent!, /#3/);
    env.click('.mode-tabs [data-mode="underwater"]'); await env.flush();
    assert.equal(Number(env.query(".best-value").textContent), 800);
    await finish(1500);
    assert.equal(Number(env.query(".best-value").textContent), 1500);
    assert.match(env.query(".player-position").textContent!, /#1/);
    env.click('.mode-tabs [data-mode="surface"]'); await env.flush();
    await finish(200);
    assert.equal(Number(env.query(".best-value").textContent), 1500);
    assert.match(env.query(".player-position").textContent!, /#1/);
    assert.equal(env.dialog.element.querySelectorAll("tbody .current-player").length, 1);
    assert.match(env.query(".leaderboard-caption").textContent!, /Both modes/);
    env.click(".close-dialog");
    user = { id: "another-player", displayName: "Another Player" };
    await env.open();
    assert.equal(env.query(".best-value").textContent, "0000");
    assert.equal(env.dialog.element.querySelectorAll("tbody .current-player").length, 0);
    env.click(".close-dialog");
    user = { id: "combined-player", displayName: "Combined Player" };
    await env.open();
    assert.equal(Number(env.query(".best-value").textContent), 1500);
  } finally { await env.cleanup(); }
});

test("a paused guest run is discarded on sign-in instead of being submitted", async () => {
  let user: GameUser | null = null;
  const env = await environment(900, {
    async getUser() {
      return user;
    },
    async login() {},
  });
  try {
    await env.open();
    env.click(".continue");
    env.click(".start-run");
    env.tick(60);
    env.click(".close-dialog");
    user = { id: "signed-in", displayName: "Ocean Explorer" };
    await env.open();
    assert.equal(env.query(".score-value").textContent, "0000");
    assert.equal(env.query(".stage-title").textContent, "Find your flow.");
    assert.equal(env.calls.submit, 0);
  } finally {
    await env.cleanup();
  }
});

test("continuing as guest wins a race with an unfinished session check", async () => {
  let resolve!: (user: GameUser | null) => void;
  const session = new Promise<GameUser | null>((done) => {
    resolve = done;
  });
  const env = await environment(900, {
    getUser() {
      return session;
    },
    async login() {},
  });
  try {
    const opening = env.dialog.open(env.opener as unknown as HTMLElement);
    env.click(".continue");
    resolve({ id: "late", displayName: "Late Account" });
    await opening;
    await env.flush();
    assert.match(env.query(".player-label").textContent!, /guest/);
    env.click(".start-run");
    env.tick(600);
    await env.flush();
    assert.equal(env.calls.submit, 0);
    assert.equal(env.calls.best, 0);
  } finally {
    await env.cleanup();
  }
});

test("fullscreen fallback expands the game, pauses the run, and exits on Escape or close", async () => {
  const env = await environment(358);
  try {
    Object.defineProperty(env.win.document, "fullscreenEnabled", {
      configurable: true,
      value: false,
    });
    await env.open();
    env.click(".continue");
    env.click(".start-run");
    env.tick(40);
    const score = env.query(".score-value").textContent;
    env.click(".fullscreen-button");
    await env.flush();
    assert.equal(env.dialog.element.classList.contains("is-expanded"), true);
    assert.equal(
      env.query(".fullscreen-button").getAttribute("aria-pressed"),
      "true",
    );
    assert.equal(env.query(".stage-title").textContent, "Take a breather.");
    env.tick(60);
    assert.equal(env.query(".score-value").textContent, score);
    const cancel = new env.win.Event("cancel", { cancelable: true });
    env.dialog.element.dispatchEvent(cancel as unknown as Event);
    assert.equal(cancel.defaultPrevented, true);
    assert.equal(env.dialog.element.open, true);
    assert.equal(env.dialog.element.classList.contains("is-expanded"), false);
    env.click(".fullscreen-button");
    env.click(".close-dialog");
    assert.equal(env.dialog.element.classList.contains("is-expanded"), false);
    assert.equal(
      env.query(".fullscreen-button").getAttribute("aria-pressed"),
      "false",
    );
    assert.equal(env.frames.size, 0);
  } finally {
    await env.cleanup();
  }
});

test("native fullscreen targets the game section and cleans up when the dialog closes", async () => {
  const env = await environment(358);
  try {
    await env.open();
    env.click(".continue");
    const panel = env.query(".game-content");
    let target: HTMLElement | null = null;
    Object.defineProperty(env.win.document, "fullscreenEnabled", {
      configurable: true,
      value: true,
    });
    Object.defineProperty(env.win.document, "fullscreenElement", {
      configurable: true,
      get: () => target,
    });
    Object.defineProperty(panel, "requestFullscreen", {
      value: async () => {
        target = panel;
        env.win.document.dispatchEvent(new env.win.Event("fullscreenchange"));
      },
    });
    Object.defineProperty(env.win.document, "exitFullscreen", {
      configurable: true,
      value: async () => {
        target = null;
        env.win.document.dispatchEvent(new env.win.Event("fullscreenchange"));
      },
    });
    env.click(".fullscreen-button");
    await env.flush();
    assert.equal(target, panel);
    assert.equal(
      env.query(".fullscreen-button").getAttribute("aria-label"),
      "Exit fullscreen",
    );
    assert.equal(env.dialog.element.classList.contains("is-expanded"), false);
    env.click(".close-dialog");
    await env.flush();
    assert.equal(target, null);
    assert.equal(env.frames.size, 0);
  } finally {
    await env.cleanup();
  }
});

test("denied fullscreen uses the expanded modal, and a pending fullscreen request cannot survive closing", async () => {
  const env = await environment();
  try {
    await env.open();
    env.click(".continue");
    const panel = env.query(".game-content");
    Object.defineProperty(env.win.document, "fullscreenEnabled", {
      configurable: true,
      value: true,
    });
    Object.defineProperty(panel, "requestFullscreen", {
      configurable: true,
      value: async () => {
        throw new Error("Denied");
      },
    });
    env.click(".fullscreen-button");
    await env.flush();
    assert.equal(env.dialog.element.classList.contains("is-expanded"), true);
    env.click(".fullscreen-button");
    let resolve!: () => void;
    const pending = new Promise<void>((done) => {
      resolve = done;
    });
    let target: HTMLElement | null = null;
    Object.defineProperty(env.win.document, "fullscreenElement", {
      configurable: true,
      get: () => target,
    });
    Object.defineProperty(panel, "requestFullscreen", {
      configurable: true,
      value: () => pending,
    });
    Object.defineProperty(env.win.document, "exitFullscreen", {
      configurable: true,
      value: async () => {
        target = null;
        env.win.document.dispatchEvent(new env.win.Event("fullscreenchange"));
      },
    });
    env.click(".fullscreen-button");
    env.click(".close-dialog");
    target = panel;
    env.win.document.dispatchEvent(new env.win.Event("fullscreenchange"));
    resolve();
    await env.flush();
    assert.equal(target, null);
    assert.equal(env.dialog.element.classList.contains("is-expanded"), false);
  } finally {
    await env.cleanup();
  }
});
