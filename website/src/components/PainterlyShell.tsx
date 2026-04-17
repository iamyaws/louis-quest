import { ReactNode } from 'react';
import { motion, useScroll, useSpring, useTransform, useReducedMotion } from 'motion/react';

type Props = { children: ReactNode };

export function PainterlyShell({ children }: Props) {
  const reduced = useReducedMotion();
  const { scrollYProgress } = useScroll();
  const progress = useSpring(scrollYProgress, { stiffness: 80, damping: 20 });
  const washY = useTransform(scrollYProgress, [0, 1], ['0%', '30%']);
  const washX = useTransform(scrollYProgress, [0, 0.5, 1], ['0%', '-8%', '4%']);

  return (
    <div className="relative min-h-screen bg-cream text-ink selection:bg-mustard selection:text-teal-dark">
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-[100] focus:px-4 focus:py-2 focus:rounded-full focus:bg-teal-dark focus:text-cream focus:font-display focus:font-semibold focus:text-sm focus:shadow-lg"
      >
        Zum Hauptinhalt springen
      </a>
      <div aria-hidden className="pointer-events-none fixed inset-0 overflow-hidden">
        <motion.div
          style={reduced ? undefined : { y: washY, x: washX }}
          className="absolute left-[10%] top-[-10%] h-[60vh] w-[60vh] rounded-full blur-[100px] opacity-50"
        >
          <div className="h-full w-full rounded-full bg-[radial-gradient(circle_at_center,#FCD34D_0%,#FDE589_40%,transparent_70%)]" />
        </motion.div>
        <motion.div
          style={reduced ? undefined : { y: washY, x: washX }}
          className="absolute right-[5%] top-[30%] h-[55vh] w-[55vh] rounded-full blur-[120px] opacity-40"
        >
          <div className="h-full w-full rounded-full bg-[radial-gradient(circle_at_center,#7BB89F_0%,#50A082_40%,transparent_70%)]" />
        </motion.div>
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_80%,rgba(45,90,94,0.08)_0%,transparent_50%)]" />
        <div
          className="absolute inset-0 opacity-[0.05] mix-blend-multiply"
          style={{
            backgroundImage:
              'radial-gradient(circle at 20% 30%, #2D5A5E 1px, transparent 1px), radial-gradient(circle at 70% 60%, #50A082 1px, transparent 1px)',
            backgroundSize: '48px 48px, 32px 32px',
          }}
        />
      </div>

      <motion.div
        aria-hidden
        style={reduced ? undefined : { scaleX: progress }}
        className="fixed top-0 left-0 right-0 z-50 h-[2px] origin-left bg-gradient-to-r from-mustard via-sage to-teal"
      />

      <div id="main-content" className="relative z-10">{children}</div>
    </div>
  );
}
