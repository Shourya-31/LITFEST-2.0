import React, { useEffect, useRef } from 'react';

export interface ParticleTextProps {
  text: string;
  particleSize?: number;
  density?: number;
  color?: string;
  highlightColor?: string;
  highlightMode?: 'gradient' | 'random' | 'solid';
  shape?: 'circle' | 'square';
  intro?: 'gather' | 'explode' | 'fade';
  scatter?: number;
  gatherDuration?: number;
  stagger?: number;
  clickBurst?: boolean;
  burstStrength?: number;
  pointerRepel?: number;
  repelRadius?: number;
  idleDrift?: number;
  trigger?: 'hover' | 'click' | 'auto';
  fontSize?: string | number;
  fontWeight?: string | number;
  fontFamily?: string;
  glow?: boolean;
  className?: string;
  style?: React.CSSProperties;
}

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  originX: number;
  originY: number;
  startX: number;
  startY: number;
  color: string;
  size: number;
  phase: number;
  gatherDelay: number;
}

function parseHexColor(hex: string): [number, number, number] {
  if (!hex) return [56, 189, 248];
  let clean = hex.replace('#', '').trim();
  if (clean.length === 3) {
    clean = clean.split('').map((c) => c + c).join('');
  }
  if (clean.length === 8) {
    clean = clean.slice(0, 6);
  }
  const num = parseInt(clean, 16);
  if (Number.isNaN(num)) return [56, 189, 248];
  return [(num >> 16) & 255, (num >> 8) & 255, num & 255];
}

function interpolateRgb(c1: string, c2: string, t: number): string {
  const [r1, g1, b1] = parseHexColor(c1);
  const [r2, g2, b2] = parseHexColor(c2);
  const r = Math.round(r1 + (r2 - r1) * t);
  const g = Math.round(g1 + (g2 - g1) * t);
  const b = Math.round(b1 + (b2 - b1) * t);
  return `rgb(${r}, ${g}, ${b})`;
}

function resolveFontSizePx(size: string | number | undefined, containerWidth: number): number {
  if (typeof size === 'number') return size;
  if (!size) return 30;

  const s = size.trim();
  if (s.endsWith('px')) {
    return parseFloat(s) || 30;
  }
  if (s.endsWith('rem')) {
    return (parseFloat(s) || 1.8) * 16;
  }
  if (s.startsWith('clamp(')) {
    const parts = s.slice(6, -1).split(',').map((p) => p.trim());
    if (parts.length === 3) {
      const parseUnit = (val: string) => {
        if (val.endsWith('px')) return parseFloat(val);
        if (val.endsWith('rem')) return parseFloat(val) * 16;
        if (val.endsWith('vw')) return (parseFloat(val) / 100) * (containerWidth || window.innerWidth);
        return parseFloat(val) || 30;
      };
      const min = parseUnit(parts[0]);
      const pref = parseUnit(parts[1]);
      const max = parseUnit(parts[2]);
      return Math.min(Math.max(min, pref), max);
    }
  }
  return 30;
}

