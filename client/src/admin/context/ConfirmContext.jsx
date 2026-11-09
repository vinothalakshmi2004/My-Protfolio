/**
 * ConfirmDialog + useConfirm() — promise-based confirmation modal.
 *
 *   const confirm = useConfirm();
 *   if (await confirm({ title: 'Delete project?', message: '...', confirmLabel: 'Delete', tone: 'danger' })) { ... }
 *
 * One dialog instance is mounted by <ConfirmProvider> (in AdminRoot) and reused everywhere.
 */
import { createContext, useCallback, useContext, useRef, useState } from 'react';
import { FiAlertTriangle, FiHelpCircle } from 'react-icons/fi';
import Modal from '../components/Modal';
import Button from '../components/Button';

const ConfirmContext = createContext(null);

/** The dialog itself (also usable standalone). */
export const ConfirmDialog = ({ open, title, message, confirmLabel = 'Confirm', cancelLabel = 'Cancel', tone = 'danger', onConfirm, onCancel }) => {
  const Icon = tone === 'danger' ? FiAlertTriangle : FiHelpCircle;
  return (
    <Modal open={open} onClose={onCancel} compact>
      {/* Mobile: icon above text; sm+: icon beside text */}
      <div className="flex flex-col items-center gap-4 text-center sm:flex-row sm:items-start sm:text-left">
        <span
          className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-full ${
            tone === 'danger' ? 'bg-rose-100 text-rose-600 dark:bg-rose-500/15 dark:text-rose-400' : 'bg-primary-100 text-primary-600 dark:bg-primary-500/15 dark:text-primary-300'
          }`}
        >
          <Icon className="h-5 w-5" aria-hidden="true" />
        </span>
        <div className="min-w-0">
          <h2 className="text-base font-semibold text-slate-900 dark:text-white">{title}</h2>
          {message && <div className="mt-1.5 text-sm text-slate-600 dark:text-slate-300">{message}</div>}
        </div>
      </div>
      {/* Mobile: full-width stacked buttons (primary on top); sm+: inline, right-aligned */}
      <div className="mt-6 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
        <Button variant="secondary" onClick={onCancel} className="w-full sm:w-auto">
          {cancelLabel}
        </Button>
        <Button variant={tone === 'danger' ? 'danger' : 'primary'} onClick={onConfirm} className="w-full sm:w-auto" data-autofocus>
          {confirmLabel}
        </Button>
      </div>
    </Modal>
  );
};

export const ConfirmProvider = ({ children }) => {
  const [state, setState] = useState({ open: false, options: {} });
  const resolver = useRef(null);

  const confirm = useCallback(
    (options = {}) =>
      new Promise((resolve) => {
        resolver.current = resolve;
        setState({ open: true, options });
      }),
    []
  );

  const settle = (value) => {
    setState((s) => ({ ...s, open: false }));
    resolver.current?.(value);
    resolver.current = null;
  };

  return (
    <ConfirmContext.Provider value={confirm}>
      {children}
      <ConfirmDialog
        open={state.open}
        title={state.options.title || 'Are you sure?'}
        message={state.options.message}
        confirmLabel={state.options.confirmLabel}
        cancelLabel={state.options.cancelLabel}
        tone={state.options.tone || 'danger'}
        onConfirm={() => settle(true)}
        onCancel={() => settle(false)}
      />
    </ConfirmContext.Provider>
  );
};

/** Hook returning confirm(options) => Promise<boolean>. */
export const useConfirm = () => {
  const ctx = useContext(ConfirmContext);
  if (!ctx) throw new Error('useConfirm must be used inside <ConfirmProvider>');
  return ctx;
};
