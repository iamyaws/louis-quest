import { motion } from 'motion/react';
import { ContainerScroll } from './primitives/ContainerScroll';

export function AppPreview() {
  return (
    <ContainerScroll
      titleComponent={
        <>
          <p className="text-xs uppercase tracking-[0.2em] text-teal mb-5 font-medium">
            Für Kind und Eltern
          </p>
          <h2 className="font-display font-bold text-4xl sm:text-5xl lg:text-6xl leading-[1.02] tracking-tight text-teal-dark max-w-3xl mx-auto">
            Eine App. Zwei Blickwinkel.{' '}
            <em className="italic text-sage">Ein Zuhause.</em>
          </h2>
          <p className="mt-5 text-base sm:text-lg opacity-70 max-w-xl mx-auto leading-relaxed">
            Dein Kind hat seinen eigenen Tag mit Ronki, und ist dabei in guten Händen. Du bekommst kein Kontroll-Dashboard, nur das ruhige Gefühl, dass alles läuft, auch wenn die Zahnbürste noch im Bad liegt.
          </p>
        </>
      }
    >
      <div className="grid grid-cols-1 md:grid-cols-[1.1fr_1fr] h-full">
        <div className="relative p-8 sm:p-12 flex flex-col justify-between bg-gradient-to-br from-mustard-soft/40 via-cream to-sage-soft/30 border-r border-teal/10">
          <div>
            <p className="text-[0.65rem] uppercase tracking-[0.15em] text-teal/60 mb-3">
              Eigenverantwortung statt Gehorsam
            </p>
            <h3 className="font-display font-bold text-2xl sm:text-3xl text-teal-dark leading-tight">
              Da bist du ja.
            </h3>
          </div>
          <motion.div
            animate={{ y: [0, -6, 0] }}
            transition={{ duration: 3.2, repeat: Infinity, ease: 'easeInOut' }}
            className="my-6 flex-1 flex items-center justify-center"
          >
            <div className="relative">
              <div className="h-36 w-36 sm:h-44 sm:w-44 rounded-full bg-gradient-to-br from-teal via-teal-light to-sage shadow-xl flex items-center justify-center">
                <div className="h-20 w-20 sm:h-24 sm:w-24 rounded-full bg-gradient-to-br from-mustard to-mustard-soft shadow-inner" />
              </div>
              <div className="absolute -top-2 -right-2 h-6 w-6 rounded-full bg-sage shadow-md" />
              <div className="absolute -bottom-1 left-4 h-5 w-5 rounded-full bg-mustard shadow-md" />
            </div>
          </motion.div>
          <div className="space-y-3">
            <div className="rounded-2xl bg-cream/80 backdrop-blur p-4 shadow-sm border border-teal/10">
              <p className="text-sm font-medium text-teal-dark">Zähne putzen</p>
              <p className="text-xs opacity-60">Ich halt den Becher.</p>
            </div>
            <div className="rounded-2xl bg-cream/80 backdrop-blur p-4 shadow-sm border border-teal/10">
              <p className="text-sm font-medium text-teal-dark">Kommst du kurz zum Nest?</p>
              <p className="text-xs opacity-60">Das Ei macht was.</p>
            </div>
          </div>
        </div>

        <div className="relative p-8 sm:p-10 flex flex-col justify-between bg-gradient-to-br from-cream via-cream to-teal/5">
          <div>
            <p className="text-[0.65rem] uppercase tracking-[0.15em] text-teal/60 mb-3">
              Einblick ohne Überwachung
            </p>
            <h3 className="font-display font-bold text-lg sm:text-xl text-teal-dark leading-tight">
              Louis hat seine Morgenroutine heute gemacht.
            </h3>
          </div>
          <div className="my-6 flex-1 flex flex-col gap-3 justify-center">
            <Row label="Morgens" status="fertig" color="sage" />
            <Row label="Nachmittags" status="läuft" color="mustard" />
            <Row label="Abends" status="offen" color="teal" faded />
          </div>
          <div className="rounded-xl bg-sage/15 border border-sage/30 p-3 text-[0.75rem] text-teal-dark">
            <span className="font-medium">Keine Streaks.</span>{' '}
            <span className="opacity-75">Kontinuität wächst in Ronkis Welt.</span>
          </div>
        </div>
      </div>
    </ContainerScroll>
  );
}

function Row({ label, status, color, faded }: { label: string; status: string; color: 'sage' | 'mustard' | 'teal'; faded?: boolean }) {
  const dot = color === 'sage' ? 'bg-sage' : color === 'mustard' ? 'bg-mustard' : 'bg-teal';
  return (
    <div className={`flex items-center justify-between px-4 py-3 rounded-xl bg-cream/70 backdrop-blur border border-teal/10 ${faded ? 'opacity-50' : ''}`}>
      <div className="flex items-center gap-3">
        <span className={`h-2 w-2 rounded-full ${dot}`} />
        <span className="text-sm font-medium text-teal-dark">{label}</span>
      </div>
      <span className="text-xs opacity-60">{status}</span>
    </div>
  );
}
