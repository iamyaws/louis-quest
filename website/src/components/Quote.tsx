import { useRef, useState, useEffect, useCallback } from 'react';
import { motion, useScroll, useTransform, useReducedMotion } from 'motion/react';

const FEATURED = {
  text: '„Ronki nimmt uns tausend Diskussionen ab. Mein Sohn kümmert sich mit dem Drachen um seine Routinen, und er fühlt sich dabei selbstständig. Nicht kontrolliert."',
  name: 'Marc',
  role: 'Vater von Louis (7)',
  avatar: '/avatars/avatar-12.jpg',
};

const TESTIMONIALS = [
  {
    text: '„Die Schuh-Suche, der zweite Socken, das ständige ‚Mia, jetzt!\' Seit Ronki da ist, sind unsere Morgen leise. Sie macht ihr Ding, ich trink meinen Kaffee. Kein Streit mehr."',
    name: 'Andrea',
    role: 'Mutter von Mia (6)',
    avatar: '/avatars/avatar-48.jpg',
  },
  {
    text: '„Felix erzählt Ronki abends, was am Tag war. Nicht weil die App fragt, sondern weil er es will. Das war der Moment, an dem wir gemerkt haben: Das ist keine normale App."',
    name: 'Nina',
    role: 'Mutter von Felix (5)',
    avatar: '/avatars/avatar-5.jpg',
  },
  {
    text: '„Emilia kam aus zwei Wochen Urlaub zurück und hat Ronki als Erstes vom Meer erzählt. Zehn Minuten lang. Ich saß daneben und wusste: das ist mehr als eine App."',
    name: 'Jonas',
    role: 'Vater von Emilia (8)',
    avatar: '/avatars/avatar-33.jpg',
  },
  {
    text: '„Mit Zwillingen ist alles doppelt. Die Anzieh-Schlacht, das ‚Ich nicht!\', die Tränen am Morgen. Jeder hat jetzt seinen eigenen Drachen. Seine eigene kleine Welt. Und auf einmal ist es ruhig. Ich versteh selbst nicht ganz wie."',
    name: 'Sandra',
    role: 'Mutter von Zwillingen (6)',
    avatar: '/avatars/avatar-15.jpg',
  },
  {
    text: '„Ben war immer der, dem nichts richtig gelingt. Jetzt hat er in Ronkis Welt einen Pfad durch den Wald. Weil er eine Woche lang Zähne geputzt hat. Er zeigt ihn jedem: uns, Oma, der Erzieherin."',
    name: 'Claudia',
    role: 'Mutter von Ben (7)',
    avatar: '/avatars/avatar-20.jpg',
  },
  {
    text: '„Leo, mein Großer, schaut schon kürzer rein als am Anfang. Macht seine Sachen, prüft kurz bei Ronki, fertig. So war\'s uns versprochen: die App soll überflüssig werden. Bei ihm fängt\'s gerade an. Das macht mich ruhig."',
    name: 'Sofia',
    role: 'Mutter von Leo (8) und Nora (5)',
    avatar: '/avatars/avatar-47.jpg',
  },
];

