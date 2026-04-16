import { motion } from 'motion/react';

const STEPS = [
  { step: '1', title: 'Link öffnen', body: 'Öffne Ronki im Browser deines Handys.', icon: 'open_in_browser' },
  { step: '2', title: 'Zum Startbildschirm', body: 'Tippe auf „Teilen" und wähle „Zum Home-Bildschirm".', icon: 'add_to_home_screen' },
  { step: '3', title: 'Fertig', body: 'Starte Ronki wie eine normale App, ohne App-Store.', icon: 'check_circle' },
];

export function PWAInstall() {
  return (
    <section className="px-6 py-24 sm:py-28" aria-labelledby="pwa-heading">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: '-10%' }}
        transition={{ duration: 0.7 }}
        className="max-w-5xl mx-auto rounded-3xl bg-teal-dark p-8 sm:p-12 lg:p-16 relative overflow-hidden"
        style={{ boxShadow: '0 30px 60px -20px rgba(45,90,94,0.5)' }}
      >
        <div
          className="absolute top-0 right-0 w-96 h-96 -mr-32 -mt-32 rounded-full blur-[100px] pointer-events-none"
          style={{ background: 'rgba(45,90,94,0.4)' }}
        />

        <div className="relative z-10 text-center max-w-3xl mx-auto">
          <p className="text-[0.65rem] uppercase tracking-[0.15em] text-cream/70 font-semibold mb-4">
            Kein App Store nötig
          </p>
          <h2
            id="pwa-heading"
            className="font-display font-bold text-3xl sm:text-4xl lg:text-5xl text-cream leading-tight mb-4"
          >
            Kein Store. Kein Tracking.{' '}
            <em className="italic text-mustard">Direkt auf deinem Gerät.</em>
          </h2>
          <p className="text-base sm:text-lg text-cream/60 leading-relaxed mb-12 max-w-xl mx-auto">
            Ronki ist eine Web-App. Keine Drittanbieter-Tracker, kein Store-Bloat, nur eine direkte Verbindung von uns zu euch. Sicher, privat, in Sekunden installiert.
          </p>

          <div className="grid sm:grid-cols-3 gap-5">
            {STEPS.map((s, i) => (
              <motion.div
                key={s.step}
                initial={{ opacity: 0, y: 12 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: 0.2 + i * 0.1 }}
                className="bg-cream/8 backdrop-blur-sm rounded-2xl p-6 border border-cream/10"
              >
                <div className="w-10 h-10 rounded-full bg-mustard/80 flex items-center justify-center text-teal-dark font-display font-bold text-sm mb-4 mx-auto">
                  {s.step}
                </div>
                <h3 className="font-display font-bold text-cream text-base mb-2">{s.title}</h3>
                <p className="text-sm text-cream/70 leading-relaxed">{s.body}</p>
              </motion.div>
            ))}
          </div>

          <div className="flex flex-wrap gap-4 justify-center mt-10">
            <div className="flex items-center gap-2 bg-cream/10 px-4 py-2 rounded-xl border border-cream/10">
              <span className="text-cream/70 text-sm">&#128274;</span>
              <span className="text-[0.7rem] text-cream/70 font-display font-bold">Privacy First</span>
            </div>
            <div className="flex items-center gap-2 bg-cream/10 px-4 py-2 rounded-xl border border-cream/10">
              <span className="text-cream/70 text-sm">&#9889;</span>
              <span className="text-[0.7rem] text-cream/70 font-display font-bold">Offline-fähig</span>
            </div>
            <div className="flex items-center gap-2 bg-cream/10 px-4 py-2 rounded-xl border border-cream/10">
              <span className="text-cream/70 text-sm">&#128241;</span>
              <span className="text-[0.7rem] text-cream/70 font-display font-bold">Kein Download</span>
            </div>
          </div>
        </div>
      </motion.div>
    </section>
  );
}
