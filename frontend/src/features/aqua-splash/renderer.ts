import type { AquaTetrisEngine } from "./engine.js";
import type { PieceName } from "./types.js";
import aquaBgUrl from "./aqua-bg.jpg";

/** Virtual screen dimensions matching the background image */
export const VIRTUAL_WIDTH = 1024;
export const VIRTUAL_HEIGHT = 571;

/** Central Well Grid layout matching reference image */
const COLS = 10;
const ROWS = 20;
const CELL_W = 28;
const CELL_H = 19.5;
const GRID_W = COLS * CELL_W;    // 280
const GRID_H = ROWS * CELL_H;  // 390
const GRID_LEFT = Math.round((VIRTUAL_WIDTH - GRID_W) / 2); // 372
const GRID_TOP = 100;
const GRID_RIGHT = GRID_LEFT + GRID_W; // 652
const GRID_BOTTOM = GRID_TOP + GRID_H; // 490

/** Cached background image */
let bgImg: HTMLImageElement | null = null;
let bgReady = false;
function getBg(): HTMLImageElement | null {
  if (!bgImg) {
    bgImg = new Image();
    bgImg.onload = () => { bgReady = true; };
    bgImg.src = aquaBgUrl;
  }
  return bgReady ? bgImg : null;
}
getBg();

/** Color definitions for Crystal Gem blocks */
const GEM_COLORS: Record<PieceName, { top: string; mid: string; bot: string; stroke: string; glow: string }> = {
  I: { top: "#bbf7fe", mid: "#00e5ff", bot: "#0284c7", stroke: "#0369a1", glow: "#38bdf8" }, // Cyan
  J: { top: "#bfdbfe", mid: "#3b82f6", bot: "#1d4ed8", stroke: "#1e3a8a", glow: "#60a5fa" }, // Blue
  T: { top: "#f3e8ff", mid: "#c084fc", bot: "#7e22ce", stroke: "#581c87", glow: "#e879f9" }, // Purple
  Z: { top: "#fecdd3", mid: "#f43f5e", bot: "#be123c", stroke: "#881337", glow: "#fb7185" }, // Red
  L: { top: "#fed7aa", mid: "#fb923c", bot: "#c2410c", stroke: "#7c2d12", glow: "#f97316" }, // Orange
  O: { top: "#fef08a", mid: "#facc15", bot: "#a16207", stroke: "#713f12", glow: "#fde047" }, // Gold
  S: { top: "#bbf7d0", mid: "#4ade80", bot: "#15803d", stroke: "#14532d", glow: "#86efac" }, // Green
};

/** Draw arcade text with outline */
function drawArcadeText(
  ctx: CanvasRenderingContext2D,
  text: string,
  x: number,
  y: number,
  size: number,
  fillColor: string,
  strokeColor = "#020f1b",
  strokeWidth = 3,
  align: CanvasTextAlign = "center",
): void {
  ctx.save();
  ctx.textAlign = align;
  ctx.textBaseline = "middle";
  ctx.font = `bold ${size}px 'Press Start 2P', 'Courier New', monospace`;

  if (strokeWidth > 0) {
    ctx.strokeStyle = strokeColor;
    ctx.lineWidth = strokeWidth;
    ctx.lineJoin = "round";
    ctx.strokeText(text, x, y);
  }

  ctx.fillStyle = fillColor;
  ctx.fillText(text, x, y);
  ctx.restore();
}

/** Draw a detailed fan scallop seashell */
function drawScallopShell(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  primaryColor = "#fed7aa",
  accentColor = "#ea580c",
): void {
  ctx.save();
  ctx.translate(x, y);

  ctx.beginPath();
  ctx.moveTo(w * 0.35, h * 0.9);
  ctx.lineTo(w * 0.65, h * 0.9);
  ctx.bezierCurveTo(w * 0.85, h * 0.6, w * 0.98, h * 0.3, w * 0.85, h * 0.1);
  ctx.bezierCurveTo(w * 0.7, 0, w * 0.3, 0, w * 0.15, h * 0.1);
  ctx.bezierCurveTo(w * 0.02, h * 0.3, w * 0.15, h * 0.6, w * 0.35, h * 0.9);
  ctx.closePath();

  const grad = ctx.createRadialGradient(w * 0.5, h * 0.3, 2, w * 0.5, h * 0.5, w * 0.5);
  grad.addColorStop(0, "#ffffff");
  grad.addColorStop(0.3, primaryColor);
  grad.addColorStop(1, accentColor);
  ctx.fillStyle = grad;
  ctx.fill();

  ctx.strokeStyle = "#431407";
  ctx.lineWidth = 1.5;
  ctx.stroke();

  // Ribs radiating from hinge
  ctx.strokeStyle = "rgba(67, 20, 7, 0.4)";
  ctx.lineWidth = 1;
  const ribs = [0.25, 0.38, 0.5, 0.62, 0.75];
  for (const rx of ribs) {
    ctx.beginPath();
    ctx.moveTo(w * 0.5, h * 0.85);
    ctx.quadraticCurveTo(w * rx, h * 0.4, w * rx, h * 0.08);
    ctx.stroke();
  }

  // Highlight
  ctx.fillStyle = "rgba(255, 255, 255, 0.55)";
  ctx.beginPath();
  ctx.ellipse(w * 0.5, h * 0.25, w * 0.2, h * 0.1, 0, 0, Math.PI * 2);
  ctx.fill();

  ctx.restore();
}

