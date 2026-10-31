import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import '../styles/tokens.css';
import '../styles/auth.css';

export interface AuthLayoutProps {
  stepLabel?: string;
  title: string;
  intro?: string;
  quote?: string;
  children: React.ReactNode;
}

export const AuthLayout: React.FC<AuthLayoutProps> = ({
  stepLabel,
  title,
  intro,
  quote = 'Every story begins with a horizon.',
  children,
}) => {
  const navigate = useNavigate();

  // Close modal when pressing Escape
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        navigate('/');
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [navigate]);

  // Close when clicking the backdrop overlay outside the card
  const handleBackdropClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget) {
      navigate('/');
    }
  };

  return (
    <div
      className="litfest-auth-wrapper"
      onClick={handleBackdropClick}
      role="dialog"
      aria-modal="true"
      aria-label={title}
    >
      <div className="litfest-auth-card">
        {/* Close Button */}
        <button
          type="button"
          className="litfest-auth-close-btn"
          onClick={() => navigate('/')}
          aria-label="Close authentication"
          id="auth-close-btn"
        >
          &times;
        </button>

        {/* Left panel: Blue Pulse editorial artwork */}
        <aside className="litfest-art-panel" aria-label="Decorative coastal sunset artwork">
          <div className="litfest-art-sun" aria-hidden="true" />
          <div className="litfest-art-horizon" aria-hidden="true" />
          <div className="litfest-art-wave" aria-hidden="true" />

          <div className="litfest-art-content">
            <span className="litfest-art-eyebrow">LITERATI · NIT RAIPUR</span>

            <h2 className="litfest-art-brand">
              LitFest
              <span>2.0</span>
            </h2>

            <div className="litfest-art-pulse">— Blue Pulse —</div>

            <div className="litfest-art-rule" />

            <p className="litfest-art-quote">
              {quote.includes('\n') ? (
                quote.split('\n').map((line, idx) => (
                  <React.Fragment key={idx}>
                    {line}
                    <br />
                  </React.Fragment>
                ))
              ) : (
                quote
              )}
            </p>

            <p className="litfest-art-copy">
              A gathering of curious minds, untold stories, and ideas waiting to find their voice.
            </p>
          </div>

          <div className="litfest-art-bottom">
            <span>Words · Ideas · People</span>
            <svg
              className="litfest-art-signal"
              viewBox="0 0 90 28"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              aria-hidden="true"
            >
              <path
                d="M1 15H22L28 8L34 22L41 2L48 25L55 13H89"
                stroke="#f9cbb8"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </div>
        </aside>

        {/* Right panel: Coastal ivory form panel */}
        <main className="litfest-form-panel">
          <div className="litfest-form-inner">
            {stepLabel && <div className="litfest-step-label">{stepLabel}</div>}

            <h1 className="litfest-heading">{title}</h1>

            {intro && <p className="litfest-intro">{intro}</p>}

            {children}
          </div>
        </main>
      </div>
    </div>
  );
};

export default AuthLayout;
