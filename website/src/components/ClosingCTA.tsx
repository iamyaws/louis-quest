import { motion } from 'motion/react';
import { SparkleText } from './primitives/SparkleText';
import { WaitlistCTA } from './WaitlistCTA';
import { LAUNCH_STATE } from '../config/launch-state';

export function ClosingCTA() {
  return (
    <section
      className="relative px-6 py-28 sm:py-32 border-t border-teal/10"
      aria-labelledby="closing-cta-heading"
    >
      <div className="max-w-4xl mx-auto text-center flex flex-col items-center gap-10">
        <motion.p
          initial={{ opacity: 0, y: 8 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-xs uppercase tracking-[0.2em] text-teal font-medium"
        >
          Bald verfügbar
        </motion.p>
        <motion.h2
          id="closing-cta-heading"
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-20%' }}
          transition={{ duration: 0.8 }}
          className="font-display font-extrabold text-5xl sm:text-7xl lg:text-8xl leading-[0.98] tracking-tight text-teal-dark"
        >
          Eine E-Mail.{' '}
          <em className="italic text-sage">
            Ein <SparkleText sparkleCount={8} color="#FCD34D">Tag</SparkleText>.
          </em>
        </motion.h2>
        <motion.p
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7, delay: 0.2 }}
          className="text-lg opacity-70 max-w-xl leading-relaxed"
        >
          Trag dich ein. Wir melden uns genau einmal: am Start-Tag. Danach hörst du nichts mehr von uns. Keine Werbung, kein Nachfassen.
        </motion.p>
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7, delay: 0.3 }}
          className="w-full max-w-md flex justify-center"
        >
          <WaitlistCTA launchState={LAUNCH_STATE} />
        </motion.div>
      </div>
    </section>
  );
}
