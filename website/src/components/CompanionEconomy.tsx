import { motion } from 'motion/react';

const FEATURES = [
  {
    index: '01',
    tag: 'Begleitung',
    title: 'Dein Gefährte wächst mit',
    body: 'Ronki begleitet dein Kind durch den Tag, nicht als Belohnung, sondern als Weggefährte. Jede erledigte Routine stärkt die gemeinsame Reise.',
    image: '/art/companion/dragon-baby.webp',
    gradient: 'radial-gradient(circle at 50% 30%, rgba(45,90,94,0.15) 0%, transparent 70%)',
    tagBg: 'bg-teal/10',
    tagText: 'text-teal-dark',
  },
  {
    index: '02',
    tag: 'Echtes Leben',
    title: 'Echte Handlung, echtes Wachstum',
    body: 'Zähne putzen, Schuhe anziehen, Tasche packen. Das Abenteuer passiert im echten Leben, nicht auf dem Bildschirm.',
    image: '/art/companion/dragon-young.webp',
    gradient: 'radial-gradient(circle at 50% 30%, rgba(107,143,113,0.15) 0%, transparent 70%)',
    tagBg: 'bg-sage/15',
    tagText: 'text-sage',
  },
  {
    index: '03',
    tag: 'Loslassen',
    title: 'Fortschritt, der bleibt',
    body: 'Keine Punkte, die verfallen. Keine Streaks, die stressen. Dein Kind baut Gewohnheiten auf, die bleiben, auch wenn Ronki längst im Nest schläft.',
    image: '/art/companion/dragon-majestic.webp',
    gradient: 'radial-gradient(circle at 50% 30%, rgba(234,195,62,0.12) 0%, transparent 70%)',
    tagBg: 'bg-mustard/15',
    tagText: 'text-teal-dark',
  },
];

export function CompanionEconomy() {
  return (
    <section className="px-6 py-24 sm:py-28 border-t border-teal/10" aria-labelledby="economy-heading">
      <div className="max-w-5xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-15%' }}
          transition={{ duration: 0.7 }}
          className="text-center mb-16"
        >
          <p className="text-xs uppercase tracking-[0.2em] text-teal-dark/85 mb-6 font-semibold">
            So funktioniert Ronki
          </p>
          <h2
            id="economy-heading"
            className="font-display font-bold text-4xl sm:text-5xl lg:text-6xl leading-[1.1] tracking-tight text-teal-dark max-w-4xl mx-auto"
          >
            Ein Begleiter für den Alltag.{' '}
            <em className="italic text-sage">Nicht für den Bildschirm.</em>
          </h2>
          <p className="mt-6 text-base sm:text-lg text-ink/65 max-w-2xl mx-auto leading-relaxed">
            Ronki verbindet digitale Begleitung mit echtem Handeln. Dein Kind erledigt seine Routinen, und der Drache wächst mit jedem Schritt.
          </p>
        </motion.div>

        <div className="grid md:grid-cols-3 gap-6">
          {FEATURES.map((f, i) => (
            <motion.div
              key={f.index}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              whileHover={{ y: -8, transition: { type: 'spring', stiffness: 200, damping: 15 } }}
              viewport={{ once: true, margin: '-10%' }}
              transition={{ duration: 0.6, delay: i * 0.1 }}
              className="relative flex h-[420px] sm:h-[440px] flex-col justify-end overflow-hidden rounded-2xl border border-teal/10 bg-cream/50 backdrop-blur-sm p-6 sm:p-7 cursor-default group"
            >
              <div
                className="absolute inset-0 z-0 opacity-60"
                style={{ background: f.gradient }}
              />

              <span className="absolute top-5 left-6 font-display font-bold text-base text-teal-dark/20 z-10">
                {f.index}
              </span>

              <motion.img
                src={f.image}
                alt=""
                className="absolute top-[28%] left-1/2 -translate-x-1/2 -translate-y-1/2 w-36 sm:w-44 h-36 sm:h-44 object-contain z-[5] drop-shadow-lg"
                whileHover={{ scale: 1.15, rotate: 3, y: -10 }}
                transition={{ type: 'spring', stiffness: 200, damping: 15 }}
              />

              <div className="relative z-20 rounded-xl border border-teal/10 bg-cream/80 backdrop-blur-sm p-4">
                <span className={`inline-block rounded-full px-3 py-1 text-xs font-display font-bold uppercase tracking-wider mb-2 ${f.tagBg} ${f.tagText}`}>
                  {f.tag}
                </span>
                <h3 className="font-display font-bold text-base sm:text-lg text-teal-dark leading-tight mb-1">
                  {f.title}
                </h3>
                <p className="text-xs sm:text-sm text-ink/60 leading-relaxed">{f.body}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
