import { Hero } from '../components/Hero';
import { RealQuote } from '../components/RealQuote';
import { Pillars } from '../components/Pillars';
import { ArcStoryboard } from '../components/ArcStoryboard';
import { AntiFeatures } from '../components/AntiFeatures';
import { Footer } from '../components/Footer';
import { WaitlistCTA } from '../components/WaitlistCTA';
import { PageMeta } from '../components/PageMeta';
import { SectionHeading } from '../components/SectionHeading';
import { LAUNCH_STATE } from '../config/launch-state';

export default function Home() {
  return (
    <>
      <PageMeta
        title="Ronki — Der Drachen-Gefährte für Kinder-Routinen"
        description="Ronki trägt die Routine mit. Ein Drachen-Gefährte, der Kinder durch den Alltag begleitet — ohne Streaks, ohne Werbung, ohne Dark Patterns."
        canonicalPath="/"
      />
      <Hero />
      <RealQuote />
      <Pillars />
      <ArcStoryboard />
      <AntiFeatures />
      <ClosingCTA />
      <Footer />
    </>
  );
}

function ClosingCTA() {
  return (
    <section className="px-6 py-24 bg-moss/10" aria-labelledby="closing-cta-heading">
      <div className="max-w-3xl mx-auto text-center flex flex-col gap-8 items-center">
        <SectionHeading id="closing-cta-heading" eyebrow="Bald verfügbar">
          Trag dich ein — wir melden uns einmal.
        </SectionHeading>
        <div className="w-full max-w-md">
          <WaitlistCTA launchState={LAUNCH_STATE} />
        </div>
      </div>
    </section>
  );
}
