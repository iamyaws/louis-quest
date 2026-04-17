import React, { useMemo } from 'react';

/**
 * ChapterAmbient — decorative CSS/SVG overlay keyed to chapter.
 * Five variants: forest (leaves), sky (clouds), water (ripples), dream (stars), hearth (embers).
 * Pure decoration — pointer-events: none.
 */
export default function ChapterAmbient({ chapter, color }) {
  if (chapter === 'forest') return <ForestLeaves color={color} />;
  if (chapter === 'sky') return <SkyClouds color={color} />;
  if (chapter === 'water') return <WaterRipples color={color} />;
  if (chapter === 'dream') return <DreamStars color={color} />;
  if (chapter === 'hearth') return <HearthEmbers color={color} />;
  return null;
}

function ForestLeaves({ color }) {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {[0, 1, 2].map(i => (
        <svg key={i} className="absolute w-4 h-4"
          style={{
            top: `${20 + i * 25}%`,
            left: `${15 + i * 30}%`,
            color,
            opacity: 0.35,
            animation: `leafDrift ${6 + i}s ease-in-out infinite ${i * 1.5}s`,
          }}
          viewBox="0 0 24 24" fill="currentColor">
          <path d="M12 2C7 7 5 13 7 19c5-2 10-7 12-12-2-1-4-3-7-5z" />
        </svg>
      ))}
      <style>{`
        @keyframes leafDrift {
          0% { transform: translate(0, 0) rotate(0deg); opacity: 0.1; }
          50% { transform: translate(10px, 15px) rotate(30deg); opacity: 0.45; }
          100% { transform: translate(0, 0) rotate(0deg); opacity: 0.1; }
        }
      `}</style>
    </div>
  );
}

function SkyClouds({ color }) {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {[0, 1].map(i => (
        <div key={i} className="absolute rounded-full"
          style={{
            top: `${25 + i * 30}%`,
            left: `${-10 + i * 40}%`,
            width: 80, height: 30,
            background: `radial-gradient(ellipse, ${color}30 0%, transparent 70%)`,
            animation: `cloudDrift ${20 + i * 5}s linear infinite ${i * 3}s`,
          }} />
      ))}
      <style>{`
        @keyframes cloudDrift {
          0% { transform: translateX(-100px); }
          100% { transform: translateX(calc(100vw + 100px)); }
        }
      `}</style>
    </div>
  );
}

function WaterRipples({ color }) {
  return (
    <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
      {[0, 1, 2].map(i => (
        <div key={i} className="absolute rounded-full"
          style={{
            width: 40, height: 40,
            border: `2px solid ${color}40`,
            animation: `ripple 4s ease-out infinite ${i * 1.3}s`,
          }} />
      ))}
      <style>{`
        @keyframes ripple {
          0% { transform: scale(0.5); opacity: 0.7; }
          100% { transform: scale(4); opacity: 0; }
        }
      `}</style>
    </div>
  );
}

function DreamStars({ color }) {
  // Random positions memoized so they don't jitter on parent re-renders
  const stars = useMemo(() => (
    [0, 1, 2, 3, 4, 5].map(() => ({
      top: Math.random() * 80,
      left: Math.random() * 90,
      duration: 2 + Math.random() * 2,
      delay: Math.random() * 2,
    }))
  ), []);
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {stars.map((s, i) => (
        <div key={i} className="absolute rounded-full"
          style={{
            top: `${s.top}%`,
            left: `${s.left}%`,
            width: 3, height: 3,
            background: color,
            boxShadow: `0 0 6px ${color}`,
            animation: `starTwinkle ${s.duration}s ease-in-out infinite ${s.delay}s`,
          }} />
      ))}
      <style>{`
        @keyframes starTwinkle {
          0%, 100% { opacity: 0.2; transform: scale(0.8); }
          50% { opacity: 0.9; transform: scale(1.2); }
        }
      `}</style>
    </div>
  );
}

function HearthEmbers({ color }) {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {[0, 1, 2, 3].map(i => (
        <div key={i} className="absolute rounded-full"
          style={{
            bottom: '10%',
            left: `${20 + i * 20}%`,
            width: 4, height: 4,
            background: color,
            boxShadow: `0 0 4px ${color}`,
            animation: `emberRise ${3 + i * 0.5}s ease-out infinite ${i * 0.8}s`,
          }} />
      ))}
      <style>{`
        @keyframes emberRise {
          0% { transform: translateY(0); opacity: 0; }
          20% { opacity: 0.8; }
          100% { transform: translateY(-60px); opacity: 0; }
        }
      `}</style>
    </div>
  );
}
