import React from 'react';

export interface WaterHazeProps {
  className?: string;
  style?: React.CSSProperties;
}

export const WaterHaze: React.FC<WaterHazeProps> = ({ className = '', style }) => {
  return (
    <div
      className={`underwater-layer-water-haze ${className}`.trim()}
      style={style}
      aria-hidden="true"
      data-testid="underwater-water-haze"
    >
      <div className="underwater-haze-gradient" />
      <div className="underwater-haze-cloud underwater-haze-cloud-1" />
      <div className="underwater-haze-cloud underwater-haze-cloud-2" />
      <div className="underwater-haze-cloud underwater-haze-cloud-3" />
    </div>
  );
};

export default WaterHaze;
