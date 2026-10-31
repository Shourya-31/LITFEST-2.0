import React from 'react';
import { AlertCircle, CheckCircle2, Info, X } from 'lucide-react';

export interface AlertProps {
  type?: 'error' | 'success' | 'info';
  message: string;
  onClose?: () => void;
  className?: string;
}

export const Alert: React.FC<AlertProps> = ({
  type = 'error',
  message,
  onClose,
  className = ''
}) => {
  const getStyles = () => {
    switch (type) {
      case 'success':
        return {
          bg: 'rgba(21, 128, 61, 0.1)',
          border: 'rgba(21, 128, 61, 0.35)',
          color: 'var(--color-success)',
          Icon: CheckCircle2
        };
      case 'info':
        return {
          bg: 'rgba(128, 80, 128, 0.12)',
          border: 'rgba(128, 80, 128, 0.35)',
          color: 'var(--color-violet)',
          Icon: Info
        };
      case 'error':
      default:
        return {
          bg: 'rgba(242, 56, 80, 0.12)',
          border: 'rgba(242, 56, 80, 0.35)',
          color: 'var(--color-coral)',
          Icon: AlertCircle
        };
    }
  };

  const { bg, border, color, Icon } = getStyles();

  return (
    <div
      role="alert"
      style={{
        display: 'flex',
        alignItems: 'flex-start',
        justifyContent: 'space-between',
        gap: 'var(--space-3)',
        padding: 'var(--space-3) var(--space-4)',
        borderRadius: 'var(--radius-input)',
        backgroundColor: bg,
        border: `1px solid ${border}`,
        color: color,
        fontFamily: 'var(--font-body)',
        fontSize: '14px',
        lineHeight: 1.5,
        marginBottom: 'var(--space-4)'
      }}
      className={`litfest-alert litfest-alert--${type} ${className}`}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
        <Icon size={18} style={{ flexShrink: 0 }} aria-hidden="true" />
        <span>{message}</span>
      </div>
      {onClose && (
        <button
          type="button"
          onClick={onClose}
          aria-label="Dismiss alert"
          style={{
            background: 'transparent',
            border: 'none',
            color: 'inherit',
            cursor: 'pointer',
            padding: 'var(--space-1)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            borderRadius: 'var(--radius-sm)',
            opacity: 0.8
          }}
        >
          <X size={16} />
        </button>
      )}
    </div>
  );
};

export default Alert;
