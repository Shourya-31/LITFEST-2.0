# The Sunken City of Atlantis — The Lost Literary Trials

Atlantis preserves its underwater scene, native dialog, fullscreen controller,
audio, shared login adapter, account-progress abstraction, and separate leaderboard.
The active gameplay is now a multiple-choice literary adventure. Ocean Rush,
the arcade buttons, navigation, and other festival sections were not changed by
this conversion. The unused cipher module and cipher-specific input/key UI were
removed after checking their references.

## Run and verify

```powershell
cd frontend
npm install
npm run dev
```

Open Vite's printed Local URL and select the existing Atlantis card. Guests can
play every chamber and read the leaderboard. A recognized site session skips
the login prompt. Default development auth remains signed out until connected.

```powershell
npm test
npm run build
npm run lint
```

Full-site lint still reports 24 existing errors in `BubbleOverlay.tsx`,
`AboutOceanAtmosphere.tsx`, and `OceanAtmosphere.tsx`. The edited Atlantis files
are checked separately. No dependencies were added.

## Descending adventure map

The single welcome screen combines the Atlantis title, story, question/chamber
counts, and Login/Continue Anyway choices. Continue Anyway opens the scrollable
city map immediately, and recognized or newly signed-in accounts go straight
there without a second intro screen. The info icon beside the upper-left name
opens How to Play from welcome, map, or gameplay, pausing active question time.
Leaderboard navigation appears on final results. Ten large circular
nodes follow a cubic Bézier route from sunlit reefs through the Forgotten City
and Abyssal Temples to the Heart's grand temple. SVG coral, kelp, shells,
pillars, statues, books, fish, jellyfish, chests, crystals, and fading light rays
are original local artwork. No raster downloads, particle engine, or animation
dependency is required.

`map-config.ts` defines a shared 360 × 2200 coordinate system. Both HTML nodes
and SVG routes use those positions. Adjacent cubic handles share Catmull–Rom
tangents; the route has no corners. Percentage placement plus the matching
aspect ratio keeps curves and touch targets aligned across viewport widths.

The map reads the active run's completed-chamber counter. Locked nodes are
disabled; `AtlantisRun.enterLevel()` independently rejects skipped or completed
levels even if a DOM button is modified. Tapping an available node opens an
accessible details panel. Play resumes the same paused/answered question,
enters the newly unlocked chamber, or retries the failed current chamber.
Completed nodes allow inspection of results without replay rewards. Closing
and reopening details/map views never resamples an active attempt.

Passing a chamber shows its door-opening transition, treasure, and star
celebration. Continue the Descent returns to the map, reveals the new route,
and scrolls/focuses the next node. The final victory screen also links to the
fully awakened map. Scrolling stays within the game panel. The details panel
keeps keyboard focus inside, Escape closes it before fullscreen/the outer
dialog, and closing restores focus to its node. Reduced motion disables visual
animation and uses immediate camera scrolling.

Stars use the successful attempt's exact accuracy: 60–<75% earns one,
75–<90% two, and 90–100% three. Each chamber records its passing attempt's net
score gain and accuracy. Best stars, score, and accuracy merge independently
and never decrease. Guests keep these bests in the live dialog across explicit
new expeditions; they are never written to account services or browser storage.
Signing into another identity resets the old run and bests.

`AtlantisProgress.chambers` is optional per-chamber best metadata for future
adapters. Older summary-only adapters still work. The preview service validates
and deeply copies records, merging only higher bests. A new expedition starts
at chamber 1; historical bests do not bypass its quiz progression or restore
old score. Account bests remain distinct from active-run unlocks. Existing
leaderboard scoring and persistence-receipt rules are unchanged.

## Chamber structure

| Chamber | Category | Questions | Correct to pass |
| --- | --- | --- | --- |
| The Forgotten Gate | Famous Books | 3 | 2 |
| The Coral Archives | Famous Authors | 3 | 2 |
| The Whispering Ruins | Fictional Characters | 3 | 2 |
| The Hall of Legends | Famous Book Series | 4 | 3 |
| The Poet’s Sanctuary | Poetry and Poets | 4 | 3 |
| The Temple of Tales | Classics and Novels | 4 | 3 |
| The Forgotten Library | Indian Literature | 5 | 3 |
| The Abyssal Chamber | Literary Devices and Quotes | 5 | 3 |
| The Guardian’s Trial | Mixed Literary Trivia | 5 | 3 |
| The Heart of Atlantis | Ultimate Literary Challenge | 7 | 5 |

A clean expedition has 43 questions. `questions.ts` contains 150 unique entries,
15 per category, each with four distinct choices, one correct index, difficulty,
a hint, and an explanation. Question text, distractors, and explanations are
locally authored; no lengthy passages from novels or poems are reproduced.

New runs sample questions and shuffle options with Fisher–Yates, updating the
correct-answer index. The chosen questions and option order are fixed for an
active attempt. Medium chambers mix one easy and three medium questions; the
Indian Literature chamber mixes two medium and three hard questions while those
unused difficulty pools are available. Early chambers use easy questions and
later chambers use hard questions.

Retries use unused questions first. Once a category's finite pool is exhausted,
questions can recur, but a correct answer to a question can earn points only
once per run. A failed chamber can be retried without losing previous unlocks.
Reaching a completed chamber again is not offered. Explanations are never
automatically skipped; Continue is required after each choice or timeout.

## Scoring, timing, and result semantics

- Correct: 100 plus `round(50 * remainingSeconds / timeLimit)` on its first
  rewarded solve in the run.
- Wrong: −20. A timeout is unanswered and earns zero without a wrong-answer penalty.
- Hint: −25 once per question ID, including across retries.
- Perfect chamber: +200 once. Final completion: +500 once.
- Every penalty is clamped at zero. A perfect clean run earns 8,950.

