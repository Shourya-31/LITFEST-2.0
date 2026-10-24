import { gradient, line, oval, shape, type Context } from "./art.js";
import type { Obstacle } from "./engine.js";
import { staghornBranches } from "./coral-geometry.js";

/** Asymmetric, repeatedly forked staghorn branches; no vertical cactus arms. */
function staghorn(c: Context, variant: number): void {
  const branches = staghornBranches(variant);
  for (const branch of branches) {
    const draw = () => {
      c.moveTo(branch.x, branch.y);
      c.quadraticCurveTo(branch.cx, branch.cy, branch.endX, branch.endY);
    };
    line(c, "#8d4a77", branch.width + 1.8, draw);
    c.strokeStyle = gradient(c, 7, 94, ["#ffdfbc", "#f3a6a2", "#c86c9c"]);
    c.lineWidth = branch.width;
    c.stroke();
    oval(
      c,
      branch.x + (branch.endX - branch.x) * 0.65,
      branch.y + (branch.endY - branch.y) * 0.65,
      0.85,
      0.85,
      "#fff2cba6",
    );
  }
  for (const tip of branches.filter((branch) => branch.tip)) {
    oval(c, tip.endX, tip.endY, 1.7, 2.3, "#fff0c8");
    line(c, "#f8c9c6", 0.75, () => {
      c.moveTo(tip.endX - 2.3, tip.endY - 1);
      c.lineTo(tip.endX + 2.3, tip.endY + 1);
    });
  }
}

/** Broad scalloped sea fan with a fine lattice of veins and pale polyps. */
function seaFan(c: Context): void {
  const rim = [
    [10, 44],
    [13, 25],
    [26, 12],
    [43, 7],
    [61, 12],
    [78, 24],
    [85, 43],
    [77, 59],
  ];
  shape(
    c,
    gradient(c, 4, 92, ["#dfa8d2", "#bd74b1", "#8c599c"]),
    () => {
      c.moveTo(46, 91);
      c.quadraticCurveTo(24, 75, 10, 50);
      c.bezierCurveTo(2, 40, 8, 34, 13, 34);
      c.bezierCurveTo(4, 21, 16, 15, 24, 19);
      c.bezierCurveTo(17, 5, 34, 1, 40, 10);
      c.bezierCurveTo(46, -2, 60, 5, 60, 14);
      c.bezierCurveTo(75, 8, 85, 20, 78, 29);
      c.bezierCurveTo(93, 30, 94, 46, 82, 50);
      c.quadraticCurveTo(88, 62, 70, 72);
      c.quadraticCurveTo(55, 82, 46, 91);
    },
    "#6e527f",
    1.2,
  );
  for (let i = 0; i < rim.length; i++) {
    const [x, y] = rim[i];
    line(c, "#f7c3d5", 1.4, () => {
      c.moveTo(46, 91);
      c.quadraticCurveTo(44 + (x - 44) * 0.7, 68, x, y);
    });
    for (let j = 1; j <= 4; j++) {
      const part = j / 5;
      const px = 46 + (x - 46) * part,
        py = 91 + (y - 91) * part;
      oval(c, px, py, 0.95, 1.1, "#ffe7d3");
      if (i < rim.length - 1) {
        const [nextX, nextY] = rim[i + 1];
        line(c, "#ebbad28c", 0.8, () => {
          c.moveTo(px, py);
          c.quadraticCurveTo(
            (px + 46 + (nextX - 46) * part) / 2,
            py - 4,
            46 + (nextX - 46) * part,
            91 + (nextY - 91) * part,
          );
        });
      }
    }
    oval(c, x, y, 1.5, 1.8, "#ffe7d3");
  }
  line(c, "#b987b7", 4, () => {
    c.moveTo(46, 94);
    c.quadraticCurveTo(46, 80, 43, 67);
  });
}

/** Rounded brain-coral lobes with winding ridges rather than upright stems. */
function brainCoral(c: Context): void {
  shape(
    c,
    gradient(c, 4, 95, ["#f6df91", "#d7b877", "#a58e69"]),
    () => {
      c.moveTo(9, 88);
      c.bezierCurveTo(-1, 72, 8, 54, 15, 53);
      c.bezierCurveTo(8, 30, 20, 14, 34, 16);
      c.bezierCurveTo(39, -2, 65, 2, 69, 21);
      c.bezierCurveTo(88, 17, 97, 42, 85, 54);
      c.bezierCurveTo(102, 68, 90, 91, 80, 92);
      c.quadraticCurveTo(42, 102, 9, 88);
    },
    "#7c7868",
    1.5,
  );
  for (let i = 0; i < 7; i++) {
    const x = 20 + i * 9;
    const top = 18 + Math.abs(3 - i) * 6;
    const ridge = () => {
      c.moveTo(x, 87 - (i % 2) * 3);
      c.bezierCurveTo(x - 12, 77, x + 12, 67, x + 2, 59);
      c.bezierCurveTo(x - 9, 52, x + 9, 42, x + 1, top);
    };
    line(c, "#947b64", 4.1, ridge);
    line(c, "#ffe9a6", 2.2, ridge);
  }
  line(c, "#fff0b9", 1.5, () => {
    c.moveTo(29, 29);
    c.bezierCurveTo(29, 17, 39, 18, 39, 28);
    c.moveTo(47, 22);
    c.bezierCurveTo(47, 10, 59, 13, 58, 24);
  });
}

/** Original coral colonies, scaled to the existing obstacle footprint. */
export function drawCoral(c: Context, obstacle: Obstacle): void {
  c.save();
  c.scale(obstacle.w / 96, obstacle.h / 96);
  oval(c, 48, 96, 45, 5, "#12344b5c");
  if (obstacle.variant < 0.34) staghorn(c, obstacle.variant);
  else if (obstacle.variant < 0.68) seaFan(c);
  else brainCoral(c);
  // Encrusting polyps merge the colony into a small reef-rock base.
  for (let i = 0; i < 5; i++) {
    const x = 19 + i * 14;
    oval(
      c,
      x,
      93 + (i % 2) * 2,
      9,
      5 + (i % 2),
      ["#9e779e", "#b78d9f", "#ae9e9c"][i % 3],
      "#5d6978",
    );
    oval(c, x - 1, 92 + (i % 2) * 2, 2.3, 1.6, "#edc4be");
  }
  c.restore();
}
