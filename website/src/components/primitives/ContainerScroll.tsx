import { ReactNode, useRef } from 'react';
import { motion, useScroll, useTransform, useReducedMotion, MotionValue } from 'motion/react';

type Props = {
  titleComponent: ReactNode;
  children: ReactNode;
};

export function ContainerScroll({ titleComponent, children }: Props) {
  const ref = useRef<HTMLDivElement>(null);
  const reduced = useReducedMotion();
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start start', 'end start'] });

  const rotate = useTransform(scrollYProgress, [0, 0.4], [22, 0]);
  const scale = useTransform(scrollYProgress, [0, 0.4], [0.82, 1]);
  const translate = useTransform(scrollYProgress, [0, 0.4], [0, -60]);

  return (
    <div ref={ref} className="relative h-[140vh] sm:h-[160vh]">
      <div
        className="sticky top-0 h-screen w-full flex flex-col items-center justify-start pt-16 sm:pt-24 overflow-hidden"
        style={{ perspective: '1000px' }}
      >
        <motion.div
          style={reduced ? undefined : { translateY: translate }}
          className="max-w-5xl w-full mx-auto text-center px-6 mb-10 sm:mb-14"
        >
          {titleComponent}
        </motion.div>
        <Card rotate={rotate} scale={scale} reduced={!!reduced}>
          {children}
        </Card>
      </div>
    </div>
  );
}

function Card({
  rotate,
  scale,
  reduced,
  children,
}: {
  rotate: MotionValue<number>;
  scale: MotionValue<number>;
  reduced: boolean;
  children: ReactNode;
}) {
  return (
    <motion.div
      style={
        reduced
          ? undefined
          : {
              rotateX: rotate,
              scale,
              boxShadow:
                '0 0 #0000004d, 0 9px 20px #0000004a, 0 37px 37px #00000042, 0 84px 50px #00000026, 0 149px 60px #0000000a, 0 233px 65px #00000003',
            }
      }
      className="max-w-5xl mx-auto h-[32rem] sm:h-[38rem] w-full border-4 border-teal/15 bg-cream rounded-[28px] shadow-2xl p-3"
    >
      <div className="h-full w-full overflow-hidden rounded-[20px] bg-gradient-to-br from-cream via-mustard-soft/20 to-sage-soft/25">
        {children}
      </div>
    </motion.div>
  );
}
