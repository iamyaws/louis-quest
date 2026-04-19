import { RoutinePrintSheet } from '../components/RoutinePrintSheet';

export default function VorlageKleineGeschwister() {
  return (
    <RoutinePrintSheet
      slug="kleine-geschwister"
      eyebrow="Für die Kleinen"
      title="Mein Tag"
      description="Ganz einfach, nur mit Bildern. Dein kleines Kind malt den großen Kreis aus, wenn es fertig ist."
      accent="#50a082"
      bigIcons
      steps={[
        { icon: '🪥', label: '' },
        { icon: '👕', label: '' },
        { icon: '🥣', label: '' },
        { icon: '🧸', label: '' },
      ]}
      footerLine="ronki.de · für kleine Geschwister"
    />
  );
}
