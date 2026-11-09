/**
 * ImageUploader — drag & drop / click-to-pick single image upload with preview.
 *
 *  value:    { url, fileId } (empty strings when no image)
 *  onChange: receives the new { url, fileId } after upload, or { url: '', fileId: '' } on remove
 *  aspect:   'square' | 'video' | 'wide' — shape of the preview box
 *
 * Flow: validate -> local preview while uploading (progress bar) -> POST /api/upload
 * -> store the returned { url, fileId } in the form. Replacing or removing an image
 * that hasn't been saved yet deletes it from GridFS straight away.
 */
import { useEffect, useRef, useState } from 'react';
import { FiImage, FiRefreshCw, FiTrash2, FiUploadCloud } from 'react-icons/fi';
import { fileUrl } from '../../lib/apiClient';
import { IMAGE_RULES, useFileUpload } from '../hooks/useFileUpload';
import UploadProgress from './UploadProgress';
import Button from './Button';

const ASPECTS = { square: 'aspect-square', video: 'aspect-video', wide: 'aspect-[1200/630]' };
const RULES = [IMAGE_RULES];

export const ImageUploader = ({ value, onChange, aspect = 'video', disabled = false, label = 'image', className = '' }) => {
  const inputRef = useRef(null);
  const [dragOver, setDragOver] = useState(false);
  const [localPreview, setLocalPreview] = useState('');
  const [broken, setBroken] = useState(false);
  const { upload, cancel, release, progress, uploading, error } = useFileUpload(RULES);

  const hasImage = Boolean(value?.url);
  const preview = localPreview || (hasImage ? fileUrl(value.url) : '');

  useEffect(() => setBroken(false), [preview]);
  useEffect(() => () => localPreview && URL.revokeObjectURL(localPreview), [localPreview]);

  const handleFile = async (file) => {
    if (!file || disabled) return;
    const objectUrl = URL.createObjectURL(file);
    setLocalPreview(objectUrl);
    const result = await upload(file);
    setLocalPreview('');
    if (result) {
      if (value?.fileId) release(value.fileId); // previous unsaved upload is no longer needed
      onChange({ url: result.url, fileId: result.fileId });
    }
  };

  const remove = () => {
    if (value?.fileId) release(value.fileId);
    onChange({ url: '', fileId: '' });
  };

  const openPicker = () => inputRef.current?.click();

  const dropHandlers = {
    onDragOver: (e) => {
      e.preventDefault();
      if (!disabled) setDragOver(true);
    },
    onDragLeave: () => setDragOver(false),
    onDrop: (e) => {
      e.preventDefault();
      setDragOver(false);
      handleFile(e.dataTransfer.files?.[0]);
    },
  };

  return (
    // Preview shrinks with its container: full width on phones, capped at max-w-md on larger screens
    <div className={`w-full max-w-md ${className}`}>
      <input
        ref={inputRef}
        type="file"
        accept={IMAGE_RULES.accept}
        className="sr-only"
        tabIndex={-1}
        onChange={(e) => {
          handleFile(e.target.files?.[0]);
          e.target.value = '';
        }}
      />

      {preview ? (
        <div className="space-y-3">
          <div
            {...dropHandlers}
            className={`relative w-full overflow-hidden rounded-xl border bg-slate-100 dark:bg-slate-800 ${ASPECTS[aspect]} ${
              dragOver ? 'border-primary-500 ring-2 ring-primary-500/30' : 'border-slate-200 dark:border-slate-700'
            }`}
          >
            {broken ? (
              <div className="flex h-full w-full flex-col items-center justify-center gap-1 text-slate-400">
                <FiImage className="h-8 w-8" />
                <span className="text-xs">Preview unavailable</span>
              </div>
            ) : (
              <img src={preview} alt={`Selected ${label}`} className="h-full w-full object-cover" onError={() => setBroken(true)} />
            )}
            {uploading && (
              <div className="absolute inset-x-0 bottom-0 bg-white/90 p-3 backdrop-blur dark:bg-slate-900/90">
                <UploadProgress progress={progress} onCancel={cancel} />
              </div>
            )}
          </div>
          {!uploading && (
            // Buttons always visible (no hover-only controls on touch devices); wrap on narrow screens
            <div className="flex flex-wrap gap-2">
              <Button variant="secondary" size="sm" onClick={openPicker} disabled={disabled} className="min-h-11 lg:min-h-9">
                <FiRefreshCw className="h-4 w-4" /> Replace
              </Button>
              <Button variant="danger-ghost" size="sm" onClick={remove} disabled={disabled} className="min-h-11 lg:min-h-9">
                <FiTrash2 className="h-4 w-4" /> Remove
              </Button>
            </div>
          )}
        </div>
      ) : (
        <button
          type="button"
          onClick={openPicker}
          disabled={disabled}
          {...dropHandlers}
          className={`flex w-full flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed px-4 py-8 text-center transition focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 disabled:cursor-not-allowed disabled:opacity-60 ${
            dragOver
              ? 'border-primary-500 bg-primary-50 dark:bg-primary-500/10'
              : 'border-slate-300 hover:border-primary-400 hover:bg-slate-50 dark:border-slate-700 dark:hover:bg-slate-800/50'
          }`}
        >
          <FiUploadCloud className="h-8 w-8 text-primary-500" aria-hidden="true" />
          <span className="text-sm font-medium text-slate-700 dark:text-slate-200">
            <span className="text-primary-600 dark:text-primary-400">Click to upload</span>
            <span className="hidden sm:inline"> or drag & drop</span>
          </span>
          <span className="text-xs text-slate-500 dark:text-slate-400">{IMAGE_RULES.hint}</span>
        </button>
      )}

      {error && (
        <p role="alert" className="mt-2 text-xs font-medium text-rose-600 dark:text-rose-400">
          {error}
        </p>
      )}
    </div>
  );
};

export default ImageUploader;
