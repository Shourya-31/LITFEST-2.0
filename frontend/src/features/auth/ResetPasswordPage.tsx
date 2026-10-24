import React, { useState } from 'react';
import { useSearchParams, Link, useNavigate } from 'react-router-dom';
import api from '../../services/api/apiClient';
import { AuthLayout } from '../../layouts/AuthLayout';
import { PasswordField } from '../../components/ui/PasswordField';
import { Button } from '../../components/ui/Button';
import { Alert } from '../../components/ui/Alert';
import { ArrowRight, ArrowLeft } from 'lucide-react';
import { z } from 'zod';

const resetValidationSchema = z
  .object({
    password: z.string().min(6, 'Password must be at least 6 characters long'),
    confirmPassword: z.string().min(1, 'Please confirm your new password')
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword']
  });

export const ResetPasswordPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const token = searchParams.get('token') || '';

  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [serverError, setServerError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const handleBlur = (field: 'password' | 'confirmPassword') => {
    if (field === 'password') {
      if (!password) {
        setErrors((prev) => ({ ...prev, password: 'Password is required' }));
      } else if (password.length < 6) {
        setErrors((prev) => ({ ...prev, password: 'Password must be at least 6 characters long' }));
      } else {
        setErrors((prev) => {
          const next = { ...prev };
          delete next.password;
          return next;
        });
      }
    } else if (field === 'confirmPassword') {
      if (!confirmPassword) {
        setErrors((prev) => ({ ...prev, confirmPassword: 'Confirm your password' }));
      } else if (password && confirmPassword !== password) {
        setErrors((prev) => ({ ...prev, confirmPassword: 'Passwords do not match' }));
      } else {
        setErrors((prev) => {
          const next = { ...prev };
          delete next.confirmPassword;
          return next;
        });
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});
    setServerError(null);
    setSuccessMessage(null);

    if (!token) {
      setServerError('Missing or invalid reset token. Please request a new reset link.');
      return;
    }

    const result = resetValidationSchema.safeParse({ password, confirmPassword });
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
      const data = await api.post<{ message: string }>('/auth/reset-password', {
        token,
        password
      });
      setSuccessMessage(
        data.message || 'Password updated successfully! Redirecting you to sign in...'
      );
      setTimeout(() => {
        navigate('/login');
      }, 2000);
    } catch (err: any) {
      const errorMsg =
        err?.response?.data?.error?.message ||
        err?.response?.data?.message ||
        err?.message ||
        'Failed to reset password. The reset link may have expired.';
      setServerError(errorMsg);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <AuthLayout
      stepLabel="02 / Reset password"
      title="Choose a new password."
      intro="Choose a strong, secure password for your LitFest account."
      quote="Every story begins with a horizon."
    >
      {/* Success Notification */}
      {successMessage && (
        <Alert
          type="success"
          message={successMessage}
        />
      )}

      {/* Missing Token Alert */}
      {!token && (
        <Alert
          type="error"
          message="No password reset token was found in the link. Please request a new recovery link."
        />
      )}

      {/* Server Error Alert */}
      {serverError && (
        <Alert
          type="error"
          message={serverError}
          onClose={() => setServerError(null)}
        />
      )}

      {/* Form or Link to Request New Token if missing */}
      {!token ? (
        <div style={{ marginTop: 'var(--space-6)', textAlign: 'center' }}>
          <Link to="/forgot-password" style={{ textDecoration: 'none' }}>
            <Button
              type="button"
              variant="primary"
              fullWidth
              leftIcon={<ArrowLeft size={17} />}
            >
              Request New Reset Link
            </Button>
          </Link>
        </div>
      ) : (
        <form onSubmit={handleSubmit} noValidate>
          <PasswordField
            id="reset-password"
            name="password"
            label="New Password"
            required
            hint="Minimum 6 characters"
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
            autoComplete="new-password"
            autoFocus
          />

          <PasswordField
            id="reset-confirm-password"
            name="confirmPassword"
            label="Confirm New Password"
            required
            placeholder="••••••••"
            value={confirmPassword}
            onChange={(e) => {
              setConfirmPassword(e.target.value);
              if (errors.confirmPassword) {
                setErrors((prev) => {
                  const next = { ...prev };
                  delete next.confirmPassword;
                  return next;
                });
              }
            }}
            onBlur={() => handleBlur('confirmPassword')}
            error={errors.confirmPassword}
            autoComplete="new-password"
          />

          <div style={{ marginTop: 'var(--space-6)' }}>
            <Button
              type="submit"
              variant="primary"
              fullWidth
              loading={submitting}
              disabled={submitting || !token}
              rightIcon={
                !submitting ? (
                  <ArrowRight size={17} color="var(--color-coral)" />
                ) : undefined
              }
            >
              {submitting ? 'Updating Password...' : 'Update Password'}
            </Button>
          </div>
        </form>
      )}

      {/* Return to Login */}
      <footer className="litfest-auth-footer">
        Remembered your credentials?{' '}
        <Link to="/login" className="litfest-auth-link">
          Return to sign in
        </Link>
      </footer>
    </AuthLayout>
  );
};

export default ResetPasswordPage;
