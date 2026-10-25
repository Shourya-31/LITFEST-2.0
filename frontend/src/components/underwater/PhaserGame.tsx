import { useEffect, useRef } from 'react';
import Phaser from 'phaser';
import OceanScene from '../../game/OceanScene';
import './PhaserGame.css';

export interface PhaserGameProps {
  onNavigate?: (section: string) => void;
  className?: string;
}

export default function PhaserGame({ onNavigate, className = '' }: PhaserGameProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!containerRef.current) return;

    const game = new Phaser.Game({
      type: Phaser.AUTO,
      parent: containerRef.current,
      transparent: true,
      scale: {
        mode: Phaser.Scale.RESIZE,
        width: '100%',
        height: '100%',
      },
      physics: {
        default: 'arcade',
        arcade: { gravity: { x: 0, y: 0 }, debug: false },
      },
      scene: [OceanScene],
    });

    if (onNavigate) {
      game.registry.set('onNavigate', onNavigate);
    }

    const handleCustomNavigate = (event: Event) => {
      const customEvent = event as CustomEvent<{ section: string }>;
      if (customEvent.detail?.section && onNavigate) {
        onNavigate(customEvent.detail.section);
      }
    };

    window.addEventListener('bluepulse:navigate', handleCustomNavigate);

    return () => {
      window.removeEventListener('bluepulse:navigate', handleCustomNavigate);
      game.destroy(true);
    };
  }, [onNavigate]);

  return <div ref={containerRef} className={`phaser-layer ${className}`.trim()} />;
}