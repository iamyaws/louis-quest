import { motion } from 'motion/react';

const BEATS = [
  {
    time: 'Morgen',
    title: 'Ronki wartet schon am Becher.',
    body: 'Sieben Uhr. Louis kommt verschlafen ins Bad. Der Drache sitzt schon neben seinem Lieblingsbecher. „Komm, zuerst die Zähne", sagt Ronki. „Dann hol ich dir Wasser nach." Louis putzt. Niemand muss nachfragen.',
    image: '/art/routines/getting-ready.webp',
    imageAlt: 'Ein Junge macht sich mit seinem Drachen bereit für den Tag.',
    accent: '#FCD34D',
    wash: 'rgba(252, 211, 77, 0.28)',
  },
  {
    time: 'Nachmittag',
    title: 'Heute zeichnen wir den Garten.',
    body: '„Ich kenn nur den Garten hier bei mir", sagt Ronki. „Wie sieht deiner aus?" Louis holt Papier, malt den Apfelbaum und die Schnecke am Zaun. Später fotografiert er die Karte und tippt: geschafft.',
    image: '/art/bioms/Naschgarten_temptaion-garden.webp',
    imageAlt: 'Der Naschgarten, warmer Nachmittag zwischen Äpfeln und Blüten.',
    accent: '#50A082',
    wash: 'rgba(80, 160, 130, 0.26)',
  },
  {
    time: 'Abend',
    title: 'Das Ei wackelt heute zum ersten Mal.',
    body: 'Vor dem Lichtausmachen geht Louis nochmal zu Ronki. Kein Muss, nur wenn er mag. Drei Mini-Haustiere schlafen schon. Das Ei wackelt zum ersten Mal im Nest, weil Louis diese Woche drei Karten gemalt hat. „Bis morgen, Ronki." Der Drache macht das Licht am Nest aus.',
    image: '/art/companion/dragon-hatching.webp',
    imageAlt: 'Das wackelnde Ei im Nest, kurz vor dem Schlüpfen.',
    accent: '#2D5A5E',
    wash: 'rgba(45, 90, 94, 0.22)',
  },
];

export function ArcStoryboard() {
  return (
    <section
      className="relative border-t border-teal/10 px-6 py-24 sm:py-32"
      aria-labelledby="storyboard-heading"
    >
      <div className="max-w-6xl mx-auto">
        <motion.p
          initial={{ opacity: 0, y: 8 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-xs uppercase tracking-[0.2em] text-teal mb-6 font-medium"
        >
          Wie ein Tag mit Ronki aussieht
        </motion.p>
        <motion.h2
          id="storyboard-heading"
          initial={{ opacity: 0, y: 12 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7 }}
          className="font-display font-bold text-4xl sm:text-5xl lg:text-6xl leading-[1.1] tracking-tight text-teal-dark max-w-3xl"
        >
          Ein Tag. Drei ruhige <em className="italic text-sage whitespace-nowrap">Routinen</em> für dein Kind.
        </motion.h2>
        <motion.p
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="mt-6 text-base sm:text-lg text-ink/70 max-w-2xl leading-relaxed"
        >
          Kein straffer Plan, kein Minutenzähler. Drei ruhige Szenen, in denen ein kleiner Drache einfach da ist. Mitläuft. Mitdenkt. Und mit der Zeit zum Freund wird, dem dein Kind etwas anvertraut.
        </motion.p>

        <div className="mt-20 flex flex-col gap-24 sm:gap-28">
          {BEATS.map((beat, i) => (
            <BeatRow key={beat.time} beat={beat} flip={i % 2 === 1} index={i} />
          ))}
        </div>
      </div>
    </section>
  );
}

function BeatRow({
  beat,
  flip,
  index,
}: {
  beat: typeof BEATS[number];
  flip: boolean;
  index: number;
}) {
  return (
    <motion.article
      initial={{ opacity: 0, y: 32 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-15%' }}
      transition={{ duration: 0.8, delay: 0.05, ease: [0.2, 0.7, 0.2, 1] }}
      className={`grid gap-10 sm:gap-14 md:grid-cols-[1.05fr_1fr] items-center ${
        flip ? 'md:[&>*:first-child]:order-2' : ''
      }`}
    >
      <figure className="relative">
        <div
          aria-hidden
          className="absolute -inset-6 rounded-[2.5rem] blur-3xl opacity-70"
          style={{ backgroundColor: beat.wash }}
        />
        <div
          className="relative aspect-[5/4] overflow-hidden rounded-[2rem] ring-1 ring-inset ring-teal/10"
          style={{ boxShadow: '0 30px 60px -30px rgba(45,90,94,0.35)' }}
        >
          <img
            src={beat.image}
            alt={beat.imageAlt}
            width={800}
            height={640}
            loading={index === 0 ? 'eager' : 'lazy'}
            className="h-full w-full object-cover"
          />
          <div
            aria-hidden
            className="absolute inset-0 bg-gradient-to-tr from-cream/30 via-transparent to-transparent"
          />
        </div>
      </figure>

      <div className="flex flex-col gap-6">
        <div className="flex items-center gap-3">
          <span
            className="inline-flex h-10 items-center rounded-full px-4 font-display font-semibold text-xs uppercase tracking-[0.15em] text-white shadow-sm"
            style={{ backgroundColor: beat.accent }}
          >
            {beat.time}
          </span>
          <span
            aria-hidden
            className="h-px flex-1 origin-left"
            style={{ backgroundColor: beat.accent, opacity: 0.4 }}
          />
        </div>
        <h3 className="font-display font-bold text-[1.85rem] sm:text-[2.4rem] lg:text-[2.8rem] leading-[1.1] tracking-tight text-teal-dark">
          {beat.title}
        </h3>
        <p className="text-ink/75 leading-[1.7] text-base sm:text-lg max-w-xl">
          {beat.body}
        </p>
      </div>
    </motion.article>
  );
}
