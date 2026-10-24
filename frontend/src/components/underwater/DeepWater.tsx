import React from 'react';

export interface DeepWaterProps {
  className?: string;
  style?: React.CSSProperties;
}

export const DeepWater: React.FC<DeepWaterProps> = ({ className = '', style }) => {
  return (
    <div
      className={`underwater-layer-deep-water ${className}`.trim()}
      style={style}
      aria-hidden="true"
      data-testid="underwater-deep-water"
    />
  );
};

export default DeepWater;
