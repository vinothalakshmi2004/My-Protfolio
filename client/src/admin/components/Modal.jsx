/**
 * Modal — accessible dialog rendered in a portal.
 *  - size "full" (default for content): full-screen on mobile, centred card on sm+
 *  - size "sm" (confirmations): compact centred card at every width
 * Escape / backdrop click close it; focus is trapped inside; page scroll is locked.
 */
import { useRef } from 'react';
import { createPortal } from 'react-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { FiX } from 'react-icons/fi';
import { useBodyScrollLock, useFocusTrap } from '../hooks/useOverlay';
import Button from './Button';

const WIDTHS = { sm: 'sm:max-w-md', md: 'sm:max-w-xl', lg: 'sm:max-w-3xl', xl: 'sm:max-w-5xl' };

export const Modal = ({ open, onClose, title, description, size = 'md', compact = false, children, footer, closeOnBackdrop = true }) => {
  const panelRef = useRef(null);
  useBodyScrollLock(open);
  useFocusTrap(panelRef, open, onClose);

  return createPortal(
    <AnimatePresence>
      {open && (
        <div className="fixed inset-0 z-[60] flex items-stretch justify-center sm:items-center sm:p-6">
          <motion.div
            className="absolute inset-0 bg-slate-950/60 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={closeOnBackdrop ? onClose : undefined}
            aria-hidden="true"
          />
          <motion.div
            ref={panelRef}
            role="dialog"
            aria-modal="true"
            aria-labelledby={title ? 'modal-title' : undefined}
            tabIndex={-1}
            initial={{ opacity: 0, y: 24, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 24, scale: 0.98 }}
            transition={{ duration: 0.18 }}
            // compact: small card centred at every width (confirm dialogs)
            // default: full-screen on mobile (h-dvh), centred rounded card with max height on sm+
            className={`relative flex w-full flex-col bg-white shadow-2xl focus:outline-none dark:bg-slate-900 ${
              compact
                ? 'mx-4 my-auto max-w-md rounded-2xl'
                : `h-dvh sm:h-auto sm:max-h-[90vh] sm:rounded-2xl ${WIDTHS[size]}`
            }`}
          >
            {title && (
              <div className="flex items-start justify-between gap-4 border-b border-slate-100 px-4 py-4 dark:border-slate-800 sm:px-6">
                <div className="min-w-0">
                  <h2 id="modal-title" className="text-lg font-semibold text-slate-900 dark:text-white">
                    {title}
                  </h2>
                  {description && <p className="mt-0.5 text-sm text-slate-500 dark:text-slate-400">{description}</p>}
                </div>
                <Button variant="ghost" size="icon" onClick={onClose} aria-label="Close dialog" className="-mr-2 -mt-1">
                  <FiX className="h-5 w-5" />
                </Button>
              </div>
            )}
            {/* Body scrolls inside the dialog, header/footer stay put */}
            <div className="min-h-0 flex-1 overflow-y-auto px-4 py-5 sm:px-6">{children}</div>
            {footer && (
              <div className="flex flex-col-reverse gap-2 border-t border-slate-100 px-4 py-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] dark:border-slate-800 sm:flex-row sm:justify-end sm:px-6">
                {footer}
              </div>
            )}
          </motion.div>
        </div>
      )}
    </AnimatePresence>,
    document.body
  );
};

export default Modal;
