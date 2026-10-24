import test from "node:test";
import assert from "node:assert/strict";
import { Window } from "happy-dom";
import { AtlantisDialog } from "../src/features/atlantis/dialog.js";
import { MemoryAtlantisService } from "../src/features/atlantis/service.js";
import { developmentAuth } from "../src/services/auth.js";
import type { AuthAdapter, GameUser } from "../src/types/game.js";
import type { AtlantisService } from "../src/features/atlantis/types.js";

test("one modal clock survives question changes, stops on close, restarts on reopen and clears on destroy",async () => {
  const env = await environment();
  const start = env.win.setInterval.bind(env.win), stop = env.win.clearInterval.bind(env.win);
  const active = new Set<ReturnType<typeof start>>();
  env.win.setInterval = (...args: Parameters<typeof start>) => {
    const id = start(...args); active.add(id); return id;
  };
  env.win.clearInterval = (...args: Parameters<typeof stop>) => {
    if (args[0] !== undefined) active.delete(args[0]);
    stop(...args);
  };
  try {
    assert.equal(active.size,0);
    await env.open(); env.click("guest"); env.startLevel(); assert.equal(active.size,1);
    env.answer(); env.click("continue"); assert.equal(active.size,1);
    env.click("close"); assert.equal(active.size,0);
    await env.open(); assert.equal(active.size,1);
  } finally { await env.cleanup(); }
  assert.equal(active.size,0);
});

// DOM behavior only: happy-dom does not verify pixel layout or native focus trapping.
async function environment(width = 900, auth: AuthAdapter = developmentAuth, supplied?: AtlantisService) {
  const win = new Window({url:"http://localhost:5173"});
  Object.defineProperty(win,"innerWidth",{value:width,configurable:true});
  const originals = new Map<string, PropertyDescriptor | undefined>();
  for (const [key,value] of Object.entries({window:win, document:win.document, AbortController:win.AbortController})) {
    originals.set(key,Object.getOwnPropertyDescriptor(globalThis,key));
    Object.defineProperty(globalThis,key,{configurable:true,writable:true,value});
  }
  const base = supplied ?? new MemoryAtlantisService(auth);
  const calls = {save:0,submit:0,progress:0};
  const service: AtlantisService = {
    getAtlantisLeaderboard: () => base.getAtlantisLeaderboard(),
    getAtlantisProgress: userId => {calls.progress++; return base.getAtlantisProgress(userId);},
    saveAtlantisProgress: progress => {calls.save++; return base.saveAtlantisProgress(progress);},
    submitAtlantisScore: result => {calls.submit++; return base.submitAtlantisScore(result);},
  };
  let now = 1000;
  const dialog = new AtlantisDialog({auth,service}, () => now);
  const opener = win.document.createElement("button"); opener.textContent = "Game 2"; win.document.body.append(opener);
  const query = <T extends HTMLElement = HTMLElement>(selector:string): T => dialog.element.querySelector<T>(selector)!;
  const click = (action:string) => query<HTMLButtonElement>(`[data-action="${action}"]`).click();
  const flush = async () => {
    for (let i = 0; i < 30; i++) await Promise.resolve();
    await (dialog as unknown as {saveQueue:Promise<void>}).saveQueue;
    for (let i = 0; i < 10; i++) await Promise.resolve();
  };
  return {win,dialog,opener,query,click,flush,calls,service,
    startLevel() {
      assert.ok(query(".at-adventure-map"));
      query<HTMLButtonElement>(`[data-action="map-select"][data-level="${Math.min(10,dialog.run.highestCompletedLevel + 1)}"]`).click();
      click("map-play");
    },
    nextLevel() {
      click("next"); assert.ok(query(".at-adventure-map"));
      query<HTMLButtonElement>(`[data-action="map-select"][data-level="${dialog.run.highestCompletedLevel + 1}"]`).click();
      click("map-play");
    },
    async open() { await dialog.open(opener as unknown as HTMLElement); await flush(); },
    advance(seconds:number) { now += seconds * 1000; dialog.updateClock(); },
    answer(value = dialog.run.question.correctAnswer) {
      query<HTMLButtonElement>(`[data-action="answer"][data-option="${value}"]`).click();
    },
    finishChamber(correct = dialog.run.level.questionCount) {
      for (let i = 0; i < dialog.run.level.questionCount; i++) {
        query<HTMLButtonElement>(`[data-action="answer"][data-option="${i < correct ? dialog.run.question.correctAnswer : (dialog.run.question.correctAnswer + 1) % 4}"]`).click();
        click("continue");
      }
    },
    async cleanup() {
      dialog.destroy(); await win.happyDOM.close();
      for (const [key,descriptor] of originals) {
        if (descriptor) Object.defineProperty(globalThis,key,descriptor); else Reflect.deleteProperty(globalThis,key);
      }
    },
  };
}

