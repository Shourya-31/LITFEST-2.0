import React from 'react';
import bgImg from '../../assets/media/underwater-bg.jpg';

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
    >
      <img
        src={bgImg}
        alt=""
        className="underwater-bg-image"
        loading="eager"
        decoding="async"
      />
      <div className="underwater-bg-overlay" />
    </div>
  );
};

export default DeepWater;
