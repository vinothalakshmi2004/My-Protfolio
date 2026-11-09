/**
 * FormDrawer — slide-in panel used for "Add" / "Edit" forms.
 *  - Mobile & tablet portrait (< md): full-screen sheet
 *  - md+: right-hand drawer, max 42rem wide, page dimmed behind it
 * The child (usually <AdminForm variant="drawer">) owns the scrollable body and the
 * Save/Cancel footer, which stays pinned to the bottom (sticky actions on mobile).
 * `onRequestClose` is called for X / Escape / backdrop so the parent can confirm
 * discarding unsaved changes.
 */
import { useRef } from 'react';
import { createPortal } from 'react-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { FiX } from 'react-icons/fi';
import { useBodyScrollLock, useFocusTrap } from '../hooks/useOverlay';
import Button from './Button';

export const FormDrawer = ({ open, onRequestClose, title, description, children }) => {
  const panelRef = useRef(null);
  useBodyScrollLock(open);
  useFocusTrap(panelRef, open, onRequestClose);

  return createPortal(
    <AnimatePresence>
      {open && (
        <div className="fixed inset-0 z-50 flex justify-end">
          <motion.div
            className="absolute inset-0 bg-slate-950/50 backdrop-blur-[2px]"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onRequestClose}
            aria-hidden="true"
          />
          <motion.aside
            ref={panelRef}
            role="dialog"
            aria-modal="true"
            aria-labelledby="drawer-title"
            tabIndex={-1}
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'tween', duration: 0.22, ease: 'easeOut' }}
            // Full-screen below md (w-full, h-dvh), fixed-width drawer on md+
            className="relative flex h-dvh w-full flex-col bg-white shadow-2xl focus:outline-none dark:bg-slate-900 md:max-w-2xl md:border-l md:border-slate-200 md:dark:border-slate-800"
          >
            <header className="flex items-start justify-between gap-4 border-b border-slate-100 px-4 py-4 pt-[max(1rem,env(safe-area-inset-top))] dark:border-slate-800 sm:px-6">
              <div className="min-w-0">
                <h2 id="drawer-title" className="truncate text-lg font-semibold text-slate-900 dark:text-white">
                  {title}
                </h2>
                {description && <p className="mt-0.5 text-sm text-slate-500 dark:text-slate-400">{description}</p>}
              </div>
              <Button variant="ghost" size="icon" onClick={onRequestClose} aria-label="Close panel" className="-mr-2">
                <FiX className="h-5 w-5" />
              </Button>
            </header>
            {children}
          </motion.aside>
        </div>
      )}
    </AnimatePresence>,
    document.body
  );
};

export default FormDrawer;
