import { motion } from 'motion/react';
import { Link } from 'react-router-dom';
import { PageMeta } from '../components/PageMeta';
import { PainterlyShell } from '../components/PainterlyShell';
import { Footer } from '../components/Footer';

const ANCHORS = [
  { tag: 'BzKJ', year: '2024', label: 'Bundeszentrale Kinder- und Jugendmedienschutz', url: 'https://www.bzkj.de/' },
  { tag: 'UNICEF', year: 'RITEC-8', label: 'Kinderrechte im digitalen Raum', url: 'https://www.unicef-irc.org/' },
  { tag: 'KIM-Studie', year: 'mpfs', label: 'Kinder, Internet, Medien (DE)', url: 'https://www.mpfs.de/' },
  { tag: 'D4CR', year: '', label: 'Designing for Children\u2019s Rights', url: 'https://designingforchildrensrights.org/' },
  { tag: 'WHO', year: '2019', label: 'Leitlinien zu Bildschirmzeit', url: 'https://www.who.int/' },
  { tag: 'SDT', year: '', label: 'Selbstbestimmungstheorie', url: 'https://selfdeterminationtheory.org/' },
];

const PRINCIPLES = [
  {
    title: 'Selbstbestimmungstheorie (SDT)',
    authors: 'Deci & Ryan',
    body: 'Kinder brauchen drei Dinge, um von innen heraus motiviert zu sein: Autonomie (eigene Entscheidungen treffen), Kompetenz (sich fähig fühlen) und Verbundenheit (Teil von etwas sein). Ronki gibt dem Kind die Wahl, welche Routinen es macht. Der Drache ist Begleiter, nicht Richter.',
  },
  {
    title: 'Habit Formation ohne Streaks',
    authors: 'Lally et al., 2010',
    body: 'Die Forschung zeigt: Gewohnheiten bilden sich durch Wiederholung im gleichen Kontext, nicht durch Druck oder Bestrafung. Ein verpasster Tag setzt den Fortschritt nicht zurück. Deshalb gibt es bei Ronki keine Streaks. Sie sind wissenschaftlich nicht nötig und setzen Kinder unter Druck.',
  },
  {
    title: 'Montessori-Prinzip der vorbereiteten Umgebung',
    authors: 'Maria Montessori',
    body: 'Das Kind handelt selbstständig in einer Umgebung, die für es gestaltet wurde. Ronki bereitet den Rahmen vor: die Routine, den Zeitpunkt, die kleine Geschichte. Und lässt das Kind dann machen.',
  },
  {
    title: 'Fading Scaffolding',
    authors: 'Vygotsky / Zone of Proximal Development',
    body: 'Unterstützung, die sich zurückzieht, sobald das Kind sie nicht mehr braucht. Ronkis Begleitung wird leiser, nicht lauter. Der Drache schläft irgendwann ein. Weil das Kind die Routine allein kann.',
  },
];

const SOURCES = [
  {
    tag: 'DE',
    title: 'klicksafe: Dark Patterns, Manipulation im Netz',
    note: 'EU-Initiative für Medienkompetenz, vom BMFSFJ gefördert.',
    url: 'https://www.klicksafe.de/',
  },
  {
    tag: 'DE',
    title: 'Verbraucherzentrale: Lootboxen und Glücksspiel-Mechaniken',
    note: 'Warum variable Belohnungen bei Kindern besonders wirken.',
    url: 'https://www.verbraucherzentrale.de/',
  },
  {
    tag: 'DE',
    title: 'BzKJ: Kinder- und Jugendmedienschutz',
    note: 'Die Bundeszentrale sammelt Forschung zu digitalen Risiken.',
    url: 'https://www.bzkj.de/',
  },
  {
    tag: 'EU',
    title: 'Norwegian Consumer Council: „Insert Coin" (2022)',
    note: 'Meistzitierter Report zu Dark Patterns in Spielen für Kinder.',
    url: 'https://www.forbrukerradet.no/',
  },
];

