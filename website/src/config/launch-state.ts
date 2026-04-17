export type LaunchState = 'waitlist' | 'live';

export const LAUNCH_STATE: LaunchState = 'waitlist';

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
