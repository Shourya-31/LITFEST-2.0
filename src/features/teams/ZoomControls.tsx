import React from 'react';
import { Plus, Minus, RotateCcw } from 'lucide-react';

export interface ZoomControlsProps {
  onZoomIn: () => void;
  onZoomOut: () => void;
  onReset: () => void;
  canZoomIn?: boolean;
  canZoomOut?: boolean;
  currentLevel?: number;
  totalLevels?: number;
  depthLabel?: string;
}

export const ZoomControls: React.FC<ZoomControlsProps> = ({
  onZoomIn,
  onZoomOut,
  onReset,
  canZoomIn = true,
  canZoomOut = true,
  currentLevel,
  totalLevels,
  depthLabel,
}) => {
  return (
    <aside aria-label="3D Depth and Zoom Controls" className="team-zoom-controls">
      {depthLabel && (
        <div className="zoom-depth-tag">
          <span className="zoom-depth-indicator-dot" />
          <span>{depthLabel}</span>
        </div>
      )}

      {/* Zoom In (+) */}
      <button
        type="button"
        onClick={onZoomIn}
        disabled={!canZoomIn}
        aria-label="Zoom In (+)"
        title="Zoom In (+)"
        className="zoom-btn"
      >
        <Plus size={16} />
      </button>

      {/* Zoom Out (-) */}
      <button
        type="button"
        onClick={onZoomOut}
        disabled={!canZoomOut}
        aria-label="Zoom Out (-)"
        title="Zoom Out (-)"
        className="zoom-btn"
      >
        <Minus size={16} />
      </button>

      {/* Reset View */}
      <button
        type="button"
        onClick={onReset}
        aria-label="Reset View"
        title="Reset View"
        className="zoom-btn reset-btn"
      >
        <RotateCcw size={14} />
        <span className="reset-btn-text">Reset</span>
      </button>

      {currentLevel !== undefined && totalLevels !== undefined && (
        <span className="zoom-counter">
          {currentLevel + 1}/{totalLevels}
        </span>
      )}
    </aside>
  );
};