/** Draw a wooden score banner with clamshells on each side */
function drawWoodShellBanner(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  scoreStr: string,
): void {
  ctx.save();

  const plankX = x + 16;
  const plankW = w - 32;
  const plankY = y + 2;
  const plankH = h - 4;

  const woodGrad = ctx.createLinearGradient(0, plankY, 0, plankY + plankH);
  woodGrad.addColorStop(0, "#9a6237");
  woodGrad.addColorStop(0.2, "#be834f");
  woodGrad.addColorStop(0.6, "#85512b");
  woodGrad.addColorStop(1, "#543016");
  ctx.fillStyle = woodGrad;

  ctx.beginPath();
  ctx.roundRect(plankX, plankY, plankW, plankH, 6);
  ctx.fill();

  ctx.strokeStyle = "#2b1404";
  ctx.lineWidth = 2;
  ctx.stroke();

  ctx.strokeStyle = "rgba(254, 240, 138, 0.4)";
  ctx.lineWidth = 1;
  ctx.strokeRect(plankX + 3, plankY + 2, plankW - 6, plankH - 4);

  // Shells
  drawScallopShell(ctx, x - 4, y - 2, 34, 38, "#fde68a", "#d97706");
  drawScallopShell(ctx, x + w - 30, y - 2, 34, 38, "#fde68a", "#d97706");

  // 7-digit score
  drawArcadeText(ctx, scoreStr, x + w / 2, y + h / 2 + 1, 12, "#ffffff", "#021220", 2.5);

  ctx.restore();
}

/** Draw horizontal pill frame with pressure gauge and purple shell */
function drawPillIndicator(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  valStr: string,
  isGauge = true,
): void {
  ctx.save();

  const radius = h / 2;
  ctx.beginPath();
  ctx.roundRect(x, y, w, h, radius);
  const pillGrad = ctx.createLinearGradient(0, y, 0, y + h);
  pillGrad.addColorStop(0, "#08263e");
  pillGrad.addColorStop(0.5, "#0b3756");
  pillGrad.addColorStop(1, "#031523");
  ctx.fillStyle = pillGrad;
  ctx.fill();

  ctx.strokeStyle = "#d4af37";
  ctx.lineWidth = 2;
  ctx.stroke();

  ctx.strokeStyle = "#020f1a";
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.roundRect(x - 1, y - 1, w + 2, h + 2, radius + 1);
  ctx.stroke();

  // Left Icon: Speedometer / Pressure Gauge
  const dialRadius = radius - 2;
  const dialCenterX = x + radius;
  const dialCenterY = y + radius;

  ctx.beginPath();
  ctx.arc(dialCenterX, dialCenterY, dialRadius, 0, Math.PI * 2);
  const dialGrad = ctx.createRadialGradient(dialCenterX, dialCenterY, 2, dialCenterX, dialCenterY, dialRadius);
  dialGrad.addColorStop(0, "#f8fafc");
  dialGrad.addColorStop(0.7, "#cbd5e1");
  dialGrad.addColorStop(1, "#94a3b8");
  ctx.fillStyle = dialGrad;
  ctx.fill();
  ctx.strokeStyle = "#b45309";
  ctx.lineWidth = 1.5;
  ctx.stroke();

  ctx.beginPath();
  ctx.arc(dialCenterX, dialCenterY, dialRadius - 3, Math.PI * 0.8, Math.PI * 2.2);
  ctx.strokeStyle = isGauge ? "#22c55e" : "#0284c7";
  ctx.lineWidth = 2.5;
  ctx.stroke();

  ctx.beginPath();
  ctx.moveTo(dialCenterX, dialCenterY);
  ctx.lineTo(dialCenterX + (dialRadius - 4) * 0.7, dialCenterY - (dialRadius - 4) * 0.7);
  ctx.strokeStyle = "#dc2626";
  ctx.lineWidth = 1.5;
  ctx.stroke();

  // Center Value
  drawArcadeText(ctx, valStr, x + w / 2 - 4, y + h / 2 + 1, 13, "#ffffff", "#021220", 2.5);

  // Right Icon: Purple/Magenta Seashell
  drawScallopShell(ctx, x + w - 24, y - 1, 30, 34, "#f0abfc", "#9333ea");

  ctx.restore();
}

