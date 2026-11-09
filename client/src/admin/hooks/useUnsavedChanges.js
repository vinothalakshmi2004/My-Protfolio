/**
 * useUnsavedChanges(when) — warns before losing unsaved edits.
 *  - In-app navigation (sidebar links, back button): React Router's useBlocker
 *    + our confirm dialog ("Leave without saving?")
 *  - Closing/reloading the tab: the browser's native beforeunload prompt
 * Use it once per page (React Router supports a single active blocker).
 */
import { useEffect, useRef } from 'react';
import { useBlocker } from 'react-router-dom';
import { useConfirm } from '../context/ConfirmContext';

export const useUnsavedChanges = (when) => {
  const confirm = useConfirm();
  const blocker = useBlocker(({ currentLocation, nextLocation }) => when && currentLocation.pathname !== nextLocation.pathname);
  const blockerRef = useRef(blocker);
  blockerRef.current = blocker;

  // Ask once each time navigation gets blocked
  useEffect(() => {
    if (blocker.state !== 'blocked') return;
    confirm({
      title: 'Leave without saving?',
      message: 'You have unsaved changes on this page. They will be lost if you leave.',
      confirmLabel: 'Leave page',
      cancelLabel: 'Stay',
    }).then((leave) => (leave ? blockerRef.current.proceed?.() : blockerRef.current.reset?.()));
  }, [blocker.state, confirm]);

  useEffect(() => {
    if (!when) return undefined;
    const onBeforeUnload = (event) => {
      event.preventDefault();
      event.returnValue = ''; // required for Chrome to show the prompt
    };
    window.addEventListener('beforeunload', onBeforeUnload);
    return () => window.removeEventListener('beforeunload', onBeforeUnload);
  }, [when]);
};

export default useUnsavedChanges;