export function Quote() {
  const ref = useRef<HTMLDivElement>(null);
  const reduced = useReducedMotion();
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start 0.85', 'center 0.4'] });
  const words = FEATURED.text.split(' ');

  return (
    <section ref={ref} className="relative px-6 py-28 sm:py-36" aria-labelledby="quote-heading">
      <div className="max-w-5xl mx-auto">
        <motion.p
          id="quote-heading"
          initial={{ opacity: 0, x: -20 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true, margin: '-10%' }}
          transition={{ duration: 0.6 }}
          className="text-xs uppercase tracking-[0.2em] text-teal mb-8 font-medium"
        >
          Was Eltern wirklich erleben
        </motion.p>

        <blockquote className="font-display font-bold text-3xl sm:text-5xl lg:text-6xl leading-[1.1] tracking-tight text-teal-dark">
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
          className="mt-10 flex items-center gap-4 text-sm text-teal-dark/70"
        >
          <img
            src={FEATURED.avatar}
            alt=""
            loading="lazy"
            className="h-12 w-12 rounded-full object-cover shadow-sm ring-2 ring-cream"
          />
          <div className="flex flex-col">
            <span className="font-semibold text-teal-dark">{FEATURED.name}</span>
            <span className="opacity-70">{FEATURED.role}</span>
          </div>
        </motion.footer>

        <motion.div
          initial={{ opacity: 0, scaleX: 0 }}
          whileInView={{ opacity: 1, scaleX: 1 }}
          viewport={{ once: true, margin: '-10%' }}
          transition={{ duration: 0.8 }}
          className="mt-20 mb-10 h-px w-24 origin-left bg-gradient-to-r from-teal/40 via-teal/20 to-transparent"
        />

        <motion.p
          initial={{ opacity: 0, y: 6 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-10%' }}
          transition={{ duration: 0.5 }}
          className="text-xs uppercase tracking-[0.2em] text-teal/70 mb-5 font-medium"
        >
          Weitere Stimmen
        </motion.p>

        <TestimonialsCarousel items={TESTIMONIALS} />
      </div>
    </section>
  );
}

function TestimonialsCarousel({ items }: { items: typeof TESTIMONIALS }) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const cardRefs = useRef<(HTMLLIElement | null)[]>([]);
  const [active, setActive] = useState(0);

  const scrollToIndex = useCallback((i: number) => {
    const card = cardRefs.current[i];
    const container = scrollRef.current;
    if (!card || !container) return;
    const containerRect = container.getBoundingClientRect();
    const cardRect = card.getBoundingClientRect();
    const delta = cardRect.left - containerRect.left;
    const target = container.scrollLeft + delta;
    const originalSnapType = container.style.scrollSnapType;
    container.style.scrollSnapType = 'none';
    container.scrollTo({ left: target, behavior: 'smooth' });
    window.setTimeout(() => {
      container.style.scrollSnapType = originalSnapType;
    }, 600);
  }, []);

  useEffect(() => {
    const container = scrollRef.current;
    if (!container) return;
    let raf = 0;
    const onScroll = () => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(() => {
        const containerLeft = container.getBoundingClientRect().left;
        let closest = 0;
        let minDist = Infinity;
        cardRefs.current.forEach((card, i) => {
          if (!card) return;
          const cardLeft = card.getBoundingClientRect().left;
          const dist = Math.abs(cardLeft - containerLeft);
          if (dist < minDist) {
            minDist = dist;
            closest = i;
          }
        });
        setActive(closest);
      });
    };
    container.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
    return () => {
      container.removeEventListener('scroll', onScroll);
      cancelAnimationFrame(raf);
    };
  }, []);

  const last = items.length - 1;

  return (
    <div>
      <div
        ref={scrollRef}
        className="-mx-6 overflow-x-auto snap-x snap-mandatory scroll-pl-6 px-6 pb-6 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
      >
        <ul className="flex gap-5 sm:gap-6">
          {items.map((t, i) => (
            <li
              key={t.name}
              ref={(el) => { cardRefs.current[i] = el; }}
              className="snap-start shrink-0 w-[85%] min-w-[17rem] sm:w-[calc(50%-12px)] lg:w-[calc(33.333%-16px)]"
            >
              <motion.figure
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-10%' }}
                transition={{ duration: 0.7, delay: (i % 3) * 0.08, ease: [0.2, 0.7, 0.2, 1] }}
                className="h-full rounded-2xl bg-cream/70 backdrop-blur-sm border border-teal/10 p-6 flex flex-col gap-5"
                style={{ boxShadow: '0 1px 0 rgba(45,90,94,0.04), 0 20px 40px -30px rgba(45,90,94,0.2)' }}
              >
                <blockquote className="text-base leading-[1.55] text-ink/85">{t.text}</blockquote>
                <figcaption className="mt-auto flex items-center gap-3 text-sm">
                  <img
                    src={t.avatar}
                    alt=""
                    loading="lazy"
                    className="h-10 w-10 rounded-full object-cover ring-2 ring-cream shadow-sm"
                  />
                  <div className="flex flex-col">
                    <span className="font-semibold text-teal-dark">{t.name}</span>
                    <span className="text-xs opacity-75">{t.role}</span>
                  </div>
                </figcaption>
              </motion.figure>
            </li>
          ))}
        </ul>
      </div>

      <div className="mt-6 flex items-center justify-center gap-4">
        <button
          type="button"
          onClick={() => scrollToIndex(Math.max(0, active - 1))}
          disabled={active === 0}
          aria-label="Vorherige Stimme"
          className="h-11 w-11 rounded-full border border-teal/25 bg-cream text-teal-dark/80 flex items-center justify-center transition-all hover:border-teal/50 hover:text-teal-dark hover:shadow-sm disabled:opacity-30 disabled:cursor-not-allowed"
        >
          <Chevron direction="left" />
        </button>

        <div role="tablist" aria-label="Weitere Stimmen" className="flex items-center gap-2">
          {items.map((_, i) => (
            <button
              key={i}
              type="button"
              role="tab"
              onClick={() => scrollToIndex(i)}
              aria-label={`Stimme ${i + 1} von ${items.length}`}
              aria-selected={active === i}
              className="min-h-[44px] min-w-[44px] flex items-center justify-center"
            >
              <span className={`block h-2 rounded-full transition-all duration-300 ${
                active === i ? 'w-8 bg-teal' : 'w-2 bg-teal/25 hover:bg-teal/45'
              }`} />
            </button>
          ))}
        </div>

        <button
          type="button"
          onClick={() => scrollToIndex(Math.min(last, active + 1))}
          disabled={active === last}
          aria-label="Nächste Stimme"
          className="h-11 w-11 rounded-full border border-teal/25 bg-cream text-teal-dark/80 flex items-center justify-center transition-all hover:border-teal/50 hover:text-teal-dark hover:shadow-sm disabled:opacity-30 disabled:cursor-not-allowed"
        >
          <Chevron direction="right" />
        </button>
      </div>
    </div>
  );
}

function Chevron({ direction }: { direction: 'left' | 'right' }) {
  return (
    <svg
      aria-hidden
      width="14"
      height="14"
      viewBox="0 0 14 14"
      fill="none"
      style={{ transform: direction === 'left' ? 'rotate(180deg)' : undefined }}
    >
      <path
        d="M5 3l4 4-4 4"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
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
