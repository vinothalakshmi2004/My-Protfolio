/**
 * Full-height centred spinner — Suspense fallback while a lazy route chunk loads.
 */
export const PageSpinner = ({ label = 'Loading…', fullScreen = true }) => (
  <div
    role="status"
    aria-live="polite"
    className={`flex w-full items-center justify-center ${fullScreen ? 'min-h-screen min-h-dvh' : 'min-h-[40vh]'}`}
  >
    <span className="h-9 w-9 animate-spin rounded-full border-4 border-primary-500/25 border-t-primary-500" />
    <span className="sr-only">{label}</span>
  </div>
);

export default PageSpinner;
