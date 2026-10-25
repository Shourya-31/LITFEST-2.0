import { useEffect, useState, useRef } from "react";
import { useLocation } from "@tanstack/react-router";

interface Bubble {
  id: number;
  size: number;
  left: number;
  delay: number;
  duration: number;
  dx: number;
}

export function BubblePageTransition() {
  const location = useLocation();
  const prevPath = useRef(location.pathname);
  const [transitioning, setTransitioning] = useState(false);
  const [bubbles, setBubbles] = useState<Bubble[]>([]);

  useEffect(() => {
    if (prevPath.current !== location.pathname) {
      prevPath.current = location.pathname;

      if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
        return;
      }

      // Generate 28 buoyant ocean bubbles
      const newBubbles: Bubble[] = Array.from({ length: 28 }, (_, i) => ({
        id: i,
        size: 14 + Math.random() * 38,
        left: Math.random() * 96,
        delay: Math.random() * 0.18,
        duration: 0.55 + Math.random() * 0.3,
        dx: (Math.random() - 0.5) * 60,
      }));

      setBubbles(newBubbles);
      setTransitioning(true);

      const timer = setTimeout(() => {
        setTransitioning(false);
      }, 750);

      return () => clearTimeout(timer);
    }
  }, [location.pathname]);

  if (!transitioning) return null;

  return (
    <div
      aria-hidden="true"
      className="pointer-events-none fixed inset-0 z-[100] overflow-hidden"
    >
      {/* Soft Blue Pulse Oceanic Wash */}
      <div className="absolute inset-0 bg-gradient-to-t from-[oklch(0.25_0.12_230/45%)] via-[oklch(0.35_0.15_210/25%)] to-transparent animate-bubble-wash" />

      {/* Rising Bubble Swarm */}
      {bubbles.map((b) => (
        <span
          key={b.id}
          className="portal-bubble absolute rounded-full border border-pearl/60 bg-gradient-to-tr from-aqua/30 via-pearl/20 to-transparent shadow-[0_0_15px_rgba(56,189,248,0.5)] backdrop-blur-[1px]"
          style={{
            width: b.size,
            height: b.size,
            left: `${b.left}%`,
            bottom: "-60px",
            animationDelay: `${b.delay}s`,
            animationDuration: `${b.duration}s`,
            ["--bubble-dx" as string]: `${b.dx}px`,
          }}
        >
          {/* Internal pearl reflection highlight */}
          <span className="absolute left-[20%] top-[20%] h-[25%] w-[25%] rounded-full bg-pearl/70" />
        </span>
      ))}
    </div>
  );
}
