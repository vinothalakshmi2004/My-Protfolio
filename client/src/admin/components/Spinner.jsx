/** Spinner — small inline loading indicator (inherits the current text colour). */
export const Spinner = ({ className = 'h-5 w-5', label }) => (
  <span role={label ? 'status' : undefined} className="inline-flex">
    <span className={`animate-spin rounded-full border-2 border-current border-t-transparent ${className}`} aria-hidden="true" />
    {label && <span className="sr-only">{label}</span>}
  </span>
);

export default Spinner;
