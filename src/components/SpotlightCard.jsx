"use client";

import React, { useEffect, useRef } from "react";

const glowColorMap = {
  cyan:   { base: 185, spread: 30 },
  purple: { base: 270, spread: 30 },
};

const spotlightStyles = `
  [data-spotlight]::before,
  [data-spotlight]::after {
    pointer-events: none;
    content: "";
    position: absolute;
    inset: calc(var(--border-size) * -1);
    border: var(--border-size) solid transparent;
    border-radius: calc(var(--radius) * 1px);
    background-attachment: fixed;
    background-size: calc(100% + (2 * var(--border-size))) calc(100% + (2 * var(--border-size)));
    background-repeat: no-repeat;
    background-position: 50% 50%;
    mask: linear-gradient(transparent, transparent), linear-gradient(white, white);
    mask-clip: padding-box, border-box;
    mask-composite: intersect;
  }

  [data-spotlight]::before {
    background-image: radial-gradient(
      calc(var(--spotlight-size) * 0.75) calc(var(--spotlight-size) * 0.75) at
      calc(var(--x, 0) * 1px)
      calc(var(--y, 0) * 1px),
      hsl(var(--hue, 185) 100% 60% / var(--border-spot-opacity, 0.9)), transparent 100%
    );
    filter: brightness(1.8);
  }

  [data-spotlight]::after {
    background-image: radial-gradient(
      calc(var(--spotlight-size) * 0.5) calc(var(--spotlight-size) * 0.5) at
      calc(var(--x, 0) * 1px)
      calc(var(--y, 0) * 1px),
      hsl(0 100% 100% / var(--border-light-opacity, 0.5)), transparent 100%
    );
  }

  [data-spotlight] [data-spotlight] {
    position: absolute;
    inset: 0;
    will-change: filter;
    opacity: var(--outer, 1);
    border-radius: calc(var(--radius) * 1px);
    border-width: calc(var(--border-size) * 20);
    filter: blur(calc(var(--border-size) * 10));
    background: none;
    pointer-events: none;
    border: none;
  }

  [data-spotlight] > [data-spotlight]::before {
    inset: -10px;
    border-width: 10px;
  }
`;

const SpotlightCard = ({
  children,
  className = "",
  glowColor = "cyan",
  blur = 0,
}) => {
  const cardRef = useRef(null);

  useEffect(() => {
    const syncPointer = (e) => {
      const { clientX: x, clientY: y } = e;
      if (cardRef.current) {
        cardRef.current.style.setProperty("--x", x.toFixed(2));
        cardRef.current.style.setProperty("--xp", (x / window.innerWidth).toFixed(2));
        cardRef.current.style.setProperty("--y", y.toFixed(2));
        cardRef.current.style.setProperty("--yp", (y / window.innerHeight).toFixed(2));
      }
    };
    document.addEventListener("pointermove", syncPointer);
    return () => document.removeEventListener("pointermove", syncPointer);
  }, []);

  const { base, spread } = glowColorMap[glowColor];

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: spotlightStyles }} />
      <div
        ref={cardRef}
        data-spotlight
        className={`${className}`}
        style={{
          position: "relative",
          borderRadius: 16,
          "--base": base,
          "--spread": spread,
          "--radius": "16",
          "--border": "1.5",
          "--size": "220",
          "--outer": "1",
          "--border-size": "calc(var(--border, 1.5) * 1px)",
          "--spotlight-size": "calc(var(--size, 220) * 1px)",
          "--hue": "calc(var(--base) + (var(--xp, 0) * var(--spread, 0)))",
          "--backdrop": glowColor === "cyan"
            ? "rgba(0,238,252,0.04)"
            : "rgba(124,58,237,0.04)",
          "--backup-border": glowColor === "cyan"
            ? "rgba(0,238,252,0.12)"
            : "rgba(124,58,237,0.12)",
          backgroundImage: `radial-gradient(
            var(--spotlight-size) var(--spotlight-size) at
            calc(var(--x, 0) * 1px)
            calc(var(--y, 0) * 1px),
            hsl(var(--hue, 185) 100% 65% / 0.07), transparent
          )`,
          backgroundColor: "var(--backdrop, transparent)",
          backgroundSize: "calc(100% + (2 * var(--border-size))) calc(100% + (2 * var(--border-size)))",
          backgroundPosition: "50% 50%",
          backgroundAttachment: "fixed",
          border: "var(--border-size) solid var(--backup-border)",
          touchAction: "none",
          willChange: "background-image, background-position",
          backdropFilter: blur > 0 ? `blur(${blur}px)` : undefined,
          WebkitBackdropFilter: blur > 0 ? `blur(${blur}px)` : undefined,
        }}
      >
        <div data-spotlight />
        {children}
      </div>
    </>
  );
};

export { SpotlightCard };
export default SpotlightCard;
