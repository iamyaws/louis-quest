import { useRef } from 'react';
import { motion, useScroll, useTransform, useReducedMotion } from 'motion/react';

const QUOTE =
  '„Ronki nimmt uns tausend Diskussionen ab. Mein Sohn kümmert sich mit dem Drachen um seine Routinen. Er fühlt sich dabei selbstständig, nicht kontrolliert."';

export function QuoteModern() {
  const ref = useRef<HTMLDivElement>(null);
  const reduced = useReducedMotion();
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start 0.9', 'end 0.2'] });
  const words = QUOTE.split(' ');

  return (
    <section ref={ref} className="relative px-6 py-40" aria-labelledby="quote-heading-modern">
      <div className="max-w-5xl mx-auto">
        <motion.p
          id="quote-heading-modern"
          initial={{ opacity: 0, x: -20 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true, margin: '-10%' }}
          transition={{ duration: 0.6 }}
          className="text-xs uppercase tracking-[0.2em] text-[#c48a3a] mb-10 font-medium"
        >
          Was Eltern wirklich erleben
        </motion.p>

        <blockquote className="font-display text-3xl sm:text-5xl lg:text-6xl leading-[1.1] tracking-tight">
          {words.map((word, i) => {
            const start = i / words.length;
            const end = (i + 1) / words.length;
            return (
              <WordReveal
                key={`${word}-${i}`}
                word={word}
                start={start}
                end={end}
                progress={scrollYProgress}
                reduced={!!reduced}
              />
            );
          })}
        </blockquote>

        <motion.footer
          initial={{ opacity: 0, y: 8 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="mt-12 flex items-center gap-4 text-sm opacity-70"
        >
          <span className="grid h-12 w-12 place-items-center rounded-full bg-gradient-to-br from-[#c48a3a] to-[#6b3a5c] font-display text-[#12100c]">
            M
          </span>
          <div className="flex flex-col">
            <span className="font-medium">Marc</span>
            <span className="opacity-75">Vater von Louis (7)</span>
          </div>
        </motion.footer>
      </div>
    </section>
  );
}

function WordReveal({
  word,
  start,
  end,
  progress,
  reduced,
}: {
  word: string;
  start: number;
  end: number;
  progress: ReturnType<typeof useScroll>['scrollYProgress'];
  reduced: boolean;
}) {
  const opacity = useTransform(progress, [start, end], [0.18, 1]);
  return (
    <motion.span
      style={reduced ? { opacity: 1 } : { opacity }}
      className="inline-block mr-[0.22em]"
    >
      {word}
    </motion.span>
  );
}