/** Draw Crystal Gem Tetris cell */
function drawCrystalGem(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  pieceName: PieceName,
  alpha = 1,
  hasPearl = false,
): void {
  ctx.save();
  ctx.globalAlpha = alpha;

  const colors = GEM_COLORS[pieceName] || GEM_COLORS.I;
  const pad = 1;
  const rx = x + pad;
  const ry = y + pad;
  const rw = w - pad * 2;
  const rh = h - pad * 2;
  const r = 3;

  const grad = ctx.createLinearGradient(rx, ry, rx, ry + rh);
  grad.addColorStop(0, colors.top);
  grad.addColorStop(0.35, colors.mid);
  grad.addColorStop(0.85, colors.bot);
  grad.addColorStop(1, colors.stroke);

  ctx.beginPath();
  ctx.roundRect(rx, ry, rw, rh, r);
  ctx.fillStyle = grad;
  ctx.fill();

  ctx.strokeStyle = colors.stroke;
  ctx.lineWidth = 1;
  ctx.stroke();

  // Glassy shine
  ctx.fillStyle = "rgba(255, 255, 255, 0.75)";
  ctx.beginPath();
  ctx.ellipse(rx + rw * 0.35, ry + rh * 0.25, rw * 0.28, rh * 0.16, 0, 0, Math.PI * 2);
  ctx.fill();

  // Bottom-right inner shadow
  ctx.fillStyle = "rgba(0, 0, 0, 0.25)";
  ctx.beginPath();
  ctx.roundRect(rx + rw * 0.5, ry + rh * 0.6, rw * 0.45, rh * 0.35, [0, 0, 2, 0]);
  ctx.fill();

  // Decorative Pearl
  if (hasPearl) {
    const px = rx + rw / 2;
    const py = ry + rh / 2;
    ctx.beginPath();
    ctx.arc(px, py, 4, 0, Math.PI * 2);
    const pearlGrad = ctx.createRadialGradient(px - 1, py - 1, 1, px, py, 4);
    pearlGrad.addColorStop(0, "#ffffff");
    pearlGrad.addColorStop(0.6, "#fef08a");
    pearlGrad.addColorStop(1, "#d97706");
    ctx.fillStyle = pearlGrad;
    ctx.fill();
    ctx.strokeStyle = "#451a03";
    ctx.lineWidth = 0.8;
    ctx.stroke();
  }

  ctx.restore();
}

