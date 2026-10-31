import React, { useEffect, useRef } from 'react';

export interface UnderwaterParticle {
  x: number;
  y: number;
  radius: number;
  alpha: number;
  baseAlpha: number;
  glowRadius: number;
  vx: number;
  vy: number;
  phase: number;
  phaseSpeed: number;
}

export interface ParticlesProps {
  className?: string;
  style?: React.CSSProperties;
  count?: number;
}


export const Particles: React.FC<ParticlesProps> = ({
  className = '',
  style,
  count = 45,
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d', { alpha: true });
    if (!ctx) return;

    let animationFrameId: number;
    let width = 0;
    let height = 0;
    let dpr = 1;

    // Check user's motion preference
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    // Initialize particles array
    const particles: UnderwaterParticle[] = [];

    const createParticle = (initY?: number): UnderwaterParticle => {
      const radius = 0.8 + Math.random() * 1.8;
      const baseAlpha = 0.2 + Math.random() * 0.55;
      return {
        x: Math.random() * (width || window.innerWidth),
        y: initY !== undefined ? initY : Math.random() * (height || window.innerHeight),
        radius,
        alpha: baseAlpha,
        baseAlpha,
        glowRadius: radius * (2.5 + Math.random() * 2),
        vx: (Math.random() - 0.5) * 0.18,
        vy: -(0.15 + Math.random() * 0.35), // gentle upward buoyant drift
        phase: Math.random() * Math.PI * 2,
        phaseSpeed: 0.015 + Math.random() * 0.02,
      };
    };

    const resize = () => {
      if (!canvas) return;
      const rect = canvas.getBoundingClientRect();
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      width = Math.max(rect.width, window.innerWidth);
      height = Math.max(rect.height, window.innerHeight);

      canvas.width = Math.floor(width * dpr);
      canvas.height = Math.floor(height * dpr);
      ctx.setTransform(1, 0, 0, 1, 0, 0);
      ctx.scale(dpr, dpr);

      // Repopulate if empty
      if (particles.length === 0) {
        for (let i = 0; i < count; i++) {
          particles.push(createParticle());
        }
      }
    };

    resize();
    window.addEventListener('resize', resize);

    let isDocumentVisible = !document.hidden;
    const handleVisibilityChange = () => {
      isDocumentVisible = !document.hidden;
    };
    document.addEventListener('visibilitychange', handleVisibilityChange);

    const render = () => {
      if (!isDocumentVisible) {
        animationFrameId = requestAnimationFrame(render);
        return;
      }

      ctx.clearRect(0, 0, width, height);

      const motionFactor = prefersReducedMotion ? 0.2 : 1;

      for (let i = 0; i < particles.length; i++) {
        const p = particles[i];

        // Subtle organic sine wave horizontal sway + upward buoyancy
        p.phase += p.phaseSpeed * motionFactor;
        p.x += (p.vx + Math.sin(p.phase) * 0.22) * motionFactor;
        p.y += p.vy * motionFactor;

        // Gentle pulsating glow
        p.alpha = p.baseAlpha * (0.75 + Math.sin(p.phase) * 0.25);

        // Wrap around boundaries smoothly
        if (p.y < -10) {
          p.y = height + 10;
          p.x = Math.random() * width;
        } else if (p.y > height + 10) {
          p.y = -10;
        }
        if (p.x < -10) {
          p.x = width + 10;
        } else if (p.x > width + 10) {
          p.x = -10;
        }

        // Draw soft glowing aura
        const gradient = ctx.createRadialGradient(
          p.x,
          p.y,
          0,
          p.x,
          p.y,
          p.glowRadius
        );
        gradient.addColorStop(0, `rgba(180, 240, 255, ${p.alpha * 0.95})`);
        gradient.addColorStop(0.35, `rgba(100, 210, 255, ${p.alpha * 0.55})`);
        gradient.addColorStop(1, 'rgba(40, 150, 255, 0)');

        ctx.fillStyle = gradient;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.glowRadius, 0, Math.PI * 2);
        ctx.fill();

        // Draw crisp bright particle center
        ctx.fillStyle = `rgba(235, 250, 255, ${p.alpha})`;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
        ctx.fill();
      }

      animationFrameId = requestAnimationFrame(render);
    };

    animationFrameId = requestAnimationFrame(render);

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener('resize', resize);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [count]);

  return (
    <canvas
      ref={canvasRef}
      className={`underwater-layer-particles ${className}`.trim()}
      style={style}
      aria-hidden="true"
      data-testid="underwater-particles"
    />
  );
};

export default Particles;
