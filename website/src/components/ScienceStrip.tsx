import { motion } from 'motion/react';
import { Link } from 'react-router-dom';

const ANCHORS = [
  { tag: 'BzKJ', year: '2024', label: 'Bundeszentrale Kinder- und Jugendmedienschutz', url: 'https://www.bzkj.de/' },
  { tag: 'UNICEF', year: 'RITEC-8', label: 'Kinderrechte im digitalen Raum', url: 'https://www.unicef-irc.org/' },
  { tag: 'KIM-Studie', year: 'mpfs', label: 'Kinder, Internet, Medien (DE)', url: 'https://www.mpfs.de/' },
  { tag: 'D4CR', year: '', label: 'Designing for Children\u2019s Rights', url: 'https://designingforchildrensrights.org/' },
  { tag: 'WHO', year: '2019', label: 'Leitlinien zu Bildschirmzeit', url: 'https://www.who.int/' },
  { tag: 'SDT', year: '', label: 'Selbstbestimmungstheorie', url: 'https://selfdeterminationtheory.org/' },
];

export function ScienceStrip() {
  return (
    <section
      className="relative px-6 py-24 sm:py-28"
      aria-labelledby="science-strip-heading"
    >
      <div className="max-w-5xl mx-auto text-center">
        <motion.p
          initial={{ opacity: 0, y: 8 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-15%' }}
          transition={{ duration: 0.6 }}
          className="text-xs uppercase tracking-[0.2em] text-teal font-medium mb-6"
        >
          Auf Forschung gebaut
        </motion.p>

        <motion.h2
          id="science-strip-heading"
          initial={{ opacity: 0, y: 12 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-15%' }}
          transition={{ duration: 0.7, delay: 0.1 }}
          className="font-display font-bold text-3xl sm:text-4xl lg:text-5xl leading-[1.08] tracking-tight text-teal-dark max-w-3xl mx-auto"
        >
          An <em className="italic text-sage">Kinderentwicklung</em> ausgerichtet. Nicht gamifiziert.
        </motion.h2>

        <motion.p
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="mt-6 text-base sm:text-lg text-ink/75 max-w-2xl mx-auto leading-relaxed"
        >
          Wir wissen, was im Pausenhof läuft: Roblox, Fortnite. Wir kennen die Mechaniken dahinter: variable Belohnungen, In-Game-Währungen, Lootbox-Logik. Sie funktionieren, gerade bei Kindern. Wir sind bewusst die andere Richtung gegangen.
        </motion.p>

        <motion.p
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="mt-4 text-sm sm:text-base text-ink/60 max-w-2xl mx-auto leading-relaxed"
        >
          Jede Mechanik wird an benannten Leitlinien gemessen, nicht daran, wie lange dein Kind in der App hängt.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, scaleX: 0 }}
          whileInView={{ opacity: 1, scaleX: 1 }}
          viewport={{ once: true, margin: '-15%' }}
          transition={{ duration: 0.8, delay: 0.3 }}
          className="mt-14 h-px w-24 mx-auto origin-center bg-gradient-to-r from-transparent via-teal/40 to-transparent"
        />

        <motion.p
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="mt-10 text-[0.7rem] uppercase tracking-[0.2em] text-teal/60 font-medium"
        >
          Leitlinien, an denen wir uns messen
        </motion.p>

        <ul className="mt-6 flex flex-wrap items-start justify-center gap-x-10 gap-y-8 sm:gap-x-14">
          {ANCHORS.map((a, i) => (
            <motion.li
              key={a.tag + a.year}
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-10%' }}
              transition={{ duration: 0.6, delay: 0.5 + i * 0.08 }}
              className="min-w-[7rem]"
            >
              <a
                href={a.url}
                target="_blank"
                rel="noopener noreferrer"
                className="group flex flex-col items-center text-center rounded-xl px-3 py-2 transition-all hover:bg-cream/60 hover:-translate-y-0.5"
                aria-label={`${a.label}, externe Seite öffnen`}
              >
                <div className="flex items-baseline gap-1.5">
                  <span className="font-display font-extrabold text-xl sm:text-2xl text-teal-dark tracking-tight group-hover:text-teal transition-colors">
                    {a.tag}
                  </span>
                  {a.year && (
                    <span className="font-display font-semibold text-sm text-sage">
                      {a.year}
                    </span>
                  )}
                  <span className="text-teal/70 text-xs group-hover:text-teal group-hover:translate-x-0.5 transition-all" aria-hidden>↗</span>
                </div>
                <span className="mt-1 text-[0.72rem] text-ink/60 leading-snug max-w-[10rem] group-hover:text-ink/75 transition-colors">
                  {a.label}
                </span>
              </a>
            </motion.li>
          ))}
        </ul>

        <motion.p
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 1 }}
          className="mt-12 text-sm text-ink/60"
        >
          <Link to="/wissenschaft" className="underline decoration-mustard decoration-2 underline-offset-4 hover:text-teal-dark">
            Wie wir das belegen
          </Link>{' '}
          mit Quellen, nicht mit Stichworten.
        </motion.p>
      </div>
    </section>
  );
}
