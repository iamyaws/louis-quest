/**
 * Konsolen-Vor-Kauf-Check — data model + result-engine for parents
 * weighing a console/tablet/phone purchase for their kid.
 *
 * The result is a structured Pro/Kontra list, a platform-specific
 * config checklist (Familienfreigabe iOS, Microsoft Family, Nintendo
 * Eltern-Konto, Google Family Link), and a printable Hausregel-Template
 * filled with the parent's own answers.
 */

export type Platform =
  | 'ps5'
  | 'xbox'
  | 'switch'
  | 'ipad'
  | 'iphone'
  | 'android-tablet'
  | 'gaming-pc'
  | 'other';

export type Payer = 'eltern' | 'geteilt' | 'geschenk';
export type Setup = 'eltern' | 'gemeinsam' | 'kind';
export type AccountType = 'eigenes-kinderkonto' | 'familienkonto' | 'eltern-konto-mit';
export type Place = 'wohnzimmer' | 'kinderzimmer' | 'beides';
export type GamePicking = 'vorab-abgesprochen' | 'kind-waehlt-mit' | 'kind-waehlt-allein';
export type IapPolicy = 'gesperrt' | 'mit-freigabe' | 'monatliches-budget' | 'frei';
export type TimeLimit = 'taeglich' | 'woechentlich' | 'frei';
export type Conflict = 'vorab-klaeren' | 'ad-hoc';
export type Review = 'drei-monate' | 'sechs-monate' | 'jaehrlich' | 'ad-hoc';

export interface KonsolenAnswers {
  plattform: Platform;
  payer: Payer;
  setup: Setup;
  account: AccountType;
  place: Place;
  gamePicking: GamePicking;
  iap: IapPolicy;
  timeLimit: TimeLimit;
  conflict: Conflict;
  review: Review;
}

export const EMPTY_ANSWERS: KonsolenAnswers = {
  plattform: 'switch',
  payer: 'eltern',
  setup: 'eltern',
  account: 'eigenes-kinderkonto',
  place: 'wohnzimmer',
  gamePicking: 'vorab-abgesprochen',
  iap: 'gesperrt',
  timeLimit: 'taeglich',
  conflict: 'vorab-klaeren',
  review: 'sechs-monate',
};

export const PLATTFORM_LABELS: Record<Platform, string> = {
  ps5: 'PlayStation 5',
  xbox: 'Xbox Series',
  switch: 'Nintendo Switch',
  ipad: 'iPad',
  iphone: 'iPhone',
  'android-tablet': 'Android-Tablet',
  'gaming-pc': 'Gaming-PC',
  other: 'Anderes Gerät',
};

export const PAYER_LABELS: Record<Payer, string> = {
  eltern: 'Wir Eltern zahlen',
  geteilt: 'Kind beteiligt sich',
  geschenk: 'Geschenk (Großeltern, Patenonkel etc.)',
};

export const SETUP_LABELS: Record<Setup, string> = {
  eltern: 'Wir Eltern richten ein',
  gemeinsam: 'Wir richten gemeinsam ein',
  kind: 'Kind macht das selbst',
};

export const ACCOUNT_LABELS: Record<AccountType, string> = {
  'eigenes-kinderkonto': 'Eigenes Kinder-Konto, mit Eltern-Aufsicht verknüpft',
  familienkonto: 'Familienkonto für alle',
  'eltern-konto-mit': 'Kind nutzt Eltern-Konto mit',
};

export const PLACE_LABELS: Record<Place, string> = {
  wohnzimmer: 'Im gemeinsamen Wohnzimmer',
  kinderzimmer: 'Im Kinderzimmer',
  beides: 'Beides, je nach Situation',
};

export const GAME_PICKING_LABELS: Record<GamePicking, string> = {
  'vorab-abgesprochen': 'Wir besprechen jedes Spiel vorab',
  'kind-waehlt-mit': 'Kind wählt mit, Eltern haben das letzte Wort',
  'kind-waehlt-allein': 'Kind wählt selbst, im Rahmen der Hausregeln',
};

export const IAP_LABELS: Record<IapPolicy, string> = {
  gesperrt: 'In-App-Käufe komplett gesperrt',
  'mit-freigabe': 'Käufe nur mit Eltern-Freigabe pro Kauf',
  'monatliches-budget': 'Monatliches Taschengeld-Budget für In-App-Käufe',
  frei: 'Kind entscheidet selbst (kein Limit)',
};

