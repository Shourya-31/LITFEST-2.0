import {
  useState,
  useEffect,
  useRef,
  useCallback,
  type ReactNode,
  type WheelEvent as ReactWheelEvent,
  type TouchEvent as ReactTouchEvent,
} from "react";
import { Pearl } from "./OceanDecor";

export interface ThreeDSlide {
  id: string;
  label: string;
  depthName?: string;
  content: ReactNode;
}

interface ThreeDScrollContainerProps {
  slides: ThreeDSlide[];
  initialIndex?: number;
  onSlideChange?: (index: number) => void;
  className?: string;
}

export function ThreeDScrollContainer({
  slides,
  initialIndex = 0,
  onSlideChange,
  className = "",
}: ThreeDScrollContainerProps) {
  const [activeIndex, setActiveIndex] = useState(initialIndex);
  const containerRef = useRef<HTMLDivElement>(null);
  const lastTransitionTime = useRef(0);
  const wheelDeltaAccumulator = useRef(0);
  const touchStartY = useRef<number | null>(null);

  const goToSlide = useCallback(
    (index: number) => {
      const target = Math.max(0, Math.min(slides.length - 1, index));
      if (target !== activeIndex) {
        setActiveIndex(target);
        onSlideChange?.(target);
      }
    },
    [slides.length, activeIndex, onSlideChange],
  );

  const zoomIn = useCallback(() => {
    if (activeIndex < slides.length - 1) {
      goToSlide(activeIndex + 1);
    }
  }, [activeIndex, slides.length, goToSlide]);

  const zoomOut = useCallback(() => {
    if (activeIndex > 0) {
      goToSlide(activeIndex - 1);
    }
  }, [activeIndex, goToSlide]);

  // Check if inner content is scrolled before navigating Z-axis
  const shouldAllowZNav = useCallback(
    (deltaY: number, target: HTMLElement | null): boolean => {
      if (!target) return true;
      const scrollable = target.closest(
        ".scrollable-content",
      ) as HTMLElement | null;
      if (!scrollable) return true;

      const tolerance = 4;
      const isAtTop = scrollable.scrollTop <= tolerance;
      const isAtBottom =
        scrollable.scrollTop + scrollable.clientHeight >=
        scrollable.scrollHeight - tolerance;

      if (deltaY > 0 && !isAtBottom) {
        // User is scrolling down inside a scrollable area that hasn't reached the bottom
        return false;
      }
      if (deltaY < 0 && !isAtTop) {
        // User is scrolling up inside a scrollable area that hasn't reached the top
        return false;
      }
      return true;
    },
    [],
  );

  const handleWheel = (e: ReactWheelEvent<HTMLDivElement>) => {
    const now = performance.now();
    if (now - lastTransitionTime.current < 650) return;

    if (!shouldAllowZNav(e.deltaY, e.target as HTMLElement | null)) {
      return;
    }

    wheelDeltaAccumulator.current += e.deltaY;

    if (Math.abs(wheelDeltaAccumulator.current) >= 45) {
      if (wheelDeltaAccumulator.current > 0) {
        zoomIn();
      } else {
        zoomOut();
      }
      wheelDeltaAccumulator.current = 0;
      lastTransitionTime.current = now;
    }
  };

  const handleTouchStart = (e: ReactTouchEvent<HTMLDivElement>) => {
    touchStartY.current = e.touches[0].clientY;
  };

  const handleTouchEnd = (e: ReactTouchEvent<HTMLDivElement>) => {
    if (touchStartY.current === null) return;
    const deltaY = touchStartY.current - e.changedTouches[0].clientY;
    touchStartY.current = null;

    const now = performance.now();
    if (now - lastTransitionTime.current < 600) return;

    if (!shouldAllowZNav(deltaY, e.target as HTMLElement | null)) {
      return;
    }

    if (Math.abs(deltaY) >= 40) {
      if (deltaY > 0) {
        zoomIn(); // swipe up zooms in
      } else {
        zoomOut(); // swipe down zooms out
      }
      lastTransitionTime.current = now;
    }
  };

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Don't intercept if inside input / textarea
      const tag = (e.target as HTMLElement)?.tagName?.toLowerCase();
      if (tag === "input" || tag === "textarea") return;

      if (e.key === "ArrowDown" || e.key === "PageDown") {
        e.preventDefault();
        zoomIn();
      } else if (e.key === "ArrowUp" || e.key === "PageUp") {
        e.preventDefault();
        zoomOut();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [zoomIn, zoomOut]);

  return (
    <div
      ref={containerRef}
      onWheel={handleWheel}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
      className={`relative h-[calc(100vh-57px)] w-full overflow-hidden select-none [perspective:1200px] [perspective-origin:50%_50%] ${className}`}
      style={{ touchAction: "pan-y" }}
    >
      {/* 3D World Space */}
      <div className="relative h-full w-full [transform-style:preserve-3d]">
        {slides.map((slide, index) => {
          const delta = index - activeIndex;
          let transform = "translate3d(0, 0, 0px) scale(1)";
          let opacity = 1;
          let filter = "blur(0px)";
          let pointerEvents: "auto" | "none" = "auto";
          let visibility: "visible" | "hidden" = "visible";

          if (delta === 0) {
            transform = "translate3d(0, 0, 0px) scale(1)";
            opacity = 1;
            filter = "blur(0px)";
            pointerEvents = "auto";
            visibility = "visible";
          } else if (delta > 0) {
            // Ahead / deeper in the ocean
            const zDistance = -Math.min(delta * 900, 2400);
            const scale = Math.max(0.4, 1 - delta * 0.35);
            transform = `translate3d(0, 0, ${zDistance}px) scale(${scale})`;
            opacity = 0;
            filter = "blur(10px)";
            pointerEvents = "none";
            visibility = "hidden";
          } else {
            // Passed / zooming into camera
            const zDistance = Math.min(-delta * 700, 1800);
            const scale = 1 + -delta * 0.55;
            transform = `translate3d(0, 0, ${zDistance}px) scale(${scale})`;
            opacity = 0;
            filter = "blur(10px)";
            pointerEvents = "none";
            visibility = "hidden";
          }

          return (
            <div
              key={slide.id}
              className="absolute inset-0 h-full w-full transition-all duration-700 ease-[cubic-bezier(0.16,1,0.3,1)]"
              style={{
                transform,
                opacity,
                filter,
                pointerEvents,
                visibility,
                zIndex: delta === 0 ? 20 : 10,
              }}
            >
              <div className="h-full w-full">{slide.content}</div>
            </div>
          );
        })}
      </div>

      {/* Depth Indicators (Side Floating Pearls) */}
      {slides.length > 1 && (
        <nav
          aria-label="3D Depth Navigation"
          className="glass absolute right-3 top-1/2 z-40 hidden -translate-y-1/2 flex-col items-center gap-3 rounded-full px-2.5 py-4 sm:flex"
        >
          {slides.map((slide, idx) => {
            const isActive = idx === activeIndex;
            return (
              <button
                key={slide.id}
                type="button"
                onClick={() => goToSlide(idx)}
                aria-label={`Zoom to ${slide.label}`}
                title={slide.label}
                className="group relative flex items-center justify-center p-1.5 focus:outline-none"
              >
                <span
                  className={`block rounded-full transition-all duration-500 ${
                    isActive
                      ? "h-4 w-4 bg-aqua shadow-glow ring-2 ring-pearl"
                      : "h-2.5 w-2.5 bg-muted-foreground/50 hover:bg-pearl/80"
                  }`}
                />
                {/* Floating tooltip */}
                <span className="glass pointer-events-none absolute right-full mr-3 whitespace-nowrap rounded-md px-2.5 py-1 text-xs font-medium text-pearl opacity-0 shadow-lg transition-opacity duration-200 group-hover:opacity-100">
                  {slide.label}
                </span>
              </button>
            );
          })}
        </nav>
      )}

      {/* Bottom Dive / Depth Indicator */}
      <div className="pointer-events-none absolute bottom-4 left-1/2 z-40 flex -translate-x-1/2 items-center gap-2">
        {activeIndex < slides.length - 1 ? (
          <button
            type="button"
            onClick={zoomIn}
            className="glass pointer-events-auto flex items-center gap-2 rounded-full px-4 py-1.5 text-xs font-medium text-aqua shadow-glow transition-all hover:border-aqua/80 hover:text-pearl"
          >
            <Pearl size={8} />
            <span>Scroll or tap to dive deeper</span>
            <span aria-hidden className="animate-bounce">
              ⌄
            </span>
          </button>
        ) : (
          <button
            type="button"
            onClick={() => goToSlide(0)}
            className="glass pointer-events-auto flex items-center gap-2 rounded-full px-4 py-1.5 text-xs font-medium text-muted-foreground transition-all hover:border-aqua/80 hover:text-pearl"
          >
            <Pearl size={8} />
            <span>Zoom to surface</span>
            <span aria-hidden className="animate-bounce">
              ⌃
            </span>
          </button>
        )}
      </div>
    </div>
  );
}
