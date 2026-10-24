import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../state/AuthContext';
import { AuthLayout } from '../../layouts/AuthLayout';
import { FormField } from '../../components/ui/FormField';
import { SelectField } from '../../components/ui/SelectField';
import { PasswordField } from '../../components/ui/PasswordField';
import { Button } from '../../components/ui/Button';
import { Alert } from '../../components/ui/Alert';
import { User, Mail, Phone, School, Calendar, ArrowRight, ArrowLeft, Check } from 'lucide-react';
import { z } from 'zod';

const step1Schema = z.object({
  name: z
    .string()
    .min(2, 'Name must be at least 2 characters')
    .regex(/^[^0-9]+$/, 'Numbers are not allowed in your name'),
  email: z.string().email('Please enter a valid email address')
});

const step2Schema = z.object({
  phone: z.union([
    z.string().regex(/^\+?[0-9]{10,13}$/, 'Enter a valid 10-digit phone number'),
    z.literal('')
  ]),
  year: z.string().min(1, 'Academic year is required'),
  college: z.string().min(2, 'College name is required')
});

const fullValidationSchema = z
  .object({
    name: z
      .string()
      .min(2, 'Name must be at least 2 characters')
      .regex(/^[^0-9]+$/, 'Numbers are not allowed in your name'),
    email: z.string().email('Please enter a valid email address'),
    phone: z.union([
      z.string().regex(/^\+?[0-9]{10,13}$/, 'Enter a valid 10-digit phone number'),
      z.literal('')
    ]),
    year: z.string().min(1, 'Academic year is required'),
    college: z.string().min(2, 'College name is required'),
    password: z.string().min(6, 'Password must be at least 6 characters long'),
    confirmPassword: z.string().min(1, 'Please confirm your password')
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword']
  });

const YEAR_OPTIONS = [
  { value: '1st Year', label: '1st Year' },
  { value: '2nd Year', label: '2nd Year' },
  { value: '3rd Year', label: '3rd Year' },
  { value: '4th Year', label: '4th Year' },
  { value: 'Postgraduate', label: 'Postgraduate' }
];

