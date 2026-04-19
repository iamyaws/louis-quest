import { motion } from 'motion/react';
import { Link } from 'react-router-dom';
import { PageMeta } from '../components/PageMeta';
import { PainterlyShell } from '../components/PainterlyShell';
import { Footer } from '../components/Footer';
import { EASE_OUT } from '../lib/motion';

interface Vorlage {
  slug: string;
  title: string;
  subtitle: string;
  description: string;
  ages: string;
  accent: string;
  accentLight: string;
}

const VORLAGEN: Vorlage[] = [
  {
    slug: 'morgenroutine',
    title: 'Morgenroutine zum Ausmalen',
    subtitle: 'Für 5- bis 9-jährige',
    description:
      'Vier Schritte, vier Kreise zum Ausmalen. Hängt neben den Zahnputzbecher und dein Kind folgt der Reihe selbst.',
    ages: '5–9 Jahre',
    accent: '#d97706',
    accentLight: 'rgba(217,119,6,0.12)',
  },
  {
    slug: 'abendroutine',
    title: 'Abendroutine zum Ausmalen',
    subtitle: 'Für 5- bis 9-jährige',
    description:
      'Vier Schritte bis ins Bett. Keine Streit-Gespräche mehr darüber, was noch dran ist. Dein Kind sieht es selbst.',
    ages: '5–9 Jahre',
    accent: '#4338ca',
    accentLight: 'rgba(67,56,202,0.12)',
  },
  {
    slug: 'kleine-geschwister',
    title: 'Für kleine Geschwister',
    subtitle: 'Für 2- bis 4-jährige',
    description:
      'Ganz einfache Bilder, keine Buchstaben. Der kleine Bruder oder die kleine Schwester darf mitmachen und mitfühlen.',
    ages: '2–4 Jahre',
    accent: '#50a082',
    accentLight: 'rgba(80,160,130,0.12)',
  },
];

export default function Vorlagen() {
  return (
    <PainterlyShell>
      <PageMeta
        title="Vorlagen zum Ausdrucken: Ronki"
        description="Druckbare Routinen-Vorlagen für Kinder. Morgenroutine, Abendroutine und eine einfache Version für kleine Geschwister. Zum Ausmalen, kostenlos, ohne Anmeldung."
        canonicalPath="/vorlagen"
      />

      <section className="px-6 pt-32 pb-16 sm:pt-40 sm:pb-20">
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
              <span aria-hidden>←</span> Zurück
            </Link>
            <p className="text-xs uppercase tracking-[0.2em] text-teal font-medium mb-6">
              Zum Ausdrucken
            </p>
            <h1 className="font-display font-bold text-4xl sm:text-5xl lg:text-6xl leading-[1.04] tracking-tight text-teal-dark">
              Vorlagen für euren{' '}
              <em className="italic text-sage whitespace-nowrap">Kühlschrank</em>.
            </h1>
            <p className="mt-6 text-base sm:text-lg text-ink/75 max-w-2xl leading-relaxed">
              Bevor Ronki auf dem Handy läuft, hilft ein Blatt Papier am Kühlschrank schon sehr viel. Drei kostenlose Vorlagen, direkt aus dem Browser druckbar. Ohne Anmeldung. Ohne Werbung.
            </p>
          </motion.div>
        </div>
      </section>

      <section className="px-6 pb-24 sm:pb-28">
        <div className="max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8">
          {VORLAGEN.map((v, i) => (
            <motion.article
              key={v.slug}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-10%' }}
              transition={{ duration: 0.6, delay: i * 0.1, ease: EASE_OUT }}
              whileHover={{ y: -4 }}
              className="group relative flex flex-col rounded-2xl bg-white overflow-hidden"
              style={{
                boxShadow: '0 8px 28px -12px rgba(45,90,94,0.15)',
              }}
            >
              <div
                className="h-1.5 w-full"
                style={{ background: v.accent }}
              />
              <div className="p-6 sm:p-7 flex-1 flex flex-col">
                <span
                  className="self-start inline-flex items-center rounded-full px-3 py-1 text-[10px] font-display font-bold uppercase tracking-[0.15em] mb-4"
                  style={{ backgroundColor: v.accentLight, color: v.accent }}
                >
                  {v.ages}
                </span>
                <h2 className="font-display font-bold text-xl sm:text-2xl text-teal-dark leading-tight mb-2">
                  {v.title}
                </h2>
                <p className="text-xs uppercase tracking-[0.12em] text-ink/40 font-display font-semibold mb-4">
                  {v.subtitle}
                </p>
                <p className="text-sm text-ink/70 leading-relaxed mb-6 flex-1">
                  {v.description}
                </p>
                <Link
                  to={`/vorlagen/${v.slug}`}
                  className="inline-flex items-center justify-center gap-2 rounded-full px-5 py-3 text-cream font-display font-bold text-sm shadow-sm hover:shadow-md transition-all group-hover:gap-3"
                  style={{ backgroundColor: v.accent }}
                >
                  Öffnen & drucken
                  <span aria-hidden>→</span>
                </Link>
              </div>
            </motion.article>
          ))}
        </div>
      </section>

      <section className="px-6 py-16 sm:py-20 bg-cream/40">
        <div className="max-w-3xl mx-auto text-center">
          <motion.p
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="text-[0.7rem] uppercase tracking-[0.2em] text-teal-dark/60 font-semibold mb-4"
          >
            So funktioniert's
          </motion.p>
          <motion.h2
            initial={{ opacity: 0, y: 8 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="font-display font-bold text-2xl sm:text-3xl text-teal-dark mb-6"
          >
            Aufhängen. Ausmalen. Weitermachen.
          </motion.h2>
          <motion.p
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 0.15 }}
            className="text-base sm:text-lg text-ink/70 leading-relaxed max-w-xl mx-auto"
          >
            Klicke auf eine Vorlage, tippe im Browser auf „Drucken" (oder Cmd/Ctrl + P), und du hast das Blatt in zehn Sekunden in der Hand. Deine Kinder malen die Kreise aus, wenn sie eine Routine geschafft haben. Kein Stress, kein Wettbewerb.
          </motion.p>
        </div>
      </section>

      <Footer />
    </PainterlyShell>
  );
}
