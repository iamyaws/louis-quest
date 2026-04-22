/**
 * Launch-state config.
 *
 * Central switch for how the website positions Ronki relative to its
 * availability. Changes here cascade through every CTA, hero, closing
 * block, footer micro-copy and relevant FAQ answer via `getLaunchCopy`.
 *
 * Lifecycle:
 *   waitlist      → pre-launch, email collection, no app access
 *   beta          → early-access gated by waitlist approval
 *   public-alpha  → app is publicly playable but messaging is honest
 *                    about early-days quality. Current state.
 *   live          → stable release, no alpha disclaimers
 *
 * When flipping state, no code changes are needed elsewhere as long as
 * consumers read from getLaunchCopy. Raw state comparisons should be
 * avoided — route by `ctaAction` instead (install vs. waitlist).
 */

export type LaunchState = 'waitlist' | 'beta' | 'public-alpha' | 'live';

export const LAUNCH_STATE: LaunchState = 'public-alpha';

export type LaunchCopy = {
  /** Primary button / CTA label. */
  ctaLabel: string;
  /**
   * Determines the CTA behaviour:
   * - 'install' → direct link to the app (no form).
   * - 'waitlist' → email collection form.
   */
  ctaAction: 'waitlist' | 'install';
  /** Short sub-copy shown under the CTA. */
  ctaHelper: string;
  /** Footer micro-copy used as the lead line above the CTA block. */
  footerMicro: string;
  /** Eyebrow shown above hero headlines. */
  heroEyebrow: string;
  /** Where the 'install' CTA should link. Only used when ctaAction === 'install'. */
  appUrl?: string;
};

const COPY: Record<LaunchState, LaunchCopy> = {
  waitlist: {
    ctaLabel: 'Bin dabei',
    ctaAction: 'waitlist',
    ctaHelper:
      'Wir öffnen Ronki in kleinen Gruppen. Trag dich ein, wir melden uns, wenn ihr dran seid.',
    footerMicro:
      'Ronki öffnet bald in kleinen Gruppen. Trag dich ein und sei früh dabei.',
    heroEyebrow: 'Bald offen · Frühzugang',
  },
  beta: {
    ctaLabel: 'Frühzugang anfordern',
    ctaAction: 'waitlist',
    ctaHelper:
      'Die frühe Version läuft bereits. Trag dich ein und sag uns, wo\u2019s bei euch klemmt. Wir melden uns meist innerhalb von 48 Stunden.',
    footerMicro: 'Ronki ist in der frühen Version. Trag dich ein für Frühzugang.',
    heroEyebrow: 'Beta offen · Frühzugang',
  },
  'public-alpha': {
    ctaLabel: 'Ronki ausprobieren',
    ctaAction: 'install',
    ctaHelper:
      'Frühe Version, läuft direkt im Browser. Kein Download, keine Anmeldung. Schreibt uns an hallo@ronki.de wenn was klemmt.',
    footerMicro:
      // Non-breaking hyphen (\u2011) between Public and Alpha so the browser
      // never breaks the phrase across lines, even at narrow column widths.
      'Ronki läuft in der Public\u2011Alpha. Direkt im Browser, kostenlos, ohne Anmeldung.',
    heroEyebrow: 'Public Alpha · jetzt spielbar',
    appUrl: 'https://app.ronki.de/',
  },
  live: {
    ctaLabel: 'Kostenlos testen',
    ctaAction: 'install',
    ctaHelper: 'Direkt im Browser. Kein App Store nötig.',
    footerMicro:
      'Ronki läuft direkt im Browser, installierbar auf Handy und Tablet.',
    heroEyebrow: 'Offen für alle · Kostenlos',
    appUrl: 'https://app.ronki.de/',
  },
};

export function getLaunchCopy(state: LaunchState = LAUNCH_STATE): LaunchCopy {
  return COPY[state];
}
