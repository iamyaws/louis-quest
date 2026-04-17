import React from 'react';
import { motion, useReducedMotion } from 'motion/react';

/**
 * CloudWaves — 6-layer parallax cloud animation.
 * Drop anywhere as an absolute/fixed-positioned background element.
 * Adapted from the website 404 page. Respects prefers-reduced-motion.
 *
 * Props:
 *   fill: CSS color for clouds (default: cream)
 *   opacity: base opacity multiplier (default: 1)
 *   className: extra classes for the outer div
 */
export default function CloudWaves({ fill = '253,248,240', opacity = 1, className = '' }) {
  const reduced = useReducedMotion();

  const drift = (dur, reverse = false) =>
    reduced
      ? {}
      : {
          animate: { x: reverse ? ['-50%', '0%'] : ['0%', '-50%'] },
          transition: { duration: dur, repeat: Infinity, ease: 'linear' },
        };

  return (
    <div className={`absolute inset-0 overflow-hidden pointer-events-none ${className}`} aria-hidden="true">
      {/* Back — tall billowy, slow */}
      <motion.div className="absolute w-[200%] bottom-[40%]" {...drift(40)}>
        <svg viewBox="0 0 2400 300" className="w-full h-40 sm:h-56 md:h-64" preserveAspectRatio="none">
          <path d="M0,200 C100,120 200,180 350,130 C500,80 550,160 700,120 C850,80 950,50 1100,100 C1250,150 1300,80 1450,130 C1600,180 1700,90 1850,140 C2000,190 2100,100 2250,160 C2350,200 2400,150 2400,200 L2400,300 L0,300 Z"
                fill={`rgba(${fill},${0.05 * opacity})`} />
        </svg>
      </motion.div>

      {/* Mid — rolling hills, opposite direction */}
      <motion.div className="absolute w-[200%] bottom-[18%]" {...drift(24, true)}>
        <svg viewBox="0 0 2400 220" className="w-full h-28 sm:h-40 md:h-48" preserveAspectRatio="none">
          <path d="M0,100 C200,50 400,160 650,90 C900,20 1050,150 1200,100 C1350,50 1550,140 1800,80 C2050,20 2200,120 2400,100 L2400,220 L0,220 Z"
                fill={`rgba(${fill},${0.11 * opacity})`} />
        </svg>
      </motion.div>

      {/* Front — densest fog, fastest */}
      <motion.div className="absolute w-[200%] -bottom-[2%]" {...drift(16)}>
        <svg viewBox="0 0 2400 160" className="w-full h-20 sm:h-28 md:h-36" preserveAspectRatio="none">
          <path d="M0,40 C200,90 450,20 700,60 C950,100 1100,30 1350,50 C1600,70 1750,100 2000,40 C2200,0 2350,70 2400,40 L2400,160 L0,160 Z"
                fill={`rgba(${fill},${0.18 * opacity})`} />
        </svg>
      </motion.div>
    </div>
  );
}
