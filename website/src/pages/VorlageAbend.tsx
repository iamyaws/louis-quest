import { RoutinePrintSheet } from '../components/RoutinePrintSheet';

export default function VorlageAbend() {
  return (
    <RoutinePrintSheet
      slug="abendroutine"
      eyebrow="Abend"
      title="Die Abendroutine"
      description="Vier Schritte bis ins Bett. Dein Kind malt den Kreis aus, wenn ein Schritt geschafft ist."
      accent="#4338ca"
      steps={[
        { icon: '🪥', label: 'Zähne putzen', hint: 'Auch die hinten im Mund.' },
        { icon: '🧼', label: 'Gesicht waschen', hint: 'Mit Wasser, ganz sanft.' },
        { icon: '🌙', label: 'Pyjama an', hint: 'Die Sachen von heute in den Korb.' },
        { icon: '📖', label: 'Licht aus', hint: 'Eine Geschichte, dann schlafen.' },
      ]}
    />
  );
}
