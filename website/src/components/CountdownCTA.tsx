import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { WaitlistCTA } from './WaitlistCTA';
import { LAUNCH_STATE } from '../config/launch-state';

const LAUNCH_DATE = new Date('2026-09-01T00:00:00');

function getTimeLeft() {
  const diff = LAUNCH_DATE.getTime() - Date.now();
  if (diff <= 0) return { days: 0, hours: 0, minutes: 0, seconds: 0 };
  return {
    days: Math.floor(diff / (1000 * 60 * 60 * 24)),
    hours: Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
    minutes: Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60)),
    seconds: Math.floor((diff % (1000 * 60)) / 1000),
  };
}

function AnimatedDigit({ value }: { value: string }) {
  return (
    <div className="relative h-[1em] w-[1.2em] overflow-hidden">
      <AnimatePresence mode="popLayout">
        <motion.span
          key={value}
          initial={{ y: '100%', opacity: 0 }}
          animate={{ y: '0%', opacity: 1 }}
          exit={{ y: '-100%', opacity: 0 }}
          transition={{ type: 'spring', stiffness: 300, damping: 30 }}
          className="absolute inset-0 flex items-center justify-center"
        >
          {value}
        </motion.span>
      </AnimatePresence>
    </div>
  );
}

function TimeUnit({ value, label }: { value: number; label: string }) {
  const display = String(value).padStart(2, '0');
  return (
    <div className="flex flex-col items-center gap-2">
      <div className="flex items-center justify-center bg-cream/60 backdrop-blur-sm border border-teal/15 rounded-2xl px-4 py-3 sm:px-6 sm:py-5 min-w-[70px] sm:min-w-[90px] shadow-sm">
        <span className="font-display font-bold text-3xl sm:text-5xl lg:text-6xl tracking-tight text-teal-dark flex">
          <AnimatedDigit value={display[0]} />
          <AnimatedDigit value={display[1]} />
        </span>
      </div>
      <span className="text-xs font-semibold uppercase tracking-[0.2em] text-ink/60">
        {label}
      </span>
    </div>
  );
}

export function CountdownCTA() {
  const [time, setTime] = useState<ReturnType<typeof getTimeLeft> | null>(null);

  useEffect(() => {
    setTime(getTimeLeft());
    const interval = setInterval(() => setTime(getTimeLeft()), 1000);
    return () => clearInterval(interval);
  }, []);

  if (!time) return null;

  return (
    <section className="relative px-6 py-28 sm:py-32 border-t border-teal/10 overflow-hidden" aria-labelledby="countdown-heading">
      <div className="absolute top-0 left-1/4 w-[600px] h-[400px] bg-teal/5 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 right-1/4 w-[500px] h-[400px] bg-mustard/5 rounded-full blur-3xl pointer-events-none" />

      <div className="relative max-w-4xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-10%' }}
          transition={{ duration: 0.8 }}
          className="rounded-3xl border border-teal/15 bg-cream/40 backdrop-blur-xl p-8 sm:p-12 lg:p-16 flex flex-col items-center gap-8 sm:gap-10 text-center shadow-lg"
        >
          <div className="flex flex-col items-center gap-4">
            <motion.span
              initial={{ scale: 0.9, opacity: 0 }}
              whileInView={{ scale: 1, opacity: 1 }}
              viewport={{ once: true }}
              transition={{ delay: 0.2, duration: 0.5 }}
              className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-mustard/20 border border-mustard/30 text-xs font-display font-bold text-teal-dark uppercase tracking-wider"
            >
              <span className="h-1.5 w-1.5 rounded-full bg-mustard animate-pulse" />
              Bald verfügbar
            </motion.span>

            <h2
              id="countdown-heading"
              className="font-display font-extrabold text-4xl sm:text-5xl lg:text-7xl leading-[1.1] tracking-tight text-teal-dark"
            >
              Der Start naht.
            </h2>

            <p className="text-base sm:text-lg text-ink/60 max-w-xl leading-relaxed">
              Trag dich ein. Wir melden uns genau einmal: am Start-Tag. Keine Werbung, kein Nachfassen.
            </p>
          </div>

          <div className="flex items-center gap-2 sm:gap-3">
            <TimeUnit value={time.days} label="Tage" />
            <span className="text-2xl sm:text-4xl font-light text-teal-dark/20 animate-pulse pb-6">:</span>
            <TimeUnit value={time.hours} label="Stunden" />
            <span className="text-2xl sm:text-4xl font-light text-teal-dark/20 animate-pulse pb-6">:</span>
            <TimeUnit value={time.minutes} label="Minuten" />
            <span className="text-2xl sm:text-4xl font-light text-teal-dark/20 animate-pulse pb-6 hidden sm:block">:</span>
            <div className="hidden sm:block">
              <TimeUnit value={time.seconds} label="Sekunden" />
            </div>
          </div>

          <motion.div
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.4, duration: 0.5 }}
            className="w-full max-w-md"
          >
            <WaitlistCTA launchState={LAUNCH_STATE} />
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}
