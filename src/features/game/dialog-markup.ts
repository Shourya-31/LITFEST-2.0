/** Compact scene and a mode selector, with no outer heading or controls footer. */
export const gameMarkup = /* HTML */ `
  <h2 id="game-title" class="game-sr-only">Ocean Rush</h2>
  <section class="auth-gate" aria-labelledby="auth-title">
    <button class="icon-button close-dialog" aria-label="Close game">×</button>
    <div class="gate-symbol" aria-hidden="true">≈</div>
    <h3 id="auth-title">A little ocean. A big adventure.</h3>
    <p>Log in to save your progress and compete on the leaderboard!</p>
    <p class="muted">Guests can play both modes. Your best scores stay in this tab for this session only.</p>
    <div class="gate-actions">
      <button class="button primary login">Log In ↗</button>
      <button class="button secondary continue">Continue Anyway</button>
    </div>
    <p class="auth-message notice" role="status"></p>
  </section>
  <section class="game-content" hidden>
    <div class="game-stage">
      <canvas tabindex="0" aria-label="Ocean runner. Space or Up to jump; hold for a higher jump. Down to duck or fall faster. Avoid waves, corals, clouds and sharks." aria-describedby="game-instructions"></canvas>
      <div class="scorebar" aria-label="Distance and best distance">
        <span><span class="best-label">BEST</span><span><strong class="best-value">0000</strong><small> m</small></span></span>
        <span><span>CURRENT</span><span><strong class="score-value">0000</strong><small> m</small></span></span>
      </div>
      <span class="player-label game-sr-only"></span>
      <div class="stage-overlay">
        <span class="stage-kicker eyebrow">SURFACE MODE</span>
        <h3 class="stage-title">Find your flow.</h3>
        <p class="stage-description">Jump the waves. Duck under low storm clouds.</p>
        <p id="game-instructions" class="game-instructions">Space / ↑ or tap to jump · Hold for height · ↓ to duck / drop</p>
        <button class="button primary start-run restart">Start run →</button>
        <section class="run-results" aria-label="Run results" hidden>
          <p class="game-message notice" role="status"></p>
          <section class="leaderboard" aria-labelledby="leaderboard-title">
            <div class="leaderboard-heading">
              <h3 id="leaderboard-title">The current leaders</h3>
              <span class="mock-badge">DEMO · MOCK DATA</span>
            </div>
            <p class="leaderboard-caption">Both modes · best score per account · demonstration only</p>
            <div class="table-scroll"><table>
              <thead><tr><th scope="col">RANK</th><th scope="col">EXPLORER</th><th scope="col">BEST DISTANCE</th></tr></thead>
              <tbody></tbody>
            </table></div>
            <p class="player-position muted"></p>
          </section>
          <p class="session-note muted">Guest scores are session-only.</p>
        </section>
      </div>
      <div class="touch-controls" aria-label="Touch controls">
        <button class="scene-button duck" aria-label="Hold to duck or fall faster" title="Hold to duck / drop">↓</button>
        <button class="scene-button jump" aria-label="Hold to jump higher" title="Hold to jump higher">↑ <span class="jump-label game-sr-only">Jump</span></button>
      </div>
      <div class="stage-actions">
        <button class="scene-button sound-button" aria-label="100 metre milestone sound" aria-pressed="true" title="Mute milestone sound">♪</button>
        <button class="scene-button pause-button" disabled aria-label="Pause game" title="Pause / resume (P)">Ⅱ</button>
        <button class="scene-button fullscreen-button" aria-label="Fullscreen game" aria-pressed="false" title="Fullscreen game">⤢</button>
      </div>
    </div>
    <div class="mode-switcher">
      <span class="mode-switcher-label" aria-hidden="true">MODE</span>
      <div class="mode-tabs" role="group" aria-label="Ocean mode">
        <button data-mode="surface" aria-pressed="true">≈ Surface</button>
        <button data-mode="underwater" aria-pressed="false">♆ Underwater</button>
      </div>
    </div>
  </section>`;
