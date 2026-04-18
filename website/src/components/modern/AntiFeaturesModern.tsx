import { motion } from 'motion/react';
import { Link } from 'react-router-dom';
import { EASE_OUT } from '../../lib/motion';

const ITEMS = [
  { label: 'Keine Streaks, die reißen können.', detail: 'Kontinuität zeigt sich räumlich im Sanctuary, nicht als Zähler.' },
  { label: 'Keine Werbung. Nie.', detail: 'Ronki verdient kein Geld mit der Aufmerksamkeit von Kindern.' },
  { label: 'Keine Loot-Boxen, keine Glücksspiel-Mechaniken.', detail: 'Belohnungen sind vorhersehbar und an reale Aktionen gebunden.' },
  { label: 'Keine Push-Nachrichten, die nerven.', detail: 'Ronki wartet im Sanctuary. Er kommt nicht hinterher.' },
  { label: 'Keine Daten-Weitergabe an Dritte.', detail: 'Keine Tracker, keine Analytics bei Start. Supabase in der EU.' },
];

export function AntiFeaturesModern() {
  return (
    <section
      className="relative px-6 py-32 border-t border-white/10"
      aria-labelledby="anti-features-heading-modern"
    >
      <div className="max-w-5xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-20%' }}
          transition={{ duration: 0.7 }}
          className="mb-16 max-w-3xl"
        >
          <p className="text-xs uppercase tracking-[0.2em] text-[#c48a3a] mb-6 font-medium">
            Was Ronki NICHT tut
          </p>
          <h2
            id="anti-features-heading-modern"
            className="font-display text-5xl sm:text-6xl lg:text-7xl leading-[1.02] tracking-tight"
          >
            Die <em className="italic opacity-70">ehrliche</em> Liste.
          </h2>
        </motion.div>

        <ul className="flex flex-col">
          {ITEMS.map((item, i) => (
            <motion.li
              key={item.label}
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true, margin: '-10%' }}
              transition={{ duration: 0.6, delay: i * 0.08, ease: EASE_OUT }}
              className="group border-t border-white/10 last:border-b py-8 sm:py-10"
            >
              <div className="flex flex-col sm:flex-row sm:items-baseline gap-3 sm:gap-8">
                <span className="text-xs font-display opacity-75 tracking-[0.2em]">
                  {String(i + 1).padStart(2, '0')}
                </span>
                <div className="flex-1">
                  <p className="relative font-display text-2xl sm:text-3xl leading-tight inline-block">
                    {item.label}
                    <motion.span
                      aria-hidden
                      initial={{ scaleX: 0 }}
                      whileInView={{ scaleX: 1 }}
                      viewport={{ once: true, margin: '-10%' }}
                      transition={{ duration: 0.7, delay: i * 0.08 + 0.4, ease: EASE_OUT }}
                      className="absolute left-0 top-1/2 h-[2px] w-full origin-left bg-[#6b3a5c]"
                    />
                  </p>
                  <p className="mt-3 text-sm sm:text-base opacity-60 leading-relaxed max-w-xl">
                    {item.detail}
                  </p>
                </div>
              </div>
            </motion.li>
          ))}
        </ul>

        <motion.p
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="mt-10 text-sm opacity-60"
        >
          Ausführliche Begründungen auf{' '}
          <Link to="/wie-es-funktioniert" className="underline decoration-[#c48a3a] underline-offset-4 hover:text-[#f5ecd4]">
            Wie es funktioniert
          </Link>{' '}
          und{' '}
          <Link to="/wissenschaft" className="underline decoration-[#c48a3a] underline-offset-4 hover:text-[#f5ecd4]">
            Wissenschaft
          </Link>.
        </motion.p>
      </div>
    </section>
  );
}
