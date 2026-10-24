import React from 'react';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'quiet';
  loading?: boolean;
  fullWidth?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

export const Button: React.FC<ButtonProps> = ({
  variant = 'primary',
  loading = false,
  fullWidth = false,
  leftIcon,
  rightIcon,
  disabled,
  children,
  style,
  className = '',
  ...props
}) => {
  const isDisabled = disabled || loading;

  const getVariantStyles = (): React.CSSProperties => {
    switch (variant) {
      case 'secondary':
        return {
          backgroundColor: 'var(--color-white)',
          color: 'var(--color-midnight)',
          border: '1px solid var(--color-border)',
          boxShadow: 'var(--shadow-soft)'
        };
      case 'quiet':
        return {
          backgroundColor: 'transparent',
          color: 'var(--color-slate)',
          border: '1px solid transparent'
        };
      case 'primary':
      default:
        return {
          backgroundColor: 'var(--color-midnight)',
          color: 'var(--color-white)',
          border: '1px solid var(--color-midnight)',
          boxShadow: 'var(--shadow-button)'
        };
    }
  };

  const baseStyles: React.CSSProperties = {
    minHeight: '44px',
    width: fullWidth ? '100%' : 'auto',
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 'var(--space-2)',
    padding: 'var(--space-3) var(--space-5)',
    borderRadius: 'var(--radius-input)',
    fontFamily: 'var(--font-body)',
    fontSize: '15px',
    fontWeight: 600,
    cursor: isDisabled ? 'not-allowed' : 'pointer',
    opacity: isDisabled ? 0.65 : 1,
    transition: 'all 0.2s cubic-bezier(0.16, 1, 0.3, 1)',
    position: 'relative',
    outline: 'none',
    textDecoration: 'none',
    userSelect: 'none',
    ...getVariantStyles(),
    ...style
  };

  return (
    <button
      {...props}
      disabled={isDisabled}
      aria-busy={loading}
      style={baseStyles}
      className={`litfest-button litfest-button--${variant} ${className}`}
    >
      {loading ? (
        <span
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 'var(--space-2)'
          }}
        >
          <svg
            style={{
              width: '18px',
              height: '18px',
              animation: 'spin 1s linear infinite'
            }}
            viewBox="0 0 24 24"
            fill="none"
            aria-hidden="true"
          >
            <circle
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="3"
              strokeLinecap="round"
              strokeDasharray="31.415, 31.415"
              style={{ opacity: 0.25 }}
            />
            <path
              d="M12 2a10 10 0 0 1 10 10"
              stroke="currentColor"
              strokeWidth="3"
              strokeLinecap="round"
            />
          </svg>
          <span>{children}</span>
        </span>
      ) : (
        <>
          {leftIcon && <span style={{ display: 'inline-flex' }}>{leftIcon}</span>}
          <span>{children}</span>
          {rightIcon && <span style={{ display: 'inline-flex' }}>{rightIcon}</span>}
        </>
      )}
    </button>
  );
};

export default Button;
