export function RealQuote() {
  return (
    <section className="px-6 py-20 bg-cream/40" aria-labelledby="real-quote-heading">
      <div className="max-w-3xl mx-auto flex flex-col gap-6 items-start">
        <p id="real-quote-heading" className="text-sm uppercase tracking-widest text-ochre font-medium">
          Was Eltern wirklich erleben
        </p>
        <blockquote className="text-2xl sm:text-3xl font-display leading-snug">
          „Ronki nimmt uns tausend Diskussionen ab. Mein Sohn kümmert sich mit dem Drachen um seine Routinen — und fühlt sich dabei selbstständig, nicht kontrolliert."
        </blockquote>
        <footer className="flex items-center gap-3 text-sm opacity-75">
          <span className="w-10 h-10 rounded-full bg-ochre/30 flex items-center justify-center font-display">M</span>
          <span>Marc, Vater von Louis (7)</span>
        </footer>
      </div>
    </section>
  );
}
