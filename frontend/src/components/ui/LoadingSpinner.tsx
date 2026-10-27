import React from 'react';

export const LoadingSpinner: React.FC<{ message?: string }> = ({ message = 'Loading...' }) => {
  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '4rem 1rem',
      gap: '1.25rem'
    }}>
      <div style={{
        width: '48px',
        height: '48px',
        borderRadius: '50%',
        border: '3px solid rgba(56, 189, 248, 0.2)',
        borderTopColor: '#00f0ff',
        animation: 'spin 0.8s linear infinite',
        boxShadow: '0 0 20px rgba(0, 240, 255, 0.4)'
      }} />
      <p style={{ color: '#94a3b8', fontSize: '0.95rem', fontWeight: 500 }}>
        {message}
      </p>
      <style>{`
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
};

export default LoadingSpinner;
