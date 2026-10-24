import React from 'react';
import { CheckCircle2, AlertCircle, Info, AlertTriangle, X } from 'lucide-react';

interface AlertProps {
  type: 'success' | 'error' | 'info' | 'warning';
  message: string;
  onClose?: () => void;
}

export const Alert: React.FC<AlertProps> = ({ type, message, onClose }) => {
  const configs = {
    success: {
      bg: 'rgba(34, 197, 94, 0.12)',
      border: 'rgba(34, 197, 94, 0.35)',
      color: '#4ade80',
      icon: CheckCircle2
    },
    error: {
      bg: 'rgba(239, 68, 68, 0.12)',
      border: 'rgba(239, 68, 68, 0.35)',
      color: '#f87171',
      icon: AlertCircle
    },
    warning: {
      bg: 'rgba(245, 158, 11, 0.12)',
      border: 'rgba(245, 158, 11, 0.35)',
      color: '#fbbf24',
      icon: AlertTriangle
    },
    info: {
      bg: 'rgba(56, 189, 248, 0.12)',
      border: 'rgba(56, 189, 248, 0.35)',
      color: '#38bdf8',
      icon: Info
    }
  };

  const config = configs[type];
  const Icon = config.icon;

  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '0.85rem 1.15rem',
        borderRadius: '12px',
        background: config.bg,
        border: `1px solid ${config.border}`,
        color: config.color,
        fontSize: '0.9rem',
        margin: '0.75rem 0',
        boxShadow: `0 0 15px ${config.bg}`
      }}
      className="animate-fade-in"
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
        <Icon size={18} style={{ flexShrink: 0 }} />
        <span>{message}</span>
      </div>
      {onClose && (
        <button
          onClick={onClose}
          style={{
            background: 'transparent',
            color: 'inherit',
            opacity: 0.8,
            padding: '0.2rem',
            display: 'flex',
            cursor: 'pointer'
          }}
        >
          <X size={15} />
        </button>
      )}
    </div>
  );
};

export default Alert;