export const TIME_LIMIT_LABELS: Record<TimeLimit, string> = {
  taeglich: 'Tägliches Zeitlimit',
  woechentlich: 'Wöchentliches Kontingent',
  frei: 'Keine festen Limits, wir regeln ad-hoc',
};

export const CONFLICT_LABELS: Record<Conflict, string> = {
  'vorab-klaeren':
    'Streitfälle (Zeit, Spiel, Käufe) klären wir vorab in der Hausregel',
  'ad-hoc': 'Wir entscheiden im Streitfall spontan',
};

export const REVIEW_LABELS: Record<Review, string> = {
  'drei-monate': 'Alle drei Monate',
  'sechs-monate': 'Alle sechs Monate',
  jaehrlich: 'Einmal pro Jahr',
  'ad-hoc': 'Wenn wir merken, dass etwas nicht passt',
};

/* ─────────────────────────────────────────────────────────────────────
 * Result engine
 * ──────────────────────────────────────────────────────────────────── */

export interface ResultPoint {
  text: string;
}

export interface KonsolenResult {
  riskProfile: 'eher-entspannt' | 'mittlere-aufmerksamkeit' | 'enge-begleitung';
  riskHeadline: string;
  pros: ResultPoint[];
  contras: ResultPoint[];
  configSteps: ConfigStep[];
}

export interface ConfigStep {
  title: string;
  detail: string;
}

function tally(answers: KonsolenAnswers): number {
  // Higher = more parental hands-on needed.
  let n = 0;
  if (answers.account === 'eltern-konto-mit') n += 1;
  if (answers.account === 'familienkonto') n += 0; // neutral
  if (answers.place === 'kinderzimmer') n += 2;
  if (answers.place === 'beides') n += 1;
  if (answers.gamePicking === 'kind-waehlt-allein') n += 2;
  if (answers.gamePicking === 'kind-waehlt-mit') n += 1;
  if (answers.iap === 'frei') n += 3;
  if (answers.iap === 'monatliches-budget') n += 1;
  if (answers.timeLimit === 'frei') n += 2;
  if (answers.timeLimit === 'woechentlich') n += 1;
  if (answers.conflict === 'ad-hoc') n += 1;
  return n;
}

