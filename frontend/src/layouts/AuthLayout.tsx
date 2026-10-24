import React, { useState } from 'react';
import ParticleText from './ParticleText';
import SlingButton from './SlingButton';

export interface AuthLayoutProps {
  stepLabel?: string;
  title: string;
  intro?: string;
  quote?: string;
  children: React.ReactNode;
}

export const AuthLayout: React.FC<AuthLayoutProps> = ({
  stepLabel = '01 / Join the festival',
  title,
  intro,
  quote = 'Every story begins with a horizon.',
  children
}) => {
  const [slingFired, setSlingFired] = useState(false);

  const sendMessage = () => {
    setSlingFired(true);
    setTimeout(() => setSlingFired(false), 2400);
  };

  return (
    <div className="litfest-auth-wrapper">
      <div className="litfest-auth-card">
        {/* Left Art Panel with Interactive Particle Text Widget */}
        <aside className="litfest-art-panel" aria-label="LitFest Branding Artwork">
          {/* Decorative Radial Glows (Section 2 & 3: coral glow low-left, rose glow top-right) */}
          <div className="litfest-art-glow-rose" aria-hidden="true" />
          <div className="litfest-art-glow-coral" aria-hidden="true" />

          {/* Branding Block with Minimalist Interactive ParticleText Widget */}
          <div className="litfest-art-brand">
            <div className="litfest-particle-wrapper">
              <div className="litfest-particle-box">
                <ParticleText
                  text="Litfest 2.0"
                  particleSize={2}
                  density={3}
                  color="#6366f1"
                  highlightColor="#ff5a36"
                  highlightMode="gradient"
                  shape="circle"
                  intro="gather"
                  scatter={170}
                  gatherDuration={1400}
                  stagger={480}
                  clickBurst
                  burstStrength={1.7}
                  pointerRepel={30}
                  repelRadius={120}
                  idleDrift={0.7}
                  trigger="hover"
                  fontSize="clamp(3rem, 4vw, 8rem)"
                  fontWeight={800}
                  fontFamily="inherit"
                  glow
                />
              </div>

              {/* Minimalist interactive cue */}
              <div className="litfest-particle-hint" aria-hidden="true">
                <span className="litfest-particle-hint-dot" />
                <span>Hover or tap to interact</span>
              </div>
            </div>

            <div className="litfest-art-tagline">
              Where voices echo and stories awaken
            </div>
          </div>

          {/* Mediterranean Sunset Scene: Peach Sun, Horizon, Waves & Pulse Line */}
          <div className="litfest-art-scene" aria-hidden="true">
            <div className="litfest-art-sun">
              {slingFired && (
                <div
                  style={{
                    position: 'absolute',
                    top: '-38px',
                    left: '50%',
                    transform: 'translateX(-50%)',
                    whiteSpace: 'nowrap',
                    background: 'rgba(8, 37, 103, 0.92)',
                    border: '1px solid rgba(242, 56, 80, 0.65)',
                    color: '#FAF6F1',
                    padding: '4px 14px',
                    borderRadius: '9999px',
                    fontFamily: 'var(--font-body)',
                    fontSize: '12px',
                    fontWeight: 600,
                    letterSpacing: '0.02em',
                    backdropFilter: 'blur(10px)',
                    boxShadow: '0 0 20px rgba(242, 56, 80, 0.35)',
                    pointerEvents: 'none',
                    zIndex: 10,
                    animation: 'fadeIn 0.25s ease'
                  }}
                >
                  Your journey begins
                </div>
              )}
              <SlingButton
                className="sling-button--sunset"
                onSend={() => sendMessage()}
                padColor="#FAF6F1"
                iconColor="#082567"
                accentColor="#F23850"
                wellColor="rgba(8, 37, 103, 0.45)"
                bandColor="#805080"
                size={68}
                strokeWidth={3}
                armAt={48}
                maxPull={320}
                launchSpeed={2200}
                recoil={0.15}
                flight={160}
                particles={80}
                spread={180}
                axis="any"
                tapSends={false}
              />
            </div>

            <svg
              className="litfest-art-waves"
              viewBox="0 0 360 110"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              preserveAspectRatio="none"
            >
              {/* Horizon Line (Continuous soft peach horizon) */}
              <line
                x1="0"
                y1="55"
                x2="360"
                y2="55"
                stroke="rgba(249, 203, 184, 0.4)"
                strokeWidth="1.2"
              />

              {/* Gentle Mediterranean Sunset Wave Layers */}
              <path
                d="M0 65 C60 58, 120 72, 180 65 C240 58, 300 72, 360 65"
                stroke="rgba(249, 203, 184, 0.38)"
                strokeWidth="1.2"
                fill="none"
              />
              <path
                d="M0 77 C70 70, 130 84, 200 77 C270 70, 320 83, 360 77"
                stroke="rgba(217, 138, 158, 0.32)"
                strokeWidth="1.2"
                fill="none"
              />
              <path
                d="M0 89 C50 82, 110 96, 170 89 C230 82, 290 95, 360 89"
                stroke="rgba(128, 80, 128, 0.25)"
                strokeWidth="1"
                fill="none"
              />

              {/* LitFest Blue Pulse Signature ECG Waveform (in Vivid Coral red with subtle glow) */}
              <path
                d="M0 55 L135 55 L145 55 L149 49 L154 55 L158 55 L164 22 L172 82 L179 46 L185 58 L189 55 L360 55"
                stroke="var(--color-coral)"
                strokeWidth="2.2"
                strokeLinecap="round"
                strokeLinejoin="round"
                fill="none"
                style={{
                  filter: 'drop-shadow(0 0 5px rgba(242, 56, 80, 0.65))'
                }}
              />
            </svg>
          </div>

          {/* Inspirational Tagline / Quote at Bottom */}
          {quote && (
            <div className="litfest-art-quote-container">
              <p className="litfest-art-quote">“{quote}”</p>
            </div>
          )}
        </aside>

        {/* Right Form Side (Coastal Ivory background, max 400px column) */}
        <main className="litfest-form-panel">
          <div className="litfest-form-inner">
            {/* Step Label */}
            {stepLabel && <div className="litfest-step-label">{stepLabel}</div>}

            {/* Cormorant Garamond Heading */}
            <h1 className="litfest-heading">{title}</h1>

            {/* Slate Intro Sentence */}
            {intro && <p className="litfest-intro">{intro}</p>}

            {/* Form Slot */}
            {children}
          </div>
        </main>
      </div>
    </div>
  );
};

export default AuthLayout;
