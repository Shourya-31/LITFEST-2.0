import { html } from "./components.js";
import { MAP_HEIGHT, MAP_NODES, MAP_SEGMENTS, MAP_WIDTH, MAP_ZONES } from "./map-config.js";
import { mapArtwork } from "./map-art.js";
import type { AtlantisRun } from "./run.js";
import type { AtlantisChamberRecord, AtlantisChamberRecords } from "./types.js";

export function mapNodeState(run: AtlantisRun, id: number): "complete" | "current" | "locked" {
  return id <= run.highestCompletedLevel ? "complete" : id === run.highestCompletedLevel + 1 ? "current" : "locked";
}
const lockIcon = `<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M7 10V7a5 5 0 0 1 10 0v3M5 10h14v11H5Z" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linejoin="round"/><circle cx="12" cy="15" r="1.4" fill="currentColor"/></svg>`;
export function starsMarkup(stars: number, className = ""): string {
  return `<span class="at-earned-stars ${className}" role="img" aria-label="${stars} of 3 stars">${[1,2,3].map(index => `<svg class="${index <= stars ? "is-earned" : ""}" viewBox="0 0 24 24" aria-hidden="true" style="--star-index:${index}"><path d="m12 2 3 6.2 6.8 1-4.9 4.8 1.2 6.8L12 17.6l-6.1 3.2 1.2-6.8-4.9-4.8 6.8-1Z"/></svg>`).join("")}</span>`;
}
export function mapMarkup(run: AtlantisRun, records: AtlantisChamberRecords, revealLevel: number | null = null): string {
  const current = Math.min(10,run.highestCompletedLevel + 1);
  const stars = Object.values(run.chambers).reduce((sum,record) => sum + (record?.stars ?? 0),0);
  return `<article class="at-adventure-map">
    <header class="at-map-heading"><span class="at-kicker">THE LOST LITERARY TRIALS</span><h2 id="at-title">${run.state === "victory" ? "The city is awake." : "Into the blue."}</h2><p>Follow the stories. Uncover a lost world.</p></header>
    <nav class="at-map-hud" aria-label="Expedition progress"><span><strong>${run.highestCompletedLevel}<small>/10</small></strong> CHAMBERS</span><span><strong>${stars}<small>/30</small></strong> STARS</span><span><strong>${run.score}</strong> SCORE</span><button type="button" data-action="map-current" aria-label="Scroll to ${run.state === "victory" ? "the Heart of Atlantis" : `current level ${current}`}" title="Find my level">↓</button></nav>
    <div class="at-map-world" style="--map-ratio:${MAP_WIDTH}/${MAP_HEIGHT}">
      <svg class="at-map-art" viewBox="0 0 ${MAP_WIDTH} ${MAP_HEIGHT}" aria-hidden="true">${mapArtwork}</svg>
      <svg class="at-map-route" viewBox="0 0 ${MAP_WIDTH} ${MAP_HEIGHT}" aria-hidden="true"><defs><filter id="atm-route-glow" x="-70%" y="-20%" width="240%" height="140%"><feGaussianBlur stdDeviation="2.5"/></filter></defs>
        ${MAP_SEGMENTS.map(segment => {
          const unlocked = segment.from <= run.highestCompletedLevel, fresh = segment.to === revealLevel;
          return `<g class="at-route-section ${unlocked ? "is-unlocked" : "is-locked"}${fresh ? " is-new" : ""}" data-route-to="${segment.to}"><path class="at-route-bed" d="${segment.d}"/>
            ${unlocked ? `<path class="at-route-halo" d="${segment.d}" filter="url(#atm-route-glow)"/>` : ""}
            <path id="atm-route-${segment.to}" class="at-route-line" d="${segment.d}" pathLength="100"/>
            ${unlocked ? `<circle class="at-route-spark" r="2.5"><animateMotion dur="6s" repeatCount="indefinite"><mpath href="#atm-route-${segment.to}"/></animateMotion></circle><circle class="at-route-spark at-spark-extra" r="1.4"><animateMotion dur="6s" begin="-3s" repeatCount="indefinite"><mpath href="#atm-route-${segment.to}"/></animateMotion></circle>` : ""}</g>`;
        }).join("")}</svg>
      ${MAP_ZONES.map(zone => `<div class="at-map-zone" style="top:${zone.y / MAP_HEIGHT * 100}%"><span>${zone.label}</span><h3>${zone.name}</h3><i aria-hidden="true"></i></div>`).join("")}
      <ol class="at-map-nodes" aria-label="The ten chambers of Atlantis">${MAP_NODES.map(node => {
        const state = mapNodeState(run,node.id), record = records[node.id] ?? run.chambers[node.id];
        return `<li class="at-map-stop is-${state}${node.id === 10 ? " is-heart" : ""}${node.id === revealLevel ? " is-revealed" : ""}" style="left:${node.x / MAP_WIDTH * 100}%;top:${node.y / MAP_HEIGHT * 100}%">
          <button type="button" class="at-level-node" data-action="map-select" data-level="${node.id}" aria-haspopup="dialog" ${state === "locked" ? "disabled" : ""} ${state === "current" ? 'aria-current="step"' : ""}
            aria-label="Level ${node.id}: ${html(node.name)}. ${state === "complete" ? `Completed, ${record?.stars ?? 0} stars. View results` : state === "current" ? "Current unlocked chamber. View level" : "Locked. Complete the previous chamber first"}">
            ${node.id === 10 ? '<span class="at-node-heart" aria-hidden="true">◇</span>' : ""}<span class="at-node-number">${node.id}</span>${state === "current" ? '<span class="at-node-play">PLAY</span><i class="at-node-bubble"></i><i class="at-node-bubble at-node-bubble-two"></i>' : state === "locked" ? `<span class="at-node-lock">${lockIcon}</span>` : '<span class="at-node-check" aria-hidden="true">✓</span>'}
          </button>${state === "complete" && record ? starsMarkup(record.stars,"at-node-stars") : ""}
          <span class="at-node-caption"><strong>${html(node.name.replace(/^The /,""))}</strong><small>${state === "current" ? "Your next discovery" : state === "complete" ? "Chamber awakened" : "Waiting in the depths"}</small></span>
        </li>`;
      }).join("")}</ol>
      <p class="at-map-bottom">${run.state === "victory" ? "Ten trials. One extraordinary journey." : "Some stories are worth diving deeper for."}</p>
    </div>
    <footer class="at-map-footer">${run.state === "victory" ? '<button type="button" class="at-button" data-action="again">Start a new expedition →</button>' : '<span>Clear each chamber to light the way forward.</span>'}</footer>
  </article>`;
}
export function levelPopupMarkup(run: AtlantisRun, id: number, record?: AtlantisChamberRecord): string {
  const node = MAP_NODES[id - 1], complete = mapNodeState(run,id) === "complete";
  return `<div class="at-level-overlay"><section class="at-level-popup" role="dialog" aria-modal="true" aria-labelledby="at-level-popup-title" aria-describedby="at-level-popup-category">
    <button type="button" class="at-popup-close" data-action="map-close" aria-label="Close level details">×</button><span class="at-kicker">${complete ? "CHAMBER AWAKENED" : "A STORY IS WAITING"} · LEVEL ${id}</span>
    <div class="at-popup-seal" aria-hidden="true">${id === 10 ? "◇" : id}</div><h3 id="at-level-popup-title">${html(node.name)}</h3><p id="at-level-popup-category">${html(node.category)}</p>
    <dl class="at-level-facts"><div><dt>DIFFICULTY</dt><dd>${html(node.difficultyLabel)}</dd></div><div><dt>QUESTIONS</dt><dd>${node.questionCount}</dd></div><div><dt>TO UNLOCK</dt><dd>${node.requiredCorrect} correct</dd></div>${record ? `<div><dt>BEST SCORE</dt><dd>${record.bestScore}</dd></div>` : ""}</dl>
    ${record ? `<div class="at-popup-record">${starsMarkup(record.stars)}<span>Best accuracy ${Math.round(record.bestAccuracy)}%</span></div>` : '<p class="at-popup-first">A new page in your expedition.</p>'}
    <p class="at-level-description">${html(node.description)}</p>
    ${complete ? '<p class="at-fine">Cleared this expedition. Follow the glowing trail.</p><button type="button" class="at-button" data-action="map-close">Back to the trail</button>' : `<button type="button" class="at-button at-play-level" data-action="map-play" data-level="${id}">${run.state === "failed" ? "Retry Level" : ["paused","feedback"].includes(run.state) && run.questionSeconds > 0 ? "Resume Level" : "Play Level"} →</button>`}
    </section></div>`;
}
