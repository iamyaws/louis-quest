import { motion } from 'motion/react';
import { WaitlistCTA } from './WaitlistCTA';
import { LAUNCH_STATE, getLaunchCopy } from '../config/launch-state';
import { EASE_OUT } from '../lib/motion';

export function ClosingCTA() {
  const copy = getLaunchCopy(LAUNCH_STATE);
  // Direct-install states use a punchy one-liner that matches the
  // action ("try it right now"); waitlist-flavoured states keep the
  // "we'll ping you at start-day" promise.
  const blurb =
    copy.ctaAction === 'install'
      ? 'Läuft direkt im Browser. Kein Store, kein Download, kostenlos.'
      : 'Trag dich ein. Wir melden uns genau einmal, am Start-Tag.';
  return (
    <section
      className="relative px-6 py-24 sm:py-28 border-t border-teal/10"
      aria-labelledby="closing-cta-heading"
    >
      <div className="max-w-2xl mx-auto text-center flex flex-col items-center">
        {/* Dragon baby — small decorative element */}
        <motion.img
          src="/art/companion/dragon-baby.webp"
          alt=""
          role="presentation"
          initial={{ opacity: 0, y: 12 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-10%' }}
          transition={{ duration: 0.8, ease: EASE_OUT }}
          className="w-20 h-20 object-contain mb-6"
        />

        <motion.p
          initial={{ opacity: 0, y: 8 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="text-xs uppercase tracking-[0.2em] text-teal-dark/85 font-semibold mb-4"
        >
          Bereit?
        </motion.p>

        <motion.h2
          id="closing-cta-heading"
          initial={{ opacity: 0, y: 12 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-15%' }}
          transition={{ duration: 0.7, delay: 0.15 }}
          className="font-display font-bold text-3xl sm:text-4xl lg:text-5xl leading-[1.1] tracking-tight text-teal-dark"
        >
          Ronki wartet auf dein Kind.
        </motion.h2>

        <motion.p
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.25 }}
          className="mt-4 text-base opacity-70 max-w-md leading-relaxed"
        >
          {blurb}
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 12 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.35 }}
          className="mt-8 w-full max-w-md flex justify-center"
        >
          <WaitlistCTA launchState={LAUNCH_STATE} />
        </motion.div>
      </div>
    </section>
  );
}
