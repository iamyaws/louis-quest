import React from 'react';

const TRAITS = [
  { emoji: '💪', label: 'Gibt sein Bestes' },
  { emoji: '🤝', label: 'Hilft anderen' },
  { emoji: '🤫', label: 'Ist ehrlich' },
  { emoji: '🌟', label: 'Probiert Neues' },
  { emoji: '🧘', label: 'Bleibt ruhig' },
  { emoji: '🙏', label: 'Sagt Danke' },
];

export default function HeldenKodex() {
  return (
    <div className="min-h-screen bg-surface px-6 pb-32">

      {/* ── Hero Heart Section ── */}
      <section className="text-center pt-4 space-y-6">
        {/* Heart with glow */}
        <div className="relative flex justify-center">
          <div className="absolute inset-0 flex justify-center items-center">
            <div className="w-40 h-40 bg-primary/10 blur-3xl rounded-full" />
          </div>
          <div className="relative rounded-full p-8 bg-white shadow-lg">
            <span
              className="material-symbols-outlined text-7xl text-primary"
              style={{ fontVariationSettings: "'FILL' 1" }}
            >
              favorite
            </span>
          </div>
        </div>

        {/* Title motto */}
        <h1 className="text-2xl font-extrabold text-primary leading-relaxed font-headline">
          Lieb sein. Sich Mühe geben.{'\u00A0'}Zusammen sein.
        </h1>

        {/* Affirmation badge */}
        <div className="inline-flex items-center gap-2 px-6 py-2 bg-[#fcd34d] text-[#725b00] rounded-full text-sm font-bold font-headline">
          <span
            className="material-symbols-outlined text-base"
            style={{ fontVariationSettings: "'FILL' 1" }}
          >
            auto_awesome
          </span>
          Ich bin geliebt, so wie ich bin.
        </div>
      </section>

      {/* ── Character Traits Grid ── */}
      <section className="mt-10 space-y-6">
        {/* Header row */}
        <div className="flex justify-between items-baseline">
          <h2 className="text-xl font-bold font-headline">Ein wahrer Held...</h2>
          <span className="text-primary text-sm font-semibold font-label flex items-center gap-1">
            <span
              className="material-symbols-outlined text-sm"
              style={{ fontVariationSettings: "'FILL' 1" }}
            >
              stars
            </span>
            Helden-Kodex
          </span>
        </div>

        {/* 2x3 grid */}
        <div className="grid grid-cols-2 gap-4">
          {TRAITS.map((trait, i) => (
            <div
              key={i}
              className="bg-white p-6 rounded-xl flex flex-col items-center text-center gap-3 shadow-sm hover:scale-[1.02] transition"
            >
              <span className="text-4xl">{trait.emoji}</span>
              <span className="font-bold text-sm font-headline">{trait.label}</span>
            </div>
          ))}
        </div>
      </section>

      {/* ── Parent Message Card ── */}
      <section
        className="mt-10 rounded-xl p-8 relative overflow-hidden"
        style={{
          background: 'rgba(15,118,110,0.05)',
          border: '1px solid rgba(15,118,110,0.08)',
        }}
      >
        {/* Header row */}
        <div className="flex items-center gap-4 mb-5">
          <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center shadow-sm shrink-0">
            <span
              className="material-symbols-outlined text-2xl text-primary"
              style={{ fontVariationSettings: "'FILL' 1" }}
            >
              family_history
            </span>
          </div>
          <div>
            <div className="font-bold font-headline text-sm">Botschaft für Louis</div>
            <div className="text-xs text-on-surface-variant font-body">Gerade eben von Mama &amp; Papa</div>
          </div>
        </div>

        {/* Message */}
        <p className="text-lg font-semibold leading-relaxed font-body mb-4">
          Fehler sind okay. Mama &amp; Papa sind immer für dich da. 🧡
        </p>

        {/* Quote */}
        <p className="italic font-medium font-body text-primary">
          Louis, Papa und Mama lieben dich.
        </p>

        {/* Decorative lotus icon */}
        <span
          className="material-symbols-outlined absolute bottom-4 right-4 text-6xl text-primary"
          style={{ opacity: 0.1, fontVariationSettings: "'FILL' 1" }}
        >
          filter_vintage
        </span>
      </section>
    </div>
  );
}
