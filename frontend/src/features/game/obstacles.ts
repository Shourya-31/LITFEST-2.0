import { gradient, line, oval, shape, type Context } from "./art.js";
import type { Obstacle } from "./engine.js";
import { drawCoral } from "./coral.js";

function drawWave(c: Context, o: Obstacle, t: number): void {
  c.save();
  c.scale(o.w / 64, o.h / 64);
  oval(c, 30, 65, 38, 4, "#62e0d34d");
  shape(
    c,
    gradient(c, 0, 64, ["#b8ffe8", "#28c8c7", "#0695b1", "#086c92"]),
    () => {
      c.moveTo(-4, 64);
      c.bezierCurveTo(8, 53, 8, 15, 28, 5);
      c.bezierCurveTo(44, -5, 65, 0, 66, 15);
      c.bezierCurveTo(67, 29, 46, 31, 43, 21);
      c.bezierCurveTo(40, 12, 53, 10, 54, 16);
      c.bezierCurveTo(47, 24, 49, 49, 68, 64);
      c.closePath();
    },
    "#167791",
    1.3,
  );
  // Shaded barrel, translucent face, and long curved ribs give the crest depth.
  shape(c, "#086f997d", () => {
    c.moveTo(44, 14);
    c.bezierCurveTo(24, 22, 35, 52, 51, 63);
    c.lineTo(65, 64);
    c.bezierCurveTo(43, 44, 44, 25, 54, 19);
    c.quadraticCurveTo(52, 11, 44, 14);
  });
  shape(c, "#9cf8df5c", () => {
    c.moveTo(3, 64);
    c.bezierCurveTo(17, 49, 11, 23, 31, 9);
    c.bezierCurveTo(17, 28, 25, 49, 18, 64);
  });
  line(c, "#effff5", 4.3, () => {
    c.moveTo(12, 30);
    c.bezierCurveTo(18, 7, 35, -3, 53, 4);
    c.bezierCurveTo(74, 11, 58, 31, 46, 23);
    c.bezierCurveTo(39, 17, 49, 10, 54, 16);
  });
  line(c, "#a8ffe9", 1.6, () => {
    c.moveTo(10, 56);
    c.bezierCurveTo(19, 42, 15, 25, 30, 14);
    c.moveTo(23, 59);
    c.bezierCurveTo(27, 48, 22, 34, 31, 25);
    c.moveTo(37, 43);
    c.quadraticCurveTo(39, 54, 47, 60);
  });
  line(c, "#edfff4c4", 1.5, () => {
    c.moveTo(-2, 63);
    c.quadraticCurveTo(17, 58, 35, 64);
    c.quadraticCurveTo(49, 59, 68, 64);
  });
  for (let i = 0; i < 7; i++) {
    const drift = Math.sin(t * 6 + i * 1.7 + o.variant * 5);
    oval(c, 16 + i * 6, 62 + drift * 1.5, 2.6 + (i % 2), 1.7, "#d5fff0");
    if (i < 4)
      oval(c, 26 + i * 7 + drift * 1.4, 1 - (i % 2) * 3, 1.1, 1.4, "#e9fff4bf");
  }
  c.restore();
}