export default function Science() {
  return (
    <PainterlyShell>
      <PageMeta
        title="Wissenschaftlicher Hintergrund: Ronki"
        description="Welche Forschung hinter Ronki steckt: Selbstbestimmungstheorie, Fading Scaffolding und Montessori. Und warum wir bewusst auf Dark Patterns verzichten."
        canonicalPath="/wissenschaft"
        ogImage="https://www.ronki.de/og-wissenschaft.jpg"
      />

      <section className="px-6 pt-32 pb-24 sm:pt-40 sm:pb-28">
        <div className="max-w-4xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7 }}
          >
            <Link
              to="/"
              className="inline-flex items-center gap-2 text-sm text-teal-dark/60 hover:text-teal-dark transition-colors mb-8"
            >
              <span aria-hidden>&larr;</span> Zurück
            </Link>
            <p className="text-xs uppercase tracking-[0.2em] text-teal font-medium mb-6">
              Auf Forschung gebaut
            </p>
            <h1 className="font-display font-bold text-4xl sm:text-5xl lg:text-6xl leading-[1.04] tracking-tight text-teal-dark">
              An <em className="italic text-sage">Kinderentwicklung</em> ausgerichtet.{' '}
              Nicht gamifiziert.
            </h1>
            <p className="mt-6 text-base sm:text-lg text-ink/75 max-w-2xl leading-relaxed">
              Wir wissen, was auf dem Pausenhof läuft: Roblox, Fortnite. Wir kennen die Mechaniken dahinter. Variable Belohnungen, In-Game-Währungen, Lootbox-Logik. Sie funktionieren, gerade bei Kindern. Wir sind bewusst die andere Richtung gegangen.
            </p>
            <p className="mt-4 text-sm sm:text-base text-ink/60 max-w-2xl leading-relaxed">
              Jede Mechanik wird an benannten Leitlinien gemessen. Nicht daran, wie lange dein Kind in der App hängt.
            </p>
          </motion.div>
        </div>
      </section>

      <section className="px-6 py-24 sm:py-28 border-t border-teal/10" aria-labelledby="principles-heading">
        <div className="max-w-4xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7 }}
            className="mb-14"
          >
            <p className="text-xs uppercase tracking-[0.2em] text-teal-dark/85 mb-6 font-semibold">
              Theoretische Grundlagen
            </p>
            <h2
              id="principles-heading"
              className="font-display font-bold text-3xl sm:text-4xl lg:text-5xl leading-[1.08] tracking-tight text-teal-dark"
            >
              Die Forschung, auf der Ronki aufbaut.
            </h2>
          </motion.div>

          <div className="flex flex-col gap-10">
            {PRINCIPLES.map((p, i) => (
              <motion.article
                key={p.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-10%' }}
                transition={{ duration: 0.6, delay: i * 0.08 }}
                className="rounded-2xl border border-teal/10 bg-cream/50 backdrop-blur-sm p-6 sm:p-8"
              >
                <div className="flex items-baseline gap-3 mb-3">
                  <span className="text-xs font-display font-semibold text-teal/70 tracking-[0.2em]">
                    {String(i + 1).padStart(2, '0')}
                  </span>
                  <span className="text-xs text-sage font-display font-semibold uppercase tracking-wider">
                    {p.authors}
                  </span>
                </div>
                <h3 className="font-display font-bold text-xl sm:text-2xl text-teal-dark leading-tight mb-3">
                  {p.title}
                </h3>
                <p className="text-sm sm:text-base text-ink/70 leading-relaxed max-w-2xl">
                  {p.body}
                </p>
              </motion.article>
            ))}
          </div>
        </div>
      </section>

      <section className="px-6 py-24 sm:py-28 border-t border-teal/10">
        <div className="max-w-4xl mx-auto text-center">
          <motion.p
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-[0.7rem] uppercase tracking-[0.2em] text-teal/60 font-medium mb-8"
          >
            Leitlinien, an denen wir uns messen
          </motion.p>

          <ul className="flex flex-wrap items-start justify-center gap-x-10 gap-y-8 sm:gap-x-14">
            {ANCHORS.map((a, i) => (
              <motion.li
                key={a.tag + a.year}
                initial={{ opacity: 0, y: 10 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-10%' }}
                transition={{ duration: 0.6, delay: i * 0.08 }}
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
        </div>
      </section>

      <section className="px-6 py-24 sm:py-28 border-t border-teal/10" aria-labelledby="sources-heading">
        <div className="max-w-4xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7 }}
            className="mb-10"
          >
            <p className="text-[0.7rem] uppercase tracking-[0.2em] text-teal-dark/80 font-semibold mb-6">
              Weiterlesen, wenn du tiefer einsteigen willst
            </p>
            <h2
              id="sources-heading"
              className="font-display font-bold text-3xl sm:text-4xl leading-[1.08] tracking-tight text-teal-dark"
            >
              Quellen & Ressourcen
            </h2>
          </motion.div>

          <ul className="grid gap-3 sm:grid-cols-2">
            {SOURCES.map((s, i) => (
              <motion.li
                key={s.url}
                initial={{ opacity: 0, y: 12 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-10%' }}
                transition={{ duration: 0.5, delay: i * 0.06 }}
              >
                <a
                  href={s.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group flex items-start gap-4 rounded-xl border border-teal/15 bg-cream/60 backdrop-blur-sm p-4 hover:border-teal/35 hover:bg-cream transition-all"
                >
                  <span className="mt-0.5 font-display font-bold text-xs tracking-[0.2em] text-sage uppercase shrink-0 min-w-[5ch]">
                    {s.tag}
                  </span>
                  <div className="flex-1">
                    <p className="font-display font-semibold text-sm text-teal-dark leading-snug">
                      {s.title}
                    </p>
                    <p className="mt-1 text-xs text-ink/65 leading-relaxed">
                      {s.note}
                    </p>
                  </div>
                  <span className="mt-0.5 text-teal/70 group-hover:text-teal group-hover:translate-x-0.5 transition-all shrink-0" aria-hidden>
                    ↗
                  </span>
                </a>
              </motion.li>
            ))}
          </ul>
        </div>
      </section>

      <Footer />
    </PainterlyShell>
  );
}
