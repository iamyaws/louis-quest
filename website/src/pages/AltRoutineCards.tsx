import { motion } from 'motion/react';
import { Link } from 'react-router-dom';
import { PageMeta } from '../components/PageMeta';
import { PainterlyShell } from '../components/PainterlyShell';
import { Footer } from '../components/Footer';

const CARDS = [
  {
    num: '01',
    tag: 'MORGEN',
    title: 'Zähne putzen, Wasser trinken. Ronki erinnert leise.',
    image: '/art/routines/brushing-teeth.webp',
  },
  {
    num: '02',
    tag: 'NACHMITTAG',
    title: 'Heute malen wir den Garten. Ronki hält die Stifte.',
    image: '/art/bioms/Naschgarten_temptaion-garden.webp',
  },
  {
    num: '03',
    tag: 'ABEND',
    title: 'Das Ei wackelt. Drei Routinen geschafft.',
    image: '/art/companion/dragon-hatching.webp',
  },
];

export default function AltRoutineCards() {
  return (
    <PainterlyShell>
      <PageMeta
        title="Ein Tag mit Ronki — Routinen-Karten"
        description="Drei kleine Routinen: Morgen, Nachmittag, Abend. So begleitet Ronki dein Kind durch den Tag."
        noindex
      />

      {/* ── Hero ── */}
      <section className="px-6 pt-32 pb-20 sm:pt-40 sm:pb-24">
        <div className="max-w-5xl mx-auto">
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
              Drei kleine Routinen
            </p>
            <h1 className="font-display font-bold text-4xl sm:text-5xl lg:text-6xl leading-[1.04] tracking-tight text-teal-dark">
              Ein Tag mit Ronki.
            </h1>
          </motion.div>
        </div>
      </section>

      {/* ── Cards grid ── */}
      <section className="px-6 pb-28 sm:pb-32">
        <div className="max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8">
          {CARDS.map((card, i) => (
            <motion.article
              key={card.num}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-10%' }}
              transition={{ duration: 0.6, delay: i * 0.12 }}
              whileHover={{ scale: 1.02 }}
              className="group rounded-2xl border border-teal/15 bg-cream/60 backdrop-blur-sm overflow-hidden transition-shadow duration-300 hover:shadow-lg hover:border-teal/30"
            >
              {/* Image */}
              <div className="overflow-hidden">
                <img
                  src={card.image}
                  alt=""
                  loading="lazy"
                  className="aspect-[4/3] w-full object-cover rounded-t-2xl transition-transform duration-500 group-hover:scale-[1.04]"
                />
              </div>

              {/* Content */}
              <div className="p-5 sm:p-6">
                {/* Number badge + tag */}
                <div className="flex items-center gap-3 mb-4">
                  <span className="inline-flex items-center justify-center rounded-full bg-teal-dark/10 px-3 py-1 text-xs font-display font-bold text-teal-dark/70 tabular-nums">
                    {card.num}
                  </span>
                  <span className="text-xs uppercase tracking-[0.15em] text-sage font-display font-semibold">
                    {card.tag}
                  </span>
                </div>

                {/* Title */}
                <h2 className="font-display font-bold text-base sm:text-lg leading-snug text-teal-dark">
                  {card.title}
                </h2>
              </div>
            </motion.article>
          ))}
        </div>
      </section>

      <Footer />
    </PainterlyShell>
  );
}
