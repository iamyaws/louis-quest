import { motion, useReducedMotion } from 'motion/react';
import { HeroHighlight } from './primitives/HeroHighlight';
import { WaitlistCTA } from './WaitlistCTA';
import { LAUNCH_STATE } from '../config/launch-state';

/** Variant F — Dashboard Peek. Dark teal background with a floating routine-card glimpse. */
export function HeroVariantF() {
  const reduced = useReducedMotion();

  const fade = (delay: number) =>
    reduced
      ? { initial: { opacity: 1, y: 0 }, animate: { opacity: 1, y: 0 } }
      : {
          initial: { opacity: 0, y: 20 },
          animate: { opacity: 1, y: 0 },
          transition: { duration: 0.7, delay, ease: [0.2, 0.7, 0.2, 1] },
        };

  const routineItems: Array<{ label: string; done: boolean }> = [
    { label: 'Z\u00e4hne putzen', done: true },
    { label: 'Anziehen', done: true },
    { label: 'Tasche packen', done: false },
  ];

  return (
    <section
      className="relative flex flex-col items-center justify-center min-h-[88vh] px-6 pt-24 pb-20 sm:pt-32 sm:pb-24 overflow-hidden bg-teal-dark"
      aria-label="Hero"
    >
      {/* Background gradient orbs */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden>
        {/* Mustard orb — top right */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={reduced ? { opacity: 0.07 } : { opacity: [0.05, 0.10, 0.05] }}
          transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut', delay: 0 }}
          className="absolute -top-32 -right-32 w-[480px] h-[480px] rounded-full"
          style={{ background: 'radial-gradient(circle, #FCD34D 0%, transparent 70%)' }}
        />
        {/* Sage orb — bottom left */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={reduced ? { opacity: 0.06 } : { opacity: [0.04, 0.09, 0.04] }}
          transition={{ duration: 10, repeat: Infinity, ease: 'easeInOut', delay: 3 }}
          className="absolute -bottom-40 -left-40 w-[520px] h-[520px] rounded-full"
          style={{ background: 'radial-gradient(circle, #50a082 0%, transparent 65%)' }}
        />
        {/* Subtle teal center glow */}
        <div
          className="absolute inset-0"
          style={{
            background:
              'radial-gradient(ellipse 70% 55% at 50% 40%, rgba(62,116,120,0.18) 0%, transparent 65%)',
          }}
        />
      </div>

      {/* Main content wrapper: two-column on md+ */}
      <div className="relative z-10 w-full max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-12 md:gap-8 lg:gap-16 items-center">

        {/* Left column: copy */}
        <div className="flex flex-col items-center text-center md:items-start md:text-left">
          {/* Eyebrow badge */}
          <motion.p
            {...fade(0.1)}
            className="text-xs uppercase tracking-[0.2em] text-cream/70 mb-8 font-medium"
          >
            <span className="inline-block h-1.5 w-1.5 rounded-full bg-mustard align-middle mr-3 animate-pulse" />
            Bald verf&uuml;gbar &middot; 2026
          </motion.p>

          {/* Headline */}
          <motion.h1
            {...fade(0.2)}
            className="font-display font-extrabold leading-[0.95] tracking-tight text-4xl sm:text-5xl lg:text-6xl xl:text-7xl text-cream"
          >
            Ronki tr&auml;gt die Routine{' '}
            <HeroHighlight color="#FCD34D" delay={reduced ? 0 : 0.9}>
              mit
            </HeroHighlight>
            .
          </motion.h1>

          {/* Subtitle */}
          <motion.p
            {...fade(0.4)}
            className="mt-8 text-base sm:text-lg text-cream/75 leading-relaxed max-w-lg"
          >
            Ein Drachen-Gef&auml;hrte, der dein Kind durch den Alltag begleitet. Damit du
            &bdquo;Z&auml;hne putzen!&ldquo; nicht zum zehnten Mal durchs Haus rufen musst.
          </motion.p>

          {/* CTA form */}
          <motion.div {...fade(0.55)} className="mt-10 w-full max-w-md">
            <WaitlistCTA launchState={LAUNCH_STATE} />
          </motion.div>

          {/* Secondary link */}
          <motion.a
            href="#wie-ronki-arbeitet"
            {...fade(0.65)}
            className="group mt-5 inline-flex items-center gap-2 text-sm text-cream/55 hover:text-cream/90 transition-colors py-2"
          >
            So funktioniert Ronki
            <span className="inline-block transition-transform group-hover:translate-x-1">
              &rarr;
            </span>
          </motion.a>

          {/* Trust indicators */}
          <motion.div
            {...fade(0.75)}
            className="mt-10 flex flex-wrap items-center gap-x-6 gap-y-3 justify-center md:justify-start"
          >
            <TrustBadge icon="\uD83D\uDD12" label="Kein Social-Feed" />
            <TrustBadge icon="\uD83D\uDC64" label="Eltern behalten die Kontrolle" />
            <TrustBadge icon="\u2764\uFE0F" label="Kein Dark Pattern" />
          </motion.div>
        </div>

        {/* Right column: floating peek card (md+) */}
        <div className="hidden md:flex items-center justify-center">
          <motion.div
            initial={reduced ? { opacity: 1, y: 0 } : { opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.45, ease: [0.2, 0.7, 0.2, 1] }}
          >
            {/* Float loop */}
            <motion.div
              animate={reduced ? {} : { y: [-4, 4, -4] }}
              transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut' }}
            >
              <PeekCard items={routineItems} reduced={!!reduced} />
            </motion.div>
          </motion.div>
        </div>
      </div>

      {/* Mobile peek card — below copy, centered */}
      <motion.div
        {...fade(0.6)}
        className="relative z-10 mt-10 flex md:hidden justify-center w-full"
      >
        <PeekCard items={routineItems} reduced={!!reduced} compact />
      </motion.div>

      {/* Scroll hint */}
      <motion.div
        aria-hidden
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1, delay: 1.6 }}
        className="absolute bottom-6 left-1/2 -translate-x-1/2 text-xs tracking-[0.15em] uppercase text-cream/40"
      >
        <motion.span
          animate={reduced ? {} : { y: [0, 6, 0] }}
          transition={{ duration: 2.4, repeat: Infinity, ease: 'easeInOut' }}
          className="inline-block"
        >
          scroll &darr;
        </motion.span>
      </motion.div>
    </section>
  );
}

/* ------------------------------------------------------------------ */
/* PeekCard                                                             */
/* ------------------------------------------------------------------ */

interface RoutineItem {
  label: string;
  done: boolean;
}

interface PeekCardProps {
  items: RoutineItem[];
  reduced: boolean;
  compact?: boolean;
}

function PeekCard({ items, reduced, compact = false }: PeekCardProps) {
  const doneCount = items.filter((i) => i.done).length;
  const total = items.length;
  const progress = doneCount / total;

  return (
    <div
      className={`
        relative rounded-3xl bg-cream shadow-2xl overflow-hidden select-none
        ${compact ? 'w-72 p-5' : 'w-80 p-6'}
      `}
      style={{
        boxShadow:
          '0 24px 64px rgba(26,63,67,0.35), 0 4px 16px rgba(26,63,67,0.18)',
      }}
      aria-label="Vorschau: Louis' Morgen-Routine"
      role="img"
    >
      {/* Decorative teal top strip */}
      <div
        className="absolute inset-x-0 top-0 h-1.5 rounded-t-3xl"
        style={{ background: 'linear-gradient(90deg, #2D5A5E 0%, #50a082 100%)' }}
      />

      {/* Card header */}
      <div className="flex items-center gap-3 mt-2 mb-5">
        <span
          className="flex items-center justify-center w-10 h-10 rounded-2xl text-xl"
          style={{ background: 'rgba(45,90,94,0.10)' }}
          aria-hidden
        >
          {'\uD83D\uDC09'}
        </span>
        <div>
          <p className="font-display font-bold text-teal-dark text-sm leading-tight">
            Louis&rsquo; Morgen
          </p>
          <p className="text-xs text-teal/60 mt-0.5">Heute, Mittwoch</p>
        </div>
        {/* Live dot */}
        <span className="ml-auto flex items-center gap-1.5 text-xs text-sage font-medium">
          <span className="inline-block w-1.5 h-1.5 rounded-full bg-sage animate-pulse" />
          Aktiv
        </span>
      </div>

      {/* Routine items */}
      <ul className="flex flex-col gap-2.5" role="list">
        {items.map((item, idx) => (
          <RoutineRow key={idx} item={item} reduced={reduced} delay={0.55 + idx * 0.1} />
        ))}
      </ul>

      {/* Progress bar */}
      <div className="mt-5">
        <div className="flex justify-between items-center mb-1.5">
          <span className="text-xs text-teal/60 font-medium">Fortschritt</span>
          <span className="text-xs font-display font-bold text-teal-dark">
            {doneCount}/{total}
          </span>
        </div>
        <div className="h-2 w-full rounded-full bg-teal/10 overflow-hidden">
          <motion.div
            initial={reduced ? undefined : { scaleX: 0 }}
            animate={{ scaleX: 1 }}
            transition={{ duration: 0.9, delay: 0.85, ease: [0.2, 0.7, 0.2, 1] }}
            className="h-full rounded-full origin-left"
            style={{
              width: `${progress * 100}%`,
              background: 'linear-gradient(90deg, #2D5A5E 0%, #50a082 100%)',
            }}
          />
        </div>
      </div>

      {/* Companion nudge chip */}
      <motion.div
        initial={reduced ? { opacity: 1 } : { opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 1.1 }}
        className="mt-4 flex items-center gap-2 rounded-2xl px-3 py-2.5"
        style={{ background: 'rgba(45,90,94,0.08)' }}
      >
        <span className="text-base" aria-hidden>{'\uD83D\uDC09'}</span>
        <p className="text-xs text-teal-dark leading-snug">
          <span className="font-semibold">Ronki sagt:</span>{' '}
          Fast geschafft! Nur noch die Tasche.
        </p>
      </motion.div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* RoutineRow                                                           */
/* ------------------------------------------------------------------ */

interface RoutineRowProps {
  item: RoutineItem;
  reduced: boolean;
  delay: number;
}

function RoutineRow({ item, reduced, delay }: RoutineRowProps) {
  return (
    <motion.li
      initial={reduced ? { opacity: 1 } : { opacity: 0, x: -8 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.5, delay, ease: [0.2, 0.7, 0.2, 1] }}
      className={`flex items-center gap-3 rounded-2xl px-3.5 py-2.5 transition-colors ${
        item.done ? 'bg-teal/[0.08]' : 'bg-mustard/10 border border-mustard/25'
      }`}
    >
      {/* Checkbox indicator */}
      <span
        aria-hidden
        className={`flex-none flex items-center justify-center w-5 h-5 rounded-full text-[10px] font-bold ${
          item.done
            ? 'bg-teal text-cream'
            : 'border-2 border-mustard bg-transparent'
        }`}
      >
        {item.done ? '\u2713' : null}
      </span>
      <span
        className={`text-sm font-medium leading-none ${
          item.done
            ? 'text-teal-dark line-through decoration-teal/40'
            : 'text-teal-dark'
        }`}
      >
        {item.label}
      </span>
      {!item.done && (
        <span className="ml-auto text-[10px] font-display font-bold text-mustard uppercase tracking-wide">
          Jetzt
        </span>
      )}
    </motion.li>
  );
}

/* ------------------------------------------------------------------ */
/* TrustBadge                                                           */
/* ------------------------------------------------------------------ */

interface TrustBadgeProps {
  icon: string;
  label: string;
}

function TrustBadge({ icon, label }: TrustBadgeProps) {
  return (
    <span className="inline-flex items-center gap-1.5 text-xs text-cream/55">
      <span aria-hidden>{icon}</span>
      {label}
    </span>
  );
}
