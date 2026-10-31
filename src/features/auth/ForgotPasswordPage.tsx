import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../../services/api/apiClient';
import { AuthLayout } from '../../layouts/AuthLayout';
import { FormField } from '../../components/ui/FormField';
import { Button } from '../../components/ui/Button';
import { Alert } from '../../components/ui/Alert';
import { Mail, ArrowRight, ArrowLeft } from 'lucide-react';
import { z } from 'zod';

const forgotValidationSchema = z.object({
  email: z
    .string()
    .min(1, 'Email address is required')
    .email('Please enter a valid email address')
});

export const ForgotPasswordPage: React.FC = () => {
  const [email, setEmail] = useState('');
  const [fieldError, setFieldError] = useState<string | undefined>(undefined);
  const [serverError, setServerError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const handleBlur = () => {
    const trimmed = email.trim();
    if (!trimmed) {
      setFieldError('Email address is required');
    } else {
      const result = forgotValidationSchema.safeParse({ email: trimmed });
      if (!result.success) {
        setFieldError(result.error.errors[0]?.message || 'Please enter a valid email address');
      } else {
        setFieldError(undefined);
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFieldError(undefined);
    setServerError(null);
    setSuccessMessage(null);

    const trimmed = email.trim();
    const result = forgotValidationSchema.safeParse({ email: trimmed });
    if (!result.success) {
      setFieldError(result.error.errors[0]?.message || 'Please enter a valid email address');
      return;
    }

    setSubmitting(true);
    try {
      const data = await api.post<{ message: string }>('/auth/forgot-password', {
        email: trimmed
      });
      setSuccessMessage(
        data.message || 'If an account exists with this email, instructions have been sent.'
      );
    } catch (err: any) {
      const errorMsg =
        err?.response?.data?.error?.message ||
        err?.response?.data?.message ||
        err?.message ||
        'Failed to dispatch reset instructions. Please try again.';
      setServerError(errorMsg);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <AuthLayout
      stepLabel="01 / Password recovery"
      title="Let's get you back in."
      intro="Enter your registered email address and we'll dispatch password recovery instructions."
      quote="Every story begins with a horizon."
    >
      {/* Success Notification */}
      {successMessage && (
        <Alert
          type="success"
          message={successMessage}
          onClose={() => setSuccessMessage(null)}
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

      {/* Password Reset Request Form */}
      <form onSubmit={handleSubmit} noValidate>
        <FormField
          id="forgot-email"
          name="email"
          type="email"
          label="Email Address"
          required
          placeholder="aarav@nitrr.ac.in"
          value={email}
          onChange={(e) => {
            setEmail(e.target.value);
            if (fieldError) setFieldError(undefined);
          }}
          onBlur={handleBlur}
          error={fieldError}
          leftIcon={<Mail size={18} strokeWidth={1.8} />}
          autoComplete="email"
          autoFocus
        />

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
            {submitting ? 'Sending Request...' : 'Send Reset Link'}
          </Button>
        </div>
      </form>

      {/* Switch back to Login */}
      <footer className="litfest-auth-footer">
        Remembered your password?{' '}
        <Link to="/login" className="litfest-auth-link">
          Back to sign in
        </Link>
      </footer>
    </AuthLayout>
  );
};

export default ForgotPasswordPage;
