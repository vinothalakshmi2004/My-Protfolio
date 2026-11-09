/**
 * AdminForm — shared shell for every admin form (react-hook-form + zod).
 *
 * Handles the boring parts consistently:
 *  - submit -> toPayload(values) -> onSave(payload); Save disabled + spinner while saving
 *    or while an upload is still running
 *  - server validation errors ({ field, message }) are mapped onto the matching inputs
 *  - file bookkeeping via usePendingUploads (unsaved uploads deleted on cancel / replace)
 *  - dirty tracking: reports `onDirtyChange`, asks before discarding, and (page variant)
 *    blocks navigation with an "unsaved changes" warning
 *
 * Layouts:
 *  - variant="drawer": scrollable body + footer pinned to the bottom of the FormDrawer
 *  - variant="page":   fields + a sticky Save/Cancel bar at the bottom of the viewport
 * Field grid: 1 column on mobile, 2 columns from md+ (use className="md:col-span-2" for wide fields).
 */
import { useEffect, useImperativeHandle } from 'react';
import { FormProvider } from 'react-hook-form';
import toast from 'react-hot-toast';
import { FiCheck } from 'react-icons/fi';
import { getErrorMessage, getFieldErrors } from '../../lib/apiClient';
import { useConfirm } from '../context/ConfirmContext';
import { PendingUploadsContext, usePendingUploads, collectFileIds } from '../hooks/usePendingUploads';
import { useUnsavedChanges } from '../hooks/useUnsavedChanges';
import Button from './Button';

/** Focuses + scrolls to the first invalid field after a failed submit. */
const focusFirstError = (errors) => {
  const first = Object.keys(errors)[0];
  if (!first) return;
  const el = document.querySelector(`[name="${first}"], #${CSS.escape(first)}`);
  el?.focus?.({ preventScroll: true });
  el?.scrollIntoView?.({ behavior: 'smooth', block: 'center' });
};

/** Navigation guard lives in its own component so only "page" forms register a router blocker. */
const NavigationGuard = ({ when }) => {
  useUnsavedChanges(when);
  return null;
};

export const AdminForm = ({
  methods,
  onSave,
  toPayload = (v) => v,
  onSaved,
  onCancel,
  onDirtyChange,
  controlRef,
  variant = 'drawer',
  submitLabel = 'Save changes',
  successMessage = 'Saved successfully',
  guardNavigation = true,
  resetAfterSave = true,
  children,
  grid = true,
  footerExtra,
}) => {
  const confirm = useConfirm();
  const uploads = usePendingUploads();
  const { handleSubmit, formState, setError, reset } = methods;
  const isDirty = formState.isDirty || uploads.hasPending;
  const busy = formState.isSubmitting || uploads.isUploading;

  useEffect(() => onDirtyChange?.(isDirty), [isDirty, onDirtyChange]);

  const submit = handleSubmit(
    async (values) => {
      const payload = toPayload(values);
      try {
        const saved = await onSave(payload);
        await uploads.finalize(collectFileIds(payload));
        if (resetAfterSave) reset(values); // current values become the new "clean" state
        toast.success(successMessage);
        onSaved?.(saved, values);
      } catch (error) {
        const fieldErrors = getFieldErrors(error);
        Object.entries(fieldErrors).forEach(([field, message]) => {
          if (field in values || field.includes('.')) setError(field, { type: 'server', message });
        });
        toast.error(getErrorMessage(error, 'Could not save. Please try again.'));
      }
    },
    (errors) => {
      toast.error('Please fix the highlighted fields.');
      focusFirstError(errors);
    }
  );

  /** Cancel: confirm if dirty, delete unsaved uploads, restore the original values. */
  const cancel = async () => {
    if (isDirty) {
      const discard = await confirm({
        title: 'Discard changes?',
        message: 'Your unsaved changes (including newly uploaded files) will be lost.',
        confirmLabel: 'Discard',
        cancelLabel: 'Keep editing',
      });
      if (!discard) return;
    }
    await uploads.discardAll();
    reset();
    onCancel?.();
  };

  // Lets the parent (e.g. FormDrawer's X button) trigger the same cancel flow
  useImperativeHandle(controlRef, () => ({ cancel }), [cancel]);

  const fields = grid ? <div className="grid grid-cols-1 gap-x-5 gap-y-5 md:grid-cols-2">{children}</div> : children;

  return (
    <PendingUploadsContext.Provider value={uploads}>
      <FormProvider {...methods}>
        {variant === 'drawer' ? (
          <form onSubmit={submit} noValidate className="flex min-h-0 flex-1 flex-col">
            <div className="min-h-0 flex-1 overflow-y-auto px-4 py-5 sm:px-6">{fields}</div>
            {/* Footer pinned to the bottom of the drawer — always reachable on mobile */}
            <div className="flex flex-col-reverse gap-2 border-t border-slate-200 bg-white px-4 py-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] dark:border-slate-800 dark:bg-slate-900 sm:flex-row sm:items-center sm:justify-end sm:px-6">
              {footerExtra && <div className="sm:mr-auto">{footerExtra}</div>}
              <Button variant="secondary" onClick={cancel} disabled={formState.isSubmitting} className="w-full sm:w-auto">
                Cancel
              </Button>
              <Button type="submit" loading={formState.isSubmitting} disabled={busy} className="w-full sm:w-auto">
                {!formState.isSubmitting && <FiCheck className="h-4 w-4" />}
                {uploads.isUploading ? 'Uploading…' : submitLabel}
              </Button>
            </div>
          </form>
        ) : (
          <form onSubmit={submit} noValidate>
            {guardNavigation && <NavigationGuard when={isDirty && !formState.isSubmitting} />}
            {fields}
            {/* Sticky action bar: stuck to the bottom of the viewport on every screen size;
                full-bleed on mobile, aligned card on sm+ */}
            <div className="sticky bottom-0 z-20 -mx-4 mt-6 border-t border-slate-200 bg-white/95 px-4 py-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] backdrop-blur dark:border-slate-800 dark:bg-slate-900/95 sm:mx-0 sm:rounded-xl sm:border sm:shadow-lg">
              <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                <p className={`text-sm ${isDirty ? 'font-medium text-amber-600 dark:text-amber-400' : 'text-slate-500 dark:text-slate-400'}`}>
                  {isDirty ? '● Unsaved changes' : 'All changes saved'}
                </p>
                <div className="flex flex-col-reverse gap-2 sm:flex-row">
                  {footerExtra}
                  <Button variant="secondary" onClick={cancel} disabled={!isDirty || formState.isSubmitting} className="w-full sm:w-auto">
                    Discard
                  </Button>
                  <Button type="submit" loading={formState.isSubmitting} disabled={busy || !isDirty} className="w-full sm:w-auto">
                    {!formState.isSubmitting && <FiCheck className="h-4 w-4" />}
                    {uploads.isUploading ? 'Uploading…' : submitLabel}
                  </Button>
                </div>
              </div>
            </div>
          </form>
        )}
      </FormProvider>
    </PendingUploadsContext.Provider>
  );
};

export default AdminForm;
