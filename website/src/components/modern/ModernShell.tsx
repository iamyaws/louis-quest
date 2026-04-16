import { ReactNode } from 'react';
import { motion, useScroll, useSpring, useTransform, useReducedMotion } from 'motion/react';

type Props = { children: ReactNode };

export function ModernShell({ children }: Props) {
  const reduced = useReducedMotion();
  const { scrollYProgress } = useScroll();
  const progress = useSpring(scrollYProgress, { stiffness: 80, damping: 20 });
  const glowY = useTransform(scrollYProgress, [0, 1], ['0%', '40%']);
  const glowX = useTransform(scrollYProgress, [0, 0.5, 1], ['0%', '-10%', '5%']);

  return (
    <div className="relative min-h-screen bg-[#12100c] text-[#f5ecd4] selection:bg-[#c48a3a] selection:text-[#12100c]">
      <div aria-hidden className="pointer-events-none fixed inset-0 overflow-hidden">
        <motion.div
          style={reduced ? undefined : { y: glowY, x: glowX }}
          className="absolute left-1/2 top-[-20%] h-[70vh] w-[70vh] -translate-x-1/2 rounded-full blur-[120px] opacity-60"
        >
          <div className="h-full w-full rounded-full bg-[radial-gradient(circle_at_center,#c48a3a_0%,#6b3a5c_45%,transparent_70%)]" />
        </motion.div>
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_80%_80%,rgba(107,142,78,0.18)_0%,transparent_50%)]" />
      </div>

      <motion.div
        aria-hidden
        style={reduced ? undefined : { scaleX: progress }}
        className="fixed top-0 left-0 right-0 z-50 h-[2px] origin-left bg-gradient-to-r from-[#c48a3a] via-[#6b3a5c] to-[#6b8e4e]"
      />

      <div className="relative z-10">{children}</div>
    </div>
  );
}
