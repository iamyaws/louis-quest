import { useRef } from 'react';
import { motion, useScroll, useTransform, useReducedMotion } from 'motion/react';
import { SectionHeading } from './SectionHeading';

const BEATS = [
  {
    label: 'Morgen · Routine-Bogen',
    title: 'Ronki bittet ums Zähneputzen — als Teil der Geschichte.',
    body: 'Louis tickt das Zähneputzen ab. Ronki bedankt sich: „Die Karte nimmt Gestalt an." Keine Erinnerung. Kein Druck.',
    image: '/images/placeholder-beat-morning.webp',
  },
  {
    label: 'Nachmittag · Bastel-Bogen',
    title: 'Eine Karte vom Garten malen.',
    body: 'Ronki schlägt vor: „Heute ist unser Schritt, eine Karte zu malen." Vorlage drucken, malen, zeigen, „Ich hab\'s geschafft" tippen.',
    image: '/images/placeholder-beat-afternoon.webp',
  },
  {
    label: 'Abend · Lore-Bogen',
    title: 'Eine kleine Geschichte im Sanctuary.',
    body: 'Louis besucht Ronki. Mini-Haustiere streicheln, Eier kontrollieren, ein paar Zeilen Geschichte lesen. Dann ins Bett.',
    image: '/images/placeholder-beat-evening.webp',
  },
];

export function ArcStoryboard() {
  return (
    <section className="px-6 py-24 bg-cream/40" aria-labelledby="storyboard-heading">
      <div className="max-w-6xl mx-auto">
        <SectionHeading id="storyboard-heading" eyebrow="Wie ein Tag mit Ronki aussieht">
          Drei kleine Bögen, die einen Tag tragen.
        </SectionHeading>
        <div className="flex flex-col gap-24 mt-12">
          {BEATS.map((beat, i) => (
            <Beat key={beat.label} beat={beat} index={i} />
          ))}
        </div>
      </div>
    </section>
  );
}

function Beat({ beat, index }: { beat: typeof BEATS[number]; index: number }) {
  const ref = useRef<HTMLDivElement>(null);
  const reducedMotion = useReducedMotion();
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start end', 'end start'] });
  const y = useTransform(scrollYProgress, [0, 1], [40, -40]);
  const opacity = useTransform(scrollYProgress, [0, 0.25, 0.75, 1], [0.3, 1, 1, 0.3]);

  const isEven = index % 2 === 0;

  return (
    <motion.div
      ref={ref}
      style={reducedMotion ? undefined : { y, opacity }}
      className={`grid gap-8 md:grid-cols-2 items-center ${isEven ? '' : 'md:[&>*:first-child]:order-2'}`}
    >
      <img
        src={beat.image}
        alt={beat.title}
        className="w-full aspect-[4/3] object-cover rounded-2xl shadow-md"
        loading="lazy"
        width={1200}
        height={900}
      />
      <div className="flex flex-col gap-3">
        <p className="text-sm uppercase tracking-widest text-ochre font-medium">{beat.label}</p>
        <h3 className="text-2xl sm:text-3xl font-display leading-tight">{beat.title}</h3>
        <p className="opacity-85 leading-relaxed">{beat.body}</p>
      </div>
    </motion.div>
  );
}
