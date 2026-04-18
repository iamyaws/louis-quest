import { motion } from 'motion/react';
import { EASE_OUT } from '../../lib/motion';

const PILLARS = [
  {
    num: '01',
    title: 'Fragt, nervt nie.',
    body: 'Der Drache bietet Routinen als kleine Geschichten an: keine Erinnerungen, keine Streaks, kein „du hast\'s gebrochen". Kinder wählen ihr Tempo selbst.',
    accent: '#c48a3a',
  },
  {
    num: '02',
    title: 'Sanctuary wächst mit.',
    body: 'Jede fertige Routine hinterlässt Spuren in Ronkis Welt. Fortschritt wird zu einem Ort, den das Kind besucht, nicht zu einem Zähler, den es fürchtet zu verlieren.',
    accent: '#6b8e4e',
  },
  {
    num: '03',
    title: 'Nach Kinderentwicklung gebaut.',
    body: 'AAP 2026, UNICEF RITEC-8, D4CR und Self-Determination Theory. Keine Loot-Boxen, keine variablen Belohnungen, keine FOMO-Mechaniken. Nie.',
    accent: '#6b3a5c',
  },
];

export function PillarsModern() {
  return (
    <section
      id="wie-ronki-arbeitet"
      className="relative px-6 py-32 border-t border-white/10"
      aria-labelledby="pillars-heading-modern"
    >
      <div className="max-w-6xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-20%' }}
          transition={{ duration: 0.7 }}
          className="mb-20 max-w-3xl"
        >
          <p className="text-xs uppercase tracking-[0.2em] text-[#c48a3a] mb-6 font-medium">
            Die drei Säulen
          </p>
          <h2
            id="pillars-heading-modern"
            className="font-display text-5xl sm:text-6xl lg:text-7xl leading-[1.02] tracking-tight"
          >
            Warum Ronki <em className="italic opacity-70">anders</em> ist.
          </h2>
        </motion.div>

        <div className="grid gap-6 md:grid-cols-3">
          {PILLARS.map((pillar, i) => (
            <motion.article
              key={pillar.num}
              initial={{ opacity: 0, y: 32 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-10%' }}
              transition={{ duration: 0.7, delay: i * 0.12, ease: EASE_OUT }}
              whileHover={{ y: -6 }}
              className="group relative rounded-3xl border border-white/10 bg-white/[0.02] p-8 overflow-hidden backdrop-blur-sm transition-colors hover:border-white/20"
            >
              <div
                aria-hidden
                className="absolute -top-20 -right-20 h-48 w-48 rounded-full opacity-0 blur-3xl transition-opacity duration-500 group-hover:opacity-40"
                style={{ backgroundColor: pillar.accent }}
              />
              <div className="relative flex flex-col gap-5 h-full">
                <span
                  className="font-display text-sm tracking-[0.15em]"
                  style={{ color: pillar.accent }}
                >
                  {pillar.num}
                </span>
                <h3 className="font-display text-2xl sm:text-3xl leading-tight">{pillar.title}</h3>
                <p className="opacity-75 leading-relaxed text-[0.95rem]">{pillar.body}</p>
                <div className="mt-auto pt-8">
                  <div
                    className="h-px w-12 transition-all duration-500 group-hover:w-full"
                    style={{ backgroundColor: pillar.accent }}
                  />
                </div>
              </div>
            </motion.article>
          ))}
        </div>
      </div>
    </section>
  );
}
