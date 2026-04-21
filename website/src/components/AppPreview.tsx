import { ContainerScroll } from './primitives/ContainerScroll';
import { PhoneMockup } from './PhoneMockup';

/**
 * AppPreview — "Eine App. Zwei Blickwinkel."
 *
 * Phase 2: abstract blobs replaced with the real PhoneMockup component
 * (same scale-aware primitive that renders the print posters). Left
 * column = kid's view (Aufgaben / morgen-anchor). Right column = the
 * observational surface parents land on (mood-grid, the journal view
 * that reflects how the week went, no control dashboard).
 */
export function AppPreview() {
  return (
    <ContainerScroll
      titleComponent={
        <>
          <p className="text-xs uppercase tracking-[0.2em] text-teal mb-5 font-medium">
            Für Kind und Eltern
          </p>
          <h2 className="font-display font-bold text-4xl sm:text-5xl lg:text-6xl leading-[1.02] tracking-tight text-teal-dark max-w-3xl mx-auto">
            Eine App. Zwei Blickwinkel.{' '}
            <em className="italic text-sage">Ein Zuhause.</em>
          </h2>
          <p className="mt-5 text-base sm:text-lg opacity-70 max-w-xl mx-auto leading-relaxed">
            Dein Kind hat seinen eigenen Tag mit Ronki, und ist dabei in guten Händen. Du bekommst kein Kontroll-Dashboard, nur das ruhige Gefühl, dass alles läuft, auch wenn die Zahnbürste noch im Bad liegt.
          </p>
        </>
      }
    >
      <div className="grid grid-cols-1 md:grid-cols-2 h-full">
        {/* Kid's view — real app UI. Morgen-Anchor shows how a routine
            looks from the child's side. */}
        <div className="relative p-6 sm:p-10 flex flex-col items-center justify-between bg-gradient-to-br from-mustard-soft/40 via-cream to-sage-soft/30 border-r border-teal/10 gap-6">
          <div className="text-center">
            <p className="text-[0.65rem] uppercase tracking-[0.15em] text-teal/60 mb-3 font-semibold">
              Eigenverantwortung statt Gehorsam
            </p>
            <h3 className="font-display font-bold text-2xl sm:text-3xl text-teal-dark leading-tight">
              Da bist du ja.
            </h3>
          </div>
          <PhoneFrame>
            <PhoneMockup variant="morgen-anchor" scale={2} />
          </PhoneFrame>
          <p className="text-sm text-ink/65 text-center max-w-xs leading-relaxed">
            Keine Push. Keine Streak. Louis sieht, was als Nächstes dran ist, und hakt selbst ab.
          </p>
        </div>

        {/* Parent's view — the Buch / mood grid, the reflective surface.
            NOT a control dashboard. Parents see the week as the child
            wrote it, not as a compliance tracker. */}
        <div className="relative p-6 sm:p-10 flex flex-col items-center justify-between bg-gradient-to-br from-cream via-cream to-teal/5 gap-6">
          <div className="text-center">
            <p className="text-[0.65rem] uppercase tracking-[0.15em] text-teal/60 mb-3 font-semibold">
              Einblick ohne Überwachung
            </p>
            <h3 className="font-display font-bold text-2xl sm:text-3xl text-teal-dark leading-tight">
              Louis hat seinen Tag eingetragen.
            </h3>
          </div>
          <PhoneFrame>
            <PhoneMockup variant="mood-grid" scale={2} />
          </PhoneFrame>
          <p className="text-sm text-ink/65 text-center max-w-xs leading-relaxed">
            Das Abenteuer-Buch, wie Louis es gefüllt hat. Kein Dashboard. Keine Bewertungen.
          </p>
        </div>
      </div>
    </ContainerScroll>
  );
}

/* ─── Shared phone-frame for both columns ──────────────────────────
 * Uses same bezel styling as the print-poster phone-inset: dark teal
 * body, rounded 3xl corners, small notch up top, screen inside.
 * Sized for ~2x scale so the content is readable at arm's length. */
function PhoneFrame({ children }: { children: React.ReactNode }) {
  return (
    <div
      className="relative flex-shrink-0"
      style={{
        width: '200px',
        height: '400px',
        background: '#1A3C3F',
        borderRadius: '28px',
        padding: '8px',
        boxShadow:
          '0 24px 56px -16px rgba(26,60,63,0.45), 0 8px 24px -8px rgba(26,60,63,0.25)',
      }}
    >
      <div
        aria-hidden
        className="absolute top-[14px] left-1/2 -translate-x-1/2 bg-teal-dark rounded-full"
        style={{ width: '50px', height: '6px', zIndex: 2 }}
      />
      <div
        className="w-full h-full overflow-hidden"
        style={{ borderRadius: '22px' }}
      >
        {children}
      </div>
    </div>
  );
}
