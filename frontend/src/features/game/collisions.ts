import type { Obstacle, Rect } from "./engine.js";
import { staghornBranches } from "./coral-geometry.js";

type Shape =
  | (Rect & { type: "rect" | "ellipse" })
  | { type: "polygon"; points: [number, number][] };
const rect = (x: number, y: number, w: number, h: number): Shape => ({
  type: "rect",
  x,
  y,
  w,
  h,
});
const ellipse = (x: number, y: number, w: number, h: number): Shape => ({
  type: "ellipse",
  x,
  y,
  w,
  h,
});
const cache = new WeakMap<Obstacle, { key: string; shapes: Shape[] }>();

function shapesFor(o: Obstacle): Shape[] {
  const key = `${o.kind}:${o.w}:${o.h}:${o.variant}`;
  const cached = cache.get(o);
  if (cached?.key === key) return cached.shapes;
  let shapes: Shape[];
  if (o.kind === "wave") {
    // Solid face and curling crest; leave the empty upper corners and barrel open.
    shapes = [
      rect(0.12, 0.58, 0.14, 0.36),
      rect(0.26, 0.28, 0.16, 0.66),
      rect(0.42, 0.1, 0.17, 0.84),
      ellipse(0.58, 0.08, 0.32, 0.28),
      rect(0.58, 0.58, 0.16, 0.36),
      rect(0.76, 0.83, 0.17, 0.11),
    ];
  } else if (o.kind === "cloud") {
    shapes = [
      ellipse(0.07, 0.35, 0.86, 0.58),
      ellipse(0.19, 0.03, 0.4, 0.71),
      ellipse(0.53, 0.15, 0.37, 0.65),
    ];
  } else if (o.kind === "shark") {
    shapes = [ellipse(0.06, 0.17, 0.73, 0.72)]; // Fins and the thin tail are forgiving decoration.
  } else if (o.variant < 0.34) {
    shapes = [];
    for (const branch of staghornBranches(o.variant)) {
      const steps = Math.max(
        2,
        Math.ceil(
          Math.hypot(branch.endX - branch.x, branch.endY - branch.y) /
            (branch.width * 0.5),
        ),
      );
      const radius = branch.width / 2;
      for (let i = 0; i <= steps; i++) {
        const t = i / steps,
          s = 1 - t;
        const x =
          s * s * branch.x + 2 * s * t * branch.cx + t * t * branch.endX;
        const y =
          s * s * branch.y + 2 * s * t * branch.cy + t * t * branch.endY;
        shapes.push(
          ellipse(
            (x - radius) / 96,
            (y - radius) / 96,
            (radius * 2) / 96,
            (radius * 2) / 96,
          ),
        );
      }
    }
  } else if (o.variant < 0.68) {
    shapes = [
      {
        type: "polygon",
        points: [
          [0.12, 0.45],
          [0.16, 0.27],
          [0.29, 0.14],
          [0.46, 0.09],
          [0.64, 0.16],
          [0.82, 0.31],
          [0.87, 0.46],
          [0.76, 0.64],
          [0.48, 0.94],
          [0.25, 0.65],
        ],
      },
    ];
  } else {
    shapes = [
      ellipse(0.15, 0.2, 0.7, 0.7),
      ellipse(0.34, 0.08, 0.36, 0.44),
      ellipse(0.12, 0.52, 0.8, 0.42),
    ];
  }
  cache.set(o, { key, shapes });
  return shapes;
}

function polygonOverlapsRect(points: [number, number][], box: Rect): boolean {
  // Separating-axis test for a convex silhouette against the player's rectangle.
  function separated(nx: number, ny: number): boolean {
    let min = Infinity,
      max = -Infinity;
    for (const [x, y] of points) {
      const p = x * nx + y * ny;
      min = Math.min(min, p);
      max = Math.max(max, p);
    }
    const center = (box.x + box.w / 2) * nx + (box.y + box.h / 2) * ny;
    const radius = (Math.abs(nx) * box.w) / 2 + (Math.abs(ny) * box.h) / 2;
    return center + radius <= min || center - radius >= max;
  }
  if (separated(1, 0) || separated(0, 1)) return false;
  for (let i = 0; i < points.length; i++) {
    const a = points[i],
      b = points[(i + 1) % points.length];
    if (separated(-(b[1] - a[1]), b[0] - a[0])) return false;
  }
  return true;
}

export function hitsObstacle(player: Rect, obstacle: Obstacle): boolean {
  if (
    player.x >= obstacle.x + obstacle.w ||
    player.x + player.w <= obstacle.x ||
    player.y >= obstacle.y + obstacle.h ||
    player.y + player.h <= obstacle.y
  )
    return false;
  // Compare in normalized obstacle space; cached local silhouettes survive scrolling/resizing.
  const box = {
    x: (player.x - obstacle.x) / obstacle.w,
    y: (player.y - obstacle.y) / obstacle.h,
    w: player.w / obstacle.w,
    h: player.h / obstacle.h,
  };
  return shapesFor(obstacle).some((shape) => {
    if (shape.type === "polygon") return polygonOverlapsRect(shape.points, box);
    if (shape.type === "rect")
      return (
        box.x < shape.x + shape.w &&
        box.x + box.w > shape.x &&
        box.y < shape.y + shape.h &&
        box.y + box.h > shape.y
      );
    const rx = shape.w / 2,
      ry = shape.h / 2,
      cx = shape.x + rx,
      cy = shape.y + ry;
    const dx = (Math.max(box.x, Math.min(cx, box.x + box.w)) - cx) / rx;
    const dy = (Math.max(box.y, Math.min(cy, box.y + box.h)) - cy) / ry;
    return dx * dx + dy * dy < 1;
  });
}
