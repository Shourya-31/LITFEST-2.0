import { useEffect } from "react";

/** Spawns small rising bubbles that follow the cursor. */
export function CursorBubbles() {
  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    let last = 0;
    const onMove = (e: PointerEvent) => {
      const now = performance.now();
      if (now - last < 45) return;
      last = now;
      const b = document.createElement("span");
      const size = 6 + Math.random() * 10;
      b.className = "cursor-bubble";
      b.style.cssText = `left:${e.clientX - size / 2}px;top:${e.clientY - size / 2}px;width:${size}px;height:${size}px;--dx:${(Math.random() - 0.5) * 30}px`;
      document.body.appendChild(b);
      setTimeout(() => b.remove(), 1200);
    };
    window.addEventListener("pointermove", onMove);
    return () => window.removeEventListener("pointermove", onMove);
  }, []);
  return null;
}
