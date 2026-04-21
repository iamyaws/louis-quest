/**
 * Compare wordmark + icon variants before committing to the final brand
 * mark. Marc picks one, I commit it to PosterShell + clean up.
 *
 * Three options:
 *   A — text-only "ronki" with mustard dot (current state)
 *   B — text + dragon head icon (app-icon.png, portrait-style)
 *   C — text + full-body dragon icon (app-icon-alt2.png, full figure)
 *
 * Shown at two sizes each: small (poster-wordmark context, ~13pt) + large
 * (web-header context, ~24pt) so Marc can see how each reads at both.
 */
export default function CompareWordmark() {
  return (
    <div className="min-h-screen bg-cream px-6 py-16">
      <div className="max-w-5xl mx-auto">
        <header className="mb-12 text-center">
          <p className="text-xs uppercase tracking-[0.2em] text-teal mb-4 font-semibold">
            Pick your wordmark
          </p>
          <h1 className="font-display font-bold text-4xl text-teal-dark">
            Wordmark-Varianten
          </h1>
          <p className="mt-4 text-base text-ink/70 max-w-2xl mx-auto">
            Text-Wordmark aktuell, plus Icon-Begleiter oder ohne. Jede Variante in zwei Größen: klein (Poster-Kontext) und groß (Website-Header-Kontext).
          </p>
        </header>

        <div className="space-y-16">
          <VariantRow
            label="Option A · Text only"
            description="So wie aktuell in PosterShell: mustard Punkt + „ronki" in Plus Jakarta 800. Minimal, keine Bild-Abhängigkeit."
          >
            <WordmarkTextOnly size="small" />
            <WordmarkTextOnly size="large" />
          </VariantRow>

          <VariantRow
            label="Option B · Text + Drachenkopf"
            description="Head-Fokus-Version. Gesicht bleibt erkennbar bei kleinen Größen. Mein Favorit als Wordmark-Begleiter."
          >
            <WordmarkWithIcon
              size="small"
              iconSrc="/art/branding/ronki-icon-head-64.webp"
              iconSrcBig="/art/branding/ronki-icon-head-128.webp"
            />
            <WordmarkWithIcon
              size="large"
              iconSrc="/art/branding/ronki-icon-head-128.webp"
              iconSrcBig="/art/branding/ronki-icon-head-256.webp"
            />
          </VariantRow>

          <VariantRow
            label="Option C · Text + Full-Body-Drache"
            description="Komplette Figur mit Flügeln und Schwanz. Mehr Charakter, bei kleinen Größen weniger klar lesbar."
          >
            <WordmarkWithIcon
              size="small"
              iconSrc="/art/branding/ronki-icon-full-64.webp"
              iconSrcBig="/art/branding/ronki-icon-full-128.webp"
            />
            <WordmarkWithIcon
              size="large"
              iconSrc="/art/branding/ronki-icon-full-128.webp"
              iconSrcBig="/art/branding/ronki-icon-full-256.webp"
            />
          </VariantRow>

          <VariantRow
            label="Option D · Text + Heroic-Drache (Head + Wing)"
            description="Head-Fokus mit sichtbarem Flügel hinten, kräftige Hörner. Mein neuer Favorit: gut lesbar bei kleinen Größen UND mehr Persönlichkeit als nur der Kopf."
          >
            <WordmarkWithIcon
              size="small"
              iconSrc="/art/branding/ronki-icon-heroic-64.webp"
              iconSrcBig="/art/branding/ronki-icon-heroic-128.webp"
            />
            <WordmarkWithIcon
              size="large"
              iconSrc="/art/branding/ronki-icon-heroic-128.webp"
              iconSrcBig="/art/branding/ronki-icon-heroic-256.webp"
            />
          </VariantRow>
        </div>

        <div className="mt-16 rounded-2xl border border-teal/15 bg-cream/60 p-8 text-center">
          <p className="text-xs uppercase tracking-[0.2em] text-teal mb-3 font-semibold">
            Kontext-Test
          </p>
          <p className="text-sm text-ink/70 max-w-2xl mx-auto">
            So sähe der Wordmark im Poster-Header aus (oben rechts, ~13pt, über dem Eyebrow). Bei Option B + C ist das Icon proportional skaliert.
          </p>
          <div className="mt-8 grid grid-cols-2 md:grid-cols-4 gap-4">
            <PosterContextMock variant="A" />
            <PosterContextMock variant="B" />
            <PosterContextMock variant="C" />
            <PosterContextMock variant="D" />
          </div>
        </div>

        <p className="mt-16 text-center text-sm text-ink/60">
          Sag <strong>A</strong>, <strong>B</strong>, <strong>C</strong> oder <strong>D</strong>, ich commite den Gewinner in <code>PosterShell.tsx</code> und räume die Compare-Route weg.
        </p>
      </div>
    </div>
  );
}