export function computeResult(answers: KonsolenAnswers): KonsolenResult {
  const score = tally(answers);
  const profile: KonsolenResult['riskProfile'] =
    score <= 2 ? 'eher-entspannt' : score <= 5 ? 'mittlere-aufmerksamkeit' : 'enge-begleitung';

  const riskHeadline =
    profile === 'eher-entspannt'
      ? 'Aus euren Antworten: ihr habt einen klaren Rahmen geplant. Das wird vermutlich entspannt laufen.'
      : profile === 'mittlere-aufmerksamkeit'
      ? 'Aus euren Antworten: euer Setup ist tragfähig, ein paar Punkte solltet ihr engmaschiger begleiten.'
      : 'Aus euren Antworten: das Setup hat viele offene Stellen. Plant viel gemeinsame Zeit für die ersten Wochen ein.';

  const pros: ResultPoint[] = [];
  const contras: ResultPoint[] = [];

  if (answers.setup !== 'kind') {
    pros.push({
      text: 'Ihr richtet selbst (mit) ein. Damit kennt ihr alle Sicherheitseinstellungen von Anfang an.',
    });
  } else {
    contras.push({
      text: 'Wenn das Kind allein einrichtet, fehlt euch der Überblick über Konto-Verknüpfungen, Standardeinstellungen und Zahlungsmittel. Plant zumindest einen gemeinsamen Termin nach der Erstinstallation.',
    });
  }

  if (answers.iap === 'gesperrt') {
    pros.push({
      text: 'Sperre für In-App-Käufe ist die einfachste und konfliktärmste Lösung in der Anfangsphase.',
    });
  } else if (answers.iap === 'frei') {
    contras.push({
      text: 'Frei verfügbare Käufe ohne Limit haben sich in der Praxis selten bewährt, gerade in den ersten Monaten. Mindestens eine Käufe-pro-Klick-Bestätigung einrichten.',
    });
  }

  if (answers.place === 'wohnzimmer') {
    pros.push({
      text: 'Spielen im gemeinsamen Raum macht euch zu natürlichen Mit-Spielern und Mit-Beobachtern.',
    });
  } else if (answers.place === 'kinderzimmer') {
    contras.push({
      text: 'Im Kinderzimmer ist Selbstregulation die einzige Bremse. Vereinbart eine offene-Tür-Regel oder eine sichtbare Endzeit-Erinnerung.',
    });
  }

  if (answers.timeLimit !== 'frei') {
    pros.push({
      text: 'Festes Zeitlimit nimmt die tägliche Verhandlung aus dem Spiel. Konflikte verschieben sich auf den Vereinbarungs-Zeitpunkt.',
    });
  } else {
    contras.push({
      text: 'Ohne festes Limit landet die Verhandlung jeden Tag neu auf dem Tisch. Das kostet euch und das Kind Energie.',
    });
  }

  if (answers.conflict === 'vorab-klaeren') {
    pros.push({
      text: 'Streitfälle vorab durchsprechen ist mehr Aufwand am Anfang, spart aber viele Sekundengefechte später.',
    });
  } else {
    contras.push({
      text: 'Spontane Entscheidungen im Streitfall sind oft inkonsistent. Plant zumindest einen "Eltern-Gipfel" nach den ersten zwei Wochen.',
    });
  }

  if (answers.review === 'drei-monate' || answers.review === 'sechs-monate') {
    pros.push({
      text: 'Geplanter Review-Termin vermeidet, dass alte Regeln einrosten obwohl euer Kind älter geworden ist.',
    });
  }

  if (answers.gamePicking === 'kind-waehlt-allein') {
    contras.push({
      text: 'Spiele-Auswahl allein durch das Kind in dem Alter ist viel verlangt. Mindestens eine Liste der erlaubten Genres absprechen.',
    });
  }

  if (answers.account === 'eltern-konto-mit') {
    contras.push({
      text: 'Wenn das Kind euer Konto mitnutzt, mischt sich Spiel-Verlauf, Käufe und Empfehlungen. Familien-Sharing oder eigenes Kinder-Konto trennt das sauber.',
    });
  }

  return {
    riskProfile: profile,
    riskHeadline,
    pros,
    contras,
    configSteps: configForPlatform(answers),
  };
}

