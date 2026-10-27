import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../state/AuthContext';
import { AuthLayout } from '../../layouts/AuthLayout';
import { Alert } from '../../components/ui/Alert';
import { z } from 'zod';

const loginValidationSchema = z.object({
  email: z
    .string()
    .trim()
    .min(1, 'Email address is required')
    .email('Please enter a valid email address'),
  password: z.string().min(1, 'Password cannot be empty')
});

export const LoginPage: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { login } = useAuth();

  const queryParams = new URLSearchParams(location.search);
  const redirectPath = queryParams.get('redirect') || '/';

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [serverError, setServerError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const handleBlur = (field: 'email' | 'password') => {
    if (field === 'email') {
      const trimmed = email.trim();
      if (!trimmed) {
        setErrors((prev) => ({ ...prev, email: 'Email address is required' }));
      } else {
        const result = z.string().email().safeParse(trimmed);
        if (!result.success) {
          setErrors((prev) => ({ ...prev, email: 'Please enter a valid email address' }));
        } else {
          setErrors((prev) => {
            const next = { ...prev };
            delete next.email;
            return next;
          });
        }
      }
    } else if (field === 'password') {
      if (!password) {
        setErrors((prev) => ({ ...prev, password: 'Password cannot be empty' }));
      } else {
        setErrors((prev) => {
          const next = { ...prev };
          delete next.password;
          return next;
        });
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});
    setServerError(null);

    const result = loginValidationSchema.safeParse({ email: email.trim(), password });
    if (!result.success) {
      const fieldErrors: Record<string, string> = {};
      result.error.errors.forEach((err) => {
        if (err.path[0]) fieldErrors[err.path[0] as string] = err.message;
      });
      setErrors(fieldErrors);
      return;
    }

    setSubmitting(true);
    try {
      await login(email.trim(), password);
      navigate(redirectPath);
    } catch (err: any) {
      const errorMsg =
        err?.response?.data?.error?.message ||
        err?.response?.data?.message ||
        err?.message ||
        'Login failed. Please check your credentials.';
      setServerError(errorMsg);
    } finally {
      setSubmitting(false);
    }
  };

  const handleQuickLogin = (testEmail: string, testPass: string) => {
    setEmail(testEmail);
    setPassword(testPass);
    setErrors({});
    setServerError(null);
  };

  return (
    <AuthLayout
      title="Welcome back."
      intro="Sign in to your account to explore events, manage registrations, and access the festival."
      quote="Every story begins with a horizon."
    >
      {/* Server Error Alert */}
      {serverError && (
        <Alert
          type="error"
          message={serverError}
          onClose={() => setServerError(null)}
        />
      )}

      {/* Login Form */}
      <form onSubmit={handleSubmit} noValidate id="loginForm" style={{ marginTop: '12px' }}>
        {/* Email Address */}
        <div className="litfest-field">
          <label className="litfest-label" htmlFor="login-email">
            Email address
          </label>
          <input
            id="login-email"
            name="email"
            type="email"
            className={`litfest-input ${errors.email ? 'litfest-input--error' : ''}`}
            autoComplete="email"
            placeholder="aarav@nitrr.ac.in"
            value={email}
            onChange={(e) => {
              setEmail(e.target.value);
              if (errors.email) {
                setErrors((prev) => {
                  const next = { ...prev };
                  delete next.email;
                  return next;
                });
              }
            }}
            onBlur={() => handleBlur('email')}
            required
            autoFocus
          />
          {errors.email && (
            <div className="litfest-field-error" role="alert">
              <span>•</span> {errors.email}
            </div>
          )}
        </div>

        {/* Password */}
        <div className="litfest-field">
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              marginBottom: '7px'
            }}
          >
            <label className="litfest-label" htmlFor="login-password" style={{ marginBottom: 0 }}>
              Password
            </label>
            <Link
              to="/forgot-password"
              className="litfest-textlink"
              id="login-forgot-password-link"
            >
              Forgot password?
            </Link>
          </div>

          <div className="litfest-input-wrap">
            <input
              id="login-password"
              name="password"
              type={showPassword ? 'text' : 'password'}
              className={`litfest-input ${errors.password ? 'litfest-input--error' : ''}`}
              autoComplete="current-password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => {
                setPassword(e.target.value);
                if (errors.password) {
                  setErrors((prev) => {
                    const next = { ...prev };
                    delete next.password;
                    return next;
                  });
                }
              }}
              onBlur={() => handleBlur('password')}
              required
            />
            <button
              id="toggleLoginPassword"
              className="litfest-password-toggle"
              type="button"
              onClick={() => setShowPassword((prev) => !prev)}
              aria-label={showPassword ? 'Hide password' : 'Show password'}
              aria-pressed={showPassword}
            >
              {showPassword ? 'Hide' : 'Show'}
            </button>
          </div>
          {errors.password && (
            <div className="litfest-field-error" role="alert">
              <span>•</span> {errors.password}
            </div>
          )}
        </div>

        {/* Submit Button */}
        <button
          className="litfest-primary-btn"
          type="submit"
          disabled={submitting}
          id="login-submit-btn"
          style={{ marginTop: '22px' }}
        >
          {submitting ? (
            <>
              <span
                style={{
                  width: '15px',
                  height: '15px',
                  border: '2px solid rgba(255, 255, 255, 0.3)',
                  borderTopColor: '#ffffff',
                  borderRadius: '50%',
                  display: 'inline-block',
                  animation: 'spin 0.8s linear infinite'
                }}
              />
              <span>Signing in...</span>
            </>
          ) : (
            <>
              <span>Sign In</span>
              <span aria-hidden="true">&nbsp; →</span>
            </>
          )}
        </button>
      </form>

      {/* Quick Fill Test Accounts */}
      <div className="litfest-quick-accounts">
        <p className="litfest-quick-title">Quick fill test accounts</p>
        <div className="litfest-quick-buttons">
          <button
            type="button"
            className="litfest-quick-btn"
            onClick={() => handleQuickLogin('participant@nitrr.ac.in', 'User@12345')}
            id="quick-fill-participant-btn"
          >
            Participant (Aarav)
          </button>
          <button
            type="button"
            className="litfest-quick-btn"
            onClick={() => handleQuickLogin('admin@nitrr.ac.in', 'Admin@12345')}
            id="quick-fill-admin-btn"
          >
            Admin (Literati)
          </button>
        </div>
      </div>

      {/* Switch to Signup */}
      <footer className="litfest-auth-footer">
        Don't have an account yet?{' '}
        <Link to="/signup" className="litfest-auth-link" id="switch-to-register-link">
          Register now
        </Link>
      </footer>
    </AuthLayout>
  );
};

export default LoginPage;
