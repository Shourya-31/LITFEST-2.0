import React, { useState } from 'react';
import { Eye, EyeOff, Lock } from 'lucide-react';

export interface PasswordFieldProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'type'> {
  id: string;
  label: string;
  error?: string;
  hint?: string;
  required?: boolean;
  rightLabelAction?: React.ReactNode;
}

export const PasswordField = React.forwardRef<HTMLInputElement, PasswordFieldProps>(
  ({ id, label, error, hint, required, rightLabelAction, style, className = '', ...props }, ref) => {
    const [showPassword, setShowPassword] = useState(false);
    const errorId = `${id}-error`;
    const hintId = `${id}-hint`;

    const describedBy = [
      error ? errorId : undefined,
      hint ? hintId : undefined
    ].filter(Boolean).join(' ') || undefined;

    const togglePasswordVisibility = () => {
      setShowPassword((prev) => !prev);
    };

    return (
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          gap: 'var(--space-1)',
          marginBottom: 'var(--space-4)',
          textAlign: 'left'
        }}
      >
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: 'var(--space-2)'
          }}
        >
          <label
            htmlFor={id}
            style={{
              fontFamily: 'var(--font-body)',
              fontSize: '14px',
              fontWeight: 500,
              color: 'var(--color-text)',
              display: 'flex',
              alignItems: 'center',
              gap: 'var(--space-1)'
            }}
          >
            <span>{label}</span>
            {required && (
              <span
                style={{ color: 'var(--color-coral)', fontWeight: 600 }}
                aria-hidden="true"
              >
                *
              </span>
            )}
          </label>
          {rightLabelAction}
        </div>

        <div style={{ position: 'relative', width: '100%' }}>
          <div
            style={{
              position: 'absolute',
              left: 'var(--space-4)',
              top: '50%',
              transform: 'translateY(-50%)',
              display: 'flex',
              alignItems: 'center',
              color: 'var(--color-slate)',
              pointerEvents: 'none',
              zIndex: 1
            }}
            aria-hidden="true"
          >
            <Lock size={18} strokeWidth={1.8} />
          </div>

          <input
            {...props}
            ref={ref}
            id={id}
            type={showPassword ? 'text' : 'password'}
            required={required}
            aria-invalid={Boolean(error)}
            aria-describedby={describedBy}
            style={{
              width: '100%',
              minHeight: '44px',
              padding: `var(--space-3) calc(var(--space-4) + 40px) var(--space-3) calc(var(--space-4) + 26px)`,
              backgroundColor: 'var(--color-input-bg)',
              border: `1px solid ${error ? 'var(--color-error)' : 'var(--color-border)'}`,
              borderRadius: 'var(--radius-input)',
              color: 'var(--color-text)',
              fontFamily: 'var(--font-body)',
              fontSize: '16px', // 16px to prevent iOS auto-zoom
              lineHeight: 1.4,
              outline: 'none',
              transition: 'border-color 0.2s ease, box-shadow 0.2s ease, background-color 0.2s ease',
              boxSizing: 'border-box',
              ...style
            }}
            className={`litfest-input ${error ? 'litfest-input--error' : ''} ${className}`}
          />

          <button
            type="button"
            onClick={togglePasswordVisibility}
            aria-label={showPassword ? 'Hide password' : 'Show password'}
            aria-pressed={showPassword}
            style={{
              position: 'absolute',
              right: 'var(--space-2)',
              top: '50%',
              transform: 'translateY(-50%)',
              background: 'transparent',
              border: 'none',
              color: 'var(--color-slate)',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: '40px',
              height: '40px',
              borderRadius: 'var(--radius-sm)',
              outline: 'none',
              padding: '0',
              transition: 'color 0.2s ease, background-color 0.2s ease'
            }}
            className="litfest-toggle-btn"
          >
            {showPassword ? (
              <EyeOff size={18} strokeWidth={1.8} />
            ) : (
              <Eye size={18} strokeWidth={1.8} />
            )}
          </button>
        </div>

        {hint && !error && (
          <span
            id={hintId}
            style={{
              fontFamily: 'var(--font-body)',
              fontSize: '13px',
              color: 'var(--color-slate)',
              marginTop: 'var(--space-1)'
            }}
          >
            {hint}
          </span>
        )}

        {error && (
          <span
            id={errorId}
            role="alert"
            style={{
              fontFamily: 'var(--font-body)',
              fontSize: '13px',
              fontWeight: 500,
              color: 'var(--color-error)',
              display: 'flex',
              alignItems: 'center',
              gap: 'var(--space-1)',
              marginTop: 'var(--space-1)'
            }}
          >
            <span aria-hidden="true">•</span>
            <span>{error}</span>
          </span>
        )}
      </div>
    );
  }
);

PasswordField.displayName = 'PasswordField';

export default PasswordField;
