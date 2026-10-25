import {
  gradient,
  glow,
  line,
  oval,
  shape,
  wrap,
  type Context,
} from "./art.js";
import type { RunnerEngine } from "./engine.js";

function cloud(c: Context, x: number, y: number, scale: number): void {
  c.save();
  c.translate(x, y);
  c.scale(scale, scale);
  shape(c, "#fff9eec7", () => {
    c.moveTo(-48, 12);
    c.bezierCurveTo(-70, -2, -42, -20, -26, -12);
    c.bezierCurveTo(-28, -43, 15, -44, 22, -20);
    c.bezierCurveTo(50, -28, 68, 0, 46, 12);
    c.closePath();
  });
  line(c, "#d7eee1aa", 2, () => {
    c.moveTo(-36, 13);
    c.lineTo(39, 13);
  });
  c.restore();
}
function palm(c: Context, x: number, y: number, scale: number): void {
  c.save();
  c.translate(x, y);
  c.scale(scale, scale);
  line(c, "#3c8279", 4, () => {
    c.moveTo(0, 0);
    c.quadraticCurveTo(10, -20, 4, -42);
  });
  for (let i = 0; i < 5; i++) {
    const angle = -Math.PI + i * 0.72;
    shape(c, "#327d73", () => {
      c.moveTo(4, -42);
      c.quadraticCurveTo(
        4 + Math.cos(angle) * 17,
        -60 + Math.sin(angle) * 8,
        4 + Math.cos(angle) * 32,
        -42 + Math.sin(angle) * 22,
      );
      c.quadraticCurveTo(
        4 + Math.cos(angle) * 17,
        -43 + Math.sin(angle) * 4,
        4,
        -42,
      );
    });
  }
  c.restore();
}

export function surfaceScenery(
  c: Context,
  game: RunnerEngine,
  d: number,
  t: number,
): void {
  const { width: w, height: h, ground: g } = game;
  const horizon = g * 0.52;
  c.fillStyle = gradient(c, 0, horizon + 45, ["#71cbd5", "#c4e9dc", "#ffdfac"]);
  c.fillRect(0, 0, w, h);
  const sunX = w * 0.77,
    sunY = horizon * 0.49;
  glow(c, sunX, sunY, 100, "#fff2c859");
  oval(c, sunX, sunY, 29, 29, "#fff2cc");
  cloud(c, wrap(135 - d * 0.025 + 95, w + 190) - 95, horizon * 0.42, 0.72);
  cloud(c, wrap(w * 0.6 - d * 0.04 + 95, w + 190) - 95, horizon * 0.22, 0.48);
  for (let layer = 0; layer < 2; layer++) {
    const offset = d * (0.018 + layer * 0.02);
    const baseline = horizon + 10 + layer * 14;
    shape(c, layer ? "#64aaa0" : "#8cc2b5", () => {
      c.moveTo(0, baseline);
      for (let x = 0; x < w + 8; x += 8) {
        const crest = Math.pow(
          Math.max(0, Math.sin((x + offset + layer * 380) / 145)),
          3,
        );
        c.lineTo(x, baseline - crest * (layer ? 32 : 52));
      }
      c.lineTo(w, baseline + 25);
      c.lineTo(0, baseline + 25);
    });
  }
  const islandX = wrap(w * 0.38 - d * 0.035 + 140, w + 280) - 140;
  oval(c, islandX, horizon + 18, 62, 9, "#f0d4a0");
  palm(c, islandX - 7, horizon + 17, 0.64);
  palm(c, islandX + 18, horizon + 17, 0.43);
  for (let i = 0; i < 3; i++) {
    const x = wrap(w * 0.43 + i * 19 - d * 0.055, w + 30);
    const y = 38 + (i % 2) * 14 + Math.sin(t * 0.6 + i) * 2;
    line(c, "#3f827a9c", 1.4, () => {
      c.moveTo(x - 5, y);
      c.quadraticCurveTo(x - 2, y - 4, x, y);
      c.quadraticCurveTo(x + 2, y - 4, x + 5, y);
    });
  }
  c.fillStyle = gradient(c, horizon + 19, h, ["#53c5bc", "#139caa", "#08718f"]);
  c.fillRect(0, horizon + 19, w, h - horizon - 19);
  // Reflections widen toward the foreground, away from the hazard silhouettes.
  for (let i = 0; i < 14; i++) {
    const y = horizon + 24 + i * 7;
    const length = 7 + i * 4 + Math.sin(t + i * 2.1) * 7;
    line(c, `rgba(255,244,197,${0.29 - i * 0.013})`, 1.3 + i * 0.08, () => {
      c.moveTo(sunX - length / 2 + Math.sin(i) * 10, y);
      c.lineTo(sunX + length / 2, y);
    });
  }
  for (let layer = 0; layer < 3; layer++) {
    const baseline = horizon + 37 + (layer * (g - horizon - 35)) / 2;
    const shift = d * (0.08 + layer * 0.16);
    shape(c, ["#2bb3b3aa", "#169dab80", "#087e98bb"][layer], () => {
      c.moveTo(0, h);
      for (let x = 0; x < w + 8; x += 8)
        c.lineTo(
          x,
          baseline +
            Math.sin((x + shift) / (85 - layer * 11)) * (4 + layer * 2),
        );
      c.lineTo(w, h);
    });
    line(c, ["#b3f0d761", "#92e9d84d", "#a4f4dc88"][layer], 1.4, () => {
      for (let x = 0; x < w + 8; x += 8) {
        const y =
          baseline +
          Math.sin((x + shift) / (85 - layer * 11)) * (4 + layer * 2);
        if (x === 0) c.moveTo(x, y);
        else c.lineTo(x, y);
      }
    });
  }
  // A clear foam line marks the playable ocean surface.
  line(c, "#c4ffeb", 2.5, () => {
    c.moveTo(0, g + 3);
    for (let x = 0; x < w + 8; x += 8)
      c.lineTo(x, g + 3 + Math.sin((x + d * 0.5) / 33) * 1.4);
  });
  for (let i = 0; i < Math.ceil(w / 34); i++) {
    const x = wrap(i * 71 - d * 0.8, w + 90) - 45;
    const y = g + 15 + (i % 4) * 12;
    line(c, i % 2 ? "#6bd7cb5c" : "#b1f4dc42", 1.4, () => {
      c.moveTo(x, y);
      c.quadraticCurveTo(x + 13, y - 3, x + 25 + (i % 3) * 9, y);
    });
  }
}