export const ParticleText: React.FC<ParticleTextProps> = ({
  text,
  particleSize = 2,
  density = 3,
  color = '#38bdf8',
  highlightColor = '#00f0ff',
  highlightMode = 'gradient',
  shape = 'circle',
  intro = 'gather',
  scatter = 170,
  gatherDuration = 1000,
  stagger = 480,
  clickBurst = true,
  burstStrength = 1.7,
  pointerRepel = 40,
  repelRadius = 145,
  idleDrift = 0.7,
  trigger = 'hover',
  fontSize = 'clamp(1.75rem, 3.5vw, 2.25rem)',
  fontWeight = 800,
  fontFamily = 'inherit',
  glow = true,
  className = '',
  style
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const container = containerRef.current;
    const canvas = canvasRef.current;
    if (!container || !canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;
    let particles: Particle[] = [];
    let startTime = performance.now();
    const mouse = { x: -9999, y: -9999, active: false };

    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const effectiveScatter = prefersReducedMotion ? 0 : scatter;
    const effectiveDrift = prefersReducedMotion ? 0 : idleDrift;

    const initParticles = () => {
      const rect = container.getBoundingClientRect();
      const dpr = window.devicePixelRatio || 1;
      const width = Math.max(10, Math.floor(rect.width));
      const height = Math.max(10, Math.floor(rect.height));

      canvas.width = width * dpr;
      canvas.height = height * dpr;
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;

      ctx.setTransform(1, 0, 0, 1, 0, 0);
      ctx.scale(dpr, dpr);

      // Measure & rasterize text on an offscreen canvas
      const offscreen = document.createElement('canvas');
      offscreen.width = width;
      offscreen.height = height;
      const offCtx = offscreen.getContext('2d', { willReadFrequently: true });
      if (!offCtx) return;

      const resolvedSize = resolveFontSizePx(fontSize, width);
      const computedFontFamily =
        fontFamily === 'inherit'
          ? getComputedStyle(container).fontFamily || 'sans-serif'
          : fontFamily;

      offCtx.font = `${fontWeight} ${resolvedSize}px ${computedFontFamily}`;
      offCtx.textAlign = 'center';
      offCtx.textBaseline = 'middle';
      offCtx.fillStyle = '#ffffff';
      offCtx.fillText(text, width / 2, height / 2);

      const imgData = offCtx.getImageData(0, 0, width, height).data;
      const step = Math.max(1, Math.round(density));
      const newParticles: Particle[] = [];

      let minX = width;
      let maxX = 0;

      // First pass: find particle bounds for gradient mode
      for (let y = 0; y < height; y += step) {
        for (let x = 0; x < width; x += step) {
          const idx = (y * width + x) * 4;
          if (imgData[idx + 3] > 128) {
            if (x < minX) minX = x;
            if (x > maxX) maxX = x;
          }
        }
      }

      const totalSpan = Math.max(1, maxX - minX);

      // Second pass: construct particles
      for (let y = 0; y < height; y += step) {
        for (let x = 0; x < width; x += step) {
          const idx = (y * width + x) * 4;
          if (imgData[idx + 3] > 128) {
            let pColor = color;
            if (highlightMode === 'gradient') {
              const t = Math.max(0, Math.min(1, (x - minX) / totalSpan));
              pColor = interpolateRgb(color, highlightColor, t);
            } else if (highlightMode === 'random') {
              pColor = Math.random() > 0.5 ? color : highlightColor;
            }

            // Scatter start positions for gather intro
            const angle = Math.random() * Math.PI * 2;
            const dist = Math.random() * effectiveScatter;
            const startX = x + Math.cos(angle) * dist;
            const startY = y + Math.sin(angle) * dist;

            newParticles.push({
              x: intro === 'gather' ? startX : x,
              y: intro === 'gather' ? startY : y,
              vx: 0,
              vy: 0,
              originX: x,
              originY: y,
              startX,
              startY,
              color: pColor,
              size: particleSize,
              phase: Math.random() * Math.PI * 2,
              gatherDelay: Math.random() * stagger
            });
          }
        }
      }

      particles = newParticles;
      startTime = performance.now();
    };

    initParticles();

    // Resize observer
    const resizeObserver = new ResizeObserver(() => {
      initParticles();
    });
    resizeObserver.observe(container);

    // Mouse and touch interaction handlers
    const updatePointerPos = (clientX: number, clientY: number) => {
      const rect = canvas.getBoundingClientRect();
      mouse.x = clientX - rect.left;
      mouse.y = clientY - rect.top;
      mouse.active = true;
    };

    const handlePointerMove = (e: MouseEvent) => {
      updatePointerPos(e.clientX, e.clientY);
    };

    const handlePointerLeave = () => {
      mouse.active = false;
      mouse.x = -9999;
      mouse.y = -9999;
    };

    const handleTouchMove = (e: TouchEvent) => {
      if (e.touches[0]) {
        updatePointerPos(e.touches[0].clientX, e.touches[0].clientY);
      }
    };

    const handleClick = (e: MouseEvent) => {
      if (!clickBurst) return;
      const rect = canvas.getBoundingClientRect();
      const clickX = e.clientX - rect.left;
      const clickY = e.clientY - rect.top;

      particles.forEach((p) => {
        const dx = p.x - clickX;
        const dy = p.y - clickY;
        const dist = Math.hypot(dx, dy);
        const maxDist = repelRadius * 1.35;
        if (dist < maxDist && dist > 0.01) {
          const force = (1 - dist / maxDist) * 22 * burstStrength;
          const angle = Math.atan2(dy, dx);
          p.vx += Math.cos(angle) * force;
          p.vy += Math.sin(angle) * force;
        }
      });
    };

    const handleTouchStart = (e: TouchEvent) => {
      if (e.touches[0]) {
        updatePointerPos(e.touches[0].clientX, e.touches[0].clientY);
        if (clickBurst) {
          const rect = canvas.getBoundingClientRect();
          const clickX = e.touches[0].clientX - rect.left;
          const clickY = e.touches[0].clientY - rect.top;
          particles.forEach((p) => {
            const dx = p.x - clickX;
            const dy = p.y - clickY;
            const dist = Math.hypot(dx, dy);
            const maxDist = repelRadius * 1.35;
            if (dist < maxDist && dist > 0.01) {
              const force = (1 - dist / maxDist) * 20 * burstStrength;
              const angle = Math.atan2(dy, dx);
              p.vx += Math.cos(angle) * force;
              p.vy += Math.sin(angle) * force;
            }
          });
        }
      }
    };

    canvas.addEventListener('mousemove', handlePointerMove);
    canvas.addEventListener('mouseleave', handlePointerLeave);
    canvas.addEventListener('click', handleClick);
    canvas.addEventListener('touchmove', handleTouchMove, { passive: true });
    canvas.addEventListener('touchstart', handleTouchStart, { passive: true });
    canvas.addEventListener('touchend', handlePointerLeave);

    // Main animation loop
    const render = (now: number) => {
      const rect = container.getBoundingClientRect();
      const width = rect.width;
      const height = rect.height;

      ctx.clearRect(0, 0, width, height);

      const elapsed = now - startTime;
      const spring = 0.085;
      const friction = 0.82;

      for (let i = 0; i < particles.length; i++) {
        const p = particles[i];

        if (intro === 'gather' && elapsed < gatherDuration + stagger) {
          const pTime = Math.max(0, elapsed - p.gatherDelay);
          const progress = Math.min(1, pTime / gatherDuration);
          const ease = 1 - Math.pow(1 - progress, 3);

          p.x = p.startX + (p.originX - p.startX) * ease;
          p.y = p.startY + (p.originY - p.startY) * ease;
        } else {
          // Hover repulsion
          if (mouse.active && trigger === 'hover') {
            const dx = p.x - mouse.x;
            const dy = p.y - mouse.y;
            const dist = Math.hypot(dx, dy);
            if (dist < repelRadius && dist > 0.01) {
              const force = (1 - dist / repelRadius) * pointerRepel;
              const angle = Math.atan2(dy, dx);
              p.vx += Math.cos(angle) * force * 0.28;
              p.vy += Math.sin(angle) * force * 0.28;
            }
          }

          // Idle drift (gentle breathing motion)
          const driftX = effectiveDrift
            ? Math.sin(now * 0.002 + p.phase) * effectiveDrift
            : 0;
          const driftY = effectiveDrift
            ? Math.cos(now * 0.0022 + p.phase * 1.4) * effectiveDrift
            : 0;

          const targetX = p.originX + driftX;
          const targetY = p.originY + driftY;

          // Spring physics
          p.vx += (targetX - p.x) * spring;
          p.vy += (targetY - p.y) * spring;
          p.vx *= friction;
          p.vy *= friction;

          p.x += p.vx;
          p.y += p.vy;
        }

        // Draw particle
        ctx.fillStyle = p.color;
        if (glow) {
          ctx.shadowBlur = p.size * 3;
          ctx.shadowColor = p.color;
        } else {
          ctx.shadowBlur = 0;
        }

        if (shape === 'square') {
          ctx.fillRect(p.x - p.size, p.y - p.size, p.size * 2, p.size * 2);
        } else {
          ctx.beginPath();
          ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
          ctx.fill();
        }
      }

      animationFrameId = requestAnimationFrame(render);
    };

    animationFrameId = requestAnimationFrame(render);

    return () => {
      cancelAnimationFrame(animationFrameId);
      resizeObserver.disconnect();
      canvas.removeEventListener('mousemove', handlePointerMove);
      canvas.removeEventListener('mouseleave', handlePointerLeave);
      canvas.removeEventListener('click', handleClick);
      canvas.removeEventListener('touchmove', handleTouchMove);
      canvas.removeEventListener('touchstart', handleTouchStart);
      canvas.removeEventListener('touchend', handlePointerLeave);
    };
  }, [
    text,
    particleSize,
    density,
    color,
    highlightColor,
    highlightMode,
    shape,
    intro,
    scatter,
    gatherDuration,
    stagger,
    clickBurst,
    burstStrength,
    pointerRepel,
    repelRadius,
    idleDrift,
    trigger,
    fontSize,
    fontWeight,
    fontFamily,
    glow
  ]);

  return (
    <div
      ref={containerRef}
      style={{
        width: '100%',
        height: '100%',
        position: 'relative',
        overflow: 'hidden',
        userSelect: 'none',
        cursor: 'crosshair',
        ...style
      }}
      className={`particle-text-container ${className}`}
    >
      <canvas
        ref={canvasRef}
        role="img"
        aria-label={`Interactive particle text: ${text}`}
        style={{
          display: 'block',
          width: '100%',
          height: '100%'
        }}
      />
    </div>
  );
};

export default ParticleText;
