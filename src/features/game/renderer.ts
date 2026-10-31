import type { RunnerEngine } from "./engine.js";
import { drawCharacter } from "./characters.js";
import { drawCollisionMarker, drawImpact, drawWake } from "./effects.js";
import { drawObstacle } from "./obstacles.js";
import { surfaceScenery, underwaterScenery } from "./scenery.js";

/** Original vector art, evaluated at the simulation clock so pausing freezes the scene.
 * Decorative motion is disabled for reduced motion; gameplay remains visible. */
export function renderScene(
  c: CanvasRenderingContext2D,
  game: RunnerEngine,
  reducedMotion = false,
  impactAge = 1,
): void {
  const distance = reducedMotion ? 0 : game.distance;
  const time = reducedMotion ? 0 : game.elapsed;
  c.save();
  if (game.mode === "surface") surfaceScenery(c, game, distance, time);
  else underwaterScenery(c, game, distance, time);
  for (const obstacle of game.obstacles)
    drawObstacle(
      c,
      obstacle,
      time,
      game.state === "over" && game.collision === obstacle,
    );
  drawCollisionMarker(c, game);
  if (!reducedMotion) drawWake(c, game, time);
  drawCharacter(c, game, time);
  if (game.state === "over" && !reducedMotion) drawImpact(c, game, impactAge);
  c.restore();
}
