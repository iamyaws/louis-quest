import { PageMeta } from '../components/PageMeta';
import { ModernShell } from '../components/modern/ModernShell';
import { HeroModern } from '../components/modern/HeroModern';
import { QuoteModern } from '../components/modern/QuoteModern';
import { PillarsModern } from '../components/modern/PillarsModern';
import { ArcStoryboardModern } from '../components/modern/ArcStoryboardModern';
import { AntiFeaturesModern } from '../components/modern/AntiFeaturesModern';
import { ClosingCTAModern } from '../components/modern/ClosingCTAModern';
import { FooterModern } from '../components/modern/FooterModern';

export default function HomeModern() {
  return (
    <ModernShell>
      <PageMeta
        title="Ronki: Der Drachen-Gefährte für Kinder-Routinen"
        description="Ronki trägt die Routine mit. Ein Drachen-Gefährte, der Kinder durch den Alltag begleitet. Ohne Streaks, ohne Werbung, ohne Dark Patterns."
        canonicalPath="/modern"
        noindex
      />
      <HeroModern />
      <QuoteModern />
      <PillarsModern />
      <ArcStoryboardModern />
      <AntiFeaturesModern />
      <ClosingCTAModern />
      <FooterModern />
    </ModernShell>
  );
}