function configForPlatform(answers: KonsolenAnswers): ConfigStep[] {
  switch (answers.plattform) {
    case 'ps5':
      return [
        {
          title: 'Familienverwaltung in PSN einrichten',
          detail:
            'Account-Verwaltung → Familie und Kindersicherheit → Familienmitglied hinzufügen. Eltern werden automatisch Familienmanager.',
        },
        {
          title: 'Altersfreigabe + Spielzeit setzen',
          detail:
            'Pro Kinder-Konto: maximale Altersstufe für Spiele, tägliche Spielzeit, Sperrzeiten.',
        },
        {
          title: 'Käufe-Limits',
          detail:
            'Monatliches Ausgabenlimit für PS Store. Auf 0 EUR setzen wenn ihr "gesperrt" gewählt habt.',
        },
        {
          title: 'Kommunikation einschränken',
          detail:
            'Sprachchat und Nachrichten je nach Alter ausschalten oder auf "nur Freunde" begrenzen.',
        },
      ];
    case 'xbox':
      return [
        {
          title: 'Microsoft Family Group anlegen',
          detail:
            'family.microsoft.com → Familienmitglied hinzufügen → Kinder-Konto. Verknüpft alle Microsoft-Geräte und Game Pass automatisch.',
        },
        {
          title: 'Spielzeit und Bildschirmzeit',
          detail:
            'Im Microsoft Family Dashboard: tägliche Limits pro Tag, App-Limits pro Spiel, Sperrzeiten.',
        },
        {
          title: 'Ausgabenfreigabe',
          detail:
            'Käufe im Xbox/Microsoft Store nur mit Eltern-Freigabe. Funktioniert auch für Game Pass-Erweiterungen.',
        },
        {
          title: 'Kommunikation und Multiplayer',
          detail:
            'Sprachchat, Nachrichten, Profil-Sichtbarkeit pro Kind-Konto kontrollieren.',
        },
      ];
    case 'switch':
      return [
        {
          title: 'Nintendo Switch Eltern-App installieren',
          detail:
            'Im App Store / Play Store: "Nintendo Switch Eltern". Mit eurem Nintendo-Konto verknüpfen.',
        },
        {
          title: 'Tägliche Spielzeit',
          detail:
            'In der Eltern-App: Spielzeit-Limit pro Tag, Sperrzeit am Abend, "Alarm" oder "harte Sperre" je nach Wunsch.',
        },
        {
          title: 'Software-Beschränkungen',
          detail:
            'Maximale Altersstufe für Spiele, Beschränkungen für Online-Funktionen und Bildschirmfotos teilen.',
        },
        {
          title: 'eShop-Käufe',
          detail:
            'Kinder-Konto kann ohne Eltern-Erlaubnis nichts im eShop kaufen. Eltern-Konto verknüpfen, Käufe pro Vorgang freigeben.',
        },
      ];
    case 'ipad':
    case 'iphone':
      return [
        {
          title: 'Familienfreigabe einrichten',
          detail:
            'Einstellungen → [Apple-ID] → Familie → Kind hinzufügen. Erstellt eine eigene Apple-ID für euer Kind, an euren Account gekoppelt.',
        },
        {
          title: 'Bildschirmzeit aktivieren',
          detail:
            'Einstellungen → Bildschirmzeit → Code festlegen. Tageslimits, App-Limits, Auszeit-Zeiten, Inhalts- und Datenschutzbeschränkungen einstellen.',
        },
        {
          title: 'Kaufgenehmigung',
          detail:
            'Familienfreigabe → "Kauf bitten" für das Kind aktivieren. Jeder App-Store-Kauf braucht dann eure Bestätigung am eigenen Gerät.',
        },
        {
          title: 'In-App-Käufe und Werbung',
          detail:
            'Bildschirmzeit → Beschränkungen → In-App-Käufe nicht zulassen. Plus: personalisierte Werbung im App-Store ausschalten.',
        },
      ];
    case 'android-tablet':
      return [
        {
          title: 'Google Family Link einrichten',
          detail:
            'Family Link auf eurem Telefon installieren, Kinder-Konto erstellen oder bestehendes Konto verknüpfen.',
        },
        {
          title: 'Bildschirmzeit + App-Genehmigungen',
          detail:
            'Tägliches Bildschirmzeit-Limit, Schlafenszeit, App-Liste pro Kind. Neue App-Installationen brauchen eure Zustimmung.',
        },
        {
          title: 'Käufe und Inhalte',
          detail:
            'Play Store-Käufe nur mit Eltern-Freigabe, Inhaltsfilter pro Alter, YouTube-Kids als Standard statt YouTube.',
        },
        {
          title: 'Standort und Sicherheit',
          detail:
            'Standortverlauf bewusst entscheiden (Schutz oder Tracking?), Web-Filter im Chrome aktivieren.',
        },
      ];
    case 'gaming-pc':
      return [
        {
          title: 'Microsoft Family für Windows',
          detail:
            'Wenn Windows: family.microsoft.com → Kinder-Konto anlegen → an PC anmelden. Bildschirmzeit + App-Limits gelten dann automatisch.',
        },
        {
          title: 'Steam Familienansicht',
          detail:
            'Falls Steam genutzt wird: Steam → Einstellungen → Familie → Familienansicht aktivieren. Nur freigegebene Spiele sichtbar.',
        },
        {
          title: 'Browser-Filter',
          detail:
            'In Chrome/Edge Kinder-Profil mit aktiviertem SafeSearch und Family-Link-Verknüpfung.',
        },
        {
          title: 'Discord, Steam Chat, Multiplayer',
          detail:
            'Stichwort Fremd-Kontakt: Sprachchat in Spielen pro Spiel deaktivieren, Discord-Account erst ab passendem Alter.',
        },
      ];
    case 'other':
    default:
      return [
        {
          title: 'Eltern-Konto und Kinder-Konto trennen',
          detail:
            'Auf jedem System gibt es eine Form von Familienverwaltung. Such die offizielle Anleitung des Herstellers.',
        },
        {
          title: 'Alters- und Inhaltsfreigaben',
          detail:
            'USK-Stufen oder vergleichbare Filter aktivieren, dann pro App nochmal anpassen.',
        },
        {
          title: 'Käufe sperren oder nur mit Freigabe',
          detail:
            'Default ist meist offen. Aktiv ändern auf "gesperrt" oder "nur mit Eltern".',
        },
      ];
  }
}
