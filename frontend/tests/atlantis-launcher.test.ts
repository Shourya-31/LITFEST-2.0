import test from "node:test";
import assert from "node:assert/strict";
import { Window } from "happy-dom";
import type { HTMLButtonElement as HappyButton } from "happy-dom";
import { createServer } from "vite";

test("actual arcade Game 2 card opens Atlantis and Ocean Rush still opens its original modal", async () => {
  const win = new Window({url:"http://localhost"});
  const originals = new Map<string,PropertyDescriptor|undefined>();
  const install = (key:string,value:unknown) => {
    originals.set(key,Object.getOwnPropertyDescriptor(globalThis,key));
    Object.defineProperty(globalThis,key,{value,writable:true,configurable:true});
  };
  install("window",win); install("document",win.document); install("navigator",win.navigator);
  install("HTMLElement",win.HTMLElement); install("AbortController",win.AbortController);
  install("Image",win.Image);
  install("matchMedia",win.matchMedia.bind(win)); install("IS_REACT_ACT_ENVIRONMENT",true);
  install("ResizeObserver",class {observe() {} disconnect() {}});
  install("requestAnimationFrame",() => 1); install("cancelAnimationFrame",() => {});
  const context = new Proxy({}, {get:(_,key) => key === "createLinearGradient" || key === "createRadialGradient"
    ? () => ({addColorStop() {}}) : () => {}, set:() => true});
  Object.defineProperty(win.HTMLCanvasElement.prototype,"getContext",{value:() => context,configurable:true});
  // Vite transforms the real TSX/CSS modules for this DOM test. No HTTP server or browser is started.
  const vite = await createServer({server:{middlewareMode:true,hmr:false,watch:null},logLevel:"silent"});
  const {createElement,act} = await import("react");
  const {createRoot} = await import("react-dom/client");
  const container = win.document.createElement("div"); win.document.body.append(container);
  const root = createRoot(container as unknown as HTMLElement);
  try {
    const {GameLauncher} = await vite.ssrLoadModule("/src/features/game/GameLauncher.tsx");
    await act(async () => root.render(createElement(GameLauncher)));
    const game2 = container.querySelector<HappyButton>('button[aria-labelledby="ocean-game-2-title"]')!;
    assert.equal(game2.disabled,false);
    await act(async () => game2.click());
    const atlantis = win.document.querySelector("dialog.atlantis-dialog")!;
    assert.equal(atlantis.hasAttribute("open"),true);
    assert.match(atlantis.textContent!, /Guest progress stays in this tab/);
    atlantis.querySelector<HappyButton>('[data-action="guest"]')!.click();

    assert.equal(atlantis.querySelectorAll(".at-level-node").length,10);
    assert.equal(atlantis.querySelectorAll(".at-level-node:disabled").length,9);
    atlantis.querySelector<HappyButton>('[data-action="map-select"][data-level="1"]')!.click();
    atlantis.querySelector<HappyButton>('[data-action="map-play"]')!.click();
    assert.equal(atlantis.querySelectorAll(".at-answer-option").length,4);
    assert.equal(atlantis.querySelector("input"),null);
    atlantis.querySelector<HappyButton>('[data-action="close"]')!.click();
    const oceanRush = container.querySelector<HappyButton>('button[aria-labelledby="ocean-game-title"]')!;
    await act(async () => oceanRush.click());
    const surfer = win.document.querySelector("dialog.game-dialog:not(.atlantis-dialog)")!;
    assert.equal(surfer.hasAttribute("open"),true);
    surfer.querySelector<HappyButton>(".continue")!.click();
    surfer.querySelector<HappyButton>(".start-run")!.click();
    assert.equal(surfer.querySelector(".game-stage")!.getAttribute("data-state"),"running");
    surfer.querySelector<HappyButton>(".close-dialog")!.click();
    assert.equal(win.document.body.style.overflow,"");
  } finally {
    await act(async () => root.unmount()); await vite.close(); await win.happyDOM.close();
    for (const [key,descriptor] of originals) {
      if (descriptor) Object.defineProperty(globalThis,key,descriptor); else Reflect.deleteProperty(globalThis,key);
    }
  }
});
