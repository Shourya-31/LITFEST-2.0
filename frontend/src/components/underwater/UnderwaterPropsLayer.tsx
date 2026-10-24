import React from 'react';
import coralImg from '../../assets/media/coral1.png';
import turtleImg from '../../assets/media/turtle.png';
import jellyfishImg from '../../assets/media/jellyfish.png';

export interface UnderwaterPropsLayerProps {
  className?: string;
  style?: React.CSSProperties;
  showCorals?: boolean;
  showTurtle?: boolean;
  showJellyfish?: boolean;
}


export const UnderwaterPropsLayer: React.FC<UnderwaterPropsLayerProps> = ({
  className = '',
  style,
  showCorals = true,
  showTurtle = true,
  showJellyfish = true,
}) => {
  return (
    <div
      className={`underwater-props-layer ${className}`.trim()}
      style={style}
      aria-hidden="true"
      data-testid="underwater-props-layer"
    >
      {showCorals && (
        <div className="underwater-corals-container">
          <div className="coral-prop coral-prop-left">
            <img
              src={coralImg}
              alt=""
              className="coral-img coral-img-primary"
              loading="eager"
              decoding="async"
            />
          </div>

          <div className="coral-prop coral-prop-left-deep">
            <img
              src={coralImg}
              alt=""
              className="coral-img coral-img-deep"
              loading="eager"
              decoding="async"
            />
          </div>

          <div className="coral-prop coral-prop-right">
            <img
              src={coralImg}
              alt=""
              className="coral-img coral-img-right"
              loading="eager"
              decoding="async"
            />
          </div>
        </div>
      )}


      {showJellyfish && (
        <div className="jellyfish-prop-track">
          <div className="jellyfish-prop">
            <img
              src={jellyfishImg}
              alt=""
              className="jellyfish-img"
              loading="eager"
              decoding="async"
            />
          </div>
        </div>
      )}

      {showTurtle && (
        <div className="turtle-prop-track">
          <div className="turtle-prop">
            <img
              src={turtleImg}
              alt=""
              className="turtle-img"
              loading="eager"
              decoding="async"
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default UnderwaterPropsLayer;
