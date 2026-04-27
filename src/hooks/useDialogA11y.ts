import { useEffect, useRef } from 'react';

/**
 * useDialogA11y — minimal a11y wiring for full-screen tool dialogs.
 *
 * The 6 emotional-tool surfaces (Drei-Danke, Löwen-Pose, Stein-und-
 * Gummi, Kraftwort, Gedanken-Wolken, Hörmoment) all open as full-
 * screen modals over the main app. Each was missing the standard
 * dialog accessibility wiring; rather than introduce a wrapper
 * component (which would force a layout refactor), this hook bolts
 * the behaviour onto whatever outer element the tool already renders.
 *
 * Caller adds these attrs to the outer element manually:
 *   role="dialog"
 *   aria-modal="true"
 *   aria-label={...}
 *
 * The hook handles:
 *   1. ESC key dismisses the dialog
 *   2. On mount, focus moves to the first focusable element (or the
 *      dialog root if `containerRef` is supplied) so the kid lands
 *      somewhere predictable for keyboard / screen-reader users
 *   3. On unmount, focus returns to whatever element opened the dialog
 *
 * Usage:
 *   const dialogRef = useRef<HTMLDivElement>(null);
 *   useDialogA11y(onClose, { containerRef: dialogRef });
 *   return (
 *     <div
 *       ref={dialogRef}
 *       role="dialog" aria-modal="true" aria-label="Kraftwort"
 *       tabIndex={-1}
 *       ...
 *     />
 *   );
 *
 * Why no full focus-trap: real focus traps need to identify every
 * focusable descendant, intercept Tab + Shift-Tab, and handle dynamic
 * content (phase changes in our state machines). For a kid product
 * where the only inputs are big tap-buttons and ESC, this minimal
 * wiring covers the realistic usage. If we later add multi-page
 * forms or text inputs to a tool, upgrade to a full trap.
 */

interface DialogA11yOpts {
  /** If supplied, the hook focuses this element on mount instead of
   *  searching for the first focusable child. Use for tools where
   *  the natural first target is the wrapper itself (close button
   *  comes later in tab order). */
  containerRef?: React.RefObject<HTMLElement | null>;
  /** Disable the ESC handler — useful if the tool has its own */
  noEscape?: boolean;
}

export function useDialogA11y(
  onClose: (() => void) | undefined,
  opts: DialogA11yOpts = {},
): void {
  const { containerRef, noEscape } = opts;
  // Store the element that had focus when the dialog opened so we
  // can return focus to it when the dialog closes.
  const previouslyFocusedRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    previouslyFocusedRef.current = document.activeElement as HTMLElement | null;

    // Move focus into the dialog. Prefer the explicit container; fall
    // back to the first focusable descendant of body that's inside the
    // current dialog stacking context (best-effort).
    const target = containerRef?.current
      ?? (document.querySelector('[role="dialog"][aria-modal="true"]') as HTMLElement | null);
    if (target) {
      // Make container focusable if it isn't already
      if (target.getAttribute('tabindex') === null) target.setAttribute('tabindex', '-1');
      try {
        target.focus({ preventScroll: true });
      } catch {
        target.focus();
      }
    }

    return () => {
      // Return focus to whoever opened us. Guard against the previous
      // element being detached (e.g. parent surface unmounted while
      // dialog was open) so we don't throw.
      const prev = previouslyFocusedRef.current;
      if (prev && document.contains(prev) && typeof prev.focus === 'function') {
        try {
          prev.focus({ preventScroll: true });
        } catch {
          /* no-op */
        }
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps -- mount/unmount only
  }, []);

  useEffect(() => {
    if (noEscape) return undefined;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && typeof onClose === 'function') {
        e.stopPropagation();
        onClose();
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose, noEscape]);
}

export default useDialogA11y;
