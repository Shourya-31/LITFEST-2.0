/** Shared drawing tools for the original vector artwork. */
export type Brush = string | CanvasGradient;
export type Context = CanvasRenderingContext2D;
export const TAU = Math.PI * 2;
export const wrap = (value: number, span: number): number =>
  ((value % span) + span) % span;

export function shape(
  c: Context,
  fill: Brush,
  draw: () => void,
  outline?: string,
  width = 1.5,
): void {
  c.beginPath();
  draw();
  c.fillStyle = fill;
  c.fill();
  if (outline) {
    c.strokeStyle = outline;
    c.lineWidth = width;
    c.stroke();
  }
}
export function line(
  c: Context,
  color: string,
  width: number,
  draw: () => void,
): void {
  c.beginPath();
  draw();
  c.strokeStyle = color;
  c.lineWidth = width;
  c.lineCap = "round";
  c.lineJoin = "round";
  c.stroke();
}
export function oval(
  c: Context,
  x: number,
  y: number,
  rx: number,
  ry: number,
  fill: Brush,
  outline?: string,
): void {
  shape(c, fill, () => c.ellipse(x, y, rx, ry, 0, 0, TAU), outline);
}
export function gradient(
  c: Context,
  top: number,
  bottom: number,
  colors: string[],
): CanvasGradient {
  const result = c.createLinearGradient(0, top, 0, bottom);
  colors.forEach((color, i) =>
    result.addColorStop(i / (colors.length - 1), color),
  );
  return result;
}
export function glow(
  c: Context,
  x: number,
  y: number,
  radius: number,
  color: string,
): void {
  const light = c.createRadialGradient(x, y, 0, x, y, radius);
  light.addColorStop(0, color);
  light.addColorStop(1, "#ffffff00");
  oval(c, x, y, radius, radius, light);
}