/** Solid hazard bodies follow the existing hitbox footprint; fins and foam are decorative. */
export function drawObstacle(
  c: Context,
  o: Obstacle,
  t: number,
  highlight = false,
): void {
  c.save();
  c.translate(o.x, o.y);
  if (highlight) {
    c.shadowColor = "#ffe2a1";
    c.shadowBlur = 9;
  }
  if (o.kind === "wave") {
    drawWave(c, o, t);
  } else if (o.kind === "cloud") {
    const paint = gradient(c, -4, o.h + 5, ["#6e7e9b", "#344e70", "#263d59"]);
    shape(
      c,
      paint,
      () => {
        c.moveTo(9, o.h - 2);
        c.bezierCurveTo(-7, 26, -2, 9, 12, 10);
        c.bezierCurveTo(8, -8, 36, -10, 40, 4);
        c.bezierCurveTo(55, -7, 68, 3, 65, 13);
        c.bezierCurveTo(80, 17, 72, 35, 58, 33);
        c.closePath();
      },
      "#253d5e",
      1.2,
    );
    line(c, "#a5b0bf70", 1.5, () => {
      c.moveTo(10, 12);
      c.quadraticCurveTo(14, 5, 23, 7);
      c.moveTo(27, 1);
      c.quadraticCurveTo(34, -1, 38, 5);
    });
    // Small raindrops sit outside the forgiving collision box.
    for (let i = 0; i < 3; i++) {
      const y = 35 + ((t * 23 + i * 5) % 11);
      line(c, "#c2ecf096", 1.3, () => {
        c.moveTo(17 + i * 18, y);
        c.lineTo(15 + i * 18, y + 4);
      });
    }
    shape(c, "#ffde93", () => {
      c.moveTo(37, 28);
      c.lineTo(31, 37);
      c.lineTo(36, 37);
      c.lineTo(32, 45);
      c.lineTo(44, 33);
      c.lineTo(38, 33);
    });
  } else if (o.kind === "coral") {
    drawCoral(c, o);
  } else {
    // Tail and fins move; the main body remains aligned with the collision box.
    const flap = Math.sin(t * 7 + o.variant * 8) * 3;
    shape(
      c,
      "#517c9c",
      () => {
        c.moveTo(o.w - 23, 17);
        c.quadraticCurveTo(o.w - 10, 15, o.w - 2, flap - 2);
        c.lineTo(o.w - 6, 16);
        c.lineTo(o.w + 1, 31 + flap);
        c.quadraticCurveTo(o.w - 15, 30, o.w - 23, 21);
      },
      "#254d6b",
      1.2,
    );
    shape(
      c,
      "#789eaf",
      () => {
        c.moveTo(34, 10);
        c.quadraticCurveTo(36, -7, 50, -12);
        c.lineTo(50, 13);
      },
      "#315a73",
      1,
    );
    shape(
      c,
      gradient(c, 2, 34, ["#9cc2c7", "#739cae", "#3a6688"]),
      () => {
        c.moveTo(0, 18);
        c.bezierCurveTo(17, -1, 40, -4, o.w - 20, 13);
        c.quadraticCurveTo(o.w - 10, 17, o.w - 20, 24);
        c.bezierCurveTo(44, 39, 14, 32, 0, 18);
      },
      "#284c6b",
      1.5,
    );
    shape(c, "#d2e2d8", () => {
      c.moveTo(3, 21);
      c.quadraticCurveTo(33, 27, o.w - 23, 22);
      c.quadraticCurveTo(31, 40, 3, 21);
    });
    shape(
      c,
      "#547d99",
      () => {
        c.moveTo(37, 23);
        c.quadraticCurveTo(35, 35, 51, 39);
        c.lineTo(48, 22);
      },
      "#315773",
      1,
    );
    line(c, "#c7e2df9e", 1, () => {
      c.moveTo(14, 9);
      c.quadraticCurveTo(34, 2, 54, 12);
    });
    oval(c, 14, 14, 2.8, 2.7, "#e2e8ca");
    oval(c, 13.3, 14, 1.6, 1.9, "#17364d");
    oval(c, 13, 13.4, 0.5, 0.5, "#ffffff");
    line(c, "#284d67", 1.1, () => {
      c.moveTo(3, 21);
      c.quadraticCurveTo(12, 25, 20, 21);
    });
    for (let i = 0; i < 3; i++)
      line(c, "#345f7c", 1.2, () => {
        c.moveTo(25 + i * 4, 13);
        c.quadraticCurveTo(23 + i * 4, 19, 27 + i * 4, 23);
      });
  }
  c.restore();
}