/* ─── Helpers ────────────────────────────────────────────────────── */

function VariantRow({
  label,
  description,
  children,
}: {
  label: string;
  description: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <div className="mb-6">
        <span className="inline-block text-[10px] uppercase tracking-[0.2em] text-teal font-bold px-2 py-1 rounded bg-teal/10 mb-2">
          {label}
        </span>
        <p className="text-sm text-ink/70 max-w-2xl">{description}</p>
      </div>
      <div className="rounded-2xl border border-teal/15 bg-cream/60 p-12">
        <div className="flex flex-col items-center gap-10">{children}</div>
      </div>
    </div>
  );
}

function WordmarkTextOnly({ size }: { size: 'small' | 'large' }) {
  const isLarge = size === 'large';
  return (
    <div className="flex flex-col items-center gap-3">
      <span className="text-[10px] uppercase tracking-[0.15em] text-teal/60 font-semibold">
        {isLarge ? 'Website-Header (~24pt)' : 'Poster-Header (~13pt)'}
      </span>
      <div className="inline-flex items-center gap-2">
        <span
          className="rounded-full bg-mustard"
          style={{
            width: isLarge ? '10px' : '5px',
            height: isLarge ? '10px' : '5px',
            boxShadow: '0 0 0 1.5px rgba(0,0,0,0.04)',
          }}
        />
        <span
          className="font-display font-extrabold text-teal-dark"
          style={{
            fontSize: isLarge ? '32px' : '17px',
            letterSpacing: '-0.04em',
            lineHeight: 1,
          }}
        >
          ronki
        </span>
      </div>
    </div>
  );
}

function WordmarkWithIcon({
  size,
  iconSrc,
}: {
  size: 'small' | 'large';
  iconSrc: string;
  iconSrcBig: string;
}) {
  const isLarge = size === 'large';
  return (
    <div className="flex flex-col items-center gap-3">
      <span className="text-[10px] uppercase tracking-[0.15em] text-teal/60 font-semibold">
        {isLarge ? 'Website-Header (~24pt)' : 'Poster-Header (~13pt)'}
      </span>
      <div className="inline-flex items-center gap-2.5">
        <img
          src={iconSrc}
          alt=""
          style={{
            width: isLarge ? '40px' : '22px',
            height: isLarge ? '40px' : '22px',
          }}
          aria-hidden
        />
        <span
          className="font-display font-extrabold text-teal-dark"
          style={{
            fontSize: isLarge ? '32px' : '17px',
            letterSpacing: '-0.04em',
            lineHeight: 1,
          }}
        >
          ronki
        </span>
      </div>
    </div>
  );
}

function PosterContextMock({ variant }: { variant: 'A' | 'B' | 'C' | 'D' }) {
  const iconSrc =
    variant === 'B'
      ? '/art/branding/ronki-icon-head-64.webp'
      : variant === 'C'
        ? '/art/branding/ronki-icon-full-64.webp'
        : variant === 'D'
          ? '/art/branding/ronki-icon-heroic-64.webp'
          : null;

  return (
    <div className="relative mx-auto w-full max-w-md aspect-[210/297] rounded-xl bg-cream border border-teal/15 shadow-sm overflow-hidden">
      <div
        className="absolute top-0 left-0 right-0 h-1"
        style={{ background: '#FCD34D' }}
      />
      <div className="relative px-6 pt-6">
        <div className="absolute top-4 right-4 inline-flex items-center gap-1.5">
          {iconSrc ? (
            <img src={iconSrc} alt="" className="w-4 h-4" />
          ) : (
            <span className="w-2 h-2 rounded-full bg-mustard" />
          )}
          <span className="font-display font-extrabold text-teal-dark text-sm tracking-tight leading-none">
            ronki
          </span>
        </div>
        <p className="text-[8px] uppercase tracking-[0.2em] text-teal font-semibold mt-8 text-center">
          Für den Morgen-Stress vor 8 Uhr
        </p>
        <h2 className="font-display font-extrabold text-teal-dark text-center mt-4 leading-tight text-xl px-2">
          „Zähne putzen!" <em className="italic text-teal">14 Mal</em> oder{' '}
          <em className="italic text-teal">einmal</em>.
        </h2>
        <div className="mt-4 text-center">
          <div className="inline-block w-24 h-24 rounded-lg bg-gradient-to-br from-mustard-soft/40 to-sage-soft/30" />
        </div>
        <p className="text-[9px] text-ink/60 text-center mt-3">
          (Variante {variant} — Vorschau, nicht final gerendert)
        </p>
      </div>
    </div>
  );
}
