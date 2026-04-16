import { PageMeta } from '../components/PageMeta';
import { PainterlyShell } from '../components/PainterlyShell';
import { HeroV2 } from '../components/HeroV2';
import { QuoteGrid } from '../components/QuoteGrid';
import { BeforeAfter } from '../components/BeforeAfter';
import { CompanionEconomy } from '../components/CompanionEconomy';
import { IntrinsicMotivation } from '../components/IntrinsicMotivation';
import { ArcStoryboard } from '../components/ArcStoryboard';
import { PWAInstall } from '../components/PWAInstall';
import { ScienceStrip } from '../components/ScienceStrip';
import { FAQ } from '../components/FAQ';
import { CountdownCTA } from '../components/CountdownCTA';
import { Footer } from '../components/Footer';

export default function HomeV3() {
  return (
    <PainterlyShell>
      <PageMeta
        title="Ronki: Morgens ohne Kampf"
        description="Ronki ist der Drachen-Gefährte, der deinem Kind hilft, seine Routinen zu entdecken. Und eines Tages nicht mehr gebraucht wird."
        canonicalPath="/v3"
        noindex
      />
      <HeroV2 />
      <QuoteGrid />
      <BeforeAfter />
      <CompanionEconomy />
      <IntrinsicMotivation />
      <ArcStoryboard />
      <PWAInstall />
      <ScienceStrip />
      <FAQ />
      <CountdownCTA />
      <Footer />
    </PainterlyShell>
  );
}
