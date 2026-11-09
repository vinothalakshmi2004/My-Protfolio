/**
 * useFileUpload — shared upload logic for ImageUploader / FileUploader / GalleryUploader.
 *
 *  - Validates type + size in the browser first (same rules as the server)
 *  - POST /api/upload with an axios onUploadProgress progress bar (0–100)
 *  - Cancel support (AbortController)
 *  - Registers the new file with the surrounding form's pending-uploads tracker
 */
import { useCallback, useRef, useState } from 'react';
import { uploadApi } from '../../services/adminApi';
import { getErrorMessage } from '../../lib/apiClient';
import { usePendingUploadsContext } from './usePendingUploads';

export const IMAGE_RULES = {
  kind: 'image',
  extensions: ['.jpg', '.jpeg', '.png', '.webp'],
  mimes: ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'],
  maxMB: 5,
  accept: '.jpg,.jpeg,.png,.webp,image/jpeg,image/png,image/webp',
  hint: 'JPG, PNG or WebP · max 5MB · auto-converted to WebP',
};

export const PDF_RULES = {
  kind: 'pdf',
  extensions: ['.pdf'],
  mimes: ['application/pdf'],
  maxMB: 10,
  accept: '.pdf,application/pdf',
  hint: 'PDF · max 10MB',
};

/** Returns an error message, or null when the file is acceptable for one of `rulesList`. */
export const validateFile = (file, rulesList) => {
  const name = (file?.name || '').toLowerCase();
  const ext = name.includes('.') ? name.slice(name.lastIndexOf('.')) : '';
  const rules = rulesList.find((r) => r.extensions.includes(ext) && r.mimes.includes((file.type || '').toLowerCase()));
  if (!rules) {
    return `Unsupported file type. Allowed: ${rulesList.map((r) => r.extensions.join(', ')).join(' or ')}`;
  }
  if (file.size > rules.maxMB * 1024 * 1024) return `File is too large (max ${rules.maxMB}MB for ${rules.kind === 'pdf' ? 'PDFs' : 'images'}).`;
  return null;
};

export const useFileUpload = (rulesList) => {
  const pending = usePendingUploadsContext();
  const [progress, setProgress] = useState(0);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');
  const controllerRef = useRef(null);

  /** Validates + uploads one file. Resolves to the API result, or null on failure/cancel. */
  const upload = useCallback(
    async (file) => {
      setError('');
      const problem = validateFile(file, rulesList);
      if (problem) {
        setError(problem);
        return null;
      }
      // Restrict the server-side check too when only one kind is allowed (e.g. resume = PDF only)
      const type = rulesList.length === 1 ? rulesList[0].kind : undefined;
      controllerRef.current = new AbortController();
      setUploading(true);
      setProgress(0);
      pending?.beginUpload();
      try {
        const result = await uploadApi.upload(file, { type, onProgress: setProgress, signal: controllerRef.current.signal });
        pending?.track(result.fileId);
        return result;
      } catch (err) {
        setError(err?.code === 'ERR_CANCELED' ? '' : getErrorMessage(err, 'Upload failed'));
        return null;
      } finally {
        setUploading(false);
        pending?.endUpload();
        controllerRef.current = null;
      }
    },
    [rulesList, pending]
  );

  /** Aborts the in-flight upload. */
  const cancel = useCallback(() => controllerRef.current?.abort(), []);

  /** Removes a file reference: deletes it immediately only if it's an unsaved upload. */
  const release = useCallback((fileId) => pending?.removeNow(fileId), [pending]);

  return { upload, cancel, release, progress, uploading, error, setError };
};
