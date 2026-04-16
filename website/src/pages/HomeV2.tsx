import { PageMeta } from '../components/PageMeta';
import { PainterlyShell } from '../components/PainterlyShell';
import { HeroV2 } from '../components/HeroV2';
import { Quote } from '../components/Quote';
import { BeforeAfter } from '../components/BeforeAfter';
import { Pillars } from '../components/Pillars';
import { ArcStoryboard } from '../components/ArcStoryboard';
import { ScienceStrip } from '../components/ScienceStrip';
import { AppPreview } from '../components/AppPreview';
import { ClosingCTA } from '../components/ClosingCTA';
import { Footer } from '../components/Footer';

export default function HomeV2() {
  return (
    <PainterlyShell>
      <PageMeta
        title="Ronki: Morgens ohne Kampf"
        description="Ronki ist der Drachen-Gefährte, der deinem Kind hilft, seine Routinen zu entdecken. Und eines Tages nicht mehr gebraucht wird."
        canonicalPath="/v2"
        noindex
      />
      <HeroV2 />
      <Quote />
      <BeforeAfter />
      <Pillars />
      <ArcStoryboard />
      <ScienceStrip />
      <AppPreview />
      <ClosingCTA />
      <Footer />
    </PainterlyShell>
  );
}
