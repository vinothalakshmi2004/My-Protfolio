/** UploadProgress — progress bar with percentage and a cancel button (used by all uploaders). */
import { FiX } from 'react-icons/fi';

export const UploadProgress = ({ progress, onCancel, label = 'Uploading…' }) => (
  <div className="w-full" role="status" aria-live="polite">
    <div className="mb-1.5 flex items-center justify-between gap-2 text-xs font-medium text-slate-600 dark:text-slate-300">
      <span>
        {label} {progress}%
      </span>
      {onCancel && (
        <button
          type="button"
          onClick={onCancel}
          className="inline-flex min-h-9 items-center gap-1 rounded-md px-2 text-slate-500 hover:bg-slate-100 hover:text-rose-600 dark:hover:bg-slate-800"
        >
          <FiX className="h-3.5 w-3.5" /> Cancel
        </button>
      )}
    </div>
    <div className="h-2 w-full overflow-hidden rounded-full bg-slate-200 dark:bg-slate-700">
      <div className="h-full rounded-full bg-primary-600 transition-[width] duration-200" style={{ width: `${progress}%` }} />
    </div>
  </div>
);

export default UploadProgress;