/** Draw a brass porthole frame with deep ocean glass */
function drawPortholeBox(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  title: string,
  titleColor = "#4ade80",
): void {
  ctx.save();

  // Header
  drawArcadeText(ctx, title, x + w / 2, y - 12, 12, titleColor, "#021220", 3);

  const radius = 14;

  // Outer brass frame
  ctx.beginPath();
  ctx.roundRect(x, y, w, h, radius);
  const hatchGrad = ctx.createLinearGradient(x, y, x + w, y + h);
  hatchGrad.addColorStop(0, "#fde047");
  hatchGrad.addColorStop(0.2, "#ca8a04");
  hatchGrad.addColorStop(0.6, "#854d0e");
  hatchGrad.addColorStop(1, "#451a03");
  ctx.fillStyle = hatchGrad;
  ctx.fill();

  ctx.strokeStyle = "#2b1402";
  ctx.lineWidth = 2.5;
  ctx.stroke();

  // Rivets on corners
  const boltInset = 7;
  const bolts = [
    [x + boltInset, y + boltInset],
    [x + w - boltInset, y + boltInset],
    [x + w - boltInset, y + h - boltInset],
    [x + boltInset, y + h - boltInset],
  ];
  ctx.fillStyle = "#271202";
  ctx.strokeStyle = "rgba(254, 240, 138, 0.6)";
  ctx.lineWidth = 1;
  for (const [bx, by] of bolts) {
    ctx.beginPath();
    ctx.arc(bx, by, 2.5, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();
  }

  // Inner deep ocean glass
  const innerPad = 10;
  const glassW = w - innerPad * 2;
  const glassH = h - innerPad * 2;
  const glassX = x + innerPad;
  const glassY = y + innerPad;

  ctx.beginPath();
  ctx.roundRect(glassX, glassY, glassW, glassH, 8);
  const glassGrad = ctx.createRadialGradient(x + w / 2, y + h / 2, 4, x + w / 2, y + h / 2, glassW / 2);
  glassGrad.addColorStop(0, "#073256");
  glassGrad.addColorStop(0.7, "#042037");
  glassGrad.addColorStop(1, "#021220");
  ctx.fillStyle = glassGrad;
  ctx.fill();

  ctx.strokeStyle = "#172554";
  ctx.lineWidth = 1.5;
  ctx.stroke();

  // Diagonal glass reflection
  ctx.save();
  ctx.beginPath();
  ctx.roundRect(glassX, glassY, glassW, glassH, 8);
  ctx.clip();
  ctx.fillStyle = "rgba(255, 255, 255, 0.1)";
  ctx.beginPath();
  ctx.moveTo(glassX, glassY + glassH * 0.4);
  ctx.lineTo(glassX + glassW * 0.4, glassY);
  ctx.lineTo(glassX + glassW * 0.7, glassY);
  ctx.lineTo(glassX, glassY + glassH * 0.7);
  ctx.closePath();
  ctx.fill();
  ctx.restore();

  ctx.restore();
}

/** Render a piece centered inside a given bounding box */
function drawPieceInBox(
  ctx: CanvasRenderingContext2D,
  piece: PieceName,
  boxX: number,
  boxY: number,
  boxW: number,
  boxH: number,
  cellSize: number,
  alpha = 1,
  engine: AquaTetrisEngine,
): void {
  const cells = engine.getCells(piece, 0, 0, 0);
  const minR = Math.min(...cells.map(([r]) => r));
  const maxR = Math.max(...cells.map(([r]) => r));
  const minC = Math.min(...cells.map(([, c]) => c));
  const maxC = Math.max(...cells.map(([, c]) => c));
  const pRows = maxR - minR + 1;
  const pCols = maxC - minC + 1;

  const cellH = Math.round(cellSize * 0.85);
  const startX = boxX + (boxW - pCols * cellSize) / 2;
  const startY = boxY + (boxH - pRows * cellH) / 2;

  for (const [r, c] of cells) {
    const bx = startX + (c - minC) * cellSize;
    const by = startY + (r - minR) * cellH;
    drawCrystalGem(ctx, bx, by, cellSize, cellH, piece, alpha);
  }
}

/** Draw seaweeds behind the title logo */
function drawSeaweedFronds(ctx: CanvasRenderingContext2D, x: number, y: number, height: number, flip = false): void {
  ctx.save();
  ctx.translate(x, y);
  if (flip) ctx.scale(-1, 1);

  ctx.strokeStyle = "#15803d";
  ctx.fillStyle = "#22c55e";
  ctx.lineWidth = 2;

  ctx.beginPath();
  ctx.moveTo(0, height);
  ctx.bezierCurveTo(15, height * 0.6, -15, height * 0.3, 10, 0);
  ctx.bezierCurveTo(-5, height * 0.3, 20, height * 0.7, 0, height);
  ctx.fill();
  ctx.stroke();

  ctx.fillStyle = "#16a34a";
  ctx.beginPath();
  ctx.moveTo(-10, height);
  ctx.bezierCurveTo(5, height * 0.6, -20, height * 0.4, -5, 10);
  ctx.bezierCurveTo(-25, height * 0.4, -5, height * 0.8, -10, height);
  ctx.fill();
  ctx.stroke();

  ctx.restore();
}

/** Draw red branched sea coral at bottom corners */
function drawSeaCoralBranch(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number): void {
  ctx.save();
  ctx.translate(x, y);

  ctx.strokeStyle = "#991b1b";
  ctx.fillStyle = "#ef4444";
  ctx.lineWidth = 2.5;

  ctx.beginPath();
  ctx.moveTo(w * 0.5, h);
  ctx.quadraticCurveTo(w * 0.4, h * 0.6, w * 0.2, h * 0.4);
  ctx.quadraticCurveTo(w * 0.1, h * 0.2, w * 0.2, 0);
  ctx.quadraticCurveTo(w * 0.3, h * 0.2, w * 0.35, h * 0.4);
  ctx.quadraticCurveTo(w * 0.5, h * 0.5, w * 0.6, h * 0.3);
  ctx.quadraticCurveTo(w * 0.7, h * 0.1, w * 0.85, h * 0.15);
  ctx.quadraticCurveTo(w * 0.8, h * 0.35, w * 0.65, h * 0.5);
  ctx.quadraticCurveTo(w * 0.55, h * 0.7, w * 0.5, h);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();

  ctx.fillStyle = "rgba(254, 205, 211, 0.45)";
  ctx.beginPath();
  ctx.ellipse(w * 0.22, h * 0.12, 4, 8, -0.3, 0, Math.PI * 2);
  ctx.ellipse(w * 0.8, h * 0.22, 4, 8, 0.3, 0, Math.PI * 2);
  ctx.fill();

  ctx.restore();
}

/** Draw orange sea anemone cluster */
function drawSeaAnemoneCluster(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number): void {
  ctx.save();
  ctx.translate(x, y);

  ctx.fillStyle = "#475569";
  ctx.beginPath();
  ctx.ellipse(w * 0.5, h * 0.85, w * 0.45, h * 0.18, 0, 0, Math.PI * 2);
  ctx.fill();

  const count = 7;
  for (let i = 0; i < count; i++) {
    const angle = (i / (count - 1)) * Math.PI - Math.PI / 2;
    const tx = w * 0.5 + Math.sin(angle) * w * 0.35;
    const ty = h * 0.4 - Math.cos(angle) * h * 0.35;

    ctx.beginPath();
    ctx.moveTo(w * 0.5 + (i - 3) * 4, h * 0.8);
    ctx.quadraticCurveTo(tx * 1.1, ty * 1.2, tx, ty);
    ctx.strokeStyle = "#ea580c";
    ctx.lineWidth = 5;
    ctx.lineCap = "round";
    ctx.stroke();

    ctx.strokeStyle = "#fde047";
    ctx.lineWidth = 2.5;
    ctx.stroke();
  }

  ctx.restore();
}

/** Draw Rusty Submarine Well Frame */
function drawRustedSubmarineFrame(ctx: CanvasRenderingContext2D): void {
  ctx.save();

  const beamW = 20;

  // Left Vertical Beam
  const leftX = GRID_LEFT - beamW;
  const leftGrad = ctx.createLinearGradient(leftX, 0, GRID_LEFT, 0);
  leftGrad.addColorStop(0, "#382316");
  leftGrad.addColorStop(0.3, "#6b4a35");
  leftGrad.addColorStop(0.7, "#533725");
  leftGrad.addColorStop(1, "#24150b");
  ctx.fillStyle = leftGrad;
  ctx.fillRect(leftX, GRID_TOP - 12, beamW, GRID_H + 24);

  // Right Vertical Beam
  const rightX = GRID_RIGHT;
  const rightGrad = ctx.createLinearGradient(rightX, 0, rightX + beamW, 0);
  rightGrad.addColorStop(0, "#24150b");
  rightGrad.addColorStop(0.3, "#533725");
  rightGrad.addColorStop(0.7, "#6b4a35");
  rightGrad.addColorStop(1, "#382316");
  ctx.fillStyle = rightGrad;
  ctx.fillRect(rightX, GRID_TOP - 12, beamW, GRID_H + 24);

  // Top Crossbeam
  const topY = GRID_TOP - 14;
  const topGrad = ctx.createLinearGradient(0, topY, 0, GRID_TOP);
  topGrad.addColorStop(0, "#6b4a35");
  topGrad.addColorStop(0.5, "#805940");
  topGrad.addColorStop(1, "#2d1a0e");
  ctx.fillStyle = topGrad;
  ctx.fillRect(leftX, topY, GRID_W + beamW * 2, 14);

  // Bottom Heavy Ledge
  const botY = GRID_BOTTOM;
  const botGrad = ctx.createLinearGradient(0, botY, 0, botY + 18);
  botGrad.addColorStop(0, "#543725");
  botGrad.addColorStop(0.4, "#734e37");
  botGrad.addColorStop(1, "#1e1109");
  ctx.fillStyle = botGrad;
  ctx.fillRect(leftX - 8, botY, GRID_W + beamW * 2 + 16, 18);

  ctx.strokeStyle = "rgba(254, 215, 170, 0.35)";
  ctx.lineWidth = 1;
  ctx.strokeRect(leftX, topY, GRID_W + beamW * 2, 14);
  ctx.strokeRect(leftX - 8, botY, GRID_W + beamW * 2 + 16, 18);

  ctx.strokeStyle = "#1b0d05";
  ctx.lineWidth = 2.5;
  ctx.strokeRect(leftX, topY, GRID_W + beamW * 2, GRID_H + 32);

  // Rivets
  const rivetYSteps = [118, 160, 202, 244, 286, 328, 370, 412, 454];
  for (const ry of rivetYSteps) {
    ctx.beginPath();
    ctx.arc(leftX + beamW / 2, ry, 3.5, 0, Math.PI * 2);
    ctx.fillStyle = "#2b160b";
    ctx.fill();
    ctx.strokeStyle = "rgba(254, 215, 170, 0.5)";
    ctx.lineWidth = 1;
    ctx.stroke();

    ctx.beginPath();
    ctx.arc(rightX + beamW / 2, ry, 3.5, 0, Math.PI * 2);
    ctx.fillStyle = "#2b160b";
    ctx.fill();
    ctx.stroke();
  }

  // Corals
  drawSeaCoralBranch(ctx, GRID_LEFT - 46, GRID_BOTTOM - 62, 52, 70);
  drawSeaAnemoneCluster(ctx, GRID_RIGHT - 2, GRID_BOTTOM - 54, 52, 60);

  ctx.restore();
}

/** Draw the 3D "AQUA SPASH" Logo from scratch */
function drawAquaSpashLogo(ctx: CanvasRenderingContext2D, centerX: number, y: number): void {
  ctx.save();

  // Seaweed sprigs
  drawSeaweedFronds(ctx, centerX - 180, y - 10, 65, false);
  drawSeaweedFronds(ctx, centerX + 180, y - 10, 65, true);

  const aquaText = "AQUA";
  const spashText = "SPASH";

  ctx.textBaseline = "middle";
  ctx.font = "900 36px 'Cinzel Decorative', 'Outfit', sans-serif";
  const aquaW = ctx.measureText(aquaText).width;

  ctx.font = "900 32px 'Press Start 2P', 'Outfit', sans-serif";
  const spashW = ctx.measureText(spashText).width;

  const totalW = aquaW + 20 + spashW;
  const startX = centerX - totalW / 2;

  // Render "AQUA"
  ctx.font = "900 36px 'Cinzel Decorative', 'Outfit', sans-serif";
  const aquaX = startX + aquaW / 2;

  ctx.strokeStyle = "#021a2e";
  ctx.lineWidth = 8;
  ctx.lineJoin = "round";
  ctx.textAlign = "center";
  ctx.strokeText(aquaText, aquaX, y);

  ctx.strokeStyle = "#00e5ff";
  ctx.lineWidth = 4;
  ctx.strokeText(aquaText, aquaX, y);

  const aquaGrad = ctx.createLinearGradient(0, y - 20, 0, y + 16);
  aquaGrad.addColorStop(0, "#ffffff");
  aquaGrad.addColorStop(0.3, "#7df9ff");
  aquaGrad.addColorStop(0.7, "#00c8ff");
  aquaGrad.addColorStop(1, "#0284c7");
  ctx.fillStyle = aquaGrad;
  ctx.fillText(aquaText, aquaX, y);

  // Render "SPASH"
  const spashX = startX + aquaW + 20 + spashW / 2;
  ctx.font = "900 32px 'Press Start 2P', 'Outfit', sans-serif";

  ctx.strokeStyle = "#381804";
  ctx.lineWidth = 8;
  ctx.strokeText(spashText, spashX, y);

  ctx.strokeStyle = "#ca8a04";
  ctx.lineWidth = 3;
  ctx.strokeText(spashText, spashX, y);

  const spashGrad = ctx.createLinearGradient(0, y - 18, 0, y + 16);
  spashGrad.addColorStop(0, "#ffffff");
  spashGrad.addColorStop(0.3, "#fef08a");
  spashGrad.addColorStop(0.7, "#eab308");
  spashGrad.addColorStop(1, "#b45309");
  ctx.fillStyle = spashGrad;
  ctx.fillText(spashText, spashX, y);

  ctx.restore();
}

/** Draw glowing 4-point star sparkle */
function drawSparkleStar(ctx: CanvasRenderingContext2D, x: number, y: number, size: number, color = "#fef08a"): void {
  ctx.save();
  ctx.translate(x, y);

  ctx.fillStyle = color;
  ctx.beginPath();
  ctx.moveTo(0, -size);
  ctx.quadraticCurveTo(0, 0, size, 0);
  ctx.quadraticCurveTo(0, 0, 0, size);
  ctx.quadraticCurveTo(0, 0, -size, 0);
  ctx.quadraticCurveTo(0, 0, 0, -size);
  ctx.fill();

  ctx.fillStyle = "#ffffff";
  ctx.beginPath();
  ctx.arc(0, 0, size * 0.3, 0, Math.PI * 2);
  ctx.fill();

  ctx.restore();
}

/** Draw Line Clear Splash explosion */
function drawLineClearSplash(
  ctx: CanvasRenderingContext2D,
  clearedRows: number[],
  clearAnimTime: number,
  scoreEarned: number,
): void {
  ctx.save();

  const minR = Math.min(...clearedRows);
  const maxR = Math.max(...clearedRows);
  const midY = GRID_TOP + ((minR + maxR + 1) / 2) * CELL_H;
  const centerX = GRID_LEFT + GRID_W / 2;

  const progress = clearAnimTime / 0.35;
  const spreadW = GRID_W * (0.8 + progress * 0.4);
  const splashH = 70;

  // Water droplets
  const sprayCount = 18;
  for (let i = 0; i < sprayCount; i++) {
    const angle = (i / sprayCount) * Math.PI * 2;
    const dist = 30 + progress * 80 + (i % 3) * 15;
    const sx = centerX + Math.cos(angle) * dist;
    const sy = midY + Math.sin(angle) * (dist * 0.4);
    const dropR = Math.max(1, (1 - progress) * 4.5);

    ctx.fillStyle = i % 2 === 0 ? "rgba(186, 230, 253, 0.9)" : "rgba(56, 189, 248, 0.8)";
    ctx.beginPath();
    ctx.arc(sx, sy, dropR, 0, Math.PI * 2);
    ctx.fill();
  }

  // Glow ring
  ctx.strokeStyle = `rgba(56, 189, 248, ${Math.max(0, 1 - progress)})`;
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.ellipse(centerX, midY, spreadW / 2, splashH / 2, 0, 0, Math.PI * 2);
  ctx.stroke();

  // Sparkles
  drawSparkleStar(ctx, centerX - 100, midY - 25, 12, "#fde047");
  drawSparkleStar(ctx, centerX + 110, midY - 20, 14, "#fde047");
  drawSparkleStar(ctx, centerX + 75, midY + 30, 10, "#ffffff");
  drawSparkleStar(ctx, centerX - 85, midY + 25, 11, "#ffffff");

  // Banner
  const bannerY = Math.max(GRID_TOP + 35, midY - 10);
  ctx.font = "900 24px 'Press Start 2P', system-ui, sans-serif";
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";

  ctx.strokeStyle = "#021220";
  ctx.lineWidth = 7;
  ctx.strokeText("LINE CLEAR!!", centerX, bannerY);

  ctx.strokeStyle = "#00e5ff";
  ctx.lineWidth = 3.5;
  ctx.strokeText("LINE CLEAR!!", centerX, bannerY);

  const lcGrad = ctx.createLinearGradient(0, bannerY - 14, 0, bannerY + 14);
  lcGrad.addColorStop(0, "#ffffff");
  lcGrad.addColorStop(0.5, "#a5f3fc");
  lcGrad.addColorStop(1, "#0284c7");
  ctx.fillStyle = lcGrad;
  ctx.fillText("LINE CLEAR!!", centerX, bannerY);

  // Floating score
  const earnedStr = `+${scoreEarned || 1000}`;
  const floatY = bannerY + 34 - progress * 20;

  ctx.font = "bold 20px 'Press Start 2P', monospace";
  ctx.strokeStyle = "#451a03";
  ctx.lineWidth = 5;
  ctx.strokeText(earnedStr, centerX, floatY);

  ctx.strokeStyle = "#ca8a04";
  ctx.lineWidth = 2;
  ctx.strokeText(earnedStr, centerX, floatY);

  const goldGrad = ctx.createLinearGradient(0, floatY - 10, 0, floatY + 10);
  goldGrad.addColorStop(0, "#ffffff");
  goldGrad.addColorStop(0.4, "#fef08a");
  goldGrad.addColorStop(1, "#eab308");
  ctx.fillStyle = goldGrad;
  ctx.fillText(earnedStr, centerX, floatY);

  ctx.restore();
}

/** Main Render Function */
export function renderAquaTetris(
  ctx: CanvasRenderingContext2D,
  engine: AquaTetrisEngine,
  canvasWidth: number,
  canvasHeight: number,
): void {
  const bg = getBg();
  const time = performance.now() / 1000;

  ctx.save();
  ctx.clearRect(0, 0, canvasWidth, canvasHeight);

  // Scale virtual 1024x571 to actual canvas pixel dimensions
  const scaleX = canvasWidth / VIRTUAL_WIDTH;
  const scaleY = canvasHeight / VIRTUAL_HEIGHT;
  ctx.scale(scaleX, scaleY);

  // 1. Draw Background Image as-is (Submarine CRT cabinet, underwater ruins, octopus)
  if (bg) {
    ctx.drawImage(bg, 0, 0, VIRTUAL_WIDTH, VIRTUAL_HEIGHT);
  } else {
    const grad = ctx.createLinearGradient(0, 0, 0, VIRTUAL_HEIGHT);
    grad.addColorStop(0, "#083759");
    grad.addColorStop(0.5, "#0a5078");
    grad.addColorStop(1, "#031c2d");
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, VIRTUAL_WIDTH, VIRTUAL_HEIGHT);
  }

  // 2. Subtle CRT scanlines across active screen
  ctx.fillStyle = "rgba(0, 0, 0, 0.05)";
  for (let y = 35; y < 535; y += 3) {
    ctx.fillRect(85, y, 854, 1);
  }

  // 3. Top Title Logo: "AQUA SPASH" drawn completely from scratch
  drawAquaSpashLogo(ctx, 512, 64);

  // 4. Central Well Outer Rusted Submarine Hatch Frame (drawn from scratch)
  drawRustedSubmarineFrame(ctx);

  // 5. Central Well Inner Playfield
  ctx.fillStyle = "rgba(3, 18, 30, 0.74)";
  ctx.fillRect(GRID_LEFT, GRID_TOP, GRID_W, GRID_H);

  ctx.strokeStyle = "rgba(56, 189, 248, 0.25)";
  ctx.lineWidth = 1;
  ctx.strokeRect(GRID_LEFT, GRID_TOP, GRID_W, GRID_H);

  // Grid lines
  ctx.strokeStyle = "rgba(56, 189, 248, 0.12)";
  ctx.lineWidth = 0.5;
  for (let r = 0; r <= ROWS; r++) {
    const gy = GRID_TOP + r * CELL_H;
    ctx.beginPath();
    ctx.moveTo(GRID_LEFT, gy);
    ctx.lineTo(GRID_RIGHT, gy);
    ctx.stroke();
  }
  for (let c = 0; c <= COLS; c++) {
    const gx = GRID_LEFT + c * CELL_W;
    ctx.beginPath();
    ctx.moveTo(gx, GRID_TOP);
    ctx.lineTo(gx, GRID_BOTTOM);
    ctx.stroke();
  }

  // 6. Draw Locked Cells
  for (let r = 0; r < ROWS; r++) {
    for (let c = 0; c < COLS; c++) {
      const cell = engine.grid[r][c];
      if (cell !== 0) {
        const cx = GRID_LEFT + c * CELL_W;
        const cy = GRID_TOP + r * CELL_H;
        const isClearing = engine.clearedRows.includes(r);

        if (isClearing) {
          const flash = Math.sin(engine.clearAnimTime * 35) > 0;
          if (flash) {
            ctx.fillStyle = "rgba(255, 255, 255, 0.95)";
            ctx.fillRect(cx, cy, CELL_W, CELL_H);
          } else {
            drawCrystalGem(ctx, cx, cy, CELL_W, CELL_H, cell, 0.4);
          }
        } else {
          const hasPearl = (r === ROWS - 1 && (c === 5 || c === 6 || c === 9));
          drawCrystalGem(ctx, cx, cy, CELL_W, CELL_H, cell, 1, hasPearl);
        }
      }
    }
  }

  // 7. Ghost Piece
  if (engine.current && engine.state === "playing") {
    const ghostRow = engine.getGhostRow();
    if (ghostRow !== engine.current.row) {
      const cells = engine.getCells(engine.current.name, engine.current.rotation, ghostRow, engine.current.col);
      ctx.save();
      ctx.strokeStyle = "rgba(0, 229, 255, 0.45)";
      ctx.lineWidth = 1.5;
      ctx.shadowColor = "#00e5ff";
      ctx.shadowBlur = 6;
      for (const [r, c] of cells) {
        if (r >= 0 && r < ROWS && c >= 0 && c < COLS) {
          const gx = GRID_LEFT + c * CELL_W + 1.5;
          const gy = GRID_TOP + r * CELL_H + 1;
          ctx.strokeRect(gx, gy, CELL_W - 3, CELL_H - 2);
        }
      }
      ctx.restore();
    }
  }

  // 8. Active Falling Piece with glowing outline & sparkles
  if (engine.current) {
    const cells = engine.getCells(engine.current.name, engine.current.rotation, engine.current.row, engine.current.col);
    ctx.save();
    ctx.shadowColor = "#00e5ff";
    ctx.shadowBlur = 10;
    for (const [r, c] of cells) {
      if (r >= 0 && r < ROWS && c >= 0 && c < COLS) {
        const cx = GRID_LEFT + c * CELL_W;
        const cy = GRID_TOP + r * CELL_H;
        drawCrystalGem(ctx, cx, cy, CELL_W, CELL_H, engine.current.name, 1);
        ctx.strokeStyle = "rgba(186, 230, 253, 0.85)";
        ctx.lineWidth = 1.5;
        ctx.strokeRect(cx + 1, cy + 1, CELL_W - 2, CELL_H - 2);
      }
    }
    ctx.restore();

    const firstCell = cells[0];
    if (firstCell && firstCell[0] >= 0 && firstCell[0] < ROWS) {
      const spkX = GRID_LEFT + firstCell[1] * CELL_W + (Math.sin(time * 6) + 1) * 10;
      const spkY = GRID_TOP + firstCell[0] * CELL_H;
      drawSparkleStar(ctx, spkX, spkY, 7, "#ffffff");
    }
  }

  // 9. Line Clear Burst Animation
  if (engine.clearedRows.length > 0) {
    drawLineClearSplash(ctx, engine.clearedRows, engine.clearAnimTime, engine.lastClearScore);
  }

  // 10. Left Column HUD
  // --- 1P SCORE ---
  drawArcadeText(ctx, "1P SCORE", 225, 118, 10, "#cbfbfb", "#021220", 3);
  const scoreStr = String(engine.score).padStart(7, "0");
  drawWoodShellBanner(ctx, 130, 126, 190, 38, scoreStr);

  // --- HIGH SCORE ---
  drawArcadeText(ctx, "HIGH SCORE", 225, 178, 10, "#ff6b6b", "#021220", 3);
  const highScoreStr = String(engine.highScore).padStart(7, "0");
  drawWoodShellBanner(ctx, 130, 186, 190, 38, highScoreStr);

  // --- HOLD PORTHOLE ---
  const holdBoxX = 175;
  const holdBoxY = 246;
  const holdBoxW = 100;
  const holdBoxH = 80;
  drawPortholeBox(ctx, holdBoxX, holdBoxY, holdBoxW, holdBoxH, "HOLD", "#38bdf8");

  if (engine.heldPiece) {
    const alpha = engine.canHold ? 1 : 0.45;
    drawPieceInBox(ctx, engine.heldPiece, holdBoxX, holdBoxY, holdBoxW, holdBoxH, 18, alpha, engine);
  }

  // --- LEVEL ---
  drawArcadeText(ctx, "LEVEL", 225, 348, 10, "#fde047", "#021220", 3);
  const lvlStr = String(engine.level).padStart(2, "0");
  drawPillIndicator(ctx, 145, 356, 160, 36, lvlStr, true);

  // --- LINES ---
  drawArcadeText(ctx, "LINES", 225, 412, 10, "#e879f9", "#021220", 3);
  const linesStr = String(engine.linesCleared).padStart(3, "0");
  drawPillIndicator(ctx, 145, 420, 160, 36, linesStr, false);

  // --- CREDIT XX --- (Every level cleared awards 1 credit)
  const creditStr = `CREDIT ${String(engine.credits).padStart(2, "0")}`;
  drawArcadeText(ctx, creditStr, 225, 508, 11, "#38bdf8", "#021220", 2.5);

  // 11. Right Column HUD: NEXT 3 SHAPES
  const nextMainX = 720;
  const nextMainY = 160;
  const nextMainW = 110;
  const nextMainH = 85;

  // Header and Primary Next Porthole
  drawPortholeBox(ctx, nextMainX, nextMainY, nextMainW, nextMainH, "NEXT", "#4ade80");

  const queue = engine.nextQueue;
  if (queue[0]) {
    drawPieceInBox(ctx, queue[0], nextMainX, nextMainY, nextMainW, nextMainH, 19, 1, engine);
  }

  // Secondary Next Shapes (#2 and #3)
  const subBoxY = nextMainY + nextMainH + 12;
  const subW = 50;
  const subH = 50;

  // Next #2
  drawPortholeBox(ctx, nextMainX + 2, subBoxY, subW, subH, "#2", "#22c55e");
  if (queue[1]) {
    drawPieceInBox(ctx, queue[1], nextMainX + 2, subBoxY, subW, subH, 12, 1, engine);
  }

  // Next #3
  drawPortholeBox(ctx, nextMainX + subW + 8, subBoxY, subW, subH, "#3", "#16a34a");
  if (queue[2]) {
    drawPieceInBox(ctx, queue[2], nextMainX + subW + 8, subBoxY, subW, subH, 12, 1, engine);
  }

  // (Notice: The "INSERT COIN" label has been completely removed per request)

  // 12. CRT Glass Sheen & Bezel Highlights
  const sheenGrad = ctx.createLinearGradient(600, 30, 920, 250);
  sheenGrad.addColorStop(0, "rgba(255, 255, 255, 0.08)");
  sheenGrad.addColorStop(0.3, "rgba(255, 255, 255, 0.03)");
  sheenGrad.addColorStop(0.7, "transparent");
  ctx.fillStyle = sheenGrad;
  ctx.beginPath();
  ctx.ellipse(820, 100, 150, 60, Math.PI / 6, 0, Math.PI * 2);
  ctx.fill();

  ctx.restore();
}
