import React, { useEffect, useRef } from 'react';

export interface ClickBubble {
  x: number;
  y: number;
  radius: number;
  targetRadius: number;
  vx: number;
  vy: number;
  wobblePhase: number;
  wobbleSpeed: number;
  wobbleAmp: number;
  alpha: number;
  life: number;
  maxLife: number;
  sheenAngle: number;
}

export interface BubbleOverlayProps {
  className?: string;
  style?: React.CSSProperties;
  maxBubbles?: number;
  listenGlobal?: boolean;
}


export const BubbleOverlay: React.FC<BubbleOverlayProps> = ({
  className = '',
  style,
  maxBubbles = 80,
  listenGlobal = true,
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const bubblesRef = useRef<ClickBubble[]>([]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d', { alpha: true });
    if (!ctx) return;

    let animationFrameId: number;
    let width = 0;
    let height = 0;
    let dpr = 1;

    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

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
    };

    resize();
    window.addEventListener('resize', resize);

    const spawnBubbleBurst = (originX: number, originY: number) => {
      const burstCount = 6 + Math.floor(Math.random() * 7);

      for (let i = 0; i < burstCount; i++) {
        if (bubblesRef.current.length >= maxBubbles) {
          bubblesRef.current.shift();
        }

        const angle = Math.random() * Math.PI * 2;
        const speed = 0.8 + Math.random() * 2.6;
        const targetRadius = 3 + Math.random() * 8.5;

        bubblesRef.current.push({
          x: originX + (Math.random() - 0.5) * 12,
          y: originY + (Math.random() - 0.5) * 12,
          radius: 1.5,
          targetRadius,
          vx: Math.cos(angle) * speed,
          vy: -Math.abs(Math.sin(angle) * speed * 0.75) - 0.5,
          wobblePhase: Math.random() * Math.PI * 2,
          wobbleSpeed: 0.04 + Math.random() * 0.05,
          wobbleAmp: 0.6 + Math.random() * 1.2,
          alpha: 0.85,
          life: 0,
          maxLife: 160 + Math.random() * 140,
          sheenAngle: -Math.PI / 4 + (Math.random() - 0.5) * 0.4,
        });
      }
    };

    const handleClick = (e: MouseEvent | TouchEvent) => {
      let clientX = 0;
      let clientY = 0;

      if ('touches' in e && e.touches.length > 0) {
        clientX = e.touches[0].clientX;
        clientY = e.touches[0].clientY;
      } else if ('clientX' in e) {
        clientX = e.clientX;
        clientY = e.clientY;
      } else {
        return;
      }

      if (canvas) {
        const rect = canvas.getBoundingClientRect();
        spawnBubbleBurst(clientX - rect.left, clientY - rect.top);
      } else {
        spawnBubbleBurst(clientX, clientY);
      }
    };

    const targetElement = listenGlobal ? window : canvas;
    targetElement.addEventListener('pointerdown', handleClick as EventListener, { passive: true });

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

      const motionFactor = prefersReducedMotion ? 0.3 : 1;
      const bubbles = bubblesRef.current;

      for (let i = bubbles.length - 1; i >= 0; i--) {
        const b = bubbles[i];
        b.life += 1;

        if (b.radius < b.targetRadius) {
          b.radius += (b.targetRadius - b.radius) * 0.15;
        }

        b.vx *= 0.94;

        b.vy -= 0.045 * motionFactor;
        if (b.vy < -3.2) b.vy = -3.2;

        b.wobblePhase += b.wobbleSpeed * motionFactor;
        const wobbleX = Math.sin(b.wobblePhase) * b.wobbleAmp;

        b.x += (b.vx + wobbleX) * motionFactor;
        b.y += b.vy * motionFactor;

        const lifeRatio = b.life / b.maxLife;
        let fade = 1;
        if (lifeRatio > 0.75) {
          fade = 1 - (lifeRatio - 0.75) / 0.25;
        }
        if (b.y < 40) {
          fade *= Math.max(0, b.y / 40);
        }

        const currentAlpha = b.alpha * fade;

        if (b.y < -b.radius || currentAlpha <= 0.02 || b.life >= b.maxLife) {
          bubbles.splice(i, 1);
          continue;
        }


        const bodyGrad = ctx.createRadialGradient(
          b.x - b.radius * 0.2,
          b.y - b.radius * 0.2,
          b.radius * 0.1,
          b.x,
          b.y,
          b.radius
        );
        bodyGrad.addColorStop(0, `rgba(225, 245, 255, ${currentAlpha * 0.15})`);
        bodyGrad.addColorStop(0.7, `rgba(130, 215, 255, ${currentAlpha * 0.25})`);
        bodyGrad.addColorStop(1, `rgba(50, 175, 240, ${currentAlpha * 0.55})`);

        ctx.fillStyle = bodyGrad;
        ctx.beginPath();
        ctx.arc(b.x, b.y, b.radius, 0, Math.PI * 2);
        ctx.fill();

        ctx.strokeStyle = `rgba(200, 242, 255, ${currentAlpha * 0.75})`;
        ctx.lineWidth = Math.max(0.75, b.radius * 0.1);
        ctx.beginPath();
        ctx.arc(b.x, b.y, b.radius, 0, Math.PI * 2);
        ctx.stroke();

        const glintOffset = b.radius * 0.45;
        const glintX = b.x + Math.cos(b.sheenAngle) * glintOffset;
        const glintY = b.y + Math.sin(b.sheenAngle) * glintOffset;
        const glintRadius = Math.max(0.8, b.radius * 0.26);

        ctx.fillStyle = `rgba(255, 255, 255, ${currentAlpha * 0.9})`;
        ctx.beginPath();
        ctx.arc(glintX, glintY, glintRadius, 0, Math.PI * 2);
        ctx.fill();

        const secGlintX = b.x - Math.cos(b.sheenAngle) * (glintOffset * 0.75);
        const secGlintY = b.y - Math.sin(b.sheenAngle) * (glintOffset * 0.75);
        ctx.fillStyle = `rgba(165, 235, 255, ${currentAlpha * 0.4})`;
        ctx.beginPath();
        ctx.arc(secGlintX, secGlintY, glintRadius * 0.65, 0, Math.PI * 2);
        ctx.fill();
      }

      animationFrameId = requestAnimationFrame(render);
    };

    animationFrameId = requestAnimationFrame(render);

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener('resize', resize);
      targetElement.removeEventListener('pointerdown', handleClick as EventListener);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [listenGlobal, maxBubbles]);

  return (
    <canvas
      ref={canvasRef}
      className={`underwater-layer-bubbles ${className}`.trim()}
      style={style}
      aria-hidden="true"
      data-testid="underwater-bubbles-overlay"
    />
  );
};

export default BubbleOverlay;
