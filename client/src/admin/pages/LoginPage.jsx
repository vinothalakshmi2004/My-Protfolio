/**
 * /admin/login — e-mail + password sign-in with show/hide password and clear errors.
 * Redirects to the page the admin originally requested (or /admin) on success, and
 * straight to /admin when already signed in. The server rate-limits failed attempts.
 */
import { useState } from 'react';
import { Navigate, useLocation, useNavigate, Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { FiAlertCircle, FiArrowLeft, FiEye, FiEyeOff, FiLock, FiMail } from 'react-icons/fi';
import { useAuth } from '../context/AuthContext';
import { getErrorMessage } from '../../lib/apiClient';
import { Field, Input } from '../components/FormControls';
import Button from '../components/Button';
import PageSpinner from '../../components/PageSpinner';

const schema = z.object({
  email: z.string().trim().min(1, 'E-mail is required').email('Enter a valid e-mail address'),
  password: z.string().min(1, 'Password is required'),
});

export default function LoginPage() {
  const { status, login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [showPassword, setShowPassword] = useState(false);
  const [serverError, setServerError] = useState('');
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm({ resolver: zodResolver(schema), defaultValues: { email: '', password: '' } });

  const redirectTo = location.state?.from && location.state.from !== '/admin/login' ? location.state.from : '/admin';

  if (status === 'checking') return <PageSpinner />;
  if (status === 'authenticated') return <Navigate to={redirectTo} replace />;

  const onSubmit = async ({ email, password }) => {
    setServerError('');
    try {
      await login(email, password);
      navigate(redirectTo, { replace: true });
    } catch (error) {
      setServerError(
        error.response?.status === 429
          ? error.response.data?.message || 'Too many attempts. Please wait 15 minutes.'
          : getErrorMessage(error, 'Login failed. Please try again.')
      );
    }
  };

  return (
    // Centred card; full-bleed padding on phones, more breathing room from sm+
    <div className="flex min-h-screen min-h-dvh items-center justify-center bg-gradient-to-br from-slate-100 via-white to-primary-50 px-4 py-10 dark:from-slate-950 dark:via-slate-950 dark:to-primary-950/40 sm:px-6">
      <div className="w-full max-w-sm">
        <div className="mb-8 text-center">
          <span className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-primary-600 to-fuchsia-500 text-white shadow-lg shadow-primary-500/30">
            <FiLock className="h-5 w-5" />
          </span>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">Admin sign in</h1>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">Manage everything on your portfolio.</p>
        </div>

        <form
          onSubmit={handleSubmit(onSubmit)}
          noValidate
          className="space-y-5 rounded-2xl border border-slate-200 bg-white p-5 shadow-xl shadow-slate-200/50 dark:border-slate-800 dark:bg-slate-900 dark:shadow-none sm:p-7"
        >
          {serverError && (
            <div role="alert" className="flex items-start gap-2 rounded-lg border border-rose-200 bg-rose-50 p-3 text-sm text-rose-700 dark:border-rose-500/30 dark:bg-rose-500/10 dark:text-rose-300">
              <FiAlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
              <span>{serverError}</span>
            </div>
          )}

          <Field label="E-mail" htmlFor="email" error={errors.email?.message}>
            <div className="relative">
              <FiMail className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" aria-hidden="true" />
              <Input id="email" type="email" autoComplete="username" autoFocus invalid={!!errors.email} className="pl-9" {...register('email')} />
            </div>
          </Field>

          <Field label="Password" htmlFor="password" error={errors.password?.message}>
            <div className="relative">
              <FiLock className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" aria-hidden="true" />
              <Input
                id="password"
                type={showPassword ? 'text' : 'password'}
                autoComplete="current-password"
                invalid={!!errors.password}
                className="pl-9 pr-12"
                {...register('password')}
              />
              <button
                type="button"
                onClick={() => setShowPassword((v) => !v)}
                aria-label={showPassword ? 'Hide password' : 'Show password'}
                aria-pressed={showPassword}
                className="absolute right-0 top-0 flex h-11 w-11 items-center justify-center rounded-r-lg text-slate-400 hover:text-slate-600 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 dark:hover:text-slate-200"
              >
                {showPassword ? <FiEyeOff className="h-4 w-4" /> : <FiEye className="h-4 w-4" />}
              </button>
            </div>
          </Field>

          <Button type="submit" loading={isSubmitting} className="w-full">
            {isSubmitting ? 'Signing in…' : 'Sign in'}
          </Button>
        </form>

        <p className="mt-6 text-center">
          <Link to="/" className="inline-flex min-h-11 items-center gap-1.5 text-sm text-slate-500 hover:text-primary-600 dark:text-slate-400">
            <FiArrowLeft className="h-4 w-4" /> Back to the website
          </Link>
        </p>
      </div>
    </div>
  );
}
