import { motion } from 'motion/react';
import { PainterlyShell } from '../components/PainterlyShell';
import { PageMeta } from '../components/PageMeta';
import { WaitlistCTA } from '../components/WaitlistCTA';
import { LAUNCH_STATE } from '../config/launch-state';

/* ------------------------------------------------------------------ */
/*  Staggered inline-image text lines                                  */
/* ------------------------------------------------------------------ */

type HighlightLine = {
  before: string;
  image?: { src: string; alt: string; rounded: string };
  after: string;
};

const LINES: HighlightLine[] = [
  {
    before: 'Morgens erinnert',
    image: { src: '/art/companion/dragon-baby.webp', alt: 'Ronki-Drache', rounded: 'rounded-full' },
    after: 'leise an die Zahne.',
  },
  {
    before: 'Nachmittags malen',
    image: { src: '/art/bioms/Naschgarten_temptaion-garden.webp', alt: 'Naschgarten', rounded: 'rounded-lg' },
    after: 'wir zusammen.',
  },
  {
    before: 'Abends macht',
    image: { src: '/art/companion/dragon-hatching.webp', alt: 'Ronki schluepft', rounded: 'rounded-full' },
    after: 'das Licht am Nest aus.',
  },
];

const CLOSING: { text: string; className: string }[] = [
  { text: 'Kein Timer.', className: 'text-xl sm:text-2xl text-cream/50' },
  { text: 'Kein Belohnungssystem.', className: 'text-xl sm:text-2xl text-cream/50' },
  { text: 'Ein Freund.', className: 'text-2xl sm:text-3xl md:text-4xl text-mustard font-bold' },
];

/* ------------------------------------------------------------------ */
/*  "Wie es funktioniert" anti-feature highlights                      */
/* ------------------------------------------------------------------ */

const ANTI_HIGHLIGHTS = [
  { bold: 'Keine Streaks', detail: 'Gewohnheiten brauchen keinen Druck.' },
  { bold: 'Keine Werbung', detail: 'Dein Kind ist kein Produkt.' },
  { bold: 'Kein Social-Feed', detail: 'Ronki gehort deinem Kind allein.' },
];

/* ------------------------------------------------------------------ */
/*  Fade-up variant shared by every animated element                   */
/* ------------------------------------------------------------------ */

const fadeUp = (delay: number) => ({
  initial: { opacity: 0, y: 20 } as const,
  whileInView: { opacity: 1, y: 0 } as const,
  viewport: { once: true, margin: '-10%' as const },
  transition: { duration: 0.55, delay, ease: [0.2, 0.7, 0.2, 1] as const },
});

/* ================================================================== */

export default function AltFeatureHighlight() {
  return (
    <PainterlyShell>
      <PageMeta
        title="Wie es funktioniert | Ronki"
        description="Ein Tag mit Ronki: morgens erinnern, nachmittags malen, abends Nest. Kein Timer, kein Belohnungssystem -- ein Freund."
        noindex
      />

      {/* ---- Hero text block ---- */}
      <section className="relative bg-teal-dark px-6 py-28 sm:py-36 md:py-44">
        <div className="mx-auto max-w-3xl flex flex-col items-center text-center">

          {/* Main staggered lines */}
          {LINES.map((line, i) => (
            <motion.p
              key={i}
              {...fadeUp(i * 0.15)}
              className="font-display font-bold text-3xl sm:text-4xl md:text-5xl text-cream leading-tight mb-4"
            >
              {line.before}
              {line.image && (
                <motion.img
                  src={line.image.src}
                  alt={line.image.alt}
                  width={32}
                  height={32}
                  whileHover={{ scale: 1.15 }}
                  transition={{ type: 'spring', stiffness: 400, damping: 15 }}
                  className={`mx-2 inline-block align-middle w-8 h-8 object-cover ${line.image.rounded}`}
                />
              )}
              {line.after}
            </motion.p>
          ))}

          {/* Blank spacer */}
          <div className="h-8 sm:h-12" aria-hidden />

          {/* Closing lines */}
          {CLOSING.map((line, i) => (
            <motion.p
              key={line.text}
              {...fadeUp(LINES.length * 0.15 + i * 0.15)}
              className={`font-display leading-tight mb-2 ${line.className}`}
            >
              {line.text}
            </motion.p>
          ))}

          {/* Waitlist CTA */}
          <motion.div
            {...fadeUp(LINES.length * 0.15 + CLOSING.length * 0.15 + 0.1)}
            className="mt-12 text-cream"
          >
            <WaitlistCTA launchState={LAUNCH_STATE} />
          </motion.div>
        </div>
      </section>

      {/* ---- "Wie es funktioniert" anti-feature highlights ---- */}
      <section className="relative bg-teal-dark/95 px-6 py-20 sm:py-28 border-t border-cream/10">
        <div className="mx-auto max-w-3xl flex flex-col gap-6">
          {ANTI_HIGHLIGHTS.map((item, i) => (
            <motion.p
              key={item.bold}
              {...fadeUp(i * 0.15)}
              className="font-display text-lg text-cream/60 leading-relaxed"
            >
              <span className="font-bold text-cream/80">{item.bold}</span>
              <span
                aria-hidden
                className="mx-2 inline-block h-1.5 w-1.5 rounded-full bg-mustard/60 align-middle"
              />
              {item.detail}
            </motion.p>
          ))}
        </div>
      </section>
    </PainterlyShell>
  );
}
