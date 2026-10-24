export interface CoralBranch {
  x: number;
  y: number;
  cx: number;
  cy: number;
  endX: number;
  endY: number;
  width: number;
  tip: boolean;
}

/** Shared by the coral painter and collision model, in a 96 × 96 local space. */
export function staghornBranches(variant: number): CoralBranch[] {
  const branches: CoralBranch[] = [];
  function fork(
    x: number,
    y: number,
    angle: number,
    length: number,
    depth: number,
    seed: number,
  ): void {
    const endX = Math.max(7, Math.min(89, x + Math.cos(angle) * length));
    const endY = Math.max(5, Math.min(92, y + Math.sin(angle) * length));
    branches.push({
      x,
      y,
      endX,
      endY,
      cx: x + (endX - x) * 0.3 - 1.5,
      cy: y + (endY - y) * 0.6,
      width: 2.1 + depth * 1.7,
      tip: depth === 0,
    });
    if (depth === 0) return;
    const bend = Math.sin(seed * 2.7 + variant * 9) * 0.13;
    fork(endX, endY, angle - 0.38 + bend, length * 0.64, depth - 1, seed + 3);
    fork(endX, endY, angle + 0.43 + bend, length * 0.59, depth - 1, seed + 7);
  }
  fork(38, 90, -2.02, 31, 3, 1);
  fork(52, 91, -1.34, 34, 3, 2);
  fork(64, 92, -0.91, 25, 2, 5);
  return branches;
}