Unseen retry questions may still earn points; the validation ceiling is 25,000
(150 unique rewarded questions, ten perfect-chamber bonuses, and final completion).
The public result tracks correct, wrong, and unanswered counts across all
attempts, as well as highest completed chamber. Correct answers therefore no
longer equal completed chambers. Accuracy includes all answered/unanswered
questions, including retries.

Each easy question has 25 seconds, medium 20, and hard 15. The controller uses
active wall time and clamps a stalled update at the current question's deadline.
Timeout locks all choices, reveals the correct answer and explanation, and
waits for Continue. Feedback, pause, guide/map/leaderboard views, hidden tabs,
window blur, and modal closure freeze time. Resume is explicit. Closing and
reopening the same modal preserves the current question, option order, and
feedback. Restart clears run-local IDs, hints, timers, and rewarded-question IDs.

## Services and authentication

The existing `AuthAdapter` comes from `getAdapters()`. No new login system,
backend routes, or production endpoints are introduced. `GameDisplay` and
`MilestoneSound` are still reused. Atlantis data remains separate from Ocean Rush.

Guests never call account-progress or submission methods. Account changes reset
an old run before it can be submitted for the new identity. Submissions include
the expected user ID, which the service matches to the session. Updates are
queued; stale callbacks cannot change a different account's UI.

The `AtlantisService` method contract is unchanged:

```ts
getAtlantisLeaderboard(): Promise<AtlantisBoard>
getAtlantisProgress(userId: string): Promise<AtlantisProgress | null>
saveAtlantisProgress(progress: AtlantisProgress): Promise<PersistenceReceipt>
submitAtlantisScore(result: AtlantisSubmission): Promise<PersistenceReceipt>
```

`AtlantisResult` now includes `unansweredAnswers` and question-level correct/wrong
counts. An injected future adapter must support those updated semantics and score
ranges. The in-memory preview starts empty, shows its temporary source, and
returns `{ persisted: false }`; it never claims a server save. A positive
persistence receipt is required for saved-to-account wording. A final account
rank is shown only for an `api` leaderboard. Ranking stays score, completed
chambers, then finished time.

A future backend must issue authoritative run IDs, verify the selected question
IDs and option mapping, enforce timers and single-answer locks, reject duplicate
rewards/completion, and derive identity from authenticated requests. Client
validation is not proof of a legitimate run. Persistent unfinished-run resume
would also need a server-owned attempt snapshot. Current progress holds summary
metadata and chamber bests; the live expedition remains in memory.

## Module map and verification

- `types.ts`: question, chamber, result, and service contracts.
- `questions.ts`: 150-question bank and validation ceiling.
- `levels.ts`: ten literary categories, counts, pass thresholds, and time budgets.
- `random.ts`: sampling and answer-option shuffling.
- `map-config.ts`: shared chart coordinates, continuous curves, and depth zones.
- `map-art.ts`: original SVG underwater landmarks and marine life.
- `map.ts` / `map.css`: winding map, level panels, camera targets, and animations.
- `progress.ts`: exact star thresholds and validated monotonic chamber bests.
- `run.ts`: pure quiz progression, locks, scoring, hints, retries, and clock.
- `components.ts`: preserved scene plus question/feedback/guide/results UI.
- `dialog.ts`: preserved modal/auth/service lifecycle with quiz interactions.
- `service.ts`: isolated preview service with updated result validation.
- `atlantis.css`: preserved scene with responsive answer-card styling.

Tests cover the 150-entry schema, known answer fixtures, randomized answer-index
integrity, 43-question runs across seeds, pass thresholds, fresh retries,
exhausted pools, duplicate guards, perfect scoring, pause/timeout behavior,
account isolation, honest persistence messages, and both real arcade card clicks.
Map tests additionally cover route continuity, disabled and forged locked nodes,
star thresholds, best-record ownership/copying, accessible panels, resumable
questions, all ten completed nodes, and replay protection.
DOM flows use 320, 375, 768, and 1200 viewport settings. Happy-dom does not perform
pixel layout; visual mobile rendering and native browser behavior remain
unverified because no browser is connected. Reduced motion and fewer mobile
particles remain supported.

## Content reference material

Maintenance references for the literary bank include:

- [Project Gutenberg's classics catalogue](https://www.gutenberg.org/ebooks/bookshelf/649)
  for canonical works and author metadata.
- [Academy of American Poets glossary](https://poets.org/glossary) and
  [Poetry Foundation's Wordsworth material](https://www.poetryfoundation.org/poets/william-wordsworth)
  for poetic forms, devices, and poetry.
- [The Booker Prize's award archive](https://thebookerprizes.com/the-booker-library/features/full-list-of-booker-prize-winners-shortlisted-and-longlisted-authors)
  for award records; [Nobel's Tagore biography](https://www.nobelprize.org/prizes/literature/1913/tagore/biographical/)
  for Tagore's literary context.
- [Rick Riordan's Percy Jackson series](https://rickriordan.com/series/percy-jackson-and-the-olympians/)
  for series ordering.
- Publisher descriptions of [Invisible Cities](https://www.penguin.co.uk/books/357001/invisible-cities-by-calvino-italo/9780099429838),
  [The Palace of Illusions](https://www.penguinrandomhouse.com/books/41294/the-palace-of-illusions-by-chitra-banerjee-divakaruni/9781400096206/),
  and [Clear Light of Day](https://www.penguin.co.uk/books/354988/clear-light-of-day-by-desai-anita/9781784873929).
- [The James Joyce Centre's Bloomsday guide](https://jamesjoyce.ie/wp-content/uploads/2021/10/JAMJOY.pdf)
  for the Ulysses setting.
