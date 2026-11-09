/**
 * Form controls for admin forms (all forwardRef so react-hook-form's register() works).
 *
 *  <Field label error hint required className> wraps any control with a label + messages.
 *  <Input>, <Textarea>, <Select> share one look and an `invalid` state.
 *  <Switch> is an accessible on/off toggle (role="switch").
 *
 * Inputs use text-base (16px) on phones so iOS Safari doesn't zoom in on focus,
 * and text-sm from sm: upward.
 */
import { forwardRef, useId } from 'react';

const controlBase =
  'block w-full rounded-lg border bg-white px-3 text-base text-slate-900 placeholder:text-slate-400 shadow-sm transition focus:outline-none focus:ring-2 disabled:cursor-not-allowed disabled:bg-slate-100 disabled:opacity-70 dark:bg-slate-900 dark:text-slate-100 dark:placeholder:text-slate-500 dark:disabled:bg-slate-800 sm:text-sm';
const controlState = (invalid) =>
  invalid
    ? 'border-rose-400 focus:border-rose-500 focus:ring-rose-500/30 dark:border-rose-500/70'
    : 'border-slate-300 focus:border-primary-500 focus:ring-primary-500/30 dark:border-slate-700';

/** Label + control + hint/error. `className` lets callers span grid columns (e.g. "md:col-span-2"). */
export const Field = ({ label, htmlFor, error, hint, required, className = '', children, aside }) => (
  <div className={`min-w-0 ${className}`}>
    {(label || aside) && (
      <div className="mb-1.5 flex items-end justify-between gap-2">
        {label && (
          <label htmlFor={htmlFor} className="block text-sm font-medium text-slate-700 dark:text-slate-300">
            {label}
            {required && <span className="ml-0.5 text-rose-500">*</span>}
          </label>
        )}
        {aside}
      </div>
    )}
    {children}
    {error ? (
      <p role="alert" className="mt-1.5 text-xs font-medium text-rose-600 dark:text-rose-400">
        {error}
      </p>
    ) : hint ? (
      <p className="mt-1.5 text-xs text-slate-500 dark:text-slate-400">{hint}</p>
    ) : null}
  </div>
);

export const Input = forwardRef(function Input({ invalid, className = '', ...props }, ref) {
  return <input ref={ref} aria-invalid={invalid || undefined} className={`${controlBase} min-h-11 py-2 ${controlState(invalid)} ${className}`} {...props} />;
});

export const Textarea = forwardRef(function Textarea({ invalid, className = '', rows = 4, ...props }, ref) {
  return (
    <textarea
      ref={ref}
      rows={rows}
      aria-invalid={invalid || undefined}
      className={`${controlBase} resize-y py-2.5 leading-relaxed ${controlState(invalid)} ${className}`}
      {...props}
    />
  );
});

export const Select = forwardRef(function Select({ invalid, className = '', children, ...props }, ref) {
  return (
    <select ref={ref} aria-invalid={invalid || undefined} className={`${controlBase} min-h-11 py-2 pr-8 ${controlState(invalid)} ${className}`} {...props}>
      {children}
    </select>
  );
});

/** Character counter shown next to a label (e.g. SEO title 52/60). */
export const CharCount = ({ value = '', max }) => {
  const length = value?.length || 0;
  return (
    <span className={`text-xs tabular-nums ${length > max ? 'font-semibold text-rose-500' : 'text-slate-400'}`}>
      {length}/{max}
    </span>
  );
};

/**
 * Switch — accessible toggle. Controlled: pass `checked` + `onChange(nextBoolean)`.
 * With `label`, the whole row is clickable (44px tall touch target).
 */
export const Switch = ({ checked, onChange, label, description, disabled, id, size = 'md', className = '' }) => {
  const autoId = useId();
  const switchId = id || autoId;
  const track = size === 'sm' ? 'h-5 w-9' : 'h-6 w-11';
  const knob = size === 'sm' ? 'h-4 w-4' : 'h-5 w-5';
  const shift = size === 'sm' ? 'translate-x-4' : 'translate-x-5';

  const button = (
    <button
      id={switchId}
      type="button"
      role="switch"
      aria-checked={Boolean(checked)}
      aria-label={label ? undefined : 'Toggle'}
      disabled={disabled}
      onClick={() => onChange?.(!checked)}
      className={`relative inline-flex shrink-0 cursor-pointer items-center rounded-full transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 dark:focus-visible:ring-offset-slate-900 ${track} ${
        checked ? 'bg-primary-600' : 'bg-slate-300 dark:bg-slate-600'
      }`}
    >
      <span
        aria-hidden="true"
        className={`pointer-events-none inline-block transform rounded-full bg-white shadow ring-0 transition ${knob} ${checked ? shift : 'translate-x-0.5'}`}
      />
    </button>
  );

  if (!label) return button;
  return (
    <div className={`flex min-h-11 items-center justify-between gap-4 ${className}`}>
      <label htmlFor={switchId} className="min-w-0 cursor-pointer">
        <span className="block text-sm font-medium text-slate-700 dark:text-slate-300">{label}</span>
        {description && <span className="block text-xs text-slate-500 dark:text-slate-400">{description}</span>}
      </label>
      {button}
    </div>
  );
};
