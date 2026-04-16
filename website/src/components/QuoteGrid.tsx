import { motion } from 'motion/react';

const QUOTES = [
  {
    text: '„Von Morgen-Chaos zu Morgen-Ruhe in weniger als einer Woche. Die Schuh-Suche, das ständige Rufen. einfach weg."',
    name: 'Andrea',
    role: 'Mutter von Mia (6)',
  },
  {
    text: '„Mein Sohn kümmert sich mit dem Drachen um seine Sachen. Es ist kein Streit mehr. es ist einfach sein Ding."',
    name: 'Marc',
    role: 'Vater von Louis (7)',
  },
  {
    text: '„Leo schaut schon kürzer rein als am Anfang. Macht seine Sachen, fertig. Die App wird überflüssig. So soll es sein."',
    name: 'Sofia',
    role: 'Mutter von Leo (8)',
  },
];

export function QuoteGrid() {
  return (
    <section className="px-6 py-24 sm:py-28 border-t border-teal/10">
      <div className="max-w-6xl mx-auto">
        <motion.p
          initial={{ opacity: 0, y: 8 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-10%' }}
          transition={{ duration: 0.5 }}
          className="text-xs uppercase tracking-[0.2em] text-teal-dark/85 mb-12 font-semibold text-center"
        >
          Was Eltern sagen
        </motion.p>
        <div className="grid md:grid-cols-3 gap-8">
          {QUOTES.map((q, i) => (
            <motion.div
              key={q.name}
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-10%' }}
              transition={{ duration: 0.6, delay: i * 0.1 }}
              className="space-y-5"
            >
              <div className="flex gap-0.5">
                {[...Array(5)].map((_, j) => (
                  <span key={j} className="text-mustard text-lg">&#9733;</span>
                ))}
              </div>
              <p className="font-display text-lg sm:text-xl text-teal-dark leading-snug">
                {q.text}
              </p>
              <div>
                <p className="font-display font-bold text-teal-dark text-sm">{q.name}</p>
                <p className="text-xs text-ink/60">{q.role}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
