import { PageMeta } from '../components/PageMeta';
import { OrganizationSchema, SoftwareApplicationSchema, FAQPageSchema } from '../components/JsonLd';
import { PainterlyShell } from '../components/PainterlyShell';
import { HeroVariantF } from '../components/HeroVariantF';
import { Quote } from '../components/Quote';
import { BeforeAfter } from '../components/BeforeAfter';
import { ArcStoryboard } from '../components/ArcStoryboard';
import { IntrinsicMotivation } from '../components/IntrinsicMotivation';
import { AntiFeatures } from '../components/AntiFeatures';
import { FAQ } from '../components/FAQ';
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
      <HeroVariantF />
      <Quote />
      <BeforeAfter />
      <ArcStoryboard />
      <IntrinsicMotivation />
      <AntiFeatures />
      <FAQPageSchema
        items={[
          {
            question: 'Ist Ronki eine App?',
            answer:
              'Ronki ist eine Web-App, die du direkt über den Browser auf deinem Startbildschirm installierst. Kein App Store, kein Download, keine Tracker.',
          },
          {
            question: 'Ab welchem Alter ist Ronki geeignet?',
            answer:
              'Ronki ist für Kinder zwischen 5 und 9 Jahren gedacht. In dieser Phase lernen Kinder, eigene Routinen aufzubauen. Ronki begleitet genau diesen Schritt.',
          },
          {
            question: 'Was kostet Ronki?',
            answer:
              'Ronki ist gerade in der Entwicklung. Trag dich auf die Warteliste ein, wir melden uns einmal, wenn es losgeht. Kein Spam, versprochen.',
          },
          {
            question: 'Wie schützt ihr die Daten meines Kindes?',
            answer:
              'Datenschutz ist kein Feature, sondern Grundlage. Ronki speichert keine persönlichen Daten auf externen Servern, nutzt keine Tracking-Pixel und zeigt keine Werbung. Alles bleibt auf eurem Gerät.',
          },
          {
            question: 'Braucht mein Kind ein eigenes Gerät?',
            answer:
              'Nein. Ronki funktioniert auf dem Familien-Tablet oder einem geteilten Gerät. Jedes Kind hat ein eigenes Profil, geschützt und getrennt.',
          },
        ]}
      />
      <FAQ />
      <Footer />
    </PainterlyShell>
  );
}
