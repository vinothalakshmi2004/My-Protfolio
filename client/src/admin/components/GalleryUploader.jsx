/**
 * GalleryUploader — multiple image uploads with drag-to-reorder thumbnails.
 *
 *  value:    [{ url, fileId }, ...]
 *  onChange: receives the new array
 *  max:      maximum number of images (server allows 20)
 *
 * Selecting several files uploads them one by one with a progress bar.
 * Thumbnail grid: 2 cols on phones, 3 on sm, 4 on md+.
 */
import { useRef, useState } from 'react';
import { FiPlus, FiTrash2 } from 'react-icons/fi';
import { fileUrl } from '../../lib/apiClient';
import { IMAGE_RULES, useFileUpload } from '../hooks/useFileUpload';
import UploadProgress from './UploadProgress';
import { SortableList, DragHandle } from './SortableList';

const RULES = [IMAGE_RULES];

export const GalleryUploader = ({ value = [], onChange, max = 12, disabled = false }) => {
  const inputRef = useRef(null);
  const [queue, setQueue] = useState({ current: 0, total: 0 });
  const [dragOver, setDragOver] = useState(false);
  const { upload, cancel, release, progress, uploading, error, setError } = useFileUpload(RULES);
  const remaining = max - value.length;

  const handleFiles = async (fileList) => {
    const files = [...(fileList || [])];
    if (!files.length || disabled) return;
    if (files.length > remaining) {
      setError(`You can add ${remaining} more image${remaining === 1 ? '' : 's'} (max ${max}).`);
    }
    const accepted = files.slice(0, Math.max(0, remaining));
    let next = [...value];
    for (let i = 0; i < accepted.length; i += 1) {
      setQueue({ current: i + 1, total: accepted.length });
      const result = await upload(accepted[i]);
      if (result) {
        next = [...next, { url: result.url, fileId: result.fileId }];
        onChange(next);
      }
    }
    setQueue({ current: 0, total: 0 });
  };

  const removeAt = (index) => {
    const item = value[index];
    if (item?.fileId) release(item.fileId);
    onChange(value.filter((_, i) => i !== index));
  };

  return (
    <div className="w-full space-y-3">
      <input
        ref={inputRef}
        type="file"
        multiple
        accept={IMAGE_RULES.accept}
        className="sr-only"
        tabIndex={-1}
        onChange={(e) => {
          handleFiles(e.target.files);
          e.target.value = '';
        }}
      />

      {value.length > 0 && (
        <SortableList
          items={value}
          getId={(item) => item.fileId || item.url}
          onReorder={onChange}
          layout="grid"
          disabled={disabled || uploading}
          // Mobile: 2 thumbnails per row, sm: 3, md+: 4
          className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4"
          renderItem={(item, index, handle) => (
            <div className="group relative aspect-video overflow-hidden rounded-lg border border-slate-200 bg-slate-100 dark:border-slate-700 dark:bg-slate-800">
              <img src={fileUrl(item.url)} alt={`Gallery image ${index + 1}`} loading="lazy" width="320" height="180" className="h-full w-full object-cover" />
              {index === 0 && (
                <span className="absolute left-1.5 top-1.5 rounded bg-slate-900/70 px-1.5 py-0.5 text-[10px] font-semibold uppercase text-white">First</span>
              )}
              {/* Controls are always visible (touch devices have no hover) */}
              <div className="absolute inset-x-0 bottom-0 flex items-center justify-between bg-gradient-to-t from-slate-900/70 to-transparent p-1">
                <DragHandle handle={handle} disabled={disabled || uploading} className="!h-9 !w-9 text-white hover:!bg-white/20 hover:!text-white" />
                <button
                  type="button"
                  onClick={() => removeAt(index)}
                  disabled={disabled}
                  aria-label={`Remove image ${index + 1}`}
                  className="flex h-9 w-9 items-center justify-center rounded-lg text-white hover:bg-rose-600 focus:outline-none focus-visible:ring-2 focus-visible:ring-white"
                >
                  <FiTrash2 className="h-4 w-4" />
                </button>
              </div>
            </div>
          )}
        />
      )}

      {uploading ? (
        <div className="rounded-xl border border-slate-200 p-4 dark:border-slate-700">
          <UploadProgress progress={progress} onCancel={cancel} label={`Uploading ${queue.current} of ${queue.total}…`} />
        </div>
      ) : (
        remaining > 0 && (
          <button
            type="button"
            disabled={disabled}
            onClick={() => inputRef.current?.click()}
            onDragOver={(e) => {
              e.preventDefault();
              setDragOver(true);
            }}
            onDragLeave={() => setDragOver(false)}
            onDrop={(e) => {
              e.preventDefault();
              setDragOver(false);
              handleFiles(e.dataTransfer.files);
            }}
            className={`flex w-full flex-col items-center justify-center gap-1 rounded-xl border-2 border-dashed px-4 py-6 text-center transition focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 ${
              dragOver ? 'border-primary-500 bg-primary-50 dark:bg-primary-500/10' : 'border-slate-300 hover:border-primary-400 hover:bg-slate-50 dark:border-slate-700 dark:hover:bg-slate-800/50'
            }`}
          >
            <FiPlus className="h-6 w-6 text-primary-500" aria-hidden="true" />
            <span className="text-sm font-medium text-slate-700 dark:text-slate-200">Add gallery images</span>
            <span className="text-xs text-slate-500 dark:text-slate-400">
              Select several at once · {remaining} slot{remaining === 1 ? '' : 's'} left · {IMAGE_RULES.hint}
            </span>
          </button>
        )
      )}

      {error && (
        <p role="alert" className="text-xs font-medium text-rose-600 dark:text-rose-400">
          {error}
        </p>
      )}
    </div>
  );
};

export default GalleryUploader;
