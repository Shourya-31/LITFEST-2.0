import { gradient, line, oval, shape, type Context } from "./art.js";
import type { RunnerEngine } from "./engine.js";

const skin = "#e9ad7b";
const skinLight = "#ffd2a0";
const outline = "#234d5b";

function face(c: Context, under: boolean): void {
  oval(c, 0, -55, 9.2, 10.5, skin, outline);
  oval(c, 5.5, -53, 3.2, 4.5, skinLight);
  oval(c, 8.5, -54, 2.4, 1.9, skinLight);
  oval(c, -7.2, -53, 2.8, 3.3, skin);
  line(c, "#754b43", 0.9, () => {
    c.moveTo(4, -48.5);
    c.quadraticCurveTo(6, -47, 8, -49);
  });
  oval(c, 5, -56, 1.1, 1.5, "#163f50");
  oval(c, 5.3, -56.5, 0.35, 0.4, "#fff7d9");
  line(c, "#65423e", 1, () => {
    c.moveTo(3, -59);
    c.lineTo(6.5, -59.5);
  });
  if (under) {
    oval(c, -7.5, -53, 1.3, 1.3, "#ffda8f");
    oval(c, 5, -51, 2.1, 1.1, "#e58c7d");
  }
}
function arm(
  c: Context,
  points: [number, number, number, number, number, number],
  width = 5,
): void {
  const draw = () => {
    c.moveTo(points[0], points[1]);
    c.quadraticCurveTo(points[2], points[3], points[4], points[5]);
  };
  line(c, outline, width + 2, draw);
  line(c, skinLight, width, draw);
  oval(c, points[4], points[5], 3, 2.6, skinLight);
}
function surfer(c: Context, game: RunnerEngine, t: number): void {
  const air = game.playerY < -1;
  const sway = Math.sin(t * 6) * 1.3;
  c.save();
  c.rotate(
    air
      ? Math.max(-0.12, Math.min(0.12, game.velocityY / 3600))
      : Math.sin(t * 5) * 0.014,
  );
  // Board, rail, wax, and a small fin share the same footprint as the old board.
  shape(c, "#0a4959", () => {
    c.moveTo(-27, 1);
    c.lineTo(-21, 9);
    c.lineTo(-18, 1);
  });
  shape(
    c,
    gradient(c, -5, 6, ["#fff0bf", "#efab70"]),
    () => {
      c.moveTo(-40, 0);
      c.bezierCurveTo(-23, -7, 17, -7, 39, -3);
      c.quadraticCurveTo(48, -1, 35, 3);
      c.bezierCurveTo(10, 8, -26, 7, -40, 0);
    },
    "#3f7478",
    1.2,
  );
  line(c, "#fffbe3", 1.3, () => {
    c.moveTo(-29, -1);
    c.quadraticCurveTo(4, -5, 33, -2);
  });
  line(c, "#ed725c", 3, () => {
    c.moveTo(-5, -4);
    c.lineTo(5, 4);
  });
  line(c, "#247c84", 2, () => {
    c.moveTo(-13, -4);
    c.lineTo(-3, 5);
  });
  c.save();
  c.translate(0, air ? 0 : sway);
  // Bent knees, with the far leg darker for depth.
  line(c, outline, 9, () => {
    c.moveTo(3, -27);
    c.lineTo(16, -16);
    c.lineTo(9, -5);
  });
  line(c, "#cc8b67", 6.5, () => {
    c.moveTo(3, -27);
    c.lineTo(16, -16);
    c.lineTo(9, -5);
  });
  line(c, outline, 9, () => {
    c.moveTo(-5, -27);
    c.lineTo(-16, -15);
    c.lineTo(-21, -5);
  });
  line(c, skinLight, 6.5, () => {
    c.moveTo(-5, -27);
    c.lineTo(-16, -15);
    c.lineTo(-21, -5);
  });
  arm(c, [-6, -41, -18, air ? -51 : -30, -30, air ? -45 : -34], 4.5);
  shape(
    c,
    gradient(c, -47, -23, ["#43c9bd", "#148b96"]),
    () => {
      c.moveTo(-8, -46);
      c.quadraticCurveTo(0, -49, 7, -44);
      c.lineTo(10, -29);
      c.lineTo(-11, -26);
      c.closePath();
    },
    outline,
  );
  shape(c, "#254b66", () => {
    c.moveTo(-11, -29);
    c.lineTo(10, -31);
    c.lineTo(13, -21);
    c.lineTo(1, -20);
    c.lineTo(-9, -23);
  });
  line(c, "#80e6d0", 1.2, () => {
    c.moveTo(-7, -42);
    c.lineTo(-7, -32);
  });
  arm(c, [6, -41, 17, air ? -51 : -30, 29, air ? -49 : -37]);
  // Collar and neck keep the face readable at mobile scale.
  line(c, skin, 5, () => {
    c.moveTo(0, -47);
    c.lineTo(0, -44);
  });
  face(c, false);
  shape(c, "#233d4b", () => {
    c.moveTo(-9, -51);
    c.bezierCurveTo(-18, -61, -7, -72, 5, -67);
    c.lineTo(12, -62);
    c.quadraticCurveTo(13, -57, 5, -60);
    c.lineTo(0, -63);
    c.lineTo(-5, -57);
    c.lineTo(-5, -50);
  });
  line(c, "#49626a", 1.4, () => {
    c.moveTo(-8, -62);
    c.quadraticCurveTo(-2, -69, 5, -64);
  });
  c.restore();
  c.restore();
}
function mermaid(c: Context, game: RunnerEngine, t: number): void {
  const beat = Math.sin(t * 6);
  const air = game.playerY < -1;
  // Flowing hair behind the body; animation comes from the simulated run clock.
  shape(
    c,
    gradient(c, -70, -19, ["#593d68", "#302d53"]),
    () => {
      c.moveTo(4, -63);
      c.bezierCurveTo(-23, -83, -24, -52, -29, -43);
      c.quadraticCurveTo(-36, -26 + beat * 3, -49, -34 + beat * 2);
      c.bezierCurveTo(-30, -17, -13, -24, -7, -43);
      c.closePath();
    },
    "#24364f",
  );
  line(c, "#88628d", 1.1, () => {
    c.moveTo(-12, -59);
    c.bezierCurveTo(-24, -55, -20, -31, -37, -32 + beat * 2);
  });
  arm(c, [-7, -41, -20, air ? -49 : -34, -26, air ? -45 : -36], 4);
  c.save();
  c.translate(-2, -20);
  c.rotate(beat * 0.07);
  shape(
    c,
    gradient(c, -8, 28, ["#69e6c6", "#179ea7", "#13738d"]),
    () => {
      c.moveTo(-8, -7);
      c.quadraticCurveTo(-11, 9, -31, 17);
      c.quadraticCurveTo(-40, 21 + beat * 2, -44, 15);
      c.quadraticCurveTo(-29, 34, -12, 21);
      c.quadraticCurveTo(7, 9, 10, -6);
    },
    "#1d6076",
  );
  shape(
    c,
    "#83f0cd",
    () => {
      c.moveTo(-34, 20);
      c.bezierCurveTo(-43, 17, -39, 6 + beat * 4, -53, 5 + beat * 4);
      c.quadraticCurveTo(-54, 17, -47, 22);
      c.quadraticCurveTo(-60, 23, -60, 31 + beat * 3);
      c.quadraticCurveTo(-40, 34, -34, 20);
    },
    "#257d88",
    1,
  );
  line(c, "#b5ffe4", 1, () => {
    c.moveTo(-47, 23);
    c.lineTo(-51, 12 + beat * 3);
    c.moveTo(-47, 24);
    c.lineTo(-55, 29);
  });
  // Small overlapping scales, clipped to the broad upper tail area.
  for (let row = 0; row < 3; row++) {
    for (let i = 0; i < 3; i++) {
      const x = -5 - row * 5 + i * 5;
      const y = 1 + row * 5;
      line(c, "#bcffe361", 0.9, () => {
        c.moveTo(x, y);
        c.quadraticCurveTo(x + 2, y + 3, x + 4, y);
      });
    }
  }
  c.restore();
  shape(
    c,
    gradient(c, -44, -23, [skinLight, skin]),
    () => {
      c.moveTo(-7, -45);
      c.quadraticCurveTo(1, -47, 7, -42);
      c.quadraticCurveTo(5, -30, 9, -25);
      c.quadraticCurveTo(0, -21, -9, -25);
      c.quadraticCurveTo(-6, -34, -7, -45);
    },
    outline,
    1.2,
  );
  oval(c, -4, -38, 5.3, 4, "#a777bd");
  oval(c, 4, -38, 5.3, 4, "#c294d1");
  line(c, "#ffdc91", 2.2, () => {
    c.moveTo(-8, -26);
    c.quadraticCurveTo(0, -23, 8, -26);
  });
  arm(
    c,
    [6, -41, 18, air ? -54 : -30 + beat * 2, 29, air ? -50 : -36 + beat * 2],
    4.5,
  );
  line(c, skin, 5, () => {
    c.moveTo(0, -47);
    c.lineTo(0, -43);
  });
  face(c, true);
  shape(c, "#583d68", () => {
    c.moveTo(-9, -51);
    c.bezierCurveTo(-17, -65, -6, -73, 6, -66);
    c.quadraticCurveTo(12, -63, 10, -58);
    c.quadraticCurveTo(4, -57, 0, -63);
    c.quadraticCurveTo(-5, -60, -6, -51);
  });
  line(c, "#daabce", 1.5, () => {
    c.moveTo(-8, -63);
    c.quadraticCurveTo(-1, -66, 7, -61);
  });
  oval(c, 0, -64, 2, 2, "#ffdb8e");
}

export function drawCharacter(c: Context, game: RunnerEngine, t: number): void {
  c.save();
  c.translate(game.playerX, game.ground + game.playerY);
  // Keep the original character art; lower its pose to match the duck hitbox.
  if (game.ducking) c.scale(1.12, 0.5);
  if (game.mode === "underwater") mermaid(c, game, t);
  else surfer(c, game, t);
  c.restore();
}