export const SignupPage: React.FC = () => {
  const navigate = useNavigate();
  const { register } = useAuth();

  const [currentStep, setCurrentStep] = useState<1 | 2 | 3>(1);

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    college: 'NIT Raipur',
    year: '1st Year',
    password: '',
    confirmPassword: ''
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [serverError, setServerError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;

    // Input restriction for name: no digits allowed
    if (name === 'name' && /[0-9]/.test(value)) {
      return;
    }
    // Input restriction for phone: digits and plus only
    if (name === 'phone' && /[^0-9+]/.test(value)) {
      return;
    }

    setFormData((prev) => ({ ...prev, [name]: value }));

    // Instant clear of field-level error on change
    if (errors[name]) {
      setErrors((prev) => {
        const next = { ...prev };
        delete next[name];
        return next;
      });
    }
  };

  const handleBlur = (field: string) => {
    if (field === 'name' || field === 'email') {
      const result = step1Schema.safeParse({
        name: formData.name.trim(),
        email: formData.email.trim()
      });
      if (!result.success) {
        const fieldError = result.error.errors.find((err) => err.path[0] === field);
        if (fieldError) {
          setErrors((prev) => ({ ...prev, [field]: fieldError.message }));
        } else {
          setErrors((prev) => {
            const next = { ...prev };
            delete next[field];
            return next;
          });
        }
      } else {
        setErrors((prev) => {
          const next = { ...prev };
          delete next[field];
          return next;
        });
      }
    } else if (field === 'phone' || field === 'college' || field === 'year') {
      const result = step2Schema.safeParse({
        phone: formData.phone.trim(),
        college: formData.college.trim(),
        year: formData.year
      });
      if (!result.success) {
        const fieldError = result.error.errors.find((err) => err.path[0] === field);
        if (fieldError) {
          setErrors((prev) => ({ ...prev, [field]: fieldError.message }));
        } else {
          setErrors((prev) => {
            const next = { ...prev };
            delete next[field];
            return next;
          });
        }
      } else {
        setErrors((prev) => {
          const next = { ...prev };
          delete next[field];
          return next;
        });
      }
    } else if (field === 'password' || field === 'confirmPassword') {
      if (field === 'password') {
        if (formData.password.length > 0 && formData.password.length < 6) {
          setErrors((prev) => ({ ...prev, password: 'Password must be at least 6 characters long' }));
        } else {
          setErrors((prev) => {
            const next = { ...prev };
            delete next.password;
            return next;
          });
        }
      }
      if (field === 'confirmPassword') {
        if (formData.confirmPassword && formData.password !== formData.confirmPassword) {
          setErrors((prev) => ({ ...prev, confirmPassword: 'Passwords do not match' }));
        } else {
          setErrors((prev) => {
            const next = { ...prev };
            delete next.confirmPassword;
            return next;
          });
        }
      }
    }
  };

  const handleNextStep1 = () => {
    const result = step1Schema.safeParse({
      name: formData.name.trim(),
      email: formData.email.trim()
    });

    if (!result.success) {
      const fieldErrors: Record<string, string> = {};
      result.error.errors.forEach((err) => {
        if (err.path[0]) fieldErrors[err.path[0] as string] = err.message;
      });
      setErrors((prev) => ({ ...prev, ...fieldErrors }));
      return;
    }

    setErrors((prev) => {
      const next = { ...prev };
      delete next.name;
      delete next.email;
      return next;
    });
    setCurrentStep(2);
  };

  const handleNextStep2 = () => {
    const result = step2Schema.safeParse({
      phone: formData.phone.trim(),
      year: formData.year,
      college: formData.college.trim()
    });

    if (!result.success) {
      const fieldErrors: Record<string, string> = {};
      result.error.errors.forEach((err) => {
        if (err.path[0]) fieldErrors[err.path[0] as string] = err.message;
      });
      setErrors((prev) => ({ ...prev, ...fieldErrors }));
      return;
    }

    setErrors((prev) => {
      const next = { ...prev };
      delete next.phone;
      delete next.year;
      delete next.college;
      return next;
    });
    setCurrentStep(3);
  };

  const handleFinalSubmit = async () => {
    setErrors({});
    setServerError(null);

    const result = fullValidationSchema.safeParse({
      name: formData.name.trim(),
      email: formData.email.trim(),
      phone: formData.phone.trim(),
      college: formData.college.trim(),
      year: formData.year,
      password: formData.password,
      confirmPassword: formData.confirmPassword
    });

    if (!result.success) {
      const fieldErrors: Record<string, string> = {};
      result.error.errors.forEach((err) => {
        if (err.path[0]) fieldErrors[err.path[0] as string] = err.message;
      });
      setErrors(fieldErrors);

      if (fieldErrors.name || fieldErrors.email) {
        setCurrentStep(1);
      } else if (fieldErrors.phone || fieldErrors.year || fieldErrors.college) {
        setCurrentStep(2);
      }
      return;
    }

    setSubmitting(true);
    try {
      await register({
        name: formData.name.trim(),
        email: formData.email.trim(),
        phone: formData.phone.trim() ? formData.phone.trim() : undefined,
        college: formData.college.trim(),
        year: formData.year,
        password: formData.password
      });
      navigate('/dashboard');
    } catch (err: any) {
      const status = err?.response?.status;
      const rawMsg =
        err?.response?.data?.error?.message ||
        err?.response?.data?.message ||
        err?.message ||
        '';

      if (status === 409 || rawMsg.toLowerCase().includes('already registered') || rawMsg.toLowerCase().includes('already exists')) {
        setServerError('You are already registered with this email address. Please sign in instead.');
      } else if (status === 401) {
        setServerError('Authentication error. Please try logging in.');
      } else {
        setServerError(rawMsg || 'Registration failed. Please check your information and try again.');
      }
    } finally {
      setSubmitting(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (currentStep === 1) {
      handleNextStep1();
    } else if (currentStep === 2) {
      handleNextStep2();
    } else {
      handleFinalSubmit();
    }
  };

  const stepLabels = {
    1: '01 / Join the festival',
    2: '02 / Academic profile',
    3: '03 / Secure your account'
  };

  return (
    <AuthLayout
      stepLabel={stepLabels[currentStep]}
      title="Create your account."
      intro="Join LitFest 2.0 to register for events, workshops, and team competitions."
      quote="Every story begins with a horizon."
    >
      {/* 3-Step Visual Progress Tracker */}
      <nav className="litfest-stepper" aria-label="Registration Progress">
        <div className="litfest-stepper-track" aria-hidden="true">
          <div
            className="litfest-stepper-progress"
            style={{
              width: currentStep === 1 ? '0%' : currentStep === 2 ? '50%' : '100%'
            }}
          />
        </div>

        {[
          { num: 1 as const, title: 'Identity' },
          { num: 2 as const, title: 'Academic' },
          { num: 3 as const, title: 'Security' }
        ].map((step) => {
          const isActive = currentStep === step.num;
          const isCompleted = currentStep > step.num;

          const circleClass = isActive
            ? 'litfest-step-circle litfest-step-circle--active'
            : isCompleted
            ? 'litfest-step-circle litfest-step-circle--completed'
            : 'litfest-step-circle litfest-step-circle--upcoming';

          const titleClass = isActive
            ? 'litfest-step-title litfest-step-title--active'
            : isCompleted
            ? 'litfest-step-title litfest-step-title--completed'
            : 'litfest-step-title litfest-step-title--upcoming';

          return (
            <div
              key={step.num}
              className="litfest-step-item"
              role={isCompleted ? 'button' : undefined}
              tabIndex={isCompleted ? 0 : -1}
              aria-label={`Step ${step.num}: ${step.title}${isActive ? ' (current)' : isCompleted ? ' (completed, click to review)' : ''}`}
              aria-current={isActive ? 'step' : undefined}
              onClick={() => {
                if (isCompleted) {
                  setCurrentStep(step.num);
                }
              }}
              onKeyDown={(e) => {
                if (isCompleted && (e.key === 'Enter' || e.key === ' ')) {
                  e.preventDefault();
                  setCurrentStep(step.num);
                }
              }}
              style={{ cursor: isCompleted ? 'pointer' : 'default' }}
            >
              <div className={circleClass} aria-hidden="true">
                {isCompleted ? <Check size={14} strokeWidth={2.8} /> : step.num}
              </div>
              <span className={titleClass}>{step.title}</span>
            </div>
          );
        })}
      </nav>

      {/* Form-level Server Error Alert */}
      {serverError && (
        <Alert
          type="error"
          message={serverError}
          onClose={() => setServerError(null)}
        />
      )}

      {/* Step Forms */}
      <form onSubmit={handleSubmit} noValidate>
        {/* STEP 1: Name and Email */}
        {currentStep === 1 && (
          <div>
            <FormField
              id="signup-name"
              name="name"
              type="text"
              label="Full Name"
              required
              placeholder="Aarav Sharma"
              value={formData.name}
              onChange={handleChange}
              onBlur={() => handleBlur('name')}
              error={errors.name}
              leftIcon={<User size={18} strokeWidth={1.8} />}
              autoComplete="name"
              autoFocus
            />

            <FormField
              id="signup-email"
              name="email"
              type="email"
              label="Email Address"
              required
              placeholder="aarav@nitrr.ac.in"
              value={formData.email}
              onChange={handleChange}
              onBlur={() => handleBlur('email')}
              error={errors.email}
              leftIcon={<Mail size={18} strokeWidth={1.8} />}
              autoComplete="email"
            />

            <div style={{ marginTop: 'var(--space-6)' }}>
              <Button
                type="submit"
                variant="primary"
                fullWidth
                rightIcon={<ArrowRight size={17} color="var(--color-coral)" />}
              >
                Continue
              </Button>
            </div>
          </div>
        )}

        {/* STEP 2: Contact Number, Academic Year, College */}
        {currentStep === 2 && (
          <div>
            <FormField
              id="signup-phone"
              name="phone"
              type="tel"
              label="Contact Number"
              hint="10-digit number for event coordination"
              placeholder="9876543210 (Optional)"
              maxLength={13}
              value={formData.phone}
              onChange={handleChange}
              onBlur={() => handleBlur('phone')}
              error={errors.phone}
              leftIcon={<Phone size={18} strokeWidth={1.8} />}
              autoComplete="tel"
              autoFocus
            />

            <SelectField
              id="signup-year"
              name="year"
              label="Academic Year"
              required
              value={formData.year}
              onChange={handleChange}
              onBlur={() => handleBlur('year')}
              error={errors.year}
              options={YEAR_OPTIONS}
              leftIcon={<Calendar size={18} strokeWidth={1.8} />}
            />

            <FormField
              id="signup-college"
              name="college"
              type="text"
              label="College / Institute"
              required
              placeholder="NIT Raipur"
              value={formData.college}
              onChange={handleChange}
              onBlur={() => handleBlur('college')}
              error={errors.college}
              leftIcon={<School size={18} strokeWidth={1.8} />}
            />

            <div
              style={{
                display: 'flex',
                gap: 'var(--space-3)',
                marginTop: 'var(--space-6)'
              }}
            >
              <Button
                type="button"
                variant="secondary"
                onClick={() => setCurrentStep(1)}
                leftIcon={<ArrowLeft size={17} />}
                style={{ flex: 1 }}
              >
                Back
              </Button>
              <Button
                type="submit"
                variant="primary"
                rightIcon={<ArrowRight size={17} color="var(--color-coral)" />}
                style={{ flex: 1.4 }}
              >
                Continue
              </Button>
            </div>
          </div>
        )}

        {/* STEP 3: Password and Confirm Password */}
        {currentStep === 3 && (
          <div>
            <PasswordField
              id="signup-password"
              name="password"
              label="Password"
              required
              placeholder="••••••••"
              hint="Minimum 6 characters"
              value={formData.password}
              onChange={handleChange}
              onBlur={() => handleBlur('password')}
              error={errors.password}
              autoComplete="new-password"
              autoFocus
            />

            <PasswordField
              id="signup-confirm-password"
              name="confirmPassword"
              label="Confirm Password"
              required
              placeholder="••••••••"
              value={formData.confirmPassword}
              onChange={handleChange}
              onBlur={() => handleBlur('confirmPassword')}
              error={errors.confirmPassword}
              autoComplete="new-password"
            />

            <div
              style={{
                display: 'flex',
                gap: 'var(--space-3)',
                marginTop: 'var(--space-6)'
              }}
            >
              <Button
                type="button"
                variant="secondary"
                onClick={() => setCurrentStep(2)}
                leftIcon={<ArrowLeft size={17} />}
                style={{ flex: 1 }}
              >
                Back
              </Button>
              <Button
                type="submit"
                variant="primary"
                loading={submitting}
                rightIcon={
                  !submitting ? (
                    <ArrowRight size={17} color="var(--color-coral)" />
                  ) : undefined
                }
                style={{ flex: 1.6 }}
              >
                Complete Registration
              </Button>
            </div>
          </div>
        )}
      </form>

      {/* Switch to Sign In */}
      <footer className="litfest-auth-footer">
        Already registered?{' '}
        <Link to="/login" className="litfest-auth-link">
          Sign in here
        </Link>
      </footer>
    </AuthLayout>
  );
};

export default SignupPage;
