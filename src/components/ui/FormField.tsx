import React from 'react';

export interface FormFieldProps extends React.InputHTMLAttributes<HTMLInputElement> {
  id: string;
  label: string;
  error?: string;
  hint?: string;
  required?: boolean;
  leftIcon?: React.ReactNode;
}

export const FormField = React.forwardRef<HTMLInputElement, FormFieldProps>(
  ({ id, label, error, hint, required, leftIcon, style, className = '', ...props }, ref) => {
    const errorId = `${id}-error`;
    const hintId = `${id}-hint`;

    const describedBy = [
      error ? errorId : undefined,
      hint ? hintId : undefined
    ].filter(Boolean).join(' ') || undefined;

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

        <div style={{ position: 'relative', width: '100%' }}>
          {leftIcon && (
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
              {leftIcon}
            </div>
          )}

          <input
            {...props}
            ref={ref}
            id={id}
            required={required}
            aria-invalid={Boolean(error)}
            aria-describedby={describedBy}
            style={{
              width: '100%',
              minHeight: '44px',
              padding: `var(--space-3) var(--space-4)`,
              paddingLeft: leftIcon ? 'calc(var(--space-4) + 26px)' : 'var(--space-4)',
              backgroundColor: 'var(--color-input-bg)',
              border: `1px solid ${error ? 'var(--color-error)' : 'var(--color-border)'}`,
              borderRadius: 'var(--radius-input)',
              color: 'var(--color-text)',
              fontFamily: 'var(--font-body)',
              fontSize: '16px', // Strict 16px minimum to prevent iOS zoom
              lineHeight: 1.4,
              outline: 'none',
              transition: 'border-color 0.2s ease, box-shadow 0.2s ease, background-color 0.2s ease',
              boxSizing: 'border-box',
              ...style
            }}
            className={`litfest-input ${error ? 'litfest-input--error' : ''} ${className}`}
          />
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

FormField.displayName = 'FormField';

export default FormField;
