/**
 * Shared behaviour for modals and drawers:
 *  - useBodyScrollLock(active): stops the page behind an overlay from scrolling
 *    (reference-counted so a confirm dialog on top of a drawer works)
 *  - useFocusTrap(ref, active, onEscape): keeps Tab focus inside the overlay,
 *    focuses the first field on open, closes on Escape, and restores focus on close
 */
import { useEffect } from 'react';

let lockCount = 0;
let savedOverflow = '';

export const useBodyScrollLock = (active) => {
  useEffect(() => {
    if (!active) return undefined;
    if (lockCount === 0) {
      savedOverflow = document.body.style.overflow;
      document.body.style.overflow = 'hidden';
    }
    lockCount += 1;
    return () => {
      lockCount -= 1;
      if (lockCount === 0) document.body.style.overflow = savedOverflow;
    };
  }, [active]);
};

const FOCUSABLE =
  'a[href], button:not([disabled]), textarea:not([disabled]), input:not([disabled]):not([type="hidden"]), select:not([disabled]), [tabindex]:not([tabindex="-1"])';

export const useFocusTrap = (ref, active, onEscape) => {
  useEffect(() => {
    if (!active || !ref.current) return undefined;
    const node = ref.current;
    const previouslyFocused = document.activeElement;

    // Focus the element marked [data-autofocus], else the first focusable, else the panel itself
    const initial = node.querySelector('[data-autofocus]') || node.querySelector(FOCUSABLE) || node;
    requestAnimationFrame(() => initial?.focus?.({ preventScroll: true }));

    const onKeyDown = (event) => {
      if (event.key === 'Escape') {
        event.stopPropagation();
        onEscape?.();
        return;
      }
      if (event.key !== 'Tab') return;
      const items = [...node.querySelectorAll(FOCUSABLE)].filter((el) => el.offsetParent !== null);
      if (items.length === 0) return;
      const first = items[0];
      const last = items[items.length - 1];
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    };

    node.addEventListener('keydown', onKeyDown);
    return () => {
      node.removeEventListener('keydown', onKeyDown);
      previouslyFocused?.focus?.({ preventScroll: true });
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [active]);
};
