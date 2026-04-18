import { motion } from 'motion/react';
import { SpotlightCard } from './primitives/SpotlightCard';
import { EASE_OUT } from '../lib/motion';

const PILLARS = [
  {
    num: '01',
    title: 'Einladen statt erinnern.',
    body: 'Ronki fragt nicht ab. Er schlägt vor. „Komm, zuerst die Zähne, dann mach ich dir den Becher voll." Kein Wecker, kein Druck. Und weil niemand zwingt, geht dein Kind oft von selbst los.',
    accent: '#FCD34D',
    spotlight: 'rgba(252, 211, 77, 0.35)',
  },
  {
    num: '02',
    title: 'Fortschritt wird zu einem Ort.',
    body: 'Jede fertige Routine hinterlässt Spuren in Ronkis kleiner Welt: ein Pfad im Wald, eine Blüte im Garten, ein Ei, das bald schlüpft. Kein Balken, der voll wird. Kein Zähler, den man verlieren kann.',
    accent: '#50A082',
    spotlight: 'rgba(80, 160, 130, 0.30)',
  },
  {
    num: '03',
    title: 'An Kinderentwicklung ausgerichtet.',
    body: 'Keine Lootboxen. Keine Slot-Machine-Logik im Kinderzimmer. Keine Benachrichtigung, die dein Kind nach dem Abendessen nochmal ans Tablet zieht. Jede Mechanik ist an Leitlinien für gesunde Kinderentwicklung geprüft, nicht an Engagement-Zahlen.',
    accent: '#2D5A5E',
    spotlight: 'rgba(45, 90, 94, 0.28)',
  },
];

export function Pillars() {
  return (
    <section
      id="wie-ronki-arbeitet"
      className="relative px-6 py-28 sm:py-32"
      aria-labelledby="pillars-heading"
    >
      <div className="max-w-6xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-20%' }}
          transition={{ duration: 0.7 }}
          className="mb-16 max-w-5xl"
        >
          <p className="text-xs uppercase tracking-[0.2em] text-teal mb-6 font-medium">
            Die drei Säulen
          </p>
          <h2
            id="pillars-heading"
            className="font-display font-bold text-5xl sm:text-6xl lg:text-7xl leading-[1.02] tracking-tight text-teal-dark"
          >
            Bewusst <em className="italic text-sage">anders</em> gebaut.
          </h2>
        </motion.div>

        <div className="grid gap-6 md:grid-cols-3">
          {PILLARS.map((pillar, i) => (
            <motion.div
              key={pillar.num}
              initial={{ opacity: 0, y: 32 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-10%' }}
              transition={{ duration: 0.7, delay: i * 0.12, ease: EASE_OUT }}
              whileHover={{ y: -6 }}
            >
              <SpotlightCard
                spotlightColor={pillar.spotlight}
                className="h-full rounded-3xl border-2 border-teal/15 bg-cream p-8 transition-all hover:border-teal/30 hover:shadow-lg"
              >
                <article className="relative flex flex-col gap-5 h-full">
                  <span
                    className="font-display font-bold text-sm tracking-[0.15em]"
                    style={{ color: pillar.accent }}
                  >
                    {pillar.num}
                  </span>
                  <h3 className="font-display font-bold text-2xl sm:text-3xl leading-tight text-teal-dark">
                    {pillar.title}
                  </h3>
                  <p className="opacity-75 leading-relaxed text-[0.95rem] text-ink">
                    {pillar.body}
                  </p>
                  <div className="mt-auto pt-8">
                    <div
                      className="h-[2px] w-12 transition-all duration-500 group-hover:w-full"
                      style={{ backgroundColor: pillar.accent }}
                    />
                  </div>
                </article>
              </SpotlightCard>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
