export type LaunchState = 'waitlist' | 'beta' | 'live';

export const LAUNCH_STATE: LaunchState = 'beta';

export type LaunchCopy = {
  ctaLabel: string;
  ctaAction: 'waitlist' | 'install';
  ctaHelper: string;
  footerMicro: string;
};

const COPY: Record<LaunchState, LaunchCopy> = {
  waitlist: {
    ctaLabel: 'Bin dabei',
    ctaAction: 'waitlist',
    ctaHelper: 'Wir öffnen Ronki in kleinen Gruppen. Trag dich ein, wir melden uns, wenn ihr dran seid.',
    footerMicro: 'Ronki öffnet bald in kleinen Gruppen. Trag dich ein und sei früh dabei.',
  },
  beta: {
    ctaLabel: 'Frühzugang anfordern',
    ctaAction: 'waitlist',
    ctaHelper: 'Die frühe Version läuft bereits. Trag dich ein und sag uns, wo\u2019s bei euch klemmt. Wir melden uns meist innerhalb von 48 Stunden.',
    footerMicro: 'Ronki ist in der frühen Version. Trag dich ein für Frühzugang.',
  },
  live: {
    ctaLabel: 'Kostenlos testen',
    ctaAction: 'install',
    ctaHelper: 'Direkt im Browser. Kein App Store nötig.',
    footerMicro: 'Ronki läuft direkt im Browser, installierbar auf Handy und Tablet.',
  },
};

export function getLaunchCopy(state: LaunchState = LAUNCH_STATE): LaunchCopy {
  return COPY[state];
}
