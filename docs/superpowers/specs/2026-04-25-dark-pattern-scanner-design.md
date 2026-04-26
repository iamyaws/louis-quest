# Dark Pattern Scanner V1 — Design Spec

**Date:** 2026-04-25
**Status:** Approved by Marc, ready for implementation
**Slug:** `/tools/app-check`

## Purpose

Eltern-Werkzeug das aus 10 Beobachtungs-Fragen eine Einschätzung der Dark-Pattern-Mechaniken einer App liefert. Marc / Ronki bewerten **keine Apps** — Eltern bewerten ihre Beobachtungen. Das Tool aggregiert.

Strategischer Zweck: Demonstriert Marc's Builder-Glaubwürdigkeit konkret, viraler Asset, compoundiert das Manifesto. Asymmetric bet aus dem Strategy-Brief (24. April).

## Hard Legal Boundary

**Es gibt zu keinem Zeitpunkt automatisierte Scoring-Logik die ohne Mensch-im-Loop App-Bewertungen erzeugt.** Marc seedet manuell als Pilot-Eltern, Pilot-Gruppe ergänzt, Community wächst organisch. Niemals Ronki-Algorithmus = App-Score.

Jede Aussage über eine spezifische App im Tool oder in Permalinks ist mit "Aus deiner Sicht" / "Aus Sicht eines Elternteils" geframet. Disclaimers an drei festen Positionen (Tool-Footer, Result-Page, Saved-Page).

## Architektur

- Eigenständige Tools-Route `/tools/app-check`
- Tools-Hub `/tools` als Container für künftige Tools
- Permalink `/tools/app-check/r/:id` (read-only)
- Stack: bestehender React + Vite + Tailwind 4 + Supabase
- State: lokal in React, Submit nach Supabase mit kurzer ID

## Supabase-Schema

```sql
create table public.app_evals (
  id text primary key,                    -- nanoid 8 chars
  app_name text not null,
  app_id_curated text,                    -- nullable, FK zur Curated-Liste
  answers jsonb not null,
  score smallint not null,
  created_at timestamptz default now(),
  client_locale text default 'de'
);

create policy "insert_open" on app_evals for insert with check (true);
create policy "read_by_id_only" on app_evals for select using (true);

create view public.app_eval_counts as
select app_name, count(*) as n
from public.app_evals
group by app_name;
```

Anti-Spam: Edge Function als Insert-Wrapper (5 Inserts pro IP pro Stunde) + Honeypot-Feld.

## UX-Flow (5 Screens)

1. **Landing** — Eyebrow "Werkzeug für Eltern" + H1 "Welche App will dein Kind?" + CTA "App prüfen" + Disclaimer-Footer.
2. **App-Eingabe** — Combobox mit kuratierter Dropdown-Liste + "Andere App eingeben" Free-Text. Counter-Display nach Wahl.
3. **Fragebogen** — Step-by-step, 1 Frage pro Screen, Progress "Frage 3/10", Yes/No Buttons, optional "Erklär mir das"-Toggle.
4. **Result** — Score-Visual mit drei Bändern, "Aus deiner Sicht: [Band]", pro "Ja" eine Educational-Box, CTA "Speichern und teilen" + "Andere App prüfen".
5. **Saved (`/tools/app-check/r/:id`)** — Selbe Score-Visual, Permalink + Copy, Share-Buttons (WhatsApp, Email, X), Footer-Disclaimer.

## Fragenkatalog + Scoring

10 Fragen. Scoring: jede problematische Antwort = +1. Q8 "Mechanik" = +1, "Inhalt" = 0. Q10 "Nein" = +1 (kein Ende-Signal ist negativ), "Ja" = 0. Range: 0-10.

| # | Frage | Pattern-Punkte |
|---|---|---|
| 1 | Hat die App Streaks oder ähnliche "Verliere-nichts"-Mechaniken? | +1 falls Ja |
| 2 | Schickt die App Push-Benachrichtigungen an euer Gerät? | +1 falls Ja |
| 3 | Gibt es eine Belohnungsökonomie (Punkte, Coins, Avatare, Sammelstücke)? | +1 falls Ja |
| 4 | Sind Skins / Charaktere / Cosmetics gegen Echtgeld kaufbar? | +1 falls Ja |
| 5 | Siehst du Werbung in der App? | +1 falls Ja |
| 6 | Ist die Werbung selbst spielbar (Mini-Games statt Video)? | +1 falls Ja |
| 7 | Gibt es Leaderboards oder Vergleiche mit anderen Kindern? | +1 falls Ja |
| 8 | Würde dein Kind den Inhalt vermissen oder die App-Mechanik? | +1 falls Mechanik |
| 9 | Werden mehr Daten erhoben als für die Funktion nötig wären? | +1 falls Ja |
| 10 | Sagt die App deinem Kind irgendwann "du bist fertig für heute"? | +1 falls Nein |

**Score-Bänder:**
- 0-2: "Aus deiner Sicht eher unbedenklich" (sage)
- 3-5: "Aus deiner Sicht aufmerksamkeitswürdig" (mustard)
- 6-10: "Aus deiner Sicht vorsichtig sein" (clay)

## Voice + Disclaimers

Brand-Voice: ruhig, direkt, ehrlich. **"Aus deiner Sicht"** als wiederkehrendes Präfix bei jeder Bewertungs-Aussage.

Drei juristisch tragende Disclaimers:
1. **Tool-Footer** (alle Screens): "Du bewertest, wir geben dir den Rahmen."
2. **Result-Page (Screen 4)**: "Diese Bewertung basiert auf deinen Antworten. Sie ist deine Einschätzung der App-Mechaniken aus deiner Erfahrung, kein verifizierter Test."
3. **Saved-Page (Screen 5)**: "Diese Bewertung gibt die Beobachtungen einer Person wieder. Sie ist keine Aussage von Ronki über die App."

## Datenschutz

Pflicht-Update der Datenschutzerklärung:
- Was: App-Name + 10 Antworten + Zeitstempel + Locale
- Was nicht: kein User-Account, keine IP-Speicherung dauerhaft, keine Geräte-Fingerprints
- Recht auf Löschung: per Eval-ID per Email an hallo@ronki.de
- Anwalt-Approval vor Public Launch

## Out-of-Scope V1 (deferred)

- Aggregations-Sicht über Apps (V2 nach Anwalt-Approval)
- Vergleichsfunktion zwischen Apps
- Empfehlungs-Engine
- User-Accounts oder Login
- Eigene Marc-bewertete App-Datenbank
- Apple/Google App-Store Integration
- Email-Capture
- Embed-Widget
- Englische Variante

## Implementation Reihenfolge

1. Supabase Migration (Tabelle + RLS + View)
2. Routen in `routes.tsx`: `/tools`, `/tools/app-check`, `/tools/app-check/r/:id`
3. `lib/app-check/`: questions, curated-apps, score, supabase, share helpers
4. `components/AppCheck/`: Disclaimer, AppEntry, QuestionScreen, ResultScore, PatternExplanation, ShareButtons
5. `pages/tools/`: ToolsHub, AppCheck (multi-screen flow), AppCheckResult (permalink)
6. Datenschutzerklärung Update
7. Sitemap Eintrag (oder bewusst weglassen für /tools/app-check/r/* da personenbezogene Permalinks)

## Erwartete Build-Zeit

Eine konzentrierte Tag-Session (4-6h). Kann auf zwei Sessions aufgeteilt werden: Tag 1 Schema + Pages + Flow, Tag 2 Polish + Disclaimers + Datenschutz.
