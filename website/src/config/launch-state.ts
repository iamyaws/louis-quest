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
    ctaHelper: 'Eine einzige E-Mail, am Start-Tag. Danach hörst du von uns nichts mehr.',
    footerMicro: 'Ronki startet bald. Trag dich ein und erfahre es unter den Ersten.',
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
