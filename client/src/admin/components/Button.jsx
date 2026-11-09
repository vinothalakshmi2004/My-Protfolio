/**
 * Button — the single button primitive used across the admin dashboard.
 *  variant: primary | secondary | danger | ghost | danger-ghost
 *  size:    md (44px tall = comfortable touch target) | sm | icon | icon-sm
 *  loading: shows a spinner and disables the button (prevents double submits)
 *  as:      render as another element (e.g. "a" for links styled as buttons)
 */
import { forwardRef } from 'react';
import Spinner from './Spinner';

const VARIANTS = {
  primary:
    'bg-primary-600 text-white shadow-sm hover:bg-primary-700 focus-visible:ring-primary-500 disabled:bg-primary-600/60',
  secondary:
    'border border-slate-300 bg-white text-slate-700 hover:bg-slate-50 focus-visible:ring-primary-500 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700',
  danger: 'bg-rose-600 text-white shadow-sm hover:bg-rose-700 focus-visible:ring-rose-500 disabled:bg-rose-600/60',
  ghost: 'text-slate-600 hover:bg-slate-100 focus-visible:ring-primary-500 dark:text-slate-300 dark:hover:bg-slate-800',
  'danger-ghost': 'text-rose-600 hover:bg-rose-50 focus-visible:ring-rose-500 dark:text-rose-400 dark:hover:bg-rose-950/40',
};

// Touch targets: 44px on phones/tablets; icon buttons tighten to 36px on lg+ where a mouse is likely
const SIZES = {
  md: 'min-h-11 px-4 py-2 text-sm gap-2',
  sm: 'min-h-9 px-3 py-1.5 text-sm gap-1.5',
  icon: 'h-11 w-11 lg:h-9 lg:w-9 justify-center',
  'icon-sm': 'h-9 w-9 justify-center',
};

export const Button = forwardRef(function Button(
  { variant = 'primary', size = 'md', loading = false, disabled, className = '', children, as: Component = 'button', type, ...props },
  ref
) {
  const isButton = Component === 'button';
  return (
    <Component
      ref={ref}
      type={isButton ? type || 'button' : undefined}
      disabled={isButton ? disabled || loading : undefined}
      aria-busy={loading || undefined}
      className={`inline-flex shrink-0 items-center justify-center rounded-lg font-semibold transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-white disabled:cursor-not-allowed disabled:opacity-60 dark:focus-visible:ring-offset-slate-900 ${VARIANTS[variant]} ${SIZES[size]} ${className}`}
      {...props}
    >
      {loading && <Spinner className="h-4 w-4" />}
      {children}
    </Component>
  );
});

export default Button;
