import { motion } from 'motion/react';
import { WaitlistCTA } from './WaitlistCTA';
import { LAUNCH_STATE } from '../config/launch-state';

export function Hero() {
  return (
    <section className="relative overflow-hidden px-6 pt-16 pb-24 sm:pt-24 sm:pb-32">
      <div className="max-w-6xl mx-auto grid gap-12 lg:grid-cols-[1.1fr_1fr] items-center">
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: 'easeOut' }}
          className="flex flex-col gap-6"
        >
          <h1 className="text-5xl sm:text-6xl lg:text-7xl font-display leading-[1.05] tracking-tight">
            Ronki trägt die Routine mit.
          </h1>
          <p className="text-lg sm:text-xl max-w-xl opacity-85 leading-relaxed">
            Ein Drachen-Gefährte, der Kinder durch den Alltag begleitet — damit du nicht zum tausendsten Mal „Zähne putzen!" rufen musst.
          </p>
          <div className="flex flex-col gap-3 pt-2">
            <WaitlistCTA launchState={LAUNCH_STATE} />
            <a href="#wie-ronki-arbeitet" className="text-sm underline opacity-75 hover:opacity-100">
              Wie Ronki arbeitet →
            </a>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.96 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 1.2, ease: 'easeOut' }}
          className="relative"
        >
          <img
            src="/images/placeholder-hero-dragon.webp"
            alt="Ronki, der Drachen-Gefährte, in einer sanft gemalten Szene seines Sanctuary."
            className="w-full h-auto rounded-2xl shadow-lg"
            loading="eager"
            width={1600}
            height={1200}
          />
        </motion.div>
      </div>
    </section>
  );
}