function seaFan(
  c: Context,
  x: number,
  y: number,
  scale: number,
  color: string,
  t: number,
): void {
  c.save();
  c.translate(x, y);
  c.scale(scale, scale);
  for (let i = -2; i <= 2; i++) {
    line(c, color, 4, () => {
      c.moveTo(0, 4);
      c.quadraticCurveTo(
        i * 8,
        -13,
        i * 14 + Math.sin(t + i) * 2,
        -34 - (2 - Math.abs(i)) * 9,
      );
    });
    line(c, color, 2.5, () => {
      c.moveTo(i * 8, -18);
      c.lineTo(i * 12 - 7, -31 - (i % 2) * 5);
      c.moveTo(i * 9, -23);
      c.lineTo(i * 13 + 7, -38 - (i % 2) * 4);
    });
  }
  c.restore();
}
function fish(
  c: Context,
  x: number,
  y: number,
  size: number,
  color: string,
  t: number,
): void {
  oval(c, x, y, size, size * 0.4, color);
  shape(c, color, () => {
    c.moveTo(x + size * 0.7, y);
    c.lineTo(x + size * 1.6, y - size * 0.45);
    c.quadraticCurveTo(
      x + size * (1.35 + Math.sin(t) * 0.2),
      y,
      x + size * 1.6,
      y + size * 0.45,
    );
  });
}

