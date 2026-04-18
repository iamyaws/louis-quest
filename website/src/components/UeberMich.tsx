import { motion } from 'motion/react';
import { useState } from 'react';

/**
 * Über den Macher section. Marc's personal story, visible trust signal.
 * Photo gracefully falls back to an initial if /art/marc.webp is missing.
 */
export function UeberMich() {
  const [imgLoaded, setImgLoaded] = useState(false);
  const [imgFailed, setImgFailed] = useState(false);

  return (
    <section
      className="relative px-6 py-24 sm:py-32 border-t border-teal/10"
      aria-labelledby="ueber-mich-heading"
    >
      <div className="max-w-5xl mx-auto">
        <motion.p
          initial={{ opacity: 0, y: 8 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-xs uppercase tracking-[0.2em] text-teal mb-6 font-medium"
        >
          Über den Macher
        </motion.p>

        <div className="grid md:grid-cols-[auto_1fr] gap-10 md:gap-14 items-start">
          {/* Photo column */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7 }}
            className="relative shrink-0"
          >
            <div
              aria-hidden
              className="absolute -inset-5 rounded-[2rem] blur-3xl opacity-60"
              style={{ background: 'radial-gradient(circle, rgba(252,211,77,0.20) 0%, transparent 65%)' }}
            />
            <div
              className="relative w-40 h-40 sm:w-48 sm:h-48 md:w-56 md:h-56 rounded-[1.5rem] overflow-hidden bg-teal-dark/5 ring-1 ring-teal/10 flex items-center justify-center"
              style={{ boxShadow: '0 20px 40px -20px rgba(45,90,94,0.25)' }}
            >
              {/* Marc's actual photo — replace /art/marc.webp when ready */}
              {!imgFailed && (
                <img
                  src="/art/marc.webp"
                  alt="Marc Förster, der Macher von Ronki."
                  width={224}
                  height={224}
                  onLoad={() => setImgLoaded(true)}
                  onError={() => setImgFailed(true)}
                  className={`w-full h-full object-cover transition-opacity duration-500 ${
                    imgLoaded ? 'opacity-100' : 'opacity-0 absolute'
                  }`}
                />
              )}
              {/* Fallback: stylized initial while photo is missing */}
              {!imgLoaded && (
                <div className="flex flex-col items-center gap-2 text-teal-dark/40">
                  <span className="font-display font-extrabold text-6xl sm:text-7xl">M</span>
                  <span className="text-[10px] uppercase tracking-[0.15em] text-teal-dark/30 font-medium">
                    Foto folgt
                  </span>
                </div>
              )}
            </div>
            {/* Name tag below photo */}
            <div className="mt-4 text-center md:text-left">
              <p className="font-display font-bold text-teal-dark text-base">Marc Förster</p>
              <p className="text-sm text-ink/60 mt-0.5">Vater · Unterföhring</p>
            </div>
          </motion.div>

          {/* Text column */}
          <div className="flex flex-col gap-6">
            <motion.h2
              id="ueber-mich-heading"
              initial={{ opacity: 0, y: 12 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.7 }}
              className="font-display font-bold text-3xl sm:text-4xl lg:text-5xl leading-[1.1] tracking-tight text-teal-dark"
            >
              Ronki ist kein Produkt. Es ist ein{' '}
              <em className="italic text-sage whitespace-nowrap">Experiment</em>{' '}
              mit meinem Sohn.
            </motion.h2>

            <motion.div
              initial={{ opacity: 0, y: 12 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.7, delay: 0.15 }}
              className="flex flex-col gap-5 text-base sm:text-lg text-ink/75 leading-relaxed max-w-2xl"
            >
              <p>
                Ich arbeite seit Jahren als Consultant für Gaming und Esports. Ich weiß, wie Spiele heute gemacht sind. Wo die Casino-Mechaniken versteckt sind, warum manche Apps Kinder minutenlang festhalten, wie Dopamin-Loops funktionieren. Ein Teil von mir hat beruflich daran mitgebaut. Ein anderer Teil wollte das nie in der Hand seines Sohnes sehen.
              </p>
              <p>
                Dann kam Louis in die erste Klasse. Plötzlich reden alle Kinder über Roblox und Fortnite, während wir morgens noch mit Zähneputzen, Anziehen und Tasche packen kämpfen. Irgendwann dachte ich: Wenn andere Apps so gut darin sind, Aufmerksamkeit zu fangen, warum nicht eine bauen, die das Gegenteil macht? Eine, die leise erinnert, begleitet, und sich irgendwann selbst überflüssig macht.
              </p>
            </motion.div>

            {/* Quote callout in his own voice */}
            <motion.blockquote
              initial={{ opacity: 0, y: 12 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.7, delay: 0.3 }}
              className="relative mt-2 max-w-2xl"
            >
              <span
                aria-hidden
                className="absolute -top-6 -left-2 font-display font-extrabold text-7xl leading-none text-mustard/40 select-none"
              >
                &ldquo;
              </span>
              <p className="relative font-display italic text-lg sm:text-xl text-teal-dark leading-snug pl-6">
                Ich sehe auf dem Spielplatz, im Restaurant, auf der Rückbank: Kinder mit zwei Stunden YouTube Kids, damit Eltern Pause haben. Das ist nicht der Weg, den ich für Louis oder irgendein anderes Kind will.
              </p>
            </motion.blockquote>

            <motion.div
              initial={{ opacity: 0, y: 12 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.7, delay: 0.45 }}
              className="flex flex-col gap-5 text-base sm:text-lg text-ink/75 leading-relaxed max-w-2xl"
            >
              <p>
                Ronki ist nicht die Wunderlösung. Es ist ein Weg unter vielen. Ich baue das mit Louis zusammen. Er ist mein erster Nutzer, mein härtester Kritiker und manchmal auch mein Co-Designer. Wenn es bei euch einen Unterschied macht, freut mich das. Wenn nicht, habt ihr wenigstens eine App ausprobiert, die keine Werbung zeigt, keine Streaks erzwingt und keine Tricks versteckt.
              </p>
              <p className="font-display font-semibold text-teal-dark">
                Wenn in einem Jahr jemand sagt: „Der Marc hatte recht. Es kann funktionieren. Und wir hatten eine schöne gemeinsame Zeit mit Ronki." Dann hat sich alles gelohnt.
              </p>
            </motion.div>
          </div>
        </div>
      </div>
    </section>
  );
}
