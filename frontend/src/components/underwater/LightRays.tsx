import React from 'react';

export interface LightRaysProps {
  className?: string;
  style?: React.CSSProperties;
}


export const LightRays: React.FC<LightRaysProps> = ({ className = '', style }) => {
  return (
    <div
      className={`underwater-layer-light-rays ${className}`.trim()}
      style={style}
      aria-hidden="true"
      data-testid="underwater-light-rays"
    >
      <div className="underwater-ray underwater-ray-1" />
      <div className="underwater-ray underwater-ray-2" />
      <div className="underwater-ray underwater-ray-3" />
      <div className="underwater-ray underwater-ray-4" />
      <div className="underwater-ray underwater-ray-5" />
      <div className="underwater-ray underwater-ray-6" />
    </div>
  );
};

export default LightRays;
