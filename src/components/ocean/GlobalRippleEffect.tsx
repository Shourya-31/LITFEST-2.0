import { useEffect } from "react";

/**
 * Global ripple animation on click for interactive elements.
 * Generates an expanding translucent aquatic ripple wave centered at click coordinates.
 */
export function GlobalRippleEffect() {
  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const handlePointerDown = (e: PointerEvent) => {
      // Check if target or any parent is an interactive element
      const target = e.target as HTMLElement | null;
      if (!target) return;

      const interactive = target.closest(
        "button, a, [role='button'], input, select, .glass, .jellyfish, [tabindex='0']",
      );

      if (!interactive) return;

      const ripple = document.createElement("span");
      const size = Math.max(
        40,
        Math.min(100, Math.max(window.innerWidth, window.innerHeight) * 0.08),
      );

      ripple.className = "ocean-click-ripple";
      ripple.style.cssText = `
        left: ${e.clientX - size / 2}px;
        top: ${e.clientY - size / 2}px;
        width: ${size}px;
        height: ${size}px;
      `;

      document.body.appendChild(ripple);

      setTimeout(() => {
        ripple.remove();
      }, 600);
    };

    window.addEventListener("pointerdown", handlePointerDown, {
      passive: true,
    });
    return () => window.removeEventListener("pointerdown", handlePointerDown);
  }, []);

  return null;
}
