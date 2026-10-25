import React from 'react';
import { DeepWater } from './DeepWater';
import { LightRays } from './LightRays';
import { WaterHaze } from './WaterHaze';
import { Particles } from './Particles';
import { BubbleOverlay } from './BubbleOverlay';
import { UnderwaterPropsLayer } from './UnderwaterPropsLayer';
import './Underwater.css';

export interface UnderwaterSceneProps {
  className?: string;
  style?: React.CSSProperties;
  particleCount?: number;
  enableClickBubbles?: boolean;
  enableProps?: boolean;
  showCorals?: boolean;
  showTurtle?: boolean;
  children?: React.ReactNode;
}

export const UnderwaterScene: React.FC<UnderwaterSceneProps> = ({
  className = '',
  style,
  particleCount = 45,
  enableClickBubbles = true,
  enableProps = true,
  showCorals = true,
  showTurtle = true,
  children,
}) => {
  return (
    <div
      className={`underwater-scene ${className}`.trim()}
      style={style}
      role="presentation"
      aria-hidden="true"
    >
      <DeepWater />
      <LightRays />
      <WaterHaze />
      <Particles count={particleCount} />
      {enableProps && (
        <UnderwaterPropsLayer showCorals={showCorals} showTurtle={showTurtle} />
      )}
      {enableClickBubbles && <BubbleOverlay />}
      {children}
    </div>
  );
};

export default UnderwaterScene;