for (const width of [320,375,768,1200]) {
  test(`guest can finish 43 literary questions with four answer cards at viewport ${width}`, async () => {
    const env = await environment(width);
    try {
      await env.open();
      assert.match(env.query(".at-panel").textContent!,/Guest progress stays in this tab/);
      assert.match(env.query("#at-title").textContent!,/The Sunken City/);
      assert.doesNotMatch(env.query(".at-panel").textContent!,/Your expedition awaits/);
      assert.match(env.query('[data-action="guest"]').textContent!,/Continue Anyway/);
      assert.equal(env.dialog.element.querySelector('[data-action="play"]'),null);
      assert.equal(env.dialog.element.querySelector('[data-action="leaderboard"]'),null);
      assert.ok(env.query(".at-toolbar-heading .at-brand + .at-info"));
      env.click("instructions"); assert.match(env.query("#at-title").textContent!,/Conquer the literary trials/);
      env.click("back"); assert.equal(env.dialog.run.state,"ready");
      env.click("guest"); env.startLevel();
      for (let level = 1; level <= 10; level++) {
        assert.equal(env.dialog.run.level.id,level);
        assert.equal(env.dialog.element.querySelectorAll(".at-answer-option").length,4);
        assert.equal(env.dialog.element.querySelector("input"),null);
        assert.equal(env.dialog.element.querySelector(".at-key"),null);
        assert.ok(env.query(".at-question").textContent!.length > 10);
        env.finishChamber(); assert.equal(env.dialog.run.highestCompletedLevel,level);
        if (level < 10) env.nextLevel();
      }
      assert.equal(env.dialog.run.state,"victory"); assert.equal(env.dialog.run.correctAnswers,43);
      assert.equal(env.dialog.run.score,8950);
      assert.match(env.query("#at-title").textContent!,/THE HEART OF ATLANTIS HAS AWAKENED!/);
      assert.equal(env.query(".at-final-rank").textContent,"");
      assert.equal(env.calls.save,0); assert.equal(env.calls.submit,0); assert.equal(env.calls.progress,0);
      env.click("leaderboard"); await env.flush();
      assert.match(env.query(".at-panel").textContent!,/No expeditions recorded yet/);
      assert.match(env.query(".at-panel").textContent!,/TEMPORARY PREVIEW/);
      env.click("back"); env.click("home");
      assert.equal(env.dialog.element.querySelectorAll(".at-map-stop.is-complete").length,10);
      assert.equal(env.dialog.element.querySelectorAll(".at-level-node:disabled").length,0);
      assert.equal(env.dialog.element.querySelectorAll(".at-map-stop.is-current").length,0);
      assert.equal(env.dialog.element.querySelector('[data-action="leaderboard"]'),null);
      env.click("close");
      assert.equal(env.win.document.body.style.overflow,""); assert.equal(env.win.document.activeElement,env.opener);
      assert.equal(env.win.localStorage.length,0); assert.equal(env.win.sessionStorage.length,0);
    } finally {await env.cleanup();}
  });
}
test("wrong choices lock red, reveal the green correct answer and explanation until Continue", async () => {
  const env = await environment();
  try {
    await env.open(); env.click("guest"); env.startLevel();
    const wrong = (env.dialog.run.question.correctAnswer + 1) % 4;
    const oldButton = env.query<HTMLButtonElement>(`[data-option="${wrong}"]`);
    oldButton.click(); oldButton.click();
    assert.equal(env.dialog.run.wrongAnswers,1);
    assert.equal(env.dialog.run.questionIndex,0);
    assert.equal(env.dialog.element.querySelectorAll(".at-answer-option:disabled").length,4);
    assert.equal(env.dialog.element.querySelectorAll(".at-answer-option.is-wrong").length,1);
    assert.equal(env.dialog.element.querySelectorAll(".at-answer-option.is-correct").length,1);
    assert.ok(env.query(".at-feedback").textContent!.includes(env.dialog.run.question.explanation));
    env.advance(300); assert.equal(env.dialog.run.questionIndex,0);
    env.click("instructions"); env.click("back");
    assert.equal(env.dialog.run.state,"feedback");
    env.click("continue"); assert.equal(env.dialog.run.questionIndex,1);
    assert.equal(env.dialog.element.querySelectorAll(".at-answer-option:disabled").length,0);
  } finally {await env.cleanup();}
});
test("hints charge once per question, and correct choices cannot award points twice", async () => {
  const env = await environment();
  try {
    await env.open(); env.click("guest"); env.startLevel(); env.answer();
    assert.equal(env.dialog.run.score,150); env.answer(); assert.equal(env.dialog.run.score,150);
    env.click("continue"); env.click("hint"); env.click("hint");
    assert.equal(env.dialog.run.score,125); assert.equal(env.query(".at-hint").hidden,false);
    const id = env.dialog.run.question.id, options = [...env.dialog.run.question.options];
    env.click("instructions"); env.advance(500); env.click("back"); env.click("resume");
    assert.equal(env.dialog.run.question.id,id); assert.deepEqual(env.dialog.run.question.options,options);
    assert.equal(env.query(".at-hint").hidden,false);
    env.answer(); assert.equal(env.dialog.run.score,275);
  } finally {await env.cleanup();}
});
test("question timers freeze on pause, hidden tab, blur and close; timeouts show feedback without skipping", async () => {
  const env = await environment();
  try {
    await env.open(); env.click("guest"); env.startLevel(); env.advance(5);
    assert.equal(env.dialog.run.remainingSeconds,20);
    env.click("pause"); env.advance(600); assert.equal(env.dialog.run.remainingSeconds,20);
    env.click("resume");
    Object.defineProperty(env.win.document,"hidden",{value:true,configurable:true});
    env.win.document.dispatchEvent(new env.win.Event("visibilitychange")); env.advance(300);
    assert.equal(env.dialog.run.remainingSeconds,20);
    Object.defineProperty(env.win.document,"hidden",{value:false,configurable:true});
    env.click("resume"); env.win.dispatchEvent(new env.win.Event("blur")); env.advance(300);
    assert.equal(env.dialog.run.remainingSeconds,20);
    env.click("resume"); env.click("close"); env.advance(500);
    await env.open(); env.click("guest"); env.startLevel();
    assert.equal(env.dialog.run.remainingSeconds,20);
    env.advance(20); assert.equal(env.dialog.run.state,"feedback");
    assert.equal(env.dialog.run.unansweredAnswers,1); assert.equal(env.dialog.run.score,0);
    assert.match(env.query(".at-feedback").textContent!,/unanswered/);
    env.advance(1000); assert.equal(env.dialog.run.questionIndex,0);
    env.click("continue"); assert.equal(env.dialog.run.questionIndex,1);
    assert.equal(env.dialog.run.remainingSeconds,25);
  } finally {await env.cleanup();}
});
test("failed chambers can be retried without losing earlier unlocks and receive fresh questions", async () => {
  const env = await environment();
  try {
    await env.open(); env.click("guest"); env.startLevel(); env.finishChamber(); env.nextLevel();
    const ids = new Set(env.dialog.run.questions.map(question => question.id));
    env.finishChamber(0);
    assert.equal(env.dialog.run.state,"failed"); assert.equal(env.dialog.run.highestCompletedLevel,1);
    env.click("retry"); assert.equal(env.dialog.run.level.id,2);
    assert.ok(env.dialog.run.questions.every(question => !ids.has(question.id)));
    env.finishChamber(2); assert.equal(env.dialog.run.highestCompletedLevel,2);
  } finally {await env.cleanup();}
});
test("logged-in preview records literary progress without claiming a server save or final rank", async () => {
  const auth = {async getUser() {return {id:"a",displayName:"<img src=x onerror=bad()>"};},async login() {}};
  const env = await environment(900,auth);
  try {
    await env.open(); assert.ok(env.query(".at-adventure-map")); env.startLevel();
    for (let i = 0; i < 10; i++) {env.finishChamber(); if (i < 9) env.nextLevel();}
    await env.flush(); assert.equal(env.calls.submit,10); assert.equal(env.calls.save,10);
    assert.match(env.query(".at-session").textContent!,/No server save confirmed/);
    assert.equal(env.query(".at-final-rank").textContent,"");
    const progress = await env.service.getAtlantisProgress("a");
    assert.equal(progress?.unlockedLevel,10); assert.equal(progress?.completedRuns,1); assert.equal(progress?.bestScore,8950);
    env.click("leaderboard"); await env.flush();
    assert.equal(env.dialog.element.querySelector("img"),null);
    assert.ok(env.query("tbody").textContent!.includes("<img src=x onerror=bad()>"));
  } finally {await env.cleanup();}
});
test("save receipts and API leaderboard rank remain the only way to claim server success", async () => {
  const auth = {async getUser() {return {id:"api-user",displayName:"API Player"};},async login() {}};
  const memory = new MemoryAtlantisService(auth);
  const service:AtlantisService = {
    getAtlantisLeaderboard:async () => ({...await memory.getAtlantisLeaderboard(),source:"api"}),
    getAtlantisProgress:id => memory.getAtlantisProgress(id),
    saveAtlantisProgress:async progress => {await memory.saveAtlantisProgress(progress); return {persisted:true};},
    submitAtlantisScore:async result => {await memory.submitAtlantisScore(result); return {persisted:true};},
  };
  const env = await environment(900,auth,service);
  try {
    await env.open(); env.startLevel();
    for (let i = 0; i < 10; i++) {env.finishChamber(); if (i < 9) env.nextLevel();}
    await env.flush(); assert.match(env.query(".at-session").textContent!,/Progress saved to your account/);
    assert.match(env.query(".at-final-rank").textContent!,/#1/);
  } finally {await env.cleanup();}
});
test("guest continuation wins pending auth and guest answers never become account submissions", async () => {
  let resolve!:(user:GameUser|null) => void;
  const pending = new Promise<GameUser|null>(done => {resolve = done;});
  let user:GameUser|null = null, checking = true;
  const auth:AuthAdapter = {getUser:() => checking ? pending : Promise.resolve(user),async login() {}};
  const env = await environment(900,auth);
  try {
    const opening = env.dialog.open(env.opener as unknown as HTMLElement);
    env.click("guest"); env.startLevel(); env.finishChamber();
    resolve({id:"late",displayName:"Late"}); await opening; await env.flush(); assert.equal(env.calls.submit,0);
    env.click("close"); checking = false; user = {id:"new",displayName:"New Account"};
    await env.open(); assert.equal(env.dialog.run.score,0); assert.equal(env.dialog.run.highestCompletedLevel,0);
    assert.equal(env.calls.submit,0);
  } finally {await env.cleanup();}
});
test("pending login, mute and fullscreen fallback keep the original modal behavior", async () => {
  const env = await environment(375);
  try {
    await env.open(); env.click("login"); await env.flush();
    assert.match(env.query(".at-auth-message").textContent!,/integration is pending/);
    env.click("guest"); env.startLevel(); env.advance(4);
    env.query<HTMLButtonElement>(".at-fullscreen").click(); await env.flush();
    assert.equal(env.dialog.element.classList.contains("is-expanded"),true); assert.equal(env.dialog.run.state,"paused");
    env.click("sound"); assert.equal(env.query(".at-sound").getAttribute("aria-pressed"),"false");
    env.click("close"); assert.equal(env.dialog.element.open,false);
    assert.equal(env.dialog.element.classList.contains("is-expanded"),false);
  } finally {await env.cleanup();}
});

for (const width of [320,375,768,1200]) {
  test(`map nodes, locked levels, accessible level panel and frozen quiz resume at viewport ${width}`,async () => {
    const env = await environment(width);
    try {
      await env.open(); env.click("guest");
      assert.equal(env.dialog.run.state,"paused");
      assert.equal(env.dialog.element.querySelectorAll(".at-level-node").length,10);
      assert.equal(env.dialog.element.querySelectorAll(".at-level-node:disabled").length,9);
      assert.equal(env.dialog.element.querySelectorAll(".at-map-zone").length,4);
      assert.equal(env.dialog.element.querySelectorAll(".at-route-section").length,9);
      const current = env.query<HTMLButtonElement>('[data-action="map-select"][data-level="1"]');
      const locked = env.query<HTMLButtonElement>('[data-action="map-select"][data-level="2"]');
      assert.equal(current.getAttribute("aria-current"),"step");
      locked.click(); assert.equal(env.dialog.element.querySelector(".at-level-popup"),null);
      // Even a forged enabled DOM node must not bypass progression.
      locked.disabled = false; locked.click(); assert.equal(env.dialog.element.querySelector(".at-level-popup"),null); locked.disabled = true;
      env.advance(100); assert.equal(env.dialog.run.elapsedSeconds,0);
      current.click();
      const popup = env.query(".at-level-popup");
      assert.equal(popup.getAttribute("role"),"dialog"); assert.equal(popup.getAttribute("aria-modal"),"true");
      assert.match(popup.textContent!,/The Forgotten Gate/); assert.match(popup.textContent!,/Famous Books/);
      assert.match(popup.textContent!,/Very Easy/); assert.match(popup.textContent!,/3/);
      assert.doesNotMatch(popup.textContent!,/BEST SCORE/);
      assert.equal(env.query(".at-panel").inert,true);
      const close = env.query<HTMLButtonElement>(".at-popup-close"), play = env.query<HTMLButtonElement>(".at-play-level");
      close.focus(); close.dispatchEvent(new env.win.KeyboardEvent("keydown",{key:"Tab",shiftKey:true,bubbles:true,cancelable:true}) as unknown as Event);
      assert.equal(env.win.document.activeElement,play);
      play.dispatchEvent(new env.win.KeyboardEvent("keydown",{key:"Tab",bubbles:true,cancelable:true}) as unknown as Event);
      assert.equal(env.win.document.activeElement,close);
      const escape = new env.win.Event("cancel",{cancelable:true}); env.dialog.element.dispatchEvent(escape as unknown as Event);
      assert.equal(escape.defaultPrevented,true); assert.equal(env.dialog.element.open,true);
      assert.equal(env.win.document.activeElement,current); assert.equal(env.query(".at-panel").inert,false);
      current.click(); env.click("map-play"); env.advance(3);
      const question = structuredClone(env.dialog.run.question), remaining = env.dialog.run.remainingSeconds;
      env.click("home"); env.advance(900);
      assert.equal(env.dialog.run.remainingSeconds,remaining); assert.deepEqual(env.dialog.run.question,question);
      env.query<HTMLButtonElement>('[data-action="map-select"][data-level="1"]').click(); env.click("map-play");
      assert.equal(env.dialog.run.state,"playing"); assert.deepEqual(env.dialog.run.question,question);
      env.finishChamber(); assert.equal(env.dialog.element.querySelectorAll(".at-completion-stars .is-earned").length,3);
      env.click("next");
      assert.equal(env.dialog.element.querySelectorAll(".at-map-stop.is-complete").length,1);
      assert.equal(env.dialog.element.querySelectorAll(".at-map-stop.is-current").length,1);
      assert.equal(env.dialog.element.querySelectorAll(".at-level-node:disabled").length,8);
      assert.ok(env.query('[data-route-to="2"].is-unlocked.is-new'));
      const score = env.dialog.run.score;
      env.query<HTMLButtonElement>('[data-action="map-select"][data-level="1"]').click();
      assert.match(env.query(".at-level-popup").textContent!,/BEST SCORE/);
      assert.equal(env.dialog.element.querySelector(".at-play-level"),null);
      env.click("map-close"); assert.equal(env.dialog.run.score,score);
      env.click("instructions"); env.click("back"); assert.equal(env.dialog.run.highestCompletedLevel,1);
      env.query<HTMLButtonElement>('[data-action="map-select"][data-level="2"]').click(); env.click("map-play");
      assert.equal(env.dialog.run.level.id,2);
      assert.equal(env.dialog.run.highestCompletedLevel,1); assert.equal(env.dialog.run.score,score);
      env.click("home"); env.query<HTMLButtonElement>('[data-action="map-select"][data-level="2"]').click();
      env.click("close"); await env.open(); env.click("guest");
      assert.equal(env.dialog.run.highestCompletedLevel,1); assert.equal(env.query(".at-panel").inert,false);
      assert.equal(env.calls.submit,0); assert.equal(env.calls.save,0);
    } finally {await env.cleanup();}
  });
}

test("guest best stars survive explicit new expeditions without restoring old points or lowering earned records",async () => {
  const env = await environment();
  try {
    await env.open(); env.click("guest"); env.startLevel();
    for (let i = 0; i < 10; i++) {env.finishChamber(); if (i < 9) env.nextLevel();}
    env.click("again"); assert.equal(env.dialog.run.score,0); assert.equal(env.dialog.run.highestCompletedLevel,0);
    env.query<HTMLButtonElement>('[data-action="map-select"][data-level="1"]').click();
    assert.match(env.query(".at-level-popup").textContent!,/650/);
    assert.equal(env.query(".at-popup-record .at-earned-stars").getAttribute("aria-label"),"3 of 3 stars");
    env.click("map-play"); env.finishChamber(2);
    assert.equal(env.dialog.run.chambers[1]?.stars,1); assert.equal(env.dialog.run.score,280);
    env.click("next"); env.query<HTMLButtonElement>('[data-action="map-select"][data-level="1"]').click();
    assert.equal(env.query(".at-popup-record .at-earned-stars").getAttribute("aria-label"),"3 of 3 stars");
    assert.equal(env.calls.submit,0); assert.equal(env.calls.save,0);
  } finally {await env.cleanup();}
});

test("reduced-motion camera scroll stays inside the modal and focuses the current node",async () => {
  const env = await environment(375);
  try {
    await env.open(); env.click("guest"); env.startLevel(); env.finishChamber(); env.click("next");
    const panel = env.query(".at-panel"), current = env.query<HTMLButtonElement>('[data-action="map-select"][data-level="2"]');
    const scrolls:ScrollToOptions[] = [];
    Object.defineProperty(panel,"scrollTo",{configurable:true,value:(options:ScrollToOptions) => scrolls.push(options)});
    Object.defineProperty(env.win,"matchMedia",{configurable:true,value:() => ({matches:true})});
    Object.defineProperty(env.win,"scrollTo",{configurable:true,value:() => {throw new Error("The page must not scroll.");}});
    Object.defineProperty(panel,"getBoundingClientRect",{configurable:true,value:() => ({top:100})});
    Object.defineProperty(current,"getBoundingClientRect",{configurable:true,value:() => ({top:1000})});
    Object.defineProperty(panel,"clientHeight",{configurable:true,value:500});
    panel.scrollTop = 0; env.click("map-current");
    assert.deepEqual(scrolls,[{top:700,behavior:"auto"}]); assert.equal(env.win.document.activeElement,current);
    current.click();
    const key = new env.win.KeyboardEvent("keydown",{key:"Escape",bubbles:true,cancelable:true});
    env.query(".at-popup-close").dispatchEvent(key as unknown as Event);
    assert.equal(key.defaultPrevented,true); assert.equal(env.dialog.element.open,true);
    assert.equal(env.dialog.element.querySelector(".at-level-popup"),null);
    assert.equal(env.win.document.activeElement,current);
  } finally {await env.cleanup();}
});

test("header info works while session checking is pending and returns to the single welcome screen",async () => {
  let finish!:(value:null) => void;
  const checking = new Promise<null>(resolve => {finish = resolve;});
  const env = await environment(320,{getUser:() => checking,async login() {}});
  try {
    const opening = env.dialog.open(env.opener as unknown as HTMLElement);
    env.click("instructions"); finish(null); await opening;
    assert.match(env.query("#at-title").textContent!,/Conquer the literary trials/);
    assert.equal(env.query(".at-info").getAttribute("aria-pressed"),"true");
    env.click("instructions");
    assert.ok(env.query(".at-welcome")); assert.match(env.query(".at-auth-message").textContent!,/Continue Anyway/);
    assert.equal(env.win.document.activeElement,env.query(".at-info"));
    env.click("guest"); assert.ok(env.query(".at-adventure-map"));
    assert.equal(env.dialog.element.querySelector('[data-action="play"]'),null);
    assert.equal(env.dialog.element.querySelector('[data-action="leaderboard"]'),null);
  } finally {await env.cleanup();}
});

test("pending login stays single across header info navigation and Continue Anyway wins the late response",async () => {
  let finish!:() => void, loginCalls = 0;
  const pending = new Promise<void>(resolve => {finish = resolve;});
  const env = await environment(375,{async getUser() {return null;},login() {loginCalls++; return pending;}});
  try {
    await env.open(); env.click("login"); env.click("instructions"); env.click("back");
    assert.equal(env.query<HTMLButtonElement>('[data-action="login"]').disabled,true);
    env.click("login"); assert.equal(loginCalls,1);
    env.click("guest"); assert.ok(env.query(".at-adventure-map"));
    const runId = env.dialog.run.runId;
    finish(); await env.flush();
    assert.ok(env.query(".at-adventure-map")); assert.equal(env.dialog.run.runId,runId);
    assert.equal(env.calls.progress,0); assert.equal(env.calls.submit,0);
  } finally {finish(); await env.cleanup();}
});
