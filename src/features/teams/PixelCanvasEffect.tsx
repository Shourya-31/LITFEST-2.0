import React, { useEffect, useRef } from 'react';

class Pixel {
  width: number;
  height: number;
  ctx: CanvasRenderingContext2D;
  x: number;
  y: number;
  color: string;
  speed: number;
  size: number;
  sizeStep: number;
  minSize: number;
  maxSizeInteger: number;
  maxSize: number;
  delay: number;
  counter: number;
  counterStep: number;
  isIdle: boolean;
  isReverse: boolean;
  isShimmer: boolean;

  constructor(
    canvas: HTMLCanvasElement,
    context: CanvasRenderingContext2D,
    x: number,
    y: number,
    color: string,
    speed: number,
    delay: number
  ) {
    this.width = canvas.width;
    this.height = canvas.height;
    this.ctx = context;
    this.x = x;
    this.y = y;
    this.color = color;
    this.speed = this.getRandomValue(0.12, 0.85) * speed;
    this.size = 0;
    this.sizeStep = Math.random() * 0.45 + 0.15;
    this.minSize = 0.5;
    this.maxSizeInteger = 3.2;
    this.maxSize = this.getRandomValue(this.minSize, this.maxSizeInteger);
    this.delay = delay;
    this.counter = 0;
    this.counterStep = Math.random() * 4 + (this.width + this.height) * 0.012;
    this.isIdle = false;
    this.isReverse = false;
    this.isShimmer = false;
  }

  getRandomValue(min: number, max: number): number {
    return Math.random() * (max - min) + min;
  }

  draw() {
    if (this.size <= 0) return;
    const centerOffset = this.maxSizeInteger * 0.5 - this.size * 0.5;
    this.ctx.fillStyle = this.color;
    this.ctx.fillRect(this.x + centerOffset, this.y + centerOffset, this.size, this.size);
  }

  appear() {
    this.isIdle = false;

    if (this.counter <= this.delay) {
      this.counter += this.counterStep;
      return;
    }

    if (this.size >= this.maxSize) {
      this.isShimmer = true;
    }

    if (this.isShimmer) {
      this.shimmer();
    } else {
      this.size += this.sizeStep;
    }

    this.draw();
  }

  disappear() {
    this.isShimmer = false;
    this.counter = 0;

    if (this.size <= 0) {
      this.isIdle = true;
      return;
    } else {
      this.size -= 0.15;
    }

    this.draw();
  }

  shimmer() {
    if (this.size >= this.maxSize) {
      this.isReverse = true;
    } else if (this.size <= this.minSize) {
      this.isReverse = false;
    }

    if (this.isReverse) {
      this.size -= this.speed;
    } else {
      this.size += this.speed;
    }
  }

  burst(originX: number, originY: number, power: number = 1) {
    this.isIdle = false;
    this.counter = 0;
    const dx = this.x - originX;
    const dy = this.y - originY;
    const dist = Math.sqrt(dx * dx + dy * dy);
    this.delay = dist * 0.35;
    this.size = Math.min(this.maxSizeInteger * 1.3, this.size + 1.2 * power);
    this.draw();
  }
}

export interface PixelCanvasEffectProps {
  colors?: string[];
  gap?: number;
  speed?: number;
  className?: string;
  active?: boolean;
  burstTrigger?: number;
  burstOrigin?: { x: number; y: number } | null;
}

const LITFEST_COLORS = [
  '#e0f2fe', // soft ice blue
  '#7dd3fc', // sky cyan
  '#0ea5e9', // ocean blue
  '#22d3ee', // electric aqua
  '#38bdf8', // pulse blue
  '#c084fc', // pearl violet
];

export const PixelCanvasEffect: React.FC<PixelCanvasEffectProps> = ({
  colors = LITFEST_COLORS,
  gap = 8,
  speed = 28,
  className = '',
  active = false,
  burstTrigger = 0,
  burstOrigin = null,
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationRef = useRef<number | null>(null);
  const pixelsRef = useRef<Pixel[]>([]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const parent = canvas.parentElement;
    if (!parent) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const timeInterval = 1000 / 60;
    let timePrevious = performance.now();
    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    const calculatedSpeed = Math.max(0, Math.min(100, speed)) * 0.001;
    const clampedGap = Math.max(4, Math.min(40, gap));

    const getDistanceToCenter = (x: number, y: number) => {
      const dx = x - canvas.width / 2;
      const dy = y - canvas.height / 2;
      return Math.sqrt(dx * dx + dy * dy);
    };

    const createPixels = () => {
      pixelsRef.current = [];
      for (let x = 0; x < canvas.width; x += clampedGap) {
        for (let y = 0; y < canvas.height; y += clampedGap) {
          const color = colors[Math.floor(Math.random() * colors.length)];
          const delay = reducedMotion ? 0 : getDistanceToCenter(x, y);
          pixelsRef.current.push(new Pixel(canvas, ctx, x, y, color, calculatedSpeed, delay));
        }
      }
    };

    const init = () => {
      const rect = parent.getBoundingClientRect();
      const width = Math.floor(rect.width);
      const height = Math.floor(rect.height);

      if (width === 0 || height === 0) return;

      canvas.width = width;
      canvas.height = height;
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;

      createPixels();
    };

    init();

    const resizeObserver = new ResizeObserver(() => init());
    resizeObserver.observe(parent);

    const animate = (fnName: 'appear' | 'disappear') => {
      animationRef.current = requestAnimationFrame(() => animate(fnName));

      const timeNow = performance.now();
      const timePassed = timeNow - timePrevious;

      if (timePassed < timeInterval) return;

      timePrevious = timeNow - (timePassed % timeInterval);
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      const pixels = pixelsRef.current;
      for (let i = 0; i < pixels.length; i++) {
        pixels[i][fnName]();
      }

      if (pixels.every((pixel) => pixel.isIdle)) {
        if (animationRef.current) {
          cancelAnimationFrame(animationRef.current);
          animationRef.current = null;
        }
      }
    };

    const handleAnimation = (fnName: 'appear' | 'disappear') => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
        animationRef.current = null;
      }
      animationRef.current = requestAnimationFrame(() => animate(fnName));
    };

    const onMouseEnter = () => handleAnimation('appear');
    const onMouseLeave = () => {
      if (!active) {
        handleAnimation('disappear');
      }
    };

    parent.addEventListener('mouseenter', onMouseEnter);
    parent.addEventListener('mouseleave', onMouseLeave);

    if (active) {
      handleAnimation('appear');
    }

    if (burstTrigger > 0) {
      const originX = burstOrigin?.x ?? canvas.width / 2;
      const originY = burstOrigin?.y ?? canvas.height / 2;
      pixelsRef.current.forEach((pixel) => {
        pixel.burst(originX, originY, 1.2);
      });
      handleAnimation('appear');
    }

    return () => {
      resizeObserver.disconnect();
      parent.removeEventListener('mouseenter', onMouseEnter);
      parent.removeEventListener('mouseleave', onMouseLeave);

      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [colors, gap, speed, active, burstTrigger, burstOrigin]);

  return (
    <canvas
      ref={canvasRef}
      aria-hidden="true"
      className={`pixel-canvas-element ${className}`}
      style={{
        pointerEvents: 'none',
        position: 'absolute',
        inset: 0,
        zIndex: 0,
        width: '100%',
        height: '100%',
        opacity: 0.65,
        transition: 'opacity 0.3s ease',
      }}
    />
  );
};
