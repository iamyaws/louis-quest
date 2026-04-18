import React from 'react';

/**
 * AlphaBanner — small persistent strip at the top of the app that sets
 * expectations for early testers. Parent-focused message; kids ignore it.
 * Includes a feedback mailto link so testers always know where to send it.
 *
 * Publishes its own height as the CSS variable `--alpha-banner-h` on
 * `document.documentElement` so fixed-top headers can offset themselves below
 * it without overlapping.
 */
export default function AlphaBanner() {
  const ref = React.useRef(null);

  React.useLayoutEffect(() => {
    const el = ref.current;
    if (!el) return;
    const root = document.documentElement;
    const update = () => {
      root.style.setProperty('--alpha-banner-h', `${el.offsetHeight}px`);
    };
    update();
    const ro = new ResizeObserver(update);
    ro.observe(el);
    window.addEventListener('resize', update);
    return () => {
      ro.disconnect();
      window.removeEventListener('resize', update);
      root.style.removeProperty('--alpha-banner-h');
    };
  }, []);

  return (
    <div
      ref={ref}
      role="note"
      className="sticky top-0 inset-x-0 z-[60] bg-[#0F2C2E] text-white/85 border-b border-white/10"
      style={{
        paddingTop: 'env(safe-area-inset-top, 0px)',
        fontFamily: "'Plus Jakarta Sans', system-ui, sans-serif",
      }}
    >
      <div className="max-w-lg mx-auto flex items-center gap-2 px-4 py-1.5 text-[11px] leading-tight">
        <span
          aria-hidden
          className="inline-block w-1.5 h-1.5 rounded-full bg-[#FCD34D] shrink-0 animate-pulse"
        />
        <span className="font-semibold tracking-wide">Alpha</span>
        <span className="opacity-40" aria-hidden>·</span>
        <span className="opacity-70 truncate">Frühe Version, Daten können sich ändern</span>
        <a
          href="mailto:hallo@ronki.de?subject=Ronki%20Alpha%20Feedback"
          className="ml-auto shrink-0 font-semibold text-[#FCD34D] hover:text-white transition-colors underline decoration-[#FCD34D]/40 underline-offset-2"
        >
          Rückmeldung
        </a>
      </div>
    </div>
  );
}
