import { useRef } from 'react';
import { motion, useScroll, useTransform, useReducedMotion } from 'motion/react';

const BEATS = [
  {
    time: 'Morgen',
    label: 'Routine-Bogen',
    title: 'Ronki bittet ums Zähneputzen, als Teil der Geschichte.',
    body: 'Louis tickt das Zähneputzen ab. Ronki bedankt sich: „Die Karte nimmt Gestalt an." Keine Erinnerung. Kein Druck.',
    accent: '#c48a3a',
  },
  {
    time: 'Nachmittag',
    label: 'Bastel-Bogen',
    title: 'Eine Karte vom Garten malen.',
    body: 'Ronki schlägt vor: „Heute ist unser Schritt, eine Karte zu malen." Vorlage drucken, malen, zeigen, „Ich hab\'s geschafft" tippen.',
    accent: '#6b8e4e',
  },
  {
    time: 'Abend',
    label: 'Lore-Bogen',
    title: 'Eine kleine Geschichte im Sanctuary.',
    body: 'Louis besucht Ronki. Mini-Haustiere streicheln, Eier kontrollieren, ein paar Zeilen Geschichte lesen. Dann ins Bett.',
    accent: '#6b3a5c',
  },
];

export function ArcStoryboardModern() {
  const ref = useRef<HTMLDivElement>(null);
  const reduced = useReducedMotion();
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start start', 'end end'] });
  const x = useTransform(scrollYProgress, [0, 1], ['0%', '-66.67%']);

  return (
    <section
      ref={ref}
      className="relative border-t border-white/10"
      aria-labelledby="storyboard-heading-modern"
      style={{ height: reduced ? 'auto' : '300vh' }}
    >
      <div
        className={reduced ? 'px-6 py-24' : 'sticky top-0 h-screen overflow-hidden flex flex-col'}
      >
        <div className="px-6 pt-20 pb-10 max-w-6xl mx-auto w-full">
          <motion.p
            initial={{ opacity: 0, y: 8 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-xs uppercase tracking-[0.2em] text-[#c48a3a] mb-6 font-medium"
          >
            Wie ein Tag mit Ronki aussieht
          </motion.p>
          <h2
            id="storyboard-heading-modern"
            className="font-display text-4xl sm:text-6xl lg:text-7xl leading-[1.02] tracking-tight max-w-4xl"
          >
            Drei kleine Bögen, die einen Tag <em className="italic opacity-70">tragen</em>.
          </h2>
        </div>

        {reduced ? (
          <div className="px-6 mt-12 flex flex-col gap-12 max-w-4xl mx-auto w-full">
            {BEATS.map((beat) => (
              <BeatCard key={beat.time} beat={beat} />
            ))}
          </div>
        ) : (
          <div className="flex-1 overflow-hidden">
            <motion.div style={{ x }} className="flex h-full items-center gap-8 pl-6 pr-[33%]">
              {BEATS.map((beat) => (
                <div
                  key={beat.time}
                  className="shrink-0 w-[85vw] sm:w-[60vw] lg:w-[48vw] max-w-2xl"
                >
                  <BeatCard beat={beat} />
                </div>
              ))}
            </motion.div>
          </div>
        )}
      </div>
    </section>
  );
}

function BeatCard({ beat }: { beat: typeof BEATS[number] }) {
  return (
    <article className="group relative rounded-3xl border border-white/10 bg-white/[0.02] p-8 sm:p-12 backdrop-blur-sm transition-colors hover:border-white/20">
      <div
        aria-hidden
        className="absolute top-0 left-0 h-full w-1 rounded-l-3xl"
        style={{ backgroundColor: beat.accent }}
      />
      <div className="flex flex-col gap-5">
        <div className="flex items-center gap-3 text-xs uppercase tracking-[0.15em]">
          <span className="font-display" style={{ color: beat.accent }}>
            {beat.time}
          </span>
          <span className="opacity-30">/</span>
          <span className="opacity-60">{beat.label}</span>
        </div>
        <h3 className="font-display text-2xl sm:text-3xl lg:text-4xl leading-[1.1] tracking-tight">
          {beat.title}
        </h3>
        <p className="opacity-75 leading-relaxed text-[0.95rem] sm:text-base max-w-lg">
          {beat.body}
        </p>
      </div>
    </article>
  );
}
