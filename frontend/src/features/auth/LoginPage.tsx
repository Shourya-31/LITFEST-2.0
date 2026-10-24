import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../state/AuthContext';
import { AuthLayout } from '../../layouts/AuthLayout';
import { FormField } from '../../components/ui/FormField';
import { PasswordField } from '../../components/ui/PasswordField';
import { Button } from '../../components/ui/Button';
import { Alert } from '../../components/ui/Alert';
import { Mail, ArrowRight } from 'lucide-react';
import { z } from 'zod';

const loginValidationSchema = z.object({
  email: z
    .string()
    .min(1, 'Email address is required')
    .email('Please enter a valid email address'),
  password: z.string().min(1, 'Password cannot be empty')
});

export const LoginPage: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { login } = useAuth();

  const queryParams = new URLSearchParams(location.search);
  const redirectPath = queryParams.get('redirect') || '/dashboard';

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [serverError, setServerError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const handleBlur = (field: 'email' | 'password') => {
    if (field === 'email') {
      const trimmed = email.trim();
      if (!trimmed) {
        setErrors((prev) => ({ ...prev, email: 'Email address is required' }));
      } else {
        const result = z.string().email('Please enter a valid email address').safeParse(trimmed);
        if (!result.success) {
          setErrors((prev) => ({ ...prev, email: result.error.errors[0]?.message || 'Please enter a valid email address' }));
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

    // Zod client validation
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
      stepLabel="01 / Access the festival"
      title="Welcome back."
      intro="Sign in to your account to explore events, manage registrations, and access the festival."
      quote="Every story begins with a horizon."
    >
      {/* Form-level Server Error Alert */}
      {serverError && (
        <Alert
          type="error"
          message={serverError}
          onClose={() => setServerError(null)}
        />
      )}

      {/* Login Form */}
      <form onSubmit={handleSubmit} noValidate>
        {/* Email Address */}
        <FormField
          id="login-email"
          name="email"
          type="email"
          label="Email Address"
          required
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
          error={errors.email}
          leftIcon={<Mail size={18} strokeWidth={1.8} />}
          autoComplete="email"
          autoFocus
        />

        {/* Password */}
        <PasswordField
          id="login-password"
          name="password"
          label="Password"
          required
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
          error={errors.password}
          autoComplete="current-password"
          rightLabelAction={
            <Link
              to="/forgot-password"
              className="litfest-auth-link"
              style={{ fontSize: '13px', fontWeight: 500 }}
            >
              Forgot password?
            </Link>
          }
        />

        {/* Submit Button */}
        <div style={{ marginTop: 'var(--space-6)' }}>
          <Button
            type="submit"
            variant="primary"
            fullWidth
            loading={submitting}
            rightIcon={
              !submitting ? (
                <ArrowRight size={17} color="var(--color-coral)" />
              ) : undefined
            }
          >
            Sign In
          </Button>
        </div>
      </form>

      {/* Quick Fill Test Accounts for Demo & Development */}
      <div
        style={{
          marginTop: 'var(--space-6)',
          paddingTop: 'var(--space-4)',
          borderTop: '1px solid rgba(32, 36, 58, 0.08)',
          textAlign: 'center'
        }}
      >
        <p
          style={{
            fontFamily: 'var(--font-body)',
            fontSize: '11px',
            fontWeight: 600,
            color: 'var(--color-slate)',
            letterSpacing: '0.05em',
            textTransform: 'uppercase',
            marginBottom: 'var(--space-2)'
          }}
        >
          Quick fill test accounts
        </p>
        <div
          style={{
            display: 'flex',
            gap: 'var(--space-2)',
            justifyContent: 'center',
            flexWrap: 'wrap'
          }}
        >
          <button
            type="button"
            onClick={() => handleQuickLogin('participant@nitrr.ac.in', 'User@12345')}
            style={{
              fontFamily: 'var(--font-body)',
              fontSize: '12px',
              fontWeight: 600,
              padding: '5px var(--space-3)',
              borderRadius: 'var(--radius-sm)',
              backgroundColor: 'rgba(8, 37, 103, 0.06)',
              color: 'var(--color-midnight)',
              border: '1px solid rgba(8, 37, 103, 0.15)',
              cursor: 'pointer',
              transition: 'all 0.2s ease'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = 'rgba(8, 37, 103, 0.12)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = 'rgba(8, 37, 103, 0.06)';
            }}
          >
            Participant (Aarav)
          </button>
          <button
            type="button"
            onClick={() => handleQuickLogin('admin@nitrr.ac.in', 'Admin@12345')}
            style={{
              fontFamily: 'var(--font-body)',
              fontSize: '12px',
              fontWeight: 600,
              padding: '5px var(--space-3)',
              borderRadius: 'var(--radius-sm)',
              backgroundColor: 'rgba(128, 80, 128, 0.08)',
              color: 'var(--color-violet)',
              border: '1px solid rgba(128, 80, 128, 0.2)',
              cursor: 'pointer',
              transition: 'all 0.2s ease'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = 'rgba(128, 80, 128, 0.16)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = 'rgba(128, 80, 128, 0.08)';
            }}
          >
            Admin (Literati)
          </button>
        </div>
      </div>

      {/* Switch to Signup */}
      <footer className="litfest-auth-footer">
        Don't have an account yet?{' '}
        <Link to="/signup" className="litfest-auth-link">
          Register now
        </Link>
      </footer>
    </AuthLayout>
  );
};

export default LoginPage;
