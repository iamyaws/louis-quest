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
      {/* Layer 1 — tall billowy, far back, slowest */}
      <motion.div className="absolute w-[200%] bottom-[45%]" {...drift(40)}>
        <svg viewBox="0 0 2400 300" className="w-full h-40 sm:h-56 md:h-64" preserveAspectRatio="none">
          <path d="M0,200 C100,120 200,180 350,130 C500,80 550,160 700,120 C850,80 950,50 1100,100 C1250,150 1300,80 1450,130 C1600,180 1700,90 1850,140 C2000,190 2100,100 2250,160 C2350,200 2400,150 2400,200 L2400,300 L0,300 Z"
                fill={`rgba(${fill},${0.04 * opacity})`} />
        </svg>
      </motion.div>

      {/* Layer 2 — wide rounded bumps */}
      <motion.div className="absolute w-[200%] bottom-[35%]" {...drift(32, true)}>
        <svg viewBox="0 0 2400 280" className="w-full h-36 sm:h-48 md:h-56" preserveAspectRatio="none">
          <path d="M0,160 C180,80 280,200 500,140 C720,80 800,180 1000,120 C1200,60 1350,190 1500,140 C1650,90 1800,200 2000,130 C2200,60 2300,160 2400,160 L2400,280 L0,280 Z"
                fill={`rgba(${fill},${0.06 * opacity})`} />
        </svg>
      </motion.div>

      {/* Layer 3 — chunky cumulus */}
      <motion.div className="absolute w-[200%] bottom-[25%]" {...drift(26)}>
        <svg viewBox="0 0 2400 260" className="w-full h-32 sm:h-44 md:h-52" preserveAspectRatio="none">
          <path d="M0,140 C60,180 180,70 360,120 C540,170 620,60 800,110 C980,160 1060,50 1200,100 C1340,150 1460,70 1600,130 C1740,190 1860,80 2000,140 C2140,200 2260,90 2400,140 L2400,260 L0,260 Z"
                fill={`rgba(${fill},${0.08 * opacity})`} />
        </svg>
      </motion.div>

      {/* Layer 4 — softer rolling hills */}
      <motion.div className="absolute w-[200%] bottom-[14%]" {...drift(22, true)}>
        <svg viewBox="0 0 2400 220" className="w-full h-28 sm:h-40 md:h-48" preserveAspectRatio="none">
          <path d="M0,100 C200,50 400,160 650,90 C900,20 1050,150 1200,100 C1350,50 1550,140 1800,80 C2050,20 2200,120 2400,100 L2400,220 L0,220 Z"
                fill={`rgba(${fill},${0.10 * opacity})`} />
        </svg>
      </motion.div>

      {/* Layer 5 — thick front clouds */}
      <motion.div className="absolute w-[200%] bottom-[4%]" {...drift(18)}>
        <svg viewBox="0 0 2400 200" className="w-full h-24 sm:h-36 md:h-44" preserveAspectRatio="none">
          <path d="M0,80 C150,130 350,30 550,90 C750,150 900,50 1100,100 C1300,150 1450,40 1650,80 C1850,120 2050,50 2200,100 C2350,150 2400,80 2400,80 L2400,200 L0,200 Z"
                fill={`rgba(${fill},${0.14 * opacity})`} />
        </svg>
      </motion.div>

      {/* Layer 6 — densest bottom fog */}
      <motion.div className="absolute w-[200%] -bottom-[2%]" {...drift(14, true)}>
        <svg viewBox="0 0 2400 160" className="w-full h-20 sm:h-28 md:h-36" preserveAspectRatio="none">
          <path d="M0,40 C200,90 450,20 700,60 C950,100 1100,30 1350,50 C1600,70 1750,100 2000,40 C2200,0 2350,70 2400,40 L2400,160 L0,160 Z"
                fill={`rgba(${fill},${0.18 * opacity})`} />
        </svg>
      </motion.div>
    </div>
  );
}
