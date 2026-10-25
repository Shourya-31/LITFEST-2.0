# Blue Pulse: Ocean Rush

The game is integrated into the React LitFest homepage in `frontend/`.
`GameLauncher.tsx` places one clickable **Ocean Rush** card, including its tagline,
directly after the hero. Animated waves and bubbles sit behind it, and its hover
glow / lift matches Explore Events. The launcher manages the
native dialog's lifetime. The runner itself uses TypeScript and Canvas; its
styles are scoped to `.game-dialog` so they do not change the festival pages.
There is no backend change, database, or production auth flow.

The game artwork is drawn locally with Canvas vectors: `scenery.ts` handles
layered tropical/ocean and reef scenes, `characters.ts` handles animated poses,
`obstacles.ts` handles hazards, and `effects.ts` handles spray, bubbles, and the
brief collision burst. `art.ts` contains drawing helpers. No downloaded sprites,
external image requests, or runtime graphics dependencies are needed.
`coral.ts` draws three original reef colonies: forked staghorn branches, scalloped
sea fans with a vein lattice, and rounded brain coral with winding ridges.
Effects use bounded analytic particles; the collision effect stops after 550ms
without advancing the simulation or score. Restart and close cancel its frame.

## Local preview

Use Node.js 20.19+ or a supported newer LTS release. From the repository root:

```powershell
cd frontend
npm install
npm run dev
```

Open **http://127.0.0.1:5173/**. Vite provides hot updates during development.
Click the **Ocean Rush** card after the hero, then **Continue Anyway**. No account is
needed. The React contact and sponsors pages remain at `/contact` and `/sponsors`.

```powershell
npm test
npm run lint
npm run build
npm run preview
```

The production preview URL is **http://127.0.0.1:4173/**. Output is `frontend/dist/`.
TypeScript strict checking is part of the complete React frontend build.
Vite prints the local URL if another port is selected during development.

## Gameplay

- Select Surface (surfer, waves, storm clouds) or Underwater (mermaid, coral, sharks).
- Press Space / Arrow Up or press the canvas / up button to jump from the floor.
  Release for a short hop; hold for a higher jump. Midair presses do not double
  jump or queue an automatic jump after landing. Key repeats cannot auto-jump.
- Hold Arrow Down or the down button to duck under low clouds / sharks. Down
  during a jump makes the character fall faster. Jumping while ducking is blocked.
  Releasing, cancelling touch, pausing, restarting, and changing modes clear inputs.
- Jump over waves and corals; stay grounded beneath higher airborne hazards.
- Use Pause / Resume or P. Escape or the close button closes the dialog.
- Restart begins a fresh run. Changing mode also resets the current run.
- The first obstacle enters the visible game window one second after each start
  or restart, with normal reaction space before it reaches the player.
- The popup contains the scene and mode selector: current distance and best
  appear together at the top right, and small scene buttons provide sound, pause,
  fullscreen, and close. There is no outer heading, score strip, or controls footer.
  On mobile the scene is a portrait rectangle capped at 70% of the viewport
  height (600px maximum), with a reserved 64px Surface / Underwater selector row
  directly below. This row also stays visible in fullscreen. Tall portrait scenes
  place the waterline / seabed at 58% of scene height, keeping the character near
  the middle and clear of the touch controls.
  Action buttons sit at the upper right, above a single row of scores.
  Touch jump / duck buttons stay bottom left. The mode row is below the scene on desktop too.
  Leaderboard and result notes appear inside the scene only after a loss,
  and disappear on restart or mode change.
- Game over highlights the specific obstacle and explains whether a wave, coral,
  storm cloud, or shark caused the collision. Collision silhouettes follow solid
  wave faces, coral branches/fans/lobes, and airborne bodies; decorative rain,
  shark fins/tails, and empty artwork corners are forgiving.
- The **⤢** button beside the modes expands the game using native fullscreen when
  available, with a viewport-sized modal fallback. Entering or leaving expanded
  view pauses the run until Resume. **⤡** exits, and closing cleans up fullscreen.
  In short landscape windows the scene scales to keep the full jump arc visible.
- Hidden tabs, window blur, and closing the dialog pause the game. Reopening a
  paused run requires an explicit Resume, preventing surprise movement.
- Distance is displayed in metres: world distance divided by 12, rounded down.
  This same integer is the leaderboard score, so existing demo bests keep their value.
- Wave crests vary in height and width. Two-wave groups can appear from 300 m,
  three-wave groups from 600 m, and paired coral colonies from 900 m. The whole
  group fits within one jump's clearance window; recovery space is measured after
  its last crest.
- Movement now follows Dino-style dynamics: gravity is 2160 world units/second²,
  takeoff velocity is -600 minus 10% of running speed, and early release limits
  further upward speed after a minimum 30-unit rise. Down accelerates the descent.
  The artwork remains the original ocean art; ducking lowers the character pose.
