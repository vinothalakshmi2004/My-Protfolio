/**
 * usePendingUploads — prevents orphan files in GridFS from the browser side.
 *
 * Files are uploaded the moment the admin picks them (so a preview + fileId exist),
 * but they only become "owned" once the form is saved. This hook remembers every
 * upload made during a form session:
 *   - Save   -> finalize(savedFileIds): deletes uploads that didn't end up in the saved data
 *               (e.g. the admin replaced an image twice before saving)
 *   - Cancel -> discardAll(): deletes every upload from this session
 *   - Remove a not-yet-saved upload -> removeNow(fileId) deletes it immediately
 * Files that were already saved are never deleted here — the server cleans those up
 * when the record is updated/deleted. `npm run cleanup:files` catches anything else.
 *
 * Uploaders read it through PendingUploadsContext, so forms don't need to wire props.
 */
import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
import { uploadApi } from '../../services/adminApi';

export const PendingUploadsContext = createContext(null);

/** Optional access for uploader components (null outside a form). */
export const usePendingUploadsContext = () => useContext(PendingUploadsContext);

/** Recursively collects `fileId` values from form data (mirrors server/utils/fileRefs.js). */
export const collectFileIds = (value, out = new Set()) => {
  if (Array.isArray(value)) value.forEach((v) => collectFileIds(v, out));
  else if (value && typeof value === 'object') {
    Object.entries(value).forEach(([key, v]) => {
      if (key === 'fileId' && typeof v === 'string' && v) out.add(v);
      else if (v && typeof v === 'object') collectFileIds(v, out);
    });
  }
  return out;
};

export const usePendingUploads = () => {
  const pending = useRef(new Set());
  const [pendingCount, setPendingCount] = useState(0);
  const [uploadingCount, setUploadingCount] = useState(0);

  const sync = () => setPendingCount(pending.current.size);

  /** Remember a freshly uploaded (unsaved) file. */
  const track = useCallback((fileId) => {
    if (!fileId) return;
    pending.current.add(fileId);
    sync();
  }, []);

  /** True if the file was uploaded in this session and not saved yet. */
  const isPending = useCallback((fileId) => pending.current.has(fileId), []);

  /** Delete an unsaved upload right away (no-op for already-saved files). */
  const removeNow = useCallback(async (fileId) => {
    if (!fileId || !pending.current.has(fileId)) return;
    pending.current.delete(fileId);
    sync();
    await uploadApi.remove(fileId).catch(() => {});
  }, []);

  /** After a successful save: delete session uploads that aren't referenced by the saved data. */
  const finalize = useCallback(async (keepIds = new Set()) => {
    const toDelete = [...pending.current].filter((id) => !keepIds.has(id));
    pending.current.clear();
    sync();
    await Promise.allSettled(toDelete.map((id) => uploadApi.remove(id)));
  }, []);

  /** On cancel / leaving the form: delete every unsaved upload. */
  const discardAll = useCallback(() => finalize(new Set()), [finalize]);

  /** Uploaders report in-flight uploads so Save can be disabled until they finish. */
  const beginUpload = useCallback(() => setUploadingCount((n) => n + 1), []);
  const endUpload = useCallback(() => setUploadingCount((n) => Math.max(0, n - 1)), []);

  // Leaving the page with unsaved uploads (after confirming) -> clean them up
  useEffect(() => () => void discardAll(), [discardAll]);

  return useMemo(
    () => ({
      track,
      isPending,
      removeNow,
      finalize,
      discardAll,
      beginUpload,
      endUpload,
      hasPending: pendingCount > 0,
      isUploading: uploadingCount > 0,
    }),
    [track, isPending, removeNow, finalize, discardAll, beginUpload, endUpload, pendingCount, uploadingCount]
  );
};
