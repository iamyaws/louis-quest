/**
 * /tools — index page listing the available parent tools.
 *
 * V1 contains only the Dark Pattern Scanner (`/tools/app-check`). Future
 * tools (Familien-Medien-Charter Generator, Routine-Builder, etc.) will
 * land as additional cards here.
 */

import { Link } from 'react-router-dom';
import { motion, useReducedMotion } from 'motion/react';
import { PageMeta } from '../../components/PageMeta';
import { PainterlyShell } from '../../components/PainterlyShell';
import { Footer } from '../../components/Footer';
import { ArrowRight } from '../../components/AppCheck/Icons';
import { fadeUp } from '../../lib/motion';

export default function ToolsHub() {
  const reduced = useReducedMotion();
  return (
    <PainterlyShell>
      <PageMeta
        title="Werkzeuge für Eltern: Ronki"
        description="Kleine Werkzeuge die Eltern helfen, digitale Entscheidungen für ihr Kind selbst zu treffen. Aktuell: der App-Check für Kinder-Apps."
        canonicalPath="/tools"
      />

      <section className="px-6 pt-32 pb-12 sm:pt-40 sm:pb-16">
        <div className="max-w-4xl mx-auto">
          <motion.div {...fadeUp(0, reduced)}>
            <Link
              to="/"
              className="inline-flex items-center gap-2 text-sm text-teal-dark/60 hover:text-teal-dark focus:outline-none focus-visible:text-teal-dark focus-visible:underline underline-offset-4 transition-colors mb-8"
            >
              <span aria-hidden>←</span> Zurück
            </Link>
            <p className="text-xs uppercase tracking-[0.2em] text-teal font-semibold mb-6">
              Werkzeuge
            </p>
            <h1 className="font-display font-bold text-4xl sm:text-5xl lg:text-6xl leading-[1.04] tracking-tight text-teal-dark">
              Werkzeuge für <em className="italic text-sage">Eltern</em>.
            </h1>
            <p className="mt-6 text-base sm:text-lg text-ink/75 max-w-2xl leading-relaxed">
              Kleine Tools die dir helfen, digitale Entscheidungen für dein
              Kind selbst zu treffen. Du bewertest, wir geben dir den Rahmen.
              Kostenlos und ohne Anmeldung, wir setzen auch keine Cookies.
            </p>
          </motion.div>
        </div>
      </section>

      <section className="px-6 pb-28 sm:pb-32">
        <div className="max-w-4xl mx-auto">
          <ul className="grid sm:grid-cols-2 gap-6">
            <ToolCard
              eyebrow="App-Check"
              to="/tools/app-check"
              title="Was steckt eigentlich in der App, die dein Kind so will?"
              description="Zehn Beobachtungs-Fragen, die du selbst beantwortest. Am Ende ein Score und eine Liste der Pattern, die du gerade gesehen hast."
              meta="3 Min · Score + Erklärungen + teilbarer Permalink"
            />
            <ToolCard
              eyebrow="Schlafens-Rechner"
              to="/tools/schlafens-rechner"
              title="19:30 oder doch 20:15?"
              description="Alter und Aufstehzeit rein, vier Uhrzeiten raus. Bildschirm aus, Bett vorbereiten, Vorlesen, Bettzeit. Kein Urteil, nur die Mathematik des Konsens."
              meta="30 Sek · vier Uhrzeiten + Share-Bild"
            />
            <ToolCard
              eyebrow="Familien-Medien-Charter"
              to="/tools/familien-charter"
              title="Eure Regeln. Eine Seite. An den Kühlschrank."
              description="Sechs kurze Schritte, dann steht eure eigene Charter da. Nicht von uns vorgegeben, sondern aus dem zusammengesetzt, was ihr in der Familie eh schon entschieden habt."
              meta="5 Min · Druckbar als PDF + Social-Card"
            />
            <ToolCard
              eyebrow="Konsolen-Check"
              to="/tools/konsolen-check"
              title="Bevor der Karton aufgemacht wird."
              description="Zehn Fragen zu Konto, Ort, Käufen und Zeit. Am Ende ein Profil-Urteil, eine Pro/Kontra-Liste und die Konfigurations-Checkliste für genau eure Plattform."
              meta="5 Min · Pro/Kontra + Plattform-Checkliste"
            />
          </ul>
          <p className="mt-10 text-sm text-ink/55 leading-relaxed text-center">
            Weitere Werkzeuge folgen. Schreib uns woran ihr hängt:{' '}
            <a
              href="mailto:hallo@ronki.de"
              className="text-teal underline underline-offset-2 focus:outline-none focus-visible:text-teal-dark focus-visible:decoration-2"
            >
              hallo@ronki.de
            </a>
          </p>
        </div>
      </section>

      <Footer />
    </PainterlyShell>
  );
}

function ToolCard({
  eyebrow,
  to,
  title,
  description,
  meta,
}: {
  eyebrow: string;
  to: string;
  title: string;
  description: string;
  meta: string;
}) {
  return (
    <li>
      <Link
        to={to}
        className="group relative block h-full rounded-2xl bg-cream/70 backdrop-blur-sm border border-teal/10 p-7 hover:shadow-lg hover:-translate-y-1 focus-visible:-translate-y-1 focus-visible:shadow-lg focus:outline-none focus-visible:ring-2 focus-visible:ring-sage focus-visible:ring-offset-2 focus-visible:ring-offset-cream transition-all duration-300 overflow-hidden"
      >
        {/* 4mm gradient stripe at the top of the card — house ribbon. */}
        <span
          aria-hidden
          className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-mustard via-sage to-teal"
        />
        <p className="text-xs uppercase tracking-[0.18em] text-teal font-semibold mb-3">
          {eyebrow}
        </p>
        <h2 className="font-display font-bold text-2xl text-teal-dark leading-snug mb-3">
          {title}
        </h2>
        <p className="text-sm text-ink/70 leading-relaxed mb-4">
          {description}
        </p>
        <p className="text-xs text-ink/55 mb-5 tabular-nums">{meta}</p>
        <span className="inline-flex items-center gap-1.5 text-sm text-teal font-semibold group-hover:gap-2 transition-all">
          Tool öffnen
          <ArrowRight className="transition-transform group-hover:translate-x-0.5" />
        </span>
      </Link>
    </li>
  );
}
