
import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../state/AuthContext';
import { AuthLayout } from '../../layouts/AuthLayout';
import { Alert } from '../../components/ui/Alert';
import { z } from 'zod';

const signupValidationSchema = z.object({
  name: z
    .string()
    .trim()
    .min(2, 'Name must be at least 2 characters')
    .max(100, 'Name must be less than 100 characters')
    .regex(/^[^0-9]+$/, 'Numbers are not allowed in your name'),
  email: z
    .string()
    .trim()
    .min(1, 'Email address is required')
    .email('Please enter a valid email address'),
  password: z
    .string()
    .min(8, 'Password must be at least 8 characters long'),
  agreedToTerms: z
    .boolean()
    .refine((val) => val === true, {
      message: 'Please agree to the terms and privacy policy.',
    }),
});

export const SignupPage: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { register } = useAuth();

  const queryParams = new URLSearchParams(location.search);
  const redirectPath = queryParams.get('redirect') || '/';

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    agreedToTerms: false,
  });

  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [serverError, setServerError] = useState<string | null>(null);
  const [helpNotice, setHelpNotice] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;

    if (name === 'name' && /[0-9]/.test(value)) {
      return;
    }

    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));

    if (errors[name]) {
      setErrors((prev) => {
        const next = { ...prev };
        delete next[name];
        return next;
      });
    }
  };

  const handleBlur = (field: 'name' | 'email' | 'password') => {
    if (field === 'name') {
      const val = formData.name.trim();

      if (!val) {
        setErrors((prev) => ({
          ...prev,
          name: 'Full name is required',
        }));
      } else if (val.length < 2) {
        setErrors((prev) => ({
          ...prev,
          name: 'Name must be at least 2 characters',
        }));
      } else if (/[0-9]/.test(val)) {
        setErrors((prev) => ({
          ...prev,
          name: 'Numbers are not allowed in your name',
        }));
      } else {
        setErrors((prev) => {
          const next = { ...prev };
          delete next.name;
          return next;
        });
      }
    } else if (field === 'email') {
      const val = formData.email.trim();

      if (!val) {
        setErrors((prev) => ({
          ...prev,
          email: 'Email address is required',
        }));
      } else {
        const result = z.string().email().safeParse(val);

        if (!result.success) {
          setErrors((prev) => ({
            ...prev,
            email: 'Please enter a valid email address',
          }));
        } else {
          setErrors((prev) => {
            const next = { ...prev };
            delete next.email;
            return next;
          });
        }
      }
    } else if (field === 'password') {
      if (!formData.password) {
        setErrors((prev) => ({
          ...prev,
          password: 'Password is required',
        }));
      } else if (formData.password.length < 8) {
        setErrors((prev) => ({
          ...prev,
          password: 'Password must be at least 8 characters long',
        }));
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
    setHelpNotice(null);

    const validation = signupValidationSchema.safeParse({
      name: formData.name.trim(),
      email: formData.email.trim(),
      password: formData.password,
      agreedToTerms: formData.agreedToTerms,
    });

    if (!validation.success) {
      const fieldErrors: Record<string, string> = {};

      validation.error.errors.forEach((err) => {
        const key =
          err.path[0] === 'agreedToTerms'
            ? 'terms'
            : (err.path[0] as string);

        fieldErrors[key] = err.message;
      });

      setErrors(fieldErrors);
      return;
    }

    setSubmitting(true);

    try {
      await register({
        name: formData.name.trim(),
        email: formData.email.trim(),
        password: formData.password,
      });

      navigate(redirectPath);
    } catch (err: any) {
      const status = err?.statusCode || err?.response?.status || err?.status;
      const rawMsg =
        err?.message ||
        err?.response?.data?.error?.message ||
        err?.response?.data?.message ||
        '';

      if (
        status === 409 ||
        rawMsg.toLowerCase().includes('already registered') ||
        rawMsg.toLowerCase().includes('already exists')
      ) {
        setServerError(
          'You are already registered with this email address. Please log in instead.'
        );
      } else if (status === 401) {
        setServerError(
          'Authentication error. Please try logging in.'
        );
      } else {
        setServerError(
          rawMsg ||
            'Registration failed. Please check your information and try again.'
        );
      }
    } finally {
      setSubmitting(false);
    }
  };

  const handleNeedHelp = (e: React.MouseEvent<HTMLAnchorElement>) => {
    e.preventDefault();
    setHelpNotice(
      'For registration assistance, contact literati@nitrr.ac.in or visit the Contact page.'
    );
  };

  return (
    <AuthLayout
      title="Create your account."
      intro="Your next favourite story, conversation, or idea might begin here."
      quote="Every story begins with a horizon."
    >
      {serverError && (
        <Alert
          type="error"
          message={serverError}
          onClose={() => setServerError(null)}
        />
      )}

      {helpNotice && (
        <div className="litfest-social-notice" role="status">
          {helpNotice}
        </div>
      )}

      <form
        onSubmit={handleSubmit}
        noValidate
        id="signupForm"
        style={{ marginTop: '12px' }}
      >
        <div className="litfest-field">
          <label className="litfest-label" htmlFor="name">
            Full name
          </label>
          <input
            id="name"
            name="name"
            type="text"
            className={`litfest-input ${errors.name ? 'litfest-input--error' : ''}`}
            autoComplete="name"
            placeholder="How should we call you?"
            value={formData.name}
            onChange={handleChange}
            onBlur={() => handleBlur('name')}
            required
            autoFocus
          />
          {errors.name && (
            <div className="litfest-field-error" role="alert">
              <span>•</span> {errors.name}
            </div>
          )}
        </div>

        <div className="litfest-field">
          <label className="litfest-label" htmlFor="email">
            Email address
          </label>
          <input
            id="email"
            name="email"
            type="email"
            className={`litfest-input ${errors.email ? 'litfest-input--error' : ''}`}
            autoComplete="email"
            placeholder="you@example.com"
            value={formData.email}
            onChange={handleChange}
            onBlur={() => handleBlur('email')}
            required
          />
          {errors.email && (
            <div className="litfest-field-error" role="alert">
              <span>•</span> {errors.email}
            </div>
          )}
        </div>

        <div className="litfest-field">
          <label className="litfest-label" htmlFor="password">
            Create password
          </label>
          <div className="litfest-input-wrap">
            <input
              id="password"
              name="password"
              type={showPassword ? 'text' : 'password'}
              className={`litfest-input ${errors.password ? 'litfest-input--error' : ''}`}
              autoComplete="new-password"
              placeholder="At least 8 characters"
              minLength={8}
              value={formData.password}
              onChange={handleChange}
              onBlur={() => handleBlur('password')}
              required
            />
            <button
              id="togglePassword"
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

        <div className="litfest-auth-row">
          <label className="litfest-check-label" htmlFor="terms">
            <input
              id="terms"
              name="agreedToTerms"
              type="checkbox"
              checked={formData.agreedToTerms}
              onChange={handleChange}
              required
            />
            <span>I agree to the terms and privacy policy.</span>
          </label>

          <a
            className="litfest-textlink"
            href="/contact"
            onClick={handleNeedHelp}
            title="Need help with registration?"
          >
            Need help?
          </a>
        </div>

        {errors.terms && (
          <div
            className="litfest-field-error"
            role="alert"
            style={{ marginTop: '-14px', marginBottom: '14px' }}
          >
            <span>•</span> {errors.terms}
          </div>
        )}

        <button
          className="litfest-primary-btn"
          type="submit"
          disabled={submitting}
          id="signup-submit-btn"
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
                  animation: 'spin 0.8s linear infinite',
                }}
              />
              <span>Creating account...</span>
            </>
          ) : (
            <>
              <span>Create my account</span>
              <span aria-hidden="true">&nbsp; →</span>
            </>
          )}
        </button>
      </form>

      <footer className="litfest-auth-footer">
        Already have an account?{' '}
        <Link
          to="/login"
          className="litfest-auth-link"
          id="switch-to-login-link"
        >
          Log in
        </Link>
      </footer>
    </AuthLayout>
  );
};

export default SignupPage;
