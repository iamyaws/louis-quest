import { motion } from 'motion/react';
import { WaitlistCTAModern } from './WaitlistCTAModern';
import { LAUNCH_STATE } from '../../config/launch-state';

export function ClosingCTAModern() {
  return (
    <section
      className="relative px-6 py-32 border-t border-white/10"
      aria-labelledby="closing-cta-heading-modern"
    >
      <div className="max-w-4xl mx-auto text-center flex flex-col items-center gap-10">
        <motion.p
          initial={{ opacity: 0, y: 8 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-xs uppercase tracking-[0.2em] text-[#c48a3a] font-medium"
        >
          Bald verfügbar
        </motion.p>
        <motion.h2
          id="closing-cta-heading-modern"
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-20%' }}
          transition={{ duration: 0.8 }}
          className="font-display text-5xl sm:text-7xl lg:text-8xl leading-[0.98] tracking-tight"
        >
          Eine E-Mail. <em className="italic opacity-70">Ein Tag.</em>
        </motion.h2>
        <motion.p
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7, delay: 0.2 }}
          className="text-lg opacity-70 max-w-xl"
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
          <WaitlistCTAModern launchState={LAUNCH_STATE} />
        </motion.div>
      </div>
    </section>
  );
}