- Speed starts at 400 world units/second and rises continuously by 3.6 units/second
  each second of active play, capped at 780 on desktop with a lower mobile cap.
  Every **300 m** still unlocks more obstacle variety and groups, without a sudden
  speed step. Random spatial gaps grow with speed and group width, reserving time
  to land and react. Movement uses seconds and small collision substeps.
  These rules were adapted from the
  [Chromium runner](https://github.com/chromium/chromium/tree/main/components/neterror/resources/dino_game),
  rather than importing its sprites, theme, or implementation.
- A short three-note chime plays at each **100 m** milestone in either mode.
  The **♪** toggle beside Pause mutes/enables it. Audio starts only after a
  play/resume gesture, stops on pause/close, and resets milestones on a new run.
  It uses Web Audio synthesis in `sound.ts`, with no sound-file downloads.

The dialog uses the native modal focus trap, restores focus to the Ocean Rush card, locks
background scrolling, and keeps mobile touch input on the canvas from scrolling
the page. Controls are at least 44px high. Decorative motion stops for reduced
motion preferences; the core game still animates while a run is active.

## Authentication and leaderboard integration

`frontend/src/types/game.ts` defines `AuthAdapter`, `GameService`, and the score,
user, display name, mode, rank, and timestamp types. Services are injected into
`GameDialog`, independent of rendering and physics.

The default **development auth mock** always returns `null`. Log In reports
that integration is pending. It never invents an authenticated session.
For the real application, supply the adapters before constructing `GameDialog`
or before React mounts `GameLauncher`:

```ts
window.bluePulseAdapters = {
  auth: existingAuthAdapter, // getUser() and login() delegate to the site's auth
  gameService: authenticatedGameApiAdapter,
};
// Configure this before rendering the app in src/main.tsx.
```

The service contract is:

```ts
getLeaderboard(): Promise<Leaderboard>
submitScore(score: Score): Promise<void>
getMyBestScore(): Promise<Score | null>
```

`Leaderboard` includes entries, the current player's entry (including a position
outside the displayed top five), and `source: 'mock' | 'api'`. Both modes share
one ranking: each account appears once, using its highest score from either
mode. The BEST counter uses that same combined personal best. Adapter methods
no longer take a mode argument. Adapter errors are presented without blocking gameplay. Names render
as text, not HTML.

`MockGameService` has clearly labeled fictional demo entries. Authenticated mock
scores exist only in that service instance's memory. There is no network request,
cross-user shared ranking, or persisted mock score. An actual shared leaderboard
will provide **asynchronous competition**, not synchronous multiplayer.

**Guests:** the UI never calls submitScore or getMyBestScore for a guest, and the
mock service independently rejects guest submissions. Guest bests live only in
the dialog instance for the current tab/session, separately from account bests,
and use one combined best across both modes. Guests are never added to the ranking.
Reloading clears them. No localStorage, cookies, IndexedDB, or other persistent
score storage is used. Switching from guest to an account never uploads old runs.

## Future backend requirements

Do not trust a frontend score as authoritative. The eventual service must:

- Authenticate each score submission and derive user identity server-side.
- Validate a run server-side using a server-issued run identifier, verified event
  sequence or replay, elapsed-time bounds, and a server-calculated score.
- Reject fabricated/impossible runs, duplicate submissions, and replay attacks.
- Apply rate limiting, abuse monitoring, and additional anti-cheat checks.
- Store one best score per user across both modes; compute ranks and timestamps server-side.

No backend routes, database schemas, credentials, or production API URLs have
been introduced. Real authentication and the global leaderboard remain pending.

## Verification

The automated tests cover modal/auth flows, account-switch races, keyboard controls,
close/visibility pausing, focus restoration, guest isolation, jump physics, collisions and avoidance in both modes,
pause/resume/restart, score invariance across frame rates, stalled-frame handling,
two-minute playable runs across three seeds at mobile and desktop world widths,
wave group sizes, speed caps, 100 m chime scheduling, mute/pause/reset behavior, mock rankings,
invalid score rejection, and guest isolation. They do not replace browser visual,
touch, native focus trapping, or screen-reader testing. The DOM suite uses happy-dom
with a stub Canvas context and viewport dimensions; it does not verify visual layout.
Additional checks cover short / held jumps, ducking, fast falls, repeated keys,
multi-touch releases and cancellation, silhouette collisions, collision explanations,
native fullscreen events, denied/unsupported fullscreen fallback, and closing while
a fullscreen request is pending. Native fullscreen is mocked in DOM tests and
still needs manual verification on the intended mobile browsers.

The production build includes the LitFest homepage, sponsors, contact page, and
the game. The earlier generated standalone Blue Pulse landing page is preserved
in the pre-pull backup and Git stash; it is not part of this React homepage.
