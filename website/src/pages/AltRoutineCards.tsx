import { motion } from 'motion/react';
import { Link } from 'react-router-dom';
import { PageMeta } from '../components/PageMeta';
import { PainterlyShell } from '../components/PainterlyShell';
import { Footer } from '../components/Footer';
import { EASE_OUT } from '../lib/motion';

const CARDS = [
  {
    index: '001',
    tag: 'MORGEN',
    title: 'Zähne putzen, Wasser trinken. Ronki erinnert leise.',
    image: '/art/routines/brushing-teeth.webp',
    accent: '#d97706', // warm amber
    accentBg: 'rgba(217,119,6,0.12)',
  },
  {
    index: '002',
    tag: 'NACHMITTAG',
    title: 'Heute malen wir den Garten. Ronki hält die Stifte.',
    image: '/art/bioms/Naschgarten_temptaion-garden.webp',
    accent: '#50a082', // sage
    accentBg: 'rgba(80,160,130,0.12)',
  },
  {
    index: '003',
    tag: 'ABEND',
    title: 'Das Ei wackelt. Drei Routinen geschafft.',
    image: '/art/companion/dragon-hatching.webp',
    accent: '#2D5A5E', // teal
    accentBg: 'rgba(45,90,94,0.12)',
  },
];

export default function AltRoutineCards() {
  return (
    <PainterlyShell>
      <PageMeta
        title="Ein Tag mit Ronki · Routinen-Karten"
        description="Drei kleine Routinen: Morgen, Nachmittag, Abend."
        noindex
      />

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
              <span aria-hidden>←</span> Zurück
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

      <section className="px-6 pb-28 sm:pb-32">
        <div className="max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8">
          {CARDS.map((card, i) => (
            <motion.article
              key={card.index}
              initial={{ opacity: 0, y: 28 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-10%' }}
              transition={{ duration: 0.6, delay: i * 0.12, ease: EASE_OUT }}
              whileHover={{ y: -6 }}
              className="group relative flex flex-col rounded-[1.5rem] bg-white overflow-hidden cursor-default"
              style={{
                boxShadow: '0 4px 24px rgba(45,90,94,0.08), 0 1px 4px rgba(45,90,94,0.06)',
              }}
            >
              {/* Accent top bar */}
              <div
                className="h-1.5 w-full"
                style={{ background: card.accent }}
              />

              {/* Index number — large, faded */}
              <div className="px-5 pt-5 pb-2 flex items-start justify-between">
                <span
                  className="font-display font-extrabold text-5xl leading-none tracking-tight"
                  style={{ color: card.accent, opacity: 0.15 }}
                >
                  {card.index}
                </span>
                <span
                  className="mt-1 inline-flex items-center rounded-full px-3 py-1 text-[10px] font-display font-bold uppercase tracking-[0.15em]"
                  style={{ backgroundColor: card.accentBg, color: card.accent }}
                >
                  {card.tag}
                </span>
              </div>

              {/* Image — large, dominant */}
              <div className="px-4 pb-2">
                <div className="overflow-hidden rounded-xl">
                  <img
                    src={card.image}
                    alt=""
                    loading="lazy"
                    className="aspect-[4/3] w-full object-cover transition-transform duration-700 group-hover:scale-[1.06]"
                  />
                </div>
              </div>

              {/* Title */}
              <div className="px-5 pt-3 pb-6 flex-1 flex items-start">
                <p className="font-display font-bold text-base sm:text-lg leading-snug text-teal-dark">
                  {card.title}
                </p>
              </div>

              {/* Hover glow at bottom */}
              <div
                className="absolute bottom-0 inset-x-0 h-20 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"
                style={{
                  background: `linear-gradient(to top, ${card.accentBg}, transparent)`,
                }}
              />
            </motion.article>
          ))}
        </div>
      </section>

      <Footer />
    </PainterlyShell>
  );
}
