import type { AtlantisBoard } from "./types.js";
import type { AtlantisRun } from "./run.js";

export const html = (value: unknown): string => String(value).replace(/[&<>"']/g, char => ({"&":"&amp;", "<":"&lt;", ">":"&gt;", '"':"&quot;", "'":"&#39;"})[char]!);
export const duration = (seconds: number): string => `${Math.floor(seconds / 60)}:${String(Math.floor(seconds % 60)).padStart(2,"0")}`;
const button = (action: string, text: string, secondary = false) => `<button class="at-button${secondary ? " at-secondary" : ""}" data-action="${action}">${text}</button>`;
export const atlantisMarkup = `<div class="atlantis-shell">
  <div class="at-scene" aria-hidden="true">
    <div class="at-light"></div><div class="at-bubbles"><i></i><i></i><i></i><i></i><i></i><i></i></div>
    <svg class="at-ruins" viewBox="0 0 1100 600" preserveAspectRatio="xMidYMax slice">
      <defs><linearGradient id="at-stone" x2="0" y2="1"><stop stop-color="#205b70"/><stop offset="1" stop-color="#082737"/></linearGradient></defs>
      <path fill="#061b2b" d="M0 600V390L120 340 220 420 380 320 650 430 790 330 930 400 1100 350V600Z"/>
      <g fill="url(#at-stone)" stroke="#4c9ca94d" stroke-width="2">
        <path d="M55 545V260H95V545M150 545V230H190V545M910 545V230H950V545M1005 545V260H1045V545"/>
        <path d="M35 265H210V242H35ZM890 242H1065V265H890ZM25 550H215V570H25ZM885 550H1075V570H885Z"/>
        <path d="M320 500V180L550 90 780 180V500H725V220H375V500ZM300 180L550 65 800 180Z"/>
        <path d="M380 220H420V540H380ZM680 220H720V540H680Z"/>
      </g>
      <path d="M0 570Q200 500 390 560T800 555T1100 560V600H0Z" fill="#092b39"/>
      <g fill="none" stroke="#3a869266" stroke-width="5"><path d="M80 600Q20 480 65 440M90 600Q140 510 110 470M990 600Q1040 470 1000 435M1010 600Q950 520 960 475"/></g>
      <g fill="none" stroke="#9b77a56b" stroke-width="4"><path d="M190 600V505M190 550L160 525M190 535L220 505M190 565L225 540M870 600V510M870 545L840 515M870 565L900 530"/></g>
    </svg>
    <div class="at-door"><span>△</span><span>◇</span></div>
    <svg class="at-fish at-fish-one" viewBox="0 0 80 40"><g fill="currentColor"><ellipse cx="43" cy="20" rx="23" ry="12"/><path d="M25 20L4 6V34ZM42 10L35 2 55 12Z"/></g><circle cx="56" cy="18" r="2" fill="#061c2d"/></svg>
    <svg class="at-fish at-fish-two" viewBox="0 0 80 40"><g fill="currentColor"><ellipse cx="43" cy="20" rx="23" ry="12"/><path d="M25 20L4 6V34Z"/></g><circle cx="56" cy="18" r="2" fill="#061c2d"/></svg>
    <svg class="at-jelly" viewBox="0 0 70 110"><path d="M8 43C8 0 62 0 62 43Q48 55 35 43 22 55 8 43Z" fill="currentColor"/><g fill="none" stroke="currentColor" stroke-width="2"><path d="M17 46Q5 67 22 81T15 105M30 46Q42 70 29 90M45 46Q58 68 44 82T53 108M55 45Q66 62 58 75"/></g></svg>
    <div class="at-crystal">◇</div>
  </div>
  <header class="at-toolbar"><div class="at-toolbar-heading"><span class="at-brand">BLUE PULSE <small>ATLANTIS EXPEDITION</small></span><button type="button" class="at-info" data-action="instructions" aria-label="How to play" title="How to play" aria-pressed="false"><svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="9"/><path d="M12 11v6"/><circle class="at-info-dot" cx="12" cy="7" r="1"/></svg></button></div><div>
    <button class="scene-button at-sound" data-action="sound" aria-label="Mute Atlantis sound" aria-pressed="true" title="Mute sound">♪</button>
    <button class="scene-button at-pause" data-action="pause" aria-label="Pause expedition" title="Pause expedition">Ⅱ</button>
    <button class="scene-button at-fullscreen" aria-label="Fullscreen game" aria-pressed="false">⤢</button>
    <button class="scene-button" data-action="close" aria-label="Close Atlantis">×</button>
  </div></header>
  <div class="at-hud" hidden>
    <span>SCORE <strong data-hud="score">0</strong></span><span>CHAMBER <strong data-hud="level">1 / 10</strong></span>
    <span>QUESTION <strong data-hud="question">1 / 3</strong></span>
    <span data-hud="timer-label">TIME <strong data-hud="timer">0:00</strong></span><span>HINTS <strong data-hud="hints">0</strong></span>
    <progress max="10" value="0" aria-label="Chambers unlocked"></progress>
    <progress class="at-question-progress" max="3" value="0" aria-label="Current chamber questions answered"></progress>
  </div>
  <main class="at-panel" aria-labelledby="at-title"></main>
  <p class="at-session" role="status"></p>
  <div class="at-pearls" aria-hidden="true"><i>●</i><i>●</i><i>●</i><i>●</i></div>
</div>`;

export const authMarkup = `<div class="at-intro at-welcome"><span class="at-kicker">THE LOST LITERARY TRIALS</span><h2 id="at-title">The Sunken City<br>of <em>Atlantis</em></h2>
  <p class="at-story">The lost city preserved the world’s greatest literary treasures. Explore its guardians’ trials of books, authors, characters, and poetry. Unlock ten chambers and awaken the Heart of Atlantis.</p>
  <div class="at-welcome-facts"><span><strong>10</strong> chambers</span><span><strong>43</strong> questions</span><span>New trials each expedition</span></div>
  <div class="at-actions">${button("login","Login")}${button("guest","Continue Anyway →",true)}</div><p class="at-fine">Guest progress stays in this tab. Sign in to connect your account.</p><p class="at-auth-message notice" role="status">Checking your session…</p></div>`;

export function levelMarkup(run: AtlantisRun): string {
  const {level,question,feedback} = run;
  const answered = feedback !== null;
  const options = question.options.map((option,index) => {
    const correct = answered && index === question.correctAnswer;
    const wrong = answered && feedback.selected === index && !feedback.correct;
    return `<button type="button" class="at-answer-option${correct ? " is-correct" : ""}${wrong ? " is-wrong" : ""}"
      data-action="answer" data-option="${index}" ${answered ? "disabled" : ""} aria-pressed="${feedback?.selected === index}"
      aria-label="${html(`${String.fromCharCode(65 + index)}. ${option}${correct ? ". Correct answer" : wrong ? ". Your incorrect answer" : ""}`)}">
      <span class="at-option-letter">${String.fromCharCode(65 + index)}</span><span>${html(option)}</span>${correct ? '<span aria-hidden="true">✓</span>' : wrong ? '<span aria-hidden="true">×</span>' : ""}</button>`;
  }).join("");
  const feedbackText = !feedback ? "" : feedback.timedOut ? "Time’s up — this question is unanswered. No points awarded."
    : feedback.correct ? feedback.alreadyRewarded ? "Correct. This question has already earned points in this run." : `Correct! +${feedback.points} points.`
    : "Not quite. −20 points (score stays at zero or above).";
  return `<article class="at-tablet"><div class="at-chamber-label">CHAMBER ${String(level.id).padStart(2,"0")} <span>${html(level.difficultyLabel)}</span></div>
    <h2 id="at-title">${html(level.name)}</h2><p class="at-description">${html(level.description)}</p>
    <div class="at-question-meta"><span>QUESTION ${run.questionIndex + 1} / ${level.questionCount}</span><span>${html(question.category)} · ${question.difficulty}</span></div>
    <h3 id="at-question" class="at-question">${html(question.question)}</h3>
    <div class="at-answer-options" role="group" aria-labelledby="at-question">${options}</div>
    ${feedback ? `<div class="at-feedback at-quiz-feedback ${feedback.correct ? "is-correct" : "is-wrong"}" role="status"><strong>${html(feedbackText)}</strong>
      <p>Correct answer: <b>${html(question.options[question.correctAnswer])}</b></p><p>${html(question.explanation)}</p></div>
      ${button("continue","Continue →")}` : ""}
    <div class="at-puzzle-tools"><button class="at-button at-secondary" data-action="hint" ${answered ? "disabled" : ""} aria-controls="at-hint">${run.hintsUsed.has(question.id) ? "View hint again" : "Reveal hint · −25"}</button>${button("home","Expedition map",true)}</div>
    <p id="at-hint" class="at-hint" ${run.hintsUsed.has(question.id) ? "" : "hidden"}>${html(question.hint ?? "No hint is available for this question.")}</p>
    <p class="at-fine">Pass this chamber with ${level.requiredCorrect} / ${level.questionCount} correct answers. Answers lock after selection; press Continue after reading the explanation.</p></article>`;
}
export function successMarkup(run: AtlantisRun, points: number): string {
  const stars = run.chambers[run.level.id]?.stars ?? 0;
  return `<div class="at-intro at-success"><span class="at-kicker">THE SEAL IS BROKEN</span><div class="at-treasure" aria-hidden="true"><span>✦</span></div><div class="at-completion-stars" role="img" aria-label="${stars} of 3 stars">${[1,2,3].map(index => `<span class="${index <= stars ? "is-earned" : ""}" style="--star-index:${index}" aria-hidden="true">★</span>`).join("")}</div><h2 id="at-title">Chamber awakened.</h2><p class="at-score-gain">${points > 0 ? `+${points} chamber bonus` : `${run.attemptCorrect} / ${run.level.questionCount} correct`}</p><p class="at-story">${html(run.level.name)} opens to the living sea. The trail to chamber ${run.level.id + 1} is glowing.</p>${button("next","Continue the descent →")}</div>`;
}
export function failedMarkup(run: AtlantisRun): string {
  return `<div class="at-intro"><span class="at-kicker">THE GUARDIAN OFFERS ANOTHER CHANCE</span><h2 id="at-title">The chamber is still sealed.</h2><p class="at-story">You answered ${run.attemptCorrect} / ${run.level.questionCount} correctly; ${run.level.requiredCorrect} are needed. Retry this chamber without losing earlier unlocks. Fresh questions are used while available, and repeated questions cannot earn points twice.</p>${button("retry","Retry chamber →")}</div>`;
}
export function victoryMarkup(run: AtlantisRun): string {
  return `<div class="at-intro at-victory"><span class="at-kicker">THE LOST LITERARY TRIALS · COMPLETE</span><div class="at-heart" aria-hidden="true">◇</div><h2 id="at-title">THE HEART OF ATLANTIS HAS AWAKENED!</h2>
    <p class="at-story">You have conquered the literary trials and uncovered the secrets of the lost civilization.</p>
    <dl class="at-results"><div><dt>FINAL SCORE</dt><dd>${run.score}</dd></div><div><dt>CORRECT ANSWERS</dt><dd>${run.correctAnswers}</dd></div><div><dt>ACCURACY</dt><dd>${run.accuracy}%</dd></div><div><dt>ACTIVE TIME</dt><dd>${duration(run.elapsedSeconds)}</dd></div><div><dt>CHAMBERS UNLOCKED</dt><dd>${run.highestCompletedLevel}/10</dd></div><div><dt>HINTS USED</dt><dd>${run.hintsUsed.size}</dd></div></dl>
    <p class="at-final-rank" role="status"></p><div class="at-actions">${button("again","Play again →")}${button("home","Explore the awakened city",true)}${button("leaderboard","View leaderboard",true)}${button("close","Return to LitFest",true)}</div></div>`;
}
export function instructionsMarkup(): string {
  return `<article class="at-guide"><span class="at-kicker">YOUR READER’S FIELD GUIDE</span><h2 id="at-title">Conquer the literary trials.</h2>
    <p>Choose one of four answers on each tablet. Your choice locks immediately. Correct answers glow green; incorrect choices glow red and reveal the right answer. Read the explanation, then choose Continue. Nothing auto-skips.</p>
    <p>Chambers 1–3 have 3 questions, chambers 4–6 have 4, chambers 7–9 have 5, and the final chamber has 7: 43 questions in a clean run. Pass with at least 60% correct (2/3, 3/4, 3/5, or 5/7). Failed chambers can be retried with unused questions while available.</p>
    <p>Each correct answer earns 100 plus up to 50 for speed. A wrong answer costs 20; a hint costs 25 once per question. A perfect chamber earns 200, and completing all ten earns another 500. Score never falls below zero. A question can only earn points once per run, even if it reappears after the chamber’s unused questions run out.</p>
    <p>Easy questions allow 25 seconds, medium 20, and hard 15. A timeout counts as unanswered, earns no points, and reveals the correct answer. Continue when you have read it. Accuracy includes wrong and unanswered questions, including retries.</p>
    <p>Pause, hidden tabs, window blur, guide/map/leaderboard views, and closing the modal freeze the clock. Resume explicitly when ready. Guests may play every chamber and view rankings, but no guest score is submitted.</p>${button("back","Back to expedition →")}</article>`;
}
export function boardMarkup(board: AtlantisBoard): string {
  return `<article class="at-board leaderboard"><span class="at-kicker">ATLANTIS EXPEDITIONS</span><h2 id="at-title">The city’s readers</h2><p class="at-fine">${board.source === "mock" ? "TEMPORARY PREVIEW · In-memory scores, not a live global ranking." : "Connected Atlantis leaderboard"}</p><p>Ranked by score, then completed chambers, then completion time. Ocean Rush scores are separate.</p>
    ${board.entries.length ? `<div class="table-scroll"><table><thead><tr><th>RANK</th><th>EXPLORER</th><th>BEST</th><th>CHAMBERS</th><th>TIME</th></tr></thead><tbody>${board.entries.slice(0,10).map(row => `<tr class="${row.userId === board.currentPlayer?.userId ? "current-player" : ""}"><td>${row.rank}</td><td>${html(row.displayName)}</td><td>${row.score}</td><td>${row.highestCompletedLevel}/10</td><td>${row.completionTime === null ? "—" : duration(row.completionTime)}</td></tr>`).join("")}</tbody></table></div>` : `<div class="at-empty"><span aria-hidden="true">◇</span><h3>No expeditions recorded yet.</h3><p>The city is waiting for its first readers. Guests can explore every chamber, but cannot submit scores.</p></div>`}
    ${button("back","Back to expedition →")}</article>`;
}
