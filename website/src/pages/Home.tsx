import { PageMeta } from '../components/PageMeta';
import { OrganizationSchema, SoftwareApplicationSchema } from '../components/JsonLd';
import { PainterlyShell } from '../components/PainterlyShell';
import { Hero } from '../components/Hero';
import { Quote } from '../components/Quote';
import { BeforeAfter } from '../components/BeforeAfter';
import { ArcStoryboard } from '../components/ArcStoryboard';
import { IntrinsicMotivation } from '../components/IntrinsicMotivation';
import { AntiFeatures } from '../components/AntiFeatures';
import { FAQ } from '../components/FAQ';
import { CountdownCTA } from '../components/CountdownCTA';
import { Footer } from '../components/Footer';

export default function Home() {
  return (
    <PainterlyShell>
      <PageMeta
        title="Ronki: Der Drachen-Gefährte für Kinder-Routinen"
        description="Ronki trägt die Routine mit. Ein Drachen-Gefährte, der Kinder durch den Alltag begleitet. Ohne Streaks, ohne Werbung, ohne Dark Patterns."
        canonicalPath="/"
      />
      <OrganizationSchema />
      <SoftwareApplicationSchema />
      <Hero />
      <Quote />
      <BeforeAfter />
      <ArcStoryboard />
      <IntrinsicMotivation />
      <AntiFeatures />
      <CountdownCTA />
      <FAQ />
      <Footer />
    </PainterlyShell>
  );
}
