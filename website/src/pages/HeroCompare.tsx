import { useState } from 'react';
import { PageMeta } from '../components/PageMeta';
import { PainterlyShell } from '../components/PainterlyShell';
import { HeroVariantB } from '../components/HeroVariantB';
import { HeroVariantF } from '../components/HeroVariantF';
import { HeroVariantG } from '../components/HeroVariantG';
import { HeroVariantH } from '../components/HeroVariantH';
import { HeroVariantI } from '../components/HeroVariantI';

const VARIANTS = [
  { id: 'B', label: 'B: Centered & Clean (your pick)', component: HeroVariantB },
  { id: 'F', label: 'F: Dashboard Peek (dark, floating card)', component: HeroVariantF },
  { id: 'G', label: 'G: Dual Path (two CTAs)', component: HeroVariantG },
  { id: 'H', label: 'H: Floating Biomes (shape hero)', component: HeroVariantH },
  { id: 'I', label: 'I: Stacked Editorial (magazine layout)', component: HeroVariantI },
];

export default function HeroCompare() {
  const [active, setActive] = useState('B');
  const ActiveComponent = VARIANTS.find(v => v.id === active)?.component || HeroVariantB;

  return (
    <PainterlyShell>
      <PageMeta
        title="Hero-Vergleich (intern)"
        description=""
        canonicalPath="/hero-compare"
        noindex
      />
      <div className="fixed top-4 left-1/2 -translate-x-1/2 z-50 flex gap-2 bg-teal-dark/90 backdrop-blur-sm rounded-full px-3 py-2 shadow-xl border border-cream/10">
        {VARIANTS.map(v => (
          <button
            key={v.id}
            onClick={() => setActive(v.id)}
            className={`px-4 py-2 rounded-full text-xs font-display font-bold transition-all ${
              active === v.id
                ? 'bg-mustard text-teal-dark'
                : 'text-cream/70 hover:text-cream'
            }`}
          >
            {v.id}
          </button>
        ))}
      </div>
      <p className="fixed top-20 left-1/2 -translate-x-1/2 z-50 text-xs text-teal-dark/60 font-display font-semibold bg-cream/80 backdrop-blur-sm px-4 py-1.5 rounded-full whitespace-nowrap">
        {VARIANTS.find(v => v.id === active)?.label}
      </p>
      <ActiveComponent />
    </PainterlyShell>
  );
}