export function underwaterScenery(
  c: Context,
  game: RunnerEngine,
  d: number,
  t: number,
): void {
  const { width: w, height: h, ground: g } = game;
  c.fillStyle = gradient(c, 0, h, ["#2bafa9", "#0b697f", "#09394f"]);
  c.fillRect(0, 0, w, h);
  glow(c, w * 0.22, -10, w * 0.6, "#b1ffe729");
  for (let i = 0; i < 5; i++) {
    const origin = w * 0.1 + i * w * 0.16;
    const sway = Math.sin(t * 0.25 + i) * 16;
    shape(c, i % 2 ? "#caffd410" : "#caffd41a", () => {
      c.moveTo(origin, 0);
      c.lineTo(origin + 14, 0);
      c.lineTo(origin + 145 + sway, g);
      c.lineTo(origin + 28 + sway, g);
    });
  }
  for (let i = 0; i < 8; i++) {
    const x = wrap(i * 145 - d * 0.07, w + 160) - 80;
    seaFan(
      c,
      x,
      g - 33 + (i % 3) * 7,
      1.25 + (i % 3) * 0.3,
      "#146679",
      t * 0.35,
    );
    oval(c, x + 22, g - 25, 54, 24 + (i % 3) * 9, "#105c71");
  }
  for (let school = 0; school < 2; school++) {
    const schoolX =
      wrap(
        w * 0.6 + school * 220 - d * (0.08 + school * 0.02) - t * 6,
        w + 160,
      ) - 80;
    for (let i = 0; i < 7; i++) {
      fish(
        c,
        schoolX + (i % 4) * 22,
        g * (0.24 + school * 0.23) +
          Math.floor(i / 4) * 13 +
          Math.sin(t * 1.5 + i) * 3,
        4 + (i % 3),
        school ? "#77c5bc66" : "#b6ebc373",
        t * 3 + i,
      );
    }
  }
  for (let i = 0; i < 22; i++) {
    const x = wrap(i * 103 - d * 0.13 + Math.sin(t + i) * 3, w + 30) - 15;
    const y = wrap(i * 67 - t * (8 + (i % 4) * 3), g + 30);
    const r = 1.3 + (i % 3);
    line(c, "#bdfce53b", 0.8, () => c.arc(x, y, r, 0, Math.PI * 2));
    oval(c, x - r * 0.25, y - r * 0.3, 0.65, 0.65, "#d4ffed66");
  }
  shape(c, gradient(c, g, h, ["#417f7c", "#194f60"]), () => {
    c.moveTo(0, g + 3);
    for (let x = 0; x < w + 8; x += 8)
      c.lineTo(x, g + 4 + Math.sin((x + d * 0.3) / 80) * 2);
    c.lineTo(w, h);
    c.lineTo(0, h);
  });
  line(c, "#95d5bba1", 2, () => {
    c.moveTo(0, g + 4);
    c.lineTo(w, g + 4);
  });
  // Sandy ripples and soft caustic ribbons, always below the play lane.
  for (let i = 0; i < Math.ceil(w / 28); i++) {
    const x = wrap(i * 73 - d * 0.65, w + 100) - 50;
    const y = g + 15 + (i % 4) * 12;
    line(c, "#9ee0bd32", 1, () => {
      c.moveTo(x, y);
      c.quadraticCurveTo(x + 16, y - 5, x + 35, y);
    });
  }
  for (let i = 0; i < Math.ceil(w / 95); i++) {
    const x = wrap(i * 139 - d * 0.7, w + 160) - 80;
    for (let stem = 0; stem < 3; stem++) {
      shape(c, ["#126f72", "#208783", "#31958b"][stem], () => {
        c.moveTo(x + stem * 7, h + 2);
        c.bezierCurveTo(
          x - 15 + stem * 8,
          h - 20,
          x + 18 + Math.sin(t * 1.6 + i) * 7,
          h - 48 - stem * 9,
          x + 7,
          h - 48 - stem * 9,
        );
        c.bezierCurveTo(
          x - 12,
          h - 20,
          x + 15,
          h - 18,
          x + stem * 7 + 5,
          h + 2,
        );
      });
    }
    if (i % 3 === 0) seaFan(c, x + 38, h + 3, 0.65, "#a68c806e", t);
    oval(c, x + 58, g + 27, 4, 2, "#a5c8a7");
  }
  for (let i = 0; i < 3; i++) {
    const x = wrap(180 + i * 310 - d * 0.22, w + 120) - 60;
    seaFan(c, x, g + 1, 0.46 + (i % 2) * 0.12, "#408d8e8c", t * 0.5);
  }
}
