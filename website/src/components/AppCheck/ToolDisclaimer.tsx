/**
 * Persistent disclaimer strip used across all app-check screens.
 *
 * Anchors the legal framing on every page: this tool computes the parent's
 * own assessment of an app's mechanics, not a Ronki claim about the app.
 */

interface Props {
  variant?: 'tool' | 'result' | 'saved';
}

const COPY: Record<NonNullable<Props['variant']>, string> = {
  tool: 'Du bewertest, wir geben dir den Rahmen.',
  result:
    'Diese Bewertung basiert auf deinen Antworten. Sie ist deine Einschätzung der App-Mechaniken aus deiner Erfahrung, kein verifizierter Test.',
  saved:
    'Diese Bewertung gibt die Beobachtungen einer Person wieder. Sie ist keine Aussage von Ronki über die App.',
};

export function ToolDisclaimer({ variant = 'tool' }: Props) {
  return (
    <p className="mt-12 text-xs text-ink/55 italic max-w-prose">
      {COPY[variant]}
    </p>
  );
}
